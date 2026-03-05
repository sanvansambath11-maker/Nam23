import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";
import { getLocalOrders, getLocalDashboardStats } from "../../lib/local-orders";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const categoryColors = ["#22C55E", "#3B82F6", "#F59E0B", "#A855F7", "#EF4444", "#06B6D4", "#EC4899"];

export function AnalyticsView() {
  const { t, lang, fontClass } = useTranslation();
  const { formatPrice } = useCurrency();
  const [period, setPeriod] = useState("weekly");
  const [, setTick] = useState(0);

  // Auto refresh every 5 seconds
  useEffect(() => {
    const iv = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  const { stats, dailyData, categoryData } = useMemo(() => {
    const localStats = getLocalDashboardStats();
    const allOrders = getLocalOrders(500);

    // Stats cards
    const todayRevenue = localStats.todayRevenue;
    const todayOrders = localStats.todayOrders;
    const totalCustomers = localStats.totalCustomers;
    const avgOrder = localStats.avgOrder;

    const orderChange = todayOrders > 0 ? `${todayOrders} orders` : "0%";

    const computedStats = [
      { key: "revenue", value: formatPrice(todayRevenue), change: orderChange, icon: <DollarSign size={20} />, color: "#22C55E" },
      { key: "orders", value: String(todayOrders), change: todayOrders > 0 ? "Active" : "0%", icon: <ShoppingBag size={20} />, color: "#3B82F6" },
      { key: "customers", value: String(totalCustomers), change: "0%", icon: <Users size={20} />, color: "#A855F7" },
      { key: "avgOrder", value: formatPrice(avgOrder), change: avgOrder > 0 ? "Active" : "0%", icon: <TrendingUp size={20} />, color: "#F59E0B" },
    ];

    // Weekly bar chart
    const weeklyMap: Record<string, { revenue: number; orders: number }> = {};
    dayNames.forEach(d => { weeklyMap[d] = { revenue: 0, orders: 0 }; });
    const now = new Date();
    allOrders.forEach(order => {
      if (order.status === "cancelled") return;
      const orderDate = new Date(order.created_at);
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / 86400000);
      if (daysDiff < 7) {
        const dayName = dayNames[orderDate.getDay()];
        weeklyMap[dayName].revenue += Number(order.total);
        weeklyMap[dayName].orders += 1;
      }
    });
    const dData = dayNames.slice(1).concat(dayNames[0]).map(day => ({
      name: day,
      revenue: Math.round(weeklyMap[day].revenue * 100) / 100,
      orders: weeklyMap[day].orders,
    }));

    // Category pie chart (from item names - group by simple category)
    const catMap: Record<string, number> = {};
    allOrders.forEach(order => {
      if (order.status === "cancelled") return;
      order.items.forEach(itm => {
        const cat = itm.name;
        catMap[cat] = (catMap[cat] || 0) + itm.qty * itm.price;
      });
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const totalCatValue = sortedCats.reduce((s, [, v]) => s + v, 0);
    const cData = sortedCats.map(([name, value], i) => ({
      name,
      value: totalCatValue > 0 ? Math.round((value / totalCatValue) * 100) : 0,
      color: categoryColors[i % categoryColors.length],
    }));

    return { stats: computedStats, dailyData: dData, categoryData: cData };
  }, [formatPrice, period]);

  return (
    <div className={`p-6 ${fontClass}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{t("salesAnalytics")}</h2>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {["daily", "weekly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md transition-all ${period === p ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"
                }`}
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.key} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-50 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <span className="text-gray-400 px-2 py-0.5 bg-gray-50 dark:bg-gray-700 rounded-md" style={{ fontSize: "11px", fontWeight: 600 }}>{stat.change}</span>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>{t(stat.key)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-50 dark:border-gray-700">
          <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>{t("revenue")} (USD)</p>
          {dailyData.every(d => d.revenue === 0) ? (
            <div className="flex items-center justify-center h-[250px] text-gray-400" style={{ fontSize: "13px" }}>
              {lang === "km" ? "មិនទាន់មានទិន្នន័យនៅឡើយទេ" : "No data yet — make a sale to see analytics"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-50 dark:border-gray-700">
          <p className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>{t("categories")}</p>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-400" style={{ fontSize: "13px" }}>
              {lang === "km" ? "មិនទាន់មានទិន្នន័យ" : "No data yet"}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-600 dark:text-gray-400 flex-1 truncate" style={{ fontSize: "11px" }}>{c.name}</span>
                    <span className="text-gray-800 dark:text-gray-200" style={{ fontSize: "11px", fontWeight: 600 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
