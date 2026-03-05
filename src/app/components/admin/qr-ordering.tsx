import { useState } from "react";
import { useTranslation } from "../translation-context";
import {
  QrCode,
  Download,
  Eye,
  RefreshCw,
  Monitor,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Table2,
  Settings,
  ToggleLeft,
  ToggleRight,
  Printer,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface QRTable {
  id: number;
  name: string;
  qrCode: string;
  isActive: boolean;
  scans: number;
  orders: number;
  lastScanned?: string;
}

const generateQRSVG = (data: string, size: number = 200): string => {
  // Generate a deterministic pattern from data string
  const hash = data.split("").reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const modules = 21;
  const cellSize = size / modules;
  const grid: boolean[][] = [];

  for (let r = 0; r < modules; r++) {
    grid[r] = [];
    for (let c = 0; c < modules; c++) {
      // Finder patterns (corners)
      const isFinderTL = r < 7 && c < 7;
      const isFinderTR = r < 7 && c >= modules - 7;
      const isFinderBL = r >= modules - 7 && c < 7;

      if (isFinderTL || isFinderTR || isFinderBL) {
        const lr = r < 7 ? r : r - (modules - 7);
        const lc = c < 7 ? c : c - (modules - 7);
        grid[r][c] =
          lr === 0 || lr === 6 || lc === 0 || lc === 6 ||
          (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        grid[r][c] = ((hash * (r * modules + c + 1)) & 0xff) > 120;
      }
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1a1a2e" rx="1"/>`;
      }
    }
  }
  svg += `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const initialTables: QRTable[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Table ${i + 1}`,
  qrCode: generateQRSVG(`https://posbatto.com/order/table-${i + 1}`),
  isActive: i < 10,
  scans: Math.floor(Math.random() * 200) + 20,
  orders: Math.floor(Math.random() * 80) + 5,
  lastScanned: i < 10 ? `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} PM` : undefined,
}));

