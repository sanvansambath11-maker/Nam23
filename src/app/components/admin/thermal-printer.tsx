import { useState } from "react";
import { useTranslation } from "../translation-context";
import { useCurrency } from "../currency-context";
import {
    Printer,
    Settings,
    Check,
    X,
    Wifi,
    WifiOff,
    Receipt,
    RefreshCw,
    TestTube,
    Smartphone,
    Monitor,
    Copy,
    AlertCircle,
    CheckCircle,
    Download,
    FileText,
    Zap,
    Plus,
    Trash2,
    Edit2,
} from "lucide-react";
import { toast } from "sonner";

interface PrinterDevice {
    id: number;
    name: string;
    type: "thermal" | "dot-matrix" | "inkjet";
    connectionType: "usb" | "bluetooth" | "wifi" | "ethernet";
    ip?: string;
    status: "online" | "offline" | "error" | "printing";
    model: string;
    paperWidth: 58 | 80;
    lastPrint?: string;
    printCount: number;
    isDefault: boolean;
}

interface PrintSettings {
    autoPrint: boolean;
    copies: number;
    printKitchenOrder: boolean;
    printCustomerReceipt: boolean;
    showLogo: boolean;
    showQR: boolean;
    footerText: string;
    fontSize: "small" | "medium" | "large";
    paperWidth: 58 | 80;
}

const mockPrinters: PrinterDevice[] = [
    { id: 1, name: "Reception Printer", type: "thermal", connectionType: "usb", status: "online", model: "Epson TM-T20III", paperWidth: 80, lastPrint: "2 min ago", printCount: 1247, isDefault: true },
    { id: 2, name: "Kitchen Printer", type: "thermal", connectionType: "wifi", ip: "192.168.1.100", status: "online", model: "Star TSP143III", paperWidth: 80, lastPrint: "5 min ago", printCount: 892, isDefault: false },
    { id: 3, name: "Bar Printer", type: "thermal", connectionType: "bluetooth", status: "offline", model: "Epson TM-m30II", paperWidth: 58, lastPrint: "1 hour ago", printCount: 456, isDefault: false },
];

const receiptPreview = `
================================
        POS Batto
     Phnom Penh, Cambodia
   Tel: +855 23 456 789
================================

Order: #ORD-0041
Table:  5
Staff:  Sokha
Date:   04/03/2026 14:30
--------------------------------

2x Lok Lak           $11.00
  + Extra pepper
1x Sugarcane Juice    $1.50
  + Less sugar  
1x Fish Amok          $6.00
--------------------------------
Subtotal:            $18.50
VAT (10%):            $1.85
Discount (5%):       -$0.93
================================
TOTAL:               $19.43
   (79,663 ៛)
================================

  Paid by: Cash $20.00
  Change:  $0.57 (2,300៛)

================================

  Thank you for dining with us!
   សូមអរគុណ! 🙏

  Scan for feedback: [QR]
================================
`;

