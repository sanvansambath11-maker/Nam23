import { X, Printer } from "lucide-react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { motion } from "motion/react";
import type { OrderItem } from "./order-sidebar";

interface ReceiptModalProps {
  items: OrderItem[];
  onClose: () => void;
}

export function ReceiptModal({ items, onClose }: ReceiptModalProps) {
  const { t, fontClass } = useTranslation();
  const { formatPrice, formatDual } = useCurrency();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = subtotal * 0.10;
  const discount = subtotal * 0.05;
  const total = subtotal + vat - discount;
  const dual = formatDual(total);

  // DD/MM/YYYY format
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto ${fontClass}`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{t("receipt")}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-white" style={{ fontSize: "14px", fontWeight: 700 }}>K</span>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 700 }}>POS Batto</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>Phnom Penh, Cambodia</p>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>{t("phone")}: +855 23 123 456</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>
              {t("tin")}: K001-2024-00458
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-gray-500" style={{ fontSize: "10px" }}>{t("date")}: {dateStr}</span>
              <span className="text-gray-500" style={{ fontSize: "10px" }}>{t("time")}: {timeStr}</span>
            </div>
            <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>#4821 | Table T6</p>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px" }}>
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-700 dark:text-gray-300 shrink-0" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 mb-4 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400" style={{ fontSize: "12px" }}>{t("subtotal")}</span>
              <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "12px" }}>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400" style={{ fontSize: "12px" }}>{t("vat")} (10%)</span>
              <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "12px" }}>{formatPrice(vat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400" style={{ fontSize: "12px" }}>{t("discount")} (5%)</span>
              <span className="text-[#22C55E]" style={{ fontSize: "12px" }}>-{formatPrice(discount)}</span>
            </div>
          </div>

          {/* Total with dual currency */}
          <div className="mb-4 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <span className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 700 }}>{t("total")}</span>
              <div className="text-right">
                <p className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 700 }}>{dual.usd}</p>
                <p className="text-[#22C55E]" style={{ fontSize: "13px", fontWeight: 600 }}>{dual.khr}</p>
              </div>
            </div>
            <p className="text-gray-400 text-center mt-2" style={{ fontSize: "9px" }}>
              {t("exchangeRate")}: $1 = 4,100៛
            </p>
          </div>

          <p className="text-center text-gray-400 mb-4" style={{ fontSize: "12px" }}>{t("thankYou")}</p>

          <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Printer size={16} />
            {t("printReceipt")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}