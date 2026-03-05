import { useState, useEffect } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Package,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Award,
    Target,
    Flame,
    ShoppingCart,
    Users,
    Zap,
    Settings,
    Volume2,
    VolumeX,
    Eye,
    ChevronRight,
    X,
    Filter,
} from "lucide-react";

type AlertType = "low_stock" | "slow_order" | "revenue_milestone" | "peak_traffic" | "staff_alert" | "inventory_expiry" | "customer_vip" | "goal_achieved";
type AlertPriority = "critical" | "warning" | "info" | "success";

interface SmartAlert {
    id: number;
    type: AlertType;
    priority: AlertPriority;
    title: string;
    titleKm: string;
    message: string;
    messageKm: string;
    timestamp: string;
    read: boolean;
    actionLabel?: string;
    actionLabelKm?: string;
    data?: Record<string, unknown>;
}

const priorityConfig: Record<AlertPriority, { color: string; bg: string; darkBg: string; icon: React.ReactNode; label: string; labelKm: string }> = {
    critical: { color: "#EF4444", bg: "bg-red-50", darkBg: "dark:bg-red-900/20", icon: <XCircle size={18} />, label: "Critical", labelKm: "សំខាន់បំផុត" },
    warning: { color: "#F59E0B", bg: "bg-amber-50", darkBg: "dark:bg-amber-900/20", icon: <AlertTriangle size={18} />, label: "Warning", labelKm: "ការព្រមាន" },
    info: { color: "#3B82F6", bg: "bg-blue-50", darkBg: "dark:bg-blue-900/20", icon: <Info size={18} />, label: "Info", labelKm: "ព័ត៌មាន" },
    success: { color: "#22C55E", bg: "bg-green-50", darkBg: "dark:bg-green-900/20", icon: <CheckCircle size={18} />, label: "Success", labelKm: "ជោគជ័យ" },
};

const mockAlerts: SmartAlert[] = [
    {
        id: 1, type: "low_stock", priority: "critical",
        title: "Critical Low Stock: Rice",
        titleKm: "ស្តុកទាប: អង្ចរ",
        message: "Rice stock is at 5kg (minimum: 20kg). Only 2 days left at current usage. Reorder immediately.",
        messageKm: "ស្តុកអង្ករនៅ 5kg (អប្បបរមា: 20kg)។ នៅសល់តែ 2 ថ្ងៃទៀត។",
        timestamp: "2 min ago", read: false,
        actionLabel: "Reorder Now", actionLabelKm: "បញ្ជាទិញឥឡូវ",
    },
    {
        id: 2, type: "slow_order", priority: "warning",
        title: "Slow Order Alert: Table 7",
        titleKm: "ការបញ្ជាទិញយឺត: តុ 7",
        message: "Order #ORD-0045 has been preparing for 25 minutes (average: 12 min). Kitchen may need attention.",
        messageKm: "ការបញ្ជាទិញ #ORD-0045 កំពុងរៀបចំអស់ 25 នាទី។",
        timestamp: "5 min ago", read: false,
        actionLabel: "View Order", actionLabelKm: "មើលការបញ្ជាទិញ",
    },
    {
        id: 3, type: "revenue_milestone", priority: "success",
        title: "🎉 Revenue Milestone: $3,000 Today!",
        titleKm: "🎉 ប្រាក់ចំណូលថ្ងៃនេះ: $3,000!",
        message: "Congratulations! You've exceeded $3,000 in revenue today. That's 15% above your daily average.",
        messageKm: "សូមអបអរ! អ្នកបានលើសពី $3,000 ប្រាក់ចំណូលថ្ងៃនេះ។",
        timestamp: "15 min ago", read: false,
    },
    {
        id: 4, type: "peak_traffic", priority: "info",
        title: "Peak Traffic Detected",
        titleKm: "ការរកឃើញចរាចរកំពូល",
        message: "38 orders in the last hour. Consider scheduling more staff for this time slot next week.",
        messageKm: "38 ការបញ្ជាទិញក្នុងម៉ោងចុងក្រោយ។ សូមពិចារណាកំណត់បុគ្គលិកបន្ថែម។",
        timestamp: "30 min ago", read: true,
    },
    {
        id: 5, type: "low_stock", priority: "warning",
        title: "Low Stock Warning: Coconut Milk",
        titleKm: "ស្តុកទាប: ទឹកដូង",
        message: "Coconut milk is at 3 liters (minimum: 10L). Used in 8 menu items. Consider restocking.",
        messageKm: "ទឹកដូងនៅ 3 លីត្រ (អប្បបរមា: 10L)។ ប្រើក្នុង 8 មុខម្ហូប។",
        timestamp: "1 hour ago", read: true,
        actionLabel: "View Inventory", actionLabelKm: "មើលស្តុក",
    },
    {
        id: 6, type: "customer_vip", priority: "info",
        title: "VIP Customer Detected",
        titleKm: "អតិថិជន VIP របកឃើញ",
        message: "Gold tier customer 'Mr. Sokha' just arrived at Table 3. Total lifetime spend: $2,450.",
        messageKm: "អតិថិជនកម្រិត Gold 'លោក សុខា' មកដល់តុ 3។",
        timestamp: "1 hour ago", read: true,
    },
    {
        id: 7, type: "goal_achieved", priority: "success",
        title: "Weekly Goal Achieved! 🏆",
        titleKm: "គោលដៅប្រចាំសប្ដាហ៍សម្រេច! 🏆",
        message: "You've served 500+ orders this week, surpassing your target of 450. Great job!",
        messageKm: "អ្នកបានបម្រើ 500+ ការបញ្ជាទិញសប្ដាហ៍នេះ។",
        timestamp: "2 hours ago", read: true,
    },
    {
        id: 8, type: "inventory_expiry", priority: "warning",
        title: "Inventory Expiry Warning",
        titleKm: "ការព្រមានផុតកំណត់ស្តុក",
        message: "5 items are expiring within 3 days: Shrimp (2kg), Chicken (3kg), Tofu (1kg). Plan usage accordingly.",
        messageKm: "5 មុខទំនិញនឹងផុតកំណត់ក្នុង 3 ថ្ងៃ។",
        timestamp: "3 hours ago", read: true,
        actionLabel: "View Items", actionLabelKm: "មើលមុខទំនិញ",
    },
];