export function QROrdering() {
  const { lang, fontClass } = useTranslation();
  const [tables, setTables] = useState<QRTable[]>(initialTables);
  const [previewTable, setPreviewTable] = useState<QRTable | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [settings, setSettings] = useState({
    requireAuth: false,
    autoAccept: true,
    showPrices: true,
    allowNotes: true,
    maxItemsPerOrder: 20,
    menuLanguage: "both" as "en" | "km" | "both",
  });

  const handleCopyLink = (table: QRTable) => {
    navigator.clipboard.writeText(`https://posbatto.com/order/table-${table.id}`);
    setCopied(table.id);
    toast.success(lang === "km" ? "បានចម្លងតំណ" : "Link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleToggleActive = (id: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  };

  const handleAddTable = () => {
    const newId = tables.length + 1;
    setTables((prev) => [
      ...prev,
      {
        id: newId,
        name: `Table ${newId}`,
        qrCode: generateQRSVG(`https://posbatto.com/order/table-${newId}`),
        isActive: true,
        scans: 0,
        orders: 0,
      },
    ]);
    toast.success(lang === "km" ? "បានបន្ថែមតុ" : "Table added");
  };

  const handleRegenerateQR = (id: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, qrCode: generateQRSVG(`https://posbatto.com/order/table-${id}?v=${Date.now()}`) }
          : t
      )
    );
    toast.success(lang === "km" ? "បានបង្កើត QR ថ្មី" : "QR regenerated");
  };

  const handleRemoveTable = (id: number) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    toast.success(lang === "km" ? "បានលុបតុ" : "Table removed");
  };

  const totalScans = tables.reduce((s, t) => s + t.scans, 0);
  const totalOrders = tables.reduce((s, t) => s + t.orders, 0);
  const activeTables = tables.filter((t) => t.isActive).length;

  return (
    <div className={`p-6 ${fontClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 dark:text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
            {lang === "km" ? "ការបញ្ជាទិញតាម QR" : "QR Code Ordering"}
          </h2>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>
            {lang === "km" ? "បង្កើត QR code សម្រាប់តុនីមួយៗ" : "Generate QR codes for each table"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Settings size={14} />
            {lang === "km" ? "កំណត់" : "Settings"}
          </button>
          <button
            onClick={handleAddTable}
            className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200 dark:shadow-green-900"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            <Plus size={14} />
            {lang === "km" ? "បន្ថែមតុ" : "Add Table"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: lang === "km" ? "តុសកម្ម" : "Active Tables", value: activeTables, icon: <Table2 size={18} />, color: "#22C55E" },
          { label: lang === "km" ? "ស្កេនសរុប" : "Total Scans", value: totalScans, icon: <QrCode size={18} />, color: "#3B82F6" },
          { label: lang === "km" ? "ការបញ្ជាទិញ" : "QR Orders", value: totalOrders, icon: <Smartphone size={18} />, color: "#A855F7" },
          { label: lang === "km" ? "អត្រាបម្លែង" : "Conversion", value: totalScans > 0 ? `${((totalOrders / totalScans) * 100).toFixed(1)}%` : "0%", icon: <Monitor size={18} />, color: "#F59E0B" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <p className="text-gray-900 dark:text-white" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6">
          <h3 className="text-gray-900 dark:text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            {lang === "km" ? "កំណត់ QR Ordering" : "QR Ordering Settings"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "autoAccept", label: lang === "km" ? "ទទួលយកការបញ្ជាទិញដោយស្វ័យប្រវត្តិ" : "Auto-accept orders", value: settings.autoAccept },
              { key: "showPrices", label: lang === "km" ? "បង្ហាញតម្លៃ" : "Show prices on menu", value: settings.showPrices },
              { key: "allowNotes", label: lang === "km" ? "អនុញ្ញាតកំណត់ចំណាំ" : "Allow order notes", value: settings.allowNotes },
              { key: "requireAuth", label: lang === "km" ? "ទាមទារលេខទូរស័ព្ទ" : "Require phone number", value: settings.requireAuth },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "13px" }}>{setting.label}</span>
                <button
                  onClick={() => setSettings({ ...settings, [setting.key]: !setting.value })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${setting.value ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${setting.value ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-4 transition-all hover:shadow-lg ${
              table.isActive
                ? "border-gray-100 dark:border-gray-800"
                : "border-gray-100 dark:border-gray-800 opacity-50"
            }`}
          >
            {/* QR Code */}
            <div className="relative mb-3">
              <div className="bg-white rounded-xl p-3 border border-gray-100 dark:border-gray-200">
                <img src={table.qrCode} alt={`QR ${table.name}`} className="w-full aspect-square" />
              </div>
              {!table.isActive && (
                <div className="absolute inset-0 bg-gray-200/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {lang === "km" ? "អសកម្ម" : "Inactive"}
                  </span>
                </div>
              )}
            </div>

            {/* Table info */}
            <p className="text-gray-900 dark:text-white text-center mb-1" style={{ fontSize: "14px", fontWeight: 700 }}>
              {table.name}
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-gray-400" style={{ fontSize: "10px" }}>
                {table.scans} {lang === "km" ? "ស្កេន" : "scans"}
              </span>
              <span className="text-gray-400" style={{ fontSize: "10px" }}>•</span>
              <span className="text-gray-400" style={{ fontSize: "10px" }}>
                {table.orders} {lang === "km" ? "ការបញ្ជាទិញ" : "orders"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewTable(table)}
                className="flex-1 p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 transition-colors"
                title="Preview"
              >
                <Eye size={14} className="mx-auto" />
              </button>
              <button
                onClick={() => handleCopyLink(table)}
                className="flex-1 p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20 transition-colors"
                title="Copy Link"
              >
                {copied === table.id ? <Check size={14} className="mx-auto text-green-500" /> : <Copy size={14} className="mx-auto" />}
              </button>
              <button
                onClick={() => handleRegenerateQR(table.id)}
                className="flex-1 p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20 transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={14} className="mx-auto" />
              </button>
              <button
                onClick={() => handleToggleActive(table.id)}
                className="flex-1 p-1.5 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-500 dark:hover:bg-purple-900/20 transition-colors"
                title="Toggle"
              >
                {table.isActive ? <ToggleRight size={14} className="mx-auto text-green-500" /> : <ToggleLeft size={14} className="mx-auto" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Print All Button */}
      <div className="mt-6 flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors" style={{ fontSize: "13px", fontWeight: 600 }}>
          <Printer size={16} />
          {lang === "km" ? "បោះពុម្ព QR ទាំងអស់" : "Print All QR Codes"}
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
          <Download size={16} />
          {lang === "km" ? "ទាញយក PDF" : "Download PDF"}
        </button>
      </div>

      {/* Preview Modal */}
      {previewTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewTable(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "16px", fontWeight: 600 }}>{previewTable.name}</h3>
              <button onClick={() => setPreviewTable(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 mb-4">
                <img src={previewTable.qrCode} alt={`QR ${previewTable.name}`} className="w-48 h-48" />
              </div>
              <p className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "18px", fontWeight: 700 }}>POS Batto</p>
              <p className="text-gray-400 mb-1" style={{ fontSize: "14px" }}>{previewTable.name}</p>
              <p className="text-gray-400 mb-4" style={{ fontSize: "11px" }}>
                {lang === "km" ? "ស្កេន QR ដើម្បីបញ្ជាទិញ" : "Scan to order from your phone"}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleCopyLink(previewTable)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  <Copy size={14} /> {lang === "km" ? "ចម្លង" : "Copy"}
                </button>
                <button className="flex-1 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                  <Download size={14} /> {lang === "km" ? "ទាញយក" : "Download"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
