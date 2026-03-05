import { useState, useMemo, useCallback, useEffect } from "react";
import { getLocalOrders } from "../../../lib/local-orders";
import { getOrders } from "../../../lib/db-service";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat,
  UtensilsCrossed,
  Star,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Types ─── */

type ReportTab = "sales" | "items" | "staff" | "categories" | "payments";
type DateRange = "today" | "week" | "month" | "custom";

/* ─── Dynamic Data ─── */

export type DailyData = { date: string; revenue: number; orders: number; customers: number };
export type ItemPerformanceData = { name: string; nameKm: string; sold: number; revenue: number; avgRating: number; category: string };
export type StaffData = { name: string; nameKm: string; role: string; orders: number; revenue: number; avgOrder: number; hours: number };
export type CategoryData = { name: string; nameKm: string; revenue: number; orders: number; items: number; color: string };
export type PaymentData = { method: string; methodKm: string; transactions: number; total: number; percentage: number; color: string };

let dailySalesData: DailyData[] = [];
let itemPerformanceData: ItemPerformanceData[] = [];
let staffPerformanceData: StaffData[] = [];
let categoryBreakdownData: CategoryData[] = [];
let paymentMethodsData: PaymentData[] = [];

/* ─── Labels ─── */

const reportTabLabels: Record<ReportTab, { en: string; km: string }> = {
  sales: { en: "Sales Report", km: "របាយការណ៍លក់" },
  items: { en: "Item Performance", km: "លទ្ធផលមុខទំនិញ" },
  staff: { en: "Staff Performance", km: "លទ្ធផលបុគ្គលិក" },
  categories: { en: "Category Breakdown", km: "ការបែងចែកប្រភេទ" },
  payments: { en: "Payment Methods", km: "វិធីបង់ប្រាក់" },
};

const dateRangeLabels: Record<DateRange, { en: string; km: string }> = {
  today: { en: "Today", km: "ថ្ងៃនេះ" },
  week: { en: "This Week", km: "សប្ដាហ៍នេះ" },
  month: { en: "This Month", km: "ខែនេះ" },
  custom: { en: "Custom", km: "កំណត់ផ្ទាល់" },
};

