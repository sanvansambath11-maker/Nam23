import { useState } from "react";
import { useTranslation } from "../translation-context";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  ChefHat,
  X,
  Check,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import type { StaffRole } from "../staff-login";
import { toast } from "sonner";

interface StaffRecord {
  id: number;
  name: string;
  nameKm: string;
  role: StaffRole;
  pin: string;
  avatar: string;
  initials: string;
  color: string;
  isActive: boolean;
  phone?: string;
  email?: string;
}

const initialStaff: StaffRecord[] = [
  {
    id: 1,
    name: "Sokha Chan",
    nameKm: "\u179F\u17BB\u1781\u17B6 \u1785\u17B6\u1793",
    role: "manager",
    pin: "1212",
    color: "#A855F7",
    avatar:
      "https://images.unsplash.com/photo-1766066014773-0074bf4911de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWFuYWdlciUyMGFzaWFuJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjUwNzE0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SC",
    isActive: true,
    phone: "012 345 678",
    email: "sokha@posbatto.kh",
  },
  {
    id: 2,
    name: "Dara Pich",
    nameKm: "\u178A\u17B6\u179A\u17B6 \u1796\u17B7\u1785",
    role: "cashier",
    pin: "1212",
    color: "#22C55E",
    avatar:
      "https://images.unsplash.com/photo-1677565080484-467d0fde2701?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGNhc2hpZXIlMjByZXN0YXVyYW50fGVufDF8fHx8MTc3MjUwNzE0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "DP",
    isActive: true,
    phone: "012 987 654",
    email: "dara@posbatto.kh",
  },
  {
    id: 3,
    name: "Veasna Kem",
    nameKm: "\u179C\u17B6\u179F\u1793\u17B6 \u1780\u17C2\u1798",
    role: "chef",
    pin: "1212",
    color: "#F59E0B",
    avatar:
      "https://images.unsplash.com/photo-1768304485806-926ca607b153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1ib2RpYW4lMjBjaGVmJTIwa2l0Y2hlbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjUwNzE0NXww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "VK",
    isActive: true,
    phone: "012 111 222",
  },
  {
    id: 4,
    name: "Bopha Meas",
    nameKm: "\u1794\u17BB\u1795\u17D2\u1795\u17B6 \u1798\u17B6\u179F",
    role: "waiter",
    pin: "1212",
    color: "#3B82F6",
    avatar:
      "https://images.unsplash.com/photo-1751842839301-8a57a05f9904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdhaXRlciUyMHNvdXRoZWFzdCUyMGFzaWFufGVufDF8fHx8MTc3MjUwNzE0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "BM",
    isActive: true,
    phone: "012 333 444",
  },
];

const roleColors: Record<StaffRole, string> = {
  manager: "#A855F7",
  cashier: "#22C55E",
  chef: "#F59E0B",
  waiter: "#3B82F6",
};

const roleIcons: Record<StaffRole, React.ReactNode> = {
  manager: <Shield size={14} />,
  cashier: <User size={14} />,
  chef: <ChefHat size={14} />,
  waiter: <User size={14} />,
};

const roleLabels: Record<StaffRole, { en: string; km: string }> = {
  manager: { en: "Manager", km: "\u1782\u17D2\u179A\u17B6\u17CB\u1782\u17D2\u179A\u1784" },
  cashier: { en: "Cashier", km: "\u17A2\u17D2\u1793\u1780\u1782\u17B7\u178F\u179B\u17BB\u1799" },
  chef: { en: "Chef", km: "\u1785\u17C1\u179A\u1795\u17D2\u1791\u17C7\u1794\u17B6\u1799" },
  waiter: { en: "Waiter", km: "\u17A2\u17D2\u1793\u1780\u179F\u17CA\u17BA\u179C\u17B8\u179F" },
};

let nextStaffId = 10;

