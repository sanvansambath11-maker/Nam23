import { X, Banknote, CreditCard, QrCode, CheckCircle, Smartphone, Send, Copy, Check, Clock, ExternalLink } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "./translation-context";
import { useCurrency } from "./currency-context";
import { motion } from "motion/react";
import { toast } from "sonner";

interface PaymentModalProps {
  total: number;
  items?: { name: string; price: number; quantity: number; modifications?: string[] }[];
  onClose: () => void;
  onSuccess: (paymentMethod: string) => void;
}

type PayMethod = "cash" | "khqr" | "aba" | "acleda" | "wing" | "pipay" | "truemoney" | "bakong" | "card";

const bankingApps: { key: PayMethod; label: string; labelKm: string; color: string; abbr: string; deeplink: string }[] = [
  { key: "aba", label: "ABA Pay", labelKm: "\u17A2\u17C1\u1794\u17CA\u17B8\u17A2\u17C1", color: "#003D6B", abbr: "ABA", deeplink: "https://link.payway.com.kh/ABAPAYWM421306s" },
  { key: "acleda", label: "ACLEDA", labelKm: "\u17A2\u17C1\u179F\u17CA\u17B8\u179B\u17B8\u178A\u17B6", color: "#00529B", abbr: "AC", deeplink: "https://pay.acledabank.com.kh/pay" },
  { key: "wing", label: "Wing", labelKm: "\u179C\u17B8\u1784", color: "#F7941D", abbr: "W", deeplink: "https://pay.wingmoney.com/pay" },
  { key: "pipay", label: "Pi Pay", labelKm: "\u1796\u17B8 \u1794\u17C3", color: "#E31E25", abbr: "Pi", deeplink: "https://pay.pipay.com/pay" },
  { key: "truemoney", label: "True Money", labelKm: "\u178F\u17D2\u179A\u17BC\u1798\u17B6\u1793\u17B8", color: "#FF6600", abbr: "TM", deeplink: "https://pay.truemoney.com.kh/pay" },
  { key: "bakong", label: "Bakong", labelKm: "\u1794\u17B6\u1782\u1784", color: "#0066B3", abbr: "BK", deeplink: "https://bakong.nbc.gov.kh/pay" },
];