/* ─── Export Utilities ─── */

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function generatePDF(
  title: string,
  dateRange: string,
  headers: string[],
  rows: (string | number)[][],
  summaryLines: string[]
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(34, 197, 94);
  doc.text("POS Batto", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("Restaurant POS Report", 14, 24);

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(title, 14, 36);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Period: ${dateRange}`, 14, 42);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 47);

  if (summaryLines.length > 0) {
    let y = 55;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    summaryLines.forEach((line) => {
      doc.text(line, 14, y);
      y += 6;
    });
  }

  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map(String)),
    startY: 55 + summaryLines.length * 6 + 4,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

/* ─── Main Component ─── */

export function AdminReports() {
  const { lang, fontClass } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeReport, setActiveReport] = useState<ReportTab>("sales");
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [sortField, setSortField] = useState<string>("sold");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [, setTrigger] = useState(0);

  useEffect(() => {
    async function loadAllOrders() {
      // Use only local orders - real POS data starting from zero
      const orders = getLocalOrders(1000);

      // Process dailySalesData
      const dMap: Record<string, DailyData> = {};
      const iMap: Record<string, ItemPerformanceData> = {};
      const pMap: Record<string, PaymentData> = {};

      let totalSysRevenue = 0;

      orders.forEach((o: any) => {
        const day = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dMap[day]) dMap[day] = { date: day, revenue: 0, orders: 0, customers: 0 };
        dMap[day].revenue += o.total;
        dMap[day].orders += 1;
        if (o.customer_name) dMap[day].customers += 1;

        // Items
        o.items.forEach(itm => {
          if (!iMap[itm.name]) iMap[itm.name] = { name: itm.name, nameKm: itm.name, sold: 0, revenue: 0, avgRating: 5, category: "Menu" };
          iMap[itm.name].sold += itm.qty;
          iMap[itm.name].revenue += itm.qty * itm.price;
        });

        // Payments
        const payMethod = o.payment_method || "cash";
        if (!pMap[payMethod]) pMap[payMethod] = { method: payMethod, methodKm: payMethod, transactions: 0, total: 0, percentage: 0, color: "#3B82F6" };
        pMap[payMethod].transactions += 1;
        pMap[payMethod].total += o.total;

        totalSysRevenue += o.total;
      });

      dailySalesData = Object.values(dMap).slice(-10);
      itemPerformanceData = Object.values(iMap).sort((a, b) => b.sold - a.sold);
      paymentMethodsData = Object.values(pMap).map(p => ({ ...p, percentage: totalSysRevenue ? Math.round((p.total / totalSysRevenue) * 100) : 0 }));

      setTrigger(t => t + 1);
    }

    loadAllOrders();
  }, []);

  const l = useCallback((en: string, km: string) => (lang === "km" ? km : en), [lang]);

  const dateLabel = lang === "km" ? dateRangeLabels[dateRange].km : dateRangeLabels[dateRange].en;

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIndicator = ({ field }: { field: string }) => (
    <span className="text-gray-300 ml-0.5" style={{ fontSize: "10px" }}>
      {sortField === field ? (sortDir === "desc" ? "▼" : "▲") : "⇅"}
    </span>
  );

  /* ─── Sales Report ─── */
  const salesSummary = useMemo(() => {
    const totalRevenue = dailySalesData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = dailySalesData.reduce((s, d) => s + d.orders, 0);
    const totalCustomers = dailySalesData.reduce((s, d) => s + d.customers, 0);
    return { totalRevenue, totalOrders, totalCustomers, avgOrder: totalRevenue / totalOrders };
  }, []);

  const exportSalesCSV = () => {
    downloadCSV(
      "Sales_Report",
      ["Date", "Revenue ($)", "Orders", "Customers"],
      dailySalesData.map((d) => [d.date, d.revenue, d.orders, d.customers])
    );
  };

  const exportSalesPDF = () => {
    generatePDF(
      "Sales Report",
      dateLabel,
      ["Date", "Revenue ($)", "Orders", "Customers"],
      dailySalesData.map((d) => [d.date, d.revenue, d.orders, d.customers]),
      [
        `Total Revenue: $${salesSummary.totalRevenue.toFixed(2)}`,
        `Total Orders: ${salesSummary.totalOrders}`,
        `Total Customers: ${salesSummary.totalCustomers}`,
        `Average Order: $${salesSummary.avgOrder.toFixed(2)}`,
      ]
    );
  };

  /* ─── Item Performance ─── */
  const sortedItems = useMemo(() => {
    return [...itemPerformanceData].sort((a, b) => {
      const aVal = a[sortField as keyof typeof a] ?? 0;
      const bVal = b[sortField as keyof typeof b] ?? 0;
      return sortDir === "desc"
        ? (bVal as number) - (aVal as number)
        : (aVal as number) - (bVal as number);
    });
  }, [sortField, sortDir]);

  const exportItemsCSV = () => {
    downloadCSV(
      "Item_Performance",
      ["Rank", "Item", "Category", "Sold", "Revenue ($)", "Avg Rating"],
      sortedItems.map((item, i) => [i + 1, item.name, item.category, item.sold, item.revenue, item.avgRating])
    );
  };

  const exportItemsPDF = () => {
    const totalSold = itemPerformanceData.reduce((s, i) => s + i.sold, 0);
    const totalRev = itemPerformanceData.reduce((s, i) => s + i.revenue, 0);
    generatePDF(
      "Item Performance Report",
      dateLabel,
      ["Rank", "Item", "Category", "Sold", "Revenue ($)", "Rating"],
      sortedItems.map((item, i) => [i + 1, item.name, item.category, item.sold, item.revenue, item.avgRating]),
      [`Total Items Sold: ${totalSold}`, `Total Revenue: $${totalRev.toFixed(2)}`]
    );
  };

  /* ─── Staff Performance ─── */
  const exportStaffCSV = () => {
    downloadCSV(
      "Staff_Performance",
      ["Staff", "Role", "Orders", "Revenue ($)", "Avg Order ($)", "Hours"],
      staffPerformanceData.map((s) => [s.name, s.role, s.orders, s.revenue, s.avgOrder, s.hours])
    );
  };

  const exportStaffPDF = () => {
    generatePDF(
      "Staff Performance Report",
      dateLabel,
      ["Staff", "Role", "Orders", "Revenue ($)", "Avg Order ($)", "Hours"],
      staffPerformanceData.map((s) => [s.name, s.role, s.orders, s.revenue, s.avgOrder, s.hours]),
      [
        `Total Staff: ${staffPerformanceData.length}`,
        `Total Orders: ${staffPerformanceData.reduce((s, x) => s + x.orders, 0)}`,
        `Total Revenue: $${staffPerformanceData.reduce((s, x) => s + x.revenue, 0).toFixed(2)}`,
      ]
    );
  };

  /* ─── Category Breakdown ─── */
  const totalCategoryRevenue = categoryBreakdownData.reduce((s, c) => s + c.revenue, 0);

  const exportCategoriesCSV = () => {
    downloadCSV(
      "Category_Breakdown",
      ["Category", "Revenue ($)", "Orders", "Items", "Share (%)"],
      categoryBreakdownData.map((c) => [
        c.name,
        c.revenue,
        c.orders,
        c.items,
        ((c.revenue / totalCategoryRevenue) * 100).toFixed(1),
      ])
    );
  };

  const exportCategoriesPDF = () => {
    generatePDF(
      "Category Breakdown Report",
      dateLabel,
      ["Category", "Revenue ($)", "Orders", "Items", "Share (%)"],
      categoryBreakdownData.map((c) => [
        c.name,
        c.revenue,
        c.orders,
        c.items,
        ((c.revenue / totalCategoryRevenue) * 100).toFixed(1),
      ]),
      [`Total Revenue: $${totalCategoryRevenue.toFixed(2)}`, `Categories: ${categoryBreakdownData.length}`]
    );
  };

  /* ─── Payment Methods ─── */
  const totalPaymentAmount = paymentMethodsData.reduce((s, p) => s + p.total, 0);

  const exportPaymentsCSV = () => {
    downloadCSV(
      "Payment_Methods",
      ["Method", "Transactions", "Total ($)", "Share (%)"],
      paymentMethodsData.map((p) => [p.method, p.transactions, p.total, p.percentage])
    );
  };

  const exportPaymentsPDF = () => {
    generatePDF(
      "Payment Methods Report",
      dateLabel,
      ["Method", "Transactions", "Total ($)", "Share (%)"],
      paymentMethodsData.map((p) => [p.method, p.transactions, p.total, p.percentage]),
      [
        `Total Transactions: ${paymentMethodsData.reduce((s, p) => s + p.transactions, 0)}`,
        `Total Amount: $${totalPaymentAmount.toFixed(2)}`,
      ]
    );
  };

  /* ─── Export dispatcher ─── */
  const handleExport = (format: "pdf" | "csv") => {
    const exportMap: Record<ReportTab, { pdf: () => void; csv: () => void }> = {
      sales: { pdf: exportSalesPDF, csv: exportSalesCSV },
      items: { pdf: exportItemsPDF, csv: exportItemsCSV },
      staff: { pdf: exportStaffPDF, csv: exportStaffCSV },
      categories: { pdf: exportCategoriesPDF, csv: exportCategoriesCSV },
      payments: { pdf: exportPaymentsPDF, csv: exportPaymentsCSV },
    };
    exportMap[activeReport][format]();
  };

  /* ─── Render ─── */
  return (
    <div className={`p-6 space-y-5 ${fontClass}`}>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Report sub-tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
          {(Object.keys(reportTabLabels) as ReportTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveReport(tab)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${activeReport === tab
                ? "bg-[#22C55E] text-white shadow-md shadow-green-200 dark:shadow-green-900"
                : "bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-[#22C55E] hover:text-[#22C55E]"
                }`}
              style={{ fontSize: "12px", fontWeight: activeReport === tab ? 600 : 500 }}
            >
              {lang === "km" ? reportTabLabels[tab].km : reportTabLabels[tab].en}
            </button>
          ))}
        </div>

        {/* Date range + Export */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(Object.keys(dateRangeLabels) as DateRange[]).map((dr) => (
              <button
                key={dr}
                onClick={() => setDateRange(dr)}
                className={`px-2.5 py-1.5 rounded-md transition-all ${dateRange === dr
                  ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
                  : "text-gray-500"
                  }`}
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                <Calendar size={10} className="inline mr-1" />
                {lang === "km" ? dateRangeLabels[dr].km : dateRangeLabels[dr].en}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              style={{ fontSize: "11px", fontWeight: 600 }}
              title="Export PDF"
            >
              <FileText size={13} />
              PDF
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
              style={{ fontSize: "11px", fontWeight: 600 }}
              title="Export CSV"
            >
              <FileSpreadsheet size={13} />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report content */}
      {activeReport === "sales" && (
        <SalesReportView data={dailySalesData} summary={salesSummary} l={l} formatPrice={formatPrice} />
      )}
      {activeReport === "items" && (
        <ItemPerformanceView
          items={sortedItems}
          l={l}
          formatPrice={formatPrice}
          lang={lang}
          toggleSort={toggleSort}
          SortIndicator={SortIndicator}
        />
      )}
      {activeReport === "staff" && (
        <StaffPerformanceView data={staffPerformanceData} l={l} formatPrice={formatPrice} lang={lang} />
      )}
      {activeReport === "categories" && (
        <CategoryBreakdownView data={categoryBreakdownData} total={totalCategoryRevenue} l={l} formatPrice={formatPrice} lang={lang} />
      )}
      {activeReport === "payments" && (
        <PaymentMethodsView data={paymentMethodsData} total={totalPaymentAmount} l={l} formatPrice={formatPrice} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sub-views
   ═══════════════════════════════════════════════════════════════ */

interface LFn {
  (en: string, km: string): string;
}

/* ─── 1. Sales Report ─── */

function SalesReportView({
  data,
  summary,
  l,
  formatPrice,
}: {
  data: typeof dailySalesData;
  summary: { totalRevenue: number; totalOrders: number; totalCustomers: number; avgOrder: number };
  l: LFn;
  formatPrice: (n: number) => string;
}) {
  const stats = [
    { label: l("Total Revenue", "ចំណូលសរុប"), value: formatPrice(summary.totalRevenue), icon: <DollarSign size={18} />, color: "#22C55E", change: "0%" },
    { label: l("Total Orders", "បញ្ជាសរុប"), value: summary.totalOrders.toString(), icon: <ShoppingBag size={18} />, color: "#3B82F6", change: "0%" },
    { label: l("Customers", "អតិថិជន"), value: summary.totalCustomers.toString(), icon: <Users size={18} />, color: "#A855F7", change: "0%" },
    { label: l("Avg Order", "មធ្យមបញ្ជា"), value: formatPrice(summary.avgOrder), icon: <TrendingUp size={18} />, color: "#F59E0B", change: "0%" },
  ];

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}12`, color: s.color }}>
                {s.icon}
              </div>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600" style={{ fontSize: "10px", fontWeight: 600 }}>
                <ArrowUpRight size={10} />
                {s.change}
              </span>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
          {l("Revenue Trend", "និន្នាការចំណូល")}
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4, fill: "#22C55E" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders & Customers chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
          {l("Orders & Customers", "បញ្ជា & អតិថិជន")}
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Orders" />
            <Bar dataKey="customers" fill="#A855F7" radius={[6, 6, 0, 0]} name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {[l("Date", "កាលបរិច្ឆេទ"), l("Revenue", "ចំណូល"), l("Orders", "បញ្ជា"), l("Customers", "អតិថិជន"), l("Avg Order", "មធ្យម")].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>{d.date}</td>
                <td className="px-5 py-3 text-[#22C55E]" style={{ fontSize: "13px", fontWeight: 700 }}>{formatPrice(d.revenue)}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>{d.orders}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>{d.customers}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>{formatPrice(d.revenue / d.orders)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── 2. Item Performance ─── */

function ItemPerformanceView({
  items,
  l,
  formatPrice,
  lang,
  toggleSort,
  SortIndicator,
}: {
  items: typeof itemPerformanceData;
  l: LFn;
  formatPrice: (n: number) => string;
  lang: string;
  toggleSort: (f: string) => void;
  SortIndicator: React.FC<{ field: string }>;
}) {
  const top10 = items.slice(0, 10);
  const totalSold = items.reduce((s, i) => s + i.sold, 0);
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Items Sold", "សរុបលក់")}</p>
          <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>{totalSold.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Revenue", "ចំណូលសរុប")}</p>
          <p className="text-[#22C55E]" style={{ fontSize: "22px", fontWeight: 700 }}>{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-green-500" />
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Best Seller", "លក់ដាច់បំផុត")}</p>
          </div>
          <p className="text-gray-900 dark:text-white mt-1" style={{ fontSize: "15px", fontWeight: 600 }}>{items[0]?.name}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-red-500" />
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Least Sold", "លក់តិចបំផុត")}</p>
          </div>
          <p className="text-gray-900 dark:text-white mt-1" style={{ fontSize: "15px", fontWeight: 600 }}>{items[items.length - 1]?.name}</p>
        </div>
      </div>

      {/* Top 10 chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
          <UtensilsCrossed size={14} className="inline mr-1.5 text-[#22C55E]" />
          {l("Top 10 Items by Quantity Sold", "មុខទំនិញ ១០ លក់ដាច់បំផុត")}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip formatter={(value: number) => [value, "Sold"]} />
            <Bar dataKey="sold" fill="#22C55E" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-5 py-3 text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>#</th>
              <th className="text-left px-5 py-3 text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>{l("Item", "មុខទំនិញ")}</th>
              <th className="text-left px-5 py-3 text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>{l("Category", "ប្រភេទ")}</th>
              <th className="text-left px-5 py-3 text-gray-400 cursor-pointer select-none" style={{ fontSize: "11px", fontWeight: 600 }} onClick={() => toggleSort("sold")}>
                {l("Sold", "បានលក់")} <SortIndicator field="sold" />
              </th>
              <th className="text-left px-5 py-3 text-gray-400 cursor-pointer select-none" style={{ fontSize: "11px", fontWeight: 600 }} onClick={() => toggleSort("revenue")}>
                {l("Revenue", "ចំណូល")} <SortIndicator field="revenue" />
              </th>
              <th className="text-left px-5 py-3 text-gray-400 cursor-pointer select-none" style={{ fontSize: "11px", fontWeight: 600 }} onClick={() => toggleSort("avgRating")}>
                {l("Rating", "វាយតម្លៃ")} <SortIndicator field="avgRating" />
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.name} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="px-5 py-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-gray-200 dark:bg-gray-700 !text-gray-500"}`} style={{ fontSize: "10px", fontWeight: 700 }}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>{lang === "km" ? item.nameKm : item.name}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? item.name : item.nameKm}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500" style={{ fontSize: "11px" }}>{item.category}</span>
                </td>
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 600 }}>{item.sold}</td>
                <td className="px-5 py-3 text-[#22C55E]" style={{ fontSize: "13px", fontWeight: 700 }}>{formatPrice(item.revenue)}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-0.5 text-gray-600 dark:text-gray-400" style={{ fontSize: "12px" }}>
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    {item.avgRating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── 3. Staff Performance ─── */

function StaffPerformanceView({
  data,
  l,
  formatPrice,
  lang,
}: {
  data: typeof staffPerformanceData;
  l: LFn;
  formatPrice: (n: number) => string;
  lang: string;
}) {
  const roleIcons: Record<string, React.ReactNode> = {
    manager: <ChefHat size={12} />,
    cashier: <DollarSign size={12} />,
    chef: <UtensilsCrossed size={12} />,
    waiter: <Users size={12} />,
  };

  return (
    <>
      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
          {l("Revenue by Staff Member", "ចំណូលតាមបុគ្គលិក")}
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.map((s) => (
          <div key={s.name} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                {roleIcons[s.role]}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                  {lang === "km" ? s.nameKm : s.name}
                </p>
                <p className="text-gray-400 capitalize" style={{ fontSize: "11px" }}>{s.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Orders", "បញ្ជា")}</p>
                <p className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{s.orders}</p>
              </div>
              <div>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Revenue", "ចំណូល")}</p>
                <p className="text-[#22C55E]" style={{ fontSize: "18px", fontWeight: 700 }}>{formatPrice(s.revenue)}</p>
              </div>
              <div>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Avg Order", "មធ្យម")}</p>
                <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "14px", fontWeight: 600 }}>{formatPrice(s.avgOrder)}</p>
              </div>
              <div>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Hours", "ម៉ោង")}</p>
                <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "14px", fontWeight: 600 }}>{s.hours}h</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── 4. Category Breakdown ─── */

function CategoryBreakdownView({
  data,
  total,
  l,
  formatPrice,
  lang,
}: {
  data: typeof categoryBreakdownData;
  total: number;
  l: LFn;
  formatPrice: (n: number) => string;
  lang: string;
}) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pie chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-900 dark:text-white mb-3" style={{ fontSize: "15px", fontWeight: 600 }}>
            {l("Revenue Share", "ចំណែកចំណូល")}
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="revenue" paddingAngle={3} nameKey="name">
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatPrice(value), "Revenue"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-gray-600 dark:text-gray-400 flex-1" style={{ fontSize: "12px" }}>
                  {lang === "km" ? c.nameKm : c.name}
                </span>
                <span className="text-gray-800 dark:text-gray-200" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {((c.revenue / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-900 dark:text-white mb-3" style={{ fontSize: "15px", fontWeight: 600 }}>
            {l("Revenue by Category", "ចំណូលតាមប្រភេទ")}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey={lang === "km" ? "nameKm" : "name"} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value: number) => [formatPrice(value), "Revenue"]} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {[l("Category", "ប្រភេទ"), l("Revenue", "ចំណូល"), l("Orders", "បញ្ជា"), l("Menu Items", "មុខទំនិញ"), l("Share", "ចំណែក")].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.name} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>
                      {lang === "km" ? c.nameKm : c.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#22C55E]" style={{ fontSize: "13px", fontWeight: 700 }}>{formatPrice(c.revenue)}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>{c.orders}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>{c.items}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.revenue / total) * 100}%`, backgroundColor: c.color }} />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 shrink-0" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {((c.revenue / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── 5. Payment Methods ─── */

function PaymentMethodsView({
  data,
  total,
  l,
  formatPrice,
}: {
  data: typeof paymentMethodsData;
  total: number;
  l: LFn;
  formatPrice: (n: number) => string;
}) {
  const methodIcons: Record<string, React.ReactNode> = {
    Cash: <Banknote size={20} />,
    Card: <CreditCard size={20} />,
    KHQR: <QrCode size={20} />,
    "ABA Pay": <DollarSign size={20} />,
  };

  const totalTransactions = data.reduce((s, p) => s + p.transactions, 0);

  return (
    <>
      {/* Method cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((p) => (
          <div key={p.method} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}12`, color: p.color }}>
                {methodIcons[p.method]}
              </div>
              <span className="px-2 py-0.5 rounded-lg" style={{ fontSize: "12px", fontWeight: 700, backgroundColor: `${p.color}15`, color: p.color }}>
                {p.percentage}%
              </span>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>{p.method}</p>
            <p className="text-[#22C55E] mt-1" style={{ fontSize: "20px", fontWeight: 700 }}>{formatPrice(p.total)}</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{p.transactions} {l("transactions", "ប្រតិបត្តិការ")}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pie chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-900 dark:text-white mb-3" style={{ fontSize: "15px", fontWeight: 600 }}>
            {l("Payment Distribution", "ការបែងចែកការបង់ប្រាក់")}
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="total" paddingAngle={3} nameKey="method">
                {data.map((entry) => (
                  <Cell key={entry.method} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatPrice(value), "Total"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {data.map((p) => (
              <div key={p.method} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-gray-600 dark:text-gray-400 flex-1" style={{ fontSize: "12px" }}>{p.method}</span>
                <span className="text-gray-800 dark:text-gray-200" style={{ fontSize: "12px", fontWeight: 600 }}>{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
            {l("Summary", "សង្ខេប")}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Transactions", "ប្រតិបត្តិការសរុប")}</p>
              <p className="text-gray-900 dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>{totalTransactions}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Amount", "ទឹកប្រាក់សរុប")}</p>
              <p className="text-[#22C55E]" style={{ fontSize: "24px", fontWeight: 700 }}>{formatPrice(total)}</p>
            </div>
          </div>

          {/* Horizontal bars */}
          <div className="space-y-3">
            {data.map((p) => (
              <div key={p.method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "12px", fontWeight: 500 }}>{p.method}</span>
                  <span className="text-gray-500" style={{ fontSize: "12px" }}>
                    {formatPrice(p.total)} ({p.transactions} txn)
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.percentage}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
