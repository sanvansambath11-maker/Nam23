import { ChefHat, CheckSquare } from "lucide-react";
import { useTranslation } from "./translation-context";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { getLocalOrders, LocalOrder, updateLocalOrderStatus } from "../../lib/local-orders";

interface KitchenViewProps {
  onExit?: () => void;
}

export function KitchenView({ onExit }: KitchenViewProps) {
  const { lang } = useTranslation();
  const [activeOrders, setActiveOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    const checkOrders = () => {
      const allOrders = getLocalOrders(50);
      // We only want 'new', 'cooking', or maybe just everything not cancelled/served
      const kdsOrders = allOrders.filter(
        (o) => o.status !== "cancelled" && o.status !== "served" && o.status !== "completed"
      );
      setActiveOrders(kdsOrders);
    };

    checkOrders();
    // Auto sync every few seconds
    const iv = setInterval(checkOrders, 3000);
    return () => clearInterval(iv);
  }, []);

  const handleBumpOrder = (id: number) => {
    updateLocalOrderStatus(id, "completed");
    setActiveOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F1523] flex flex-col font-sans">
      {/* Header */}
      <div className="h-16 bg-[#0B101A] border-b border-gray-800/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center text-green-500">
            <ChefHat size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold leading-tight">Kitchen Display</h1>
            <p className="text-gray-400 text-xs font-medium">Live order fulfillment</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-gray-300 text-sm font-medium">Auto-syncing</span>
          </div>
          <button
            onClick={onExit}
            className="px-5 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Exit KDS
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-slate-600 mb-2">
                <CheckSquare size={64} strokeWidth={1.5} />
              </div>
              <h2 className="text-slate-300 text-2xl font-bold tracking-wide">
                Kitchen is clear!
              </h2>
              <p className="text-slate-500 text-base">
                Waiting for new orders...
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeOrders.map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={order.id}
                className="bg-[#1E293B] rounded-xl border border-gray-700/50 overflow-hidden flex flex-col"
              >
                <div className="bg-[#0B101A] px-4 py-3 flex items-center justify-between border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-bold">
                      {order.table_number ? `T${order.table_number}` : order.payment_method.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">#{order.order_number}</span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="p-4 flex-1 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-white">
                      <div className="flex gap-2">
                        <span className="text-slate-400 font-bold">{item.qty}x</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-lg">{item.name}</span>
                          {item.mods && item.mods.length > 0 && (
                            <span className="text-red-400 text-sm">{item.mods.join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#0F172A] border-t border-gray-800">
                  <button
                    onClick={() => handleBumpOrder(order.id)}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckSquare size={18} />
                    Bump Order
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}