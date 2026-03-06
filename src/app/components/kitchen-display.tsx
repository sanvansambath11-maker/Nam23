import { useState, useEffect } from "react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { Clock, CheckCircle, ChefHat, AlertCircle } from "lucide-react";
import { getLocalOrders, updateLocalOrderStatus } from "../../lib/local-orders";

interface OrderItem {
    id: number;
    name: string;
    qty: number;
    notes?: string;
}

interface KitchenOrder {
    id: number;
    order_number: string;
    table_number: string | null;
    status: "pending" | "preparing" | "ready" | "served" | "cancelled";
    created_at: string;
    items: OrderItem[];
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    return `${mins}m ago`;
}

export function KitchenDisplaySystem({ onBack }: { onBack: () => void }) {
    const { lang, fontClass } = useTranslation();
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [now, setNow] = useState(Date.now());

    const fetchOrders = () => {
        const freshOrders = getLocalOrders(50) as unknown as KitchenOrder[];
        // Only show uncompleted orders for the kitchen
        const activeOrders = freshOrders.filter(o => o.status === "pending" || o.status === "preparing" || o.status === "ready");
        // Sort oldest first (FIFO)
        activeOrders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setOrders(activeOrders);
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Check for new orders every 5s
        const clockInterval = setInterval(() => setNow(Date.now()), 60000); // Update timers every minute
        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    }, []);

    const handleStatusChange = (orderId: number, currentStatus: string) => {
        let newStatus = "preparing";
        if (currentStatus === "pending") newStatus = "preparing";
        else if (currentStatus === "preparing") newStatus = "ready";
        else if (currentStatus === "ready") newStatus = "served";

        updateLocalOrderStatus(orderId, newStatus);
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        if (status === "pending") return "bg-red-500 text-white";
        if (status === "preparing") return "bg-yellow-500 text-white";
        if (status === "ready") return "bg-green-500 text-white";
        return "bg-gray-200 text-gray-800";
    };

    const getStatusLabel = (status: string) => {
        if (status === "pending") return lang === "km" ? "រង់ចាំ" : "New Order";
        if (status === "preparing") return lang === "km" ? "កំពុងចម្អិន" : "Cooking";
        if (status === "ready") return lang === "km" ? "រួចរាល់" : "Ready";
        return status;
    };

    return (
        <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${fontClass} overflow-hidden text-white`}>
            {/* Header */}
            <div className="bg-gray-950 border-b border-gray-800 p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <ChefHat size={32} className="text-[#22C55E]" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
                        <p className="text-gray-400 text-sm">Live order fulfillment</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-gray-300 font-medium">Auto-syncing</span>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                    >
                        Exit KDS
                    </button>
                </div>
            </div>

            {/* Main Board */}
            <div className="flex-1 overflow-x-auto p-6 flex gap-6 snap-x pb-8">
                {orders.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center text-gray-500">
                        <CheckCircle size={64} className="mb-4 text-gray-700" />
                        <p className="text-2xl font-semibold">Kitchen is clear!</p>
                        <p className="text-lg mt-2">Waiting for new orders...</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        // Calculate how old the order is to alert if taking too long
                        const minsOld = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
                        const isLate = minsOld > 15 && order.status !== "ready";

                        return (
                            <div
                                key={order.id}
                                className={`snap-center shrink-0 w-[350px] flex flex-col bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 transition-colors ${isLate ? "border-red-500/50" : "border-gray-700"}`}
                            >
                                {/* Ticket Header */}
                                <div className={`p-4 flex items-center justify-between ${getStatusColor(order.status)}`}>
                                    <div>
                                        <h2 className="text-2xl font-bold">#{order.order_number}</h2>
                                        {order.table_number && (
                                            <p className="text-white/90 text-sm font-semibold mt-1">Table {order.table_number}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 font-bold text-lg">
                                            <Clock size={18} />
                                            {timeAgo(order.created_at)}
                                        </div>
                                        <p className="text-white/80 font-medium uppercase text-xs tracking-wider mt-1">
                                            {getStatusLabel(order.status)}
                                        </p>
                                    </div>
                                </div>

                                {isLate && (
                                    <div className="bg-red-500 flex items-center justify-center gap-2 py-1.5 text-xs font-bold uppercase tracking-wide">
                                        <AlertCircle size={14} /> Attention: Waiting over 15m
                                    </div>
                                )}

                                {/* Items List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start p-3 bg-gray-750 rounded-xl border border-gray-700">
                                            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl font-bold">
                                                {item.qty}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <p className="text-lg font-bold text-white leading-tight">{item.name}</p>
                                                {item.notes && (
                                                    <p className="text-yellow-400 mt-2 text-sm font-semibold bg-yellow-400/10 px-2 py-1.5 rounded-md inline-block">
                                                        Note: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-gray-900 border-t border-gray-800">
                                    <button
                                        onClick={() => handleStatusChange(order.id, order.status)}
                                        className={`w-full py-4 rounded-xl text-lg font-bold uppercase tracking-wide transition-transform active:scale-95 ${order.status === "pending"
                                                ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                                                : order.status === "preparing"
                                                    ? "bg-green-500 hover:bg-green-400 text-white"
                                                    : "bg-blue-500 hover:bg-blue-400 text-white"
                                            }`}
                                    >
                                        {order.status === "pending" && (lang === "km" ? "ចុចដើម្បីចម្អិន" : "Start Cooking")}
                                        {order.status === "preparing" && (lang === "km" ? "រួចរាល់ហើយ" : "Mark Ready")}
                                        {order.status === "ready" && (lang === "km" ? "បានបម្រើ" : "Mark as Served")}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
