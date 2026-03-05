import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Delete, ChefHat, User, Shield, Search } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export type StaffRole = "cashier" | "chef" | "manager" | "waiter";

export interface StaffMember {
  id: number;
  name: string;
  nameKm: string;
  role: StaffRole;
  pin: string;
  avatar: string;
  initials: string;
  color: string;
}

const staffMembers: StaffMember[] = [
  {
    id: 1, name: "Sokha Chan", nameKm: "\u179F\u17BB\u1781\u17B6 \u1785\u17B6\u1793",
    role: "manager", pin: "1212", color: "#A855F7",
    avatar: "https://images.unsplash.com/photo-1766066014773-0074bf4911de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWFuYWdlciUyMGFzaWFuJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjUwNzE0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SC",
  },
  {
    id: 2, name: "Dara Pich", nameKm: "\u178A\u17B6\u179A\u17B6 \u1796\u17B7\u1785",
    role: "cashier", pin: "1212", color: "#22C55E",
    avatar: "https://images.unsplash.com/photo-1677565080484-467d0fde2701?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGNhc2hpZXIlMjByZXN0YXVyYW50fGVufDF8fHx8MTc3MjUwNzE0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "DP",
  },
  {
    id: 3, name: "Veasna Kem", nameKm: "\u179C\u17B6\u179F\u1793\u17B6 \u1780\u17C2\u1798",
    role: "chef", pin: "1212", color: "#F59E0B",
    avatar: "https://images.unsplash.com/photo-1768304485806-926ca607b153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1ib2RpYW4lMjBjaGVmJTIwa2l0Y2hlbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjUwNzE0NXww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "VK",
  },
  {
    id: 4, name: "Bopha Meas", nameKm: "\u1794\u17BB\u1795\u17D2\u1795\u17B6 \u1798\u17B6\u179F",
    role: "waiter", pin: "1212", color: "#3B82F6",
    avatar: "https://images.unsplash.com/photo-1751842839301-8a57a05f9904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdhaXRlciUyMHNvdXRoZWFzdCUyMGFzaWFufGVufDF8fHx8MTc3MjUwNzE0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "BM",
  },
];

const roleIcons: Record<StaffRole, React.ReactNode> = {
  manager: <Shield size={12} />,
  cashier: <User size={12} />,
  chef: <ChefHat size={12} />,
  waiter: <User size={12} />,
};

const roleLabels: Record<StaffRole, { en: string; km: string }> = {
  manager: { en: "Manager", km: "\u1782\u17D2\u179A\u17B6\u17CB\u1782\u17D2\u179A\u1784" },
  cashier: { en: "Cashier", km: "\u17A2\u17D2\u1793\u1780\u1782\u17B7\u178F\u179B\u17BB\u1799" },
  chef: { en: "Chef", km: "\u1785\u17C1\u179A\u1795\u17D2\u1791\u17C7\u1794\u17B6\u1799" },
  waiter: { en: "Waiter", km: "\u17A2\u17D2\u1793\u1780\u179F\u17CA\u17BA\u179C\u17B8\u179F" },
};

interface StaffLoginProps {
  onLogin: (staff: StaffMember) => void;
  onBackToWebsite?: () => void;
}