export function StaffManagement() {
  const { lang, fontClass } = useTranslation();
  const [staff, setStaff] = useState<StaffRecord[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showPin, setShowPin] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<StaffRole | "all">("all");

  const filtered = staff.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nameKm.includes(search);
    const matchesRole = filterRole === "all" || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSave = (data: StaffRecord) => {
    if (editingStaff) {
      setStaff((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      toast.success(lang === "km" ? "បានកែប្រែបុគ្គលិក" : "Staff updated");
    } else {
      setStaff((prev) => [...prev, { ...data, id: nextStaffId++ }]);
      toast.success(lang === "km" ? "បានបន្ថែមបុគ្គលិក" : "Staff added");
    }
    setShowModal(false);
    setEditingStaff(null);
  };

  const handleDelete = (id: number) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setShowDeleteConfirm(null);
    toast.success(lang === "km" ? "បានលុបបុគ្គលិក" : "Staff removed");
  };

  const handleToggleActive = (id: number) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleResetPin = (id: number) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pin: "1234" } : s))
    );
    toast.success(lang === "km" ? "PIN បានកំណត់ឡើងវិញ → 1234" : "PIN reset to 1234");
  };

  return (
    <div className={`p-6 ${fontClass}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "km" ? "ស្វែងរកបុគ្គលិក..." : "Search staff..."}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
            style={{ fontSize: "13px" }}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(["all", "manager", "cashier", "chef", "waiter"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  filterRole === r
                    ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
                    : "text-gray-500"
                }`}
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                {r === "all"
                  ? lang === "km"
                    ? "ទាំងអស់"
                    : "All"
                  : lang === "km"
                    ? roleLabels[r].km
                    : roleLabels[r].en}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setEditingStaff(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200 dark:shadow-green-900"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <Plus size={16} />
            {lang === "km" ? "បន្ថែមបុគ្គលិក" : "Add Staff"}
          </button>
        </div>
      </div>

      {/* Staff grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all ${
              !s.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700">
                  <ImageWithFallback src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                    s.isActive ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white truncate" style={{ fontSize: "15px", fontWeight: 600 }}>
                  {lang === "km" ? s.nameKm : s.name}
                </p>
                <p className="text-gray-400 truncate" style={{ fontSize: "12px" }}>
                  {lang === "km" ? s.name : s.nameKm}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: `${roleColors[s.role]}15`,
                      color: roleColors[s.role],
                    }}
                  >
                    {roleIcons[s.role]}
                    {lang === "km" ? roleLabels[s.role].km : roleLabels[s.role].en}
                  </span>
                  {!s.isActive && (
                    <span
                      className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-500"
                      style={{ fontSize: "10px", fontWeight: 600 }}
                    >
                      {lang === "km" ? "អសកម្ម" : "Inactive"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-1.5">
              {s.phone && (
                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: "12px" }}>
                  📱 {s.phone}
                </p>
              )}
              {s.email && (
                <p className="text-gray-500 dark:text-gray-400 truncate" style={{ fontSize: "12px" }}>
                  ✉️ {s.email}
                </p>
              )}
              <div className="flex items-center gap-1.5">
                <Key size={12} className="text-gray-400" />
                <span className="text-gray-400" style={{ fontSize: "12px" }}>
                  PIN:{" "}
                  {showPin === s.id ? (
                    <span className="font-mono text-gray-700 dark:text-gray-300">{s.pin}</span>
                  ) : (
                    "••••"
                  )}
                </span>
                <button
                  onClick={() => setShowPin(showPin === s.id ? null : s.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPin === s.id ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2">
              <button
                onClick={() => handleToggleActive(s.id)}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  s.isActive
                    ? "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100"
                }`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {s.isActive
                  ? lang === "km"
                    ? "បិទដំណើរការ"
                    : "Deactivate"
                  : lang === "km"
                    ? "ធ្វើឱ្យសកម្ម"
                    : "Activate"}
              </button>
              <button
                onClick={() => handleResetPin(s.id)}
                className="py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 transition-colors"
                title={lang === "km" ? "កំណត់ PIN ឡើងវិញ" : "Reset PIN"}
              >
                <Key size={14} />
              </button>
              <button
                onClick={() => {
                  setEditingStaff(s);
                  setShowModal(true);
                }}
                className="py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(s.id)}
                className="py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Delete confirm */}
            {showDeleteConfirm === s.id && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-2">
                <p className="text-red-600 flex-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                  {lang === "km" ? "លុបបុគ្គលិកនេះ?" : "Delete this staff member?"}
                </p>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p style={{ fontSize: "14px" }}>{lang === "km" ? "រកមិនឃើញបុគ្គលិក" : "No staff found"}</p>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <StaffModal
          staff={editingStaff}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
          }}
          lang={lang}
        />
      )}
    </div>
  );
}

/* ─── Staff Add/Edit Modal ─── */

interface StaffModalProps {
  staff: StaffRecord | null;
  onSave: (data: StaffRecord) => void;
  onClose: () => void;
  lang: "en" | "km";
}

function StaffModal({ staff, onSave, onClose, lang }: StaffModalProps) {
  const [form, setForm] = useState<StaffRecord>(
    staff ?? {
      id: 0,
      name: "",
      nameKm: "",
      role: "waiter",
      pin: "1234",
      avatar: "",
      initials: "",
      color: "#3B82F6",
      isActive: true,
      phone: "",
      email: "",
    }
  );

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error(lang === "km" ? "សូមបញ្ចូលឈ្មោះ" : "Please enter a name");
      return;
    }
    const initials = form.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    onSave({ ...form, initials: form.initials || initials, color: roleColors[form.role] });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>
            {staff
              ? lang === "km"
                ? "កែប្រែបុគ្គលិក"
                : "Edit Staff"
              : lang === "km"
                ? "បន្ថែមបុគ្គលិក"
                : "Add Staff"}
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
              {lang === "km" ? "ឈ្មោះ (English)" : "Name (English)"}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
              style={{ fontSize: "13px" }}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
              {lang === "km" ? "ឈ្មោះ (ខ្មែរ)" : "Name (Khmer)"}
            </label>
            <input
              type="text"
              value={form.nameKm}
              onChange={(e) => setForm({ ...form, nameKm: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
              style={{ fontSize: "13px" }}
              placeholder="ឈ្មោះខ្មែរ"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
              {lang === "km" ? "តួនាទី" : "Role"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["manager", "cashier", "chef", "waiter"] as StaffRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    form.role === r
                      ? "border-[#22C55E] bg-[#22C55E]/5 text-[#22C55E]"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                  }`}
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {roleIcons[r]}
                  {lang === "km" ? roleLabels[r].km : roleLabels[r].en}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                {lang === "km" ? "ទូរសព្ទ" : "Phone"}
              </label>
              <input
                type="text"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
                style={{ fontSize: "13px" }}
                placeholder="012 345 678"
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                {lang === "km" ? "អ៊ីមែល" : "Email"}
              </label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
                style={{ fontSize: "13px" }}
                placeholder="name@email.com"
              />
            </div>
          </div>

          {/* PIN (only for new) */}
          {!staff && (
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                PIN ({lang === "km" ? "4 ខ្ទង់" : "4 digits"})
              </label>
              <input
                type="text"
                maxLength={4}
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300 font-mono tracking-[0.5em]"
                style={{ fontSize: "18px" }}
                placeholder="1234"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            {lang === "km" ? "បោះបង់" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200 dark:shadow-green-900"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {staff
              ? lang === "km"
                ? "រក្សាទុក"
                : "Save Changes"
              : lang === "km"
                ? "បន្ថែម"
                : "Add Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}
