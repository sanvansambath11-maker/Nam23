import { CheckCircle, Clock, XCircle, Ban } from "lucide-react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { getLocalOrders } from "../../lib/local-orders";
import { InvoiceModal } from "./invoice-modal";

const platformColors: Record<string, string> = {
  grab: "#00B14F",
  foodpanda: "#D70F64",
};

export function HistoryView() {
  const { t, lang, fontClass } = useTranslation();
  const { formatPrice, formatDual } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const load = () => {
      const all = getLocalOrders(200);
      setOrders(all);
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={`p-6 ${fontClass}`}>
      <h2 className="text-gray-900 dark:text-white mb-6" style={{ fontSize: "20px", fontWeight: 700 }}>{t("orderHistory")}</h2>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-50 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
          {["Order", t("date"), lang === "km" ? "វិធីបង់" : "Method", lang === "km" ? "មុខម្ហូប" : "Items", t("items"), t("total"), "Status"].map((h) => (
            <span key={h} className="text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>{h}</span>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock size={24} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 500 }}>{lang === "km" ? "មិនទាន់មានប្រវត្តិបញ្ជាទេ" : "No order history yet"}</p>
            <p style={{ fontSize: "12px" }} className="mt-1">{lang === "km" ? "បញ្ជាថ្មីនឹងបង្ហាញនៅទីនេះ" : "New orders will appear here"}</p>
          </div>
        ) : (
          orders.map((order, i) => {
            const dual = formatDual(order.total);
            const isCancelled = order.status === "cancelled";
            const itemNames = order.items?.map((it: any) => it.name).join(", ") || "-";
            const itemCount = order.items?.reduce((s: number, it: any) => s + (it.qty || 1), 0) || 0;
            const created = new Date(order.created_at);

            return (
              <motion.div
                key={order.id || i}
                onClick={() => setSelectedOrder(order)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-7 gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer items-center ${isCancelled ? "opacity-60" : ""}`}
              >
                <span className="text-gray-800 dark:text-gray-200" style={{ fontSize: "13px", fontWeight: 600 }}>
                  #{order.order_number}
                </span>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block" style={{ fontSize: "12px" }}>
                    {created.toLocaleDateString()}
                  </span>
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>
                    {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 dark:text-gray-400 capitalize" style={{ fontSize: "13px" }}>
                    {order.payment_method || "cash"}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>
                  {itemNames}
                </span>
                <span className="text-gray-500" style={{ fontSize: "13px" }}>{itemCount} {t("items")}</span>
                <div>
                  <span className={`block ${isCancelled ? "line-through text-red-400" : "text-gray-900 dark:text-white"}`} style={{ fontSize: "13px", fontWeight: 600 }}>
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-gray-400" style={{ fontSize: "9px" }}>{dual.khr}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isCancelled ? (
                    <span className="flex items-center gap-1 text-red-400" style={{ fontSize: "12px", fontWeight: 500 }}>
                      <XCircle size={14} />
                      {lang === "km" ? "បោះបង់" : "Cancelled"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#22C55E]" style={{ fontSize: "12px", fontWeight: 500 }}>
                      <CheckCircle size={14} />
                      {t("completed")}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {selectedOrder && (
        <InvoiceModal
          items={selectedOrder.items?.map((it: any) => ({
            name: it.name,
            price: it.price,
            quantity: it.qty,
            modifications: it.mods
          })) || []}
          paymentMethod={selectedOrder.payment_method}
          onClose={() => setSelectedOrder(null)}
          orderNumber={selectedOrder.order_number}
          orderDate={selectedOrder.created_at}
          overrideSubtotal={selectedOrder.subtotal}
          overrideVat={selectedOrder.vat}
          overrideDiscount={selectedOrder.discount}
          overrideTotal={selectedOrder.total}
        />
      )}
    </div>
  );
}
