import { useState } from "react";
import { useTranslation } from "../translation-context";
import {
  Search, Users, Store, CreditCard, TrendingUp, AlertTriangle,
  MoreVertical, Eye, Ban, CheckCircle, Clock, Crown, ArrowUpRight,
  DollarSign, Activity, Filter, ChevronDown,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  plan: "basic" | "pro" | "enterprise";
  status: "active" | "trial" | "expired" | "suspended";
  registeredAt: string;
  trialEnds: string;
  lastActive: string;
  staffCount: number;
  totalOrders: number;
  monthlyRevenue: number;
}

const mockRestaurants: Restaurant[] = [];

const planColors: Record<string, string> = {
  basic: "#6B7280",
  pro: "#22C55E",
  enterprise: "#A855F7",
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string; labelKm: string }> = {
  active: { color: "#22C55E", icon: <CheckCircle size={12} />, label: "Active", labelKm: "សកម្ម" },
  trial: { color: "#3B82F6", icon: <Clock size={12} />, label: "Trial", labelKm: "សាកល្បង" },
  expired: { color: "#F59E0B", icon: <AlertTriangle size={12} />, label: "Expired", labelKm: "ផុតកំណត់" },
  suspended: { color: "#EF4444", icon: <Ban size={12} />, label: "Suspended", labelKm: "ផ្អាក" },
};