// Alert rules/thresholds
const alertRules = [
    { id: 1, name: "Low Stock Alert", nameKm: "ការព្រមានស្តុកទាប", type: "low_stock", enabled: true, threshold: "When stock falls below minimum", icon: <Package size={16} /> },
    { id: 2, name: "Slow Order Alert", nameKm: "ការព្រមានការបញ្ជាទិញយឺត", type: "slow_order", enabled: true, threshold: "When prep time exceeds 20 min", icon: <Clock size={16} /> },
    { id: 3, name: "Revenue Milestones", nameKm: "ចំណុចសម្គាល់ចំណូល", type: "revenue_milestone", enabled: true, threshold: "At $1K, $2K, $3K, $5K daily", icon: <DollarSign size={16} /> },
    { id: 4, name: "Peak Traffic", nameKm: "ចរាចរកំពូល", type: "peak_traffic", enabled: true, threshold: "30+ orders per hour", icon: <TrendingUp size={16} /> },
    { id: 5, name: "Inventory Expiry", nameKm: "ផុតកំណត់ស្តុក", type: "inventory_expiry", enabled: true, threshold: "Items expiring within 3 days", icon: <AlertTriangle size={16} /> },
    { id: 6, name: "VIP Customer", nameKm: "អតិថិជន VIP", type: "customer_vip", enabled: false, threshold: "Gold/Platinum customers detected", icon: <Users size={16} /> },
    { id: 7, name: "Goal Tracking", nameKm: "តាមដានគោលដៅ", type: "goal_achieved", enabled: true, threshold: "When daily/weekly goals are met", icon: <Target size={16} /> },
];

