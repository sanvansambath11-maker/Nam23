import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, Moon, Sun, Globe, DollarSign, Clock, TrendingUp, LogOut, BarChart3, Shield, TimerReset } from "lucide-react";
import { useTranslation } from "./translation-context";
import { useTheme } from "./theme-context";
import { useCurrency } from "./currency-context";
import { getDashboardStats } from "../../lib/db-service";
import { isSupabaseConfigured } from "../../lib/supabase";
import { getLocalDashboardStats } from "../../lib/local-orders";
import { toast } from "sonner";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  staffName?: string;
  staffNameKm?: string;
  staffRole?: string;
  staffInitials?: string;
  staffColor?: string;
  onLogout?: () => void;
  onDailySummary?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

const tabKeys = ["reservation", "menu", "delivery", "accounting", "kitchen", "tables", "analytics", "history"];

export function Navbar({ activeTab, onTabChange, searchQuery, onSearchChange, staffName, staffNameKm, staffRole, staffInitials, staffColor, onLogout, onDailySummary, isAdmin, onOpenAdmin }: NavbarProps) {
  const { t, lang, setLang, fontClass } = useTranslation();
  const { isDark, toggleDark } = useTheme();
  const { currency, setCurrency, formatPrice } = useCurrency();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(() => {
    return localStorage.getItem("battoclub_clocked_in") === "true";
  });

  const handleToggleClock = () => {
    const newState = !isClockedIn;
    setIsClockedIn(newState);
    localStorage.setItem("battoclub_clocked_in", String(newState));
    // Usually this would hit the DB to actually punch in/out
    if (newState) {
      toast.success(lang === "km" ? "អ្នកបានចូលម៉ោង!" : "Clocked In!");
    } else {
      toast.success(lang === "km" ? "អ្នកបានចេញម៉ោង!" : "Clocked Out!");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live revenue from local orders only
  useEffect(() => {
    function fetchRevenue() {
      try {
        const localStats = getLocalDashboardStats();
        setTodayRevenue(localStats.todayRevenue);
      } catch { /* ignore */ }
    }
    fetchRevenue();
    const interval = setInterval(fetchRevenue, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  return (
    <div className={`bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 ${fontClass}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <img src="/images/logo.png" alt="POS Batto" className="w-8 h-8 rounded-lg object-cover" />
        <span style={{ fontSize: "16px", fontWeight: 700 }} className="text-gray-900 dark:text-white hidden sm:block">POS Batto</span>
      </div>

      {/* Live Clock + Revenue ticker */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl shrink-0">
        <Clock size={13} className="text-[#22C55E]" />
        <span className="text-gray-700 dark:text-gray-300 tabular-nums" style={{ fontSize: "12px", fontWeight: 600 }}>
          {timeStr}
        </span>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <TrendingUp size={13} className="text-[#22C55E]" />
        <span className="text-[#22C55E]" style={{ fontSize: "12px", fontWeight: 700 }}>
          {formatPrice(todayRevenue)}
        </span>
      </div>



      {/* Tabs */}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {tabKeys.map((key) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === key
              ? "text-[#22C55E] bg-green-50 dark:bg-green-900/30"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            style={{ fontSize: "12px", fontWeight: activeTab === key ? 600 : 500, position: "relative" }}
          >
            {t(key)}
            {activeTab === key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#22C55E] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {/* Admin Panel button - only visible to managers */}
        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-purple-200 dark:border-purple-800"
            title={t("adminPanel") || "Admin Panel"}
          >
            <Shield size={14} className="text-purple-500" />
            <span style={{ fontSize: "11px", fontWeight: 600 }} className="text-purple-600 dark:text-purple-400 hidden lg:block">
              Admin
            </span>
          </button>
        )}

        {/* Daily Summary button */}
        {onDailySummary && (
          <button
            onClick={onDailySummary}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
            title={t("dailySummary")}
          >
            <BarChart3 size={14} className="text-[#22C55E]" />
            <span style={{ fontSize: "11px", fontWeight: 600 }} className="text-gray-600 dark:text-gray-400 hidden lg:block">
              {t("dailySummary")}
            </span>
          </button>
        )}

        {/* Currency toggle */}
        <button
          onClick={() => setCurrency(currency === "USD" ? "KHR" : "USD")}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
          title={t("currencyLabel")}
        >
          <DollarSign size={14} className="text-[#22C55E]" />
          <span style={{ fontSize: "11px", fontWeight: 700 }} className="text-gray-700 dark:text-gray-300">
            {currency === "USD" ? "USD" : "KHR"}
          </span>
        </button>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
          title={t("language")}
        >
          <Globe size={14} className="text-blue-500" />
          <span style={{ fontSize: "11px", fontWeight: 700 }} className="text-gray-700 dark:text-gray-300">
            {lang === "en" ? "EN" : "\u1781\u17D2\u1798\u17C2\u179A"}
          </span>
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-500"
          title={t("darkMode")}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Bell size={16} className="text-gray-500" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer pl-2 border-l border-gray-100 dark:border-gray-700 ml-1">
          {/* Quick Clock in/out */}
          <button
            onClick={handleToggleClock}
            className={`mr-2 flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors border ${isClockedIn
              ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800"}`}
            title={lang === "km" ? (isClockedIn ? "ចេញម៉ោង" : "ចូលម៉ោង") : (isClockedIn ? "Clock Out" : "Clock In")}
          >
            <TimerReset size={14} />
            <span style={{ fontSize: "11px", fontWeight: 700 }} className="hidden lg:block">
              {lang === "km" ? (isClockedIn ? "កំពុងធ្វើការ" : "ចូលម៉ោង") : (isClockedIn ? "Clocked In" : "Clock In")}
            </span>
          </button>

          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: staffColor ? `linear-gradient(135deg, ${staffColor}, ${staffColor}CC)` : "linear-gradient(135deg, #F97316, #EC4899)" }}>
            <span className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>{staffInitials || "JD"}</span>
          </div>
          <div className="hidden xl:block">
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600, lineHeight: "1.2" }}>{lang === "km" ? staffNameKm || "John Doe" : staffName || "John Doe"}</p>
            <p className="text-gray-400" style={{ fontSize: "11px", lineHeight: "1.2" }}>{staffRole ? t(staffRole) : t("cashier")}</p>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title={t("logout")}>
              <LogOut size={14} />
            </button>
          )}
          {!onLogout && <ChevronDown size={14} className="text-gray-400 hidden xl:block" />}
        </div>
      </div>
    </div>
  );
}