export function SuperAdmin() {
  const { lang } = useTranslation();
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const filtered = mockRestaurants.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || r.plan === filterPlan;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalRevenue = mockRestaurants.filter((r) => r.status === "active").reduce((s, r) => s + r.monthlyRevenue, 0);
  const activeCount = mockRestaurants.filter((r) => r.status === "active").length;
  const trialCount = mockRestaurants.filter((r) => r.status === "trial").length;
  const totalOrders = mockRestaurants.reduce((s, r) => s + r.totalOrders, 0);

  const stats = [
    { label: l("Total Restaurants", "ភោជនីយដ្ឋានសរុប"), value: mockRestaurants.length, icon: <Store size={20} />, color: "#22C55E" },
    { label: l("Active", "សកម្ម"), value: activeCount, icon: <CheckCircle size={20} />, color: "#3B82F6" },
    { label: l("On Trial", "សាកល្បង"), value: trialCount, icon: <Clock size={20} />, color: "#F59E0B" },
    { label: l("Monthly Revenue", "ប្រាក់ចំណូលប្រចាំខែ"), value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: "#A855F7" },
    { label: l("Total Orders", "ការបញ្ជាទិញសរុប"), value: totalOrders.toLocaleString(), icon: <TrendingUp size={20} />, color: "#EC4899" },
  ];

  const daysUntilExpiry = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white flex items-center gap-2" style={{ fontSize: "22px", fontWeight: 800 }}>
            <Crown size={22} className="text-[#A855F7]" />
            {l("Super Admin", "អ្នកគ្រប់គ្រងកំពូល")}
          </h1>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>{l("Manage all restaurant customers", "គ្រប់គ្រងអតិថិជនភោជនីយដ្ឋានទាំងអស់")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-[#22C55E] rounded-lg" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Activity size={14} /> {l("System Healthy", "ប្រព័ន្ធដំណើរការល្អ")}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 800 }}>{s.value}</p>
            <p className="text-gray-500" style={{ fontSize: "11px", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={l("Search restaurants, owners...", "ស្វែងរកភោជនីយដ្ឋាន...")}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="relative">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <option value="all">{l("All Plans", "គម្រោងទាំងអស់")}</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <option value="all">{l("All Status", "ស្ថានភាពទាំងអស់")}</option>
            <option value="active">{l("Active", "សកម្ម")}</option>
            <option value="trial">{l("Trial", "សាកល្បង")}</option>
            <option value="expired">{l("Expired", "ផុតកំណត់")}</option>
            <option value="suspended">{l("Suspended", "ផ្អាក")}</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-gray-400 ml-auto" style={{ fontSize: "12px" }}>
          {filtered.length} {l("restaurants", "ភោជនីយដ្ឋាន")}
        </p>
      </div>

      {/* Restaurant Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {[l("Restaurant", "ភោជនីយដ្ឋាន"), l("Plan", "គម្រោង"), l("Status", "ស្ថានភាព"), l("Staff", "បុគ្គលិក"), l("Orders", "បញ្ជា"), l("Revenue", "ប្រាក់ចំណូល"), l("Last Active", "សកម្មចុងក្រោយ"), ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const sc = statusConfig[r.status];
                const trialDays = r.status === "trial" ? daysUntilExpiry(r.trialEnds) : 0;
                return (
                  <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>{r.name}</p>
                        <p className="text-gray-400" style={{ fontSize: "11px" }}>{r.owner} &bull; {r.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-white" style={{ fontSize: "10px", fontWeight: 700, backgroundColor: planColors[r.plan] }}>
                        {r.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ fontSize: "11px", fontWeight: 600, backgroundColor: `${sc.color}15`, color: sc.color }}>
                        {sc.icon} {lang === "km" ? sc.labelKm : sc.label}
                      </span>
                      {r.status === "trial" && trialDays > 0 && (
                        <p className="text-orange-500 mt-0.5" style={{ fontSize: "10px" }}>{trialDays} {l("days left", "ថ្ងៃនៅសល់")}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>
                        <Users size={13} /> {r.staffCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>{r.totalOrders.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {r.monthlyRevenue > 0 ? `$${r.monthlyRevenue.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500" style={{ fontSize: "12px" }}>{new Date(r.lastActive).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button onClick={() => setShowActions(showActions === r.id ? null : r.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        {showActions === r.id && (
                          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                            <button onClick={() => { setSelectedRestaurant(r); setShowActions(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" style={{ fontSize: "12px" }}>
                              <Eye size={14} /> {l("View Details", "មើលព័ត៌មាន")}
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" style={{ fontSize: "12px" }}>
                              <ArrowUpRight size={14} /> {l("Upgrade Plan", "ដំឡើងគម្រោង")}
                            </button>
                            {r.status === "active" ? (
                              <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" style={{ fontSize: "12px" }}>
                                <Ban size={14} /> {l("Suspend", "ផ្អាក")}
                              </button>
                            ) : r.status === "suspended" ? (
                              <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600" style={{ fontSize: "12px" }}>
                                <CheckCircle size={14} /> {l("Reactivate", "ធ្វើឱ្យសកម្មវិញ")}
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRestaurant(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{selectedRestaurant.name}</h3>
              <span className="px-2 py-0.5 rounded-md text-white" style={{ fontSize: "10px", fontWeight: 700, backgroundColor: planColors[selectedRestaurant.plan] }}>
                {selectedRestaurant.plan.toUpperCase()}
              </span>
            </div>
            <div className="space-y-3">
              {[
                [l("Owner", "ម្ចាស់"), selectedRestaurant.owner],
                [l("Phone", "ទូរសព្ទ"), selectedRestaurant.phone],
                [l("Email", "អ៊ីមែល"), selectedRestaurant.email],
                [l("Registered", "ចុះឈ្មោះ"), new Date(selectedRestaurant.registeredAt).toLocaleDateString()],
                [l("Trial Ends", "ផុតសាកល្បង"), new Date(selectedRestaurant.trialEnds).toLocaleDateString()],
                [l("Staff", "បុគ្គលិក"), selectedRestaurant.staffCount],
                [l("Total Orders", "បញ្ជាសរុប"), selectedRestaurant.totalOrders.toLocaleString()],
                [l("Monthly Revenue", "ចំណូលប្រចាំខែ"), `$${selectedRestaurant.monthlyRevenue.toLocaleString()}`],
                [l("Last Active", "សកម្មចុងក្រោយ"), new Date(selectedRestaurant.lastActive).toLocaleDateString()],
              ].map(([label, value], i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500" style={{ fontSize: "12px" }}>{label}</span>
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedRestaurant(null)} className="w-full mt-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" style={{ fontSize: "13px", fontWeight: 600 }}>
              {l("Close", "បិទ")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