export function ThermalPrinterSupport() {
    const { lang, fontClass } = useTranslation();
    const { formatPrice } = useCurrency();
    const [printers, setPrinters] = useState<PrinterDevice[]>(mockPrinters);
    const [activeView, setActiveView] = useState<"printers" | "settings" | "preview">("printers");
    const [settings, setSettings] = useState<PrintSettings>({
        autoPrint: true,
        copies: 1,
        printKitchenOrder: true,
        printCustomerReceipt: true,
        showLogo: true,
        showQR: true,
        footerText: "Thank you for dining with us! សូមអរគុណ! 🙏",
        fontSize: "medium",
        paperWidth: 80,
    });

    const handleTestPrint = (id: number) => {
        setPrinters((prev) => prev.map((p) => (p.id === id ? { ...p, status: "printing" as const } : p)));
        toast.success(lang === "km" ? "កំពុងបោះពុម្ពសាកល្បង..." : "Test print sent...");
        setTimeout(() => {
            setPrinters((prev) => prev.map((p) => (p.id === id ? { ...p, status: "online" as const, printCount: p.printCount + 1, lastPrint: "Just now" } : p)));
            toast.success(lang === "km" ? "បោះពុម្ពសាកល្បងជោគជ័យ!" : "Test print successful!");
        }, 2000);
    };

    const handleSetDefault = (id: number) => {
        setPrinters((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
        toast.success(lang === "km" ? "បានកំណត់ជាម៉ាស៊ីនបោះពុម្ពលំនាំដើម" : "Default printer set");
    };

    const statusColors = {
        online: "#22C55E",
        offline: "#9CA3AF",
        error: "#EF4444",
        printing: "#3B82F6",
    };

    const statusLabels = {
        online: lang === "km" ? "សកម្ម" : "Online",
        offline: lang === "km" ? "អសកម្ម" : "Offline",
        error: lang === "km" ? "កំហុស" : "Error",
        printing: lang === "km" ? "កំពុងបោះពុម្ព" : "Printing...",
    };

    return (
        <div className={`p-6 ${fontClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                        {lang === "km" ? "ម៉ាស៊ីនបោះពុម្ពកម្ដៅ" : "Thermal Printer Setup"}
                    </h2>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
                        {lang === "km" ? "គ្រប់គ្រងម៉ាស៊ីនបោះពុម្ព និងវិក្កយបត្រ" : "Manage printers and receipt templates"}
                    </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {[
                        { key: "printers" as const, label: lang === "km" ? "ម៉ាស៊ីន" : "Printers" },
                        { key: "settings" as const, label: lang === "km" ? "កំណត់" : "Settings" },
                        { key: "preview" as const, label: lang === "km" ? "មើលជាមុន" : "Preview" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveView(tab.key)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === tab.key ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"
                                }`}
                            style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeView === "printers" && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: lang === "km" ? "ម៉ាស៊ីនសរុប" : "Total Printers", value: printers.length, icon: <Printer size={18} />, color: "#3B82F6" },
                            { label: lang === "km" ? "សកម្ម" : "Online", value: printers.filter((p) => p.status === "online" || p.status === "printing").length, icon: <Wifi size={18} />, color: "#22C55E" },
                            { label: lang === "km" ? "បោះពុម្ពថ្ងៃនេះ" : "Prints Today", value: printers.reduce((s, p) => s + p.printCount, 0), icon: <Receipt size={18} />, color: "#A855F7" },
                            { label: lang === "km" ? "បោះពុម្ពចុងក្រោយ" : "Last Print", value: printers.find((p) => p.isDefault)?.lastPrint || "—", icon: <FileText size={18} />, color: "#F59E0B" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</p>
                                <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Printer List */}
                    <div className="space-y-3">
                        {printers.map((printer) => (
                            <div key={printer.id} className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-5 transition-all ${printer.isDefault ? "border-[#22C55E]/30" : "border-gray-100 dark:border-gray-800"}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <Printer size={24} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>{printer.name}</p>
                                                {printer.isDefault && (
                                                    <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-md" style={{ fontSize: "9px", fontWeight: 600 }}>
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400" style={{ fontSize: "12px" }}>{printer.model}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[printer.status] }} />
                                                    <span className="text-gray-500" style={{ fontSize: "11px" }}>{statusLabels[printer.status]}</span>
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-400" style={{ fontSize: "11px" }}>
                                                    {printer.connectionType.toUpperCase()} {printer.ip && `(${printer.ip})`}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-400" style={{ fontSize: "11px" }}>{printer.paperWidth}mm</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTestPrint(printer.id)}
                                            disabled={printer.status === "offline" || printer.status === "printing"}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                            style={{ fontSize: "11px", fontWeight: 500 }}
                                        >
                                            <TestTube size={14} />
                                            {lang === "km" ? "សាកល្បង" : "Test"}
                                        </button>
                                        {!printer.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(printer.id)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-[#22C55E]/10 text-[#22C55E] rounded-xl hover:bg-[#22C55E]/20 transition-colors"
                                                style={{ fontSize: "11px", fontWeight: 500 }}
                                            >
                                                <Check size={14} />
                                                {lang === "km" ? "កំណត់លំនាំដើម" : "Set Default"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? "បោះពុម្ពសរុប" : "Total Prints"}</p>
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 700 }}>{printer.printCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? "បោះពុម្ពចុងក្រោយ" : "Last Print"}</p>
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 700 }}>{printer.lastPrint || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400" style={{ fontSize: "10px" }}>{lang === "km" ? "ប្រភេទ" : "Type"}</p>
                                        <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 700 }}>{printer.type}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add printer */}
                    <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-[#22C55E] hover:border-[#22C55E] transition-all flex items-center justify-center gap-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                        <Plus size={16} />
                        {lang === "km" ? "បន្ថែមម៉ាស៊ីនបោះពុម្ព" : "Add Printer"}
                    </button>
                </>
            )}

            {activeView === "settings" && (
                <div className="max-w-xl mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-5 space-y-5">
                            <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                                {lang === "km" ? "កំណត់ការបោះពុម្ព" : "Print Settings"}
                            </h3>

                            {/* Toggle settings */}
                            {[
                                { key: "autoPrint" as const, label: lang === "km" ? "បោះពុម្ពស្វ័យប្រវត្តិ" : "Auto-print receipts", desc: lang === "km" ? "បោះពុម្ពស្វ័យប្រវត្តិបន្ទាប់ពីការទូទាត់" : "Auto-print after payment" },
                                { key: "printKitchenOrder" as const, label: lang === "km" ? "បោះពុម្ពការបញ្ជាទិញផ្ទះបាយ" : "Print kitchen orders", desc: lang === "km" ? "ផ្ញើការបញ្ជាទិញដល់ម៉ាស៊ីនបោះពុម្ពផ្ទះបាយ" : "Send orders to kitchen printer" },
                                { key: "printCustomerReceipt" as const, label: lang === "km" ? "បោះពុម្ពវិក្កយបត្រអតិថិជន" : "Print customer receipt", desc: lang === "km" ? "បោះពុម្ពវិក្កយបត្រសម្រាប់អតិថិជន" : "Print receipt for customer" },
                                { key: "showLogo" as const, label: lang === "km" ? "បង្ហាញស្លាកសញ្ញា" : "Show logo on receipt", desc: lang === "km" ? "បង្ហាញស្លាកសញ្ញាលើវិក្កយបត្រ" : "Display restaurant logo" },
                                { key: "showQR" as const, label: lang === "km" ? "បង្ហាញ QR Feedback" : "Show QR for feedback", desc: lang === "km" ? "បង្ហាញ QR code សម្រាប់ feedback" : "Display feedback QR code" },
                            ].map((toggle) => (
                                <div key={toggle.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                                    <div>
                                        <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>{toggle.label}</p>
                                        <p className="text-gray-400" style={{ fontSize: "11px" }}>{toggle.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, [toggle.key]: !(settings[toggle.key] as boolean) })}
                                        className={`relative w-10 h-6 rounded-full transition-colors ${settings[toggle.key] ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-gray-600"}`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[toggle.key] ? "left-[18px]" : "left-0.5"}`} />
                                    </button>
                                </div>
                            ))}

                            {/* Copies */}
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "13px", fontWeight: 500 }}>
                                        {lang === "km" ? "ចំនួនថតចម្លង" : "Number of copies"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSettings({ ...settings, copies: Math.max(1, settings.copies - 1) })} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                                        -
                                    </button>
                                    <span className="w-8 text-center text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>{settings.copies}</span>
                                    <button onClick={() => setSettings({ ...settings, copies: Math.min(5, settings.copies + 1) })} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Font size */}
                            <div className="py-3">
                                <p className="text-gray-700 dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                                    {lang === "km" ? "ទំហំអក្សរ" : "Font Size"}
                                </p>
                                <div className="flex gap-2">
                                    {(["small", "medium", "large"] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSettings({ ...settings, fontSize: size })}
                                            className={`flex-1 py-2 rounded-xl border-2 transition-all ${settings.fontSize === size
                                                    ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20 text-[#22C55E]"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-500"
                                                }`}
                                            style={{ fontSize: "12px", fontWeight: 500 }}
                                        >
                                            {size === "small" ? (lang === "km" ? "តូច" : "Small") : size === "medium" ? (lang === "km" ? "មធ្យម" : "Medium") : (lang === "km" ? "ធំ" : "Large")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Paper width */}
                            <div className="py-3">
                                <p className="text-gray-700 dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                                    {lang === "km" ? "ទំហំក្រដាស" : "Paper Width"}
                                </p>
                                <div className="flex gap-2">
                                    {([58, 80] as const).map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => setSettings({ ...settings, paperWidth: w })}
                                            className={`flex-1 py-2 rounded-xl border-2 transition-all ${settings.paperWidth === w
                                                    ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20 text-[#22C55E]"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-500"
                                                }`}
                                            style={{ fontSize: "12px", fontWeight: 500 }}
                                        >
                                            {w}mm
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer text */}
                            <div className="py-3">
                                <p className="text-gray-700 dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                                    {lang === "km" ? "អត្ថបទបាតកថា" : "Footer Text"}
                                </p>
                                <textarea
                                    value={settings.footerText}
                                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-gray-700 dark:text-gray-300 resize-none"
                                    style={{ fontSize: "12px" }}
                                    rows={2}
                                />
                            </div>

                            <button className="w-full py-3 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>
                                {lang === "km" ? "រក្សាទុកការកំណត់" : "Save Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeView === "preview" && (
                <div className="max-w-md mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
                                {lang === "km" ? "មើលវិក្កយបត្រជាមុន" : "Receipt Preview"}
                            </p>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22C55E] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                                <Printer size={12} />
                                {lang === "km" ? "បោះពុម្ពសាកល្បង" : "Test Print"}
                            </button>
                        </div>
                        <div className="p-6 flex justify-center">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner" style={{ maxWidth: settings.paperWidth === 80 ? "320px" : "240px", width: "100%" }}>
                                <pre className="text-gray-800 whitespace-pre-wrap font-mono" style={{ fontSize: settings.fontSize === "small" ? "9px" : settings.fontSize === "medium" ? "10px" : "11px", lineHeight: "1.5" }}>
                                    {receiptPreview}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