export function StaffLogin({ onLogin, onBackToWebsite }: StaffLoginProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [lang] = useState<"en" | "km">("km");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<StaffRole | "all">("all");
  const [loginMode, setLoginMode] = useState<"grid" | "pin">("grid");

  const filteredStaff = staffMembers.filter((s) => {
    const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nameKm.includes(searchQuery);
    const matchRole = filterRole === "all" || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError(false);
    }
  }, [pin.length]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && selectedStaff) {
      if (pin === selectedStaff.pin) {
        // Success
        setTimeout(() => onLogin(selectedStaff), 300);
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  }, [pin, selectedStaff, onLogin]);

  // Keyboard support
  useEffect(() => {
    if (!selectedStaff) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      else if (e.key === "Backspace") handleDelete();
      else if (e.key === "Escape") {
        setSelectedStaff(null);
        setPin("");
        setError(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStaff, handleDigit, handleDelete]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-[100] font-['Inter',sans-serif]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 overflow-hidden shadow-2xl shadow-black/30"
          >
            <img src="/images/logo.png" alt="POS Batto" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-white mb-1" style={{ fontSize: "24px", fontWeight: 700 }}>POS Batto</h1>
          <p className="text-gray-400" style={{ fontSize: "13px" }}>{timeStr} &bull; {dateStr}</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedStaff ? (
            <motion.div
              key="staff-select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Mode toggle */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button onClick={() => setLoginMode("grid")} className={`px-3 py-1.5 rounded-lg transition-all ${loginMode === "grid" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`} style={{ fontSize: "12px", fontWeight: 600 }}>
                  {lang === "km" ? "ជ្រើសរើសបុគ្គលិក" : "Select Profile"}
                </button>
                <button onClick={() => setLoginMode("pin")} className={`px-3 py-1.5 rounded-lg transition-all ${loginMode === "pin" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`} style={{ fontSize: "12px", fontWeight: 600 }}>
                  {lang === "km" ? "បញ្ចូល PIN" : "Enter PIN"}
                </button>
              </div>

              {loginMode === "grid" ? (
                <>
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === "km" ? "ស្វែងរកបុគ្គលិក..." : "Search staff..."}
                      className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white placeholder-gray-500"
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  {/* Role filter tabs */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {(["all", "manager", "cashier", "chef", "waiter"] as const).map((role) => {
                      const count = role === "all" ? staffMembers.length : staffMembers.filter((s) => s.role === role).length;
                      return (
                        <button
                          key={role}
                          onClick={() => setFilterRole(role)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${filterRole === role ? "bg-white/15 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                          style={{ fontSize: "11px", fontWeight: 600 }}
                        >
                          {role === "all" ? (lang === "km" ? "ទាំងអស់" : "All") : (lang === "km" ? roleLabels[role].km : roleLabels[role].en)}
                          <span className="text-gray-500 ml-0.5">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Staff grid */}
                  <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                    {filteredStaff.map((staff, i) => (
                      <motion.button
                        key={staff.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.04 }}
                        onClick={() => { setSelectedStaff(staff); setPin(""); setError(false); }}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group"
                      >
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                            <ImageWithFallback src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: staff.color }}>
                            {roleIcons[staff.role]}
                          </div>
                        </div>
                        <div>
                          <p className="text-white" style={{ fontSize: "13px", fontWeight: 600 }}>{staff.nameKm}</p>
                          <p className="text-gray-400" style={{ fontSize: "10px" }}>{staff.name}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "9px", fontWeight: 600, backgroundColor: `${staff.color}20`, color: staff.color }}>
                          {lang === "km" ? roleLabels[staff.role].km : roleLabels[staff.role].en}
                        </span>
                      </motion.button>
                    ))}
                    {filteredStaff.length === 0 && (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-gray-500" style={{ fontSize: "13px" }}>{lang === "km" ? "រកមិនឃើញបុគ្គលិក" : "No staff found"}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* PIN-only mode: enter PIN directly without selecting a profile */
                <div>
                  <p className="text-gray-400 text-center mb-4" style={{ fontSize: "13px" }}>
                    {lang === "km" ? "បញ្ចូលលេខកូដ PIN ៤ ខ្ទង់របស់អ្នក" : "Enter your 4-digit PIN"}
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Lock size={16} className="text-gray-500" />
                    <div className="flex gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? "bg-[#22C55E] scale-110" : "bg-white/10 border border-white/20"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-gray-500 mb-5" style={{ fontSize: "12px" }}>
                    {lang === "km" ? "បញ្ចូលលេខកូដ PIN" : "Enter your PIN"}
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
                      if (key === "") return <div key="empty" />;
                      if (key === "del") return (
                        <button key={key} onClick={() => setPin((p) => p.slice(0, -1))} className="h-14 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors">
                          <Delete size={20} />
                        </button>
                      );
                      return (
                        <button key={key} onClick={() => {
                          if (pin.length < 4) {
                            const newPin = pin + key;
                            setPin(newPin);
                            if (newPin.length === 4) {
                              const match = staffMembers.find((s) => s.pin === newPin);
                              if (match) { setTimeout(() => onLogin(match), 300); }
                              else { setError(true); setTimeout(() => { setPin(""); setError(false); }, 600); }
                            }
                          }
                        }} className="h-14 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors active:scale-95" style={{ fontSize: "22px", fontWeight: 600 }}>
                          {key}
                        </button>
                      );
                    })}
                  </div>
                  {error && <p className="text-red-400 text-center mt-3" style={{ fontSize: "12px" }}>{lang === "km" ? "PIN មិនត្រូវ" : "Invalid PIN"}</p>}
                  <p className="text-center text-gray-600 mt-4" style={{ fontSize: "10px" }}>PIN: 1212</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Selected staff */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-3 ring-[#22C55E]/50">
                  <ImageWithFallback src={selectedStaff.avatar} alt={selectedStaff.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-white" style={{ fontSize: "18px", fontWeight: 600 }}>{selectedStaff.nameKm}</p>
                <p className="text-gray-400" style={{ fontSize: "12px" }}>{selectedStaff.name}</p>
                <span
                  className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md"
                  style={{ fontSize: "11px", fontWeight: 600, backgroundColor: `${selectedStaff.color}20`, color: selectedStaff.color }}
                >
                  {roleIcons[selectedStaff.role]}
                  {lang === "km" ? roleLabels[selectedStaff.role].km : roleLabels[selectedStaff.role].en}
                </span>
              </div>

              {/* PIN dots */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <Lock size={16} className="text-gray-500" />
                <div className="flex gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={error ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`w-4 h-4 rounded-full transition-all ${i < pin.length
                          ? error
                            ? "bg-red-500 scale-110"
                            : "bg-[#22C55E] scale-110"
                          : "bg-white/10 border border-white/20"
                        }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-gray-500 mb-6" style={{ fontSize: "12px" }}>
                {error
                  ? (lang === "km" ? "PIN \u1798\u17B7\u1793\u178F\u17D2\u179A\u17BC\u179C" : "Incorrect PIN")
                  : (lang === "km" ? "\u1794\u1789\u17D2\u1785\u17BC\u179B\u179B\u17C1\u1781\u1780\u17BC\u178A PIN" : "Enter your PIN")}
              </p>

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "del"].map((key) => {
                  if (key === "back") {
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedStaff(null); setPin(""); }}
                        className="h-14 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center transition-colors"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        {lang === "km" ? "\u1790\u1799\u1780\u17D2\u179A\u17C4\u1799" : "Back"}
                      </button>
                    );
                  }
                  if (key === "del") {
                    return (
                      <button
                        key={key}
                        onClick={handleDelete}
                        className="h-14 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors"
                      >
                        <Delete size={20} />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => handleDigit(key)}
                      className="h-14 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors active:scale-95"
                      style={{ fontSize: "22px", fontWeight: 600 }}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-gray-600 mt-4" style={{ fontSize: "10px" }}>
                PIN: 1212
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {onBackToWebsite && (
          <p className="text-center mt-6">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="text-gray-400 hover:text-white underline transition-colors"
              style={{ fontSize: "13px" }}
            >
              {lang === "km" ? "← ត្រឡប់ទៅគេហទំព័រ" : "← Back to website"}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}