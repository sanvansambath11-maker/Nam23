import { X, Download, Printer, Send, Share2 } from "lucide-react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { useInvoice } from "./invoice-context";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useRef } from "react";

interface InvoiceItem {
    name: string;
    price: number;
    quantity: number;
    modifications?: string[];
}

interface InvoiceModalProps {
    items: InvoiceItem[];
    paymentMethod: string;
    onClose: () => void;
    onNewOrder: () => void;
}

export function InvoiceModal({ items, paymentMethod, onClose, onNewOrder }: InvoiceModalProps) {
    const { lang, fontClass } = useTranslation();
    const { formatDual, roundKHR, khrRate } = useCurrency();
    const { invoiceSettings, nextInvoiceNumber } = useInvoice();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const invoiceNo = useRef(nextInvoiceNumber());

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const vat = subtotal * (invoiceSettings.vatRate / 100);
    const discount = subtotal * 0.05;
    const total = subtotal + vat - discount;
    const totalKHR = roundKHR(total * khrRate);
    const dual = formatDual(total);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const methodDisplayName: Record<string, { en: string; km: string }> = {
        cash: { en: "Cash", km: "សាច់ប្រាក់" },
        khqr: { en: "KHQR", km: "KHQR" },
        card: { en: "Card", km: "កាត" },
        aba: { en: "ABA Pay", km: "អេប៊ីអេ" },
        acleda: { en: "ACLEDA", km: "អេស៊ីលីដា" },
        wing: { en: "Wing", km: "វីង" },
        pipay: { en: "Pi Pay", km: "ភី ផេ" },
        truemoney: { en: "True Money", km: "ត្រូម៉ានី" },
        bakong: { en: "Bakong", km: "បាគង" },
    };

    const handlePrint = () => {
        window.print();
        toast.success(lang === "km" ? "កំពុងបោះពុម្ព..." : "Printing invoice...");
    };

    const handleDownload = () => {
        toast.success(lang === "km" ? "កំពុងទាញយក PDF..." : "Downloading PDF...");
    };

    const handleShare = () => {
        toast.success(lang === "km" ? "បានចម្លងតំណវិក្កយបត្រ" : "Invoice link copied!");
    };

    const handleSendTelegram = () => {
        toast.success(lang === "km" ? "បានផ្ញើទៅ Telegram" : "Sent to Telegram!");
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", bounce: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-hidden flex flex-col ${fontClass}`}
            >
                {/* Top action bar */}
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-all" title={lang === "km" ? "បោះពុម្ព" : "Print"}>
                            <Printer size={16} />
                        </button>
                        <button onClick={handleDownload} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-all" title={lang === "km" ? "ទាញយក" : "Download"}>
                            <Download size={16} />
                        </button>
                        <button onClick={handleShare} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-all" title={lang === "km" ? "ចែករំលែក" : "Share"}>
                            <Share2 size={16} />
                        </button>
                        <button onClick={handleSendTelegram} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-blue-500 hover:text-blue-600 transition-all" title="Telegram">
                            <Send size={16} />
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-400 transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="flex-1 overflow-y-auto" ref={invoiceRef}>
                    <div className="p-6" style={{ background: "white", color: "#1a1a1a" }}>
                        {/* Header with Logo */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {invoiceSettings.showLogo && invoiceSettings.logo ? (
                                    <img src={invoiceSettings.logo} alt="Logo" className="w-14 h-14 object-contain rounded-xl" />
                                ) : invoiceSettings.showLogo ? (
                                    <div className="w-14 h-14 rounded-xl bg-[#22C55E] flex items-center justify-center" style={{ fontSize: "22px", fontWeight: 800, color: "white" }}>
                                        {invoiceSettings.businessName.charAt(0)}
                                    </div>
                                ) : null}
                                <div>
                                    <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#111", letterSpacing: "0.5px" }}>
                                        {invoiceSettings.businessName}
                                    </h1>
                                    <p style={{ fontSize: "11px", fontWeight: 500, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
                                        {lang === "km" ? invoiceSettings.taglineKm : invoiceSettings.tagline}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* INVOICE title and number */}
                        <div className="text-right mb-6">
                            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#111", letterSpacing: "3px" }}>
                                {lang === "km" ? "វិក្កយបត្រ" : "INVOICE"}
                            </h2>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#22C55E" }}>
                                #{invoiceNo.current}
                            </p>
                        </div>

                        {/* Bill info */}
                        <div className="grid grid-cols-2 gap-4 mb-6 pb-5" style={{ borderBottom: "2px solid #f0f0f0" }}>
                            <div>
                                <p style={{ fontSize: "10px", fontWeight: 700, color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                                    {lang === "km" ? "ថ្ងៃខែ" : "DATE"}
                                </p>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>{dateStr}</p>
                                <p style={{ fontSize: "11px", color: "#888" }}>{timeStr}</p>
                            </div>
                            <div className="text-right">
                                <p style={{ fontSize: "10px", fontWeight: 700, color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                                    {lang === "km" ? "វិធីបង់ប្រាក់" : "PAYMENT"}
                                </p>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>
                                    {lang === "km" ? methodDisplayName[paymentMethod]?.km || paymentMethod : methodDisplayName[paymentMethod]?.en || paymentMethod}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-5">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 pb-2 mb-2" style={{ borderBottom: "2px solid #111" }}>
                                <div className="col-span-6">
                                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#333", letterSpacing: "1px" }}>
                                        {lang === "km" ? "មុខទំនិញ" : "DESCRIPTION"}
                                    </p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#333", letterSpacing: "1px" }}>
                                        {lang === "km" ? "តម្លៃ" : "RATE"}
                                    </p>
                                </div>
                                <div className="col-span-1 text-center">
                                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#333", letterSpacing: "1px" }}>
                                        {lang === "km" ? "ចំនួន" : "QTY"}
                                    </p>
                                </div>
                                <div className="col-span-3 text-right">
                                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#333", letterSpacing: "1px" }}>
                                        {lang === "km" ? "ចំនួនទឹកប្រាក់" : "AMOUNT"}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 py-2.5" style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <div className="col-span-6">
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>{item.name}</p>
                                        {item.modifications && item.modifications.length > 0 && (
                                            <p style={{ fontSize: "10px", color: "#999" }}>{item.modifications.join(", ")}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <p style={{ fontSize: "13px", color: "#555" }}>${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <p style={{ fontSize: "13px", color: "#555" }}>{item.quantity}</p>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 mb-6" style={{ paddingLeft: "40%" }}>
                            <div className="flex justify-between">
                                <p style={{ fontSize: "12px", color: "#888" }}>{lang === "km" ? "សរុបរង" : "Sub-Total"}</p>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>${subtotal.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p style={{ fontSize: "12px", color: "#888" }}>VAT ({invoiceSettings.vatRate}%)</p>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>${vat.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p style={{ fontSize: "12px", color: "#888" }}>{lang === "km" ? "បញ្ចុះតម្លៃ (5%)" : "Discount (5%)"}</p>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "#EF4444" }}>-${discount.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2" style={{ borderTop: "2px solid #111" }}>
                                <p style={{ fontSize: "13px", fontWeight: 800, color: "#111", letterSpacing: "1px" }}>
                                    {lang === "km" ? "សរុប" : "TOTAL"}
                                </p>
                                <div className="text-right">
                                    <p style={{ fontSize: "20px", fontWeight: 800, color: "#111" }}>${total.toFixed(2)}</p>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E" }}>{totalKHR.toLocaleString()}៛</p>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        {invoiceSettings.bankName && (
                            <div className="mb-6 pt-4" style={{ borderTop: "1px solid #f0f0f0" }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, color: "#333", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                                    {lang === "km" ? "ព័ត៌មានធនាគារ" : "PAY TO:"}
                                </p>
                                <div className="grid grid-cols-2 gap-1">
                                    <p style={{ fontSize: "11px", color: "#888" }}>{lang === "km" ? "ធនាគារ" : "Bank"}</p>
                                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#333" }}>{invoiceSettings.bankName}</p>
                                    <p style={{ fontSize: "11px", color: "#888" }}>{lang === "km" ? "ឈ្មោះគណនី" : "Account Name"}</p>
                                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#333" }}>{invoiceSettings.accountName}</p>
                                    <p style={{ fontSize: "11px", color: "#888" }}>{lang === "km" ? "លេខគណនី" : "Account Number"}</p>
                                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#333" }}>{invoiceSettings.accountNumber}</p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center pt-4" style={{ borderTop: "1px solid #eee" }}>
                            <p style={{ fontSize: "12px", fontWeight: 500, color: "#333", marginBottom: "2px" }}>
                                {lang === "km" ? invoiceSettings.footerNoteKm : invoiceSettings.footerNote}
                            </p>
                            <p style={{ fontSize: "10px", color: "#aaa" }}>
                                {invoiceSettings.address} • {invoiceSettings.phone}
                            </p>
                            {invoiceSettings.email && (
                                <p style={{ fontSize: "10px", color: "#aaa" }}>
                                    {invoiceSettings.email} • {invoiceSettings.website}
                                </p>
                            )}
                            {invoiceSettings.taxId && (
                                <p style={{ fontSize: "9px", color: "#ccc", marginTop: "4px" }}>
                                    Tax ID: {invoiceSettings.taxId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom action */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                        <Printer size={16} />
                        {lang === "km" ? "បោះពុម្ព" : "Print"}
                    </button>
                    <button
                        onClick={() => { onNewOrder(); onClose(); }}
                        className="flex-1 py-3 bg-[#22C55E] text-white rounded-2xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-green-900 flex items-center justify-center gap-2"
                        style={{ fontSize: "13px", fontWeight: 700 }}
                    >
                        {lang === "km" ? "ការបញ្ជាទិញថ្មី" : "New Order"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
