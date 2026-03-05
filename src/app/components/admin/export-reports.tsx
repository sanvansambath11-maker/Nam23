import { useState } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
    FileDown,
    FileText,
    Table2,
    Calendar,
    Download,
    Filter,
    Check,
    ChevronDown,
    Printer,
    Mail,
    BarChart3,
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    Clock,
    FileSpreadsheet,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type ReportType = "sales" | "inventory" | "staff" | "customers" | "orders" | "financial";
type ExportFormat = "pdf" | "excel" | "csv";
type DateRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

interface ReportConfig {
    type: ReportType;
    label: { en: string; km: string };
    icon: React.ReactNode;
    color: string;
    description: { en: string; km: string };
    fields: string[];
}

const reportConfigs: ReportConfig[] = [
    {
        type: "sales",
        label: { en: "Sales Report", km: "របាយការណ៍លក់" },
        icon: <DollarSign size={20} />,
        color: "#22C55E",
        description: { en: "Complete sales data with item breakdown, revenue, and trends", km: "ទិន្នន័យលក់ពេញលេញជាមួយការបែងចែកមុខទំនិញ" },
        fields: ["Date", "Order #", "Items", "Subtotal", "VAT", "Discount", "Total", "Payment Method", "Staff"],
    },
    {
        type: "inventory",
        label: { en: "Inventory Report", km: "របាយការណ៍សារពើភ័ណ្ឌ" },
        icon: <Package size={20} />,
        color: "#3B82F6",
        description: { en: "Stock levels, usage rates, and reorder suggestions", km: "កម្រិតស្តុក ការប្រើប្រាស់ និងការណែនាំបញ្ជាទិញ" },
        fields: ["Item", "Category", "Current Stock", "Min Stock", "Used (Period)", "Cost", "Status"],
    },
    {
        type: "staff",
        label: { en: "Staff Performance", km: "សមត្ថភាពបុគ្គលិក" },
        icon: <Users size={20} />,
        color: "#A855F7",
        description: { en: "Staff hours, orders processed, tips, and performance metrics", km: "ម៉ោងធ្វើការ ការបញ្ជាទិញ និងសមត្ថភាព" },
        fields: ["Staff Name", "Role", "Hours Worked", "Orders Processed", "Revenue Generated", "Tips", "Rating"],
    },
    {
        type: "customers",
        label: { en: "Customer Report", km: "របាយការណ៍អតិថិជន" },
        icon: <Users size={20} />,
        color: "#F59E0B",
        description: { en: "Customer visits, spending patterns, and loyalty data", km: "ការមកទស្សនា ការចំណាយ និងភាពស្មោះ" },
        fields: ["Customer", "Visits", "Total Spent", "Avg Order", "Loyalty Tier", "Last Visit", "Favorite Item"],
    },
    {
        type: "orders",
        label: { en: "Order Analysis", km: "ការវិភាគការបញ្ជាទិញ" },
        icon: <ShoppingCart size={20} />,
        color: "#06B6D4",
        description: { en: "Order patterns, peak times, popular items, and order sizes", km: "គំរូការបញ្ជាទិញ ម៉ោងកំពូល មុខទំនិញពេញនិយម" },
        fields: ["Date", "Time", "Order #", "Table", "Items", "Total", "Prep Time", "Status"],
    },
    {
        type: "financial",
        label: { en: "Financial Summary", km: "សង្ខេបហិរញ្ញវត្ថុ" },
        icon: <BarChart3 size={20} />,
        color: "#EF4444",
        description: { en: "P&L, revenue breakdown, costs, and profit margins", km: "ចំណូល ការចំណាយ និងប្រាក់ចំណេញ" },
        fields: ["Period", "Revenue", "Cost of Goods", "Labor Cost", "Overhead", "Net Profit", "Margin %"],
    },
];

