import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  UtensilsCrossed,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CreditCard,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getDashboardStats, getOrders } from "../../../lib/db-service";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { getLocalOrders, getLocalDashboardStats } from "../../../lib/local-orders";

interface PaidOrderRow {
  id: number;
  order_number: string;
  total: number;
  payment_method: string | null;
  created_at: string;
}

interface DashboardData {
  todayRevenue: number;
  todayOrders: number;
  totalCustomers: number;
  avgOrder: number;
  weeklyRevenue: { day: string; revenue: number; orders: number }[];
  hourlyOrders: { hour: string; orders: number }[];
  topItems: { name: string; sold: number; revenue: number }[];
  recentActivity: { action: string; detail: string; time: string; type: string }[];
  paidPayments: PaidOrderRow[];
  cancelledOrders: PaidOrderRow[];
}

const defaultData: DashboardData = {
  todayRevenue: 0,
  todayOrders: 0,
  totalCustomers: 0,
  avgOrder: 0,
  weeklyRevenue: [
    { day: "Mon", revenue: 0, orders: 0 },
    { day: "Tue", revenue: 0, orders: 0 },
    { day: "Wed", revenue: 0, orders: 0 },
    { day: "Thu", revenue: 0, orders: 0 },
    { day: "Fri", revenue: 0, orders: 0 },
    { day: "Sat", revenue: 0, orders: 0 },
    { day: "Sun", revenue: 0, orders: 0 },
  ],
  hourlyOrders: [
    { hour: "8AM", orders: 0 }, { hour: "9AM", orders: 0 }, { hour: "10AM", orders: 0 },
    { hour: "11AM", orders: 0 }, { hour: "12PM", orders: 0 }, { hour: "1PM", orders: 0 },
    { hour: "2PM", orders: 0 }, { hour: "3PM", orders: 0 }, { hour: "4PM", orders: 0 },
    { hour: "5PM", orders: 0 }, { hour: "6PM", orders: 0 }, { hour: "7PM", orders: 0 },
    { hour: "8PM", orders: 0 }, { hour: "9PM", orders: 0 },
  ],
  topItems: [],
  recentActivity: [],
  paidPayments: [],
  cancelledOrders: [],
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hourLabels = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AdminDashboard() {
  const { lang, fontClass } = useTranslation();
  const { formatPrice } = useCurrency();
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Use only local orders - starts from zero with real POS data
        const localStats = getLocalDashboardStats();
        const localOrders = getLocalOrders(200);

        const statsResult = localStats;
        const recentOrders = localOrders;

        const todayRevenue = statsResult?.todayRevenue ?? 0;
        const todayOrders = statsResult?.todayOrders ?? 0;
        const totalCustomers = statsResult?.totalCustomers ?? 0;
        const avgOrder = todayOrders > 0 ? todayRevenue / todayOrders : 0;

        // Build weekly revenue from orders (last 7 days)
        const weeklyMap: Record<string, { revenue: number; orders: number }> = {};
        dayNames.forEach((d) => { weeklyMap[d] = { revenue: 0, orders: 0 }; });
        const now = new Date();
        recentOrders.forEach((order) => {
          const orderDate = new Date(order.created_at);
          const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / 86400000);
          if (daysDiff < 7) {
            const dayName = dayNames[orderDate.getDay()];
            weeklyMap[dayName].revenue += Number(order.total);
            weeklyMap[dayName].orders += 1;
          }
        });
        const weeklyRevenue = dayNames.slice(1).concat(dayNames[0]).map((day) => ({
          day,
          revenue: Math.round(weeklyMap[day].revenue * 100) / 100,
          orders: weeklyMap[day].orders,
        }));

        // Build hourly orders for today
        const hourlyMap: Record<string, number> = {};
        hourLabels.forEach((h) => { hourlyMap[h] = 0; });
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        recentOrders.forEach((order) => {
          const orderDate = new Date(order.created_at);
          if (orderDate >= todayStart) {
            const hr = orderDate.getHours();
            if (hr >= 8 && hr <= 21) {
              const idx = hr - 8;
              if (idx < hourLabels.length) {
                hourlyMap[hourLabels[idx]] += 1;
              }
            }
          }
        });
        const hourlyOrders = hourLabels.map((hour) => ({ hour, orders: hourlyMap[hour] }));

        // Build top selling items from recent orders
        const itemMap: Record<string, { sold: number; revenue: number }> = {};
        recentOrders.forEach((order) => {
          const items = order.items as unknown as { name: string; price: number; qty: number }[];
          if (Array.isArray(items)) {
            items.forEach((item) => {
              if (!itemMap[item.name]) itemMap[item.name] = { sold: 0, revenue: 0 };
              itemMap[item.name].sold += item.qty || 1;
              itemMap[item.name].revenue += (item.price || 0) * (item.qty || 1);
            });
          }
        });
        const topItems = Object.entries(itemMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);

        // Build recent activity from recent orders
        const recentActivity = recentOrders.slice(0, 6).map((order) => ({
          action: `${lang === "km" ? "បញ្ជាថ្មី" : "New order"} #${order.order_number}`,
          detail: `${formatPrice(Number(order.total))} - ${order.payment_method ?? "cash"}`,
          time: timeAgo(order.created_at),
          type: "order",
        }));

        // Paid payments: orders with status "served" (completed payment)
        const paidPayments: PaidOrderRow[] = recentOrders
          .filter((o) => o.status === "served")
          .slice(0, 50)
          .map((o) => ({
            id: o.id,
            order_number: o.order_number,
            total: Number(o.total),
            payment_method: o.payment_method ?? null,
            created_at: o.created_at,
          }));

        // Cancelled orders
        const cancelledOrders: PaidOrderRow[] = recentOrders
          .filter((o) => o.status === "cancelled")
          .slice(0, 50)
          .map((o) => ({
            id: o.id,
            order_number: o.order_number,
            total: Number(o.total),
            payment_method: o.payment_method ?? null,
            created_at: o.created_at,
          }));

        setData({
          todayRevenue,
          todayOrders,
          totalCustomers,
          avgOrder,
          weeklyRevenue,
          hourlyOrders,
          topItems,
          recentActivity,
          paidPayments,
          cancelledOrders,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [formatPrice, lang]);

  const stats = [
    {
      label: lang === "km" ? "ចំណូលថ្ងៃនេះ" : "Today's Revenue",
      value: formatPrice(data.todayRevenue),
      change: data.todayOrders > 0 ? `${data.todayOrders} orders` : "0%",
      up: true,
      icon: <DollarSign size={20} />,
      color: "#22C55E",
    },
    {
      label: lang === "km" ? "ការបញ្ជា" : "Orders Today",
      value: String(data.todayOrders),
      change: data.todayOrders > 0 ? "Active" : "0%",
      up: data.todayOrders > 0,
      icon: <ShoppingBag size={20} />,
      color: "#3B82F6",
    },
    {
      label: lang === "km" ? "អតិថិជន" : "Customers",
      value: String(data.totalCustomers),
      change: "0%",
      up: true,
      icon: <Users size={20} />,
      color: "#A855F7",
    },
    {
      label: lang === "km" ? "មធ្យមបញ្ជា" : "Avg Order",
      value: formatPrice(data.avgOrder),
      change: data.avgOrder > 0 ? "Active" : "0%",
      up: data.avgOrder > 0,
      icon: <TrendingUp size={20} />,
      color: "#F59E0B",
    },
  ];

  if (loading) {
    return (
      <div className={`p-6 flex items-center justify-center min-h-[400px] ${fontClass}`}>
        <div className="text-center">
          <Loader2 size={32} className="text-[#22C55E] animate-spin mx-auto mb-3" />
          <p className="text-gray-400" style={{ fontSize: "13px" }}>
            {lang === "km" ? "កំពុងផ្ទុកទិន្នន័យ..." : "Loading dashboard data..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${fontClass}`}>
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}12`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div
                className={`flex items-center gap-0.5 px-2 py-1 rounded-lg ${stat.up
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                  : "bg-red-50 dark:bg-red-900/20 text-red-500"
                  }`}
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly revenue */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              {lang === "km" ? "ចំណូលប្រចាំសប្ដាហ៍" : "Weekly Revenue"}
            </p>
            <span className="text-gray-400" style={{ fontSize: "12px" }}>
              {lang === "km" ? "៧ថ្ងៃចុងក្រោយ" : "Last 7 days"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#22C55E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              <Clock size={14} className="inline mr-1.5 text-[#22C55E]" />
              {lang === "km" ? "ម៉ោងកំពូល" : "Peak Hours"}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.hourlyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top selling items */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed size={16} className="text-[#22C55E]" />
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              {lang === "km" ? "មុខទំនិញលក់ដាច់បំផុត" : "Top Selling Items"}
            </p>
          </div>
          <div className="space-y-3">
            {data.topItems.length === 0 ? (
              <p className="text-gray-400 text-center py-6" style={{ fontSize: "13px" }}>
                {lang === "km" ? "មិនទាន់មានទិន្នន័យនៅឡើយទេ" : "No sales data yet"}
              </p>
            ) : data.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${i === 0
                    ? "bg-yellow-400"
                    : i === 1
                      ? "bg-gray-400"
                      : i === 2
                        ? "bg-amber-600"
                        : "bg-gray-200 dark:bg-gray-700 !text-gray-500"
                    }`}
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  {i + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 flex-1" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {item.name}
                </span>
                <span className="text-gray-400" style={{ fontSize: "12px" }}>
                  {item.sold} {lang === "km" ? "ខ្នាត" : "sold"}
                </span>
                <span className="text-[#22C55E]" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {formatPrice(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>
            {lang === "km" ? "សកម្មភាពថ្មីៗ" : "Recent Activity"}
          </p>
          <div className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-6" style={{ fontSize: "13px" }}>
                {lang === "km" ? "មិនទាន់មានសកម្មភាពនៅឡើយទេ" : "No activity yet"}
              </p>
            ) : data.recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === "order"
                    ? "bg-blue-400"
                    : a.type === "payment"
                      ? "bg-green-400"
                      : a.type === "staff"
                        ? "bg-purple-400"
                        : a.type === "menu"
                          ? "bg-yellow-400"
                          : "bg-gray-400"
                    }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {a.action}
                  </p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "12px" }}>
                    {a.detail}
                  </p>
                </div>
                <span className="text-gray-400 shrink-0" style={{ fontSize: "11px" }}>
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paid Payments – show data to admin when payment is completed */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#22C55E12", color: "#22C55E" }}>
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
              {lang === "km" ? "ការទូទាត់រួចរាល់" : "Paid Payments"}
            </p>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>
              {lang === "km" ? "បញ្ជីប្រតិបត្តិការបង់ប្រាក់ដែលបានទូទាត់" : "Completed payment transactions visible to admin"}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {data.paidPayments.length === 0 ? (
            <p className="text-gray-400 text-center py-8" style={{ fontSize: "13px" }}>
              {lang === "km" ? "មិនទាន់មានការទូទាត់រួចរាល់នៅឡើយទេ" : "No paid payments yet"}
            </p>
          ) : (
            <table className="w-full" style={{ fontSize: "13px" }}>
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ល.រ" : "#"}</th>
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "លេខបញ្ជា" : "Order"}</th>
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ចំនួន" : "Amount"}</th>
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "វិធីបង់" : "Method"}</th>
                  <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ថ្ងៃធ្វើ" : "Date"}</th>
                </tr>
              </thead>
              <tbody>
                {data.paidPayments.map((pay, idx) => (
                  <tr key={pay.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-3 pr-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <span className="text-gray-900 dark:text-white font-medium">{pay.order_number}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[#22C55E] font-semibold">{formatPrice(pay.total)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                        <CheckCircle size={12} className="text-[#22C55E]" />
                        {pay.payment_method || "cash"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {new Date(pay.created_at).toLocaleString(lang === "km" ? "km-KH" : "en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Cancelled Orders – visible to admin */}
      {data.cancelledOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EF444415", color: "#EF4444" }}>
              <Ban size={20} />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                {lang === "km" ? "បញ្ជាដែលបានបោះបង់" : "Cancelled Orders"}
              </p>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>
                {lang === "km" ? "បញ្ជីបញ្ជាដែលបុគ្គលិកបានបោះបង់" : "Orders voided by staff"}
              </p>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg" style={{ fontSize: "12px", fontWeight: 600 }}>
              {data.cancelledOrders.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "13px" }}>
              <thead>
                <tr className="text-left border-b border-red-100 dark:border-red-900/30">
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ល.រ" : "#"}</th>
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "លេខបញ្ជា" : "Order"}</th>
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ចំនួន" : "Amount"}</th>
                  <th className="pb-3 pr-4 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ស្ថានភាព" : "Status"}</th>
                  <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">{lang === "km" ? "ថ្ងៃធ្វើ" : "Date"}</th>
                </tr>
              </thead>
              <tbody>
                {data.cancelledOrders.map((co, idx) => (
                  <tr key={co.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-red-50/30 dark:hover:bg-red-900/10">
                    <td className="py-3 pr-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <span className="text-gray-900 dark:text-white font-medium">{co.order_number}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-red-500 font-semibold line-through">{formatPrice(co.total)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <XCircle size={12} />
                        {lang === "km" ? "បោះបង់" : "Cancelled"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {new Date(co.created_at).toLocaleString(lang === "km" ? "km-KH" : "en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