export function SmartAlerts() {
    const { lang, fontClass } = useTranslation();
    const [alerts, setAlerts] = useState<SmartAlert[]>(mockAlerts);
    const [rules, setRules] = useState(alertRules);
    const [activeView, setActiveView] = useState<"alerts" | "rules">("alerts");
    const [filterPriority, setFilterPriority] = useState<AlertPriority | "all">("all");
    const [soundEnabled, setSoundEnabled] = useState(true);

    const unreadCount = alerts.filter((a) => !a.read).length;
    const criticalCount = alerts.filter((a) => a.priority === "critical" && !a.read).length;

    const handleMarkRead = (id: number) => {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    };

    const handleMarkAllRead = () => {
        setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    };

    const handleDismiss = (id: number) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    const handleToggleRule = (id: number) => {
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    };

    const filteredAlerts = filterPriority === "all" ? alerts : alerts.filter((a) => a.priority === filterPriority);

    return (
        <div className={`p-6 ${fontClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                        {lang === "km" ? "ការជូនដំណឹងឆ្លាតវៃ" : "Smart Alerts"}
                    </h2>
                    {unreadCount > 0 && (
                        <span className="px-2.5 py-1 bg-red-500 text-white rounded-full" style={{ fontSize: "11px", fontWeight: 700 }}>
                            {unreadCount}
                        </span>
                    )}
                    {criticalCount > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full" style={{ fontSize: "11px", fontWeight: 600 }}>
                            <AlertTriangle size={12} />
                            {criticalCount} {lang === "km" ? "សំខាន់" : "critical"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title={soundEnabled ? "Mute" : "Unmute"}
                    >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        <button
                            onClick={() => setActiveView("alerts")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === "alerts" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
                            style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                            {lang === "km" ? "ការជូនដំណឹង" : "Alerts"} ({alerts.length})
                        </button>
                        <button
                            onClick={() => setActiveView("rules")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === "rules" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
                            style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                            {lang === "km" ? "ច្បាប់" : "Rules"}
                        </button>
                    </div>
                </div>
            </div>

            {activeView === "alerts" && (
                <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: lang === "km" ? "មិនបានអាន" : "Unread", value: unreadCount, color: "#EF4444", icon: <Bell size={18} /> },
                            { label: lang === "km" ? "ស្តុកទាប" : "Low Stock", value: alerts.filter((a) => a.type === "low_stock").length, color: "#F59E0B", icon: <Package size={18} /> },
                            { label: lang === "km" ? "ការបញ្ជាទិញយឺត" : "Slow Orders", value: alerts.filter((a) => a.type === "slow_order").length, color: "#3B82F6", icon: <Clock size={18} /> },
                            { label: lang === "km" ? "ជោគជ័យ" : "Achievements", value: alerts.filter((a) => a.priority === "success").length, color: "#22C55E", icon: <Award size={18} /> },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filter + Actions */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-gray-400" />
                            {(["all", "critical", "warning", "info", "success"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className={`px-2.5 py-1.5 rounded-lg transition-all ${filterPriority === p
                                            ? p === "all" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : `${priorityConfig[p as AlertPriority].bg} ${priorityConfig[p as AlertPriority].darkBg}`
                                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    style={{ fontSize: "11px", fontWeight: 500, color: filterPriority === p && p !== "all" ? priorityConfig[p as AlertPriority].color : undefined }}
                                >
                                    {p === "all" ? (lang === "km" ? "ទាំងអស់" : "All") : (lang === "km" ? priorityConfig[p].labelKm : priorityConfig[p].label)}
                                </button>
                            ))}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[#22C55E] hover:text-green-600 transition-colors"
                                style={{ fontSize: "12px", fontWeight: 500 }}
                            >
                                {lang === "km" ? "សម្គាល់ទាំងអស់ថាបានអាន" : "Mark all as read"}
                            </button>
                        )}
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-2">
                        {filteredAlerts.map((alert) => {
                            const config = priorityConfig[alert.priority];
                            return (
                                <div
                                    key={alert.id}
                                    className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-4 transition-all hover:shadow-md ${!alert.read ? `border-l-4` : "border-gray-100 dark:border-gray-800"
                                        }`}
                                    style={{ borderLeftColor: !alert.read ? config.color : undefined }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.darkBg} flex items-center justify-center shrink-0`} style={{ color: config.color }}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`${!alert.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`} style={{ fontSize: "13px", fontWeight: !alert.read ? 600 : 500 }}>
                                                    {lang === "km" ? alert.titleKm : alert.title}
                                                </p>
                                                {!alert.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <p className="text-gray-400" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                                                {lang === "km" ? alert.messageKm : alert.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-gray-300 dark:text-gray-600" style={{ fontSize: "10px" }}>{alert.timestamp}</span>
                                                {alert.actionLabel && (
                                                    <button className="text-[#22C55E] hover:text-green-600 flex items-center gap-0.5" style={{ fontSize: "11px", fontWeight: 600 }}>
                                                        {lang === "km" ? alert.actionLabelKm : alert.actionLabel}
                                                        <ChevronRight size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!alert.read && (
                                                <button
                                                    onClick={() => handleMarkRead(alert.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDismiss(alert.id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                                                title="Dismiss"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredAlerts.length === 0 && (
                        <div className="text-center py-12">
                            <CheckCircle size={48} className="mx-auto text-green-200 dark:text-green-900 mb-3" />
                            <p className="text-gray-500" style={{ fontSize: "14px", fontWeight: 500 }}>
                                {lang === "km" ? "គ្មានការជូនដំណឹង!" : "All clear! No alerts to show."}
                            </p>
                        </div>
                    )}
                </>
            )}

            {activeView === "rules" && (
                <div className="space-y-3">
                    <p className="text-gray-500 mb-4" style={{ fontSize: "12px" }}>
                        {lang === "km" ? "កំណត់ច្បាប់សម្រាប់ការជូនដំណឹងស្វ័យប្រវត្តិ" : "Configure rules for automatic alert notifications"}
                    </p>
                    {rules.map((rule) => (
                        <div key={rule.id} className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-5 transition-all ${rule.enabled ? "border-gray-100 dark:border-gray-800" : "border-gray-100 dark:border-gray-800 opacity-60"}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rule.enabled ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                                    {rule.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                        {lang === "km" ? rule.nameKm : rule.name}
                                    </p>
                                    <p className="text-gray-400" style={{ fontSize: "11px" }}>{rule.threshold}</p>
                                </div>
                                <button
                                    onClick={() => handleToggleRule(rule.id)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${rule.enabled ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-gray-600"}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${rule.enabled ? "left-[26px]" : "left-1"}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
