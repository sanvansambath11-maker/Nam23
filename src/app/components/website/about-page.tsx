import { useTranslation } from "../translation-context";
import { Heart, Target, Eye, Users, Globe2, Zap, Sparkles, Award, Code2, Coffee, MapPin, ArrowRight } from "lucide-react";

export function AboutPage() {
  const { lang } = useTranslation();
  const l = (en: string, km: string) => (lang === "km" ? km : en);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-white dark:from-gray-950 dark:via-emerald-950/10 dark:to-gray-950" />
        <div className="absolute top-20 right-[20%] w-80 h-80 bg-emerald-200/30 dark:bg-emerald-800/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[10%] w-64 h-64 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-6 animate-fade-in-up" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
            <Sparkles size={12} /> {l("ABOUT US", "អំពីយើង")}
          </div>
          <h1 className="text-gray-900 dark:text-white mb-8 animate-fade-in-up" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.15, animationDelay: "100ms" }}>
            {l("Building the Future of", "បង្កើតអនាគតរបស់")}
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              {l("Cambodian F&B", "ឧស្សាហកម្មម្ហូបអាហារកម្ពុជា")}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ fontSize: "18px", lineHeight: 1.9, animationDelay: "200ms" }}>
            {l(
              "Batto Club was born from a simple observation: Cambodian restaurants deserve world-class technology that speaks their language and understands their needs.",
              "Batto Club កើតចេញពីការសង្កេតសាមញ្ញមួយ៖ ភោជនីយដ្ឋានកម្ពុជាសមនឹងទទួលបានបច្ចេកវិទ្យាថ្នាក់ពិភពលោកដែលនិយាយភាសារបស់ពួកគេ។"
            )}
          </p>
        </div>
      </section>

      {/* ===== MISSION / VISION / VALUES ===== */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/20 to-transparent dark:via-emerald-950/5" />
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative stagger-children">
          {[
            { icon: <Target size={26} />, color: "from-red-500 to-rose-600", title: l("Our Mission", "បេសកកម្ម"), desc: l("Empower every restaurant in Cambodia with affordable, easy-to-use technology that grows with their business.", "ផ្តល់សិទ្ធិអំណាចដល់ភោជនីយដ្ឋានគ្រប់ទីកន្លែងក្នុងកម្ពុជាជាមួយបច្ចេកវិទ្យាដែលមានតម្លៃសមរម្យ។") },
            { icon: <Eye size={26} />, color: "from-blue-500 to-indigo-600", title: l("Our Vision", "ចក្ខុវិស័យ"), desc: l("A Cambodia where every food business — from street vendors to fine dining — runs efficiently with smart technology.", "កម្ពុជាដែលអាជីវកម្មម្ហូបអាហារគ្រប់កន្លែង ដំណើរការប្រកបដោយប្រសិទ្ធភាពជាមួយបច្ចេកវិទ្យាឆ្លាតវៃ។") },
            { icon: <Heart size={26} />, color: "from-emerald-500 to-green-600", title: l("Our Values", "គុណតម្លៃ"), desc: l("Built in Cambodia, for Cambodia. We prioritize simplicity, affordability, and local language support above everything.", "បង្កើតនៅកម្ពុជា សម្រាប់កម្ពុជា។ យើងផ្តល់អាទិភាពដល់ភាពសាមញ្ញ តម្លៃសមរម្យ និងការគាំទ្រភាសាខ្មែរ។") },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-3xl p-8 text-center hover-lift animate-fade-in-up group">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: "20px", fontWeight: 700 }}>{item.title}</h3>
              <p className="text-gray-500" style={{ fontSize: "14px", lineHeight: 1.8 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY CAMBODIA ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-5" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
              <MapPin size={12} /> {l("MADE IN CAMBODIA", "ផលិតនៅកម្ពុជា")}
            </div>
            <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "36px", fontWeight: 800 }}>{l("Why We Built This for Cambodia", "ហេតុអ្វីយើងបង្កើតសម្រាប់កម្ពុជា")}</h2>
          </div>
          <div className="space-y-5 stagger-children">
            {[
              { icon: <Globe2 size={22} />, gradient: "from-blue-500 to-cyan-500", title: l("Language First", "ភាសាជាអាទិភាព"), desc: l("Most POS systems only support English. Batto Club speaks Khmer natively — menus, receipts, reports, everything.", "ប្រព័ន្ធ POS ភាគច្រើនគាំទ្រតែភាសាអង់គ្លេស។ Batto Club និយាយភាសាខ្មែរ — ម៉ឺន វិក័យប័ត្រ របាយការណ៍ អ្វីៗទាំងអស់។") },
              { icon: <Zap size={22} />, gradient: "from-amber-500 to-orange-500", title: l("Built for Local Payments", "បង្កើតសម្រាប់ការបង់ប្រាក់ក្នុងស្រុក"), desc: l("USD + KHR dual currency, KHQR ready, ABA & Wing integration — because that's how Cambodia pays.", "រូបិយប័ណ្ណ USD + KHR ទ្វេ ត្រៀម KHQR រួមបញ្ចូល ABA និង Wing — ព្រោះនេះជារបៀបដែលកម្ពុជាបង់ប្រាក់។") },
              { icon: <Users size={22} />, gradient: "from-emerald-500 to-green-500", title: l("Simple for Everyone", "សាមញ្ញសម្រាប់អ្នកទាំងអស់គ្នា"), desc: l("PIN login, visual menus, one-tap ordering — designed for staff who may not be tech-savvy.", "ចូលដោយ PIN ម៉ឺនរូបភាព បញ្ជាតាមប៉ះម្តង — រចនាសម្រាប់បុគ្គលិកដែលប្រហែលជាមិនចេះបច្ចេកវិទ្យា។") },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-7 flex gap-6 hover-lift animate-fade-in-up group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-2" style={{ fontSize: "18px", fontWeight: 700 }}>{item.title}</h3>
                  <p className="text-gray-500" style={{ fontSize: "15px", lineHeight: 1.8 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/30 dark:to-gray-950" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-5" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
            <Coffee size={12} /> {l("THE TEAM", "ក្រុម")}
          </div>
          <h2 className="text-gray-900 dark:text-white mb-6" style={{ fontSize: "36px", fontWeight: 800 }}>
            {l("Built by", "បង្កើតដោយ")} <span className="gradient-text">{l("Cambodians", "ជនជាតិកម្ពុជា")}</span>
          </h2>
          <p className="text-gray-500 mb-12" style={{ fontSize: "16px", lineHeight: 1.8 }}>
            {l(
              "We're a small, passionate team based in Phnom Penh. We eat at the same restaurants we build for, and we understand the challenges of running a food business in Cambodia.",
              "យើងជាក្រុមតូចមួយដែលមានចំណង់ចំណូលចិត្ត មានមូលដ្ឋាននៅភ្នំពេញ។ យើងញ៉ាំនៅភោជនីយដ្ឋានដូចគ្នាដែលយើងបង្កើតសម្រាប់។"
            )}
          </p>

          {/* Founder Card */}
          <div className="glass-card rounded-3xl p-8 inline-flex items-center gap-6 hover-lift">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40" style={{ fontSize: "28px", fontWeight: 800 }}>S</div>
            <div className="text-left">
              <p className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>Sambath</p>
              <p className="text-emerald-600 dark:text-emerald-400 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l("Founder & Developer", "ស្ថាបនិក និង អ្នកអភិវឌ្ឍន៍")}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "12px" }}><Code2 size={12} /> Full-Stack</span>
                <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "12px" }}><MapPin size={12} /> Phnom Penh</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-16">
            {[
              { value: "2025", label: l("Founded", "បង្កើត") },
              { value: "🇰🇭", label: l("Made in Cambodia", "ផលិតនៅកម្ពុជា") },
              { value: "∞", label: l("Passion", "ចំណង់ចំណូលចិត្ត") },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-5">
                <p className="gradient-text mb-1" style={{ fontSize: "28px", fontWeight: 800 }}>{s.value}</p>
                <p className="text-gray-500" style={{ fontSize: "12px", fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
