import { X, TrendingUp, DollarSign, ShoppingBag, Users, CreditCard, Banknote, QrCode, Star } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getLocalOrdersToday } from "../../lib/local-orders";

interface DailySummaryModalProps {
  onClose: () => void;
}

export function DailySummaryModal({ onClose }: DailySummaryModalProps) {
  const { t, lang, fontClass } = useTranslation();
  const { formatPrice } = useCurrency();

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  // Build all summary data from local orders
  const { totalRevenue, totalOrders, totalCustomers, avgOrder, hourlyData, topItems, paymentBreakdown } = useMemo(() => {
    const orders = getLocalOrdersToday();
    const rev = orders.reduce((s, o) => s + o.total, 0);
    const cnt = orders.length;
    const custs = new Set(orders.map(o => o.customer_name || "walk-in")).size;

    // Hourly chart
    const hourLabels = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"];
    const hMap: Record<string, { orders: number; revenue: number }> = {};
    hourLabels.forEach(h => { hMap[h] = { orders: 0, revenue: 0 }; });
    orders.forEach(o => {
      const hr = new Date(o.created_at).getHours();
      if (hr >= 9 && hr <= 21) {
        const idx = hr - 9;
        if (idx < hourLabels.length) {
          hMap[hourLabels[idx]].orders += 1;
          hMap[hourLabels[idx]].revenue += o.total;
        }
      }
    });
    const hData = hourLabels.map(h => ({ hour: h, orders: hMap[h].orders, revenue: hMap[h].revenue }));

    // Top items
    const iMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(itm => {
        if (!iMap[itm.name]) iMap[itm.name] = { name: itm.name, qty: 0, revenue: 0 };
        iMap[itm.name].qty += itm.qty;
        iMap[itm.name].revenue += itm.qty * itm.price;
      });
    });
    const tItems = Object.values(iMap).sort((a, b) => b.qty - a.qty).slice(0, 5).map(i => ({ ...i, nameKm: i.name }));

    // Payment breakdown
    const pMap: Record<string, number> = {};
    orders.forEach(o => {
      const m = o.payment_method || "cash";
      pMap[m] = (pMap[m] || 0) + o.total;
    });
    const pBreak = [
      { method: "cash", label: "Cash", labelKm: "សាច់ប្រាក់", amount: pMap["cash"] || 0, pct: 0, color: "#22C55E" },
      { method: "khqr", label: "KHQR", labelKm: "KHQR", amount: (pMap["khqr"] || 0) + (pMap["aba"] || 0) + (pMap["acleda"] || 0) + (pMap["wing"] || 0) + (pMap["pipay"] || 0) + (pMap["truemoney"] || 0) + (pMap["bakong"] || 0), pct: 0, color: "#3B82F6" },
      { method: "card", label: "Card", labelKm: "កាត", amount: pMap["card"] || 0, pct: 0, color: "#A855F7" },
    ];
    pBreak.forEach(p => { p.pct = rev > 0 ? Math.round((p.amount / rev) * 100) : 0; });

    return {
      totalRevenue: rev,
      totalOrders: cnt,
      totalCustomers: custs,
      avgOrder: cnt > 0 ? rev / cnt : 0,
      hourlyData: hData,
      topItems: tItems,
      paymentBreakdown: pBreak,
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${fontClass}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
              {lang === "km" ? "\u179F\u1793\u17D2\u179A\u17BB\u1794\u179B\u1780\u17CB\u1794\u17D2\u179A\u1785\u17B6\u17C6\u1790\u17D2\u1784\u17C3" : "Daily Sales Summary"}
            </h2>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>{dateStr}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: lang === "km" ? "\u1785\u17C6\u178E\u17BC\u179B\u179F\u179A\u17BB\u1794" : "Total Revenue", value: formatPrice(totalRevenue), change: "+12%", icon: <DollarSign size={18} />, color: "#22C55E" },
              { label: t("orders"), value: String(totalOrders), change: "+8%", icon: <ShoppingBag size={18} />, color: "#3B82F6" },
              { label: t("customers"), value: String(totalCustomers), change: "+15%", icon: <Users size={18} />, color: "#A855F7" },
              { label: t("avgOrder"), value: formatPrice(avgOrder), change: "+3%", icon: <TrendingUp size={18} />, color: "#F59E0B" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <span className="text-[#22C55E] px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 rounded-md" style={{ fontSize: "10px", fontWeight: 600 }}>{stat.change}</span>
                </div>
                <p className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{stat.value}</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Peak Hours Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-gray-700 dark:text-gray-200 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
              {lang === "km" ? "\u1798\u17C9\u17C4\u1784\u1780\u17C6\u1796\u17BC\u179B" : "Peak Hours"}
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => [`${value}`, "Orders"]} />
                <Bar dataKey="orders" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-200 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                {t("paymentMethod")}
              </p>
              <div className="space-y-3">
                {paymentBreakdown.map((pm) => (
                  <div key={pm.method}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pm.color}15`, color: pm.color }}>
                          {pm.method === "cash" ? <Banknote size={16} /> : pm.method === "khqr" ? <QrCode size={16} /> : <CreditCard size={16} />}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "12px", fontWeight: 500 }}>
                          {lang === "km" ? pm.labelKm : pm.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-800 dark:text-gray-200" style={{ fontSize: "13px", fontWeight: 600 }}>{formatPrice(pm.amount)}</span>
                        <span className="text-gray-400 ml-1" style={{ fontSize: "10px" }}>({pm.pct}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pm.pct}%` }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: pm.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-200 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                {lang === "km" ? "\u1798\u17C9\u17BA\u1793\u17BB\u1799\u179B\u1780\u17CB\u1785\u17D2\u179A\u17BE\u1793\u1794\u17C6\u1795\u17BB\u178F" : "Top Selling Items"}
              </p>
              <div className="space-y-2.5">
                {topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-gray-300"
                      }`} style={{ fontSize: "10px", fontWeight: 700 }}>
                      {i < 3 ? <Star size={12} className="fill-current" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-300 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>
                        {lang === "km" ? item.nameKm : item.name}
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>{item.qty} {lang === "km" ? "\u1781\u17D2\u1793\u17B6\u178F" : "sold"}</p>
                    </div>
                    <span className="text-[#22C55E] shrink-0" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {formatPrice(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <p style={{ fontSize: "10px" }}>POS Batto &bull; {dateStr} &bull; TIN: K001-2024-00458</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              {t("close")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
