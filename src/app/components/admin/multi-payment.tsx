import { useState } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
    CreditCard,
    Banknote,
    Smartphone,
    QrCode,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Receipt,
    ArrowRight,
    DollarSign,
    TrendingUp,
    PieChart,
    Calendar,
} from "lucide-react";

type PayMethod = "cash" | "card" | "khqr" | "aba" | "wing" | "bakong" | "pipay" | "truemoney" | "acleda";

interface PaymentSplit {
    id: number;
    method: PayMethod;
    amount: number;
}

interface PaymentRecord {
    id: number;
    orderNumber: string;
    total: number;
    splits: PaymentSplit[];
    date: string;
    status: "completed" | "partial" | "refunded";
}

const methodConfig: Record<PayMethod, { label: string; color: string; icon: React.ReactNode; abbr: string }> = {
    cash: { label: "Cash", color: "#22C55E", icon: <Banknote size={16} />, abbr: "💵" },
    card: { label: "Card", color: "#3B82F6", icon: <CreditCard size={16} />, abbr: "💳" },
    khqr: { label: "KHQR", color: "#6366F1", icon: <QrCode size={16} />, abbr: "📱" },
    aba: { label: "ABA Pay", color: "#003D6B", icon: <Smartphone size={16} />, abbr: "ABA" },
    wing: { label: "Wing", color: "#F7941D", icon: <Smartphone size={16} />, abbr: "W" },
    bakong: { label: "Bakong", color: "#0066B3", icon: <Smartphone size={16} />, abbr: "BK" },
    pipay: { label: "Pi Pay", color: "#E31E25", icon: <Smartphone size={16} />, abbr: "Pi" },
    truemoney: { label: "True Money", color: "#FF6600", icon: <Smartphone size={16} />, abbr: "TM" },
    acleda: { label: "ACLEDA", color: "#00529B", icon: <Smartphone size={16} />, abbr: "AC" },
};

const mockHistory: PaymentRecord[] = [
    { id: 1, orderNumber: "ORD-0041", total: 25.50, splits: [{ id: 1, method: "cash", amount: 15 }, { id: 2, method: "aba", amount: 10.50 }], date: "2026-03-04 14:30", status: "completed" },
    { id: 2, orderNumber: "ORD-0040", total: 18.00, splits: [{ id: 1, method: "card", amount: 18 }], date: "2026-03-04 13:15", status: "completed" },
    { id: 3, orderNumber: "ORD-0039", total: 42.00, splits: [{ id: 1, method: "cash", amount: 20 }, { id: 2, method: "khqr", amount: 12 }, { id: 3, method: "wing", amount: 10 }], date: "2026-03-04 12:00", status: "completed" },
    { id: 4, orderNumber: "ORD-0038", total: 15.75, splits: [{ id: 1, method: "bakong", amount: 15.75 }], date: "2026-03-04 11:30", status: "completed" },
    { id: 5, orderNumber: "ORD-0037", total: 33.00, splits: [{ id: 1, method: "cash", amount: 20 }, { id: 2, method: "card", amount: 13 }], date: "2026-03-04 10:45", status: "refunded" },
];

let nextSplitId = 100;

