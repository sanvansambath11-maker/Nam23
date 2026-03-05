import { useTranslation } from "../translation-context";
import {
  ChefHat, ShoppingBag, Users, BarChart3, Package, Heart,
  Tag, Clock, Bell, Shield, HardDrive, Lock, ArrowRight,
  Star, Check, Zap, Globe2, Smartphone, Sparkles, Play,
  TrendingUp, Award, ChevronRight, Quote,
} from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const featureHighlights = [
  { icon: <ShoppingBag size={22} />, en: "Smart POS", km: "POS ឆ្លាតវៃ", descEn: "Fast ordering, split bills, receipt printing", descKm: "បញ្ជាលឿន បែងចែកវិក័យប័ត្រ បោះពុម្ពវិក័យប័ត្រ" },
  { icon: <Users size={22} />, en: "Staff Management", km: "គ្រប់គ្រងបុគ្គលិក", descEn: "Roles, shifts, PIN login, attendance", descKm: "តួនាទី វេន ចូលដោយ PIN វត្តមាន" },
  { icon: <BarChart3 size={22} />, en: "Advanced Reports", km: "របាយការណ៍កម្រិតខ្ពស់", descEn: "Sales, performance, PDF & CSV export", descKm: "ការលក់ ការអនុវត្ត ចេញ PDF និង CSV" },
  { icon: <Package size={22} />, en: "Inventory", km: "ស្តុក", descEn: "Stock tracking, low-stock alerts, suppliers", descKm: "តាមដានស្តុក ការជូនដំណឹង អ្នកផ្គត់ផ្គង់" },
  { icon: <Heart size={22} />, en: "Customer Loyalty", km: "ភាពស្មោះត្រង់អតិថិជន", descEn: "Points, VIP tiers, customer database", descKm: "ពិន្ទុ កម្រិត VIP មូលដ្ឋានទិន្នន័យ" },
  { icon: <Tag size={22} />, en: "Promotions", km: "ប្រូម៉ូសិន", descEn: "Coupon codes, happy hour, BOGO deals", descKm: "កូដបញ្ចុះតម្លៃ ម៉ោងរីករាយ ការផ្សព្វផ្សាយ" },
];

const stats = [
  { value: "13+", en: "Admin Features", km: "មុខងារគ្រប់គ្រង" },
  { value: "2", en: "Languages", km: "ភាសា" },
  { value: "24/7", en: "Always On", km: "ដំណើរការ​ជានិច្ច" },
  { value: "$9", en: "Starting Price", km: "តម្លៃចាប់ផ្តើម" },
];

