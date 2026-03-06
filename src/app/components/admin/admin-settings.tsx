import { useState, useRef } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import { useInvoice } from "../invoice-context";
import { toast } from "sonner";
import {
  Store,
  Clock,
  DollarSign,
  Printer,
  Bell,
  Wifi,
  Save,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileText,
  MessageCircle,
  Send,
  Check,
  AlertTriangle,
  ShoppingBag,
  BarChart3,
  Users,
  CreditCard,
  XCircle,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Upload,
  Image,
  Trash2,
  Receipt,
  Building,
} from "lucide-react";
import { saveTelegramSettings, getTelegramStorageKey } from "../../../lib/telegram-notify";

interface TelegramAlerts {
  newOrder: boolean;
  lowStock: boolean;
  dailySummary: boolean;
  staffClock: boolean;
  paymentReceived: boolean;
  orderVoid: boolean;
}

interface RestaurantSettings {
  name: string;
  nameKm: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  vatRate: number;
  serviceCharge: number;
  openTime: string;
  closeTime: string;
  currency: string;
  khrRate: number;
  printerEnabled: boolean;
  telegramNotify: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  telegramAlerts: TelegramAlerts;
  telegramConnected: boolean;
  wifiName: string;
  wifiPassword: string;
  receiptFooter: string;
}

const defaultSettings: RestaurantSettings = {
  name: "POS Batto",
  nameKm: "កាហ្វេ សង់",
  address: "St. 214, Phnom Penh, Cambodia",
  phone: "+855 23 456 789",
  email: "info@posbatto.kh",
  taxId: "TIN-KH-1234567",
  vatRate: 10,
  serviceCharge: 0,
  openTime: "07:00",
  closeTime: "22:00",
  currency: "USD",
  khrRate: 4100,
  printerEnabled: true,
  telegramNotify: false,
  telegramBotToken: "",
  telegramChatId: "",
  telegramAlerts: {
    newOrder: true,
    lowStock: true,
    dailySummary: true,
    staffClock: false,
    paymentReceived: false,
    orderVoid: true,
  },
  telegramConnected: false,
  wifiName: "POS-Batto-Guest",
  wifiPassword: "welcome2025",
  receiptFooter: "Thank you for dining with us!\nអរគុណសម្រាប់ការញ៉ាំ!",
};

function loadTelegramFromStorage(): Partial<RestaurantSettings> {
  try {
    const raw = localStorage.getItem(getTelegramStorageKey());
    if (!raw) return {};
    const data = JSON.parse(raw);
    return {
      telegramNotify: !!data.enabled,
      telegramBotToken: data.botToken || "",
      telegramChatId: data.chatId || "",
      telegramAlerts: data.alerts
        ? {
          newOrder: data.alerts.newOrder !== false,
          lowStock: data.alerts.lowStock !== false,
          dailySummary: data.alerts.dailySummary !== false,
          staffClock: !!data.alerts.staffClock,
          paymentReceived: data.alerts.paymentReceived !== false,
          orderVoid: data.alerts.orderVoid !== false,
        }
        : defaultSettings.telegramAlerts,
      telegramConnected: !!data.enabled && !!data.botToken && !!data.chatId,
    };
  } catch {
    return {};
  }
}

