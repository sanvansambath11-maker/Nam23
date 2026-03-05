import { useState } from "react";
import { Minus, Plus, Trash2, X, Split, FileText, UtensilsCrossed, ShoppingBag, Truck, Ban } from "lucide-react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  modifications?: string[];
}

type OrderType = "dineIn" | "takeaway" | "delivery";

interface OrderSidebarProps {
  items: OrderItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onPay: () => void;
  onSplitBill: () => void;
  onReceipt: () => void;
  onCancelOrder?: () => void;
}

export function OrderSidebar({ items, onUpdateQuantity, onRemoveItem, onPay, onSplitBill, onReceipt, onCancelOrder }: OrderSidebarProps) {
  const { t, fontClass } = useTranslation();
  const { formatPrice, formatDual } = useCurrency();
  const [orderType, setOrderType] = useState<OrderType>("dineIn");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.10; // Cambodia VAT 10%
  const discount = subtotal * 0.05;
  const total = subtotal + vat - discount;
  const dual = formatDual(total);

  const orderTypeConfig: { key: OrderType; icon: React.ReactNode; color: string }[] = [
    { key: "dineIn", icon: <UtensilsCrossed size={13} />, color: "#3B82F6" },
    { key: "takeaway", icon: <ShoppingBag size={13} />, color: "#F59E0B" },
    { key: "delivery", icon: <Truck size={13} />, color: "#22C55E" },
  ];

  return (
    <div className={`w-full lg:w-[340px] xl:w-[360px] glass-sidebar rounded-2xl shadow-sm flex flex-col h-full ${fontClass}`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 700 }}>{t("orderDetails")}</h3>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>#4821</span>
        </div>

        {/* Order Type Selector */}
        <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
          {orderTypeConfig.map((ot) => (
            <button
              key={ot.key}
              onClick={() => setOrderType(ot.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${orderType === ot.key
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
                }`}
              style={{ fontSize: "11px", fontWeight: orderType === ot.key ? 600 : 500 }}
            >
              <span style={{ color: orderType === ot.key ? ot.color : undefined }}>{ot.icon}</span>
              <span className={orderType === ot.key ? "text-gray-800 dark:text-gray-200" : ""}>
                {t(ot.key)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white" style={{ fontSize: "10px", fontWeight: 600 }}>SM</span>
          </div>
          <span className="text-gray-600 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>Sarah Mitchell</span>
          <span className="ml-auto px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-md" style={{ fontSize: "11px", fontWeight: 500 }}>
            {t(orderType)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 premium-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <Trash2 size={24} />
            </div>
            <p style={{ fontSize: "13px", fontWeight: 500 }}>{t("noItems")}</p>
            <p style={{ fontSize: "11px" }} className="text-gray-400 mt-1">{t("addFromMenu")}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div
                className="w-8 h-8 gradient-primary-soft rounded-lg flex items-center justify-center shrink-0"
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                {item.quantity}X
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 dark:text-gray-200 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{item.name}</p>
                {item.modifications && item.modifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.modifications.map((mod) => (
                      <span key={mod} className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-gray-800 dark:text-gray-200" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Minus size={10} className="text-gray-500" />
                  </button>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Plus size={10} className="text-gray-500" />
                  </button>
                  <button onClick={() => onRemoveItem(item.id)} className="w-5 h-5 rounded-md bg-red-50 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-100">
                    <X size={10} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-400" style={{ fontSize: "13px" }}>{t("subtotal")}</span>
            <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400" style={{ fontSize: "13px" }}>{t("vat")} (10%)</span>
            <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>{formatPrice(vat)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400" style={{ fontSize: "13px" }}>{t("discount")} (5%)</span>
            <span className="text-[#22C55E]" style={{ fontSize: "13px", fontWeight: 500 }}>-{formatPrice(discount)}</span>
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
          <div className="flex justify-between items-end">
            <div>
              <span className="text-gray-900 dark:text-white block" style={{ fontSize: "15px", fontWeight: 700 }}>{t("total")}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-900 dark:text-white block" style={{ fontSize: "15px", fontWeight: 700 }}>{formatPrice(total)}</span>
              <span className="text-gray-400" style={{ fontSize: "10px" }}>{dual.usd} / {dual.khr}</span>
            </div>
          </div>
        </div>

        {/* Exchange rate info */}
        <div className="flex items-center justify-center gap-1 mb-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-blue-500" style={{ fontSize: "10px", fontWeight: 500 }}>
            {t("exchangeRate")}: $1 = 4,100\u17DB
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={onSplitBill} className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Split size={14} />
            {t("splitBill")}
          </button>
          <button onClick={onReceipt} className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ fontSize: "12px", fontWeight: 500 }}>
            <FileText size={14} />
            {t("receipt")}
          </button>
        </div>

        <button
          onClick={onPay}
          disabled={items.length === 0}
          className="w-full py-3.5 gradient-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-green-200 dark:shadow-green-900 press-effect gradient-glow disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: "15px", fontWeight: 700 }}
        >
          {t("pay")} {formatPrice(total)}
        </button>

        {/* Cancel Order */}
        {items.length > 0 && onCancelOrder && (
          <button
            onClick={onCancelOrder}
            className="w-full mt-2 py-2.5 border-2 border-red-200 dark:border-red-800 text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 press-effect"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <Ban size={15} />
            {t("cancelOrder") || "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
}