export function MultiPayment() {
    const { lang, fontClass } = useTranslation();
    const { formatPrice } = useCurrency();
    const [view, setView] = useState<"overview" | "create">("overview");
    const [splits, setSplits] = useState<PaymentSplit[]>([
        { id: 1, method: "cash", amount: 0 },
    ]);
    const [orderTotal] = useState(25.50);

    const totalAssigned = splits.reduce((s, sp) => s + sp.amount, 0);
    const remaining = orderTotal - totalAssigned;

    const handleAddSplit = () => {
        const usedMethods = splits.map((s) => s.method);
        const available = (Object.keys(methodConfig) as PayMethod[]).find((m) => !usedMethods.includes(m)) || "cash";
        setSplits([...splits, { id: nextSplitId++, method: available, amount: 0 }]);
    };

    const handleRemoveSplit = (id: number) => {
        if (splits.length <= 1) return;
        setSplits(splits.filter((s) => s.id !== id));
    };

    const handleUpdateSplit = (id: number, field: "method" | "amount", value: PayMethod | number) => {
        setSplits(splits.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleAutoFill = (id: number) => {
        const otherTotal = splits.filter((s) => s.id !== id).reduce((s, sp) => s + sp.amount, 0);
        const auto = Math.max(0, orderTotal - otherTotal);
        setSplits(splits.map((s) => (s.id === id ? { ...s, amount: parseFloat(auto.toFixed(2)) } : s)));
    };

    // Payment method breakdown for overview
    const methodBreakdown = mockHistory.reduce((acc, record) => {
        record.splits.forEach((split) => {
            acc[split.method] = (acc[split.method] || 0) + split.amount;
        });
        return acc;
    }, {} as Record<string, number>);

    const totalRevenue = Object.values(methodBreakdown).reduce((s, v) => s + v, 0);

    return (
        <div className={`p-6 ${fontClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                        {lang === "km" ? "ការទូទាត់ច្រើនវិធី" : "Multi-Payment"}
                    </h2>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
                        {lang === "km" ? "បំបែកការទូទាត់ជាមួយវិធីច្រើន" : "Split payments across multiple methods"}
                    </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <button
                        onClick={() => setView("overview")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${view === "overview" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
                        style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                        {lang === "km" ? "ទិដ្ឋភាពទូទៅ" : "Overview"}
                    </button>
                    <button
                        onClick={() => setView("create")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${view === "create" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
                        style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                        {lang === "km" ? "បង្កើតថ្មី" : "New Split"}
                    </button>
                </div>
            </div>

            {view === "overview" ? (
                <>
                    {/* Payment Method Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                        {(Object.entries(methodBreakdown) as [PayMethod, number][])
                            .sort(([, a], [, b]) => b - a)
                            .map(([method, amount]) => {
                                const config = methodConfig[method];
                                if (!config) return null;
                                return (
                                    <div key={method} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: config.color }}>
                                                {config.icon}
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "11px", fontWeight: 500 }}>{config.label}</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{formatPrice(amount)}</p>
                                        <p className="text-gray-400" style={{ fontSize: "10px" }}>
                                            {((amount / totalRevenue) * 100).toFixed(1)}% {lang === "km" ? "នៃសរុប" : "of total"}
                                        </p>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: lang === "km" ? "ប្រាក់ចំណូលសរុប" : "Total Revenue", value: formatPrice(totalRevenue), icon: <DollarSign size={18} />, color: "#22C55E" },
                            { label: lang === "km" ? "ការបំបែកប្រចាំថ្ងៃ" : "Split Payments Today", value: "3", icon: <PieChart size={18} />, color: "#3B82F6" },
                            { label: lang === "km" ? "មធ្យមក្នុង ១ វិក្កយបត្រ" : "Avg Per Bill", value: formatPrice(totalRevenue / mockHistory.length), icon: <TrendingUp size={18} />, color: "#A855F7" },
                            { label: lang === "km" ? "វិធីបង់ប្រាក់ច្រើនបំផុត" : "Most Used Method", value: "Cash", icon: <Banknote size={18} />, color: "#F59E0B" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{stat.value}</p>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent History */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                {lang === "km" ? "ប្រវត្តិការទូទាត់" : "Payment History"}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {mockHistory.map((record) => (
                                <div key={record.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                        <Receipt size={18} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>{record.orderNumber}</p>
                                            <span className={`px-1.5 py-0.5 rounded text-white ${record.status === "completed" ? "bg-green-500" : record.status === "refunded" ? "bg-red-500" : "bg-amber-500"}`} style={{ fontSize: "9px", fontWeight: 600 }}>
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {record.splits.map((split, i) => (
                                                <span key={i} className="flex items-center gap-0.5">
                                                    <span className="w-4 h-4 rounded flex items-center justify-center text-white" style={{ backgroundColor: methodConfig[split.method]?.color || "#999", fontSize: "7px", fontWeight: 700 }}>
                                                        {methodConfig[split.method]?.abbr.charAt(0) || "?"}
                                                    </span>
                                                    <span className="text-gray-500" style={{ fontSize: "10px" }}>{formatPrice(split.amount)}</span>
                                                    {i < record.splits.length - 1 && <span className="text-gray-300 mx-0.5">+</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 700 }}>{formatPrice(record.total)}</p>
                                        <p className="text-gray-400" style={{ fontSize: "10px" }}>{record.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                /* Create Multi-payment */
                <div className="max-w-xl mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {/* Order Total */}
                        <div className="bg-gradient-to-r from-[#22C55E] to-emerald-600 p-5 text-white text-center">
                            <p style={{ fontSize: "12px", fontWeight: 500, opacity: 0.8 }}>{lang === "km" ? "សរុបការបញ្ជាទិញ" : "Order Total"}</p>
                            <p style={{ fontSize: "32px", fontWeight: 700 }}>{formatPrice(orderTotal)}</p>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Split items */}
                            {splits.map((split, index) => (
                                <div key={split.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-gray-500" style={{ fontSize: "11px", fontWeight: 600 }}>
                                            {lang === "km" ? `ការទូទាត់ ${index + 1}` : `Payment ${index + 1}`}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleAutoFill(split.id)}
                                                className="px-2 py-1 text-[#22C55E] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                                style={{ fontSize: "10px", fontWeight: 600 }}
                                            >
                                                {lang === "km" ? "បំពេញស្វ័យប្រវត្តិ" : "Auto-fill"}
                                            </button>
                                            {splits.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveSplit(split.id)}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Method selection */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {(Object.keys(methodConfig) as PayMethod[]).map((method) => {
                                            const config = methodConfig[method];
                                            return (
                                                <button
                                                    key={method}
                                                    onClick={() => handleUpdateSplit(split.id, "method", method)}
                                                    className={`px-2.5 py-1.5 rounded-lg border-2 transition-all flex items-center gap-1.5 ${split.method === method
                                                            ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20"
                                                            : "border-transparent bg-white dark:bg-gray-700"
                                                        }`}
                                                    style={{ fontSize: "11px", fontWeight: 500 }}
                                                >
                                                    <div className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ backgroundColor: config.color, fontSize: "7px", fontWeight: 700 }}>
                                                        {config.icon}
                                                    </div>
                                                    <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">{config.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Amount */}
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: "16px", fontWeight: 600 }}>$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={split.amount || ""}
                                            onChange={(e) => handleUpdateSplit(split.id, "amount", parseFloat(e.target.value) || 0)}
                                            className="w-full pl-7 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white"
                                            style={{ fontSize: "18px", fontWeight: 700 }}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Add payment */}
                            <button
                                onClick={handleAddSplit}
                                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-[#22C55E] hover:border-[#22C55E] transition-all flex items-center justify-center gap-2"
                                style={{ fontSize: "13px", fontWeight: 500 }}
                            >
                                <Plus size={16} />
                                {lang === "km" ? "បន្ថែមវិធីទូទាត់" : "Add Payment Method"}
                            </button>

                            {/* Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500" style={{ fontSize: "12px" }}>{lang === "km" ? "សរុប" : "Total"}</span>
                                    <span className="text-gray-900 dark:text-white" style={{ fontSize: "12px", fontWeight: 600 }}>{formatPrice(orderTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500" style={{ fontSize: "12px" }}>{lang === "km" ? "បានបែងចែក" : "Assigned"}</span>
                                    <span className="text-[#22C55E]" style={{ fontSize: "12px", fontWeight: 600 }}>{formatPrice(totalAssigned)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                                    <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 600 }}>{lang === "km" ? "នៅសល់" : "Remaining"}</span>
                                    <span className={remaining === 0 ? "text-[#22C55E]" : "text-red-500"} style={{ fontSize: "13px", fontWeight: 700 }}>
                                        {formatPrice(Math.abs(remaining))}
                                    </span>
                                </div>
                            </div>

                            {/* Status indicator */}
                            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${remaining === 0
                                    ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                                    : remaining > 0
                                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                                        : "bg-red-50 dark:bg-red-900/20 text-red-600"
                                }`}>
                                {remaining === 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                <span style={{ fontSize: "12px", fontWeight: 500 }}>
                                    {remaining === 0
                                        ? (lang === "km" ? "ត្រៀមរួចរាល់សម្រាប់បញ្ជាក់" : "Ready to confirm payment")
                                        : remaining > 0
                                            ? (lang === "km" ? `នៅខ្វះ ${formatPrice(remaining)}` : `${formatPrice(remaining)} remaining`)
                                            : (lang === "km" ? `លើសពី ${formatPrice(Math.abs(remaining))}` : `${formatPrice(Math.abs(remaining))} overpaid`)}
                                </span>
                            </div>

                            {/* Confirm button */}
                            <button
                                disabled={remaining !== 0}
                                className="w-full py-3.5 bg-[#22C55E] text-white rounded-2xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-green-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ fontSize: "15px", fontWeight: 700 }}
                            >
                                <CheckCircle size={18} />
                                {lang === "km" ? "បញ្ជាក់ការទូទាត់" : "Confirm Multi-Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