export function AdminSettings() {
  const { lang, fontClass } = useTranslation();
  const { khrRate } = useCurrency();
  const { invoiceSettings, updateInvoiceSetting } = useInvoice();
  const [settings, setSettings] = useState<RestaurantSettings>(() => ({
    ...defaultSettings,
    khrRate,
    ...loadTelegramFromStorage(),
  }));
  const [saved, setSaved] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    // Sync restaurant info to invoice settings
    updateInvoiceSetting("businessName", settings.name);
    updateInvoiceSetting("businessNameKm", settings.nameKm);
    updateInvoiceSetting("address", settings.address);
    updateInvoiceSetting("phone", settings.phone);
    updateInvoiceSetting("email", settings.email);
    updateInvoiceSetting("taxId", settings.taxId);
    updateInvoiceSetting("vatRate", settings.vatRate);
    // Persist Telegram so POS can send automated alerts (e.g. payment received)
    saveTelegramSettings({
      enabled: settings.telegramNotify && !!settings.telegramBotToken && !!settings.telegramChatId,
      botToken: settings.telegramBotToken,
      chatId: settings.telegramChatId,
      alerts: settings.telegramAlerts,
    });
    // Persist restaurantName specifically so it's accessible across the app
    try {
      const u = localStorage.getItem("battoclub_user");
      if (u) {
        const j = JSON.parse(u);
        j.restaurantName = settings.name;
        localStorage.setItem("battoclub_user", JSON.stringify(j));
      }
    } catch { /* ignore */ }
    toast.success(lang === "km" ? "បានរក្សាទុកការកំណត់" : "Settings saved");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(lang === "km" ? "ទំហំឯកសារធំពេក (អតិបរមា 2MB)" : "File too large (max 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      updateInvoiceSetting("logo", result);
      setSaved(false);
      toast.success(lang === "km" ? "បានផ្ទុកឡូហ្គោ" : "Logo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateInvoiceSetting("logo", "");
    setSaved(false);
    toast.info(lang === "km" ? "បានលុបឡូហ្គោ" : "Logo removed");
  };

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
        <span className="text-[#22C55E]">{icon}</span>
        <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-gray-500 dark:text-gray-400 mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300";

  return (
    <div className={`p-6 ${fontClass}`}>
      {/* Save bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400" style={{ fontSize: "13px" }}>
          {lang === "km" ? "កែប្រែការកំណត់ភោជនីយដ្ឋានរបស់អ្នក" : "Configure your restaurant settings"}
        </p>
        <button
          onClick={handleSave}
          disabled={saved}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${saved
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default"
            : "bg-[#22C55E] text-white hover:bg-green-600 shadow-md shadow-green-200 dark:shadow-green-900"
            }`}
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          <Save size={16} />
          {lang === "km" ? "រក្សាទុក" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Restaurant info */}
        <Section
          title={lang === "km" ? "ព័ត៌មានភោជនីយដ្ឋាន" : "Restaurant Info"}
          icon={<Store size={18} />}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "ឈ្មោះ (English)" : "Name (English)"}>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
            <Field label={lang === "km" ? "ឈ្មោះ (ខ្មែរ)" : "Name (Khmer)"}>
              <input
                type="text"
                value={settings.nameKm}
                onChange={(e) => update("nameKm", e.target.value)}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
          </div>
          <Field label={lang === "km" ? "អាសយដ្ឋាន" : "Address"}>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={settings.address}
                onChange={(e) => update("address", e.target.value)}
                className={`${inputCls} pl-9`}
                style={{ fontSize: "13px" }}
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "ទូរសព្ទ" : "Phone"}>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={`${inputCls} pl-9`}
                  style={{ fontSize: "13px" }}
                />
              </div>
            </Field>
            <Field label={lang === "km" ? "អ៊ីមែល" : "Email"}>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={`${inputCls} pl-9`}
                  style={{ fontSize: "13px" }}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Business hours & Tax */}
        <Section
          title={lang === "km" ? "ម៉ោង & ពន្ធ" : "Hours & Tax"}
          icon={<Clock size={18} />}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "ម៉ោងបើក" : "Open Time"}>
              <input
                type="time"
                value={settings.openTime}
                onChange={(e) => update("openTime", e.target.value)}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
            <Field label={lang === "km" ? "ម៉ោងបិទ" : "Close Time"}>
              <input
                type="time"
                value={settings.closeTime}
                onChange={(e) => update("closeTime", e.target.value)}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "លេខអត្តសញ្ញាណពន្ធ" : "Tax ID (TIN)"}>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={(e) => update("taxId", e.target.value)}
                  className={`${inputCls} pl-9`}
                  style={{ fontSize: "13px" }}
                />
              </div>
            </Field>
            <Field label="VAT (%)">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.vatRate}
                onChange={(e) => update("vatRate", parseFloat(e.target.value) || 0)}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
          </div>
          <Field label={lang === "km" ? "ថ្លៃសេវា (%)" : "Service Charge (%)"}>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.serviceCharge}
              onChange={(e) => update("serviceCharge", parseFloat(e.target.value) || 0)}
              className={inputCls}
              style={{ fontSize: "13px" }}
            />
          </Field>
        </Section>

        {/* Currency */}
        <Section
          title={lang === "km" ? "រូបិយប័ណ្ណ" : "Currency"}
          icon={<DollarSign size={18} />}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "រូបិយប័ណ្ណគោល" : "Base Currency"}>
              <div className="flex gap-2">
                {["USD", "KHR"].map((c) => (
                  <button
                    key={c}
                    onClick={() => update("currency", c)}
                    className={`flex-1 py-2.5 rounded-xl border transition-all ${settings.currency === c
                      ? "border-[#22C55E] bg-[#22C55E]/5 text-[#22C55E]"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                      }`}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={lang === "km" ? "អត្រាប្ដូរ (1 USD =)" : "Exchange Rate (1 USD =)"}>
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-gray-400" style={{ fontSize: "12px" }}>
                  KHR
                </span>
                <input
                  type="number"
                  value={settings.khrRate}
                  onChange={(e) => update("khrRate", parseInt(e.target.value) || 4100)}
                  className={inputCls}
                  style={{ fontSize: "13px" }}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Integrations */}
        <Section
          title={lang === "km" ? "ការភ្ជាប់" : "Integrations"}
          icon={<Globe size={18} />}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Printer size={16} className="text-gray-500" />
              <div>
                <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {lang === "km" ? "ម៉ាស៊ីនបោះពុម្ព" : "Receipt Printer"}
                </p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                  {lang === "km" ? "បោះពុម្ពវិក្កយបត្រដោយស្វ័យប្រវត្តិ" : "Auto-print receipts"}
                </p>
              </div>
            </div>
            <button
              onClick={() => update("printerEnabled", !settings.printerEnabled)}
              className={`w-10 h-6 rounded-full transition-colors ${settings.printerEnabled ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${settings.printerEnabled ? "translate-x-4" : ""
                  }`}
              />
            </button>
          </div>

          <TelegramSection settings={settings} update={update} lang={lang} inputCls={inputCls} Field={Field} />

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Wifi size={16} className="text-gray-500" />
              <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>
                {lang === "km" ? "WiFi សម្រាប់អតិថិជន" : "Guest WiFi"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={lang === "km" ? "ឈ្មោះ WiFi" : "WiFi Name"}>
                <input
                  type="text"
                  value={settings.wifiName}
                  onChange={(e) => update("wifiName", e.target.value)}
                  className={inputCls}
                  style={{ fontSize: "13px" }}
                />
              </Field>
              <Field label={lang === "km" ? "ពាក្យសម្ងាត់" : "Password"}>
                <input
                  type="text"
                  value={settings.wifiPassword}
                  onChange={(e) => update("wifiPassword", e.target.value)}
                  className={inputCls}
                  style={{ fontSize: "13px" }}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Receipt */}
        <Section
          title={lang === "km" ? "វិក្កយបត្រ" : "Receipt"}
          icon={<FileText size={18} />}
        >
          <Field label={lang === "km" ? "បាតកថាវិក្កយបត្រ" : "Receipt Footer Text"}>
            <textarea
              value={settings.receiptFooter}
              onChange={(e) => update("receiptFooter", e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              style={{ fontSize: "13px" }}
            />
          </Field>
        </Section>

        {/* ========== INVOICE BRANDING ========== */}
        <Section
          title={lang === "km" ? "ម៉ារកវិក្កយបត្រ" : "Invoice Branding"}
          icon={<Receipt size={18} />}
        >
          {/* Logo Upload */}
          <div>
            <label className="block text-gray-500 dark:text-gray-400 mb-2" style={{ fontSize: "12px", fontWeight: 500 }}>
              {lang === "km" ? "ឡូហ្គោ ភោជនីយដ្ឋាន" : "Restaurant Logo"}
            </label>
            <div className="flex items-center gap-4">
              {invoiceSettings.logo ? (
                <div className="relative group">
                  <img
                    src={invoiceSettings.logo}
                    alt="Logo"
                    className="w-20 h-20 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <Image size={24} className="text-gray-300 dark:text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200 dark:shadow-green-900"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  <Upload size={14} />
                  {invoiceSettings.logo ? (lang === "km" ? "ប្ដូរឡូហ្គោ" : "Change Logo") : (lang === "km" ? "ផ្ទុកឡូហ្គោ" : "Upload Logo")}
                </button>
                <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>
                  PNG, JPG, SVG • {lang === "km" ? "អតិបរមា 2MB" : "Max 2MB"}
                </p>
              </div>
            </div>
          </div>

          {/* Toggle show logo */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>
              {lang === "km" ? "បង្ហាញឡូហ្គោលើវិក្កយបត្រ" : "Show logo on invoice"}
            </span>
            <button
              onClick={() => { updateInvoiceSetting("showLogo", !invoiceSettings.showLogo); setSaved(false); }}
              className={`w-10 h-6 rounded-full transition-colors ${invoiceSettings.showLogo ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${invoiceSettings.showLogo ? "translate-x-4" : ""}`} />
            </button>
          </div>

          {/* Business Tagline */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "ពាក្យស្លោក (English)" : "Tagline (English)"}>
              <input
                type="text"
                value={invoiceSettings.tagline}
                onChange={(e) => { updateInvoiceSetting("tagline", e.target.value); setSaved(false); }}
                className={inputCls}
                style={{ fontSize: "13px" }}
                placeholder="Restaurant & Cafe"
              />
            </Field>
            <Field label={lang === "km" ? "ពាក្យស្លោក (ខ្មែរ)" : "Tagline (Khmer)"}>
              <input
                type="text"
                value={invoiceSettings.taglineKm}
                onChange={(e) => { updateInvoiceSetting("taglineKm", e.target.value); setSaved(false); }}
                className={inputCls}
                style={{ fontSize: "13px" }}
                placeholder="ភោជនីយដ្ឋាន និង កាហ្វេ"
              />
            </Field>
          </div>

          {/* Invoice Prefix */}
          <Field label={lang === "km" ? "បុព្វបទវិក្កយបត្រ" : "Invoice Prefix"}>
            <input
              type="text"
              value={invoiceSettings.invoicePrefix}
              onChange={(e) => { updateInvoiceSetting("invoicePrefix", e.target.value); setSaved(false); }}
              className={inputCls}
              style={{ fontSize: "13px" }}
              placeholder="INV"
            />
          </Field>

          {/* Footer Notes */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "បាតកថា (English)" : "Footer Note (English)"}>
              <input
                type="text"
                value={invoiceSettings.footerNote}
                onChange={(e) => { updateInvoiceSetting("footerNote", e.target.value); setSaved(false); }}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
            <Field label={lang === "km" ? "បាតកថា (ខ្មែរ)" : "Footer Note (Khmer)"}>
              <input
                type="text"
                value={invoiceSettings.footerNoteKm}
                onChange={(e) => { updateInvoiceSetting("footerNoteKm", e.target.value); setSaved(false); }}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
          </div>
        </Section>

        {/* ========== BANK / PAYMENT DETAILS ========== */}
        <Section
          title={lang === "km" ? "ព័ត៌មានធនាគារ" : "Bank / Payment Details"}
          icon={<Building size={18} />}
        >
          <Field label={lang === "km" ? "ឈ្មោះធនាគារ" : "Bank Name"}>
            <input
              type="text"
              value={invoiceSettings.bankName}
              onChange={(e) => { updateInvoiceSetting("bankName", e.target.value); setSaved(false); }}
              className={inputCls}
              style={{ fontSize: "13px" }}
              placeholder="ABA Bank"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={lang === "km" ? "ឈ្មោះគណនី" : "Account Name"}>
              <input
                type="text"
                value={invoiceSettings.accountName}
                onChange={(e) => { updateInvoiceSetting("accountName", e.target.value); setSaved(false); }}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
            <Field label={lang === "km" ? "លេខគណនី" : "Account Number"}>
              <input
                type="text"
                value={invoiceSettings.accountNumber}
                onChange={(e) => { updateInvoiceSetting("accountNumber", e.target.value); setSaved(false); }}
                className={inputCls}
                style={{ fontSize: "13px" }}
              />
            </Field>
          </div>
          <Field label={lang === "km" ? "គេហទំព័រ" : "Website"}>
            <input
              type="text"
              value={invoiceSettings.website}
              onChange={(e) => { updateInvoiceSetting("website", e.target.value); setSaved(false); }}
              className={inputCls}
              style={{ fontSize: "13px" }}
              placeholder="www.posbatto.com"
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

/* ========== Telegram Integration Section ========== */

const alertTypes: { key: keyof TelegramAlerts; icon: React.ReactNode; en: string; km: string; descEn: string; descKm: string }[] = [
  { key: "newOrder", icon: <ShoppingBag size={15} />, en: "New Orders", km: "បញ្ជាថ្មី", descEn: "Get notified when a new order is placed", descKm: "ទទួលការជូនដំណឹងពេលមានបញ្ជាថ្មី" },
  { key: "lowStock", icon: <Package size={15} />, en: "Low Stock Alerts", km: "ស្តុកទាប", descEn: "Alert when inventory drops below minimum", descKm: "ជូនដំណឹងពេលស្តុកធ្លាក់ក្រោមអប្បបរមា" },
  { key: "dailySummary", icon: <BarChart3 size={15} />, en: "Daily Summary", km: "សង្ខេបប្រចាំថ្ងៃ", descEn: "Revenue and orders summary at end of day", descKm: "សង្ខេបចំណូល និង បញ្ជានៅចុងថ្ងៃ" },
  { key: "staffClock", icon: <Users size={15} />, en: "Staff Clock In/Out", km: "បុគ្គលិកចូល/ចេញម៉ោង", descEn: "Notifications when staff clocks in or out", descKm: "ជូនដំណឹងពេលបុគ្គលិកចូល ឬ ចេញម៉ោង" },
  { key: "paymentReceived", icon: <CreditCard size={15} />, en: "Payment Received", km: "ទទួលការបង់ប្រាក់", descEn: "Alert when a payment is processed", descKm: "ជូនដំណឹងពេលការបង់ប្រាក់ត្រូវបានដំណើរការ" },
  { key: "orderVoid", icon: <XCircle size={15} />, en: "Order Voided", km: "បញ្ជាត្រូវបានបោះបង់", descEn: "Alert when an order is cancelled or voided", descKm: "ជូនដំណឹងពេលបញ្ជាត្រូវបានលុប ឬ បោះបង់" },
];

function TelegramSection({
  settings,
  update,
  lang,
  inputCls,
  Field,
}: {
  settings: RestaurantSettings;
  update: <K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) => void;
  lang: string;
  inputCls: string;
  Field: React.FC<{ label: string; children: React.ReactNode }>;
}) {
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [showToken, setShowToken] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const updateAlert = (key: keyof TelegramAlerts, val: boolean) => {
    update("telegramAlerts", { ...settings.telegramAlerts, [key]: val });
  };

  const handleTestConnection = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      toast.error(l("Please enter Bot Token and Chat ID", "សូមបញ្ចូល Bot Token និង Chat ID"));
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const msg = `✅ *Batto Club - Test Connection*\n\n🍽️ Restaurant: ${settings.name}\n📅 ${new Date().toLocaleString()}\n\n_Your Telegram integration is working!_\n_ការភ្ជាប់ Telegram របស់អ្នកដំណើរការ!_`;
      const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: settings.telegramChatId, text: msg, parse_mode: "Markdown" }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult("success");
        update("telegramConnected", true);
        toast.success(l("Test message sent to Telegram!", "បានផ្ញើសារសាកល្បងទៅ Telegram!"));
      } else {
        setTestResult("error");
        update("telegramConnected", false);
        toast.error(`${l("Failed", "បរាជ័យ")}: ${data.description || "Unknown error"}`);
      }
    } catch {
      setTestResult("error");
      update("telegramConnected", false);
      toast.error(l("Connection failed. Check your token and chat ID.", "ការតភ្ជាប់បរាជ័យ។ ពិនិត្យ token និង chat ID របស់អ្នក។"));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <MessageCircle size={16} className="text-blue-500" />
          <div>
            <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 600 }}>
              {l("Telegram Integration", "ការភ្ជាប់ Telegram")}
            </p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>
              {l("Auto-send alerts to your Telegram", "ផ្ញើការជូនដំណឹងដោយស្វ័យប្រវត្តិទៅ Telegram របស់អ្នក")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {settings.telegramConnected && settings.telegramNotify && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg" style={{ fontSize: "10px", fontWeight: 600 }}>
              <Check size={10} /> {l("Connected", "បានភ្ជាប់")}
            </span>
          )}
          <button
            onClick={() => update("telegramNotify", !settings.telegramNotify)}
            className={`w-10 h-6 rounded-full transition-colors ${settings.telegramNotify ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${settings.telegramNotify ? "translate-x-4" : ""}`} />
          </button>
        </div>
      </div>

      {settings.telegramNotify && (
        <div className="space-y-4">
          {/* Bot Token & Chat ID */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
            <Field label={l("Bot Token", "Bot Token")}>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={settings.telegramBotToken}
                  onChange={(e) => { update("telegramBotToken", e.target.value); update("telegramConnected", false); setTestResult(null); }}
                  className={`${inputCls} pr-10 font-mono`}
                  style={{ fontSize: "12px" }}
                  placeholder="7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <button onClick={() => setShowToken(!showToken)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label={l("Chat ID (Group or Channel)", "Chat ID (ក្រុម ឬ Channel)")}>
              <input
                type="text"
                value={settings.telegramChatId}
                onChange={(e) => { update("telegramChatId", e.target.value); update("telegramConnected", false); setTestResult(null); }}
                className={`${inputCls} font-mono`}
                style={{ fontSize: "12px" }}
                placeholder="-1001234567890"
              />
            </Field>

            {/* Test Connection button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing || !settings.telegramBotToken || !settings.telegramChatId}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${testing || !settings.telegramBotToken || !settings.telegramChatId
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900"
                  }`}
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {testing ? l("Sending...", "កំពុងផ្ញើ...") : l("Test Connection", "សាកល្បងការតភ្ជាប់")}
              </button>
              {testResult === "success" && (
                <span className="flex items-center gap-1 text-green-600" style={{ fontSize: "12px" }}>
                  <Check size={14} /> {l("Message sent!", "បានផ្ញើសារ!")}
                </span>
              )}
              {testResult === "error" && (
                <span className="flex items-center gap-1 text-red-500" style={{ fontSize: "12px" }}>
                  <AlertTriangle size={14} /> {l("Failed — check credentials", "បរាជ័យ — ពិនិត្យព័ត៌មាន")}
                </span>
              )}
            </div>
          </div>

          {/* Alert types */}
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
              {l("Alert Types", "ប្រភេទការជូនដំណឹង")}
            </p>
            <div className="space-y-2">
              {alertTypes.map((alert) => (
                <label key={alert.key} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegramAlerts[alert.key]}
                    onChange={(e) => updateAlert(alert.key, e.target.checked)}
                    className="w-4 h-4 rounded accent-[#22C55E]"
                  />
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">{alert.icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>{lang === "km" ? alert.km : alert.en}</p>
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>{lang === "km" ? alert.descKm : alert.descEn}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Message preview */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-500 flex items-center gap-1.5 mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
              <Eye size={12} /> {l("Message Preview", "មើលសារជាមុន")}
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 font-mono" style={{ fontSize: "11px", lineHeight: 1.6 }}>
              <p className="text-gray-700 dark:text-gray-300">🛒 <strong>{l("New Order", "បញ្ជាថ្មី")} #1052</strong></p>
              <p className="text-gray-500">📍 Table 5</p>
              <p className="text-gray-500">🍽️ Lok Lak x2, Fish Amok x1</p>
              <p className="text-gray-500">💰 Total: $17.00</p>
              <p className="text-gray-400 mt-1">⏰ {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Setup guide */}
          <div className="border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
            <button onClick={() => setShowGuide(!showGuide)} className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
              <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Info size={14} /> {l("How to Set Up Telegram Bot", "របៀបដំឡើង Telegram Bot")}
              </span>
              {showGuide ? <ChevronUp size={14} className="text-blue-400" /> : <ChevronDown size={14} className="text-blue-400" />}
            </button>
            {showGuide && (
              <div className="px-4 py-4 space-y-3">
                {[
                  { step: "1", en: "Open Telegram and search for @BotFather", km: "បើក Telegram ហើយស្វែងរក @BotFather" },
                  { step: "2", en: "Send /newbot and follow the instructions", km: "ផ្ញើ /newbot ហើយធ្វើតាមការណែនាំ" },
                  { step: "3", en: "Choose a name for your bot (e.g. \"My Cafe Bot\")", km: "ជ្រើសរើសឈ្មោះសម្រាប់ bot របស់អ្នក (ឧ. \"My Cafe Bot\")" },
                  { step: "4", en: "Copy the Bot Token and paste it above", km: "ចម្លង Bot Token ហើយបិទភ្ជាប់ខាងលើ" },
                  { step: "5", en: "Create a Telegram Group and add your bot to it", km: "បង្កើតក្រុម Telegram ហើយបន្ថែម bot របស់អ្នកទៅក្នុង" },
                  { step: "6", en: "Search @getmyid_bot to get your Chat ID", km: "ស្វែងរក @getmyid_bot ដើម្បីទទួល Chat ID របស់អ្នក" },
                  { step: "7", en: "Paste the Chat ID above and click \"Test Connection\"", km: "បិទភ្ជាប់ Chat ID ខាងលើ ហើយចុច \"សាកល្បងការតភ្ជាប់\"" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0" style={{ fontSize: "11px", fontWeight: 700 }}>{item.step}</div>
                    <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: "12px", lineHeight: 1.5 }}>{lang === "km" ? item.km : item.en}</p>
                  </div>
                ))}
                <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg mt-2 hover:bg-blue-600 transition-colors" style={{ fontSize: "12px", fontWeight: 600 }}>
                  <ExternalLink size={12} /> {l("Open @BotFather", "បើក @BotFather")}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
