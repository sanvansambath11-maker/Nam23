import { useState } from "react";
import { useTranslation } from "../translation-context";
import { useTheme } from "../theme-context";
import { Menu, X, Moon, Sun, Globe, Sparkles, ArrowRight } from "lucide-react";

interface WebNavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function WebNavbar({ currentPage, onNavigate }: WebNavbarProps) {
  const { lang, setLang, fontClass } = useTranslation();
  const { isDark, toggleDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const l = (en: string, km: string) => (lang === "km" ? km : en);

  const links = [
    { key: "home", en: "Home", km: "ទំព័រដើម" },
    { key: "features", en: "Features", km: "មុខងារ" },
    { key: "pricing", en: "Pricing", km: "តម្លៃ" },
    { key: "about", en: "About", km: "អំពី" },
    { key: "contact", en: "Contact", km: "ទំនាក់ទំនង" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${fontClass}`}>
      <div className="mx-4 mt-3">
        <div className="max-w-7xl mx-auto px-5 bg-white/75 dark:bg-gray-950/75 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-lg shadow-gray-200/20 dark:shadow-black/20">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 group">
              <img src="/images/logo.png" alt="Batto Club" className="h-10 w-10 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow" />
              <div>
                <span className="text-gray-900 dark:text-white" style={{ fontSize: "17px", fontWeight: 800 }}>Batto</span>
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent ml-0.5" style={{ fontSize: "17px", fontWeight: 800 }}>Club</span>
                <p className="text-gray-400 -mt-1" style={{ fontSize: "9px", fontWeight: 500 }}>Restaurant POS</p>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5 p-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
              {links.map((link) => (
                <button
                  key={link.key}
                  onClick={() => onNavigate(link.key)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 press-effect ${currentPage === link.key
                      ? "gradient-primary text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                    }`}
                  style={{ fontSize: "13px", fontWeight: currentPage === link.key ? 600 : 500 }}
                >
                  {lang === "km" ? link.km : link.en}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <button onClick={toggleDark} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors press-effect">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={() => setLang(lang === "en" ? "km" : "en")} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors press-effect">
                <Globe size={16} />
              </button>

              <div className="hidden md:flex items-center gap-2 ml-2">
                <button onClick={() => onNavigate("login")} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors press-effect" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {l("Login", "ចូល")}
                </button>
                <button onClick={() => onNavigate("register")} className="group px-5 py-2.5 gradient-primary text-white rounded-xl hover:opacity-90 transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900 flex items-center gap-2 press-effect" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {l("Start Free", "ចាប់ផ្តើម")}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 press-effect">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mx-4 mt-2 animate-fade-in-up">
          <div className="glass-card rounded-2xl px-4 py-4 space-y-1 shadow-xl">
            {links.map((link) => (
              <button
                key={link.key}
                onClick={() => { onNavigate(link.key); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all press-effect ${currentPage === link.key ? "gradient-primary text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                style={{ fontSize: "14px", fontWeight: currentPage === link.key ? 600 : 500 }}
              >
                {lang === "km" ? link.km : link.en}
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button onClick={() => { onNavigate("login"); setMobileOpen(false); }} className="w-full py-3 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 press-effect" style={{ fontSize: "13px", fontWeight: 600 }}>
                {l("Login", "ចូល")}
              </button>
              <button onClick={() => { onNavigate("register"); setMobileOpen(false); }} className="w-full py-3 gradient-primary text-white rounded-xl shadow-md press-effect" style={{ fontSize: "13px", fontWeight: 600 }}>
                {l("Start Free Trial", "ចាប់ផ្តើមឥតគិតថ្លៃ")}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
