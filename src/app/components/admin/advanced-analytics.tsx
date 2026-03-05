import { useState } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
    TrendingUp,
    TrendingDown,
    Star,
    Award,
    BarChart3,
    Calendar,
    ArrowUp,
    ArrowDown,
    Flame,
    Eye,
    Target,
    Clock,
    DollarSign,
    ShoppingCart,
    Users,
    Zap,
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
} from "recharts";

// Best sellers data
const bestSellers: { rank: number; name: string; nameKm: string; category: string; sold: number; revenue: number; trend: string; trendUp: boolean; rating: number }[] = [
    { rank: 1, name: "Beef Lok Lak", nameKm: "ឡុកឡាក់សាច់គោ", category: "Khmer", sold: 145, revenue: 1160, trend: "12%", trendUp: true, rating: 4.8 },
    { rank: 2, name: "Fish Amok", nameKm: "អាម៉ុកត្រី", category: "Khmer", sold: 121, revenue: 847, trend: "8%", trendUp: true, rating: 4.9 },
    { rank: 3, name: "Iced Milk Coffee", nameKm: "កាហ្វេទឹកដោះគោទឹកកក", category: "Drinks", sold: 98, revenue: 245, trend: "5%", trendUp: true, rating: 4.7 },
];

// Peak hours heatmap data
const heatmapData: { day: string; hours: number[] }[] = [
    { day: "Mon", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: "Tue", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: "Wed", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: "Thu", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: "Fri", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: "Sat", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: "Sun", hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];
const timeLabels = ["6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM"];

// Revenue forecast
const forecastData: { month: string; actual: number | null; forecast: number }[] = [];

// Category performance
const categoryPerformance: { category: string; revenue: number; orders: number; growth: number }[] = [];

// Radar data for menu strengths
const radarData = [
    { metric: "Taste", value: 0 },
    { metric: "Speed", value: 0 },
    { metric: "Price", value: 0 },
    { metric: "Variety", value: 0 },
    { metric: "Presentation", value: 0 },
    { metric: "Freshness", value: 0 },
];

const getHeatColor = (value: number) => {
    if (value >= 90) return "#22C55E";
    if (value >= 70) return "#3B82F6";
    if (value >= 50) return "#F59E0B";
    if (value >= 30) return "#FB923C";
    return "#E5E7EB";
};

export function AdvancedAnalytics() {
    const { lang, fontClass } = useTranslation();
    const { formatPrice } = useCurrency();
    const [period, setPeriod] = useState<"weekly" | "monthly" | "quarterly">("monthly");
    const [activeSection, setActiveSection] = useState<"bestsellers" | "peakhours" | "forecast" | "categories">("bestsellers");

    return (
        <div className={`p-6 ${fontClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                        {lang === "km" ? "វិភាគកម្រិតខ្ពស់" : "Advanced Analytics"}
                    </h2>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
                        {lang === "km" ? "ការវិភាគអាជីវកម្មស៊ីជម្រៅ" : "In-depth business intelligence insights"}
                    </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {(["weekly", "monthly", "quarterly"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${period === p ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
                            style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                            {p === "weekly" ? (lang === "km" ? "ប្រចាំសប្ដាហ៍" : "Weekly") : p === "monthly" ? (lang === "km" ? "ប្រចាំខែ" : "Monthly") : (lang === "km" ? "ប្រចាំត្រីមាស" : "Quarterly")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {[
                    { key: "bestsellers" as const, label: lang === "km" ? "ផលិតផលលក់ដាច់បំផុត" : "Best Sellers", icon: <Award size={14} /> },
                    { key: "peakhours" as const, label: lang === "km" ? "ម៉ោងកំពូល" : "Peak Hours", icon: <Clock size={14} /> },
                    { key: "forecast" as const, label: lang === "km" ? "ការព្យាករណ៍" : "Revenue Forecast", icon: <TrendingUp size={14} /> },
                    { key: "categories" as const, label: lang === "km" ? "ប្រភេទ" : "Categories", icon: <BarChart3 size={14} /> },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSection(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${activeSection === tab.key
                            ? "bg-[#22C55E] text-white shadow-md shadow-green-200 dark:shadow-green-900"
                            : "bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-[#22C55E]"
                            }`}
                        style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Best Sellers */}
            {activeSection === "bestsellers" && (
                <div className="space-y-4">
                    {/* Top 3 podium */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 0, 2].map((idx) => {
                            const item = bestSellers[idx];
                            const isFirst = idx === 0;
                            return (
                                <div
                                    key={item.rank}
                                    className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border-2 text-center relative overflow-hidden ${isFirst ? "border-yellow-300 dark:border-yellow-600" : "border-gray-100 dark:border-gray-800"
                                        }`}
                                    style={{ marginTop: isFirst ? 0 : "24px" }}
                                >
                                    {isFirst && (
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />
                                    )}
                                    <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${item.rank === 1 ? "bg-yellow-100 text-yellow-600" : item.rank === 2 ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-600"
                                        }`}>
                                        <Award size={24} />
                                    </div>
                                    <span className={`inline-block px-2 py-0.5 rounded-full mb-2 ${item.rank === 1 ? "bg-yellow-100 text-yellow-700" : item.rank === 2 ? "bg-gray-100 text-gray-600" : "bg-amber-50 text-amber-700"
                                        }`} style={{ fontSize: "10px", fontWeight: 700 }}>
                                        #{item.rank}
                                    </span>
                                    <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 700 }}>
                                        {lang === "km" ? item.nameKm : item.name}
                                    </p>
                                    <p className="text-gray-400" style={{ fontSize: "11px" }}>{item.category}</p>
                                    <p className="text-[#22C55E] mt-2" style={{ fontSize: "18px", fontWeight: 700 }}>{formatPrice(item.revenue)}</p>
                                    <p className="text-gray-400" style={{ fontSize: "11px" }}>{item.sold} {lang === "km" ? "ការបញ្ជាទិញ" : "orders"}</p>
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "12px", fontWeight: 600 }}>{item.rating}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Full ranking table */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                {lang === "km" ? "ចំណាត់ថ្នាក់ពេញ" : "Full Rankings"}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {bestSellers.map((item) => (
                                <div key={item.rank} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${item.rank <= 3 ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 dark:bg-gray-800 text-gray-400"
                                        }`} style={{ fontSize: "12px", fontWeight: 700 }}>
                                        {item.rank}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>
                                            {lang === "km" ? item.nameKm : item.name}
                                        </p>
                                        <p className="text-gray-400" style={{ fontSize: "11px" }}>{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 700 }}>{item.sold}</p>
                                        <p className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? "លក់" : "sold"}</p>
                                    </div>
                                    <p className="text-[#22C55E] w-20 text-right" style={{ fontSize: "13px", fontWeight: 700 }}>{formatPrice(item.revenue)}</p>
                                    <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${item.trendUp ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`} style={{ fontSize: "11px", fontWeight: 600 }}>
                                        {item.trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                        {item.trend}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Peak Hours Heatmap */}
            {activeSection === "peakhours" && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                    {lang === "km" ? "ផែនទីកម្ដៅ ម៉ោងកំពូល" : "Peak Hours Heatmap"}
                                </h3>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                                    {lang === "km" ? "បរិមាណការបញ្ជាទិញតាមថ្ងៃ និងម៉ោង" : "Order volume by day and hour"}
                                </p>
                            </div>
                        </div>

                        {/* Heatmap Grid */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[600px]">
                                {/* Time header */}
                                <div className="flex">
                                    <div className="w-12 shrink-0" />
                                    {timeLabels.map((t) => (
                                        <div key={t} className="flex-1 text-center text-gray-400" style={{ fontSize: "9px" }}>{t}</div>
                                    ))}
                                </div>
                                {/* Rows */}
                                {heatmapData.map((row) => (
                                    <div key={row.day} className="flex items-center gap-1 mb-1">
                                        <div className="w-12 shrink-0 text-gray-500" style={{ fontSize: "11px", fontWeight: 500 }}>{row.day}</div>
                                        {row.hours.map((value, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                                                style={{
                                                    backgroundColor: getHeatColor(value),
                                                    height: "28px",
                                                    opacity: Math.max(0.3, value / 100),
                                                }}
                                                title={`${row.day} ${timeLabels[i]}: ${value} orders`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-4 justify-center">
                            {[
                                { label: lang === "km" ? "ស្ងាត់" : "Quiet", color: "#E5E7EB" },
                                { label: lang === "km" ? "ទាប" : "Low", color: "#FB923C" },
                                { label: lang === "km" ? "មធ្យម" : "Medium", color: "#F59E0B" },
                                { label: lang === "km" ? "ខ្ពស់" : "High", color: "#3B82F6" },
                                { label: lang === "km" ? "កំពូល" : "Peak", color: "#22C55E" },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: l.color }} />
                                    <span className="text-gray-500" style={{ fontSize: "10px" }}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Peak insights */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: lang === "km" ? "ម៉ោងកំពូល" : "Peak Hour", value: "--", desc: "--", icon: <Flame size={18} />, color: "#EF4444" },
                            { label: lang === "km" ? "ថ្ងៃរវល់បំផុត" : "Busiest Day", value: "--", desc: "0 orders", icon: <Zap size={18} />, color: "#F59E0B" },
                            { label: lang === "km" ? "ម៉ោងស្ងាត់បំផុត" : "Quietest Hour", value: "--", desc: "--", icon: <Clock size={18} />, color: "#3B82F6" },
                            { label: lang === "km" ? "មធ្យមប្រចាំថ្ងៃ" : "Daily Avg", value: "0", desc: lang === "km" ? "ការបញ្ជាទិញ" : "orders", icon: <Target size={18} />, color: "#A855F7" },
                        ].map((insight, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${insight.color}15`, color: insight.color }}>
                                    {insight.icon}
                                </div>
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{insight.value}</p>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>{insight.label}</p>
                                <p className="text-gray-300 dark:text-gray-600 mt-0.5" style={{ fontSize: "10px" }}>{insight.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Revenue Forecast */}
            {activeSection === "forecast" && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                    {lang === "km" ? "ការព្យាករណ៍ប្រាក់ចំណូល" : "Revenue Forecast"}
                                </h3>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                                    {lang === "km" ? "ការព្យាករណ៍ 6 ខែ" : "6-month projection based on trends"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-1 rounded bg-[#22C55E]" />
                                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? "ជាក់ស្ដែង" : "Actual"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-1 rounded bg-[#3B82F6]" style={{ borderBottom: "2px dashed #3B82F6" }} />
                                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? "ការព្យាករណ៍" : "Forecast"}</span>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <ComposedChart data={forecastData}>
                                <defs>
                                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f015" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#999" />
                                <YAxis tick={{ fontSize: 11 }} stroke="#999" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(value: number) => [value ? `$${value.toLocaleString()}` : "N/A"]} />
                                <Area type="monotone" dataKey="actual" stroke="#22C55E" fill="url(#forecastGrad)" strokeWidth={2} connectNulls={false} />
                                <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeDasharray="8 4" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Forecast summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: lang === "km" ? "ប្រាក់ចំណូលខែនេះ" : "This Month Revenue", value: "$0", change: "0%", up: true, icon: <DollarSign size={18} />, color: "#22C55E" },
                            { label: lang === "km" ? "ការព្យាករណ៍ខែក្រោយ" : "Next Month Forecast", value: "$0", change: "0%", up: true, icon: <TrendingUp size={18} />, color: "#3B82F6" },
                            { label: lang === "km" ? "កំណើនប្រចាំឆ្នាំ" : "YoY Growth", value: "0%", change: "--", up: true, icon: <ArrowUp size={18} />, color: "#A855F7" },
                            { label: lang === "km" ? "គោលដៅប្រចាំឆ្នាំ" : "Annual Target", value: "0%", change: "$0", up: true, icon: <Target size={18} />, color: "#F59E0B" },
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                                        {s.icon}
                                    </div>
                                </div>
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{s.value}</p>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Radar chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {lang === "km" ? "ពិន្ទុភោជនីយដ្ឋាន" : "Restaurant Strength Score"}
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                                <Radar name="Score" dataKey="value" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Categories */}
            {activeSection === "categories" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryPerformance.map((cat) => (
                            <div key={cat.category} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400" style={{ fontSize: "12px", fontWeight: 500 }}>
                                        {cat.category}
                                    </span>
                                    <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${cat.growth >= 0 ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`} style={{ fontSize: "11px", fontWeight: 600 }}>
                                        {cat.growth >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                        {cat.growth >= 0 ? "+" : ""}{cat.growth}%
                                    </span>
                                </div>
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>{formatPrice(cat.revenue)}</p>
                                <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>{cat.orders} {lang === "km" ? "ការបញ្ជាទិញ" : "orders"}</p>
                                <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full rounded-full bg-[#22C55E]" style={{ width: `${Math.min(100, (cat.revenue / 5253) * 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Category pie chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {lang === "km" ? "ចែករំលែកចំណូលតាមប្រភេទ" : "Revenue Share by Category"}
                        </h3>
                        <div className="flex items-center gap-8">
                            <ResponsiveContainer width="50%" height={250}>
                                <PieChart>
                                    <Pie data={categoryPerformance.map((c) => ({ name: c.category, value: c.revenue }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                                        {categoryPerformance.map((_, i) => (
                                            <Cell key={i} fill={["#22C55E", "#3B82F6", "#F59E0B", "#A855F7", "#EF4444", "#06B6D4"][i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {categoryPerformance.map((cat, i) => (
                                    <div key={cat.category} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#22C55E", "#3B82F6", "#F59E0B", "#A855F7", "#EF4444", "#06B6D4"][i] }} />
                                        <span className="text-gray-600 dark:text-gray-400 flex-1" style={{ fontSize: "12px" }}>{cat.category}</span>
                                        <span className="text-gray-900 dark:text-white" style={{ fontSize: "12px", fontWeight: 600 }}>{formatPrice(cat.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