const testimonials = [
  { name: "Chanthy S.", role: "Cafe Owner, BKK1", roleKm: "ម្ចាស់ហាងកាហ្វេ BKK1", text: "Batto Club transformed how we manage orders. Our staff loves the Khmer interface!", textKm: "Batto Club បានផ្លាស់ប្តូរការគ្រប់គ្រងបញ្ជារបស់យើង។ បុគ្គលិកចូលចិត្តចំណុចប្រទាក់ភាសាខ្មែរ!", rating: 5 },
  { name: "Rith P.", role: "Restaurant Manager", roleKm: "អ្នកគ្រប់គ្រងភោជនីយដ្ឋាន", text: "The inventory alerts save us from running out of ingredients. Best POS for Cambodia.", textKm: "ការជូនដំណឹងស្តុកជួយយើងពីការអស់គ្រឿងផ្សំ។ POS ល្អបំផុតសម្រាប់កម្ពុជា។", rating: 5 },
  { name: "Maly O.", role: "Food Court Owner", roleKm: "ម្ចាស់ Food Court", text: "Managing 3 vendors used to be chaotic. Now everything is organized in one place.", textKm: "ការគ្រប់គ្រង ៣ ហាងធ្លាប់ជារឿងចម្រូតពេក។ ឥឡូវអ្វីៗទាំងអស់រៀបចំក្នុងកន្លែងតែមួយ។", rating: 5 },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const { lang } = useTranslation();
  const l = (en: string, km: string) => (lang === "km" ? km : en);

  return (
    <div>
      {/* ===== ULTRA HERO ===== */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden min-h-[85vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-emerald-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
          {/* Floating orbs */}
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-emerald-600/15 rounded-full blur-[150px]" style={{ animationDelay: "1.5s", animationDuration: "4s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full mb-8 animate-fade-in-up" style={{ fontSize: "13px", fontWeight: 500 }}>
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-emerald-300" style={{ fontWeight: 600 }}>{l("New", "ថ្មី")}</span>
            <span className="w-px h-3 bg-white/20" />
            {l("QR Ordering & KHQR Payments", "បញ្ជាតាម QR និង KHQR")}
          </div>

          {/* Title */}
          <h1 className="text-white mb-8 animate-fade-in-up" style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, animationDelay: "100ms" }}>
            {l("The Ultimate POS for", "POS ជាន់ខ្ពស់សម្រាប់")}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                {l("Cambodian Restaurants", "ភោជនីយដ្ឋានកម្ពុជា")}
              </span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-500/20 rounded-full -z-0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ fontSize: "18px", lineHeight: 1.8, animationDelay: "200ms" }}>
            {l(
              "Manage orders, staff, inventory, customers, and reports — all in one beautiful app. Khmer & English. USD & KHR.",
              "គ្រប់គ្រងបញ្ជា បុគ្គលិក ស្តុក អតិថិជន និងរបាយការណ៍ — ក្នុងកម្មវិធីដ៏ស្រស់ស្អាតមួយ។ ខ្មែរ និង English។ USD និង KHR។"
            )}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <button onClick={() => onNavigate("register")} className="group px-10 py-4 gradient-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-emerald-500/25 flex items-center gap-3 press-effect" style={{ fontSize: "16px", fontWeight: 700 }}>
              {l("Start Free — 14 Days", "ចាប់ផ្តើមឥតគិតថ្លៃ — ១៤ ថ្ងៃ")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onNavigate("features")} className="group px-10 py-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all border border-white/15 backdrop-blur-md flex items-center gap-3 press-effect" style={{ fontSize: "16px", fontWeight: 600 }}>
              <Play size={16} className="text-emerald-400" />
              {l("Watch Demo", "មើលបង្ហាញ")}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            {[
              { icon: <Globe2 size={15} />, text: l("Khmer + English", "ខ្មែរ + English") },
              { icon: <Smartphone size={15} />, text: l("Mobile Ready", "សម្រាប់ទូរសព្ទ") },
              { icon: <Shield size={15} />, text: l("Bank-grade Security", "សុវត្ថិភាពថ្នាក់ធនាគារ") },
              { icon: <Zap size={15} />, text: l("Setup in 2 mins", "ដំឡើង ២ នាទី") },
            ].map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors" style={{ fontSize: "13px" }}>
                <span className="text-emerald-500/60">{h.icon}</span> {h.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-16 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 relative">
          {stats.map((s, i) => (
            <div key={i} className="text-center group">
              <p className="gradient-text mb-1" style={{ fontSize: "42px", fontWeight: 800 }}>{s.value}</p>
              <p className="text-gray-500 group-hover:text-emerald-600 transition-colors" style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px" }}>{lang === "km" ? s.km : s.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-5" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
              <Sparkles size={12} /> {l("FEATURES", "មុខងារ")}
            </div>
            <h2 className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.2 }}>
              {l("Everything You Need to", "អ្វីគ្រប់យ៉ាង​ដើម្បី")}
              <br />
              <span className="gradient-text">{l("Run Your Restaurant", "គ្រប់គ្រងភោជនីយដ្ឋាន")}</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto" style={{ fontSize: "16px", lineHeight: 1.7 }}>
              {l("From taking orders to managing your whole restaurant — Batto Club has it all.", "ពីការទទួលបញ្ជាដល់ការគ្រប់គ្រងភោជនីយដ្ឋានទាំងមូល — Batto Club មានទាំងអស់។")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {featureHighlights.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-7 hover-lift cursor-pointer group animate-fade-in-up">
                <div className="w-14 h-14 rounded-2xl gradient-primary-soft text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:gradient-primary group-hover:text-white transition-all duration-300">
                  <div className="group-hover:scale-110 transition-transform">{f.icon}</div>
                </div>
                <h3 className="text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" style={{ fontSize: "17px", fontWeight: 700 }}>{lang === "km" ? f.km : f.en}</h3>
                <p className="text-gray-500" style={{ fontSize: "14px", lineHeight: 1.7 }}>{lang === "km" ? f.descKm : f.descEn}</p>
                <div className="mt-4 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {l("Learn more", "ស្វែងយល់បន្ថែម")} <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => onNavigate("features")} className="px-8 py-3 gradient-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900 press-effect" style={{ fontSize: "14px", fontWeight: 600 }}>
              {l("See All 13+ Features", "មើលមុខងារ 13+ ទាំងអស់")} →
            </button>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/50 dark:to-gray-950" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-5" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
            <Tag size={12} /> {l("PRICING", "តម្លៃ")}
          </div>
          <h2 className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "36px", fontWeight: 800 }}>{l("Simple, Affordable Plans", "គម្រោងតម្លៃសមរម្យ")}</h2>
          <p className="text-gray-500 mb-14" style={{ fontSize: "16px" }}>{l("Start free, upgrade when you grow", "ចាប់ផ្តើមឥតគិតថ្លៃ ដំឡើងពេលអ្នកលូតលាស់")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Basic", nameKm: "មូលដ្ឋាន", price: 9, features: ["5 Staff", "POS + Menu", "Basic Reports"], featuresKm: ["បុគ្គលិក ៥", "POS + ម៉ឺន", "របាយការណ៍មូលដ្ឋាន"] },
              { name: "Pro", nameKm: "វិជ្ជាជីវៈ", price: 19, features: ["Unlimited Staff", "All Features", "Advanced Reports", "Inventory & CRM"], featuresKm: ["បុគ្គលិកគ្មានកំណត់", "មុខងារទាំងអស់", "របាយការណ៍កម្រិតខ្ពស់", "ស្តុក និង CRM"], popular: true },
              { name: "Enterprise", nameKm: "សហគ្រាស", price: 39, features: ["Everything in Pro", "Custom Roles", "API Access", "Priority Support"], featuresKm: ["គ្រប់យ៉ាងក្នុង Pro", "តួនាទីផ្ទាល់ខ្លួន", "API Access", "ជំនួយអាទិភាព"] },
            ].map((plan, i) => (
              <div key={i} className={`rounded-3xl p-8 text-left relative transition-all hover-lift ${(plan as { popular?: boolean }).popular ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/40 scale-105 z-10" : "glass-card"}`}>
                {(plan as { popular?: boolean }).popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-emerald-600 rounded-full shadow-lg" style={{ fontSize: "11px", fontWeight: 700 }}>
                    <Award size={12} className="inline mr-1" />{l("Most Popular", "ពេញនិយមបំផុត")}
                  </span>
                )}
                <p className={(plan as { popular?: boolean }).popular ? "text-white/80" : "text-gray-500"} style={{ fontSize: "14px", fontWeight: 600 }}>{lang === "km" ? plan.nameKm : plan.name}</p>
                <p className="mt-3 mb-6">
                  <span className={(plan as { popular?: boolean }).popular ? "text-white" : "text-gray-900 dark:text-white"} style={{ fontSize: "44px", fontWeight: 800 }}>${plan.price}</span>
                  <span className={(plan as { popular?: boolean }).popular ? "text-white/60" : "text-gray-400"} style={{ fontSize: "15px" }}>/{l("month", "ខែ")}</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {(lang === "km" ? plan.featuresKm : plan.features).map((f, j) => (
                    <li key={j} className={`flex items-center gap-2.5 ${(plan as { popular?: boolean }).popular ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`} style={{ fontSize: "14px" }}>
                      <Check size={16} className={(plan as { popular?: boolean }).popular ? "text-white" : "text-emerald-500"} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate("register")} className={`w-full py-3.5 rounded-2xl transition-all press-effect ${(plan as { popular?: boolean }).popular ? "bg-white text-emerald-600 hover:bg-green-50 shadow-lg font-bold" : "gradient-primary text-white hover:opacity-90 shadow-md"}`} style={{ fontSize: "14px", fontWeight: 700 }}>
                  {l("Get Started", "ចាប់ផ្តើម")}
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate("pricing")} className="mt-10 text-emerald-600 dark:text-emerald-400 hover:underline" style={{ fontSize: "14px", fontWeight: 600 }}>{l("Compare all plans", "ប្រៀបធៀបគម្រោងទាំងអស់")} →</button>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-0 w-72 h-72 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[100px]" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-5" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
              <Star size={12} /> {l("TESTIMONIALS", "ការលើកសរសើរ")}
            </div>
            <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "36px", fontWeight: 800 }}>{l("Loved by Restaurants", "ដែលភោជនីយដ្ឋានចូលចិត្ត")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-7 hover-lift animate-fade-in-up relative">
                <Quote size={32} className="absolute top-5 right-5 text-emerald-500/10" />
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={15} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-gray-600 dark:text-gray-400 mb-6" style={{ fontSize: "15px", lineHeight: 1.8, fontStyle: "italic" }}>"{lang === "km" ? t.textKm : t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white" style={{ fontSize: "14px", fontWeight: 700 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>{t.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "12px" }}>{lang === "km" ? t.roleKm : t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-full mb-8" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Zap size={12} /> {l("14-DAY FREE TRIAL", "សាកល្បង ១៤ ថ្ងៃ")}
          </div>
          <h2 className="text-white mb-6" style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.2 }}>{l("Ready to Transform Your Restaurant?", "ត្រៀមខ្លួនផ្លាស់ប្តូរភោជនីយដ្ឋាន?")}</h2>
          <p className="text-green-100/80 mb-10" style={{ fontSize: "17px", lineHeight: 1.7 }}>{l("Start your 14-day free trial. No credit card required.", "ចាប់ផ្តើមការសាកល្បង ១៤ ថ្ងៃឥតគិតថ្លៃ។ មិនត្រូវការកាតឥណទានទេ។")}</p>
          <button onClick={() => onNavigate("register")} className="group px-12 py-4.5 bg-white text-emerald-600 rounded-2xl hover:bg-green-50 transition-all shadow-2xl press-effect" style={{ fontSize: "17px", fontWeight: 700 }}>
            {l("Start Free Trial", "ចាប់ផ្តើមឥតគិតថ្លៃ")}
            <ArrowRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