const mockGeneratedReports = [
    { id: 1, name: "Sales Report - March 2026", type: "sales" as ReportType, format: "pdf" as ExportFormat, date: "2026-03-04", size: "2.4 MB" },
    { id: 2, name: "Inventory Report - Week 9", type: "inventory" as ReportType, format: "excel" as ExportFormat, date: "2026-03-03", size: "1.8 MB" },
    { id: 3, name: "Staff Performance - Feb 2026", type: "staff" as ReportType, format: "pdf" as ExportFormat, date: "2026-03-01", size: "3.1 MB" },
    { id: 4, name: "Financial Summary - Q1 2026", type: "financial" as ReportType, format: "excel" as ExportFormat, date: "2026-02-28", size: "4.5 MB" },
];

export function ExportReports() {
    const { lang, fontClass } = useTranslation();
    const { formatPrice } = useCurrency();
    const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
    const [format, setFormat] = useState<ExportFormat>("pdf");
    const [dateRange, setDateRange] = useState<DateRange>("month");
    const [generating, setGenerating] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const handleSelectReport = (type: ReportType) => {
        setSelectedReport(type);
        const config = reportConfigs.find((r) => r.type === type);
        if (config) setSelectedFields(config.fields);
    };

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            toast.success(lang === "km" ? "របាយការណ៍ត្រូវបានបង្កើត!" : "Report generated successfully!");
        }, 2500);
    };

    const toggleField = (field: string) => {
        setSelectedFields((prev) =>
            prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
        );
    };

    const selectedConfig = reportConfigs.find((r) => r.type === selectedReport);

    return (
        <div className={`p-6 ${fontClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                        {lang === "km" ? "នាំចេញរបាយការណ៍" : "Export Reports"}
                    </h2>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
                        {lang === "km" ? "បង្កើត និងទាញយករបាយការណ៍ PDF/Excel" : "Generate and download PDF/Excel reports"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Types */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-gray-700 dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {lang === "km" ? "ជ្រើសរើសប្រភេទរបាយការណ៍" : "Select Report Type"}
                    </h3>
                    {reportConfigs.map((config) => (
                        <button
                            key={config.type}
                            onClick={() => handleSelectReport(config.type)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedReport === config.type
                                ? "border-[#22C55E] bg-green-50/50 dark:bg-green-900/10"
                                : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                                    {config.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>
                                        {lang === "km" ? config.label.km : config.label.en}
                                    </p>
                                    <p className="text-gray-400" style={{ fontSize: "10px" }}>
                                        {lang === "km" ? config.description.km : config.description.en}
                                    </p>
                                </div>
                                {selectedReport === config.type && (
                                    <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Configuration */}
                <div className="lg:col-span-2">
                    {selectedConfig ? (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            {/* Report header */}
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800" style={{ borderLeft: `4px solid ${selectedConfig.color}` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedConfig.color}15`, color: selectedConfig.color }}>
                                        {selectedConfig.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
                                            {lang === "km" ? selectedConfig.label.km : selectedConfig.label.en}
                                        </h3>
                                        <p className="text-gray-400" style={{ fontSize: "11px" }}>
                                            {lang === "km" ? selectedConfig.description.km : selectedConfig.description.en}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Date Range */}
                                <div>
                                    <label className="text-gray-600 dark:text-gray-400 mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                                        {lang === "km" ? "ជួរកាលបរិច្ឆេទ" : "Date Range"}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(["today", "week", "month", "quarter", "year"] as DateRange[]).map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDateRange(d)}
                                                className={`px-3 py-2 rounded-xl border-2 transition-all ${dateRange === d
                                                    ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20 text-[#22C55E]"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-500"
                                                    }`}
                                                style={{ fontSize: "12px", fontWeight: 500 }}
                                            >
                                                {d === "today" ? (lang === "km" ? "ថ្ងៃនេះ" : "Today")
                                                    : d === "week" ? (lang === "km" ? "សប្ដាហ៍នេះ" : "This Week")
                                                        : d === "month" ? (lang === "km" ? "ខែនេះ" : "This Month")
                                                            : d === "quarter" ? (lang === "km" ? "ត្រីមាសនេះ" : "This Quarter")
                                                                : (lang === "km" ? "ឆ្នាំនេះ" : "This Year")}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Export Format */}
                                <div>
                                    <label className="text-gray-600 dark:text-gray-400 mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                                        {lang === "km" ? "ទម្រង់នាំចេញ" : "Export Format"}
                                    </label>
                                    <div className="flex gap-2">
                                        {([
                                            { key: "pdf" as ExportFormat, label: "PDF", icon: <FileText size={16} />, color: "#EF4444" },
                                            { key: "excel" as ExportFormat, label: "Excel", icon: <FileSpreadsheet size={16} />, color: "#22C55E" },
                                            { key: "csv" as ExportFormat, label: "CSV", icon: <Table2 size={16} />, color: "#3B82F6" },
                                        ]).map((f) => (
                                            <button
                                                key={f.key}
                                                onClick={() => setFormat(f.key)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${format === f.key
                                                    ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20"
                                                    : "border-gray-200 dark:border-gray-700"
                                                    }`}
                                                style={{ fontSize: "13px", fontWeight: 500 }}
                                            >
                                                <span style={{ color: f.color }}>{f.icon}</span>
                                                <span className={format === f.key ? "text-[#22C55E]" : "text-gray-600 dark:text-gray-400"}>{f.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fields Selection */}
                                <div>
                                    <label className="text-gray-600 dark:text-gray-400 mb-2 block" style={{ fontSize: "12px", fontWeight: 600 }}>
                                        {lang === "km" ? "វាលទិន្នន័យ" : "Data Fields"} ({selectedFields.length}/{selectedConfig.fields.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedConfig.fields.map((field) => (
                                            <button
                                                key={field}
                                                onClick={() => toggleField(field)}
                                                className={`px-3 py-1.5 rounded-lg border transition-all ${selectedFields.includes(field)
                                                    ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-400"
                                                    }`}
                                                style={{ fontSize: "11px", fontWeight: 500 }}
                                            >
                                                {selectedFields.includes(field) && <Check size={10} className="inline mr-1" />}
                                                {field}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating || selectedFields.length === 0}
                                        className="flex-1 py-3.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-green-900 disabled:opacity-50 flex items-center justify-center gap-2"
                                        style={{ fontSize: "14px", fontWeight: 600 }}
                                    >
                                        {generating ? (
                                            <>
                                                <RefreshCw size={16} className="animate-spin" />
                                                {lang === "km" ? "កំពុងបង្កើត..." : "Generating..."}
                                            </>
                                        ) : (
                                            <>
                                                <FileDown size={16} />
                                                {lang === "km" ? "បង្កើត និងទាញយក" : "Generate & Download"}
                                            </>
                                        )}
                                    </button>
                                    <button className="px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 500 }}>
                                        <Mail size={16} />
                                        {lang === "km" ? "ផ្ញើ" : "Email"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                            <p className="text-gray-500" style={{ fontSize: "14px", fontWeight: 500 }}>
                                {lang === "km" ? "ជ្រើសរើសប្រភេទរបាយការណ៍ដើម្បីចាប់ផ្តើម" : "Select a report type to get started"}
                            </p>
                        </div>
                    )}

                    {/* Recent Reports */}
                    <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                {lang === "km" ? "របាយការណ៍ថ្មីៗ" : "Recent Reports"}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {mockGeneratedReports.map((report) => {
                                const config = reportConfigs.find((r) => r.type === report.type);
                                return (
                                    <div key={report.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config?.color || "#999"}15`, color: config?.color }}>
                                            {report.format === "pdf" ? <FileText size={18} /> : <FileSpreadsheet size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 500 }}>{report.name}</p>
                                            <p className="text-gray-400" style={{ fontSize: "11px" }}>{report.date} • {report.size} • {report.format.toUpperCase()}</p>
                                        </div>
                                        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#22C55E] transition-colors">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

