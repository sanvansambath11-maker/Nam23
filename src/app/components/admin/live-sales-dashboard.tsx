import { useState, useEffect } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
    Activity,
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    TrendingDown,
    Clock,
    Zap,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    BarChart3,
    Circle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { getLocalOrdersToday, getLocalDashboardStats } from "../../../lib/local-orders";

const generateLiveData = () => {
    const hours = ["6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM"];
    return hours.map((h) => ({
        time: h,
        revenue: 0,
        orders: 0,
        customers: 0,
    }));
};

const generateOrderFeed = () => {
    return [] as { id: number; orderNumber: string; item: string; amount: string; status: string; time: string; table: number | string; color: string }[];
};

export function LiveSalesDashboard() {
    const { lang, fontClass } = useTranslation();
    const { formatPrice } = useCurrency();
    const [liveData, setLiveData] = useState(generateLiveData());
    const [orderFeed, setOrderFeed] = useState(generateOrderFeed());
    const [isLive, setIsLive] = useState(true);
    const [pulse, setPulse] = useState(false);
    const [todayStats, setTodayStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        avgOrderTime: 0,
        avgTicket: 0,
        peakHour: "--",
        quickestOrder: "--",
        slowestOrder: "--",
    });

    // Fetch live local data
    useEffect(() => {
        const fetchData = () => {
            const stats = getLocalDashboardStats();
            const orders = getLocalOrdersToday();

            setTodayStats({
                revenue: stats.todayRevenue,
                orders: stats.todayOrders,
                customers: stats.totalCustomers,
                avgOrderTime: 5, // Mocked for now
                avgTicket: stats.avgOrder,
                peakHour: "--",
                quickestOrder: "2m",
                slowestOrder: "8m",
            });

            // Build feed
            const feed = orders.slice(0, 15).map((o) => {
                const isPaid = o.status === "served";
                return {
                    id: o.id,
                    orderNumber: o.order_number,
                    item: o.items.length > 0 ? `${o.items[0].name} ${o.items.length > 1 ? `+${o.items.length - 1}` : ""}` : "Custom",
                    amount: o.total.toFixed(2),
                    status: isPaid ? "Paid" : "Pending",
                    time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    table: o.table_number ?? "Walk-in",
                    color: isPaid ? "#22C55E" : "#F59E0B"
                };
            });
            setOrderFeed(feed);
        };

        fetchData(); // Initial load

        if (!isLive) return;

        const interval = setInterval(() => {
            fetchData();
        }, 3000); // Check every 3s local cache

        return () => clearInterval(interval);
    }, [isLive]);

    const hourlyPerformance = [
        { hour: "6AM", value: 0 }, { hour: "7AM", value: 0 }, { hour: "8AM", value: 0 },
        { hour: "9AM", value: 0 }, { hour: "10AM", value: 0 }, { hour: "11AM", value: 0 },
        { hour: "12PM", value: 0 }, { hour: "1PM", value: 0 }, { hour: "2PM", value: 0 },
        { hour: "3PM", value: 0 }, { hour: "4PM", value: 0 }, { hour: "5PM", value: 0 },
        { hour: "6PM", value: 0 }, { hour: "7PM", value: 0 }, { hour: "8PM", value: 0 },
        { hour: "9PM", value: 0 },
    ];

    return (
        <div className={`p-6 ${fontClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                        {lang === "km" ? "ផ្ទាំងគ្រប់គ្រងផ្សាយផ្ទាល់" : "Live Sales Dashboard"}
                    </h2>
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
                            <div className={`w-2 h-2 rounded-full bg-red-500 ${pulse ? "animate-ping" : ""}`} />
                            <span className="text-red-500" style={{ fontSize: "11px", fontWeight: 600 }}>LIVE</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${isLive
                            ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600"
                            : "border-gray-200 dark:border-gray-700 text-gray-500"
                            }`}
                        style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                        {isLive ? <Activity size={14} /> : <Circle size={14} />}
                        {isLive ? (lang === "km" ? "ផ្សាយផ្ទាល់" : "Live") : (lang === "km" ? "ផ្អាក" : "Paused")}
                    </button>
                    <button
                        onClick={() => { setLiveData(generateLiveData()); setOrderFeed(generateOrderFeed()); }}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: lang === "km" ? "ប្រាក់ចំណូលថ្ងៃនេះ" : "Today's Revenue",
                        value: formatPrice(todayStats.revenue),
                        change: "+18.2%",
                        trend: "up",
                        icon: <DollarSign size={20} />,
                        color: "#22C55E",
                    },
                    {
                        label: lang === "km" ? "ការបញ្ជាទិញ" : "Orders Today",
                        value: todayStats.orders.toString(),
                        change: "+12.5%",
                        trend: "up",
                        icon: <ShoppingCart size={20} />,
                        color: "#3B82F6",
                    },
                    {
                        label: lang === "km" ? "អតិថិជន" : "Customers",
                        value: todayStats.customers.toString(),
                        change: "+8.3%",
                        trend: "up",
                        icon: <Users size={20} />,
                        color: "#A855F7",
                    },
                    {
                        label: lang === "km" ? "មធ្យមពេលវេលា" : "Avg Order Time",
                        value: `${todayStats.avgOrderTime}m`,
                        change: "-2.1%",
                        trend: "down",
                        icon: <Clock size={20} />,
                        color: "#F59E0B",
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03]" style={{ backgroundColor: stat.color, transform: "translate(30%, -30%)" }} />
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${stat.trend === "up" ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                                {stat.trend === "up" ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                <span style={{ fontSize: "10px", fontWeight: 600 }}>{stat.change}</span>
                            </div>
                        </div>
                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>{stat.value}</p>
                        <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                {lang === "km" ? "ប្រាក់ចំណូលតាមម៉ោង" : "Hourly Revenue"}
                            </p>
                            <p className="text-gray-400" style={{ fontSize: "11px" }}>
                                {lang === "km" ? "បច្ចុប្បន្នភាពរៀងរាល់ 5 វិនាទី" : "Updates every 5 seconds"}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-[#22C55E]" />
                            <span className="text-[#22C55E]" style={{ fontSize: "11px", fontWeight: 600 }}>Real-time</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={liveData}>
                            <defs>
                                <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f015" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#999" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v) => `$${v}`} />
                            <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
                            <Area type="monotone" dataKey="revenue" stroke="#22C55E" fill="url(#liveGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Live Order Feed */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {lang === "km" ? "ការបញ្ជាទិញផ្សាយផ្ទាល់" : "Live Order Feed"}
                        </p>
                        <div className={`w-2 h-2 rounded-full bg-green-500 ${pulse ? "animate-ping" : ""}`} />
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50" style={{ maxHeight: "320px" }}>
                        {orderFeed.map((order) => (
                            <div key={order.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: order.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-900 dark:text-white truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{order.item}</span>
                                        <span className="text-gray-400 shrink-0" style={{ fontSize: "9px" }}>T{order.table}</span>
                                    </div>
                                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{order.orderNumber} • {order.time}</span>
                                </div>
                                <span className="text-[#22C55E] shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>${order.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Heatmap */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {lang === "km" ? "សមត្ថភាពតាមម៉ោង" : "Hourly Performance"}
                </p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f015" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#999" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {hourlyPerformance.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.value > 80 ? "#22C55E" : entry.value > 50 ? "#3B82F6" : entry.value > 30 ? "#F59E0B" : "#E5E7EB"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 justify-center">
                    {[
                        { label: lang === "km" ? "ខ្ពស់" : "High", color: "#22C55E" },
                        { label: lang === "km" ? "មធ្យម" : "Medium", color: "#3B82F6" },
                        { label: lang === "km" ? "ទាប" : "Low", color: "#F59E0B" },
                        { label: lang === "km" ? "ស្ងាត់" : "Quiet", color: "#E5E7EB" },
                    ].map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color }} />
                            <span className="text-gray-500" style={{ fontSize: "10px" }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {[
                    { label: lang === "km" ? "មធ្យមវិក្កយបត្រ" : "Avg Ticket", value: formatPrice(todayStats.avgTicket), icon: <BarChart3 size={16} />, color: "#22C55E" },
                    { label: lang === "km" ? "ម៉ោងកំពូល" : "Peak Hour", value: todayStats.peakHour, icon: <TrendingUp size={16} />, color: "#3B82F6" },
                    { label: lang === "km" ? "ការបញ្ជាទិញលឿនបំផុត" : "Quickest Order", value: todayStats.quickestOrder, icon: <Zap size={16} />, color: "#22C55E" },
                    { label: lang === "km" ? "ការបញ្ជាទិញយឺតបំផុត" : "Slowest Order", value: todayStats.slowestOrder, icon: <TrendingDown size={16} />, color: "#EF4444" },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 700 }}>{s.value}</p>
                            <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