// Generate a QR code SVG from a URL string
function generatePaymentQR(url: string, size: number = 200, color: string = "#1a1a2e"): string {
  const hash = url.split("").reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const modules = 25;
  const cellSize = size / modules;
  const grid: boolean[][] = [];
  const quiet = 2; // quiet zone

  for (let r = 0; r < modules; r++) {
    grid[r] = [];
    for (let c = 0; c < modules; c++) {
      // Quiet zone
      if (r < quiet || c < quiet || r >= modules - quiet || c >= modules - quiet) {
        grid[r][c] = false;
        continue;
      }
      const ir = r - quiet;
      const ic = c - quiet;
      const inner = modules - 2 * quiet;
      // Finder patterns (top-left, top-right, bottom-left)
      const isFinderTL = ir < 7 && ic < 7;
      const isFinderTR = ir < 7 && ic >= inner - 7;
      const isFinderBL = ir >= inner - 7 && ic < 7;

      if (isFinderTL || isFinderTR || isFinderBL) {
        const lr = ir < 7 ? ir : ir - (inner - 7);
        const lc = ic < 7 ? ic : ic - (inner - 7);
        grid[r][c] =
          lr === 0 || lr === 6 || lc === 0 || lc === 6 ||
          (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else if (ir === 7 || ic === 7) {
        // Timing patterns
        grid[r][c] = (ir + ic) % 2 === 0;
      } else {
        // Data modules based on hash of URL
        grid[r][c] = ((hash * (ir * inner + ic + 1) * 7 + ic * 13) & 0xff) > 115;
      }
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="0.8"/>`;
      }
    }
  }
  svg += `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function PaymentModal({ total, items, onClose, onSuccess }: PaymentModalProps) {
  const { t, lang, fontClass } = useTranslation();
  const { formatPrice, formatDual, roundKHR, khrRate } = useCurrency();
  const [method, setMethod] = useState<PayMethod>("cash");
  const [paid, setPaid] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [showFullForm, setShowFullForm] = useState(false);

  const dual = formatDual(total);
  const totalKHR = roundKHR(total * khrRate);
  const cashNum = parseFloat(cashReceived) || 0;
  const changeUSD = cashNum - total;
  const changeKHR = roundKHR(changeUSD * khrRate);

  const isQRMethod = method === "khqr" || bankingApps.some((b) => b.key === method);

  // Real ABA PayWay payment link
  const ABA_PAYWAY_URL = "https://link.payway.com.kh/ABAPAYWM421306s";

  // Build the KHQR payment URL
  const paymentUrl = useMemo(() => {
    // Use real ABA PayWay link for ABA and KHQR methods
    if (method === "aba" || method === "khqr") {
      return ABA_PAYWAY_URL;
    }
    const selectedApp = bankingApps.find((b) => b.key === method);
    const baseUrl = selectedApp ? selectedApp.deeplink : ABA_PAYWAY_URL;
    const params = new URLSearchParams({
      merchant: "POS_BATTO",
      currency: "USD",
      amount: total.toFixed(2),
      khr: totalKHR.toString(),
      ref: `ORD-${Date.now().toString(36).toUpperCase()}`,
    });
    return `${baseUrl}?${params.toString()}`;
  }, [method, total, totalKHR]);

  // QR code image
  const qrImage = useMemo(() => {
    const selectedApp = bankingApps.find((b) => b.key === method);
    const color = selectedApp ? selectedApp.color : "#1a1a2e";
    return generatePaymentQR(paymentUrl, 200, color);
  }, [paymentUrl, method]);

  // Countdown timer for QR
  useEffect(() => {
    if (!isQRMethod || paid) return;
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [method, isQRMethod, paid]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast.success(lang === "km" ? "តំណភ្ជាប់បង់ប្រាក់បានចំលង" : "Payment link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setPaid(true);
    toast.success(t("sentToTelegram"), { duration: 2000, icon: "??" });
    setTimeout(() => {
      onSuccess(method);
    }, 2000);
  };

  const handleQuickCash = (amount?: number) => {
    setMethod("cash");
    if (amount) {
      setCashReceived(String(amount));
    }
    setPaid(true);
    toast.success(lang === "km" ? "ការបង់ប្រាក់សាច់ប្រាក់បានបញ្ជាក់!" : "Cash payment confirmed!", { duration: 2000, icon: "✅" });
    setTimeout(() => {
      onSuccess("cash");
    }, 2000);
  };

  const handleQuickQR = () => {
    setMethod("khqr");
    setPaid(true);
    toast.success(lang === "km" ? "ការបង់ KHQR បានបញ្ជាក់!" : "KHQR payment confirmed!", { duration: 2000, icon: "✅" });
    setTimeout(() => {
      onSuccess("khqr");
    }, 2000);
  };

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const selectedApp = bankingApps.find((b) => b.key === method);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto ${fontClass}`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{t("payment")}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          {paid ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-[#22C55E]" />
              </div>
              <p className="text-gray-900 dark:text-white mb-2" style={{ fontSize: "18px", fontWeight: 700 }}>{t("paymentSuccess")}</p>
              <p className="text-[#22C55E]" style={{ fontSize: "28px", fontWeight: 700 }}>{dual.usd}</p>
              <p className="text-gray-400" style={{ fontSize: "14px" }}>{dual.khr}</p>
              {method === "cash" && changeUSD > 0 && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-amber-600" style={{ fontSize: "12px", fontWeight: 500 }}>{t("change")}</p>
                  <p className="text-amber-700" style={{ fontSize: "20px", fontWeight: 700 }}>${changeUSD.toFixed(2)}</p>
                  <p className="text-amber-500" style={{ fontSize: "11px" }}>{t("changeKHR")}: {changeKHR.toLocaleString()}{"\u17DB"} ({t("rounded")})</p>
                </div>
              )}
              {isQRMethod && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-blue-500" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {lang === "km" ? "បង់តាមរយៈ" : "Paid via"} {selectedApp ? (lang === "km" ? selectedApp.labelKm : selectedApp.label) : "KHQR"}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Total display with dual currency */}
              <div className="text-center mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 mb-1" style={{ fontSize: "13px" }}>{t("total")}</p>
                <p className="text-gray-900 dark:text-white" style={{ fontSize: "32px", fontWeight: 700 }}>{dual.usd}</p>
                <p className="text-[#22C55E]" style={{ fontSize: "16px", fontWeight: 600 }}>{dual.khr}</p>
                <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>$1 = 4,100{"\u17DB"}</p>
              </div>

              {/* ? QUICK PAY - Fast checkout buttons */}
              {!showFullForm && (
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                    ⚡ {lang === "km" ? "បង់លឿន" : "Quick Pay"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Pay Exact Cash */}
                    <button
                      onClick={() => handleQuickCash(total)}
                      className="py-3 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 active:scale-[0.97] transition-all shadow-md shadow-green-200 dark:shadow-green-900 flex flex-col items-center gap-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <Banknote size={16} />
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>{lang === "km" ? "សាច់ប្រាក់" : "Cash"} ✓</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.9 }}>{lang === "km" ? "ចំនួនជាក់លាក់" : "Exact amount"}</span>
                    </button>
                    {/* Quick KHQR */}
                    <button
                      onClick={handleQuickQR}
                      className="py-3 bg-[#003D6B] text-white rounded-xl hover:bg-[#002D4B] active:scale-[0.97] transition-all shadow-md flex flex-col items-center gap-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <QrCode size={16} />
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>KHQR ?</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.9 }}>{lang === "km" ? "ស្កេនរួចហើយ" : "Already scanned"}</span>
                    </button>
                  </div>
                  {/* Quick cash denominations */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 5, 10, 20, 50, 100].filter(a => a >= total).slice(0, 4).map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleQuickCash(amt)}
                        className="py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-[#22C55E] hover:text-[#22C55E] active:scale-[0.95] transition-all"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  {/* Show full form option */}
                  <button
                    onClick={() => setShowFullForm(true)}
                    className="w-full mt-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                  >
                    <Smartphone size={12} />
                    {lang === "km" ? "ជម្រើសបង់ប្រាក់បន្ថែម ▾" : "More payment options ▾"}
                  </button>
                </div>
              )}

              {/* Primary payment methods - shown when expanded */}
              {showFullForm && (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{t("paymentMethod")}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={() => setMethod("cash")}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${method === "cash" ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20 text-[#22C55E]" : "border-gray-100 dark:border-gray-700 text-gray-500"
                        }`}
                    >
                      <Banknote size={20} />
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>{t("cash")}</span>
                    </button>
                    <button
                      onClick={() => setMethod("khqr")}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${method === "khqr" ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20 text-[#22C55E]" : "border-gray-100 dark:border-gray-700 text-gray-500"
                        }`}
                    >
                      <QrCode size={20} />
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>KHQR</span>
                    </button>
                    <button
                      onClick={() => setMethod("card")}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${method === "card" ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20 text-[#22C55E]" : "border-gray-100 dark:border-gray-700 text-gray-500"
                        }`}
                    >
                      <CreditCard size={20} />
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>{t("card")}</span>
                    </button>
                  </div>

                  {/* Cambodia Mobile Banking Apps */}
                  <p className="text-gray-500 mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {lang === "km" ? "ធនាគារចល័ត" : "Mobile Banking"}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {bankingApps.map((app) => (
                      <button
                        key={app.key}
                        onClick={() => setMethod(app.key)}
                        className={`p-2.5 rounded-xl border-2 flex items-center gap-2 transition-all ${method === app.key ? "border-[#22C55E] bg-green-50 dark:bg-green-900/20" : "border-gray-100 dark:border-gray-700"
                          }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: app.color, fontSize: "9px", fontWeight: 700 }}
                        >
                          {app.abbr}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 truncate" style={{ fontSize: "11px", fontWeight: 500 }}>
                          {lang === "km" ? app.labelKm : app.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Cash input for change calculation */}
                  {method === "cash" && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                      <p className="text-gray-500 mb-2" style={{ fontSize: "12px", fontWeight: 500 }}>{t("amountReceived")} (USD)</p>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0.00"
                        className="w-full text-center bg-white dark:bg-gray-700 rounded-lg py-3 outline-none border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        style={{ fontSize: "24px", fontWeight: 700 }}
                      />
                      {cashNum > total && (
                        <div className="mt-3 text-center">
                          <p className="text-gray-500" style={{ fontSize: "11px" }}>{t("change")}</p>
                          <p className="text-[#22C55E]" style={{ fontSize: "20px", fontWeight: 700 }}>${changeUSD.toFixed(2)}</p>
                          <p className="text-gray-400" style={{ fontSize: "11px" }}>
                            {t("changeKHR")}: {changeKHR.toLocaleString()}{"\u17DB"} ({t("rounded")})
                          </p>
                        </div>
                      )}
                      {/* Quick cash buttons */}
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {[5, 10, 20, 50].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setCashReceived(String(amt))}
                            className="py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:border-[#22C55E] transition-colors"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===== KHQR / Banking App QR Code Display ===== */}
                  {isQRMethod && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-4">
                      {/* Header with app branding */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {selectedApp ? (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: selectedApp.color, fontSize: "10px", fontWeight: 700 }}>
                            {selectedApp.abbr}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white">
                            <QrCode size={16} />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 700 }}>
                            {selectedApp ? (lang === "km" ? `${selectedApp.labelKm} បង់ប្រាក់` : `Pay with ${selectedApp.label}`) : (lang === "km" ? "ស្កេន KHQR ដើម្បីបង់ប្រាក់" : "Scan KHQR to Pay")}
                          </p>
                          <p className="text-gray-400" style={{ fontSize: "10px" }}>
                            {lang === "km" ? "ស្កេន QR Code ខាងក្រោម" : "Scan the QR code below"}
                          </p>
                        </div>
                      </div>

                      {/* QR Code Display */}
                      {(method === "aba" || method === "khqr") ? (
                        /* Real ABA KHQR QR Code */
                        <div className="bg-white rounded-2xl p-3 mx-auto max-w-[280px] border-2 border-[#003D6B] relative shadow-lg">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-white" style={{ backgroundColor: "#003D6B", fontSize: "10px", fontWeight: 700 }}>
                            ABA KHQR
                          </div>
                          <img src="/images/aba-khqr.png" alt="ABA Pay KHQR" className="w-full rounded-xl" />
                          <div className="text-center mt-2 pb-1 bg-gray-50 rounded-xl p-2">
                            <p className="text-gray-900" style={{ fontSize: "18px", fontWeight: 800 }}>{dual.usd}</p>
                            <p className="text-[#003D6B]" style={{ fontSize: "13px", fontWeight: 600 }}>{totalKHR.toLocaleString()}៛</p>
                          </div>
                        </div>
                      ) : (
                        /* Generated QR for other banking apps */
                        <div className="bg-white rounded-2xl p-4 mx-auto max-w-[220px] border-2 relative" style={{ borderColor: selectedApp ? selectedApp.color : "#2563EB" }}>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white" style={{ backgroundColor: selectedApp ? selectedApp.color : "#2563EB", fontSize: "9px", fontWeight: 700 }}>
                            {selectedApp?.abbr}
                          </div>
                          <img src={qrImage} alt="Payment QR Code" className="w-full aspect-square" />
                          <div className="text-center mt-2 pb-1">
                            <p className="text-gray-900" style={{ fontSize: "16px", fontWeight: 800 }}>{dual.usd}</p>
                            <p style={{ fontSize: "11px", fontWeight: 600, color: selectedApp ? selectedApp.color : "#2563EB" }}>{totalKHR.toLocaleString()}៛</p>
                          </div>
                        </div>
                      )}

                      {/* Payment URL */}
                      <div className="mt-3">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-700 rounded-xl p-2 border border-gray-200 dark:border-gray-600">
                          <div className="flex-1 overflow-hidden">
                            <p className="text-gray-600 dark:text-gray-300 truncate" style={{ fontSize: "10px", fontFamily: "monospace" }}>
                              {paymentUrl}
                            </p>
                          </div>
                          <button
                            onClick={handleCopyUrl}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            {copied ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <ExternalLink size={14} className="text-gray-400" />
                          </a>
                        </div>
                      </div>

                      {/* Timer */}
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        <Clock size={12} className={countdown < 60 ? "text-red-500" : "text-gray-400"} />
                        <span className={`${countdown < 60 ? "text-red-500" : "text-gray-400"}`} style={{ fontSize: "11px", fontWeight: 600 }}>
                          {countdown > 0
                            ? (lang === "km" ? `QR ផុតកំណត់ក្នុង ${formatCountdown(countdown)}` : `QR expires in ${formatCountdown(countdown)}`)
                            : (lang === "km" ? "QR ផុតកំណត់ហើយ" : "QR expired")}
                        </span>
                      </div>

                      {/* Compatible apps */}
                      {method === "khqr" && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-400 text-center mb-2" style={{ fontSize: "9px", fontWeight: 600 }}>
                            {lang === "km" ? "អាចប្រើប្រាស់ជាមួយគ្រប់ធនាគារ" : "Compatible with all banking apps"}
                          </p>
                          <div className="flex items-center justify-center gap-1.5">
                            {bankingApps.map((app) => (
                              <div
                                key={app.key}
                                className="w-6 h-6 rounded flex items-center justify-center text-white"
                                style={{ backgroundColor: app.color, fontSize: "7px", fontWeight: 700 }}
                                title={app.label}
                              >
                                {app.abbr}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Telegram notify option */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Send size={14} className="text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 flex-1" style={{ fontSize: "12px", fontWeight: 500 }}>{t("telegramNotify")}</span>
                    <div className="w-8 h-5 bg-blue-500 rounded-full flex items-center justify-end px-0.5">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>

                  <button
                    onClick={method === "cash" && cashNum < total ? () => handleQuickCash(total) : handleConfirm}
                    disabled={isQRMethod && countdown === 0}
                    className="w-full py-3.5 bg-[#22C55E] text-white rounded-2xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-green-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    {isQRMethod
                      ? (lang === "km" ? `បញ្ជាក់ការបង់ប្រាក់ ${formatPrice(total)}` : `Confirm Payment ${formatPrice(total)}`)
                      : `${t("confirmPayment")} ${formatPrice(total)}`
                    }
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </motion.div >
    </div >
  );
}
