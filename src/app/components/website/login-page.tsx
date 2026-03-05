import { useState } from "react";
import { useTranslation } from "../translation-context";
import { Eye, EyeOff, LogIn, Loader2, Sparkles, Shield, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "../../../lib/auth-service";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const { lang } = useTranslation();
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error(l("Please enter email and password", "សូមបញ្ចូលអ៊ីមែល និង ពាក្យសម្ងាត់"));
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ email: form.email, password: form.password });

      if (!result.success) {
        toast.error(result.error ?? l("Invalid email or password", "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ"));
        return;
      }

      if (result.restaurant) {
        localStorage.setItem("battoclub_user", JSON.stringify({
          restaurantName: result.restaurant.name,
          ownerName: result.restaurant.owner_name,
          phone: result.restaurant.phone,
          email: result.restaurant.email ?? form.email,
          plan: result.restaurant.plan,
          registeredAt: result.restaurant.created_at,
          trialEnds: result.restaurant.trial_ends ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }));
      }

      const userName = result.restaurant?.owner_name ?? "";
      toast.success(`${l("Welcome back", "សូមស្វាគមន៍មកវិញ")}${userName ? `, ${userName}` : ""}!`, { duration: 2000 });
      onLoginSuccess();
    } catch {
      toast.error(l("Something went wrong", "មានបញ្ហាកើតឡើង"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ===== LEFT: BRANDING PANEL ===== */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />

        <div className="relative z-10 text-white max-w-md">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors press-effect" style={{ fontSize: "13px", fontWeight: 500 }}>
            <ArrowLeft size={16} /> {l("Back to Home", "ត្រឡប់ទៅទំព័រដើម")}
          </button>
          <div className="flex items-center gap-3 mb-10">
            <img src="/images/logo.png" alt="Batto Club" className="h-14 w-14 rounded-2xl object-cover shadow-xl" />
            <div>
              <span style={{ fontSize: "22px", fontWeight: 800 }}>Batto</span>
              <span className="text-green-200 ml-1" style={{ fontSize: "22px", fontWeight: 800 }}>Club</span>
              <p className="text-white/60 -mt-0.5" style={{ fontSize: "11px", fontWeight: 500 }}>Restaurant POS Platform</p>
            </div>
          </div>

          <h2 className="mb-6" style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2 }}>
            {l("Power your restaurant with smart technology", "ផ្តល់ថាមពលដល់ភោជនីយដ្ឋានជាមួយបច្ចេកវិទ្យា")}
          </h2>
          <p className="text-white/70 mb-10" style={{ fontSize: "15px", lineHeight: 1.8 }}>
            {l("Join hundreds of Cambodian restaurants using Batto Club to manage their business efficiently.", "ចូលរួមជាមួយភោជនីយដ្ឋានរាប់រយក្នុងកម្ពុជា។")}
          </p>

          <div className="space-y-4">
            {[
              { icon: <Shield size={16} />, text: l("Secure & reliable", "មានសុវត្ថិភាព និង ជឿជាក់បាន") },
              { icon: <Zap size={16} />, text: l("Set up in 2 minutes", "ដំឡើងក្នុង ២ នាទី") },
              { icon: <Sparkles size={16} />, text: l("14-day free trial", "សាកល្បង ១៤ ថ្ងៃ") },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80" style={{ fontSize: "14px" }}>
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">{item.icon}</div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT: LOGIN FORM ===== */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/10" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Back to Home - mobile */}
          <button onClick={() => onNavigate("home")} className="lg:hidden flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 transition-colors press-effect" style={{ fontSize: "13px", fontWeight: 500 }}>
            <ArrowLeft size={16} /> {l("Back to Home", "ត្រឡប់ទៅទំព័រដើម")}
          </button>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <img src="/images/logo.png" alt="Batto Club" className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
            </div>
            <h1 className="text-gray-900 dark:text-white mb-2" style={{ fontSize: "30px", fontWeight: 800 }}>
              {l("Welcome Back", "សូមស្វាគមន៍មកវិញ")} 👋
            </h1>
            <p className="text-gray-500" style={{ fontSize: "15px" }}>
              {l("Log in to your Batto Club dashboard", "ចូលទៅផ្ទាំងគ្រប់គ្រង Batto Club របស់អ្នក")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="glass-card rounded-3xl p-8 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                {l("Email Address", "អ៊ីមែល")}
              </label>
              <div className={`relative rounded-2xl transition-all duration-200 ${focused === "email" ? "ring-2 ring-emerald-500/30" : ""}`}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="w-full px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 rounded-2xl outline-none text-gray-700 dark:text-gray-300 focus:border-emerald-500 transition-colors"
                  style={{ fontSize: "14px" }}
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                {l("Password", "ពាក្យសម្ងាត់")}
              </label>
              <div className={`relative rounded-2xl transition-all duration-200 ${focused === "password" ? "ring-2 ring-emerald-500/30" : ""}`}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="w-full px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 rounded-2xl outline-none text-gray-700 dark:text-gray-300 focus:border-emerald-500 transition-colors pr-12"
                  style={{ fontSize: "14px" }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded-md accent-emerald-500" />
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors" style={{ fontSize: "13px" }}>{l("Remember me", "ចងចាំខ្ញុំ")}</span>
              </label>
              <button type="button" className="gradient-text hover:opacity-80 transition-opacity" style={{ fontSize: "13px", fontWeight: 600 }}>
                {l("Forgot password?", "ភ្លេចពាក្យសម្ងាត់?")}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 gradient-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 flex items-center justify-center gap-2.5 disabled:opacity-50 press-effect gradient-glow"
              style={{ fontSize: "15px", fontWeight: 700 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? l("Logging in...", "កំពុងចូល...") : l("Sign In", "ចូល")}
            </button>


          </form>

          {/* Register link */}
          <p className="text-center text-gray-400 mt-8" style={{ fontSize: "14px" }}>
            {l("Don't have an account?", "មិនមានគណនី?")}
            <button onClick={() => onNavigate("register")} className="ml-1 gradient-text hover:opacity-80 transition-opacity inline-flex items-center gap-1" style={{ fontWeight: 700 }}>
              {l("Register Free", "ចុះឈ្មោះឥតគិតថ្លៃ")} <ArrowRight size={14} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
