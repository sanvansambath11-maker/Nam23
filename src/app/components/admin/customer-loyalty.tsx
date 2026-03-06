import { useState, useEffect } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import { Search, Plus, Edit2, Star, Crown, Award, Gift, X, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Customer, loadCustomers, addCustomer, updateCustomer, addPoints } from "../../../lib/local-customers";

const tierConfig: Record<Customer["tier"], { label: string; labelKm: string; color: string; minPoints: number; icon: React.ReactNode }> = {
  bronze: { label: "Bronze", labelKm: "រូបាំង", color: "#CD7F32", minPoints: 0, icon: <Award size={14} /> },
  silver: { label: "Silver", labelKm: "ប្រាក់", color: "#9CA3AF", minPoints: 200, icon: <Award size={14} /> },
  gold: { label: "Gold", labelKm: "មាស", color: "#F59E0B", minPoints: 500, icon: <Crown size={14} /> },
  platinum: { label: "Platinum", labelKm: "ផ្លាទីន", color: "#A855F7", minPoints: 1000, icon: <Star size={14} /> },
};

export function CustomerLoyalty() {
  const { lang, fontClass } = useTranslation();
  const { formatPrice } = useCurrency();
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(loadCustomers());
    const handleUpdate = () => setCustomers(loadCustomers());
    window.addEventListener("customers-updated", handleUpdate);
    return () => window.removeEventListener("customers-updated", handleUpdate);
  }, []);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<Customer["tier"] | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editCust, setEditCust] = useState<Customer | null>(null);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = filterTier === "all" || c.tier === filterTier;
    return matchSearch && matchTier;
  });

  const totalPoints = customers.reduce((s, c) => s + c.points, 0);
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  const handleSave = (data: Customer) => {
    if (editCust) {
      updateCustomer(data);
      toast.success(l("Customer updated", "បានកែប្រែអតិថិជន"));
    } else {
      addCustomer(data);
      toast.success(l("Customer added", "បានបន្ថែមអតិថិជន"));
    }
    setShowModal(false);
    setEditCust(null);
  };

  const handleAddPoints = (id: number, pts: number) => {
    addPoints(id, pts);
    toast.success(`+${pts} ${l("points", "ពិន្ទុ")}`);
  };

  return (
    <div className={`p-6 ${fontClass}`}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5"><Users size={14} className="text-blue-500" /><p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Customers", "អតិថិជនសរុប")}</p></div>
          <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5"><Gift size={14} className="text-purple-500" /><p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Points", "ពិន្ទុសរុប")}</p></div>
          <p className="text-purple-500" style={{ fontSize: "22px", fontWeight: 700 }}>{totalPoints.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5"><TrendingUp size={14} className="text-green-500" /><p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Total Revenue", "ចំណូលសរុប")}</p></div>
          <p className="text-[#22C55E]" style={{ fontSize: "22px", fontWeight: 700 }}>{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5"><Crown size={14} className="text-yellow-500" /><p className="text-gray-400" style={{ fontSize: "11px" }}>{l("VIP Members", "សមាជិក VIP")}</p></div>
          <p className="text-yellow-500" style={{ fontSize: "22px", fontWeight: 700 }}>{customers.filter((c) => c.tier === "gold" || c.tier === "platinum").length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={l("Search customers...", "ស្វែងរកអតិថិជន...")} className="w-full max-w-sm pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300" style={{ fontSize: "13px" }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(["all", "platinum", "gold", "silver", "bronze"] as const).map((t) => (
              <button key={t} onClick={() => setFilterTier(t)} className={`px-2.5 py-1.5 rounded-md transition-all ${filterTier === t ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
                {t === "all" ? l("All", "ទាំងអស់") : tierConfig[t].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setEditCust(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 shadow-md shadow-green-200 dark:shadow-green-900" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Plus size={16} />{l("Add Customer", "បន្ថែមអតិថិជន")}
          </button>
        </div>
      </div>

      {/* Customer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const tc = tierConfig[c.tier];
          return (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCust(c)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>{c.name}</p>
                  <p className="text-gray-400" style={{ fontSize: "12px" }}>{c.phone}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ fontSize: "11px", fontWeight: 600, backgroundColor: `${tc.color}15`, color: tc.color }}>
                  {tc.icon} {tc.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Points", "ពិន្ទុ")}</p><p className="text-purple-500" style={{ fontSize: "16px", fontWeight: 700 }}>{c.points}</p></div>
                <div><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Visits", "ការមកទស្សនា")}</p><p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "16px", fontWeight: 700 }}>{c.visits}</p></div>
                <div><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Spent", "ចំណាយ")}</p><p className="text-[#22C55E]" style={{ fontSize: "16px", fontWeight: 700 }}>{formatPrice(c.totalSpent)}</p></div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                <button onClick={(e) => { e.stopPropagation(); handleAddPoints(c.id, 10); }} className="flex-1 py-1.5 text-center rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 transition-colors" style={{ fontSize: "11px", fontWeight: 500 }}>+10 {l("pts", "ពិន្ទុ")}</button>
                <button onClick={(e) => { e.stopPropagation(); handleAddPoints(c.id, 50); }} className="flex-1 py-1.5 text-center rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 transition-colors" style={{ fontSize: "11px", fontWeight: 500 }}>+50 {l("pts", "ពិន្ទុ")}</button>
                <button onClick={(e) => { e.stopPropagation(); setEditCust(c); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"><Edit2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selectedCust && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCust(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{selectedCust.name}</h3>
              <button onClick={() => setSelectedCust(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><span className="text-gray-400" style={{ fontSize: "12px" }}>{l("Tier", "កម្រិត")}:</span><span className="px-2 py-0.5 rounded-lg" style={{ fontSize: "12px", fontWeight: 600, backgroundColor: `${tierConfig[selectedCust.tier].color}15`, color: tierConfig[selectedCust.tier].color }}>{tierConfig[selectedCust.tier].label}</span></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Points", "ពិន្ទុ")}</p><p className="text-purple-500" style={{ fontSize: "20px", fontWeight: 700 }}>{selectedCust.points}</p></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Visits", "ការមកទស្សនា")}</p><p className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{selectedCust.visits}</p></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Total Spent", "ចំណាយសរុប")}</p><p className="text-[#22C55E]" style={{ fontSize: "20px", fontWeight: 700 }}>{formatPrice(selectedCust.totalSpent)}</p></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"><p className="text-gray-400" style={{ fontSize: "10px" }}>{l("Last Visit", "មកចុងក្រោយ")}</p><p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "14px", fontWeight: 600 }}>{selectedCust.lastVisit}</p></div>
              </div>
              {selectedCust.phone && <p className="text-gray-500" style={{ fontSize: "12px" }}>📱 {selectedCust.phone}</p>}
              {selectedCust.email && <p className="text-gray-500" style={{ fontSize: "12px" }}>✉️ {selectedCust.email}</p>}
              {selectedCust.notes && <p className="text-gray-400 italic" style={{ fontSize: "12px" }}>📝 {selectedCust.notes}</p>}
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{l("Member since", "សមាជិកតាំងពី")}: {selectedCust.joinDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEditCust(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>{editCust ? l("Edit Customer", "កែប្រែ") : l("Add Customer", "បន្ថែមអតិថិជន")}</h3>
              <button onClick={() => { setShowModal(false); setEditCust(null); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X size={18} /></button>
            </div>
            <CustomerForm cust={editCust} onSave={handleSave} lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerForm({ cust, onSave, lang }: { cust: Customer | null; onSave: (d: Customer) => void; lang: string }) {
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [form, setForm] = useState<Customer>(cust ?? { id: 0, name: "", phone: "", email: "", points: 0, tier: "bronze", visits: 0, totalSpent: 0, lastVisit: new Date().toISOString().split("T")[0], joinDate: new Date().toISOString().split("T")[0], notes: "" });
  const cls = "w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300";

  return (
    <div className="p-6 space-y-3">
      <div><label className="block text-gray-500 mb-1" style={{ fontSize: "12px" }}>{l("Name", "ឈ្មោះ")}</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} style={{ fontSize: "13px" }} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-gray-500 mb-1" style={{ fontSize: "12px" }}>{l("Phone", "ទូរសព្ទ")}</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} style={{ fontSize: "13px" }} /></div>
        <div><label className="block text-gray-500 mb-1" style={{ fontSize: "12px" }}>{l("Email", "អ៊ីមែល")}</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cls} style={{ fontSize: "13px" }} /></div>
      </div>
      <div><label className="block text-gray-500 mb-1" style={{ fontSize: "12px" }}>{l("Notes", "កំណត់ចំណាំ")}</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${cls} resize-none`} rows={2} style={{ fontSize: "13px" }} /></div>
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button onClick={() => { if (!form.name.trim()) { toast.error("Name required"); return; } onSave(form); }} className="px-5 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 shadow-md" style={{ fontSize: "13px", fontWeight: 600 }}>{cust ? l("Save", "រក្សាទុក") : l("Add", "បន្ថែម")}</button>
      </div>
    </div>
  );
}
