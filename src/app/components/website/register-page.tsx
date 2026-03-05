import { useState } from "react";
import { useTranslation } from "../translation-context";
import { Eye, EyeOff, Check, ArrowRight, Shield, Loader2, Sparkles, Zap, Gift, Crown, Building2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { registerRestaurant } from "../../../lib/auth-service";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: () => void;
}

const plans = [
  {
    key: "trial",
    name: "Free Trial",
    nameKm: "សាកល្បងឥតគិតថ្លៃ",
    price: 0,
    duration: "14 days",
    durationKm: "១៤ ថ្ងៃ",
    icon: <Gift size={20} />,
    gradient: "from-violet-500 to-purple-600",
    features: ["Full POS access", "3 Staff accounts", "All core features", "No credit card"],
    featuresKm: ["ប្រើ POS ពេញលេញ", "គណនីបុគ្គលិក ៣", "មុខងារស្នូលទាំងអស់", "មិនចាំបាច់កាតឥណទាន"],
  },
  {
    key: "basic",
    name: "Basic",
    nameKm: "មូលដ្ឋាន",
    price: 9,
    icon: <Zap size={20} />,
    gradient: "from-blue-500 to-cyan-500",
    features: ["5 Staff accounts", "POS + Menu", "Basic reports", "Email support"],
    featuresKm: ["គណនីបុគ្គលិក ៥", "POS + ម៉ឺន", "របាយការណ៍មូលដ្ឋាន", "ជំនួយអ៊ីមែល"],
  },
  {
    key: "pro",
    name: "Pro",
    nameKm: "វិជ្ជាជីវៈ",
    price: 19,
    popular: true,
    icon: <Crown size={20} />,
    gradient: "from-emerald-500 to-green-600",
    features: ["Unlimited staff", "All features", "Advanced reports", "Inventory & CRM"],
    featuresKm: ["បុគ្គលិកគ្មានកំណត់", "មុខងារទាំងអស់", "របាយការណ៍កម្រិតខ្ពស់", "ស្តុក និង CRM"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    nameKm: "សហគ្រាស",
    price: 39,
    icon: <Building2 size={20} />,
    gradient: "from-amber-500 to-orange-500",
    features: ["Everything in Pro", "Custom roles", "API access", "Priority support"],
    featuresKm: ["គ្រប់យ៉ាងក្នុង Pro", "តួនាទីផ្ទាល់ខ្លួន", "API Access", "ជំនួយអាទិភាព"],
  },
];

export function RegisterPage({ onNavigate, onRegisterSuccess }: RegisterPageProps) {
  const { lang } = useTranslation();
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("trial");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState({
    restaurantName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!form.restaurantName || !form.ownerName || !form.phone || !form.email || !form.password) {
      toast.error(l("Please fill in all fields", "សូមបំពេញគ្រប់ចន្លោះ"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error(l("Passwords don't match", "ពាក្យសម្ងាត់មិនត្រូវគ្នា"));
      return;
    }
    if (form.password.length < 6) {
      toast.error(l("Password must be at least 6 characters", "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ"));
      return;
    }
    if (!agreed) {
      toast.error(l("Please agree to the terms", "សូមយល់ព្រមលើលក្ខខណ្ឌ"));
      return;
    }

    setLoading(true);
    try {
      const result = await registerRestaurant({
        email: form.email,
        password: form.password,
        restaurantName: form.restaurantName,
        ownerName: form.ownerName,
        phone: form.phone,
        plan: selectedPlan as "trial" | "basic" | "pro" | "enterprise",
      });

      if (!result.success) {
        toast.error(result.error ?? l("Registration failed", "ការចុះឈ្មោះបរាជ័យ"));
        return;
      }

      localStorage.setItem("battoclub_user", JSON.stringify({
        restaurantName: form.restaurantName,
        ownerName: form.ownerName,
        phone: form.phone,
        email: form.email,
        plan: selectedPlan,
        registeredAt: new Date().toISOString(),
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      toast.success(l("Welcome to Batto Club! Your 14-day trial starts now.", "សូមស្វាគមន៍មកកាន់ Batto Club! ការសាកល្បង ១៤ ថ្ងៃរបស់អ្នកចាប់ផ្តើមឥឡូវ។"), { duration: 3000 });
      onRegisterSuccess();
    } catch {
      toast.error(l("Something went wrong. Please try again.", "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) => `w-full px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 rounded-2xl outline-none text-gray-700 dark:text-gray-300 focus:border-emerald-500 transition-all ${focused === field ? "ring-2 ring-emerald-500/20" : ""}`;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/10" />
      <div className="absolute top-40 right-[10%] w-80 h-80 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-purple-100/20 dark:bg-purple-900/5 rounded-full blur-[100px]" />

      <div className="relative pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <button onClick={() => onNavigate("home")} className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 transition-colors press-effect" style={{ fontSize: "13px", fontWeight: 500 }}>
              <ArrowLeft size={16} /> {l("Back to Home", "ត្រឡប់ទៅទំព័រដើម")}
            </button>
            <div className="flex items-center justify-center gap-2 mb-5">
              <img src="/images/logo.png" alt="Batto Club" className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
            </div>
            <h1 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: "32px", fontWeight: 800 }}>
              {l("Create Your Account", "បង្កើតគណនីរបស់អ្នក")}
            </h1>
            <p className="text-gray-500" style={{ fontSize: "15px" }}>
              {l("Start with a 14-day free trial • No credit card required", "ចាប់ផ្តើមជាមួយការសាកល្បង ១៤ ថ្ងៃ • មិនត្រូវការកាតឥណទាន")}
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${step >= s ? "gradient-primary text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`} style={{ fontSize: "13px", fontWeight: 700 }}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span className={`hidden sm:block transition-colors ${step >= s ? "text-gray-900 dark:text-white" : "text-gray-400"}`} style={{ fontSize: "13px", fontWeight: step >= s ? 600 : 500 }}>
                  {s === 1 ? l("Choose Plan", "ជ្រើសរើសគម្រោង") : l("Your Info", "ព័ត៌មានរបស់អ្នក")}
                </span>
                {s < 2 && <div className={`w-16 h-0.5 rounded-full mx-1 transition-colors ${step > 1 ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            /* ===== PLAN SELECTION ===== */
            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {plans.map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`text-left rounded-2xl p-5 transition-all relative press-effect hover-lift ${selectedPlan === plan.key
                      ? "glass-card border-2 border-emerald-500 shadow-lg gradient-glow"
                      : "glass-card hover:shadow-md"
                      }`}
                  >
                    {/* Popular badge */}
                    {(plan as { popular?: boolean }).popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-primary text-white rounded-full shadow-md" style={{ fontSize: "10px", fontWeight: 700 }}>
                        <Sparkles size={10} className="inline mr-1" />{l("Popular", "ពេញនិយម")}
                      </span>
                    )}

                    {/* Trial badge */}
                    {plan.key === "trial" && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full shadow-md" style={{ fontSize: "10px", fontWeight: 700 }}>
                        <Gift size={10} className="inline mr-1" />{l("Free", "ឥតគិតថ្លៃ")}
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} text-white flex items-center justify-center shadow-md`}>
                        {plan.icon}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === plan.key ? "border-emerald-500 bg-emerald-500" : "border-gray-300 dark:border-gray-600"}`}>
                        {selectedPlan === plan.key && <Check size={12} className="text-white" />}
                      </div>
                    </div>

                    {/* Plan name */}
                    <p className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "15px", fontWeight: 700 }}>
                      {lang === "km" ? plan.nameKm : plan.name}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      {plan.price === 0 ? (
                        <div>
                          <span className="gradient-text" style={{ fontSize: "28px", fontWeight: 800 }}>{l("FREE", "ឥតគិតថ្លៃ")}</span>
                          <p className="text-gray-400" style={{ fontSize: "11px" }}>{lang === "km" ? plan.durationKm : plan.duration}</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-gray-900 dark:text-white" style={{ fontSize: "28px", fontWeight: 800 }}>${plan.price}</span>
                          <span className="text-gray-400" style={{ fontSize: "12px" }}>/{l("mo", "ខែ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {(lang === "km" ? plan.featuresKm : plan.features).map((f, j) => (
                        <li key={j} className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "12px" }}>
                          <Check size={12} className="text-emerald-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {/* Continue button */}
              <button onClick={() => setStep(2)} className="w-full py-4 gradient-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900 flex items-center justify-center gap-2.5 press-effect gradient-glow" style={{ fontSize: "16px", fontWeight: 700 }}>
                {selectedPlan === "trial" ? l("Start Free Trial", "ចាប់ផ្តើមសាកល្បង") : l("Continue", "បន្ត")} <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* ===== REGISTRATION FORM ===== */
            <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
              {/* Selected plan badge */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {(() => {
                    const plan = plans.find(p => p.key === selectedPlan)!;
                    return (
                      <>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} text-white flex items-center justify-center shadow-md`}>
                          {plan.icon}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 700 }}>{lang === "km" ? plan.nameKm : plan.name}</p>
                          <p className="text-gray-400" style={{ fontSize: "12px" }}>
                            {plan.price === 0 ? l("14 days free", "១៤ ថ្ងៃឥតគិតថ្លៃ") : `$${plan.price}/${l("month", "ខែ")}`}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => setStep(1)} className="text-emerald-600 dark:text-emerald-400 hover:underline" style={{ fontSize: "12px", fontWeight: 600 }}>{l("Change", "ប្តូរ")}</button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Restaurant Name", "ឈ្មោះភោជនីយដ្ឋាន")} *</label>
                  <input type="text" value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} onFocus={() => setFocused("rn")} onBlur={() => setFocused(null)} className={inputCls("rn")} style={{ fontSize: "14px" }} placeholder={l("e.g. Cafe Mekong", "ឧ. ហាងកាហ្វេ មេគង្គ")} />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Owner Name", "ឈ្មោះម្ចាស់")} *</label>
                  <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} onFocus={() => setFocused("on")} onBlur={() => setFocused(null)} className={inputCls("on")} style={{ fontSize: "14px" }} placeholder={l("Your full name", "ឈ្មោះពេញរបស់អ្នក")} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Phone Number", "លេខទូរសព្ទ")} *</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onFocus={() => setFocused("ph")} onBlur={() => setFocused(null)} className={inputCls("ph")} style={{ fontSize: "14px" }} placeholder="012 xxx xxx" />
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Email", "អ៊ីមែល")} *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onFocus={() => setFocused("em")} onBlur={() => setFocused(null)} className={inputCls("em")} style={{ fontSize: "14px" }} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Password", "ពាក្យសម្ងាត់")} *</label>
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)} className={`${inputCls("pw")} pr-12`} style={{ fontSize: "14px" }} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-10 text-gray-400 hover:text-gray-600 transition-colors">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Confirm Password", "បញ្ជាក់ពាក្យសម្ងាត់")} *</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} onFocus={() => setFocused("cp")} onBlur={() => setFocused(null)} className={inputCls("cp")} style={{ fontSize: "14px" }} placeholder="••••••••" />
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 rounded-md accent-emerald-500 mt-1" />
                  <span className="text-gray-500" style={{ fontSize: "12px", lineHeight: 1.7 }}>{l("I agree to the Terms of Service and Privacy Policy. I understand this starts a 14-day free trial.", "ខ្ញុំយល់ព្រមលើលក្ខខណ្ឌសេវាកម្ម និង គោលការណ៍ភាពឯកជន។ ខ្ញុំយល់ថានេះចាប់ផ្តើមការសាកល្បង ១៤ ថ្ងៃ។")}</span>
                </label>

                {/* Trial info */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center shadow-md shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-emerald-700 dark:text-emerald-400" style={{ fontSize: "13px", fontWeight: 600 }}>{l("14-Day Free Trial", "សាកល្បង ១៤ ថ្ងៃ")}</p>
                    <p className="text-emerald-600/70 dark:text-emerald-500/70" style={{ fontSize: "11px" }}>{l("No payment needed to start. Cancel anytime.", "មិនចាំបាច់បង់ប្រាក់។ បោះបង់គ្រប់ពេល។")}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="px-6 py-4 glass-card text-gray-700 dark:text-gray-300 rounded-2xl press-effect" style={{ fontSize: "14px", fontWeight: 600 }}>{l("Back", "ថយក្រោយ")}</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 py-4 gradient-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900 disabled:opacity-50 flex items-center justify-center gap-2.5 press-effect gradient-glow" style={{ fontSize: "15px", fontWeight: 700 }}>
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? l("Creating...", "កំពុងបង្កើត...") : l("Create Account & Start Trial", "បង្កើតគណនី និង ចាប់ផ្តើមសាកល្បង")}
                  </button>
                </div>
              </div>

              <p className="text-center text-gray-400 mt-8" style={{ fontSize: "13px" }}>
                {l("Already have an account?", "មានគណនីរួចហើយ?")} <button onClick={() => onNavigate("login")} className="gradient-text hover:opacity-80 transition-opacity" style={{ fontWeight: 700 }}>{l("Login", "ចូល")}</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
