import { useState } from "react";
import { useTranslation } from "../translation-context";
import { Download, Upload, RotateCcw, Database, FileJson, HardDrive, Check, AlertTriangle, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

interface BackupRecord {
  id: number;
  name: string;
  date: string;
  size: string;
  type: "auto" | "manual";
  status: "completed" | "failed";
}

const mockBackups: BackupRecord[] = [
  { id: 1, name: "backup_2026-03-03_auto", date: "2026-03-03 06:00", size: "2.4 MB", type: "auto", status: "completed" },
  { id: 2, name: "backup_2026-03-02_auto", date: "2026-03-02 06:00", size: "2.3 MB", type: "auto", status: "completed" },
  { id: 3, name: "backup_2026-03-01_manual", date: "2026-03-01 14:30", size: "2.3 MB", type: "manual", status: "completed" },
  { id: 4, name: "backup_2026-03-01_auto", date: "2026-03-01 06:00", size: "2.2 MB", type: "auto", status: "completed" },
  { id: 5, name: "backup_2026-02-28_auto", date: "2026-02-28 06:00", size: "2.1 MB", type: "auto", status: "failed" },
  { id: 6, name: "backup_2026-02-27_auto", date: "2026-02-27 06:00", size: "2.1 MB", type: "auto", status: "completed" },
];

const mockExportData = {
  restaurant: { name: "POS Batto", address: "St. 214, Phnom Penh", phone: "+855 23 456 789" },
  staff: [
    { id: 1, name: "Sokha Chan", role: "manager" },
    { id: 2, name: "Dara Pich", role: "cashier" },
    { id: 3, name: "Veasna Kem", role: "chef" },
    { id: 4, name: "Bopha Meas", role: "waiter" },
  ],
  menu: [
    { id: 1, name: "Lok Lak", price: 5.50, category: "khmer" },
    { id: 2, name: "Fish Amok", price: 6.00, category: "khmer" },
    { id: 3, name: "Kuy Teav", price: 3.50, category: "noodle" },
  ],
  settings: { vatRate: 10, currency: "USD", khrRate: 4100 },
  exportDate: new Date().toISOString(),
  version: "1.0.0",
};

export function DataBackup() {
  const { lang, fontClass } = useTranslation();
  const l = (en: string, km: string) => (lang === "km" ? km : en);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExportJSON = () => {
    const data = JSON.stringify(mockExportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posbatto_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(l("Data exported as JSON", "បានចេញទិន្នន័យជា JSON"));
  };

  const handleExportCSV = () => {
    const sections: string[] = [];
    sections.push("--- STAFF ---");
    sections.push("ID,Name,Role");
    mockExportData.staff.forEach((s) => sections.push(`${s.id},${s.name},${s.role}`));
    sections.push("");
    sections.push("--- MENU ---");
    sections.push("ID,Name,Price,Category");
    mockExportData.menu.forEach((m) => sections.push(`${m.id},${m.name},${m.price},${m.category}`));
    sections.push("");
    sections.push("--- SETTINGS ---");
    sections.push(`VAT Rate,${mockExportData.settings.vatRate}%`);
    sections.push(`Currency,${mockExportData.settings.currency}`);
    sections.push(`KHR Rate,${mockExportData.settings.khrRate}`);

    const blob = new Blob(["\uFEFF" + sections.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posbatto_backup_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(l("Data exported as CSV", "បានចេញទិន្នន័យជា CSV"));
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          JSON.parse(reader.result as string);
          setTimeout(() => {
            setImporting(false);
            toast.success(l("Data imported successfully", "បាននាំចូលទិន្នន័យដោយជោគជ័យ"));
          }, 1500);
        } catch {
          setImporting(false);
          toast.error(l("Invalid JSON file", "ឯកសារ JSON មិនត្រឹមត្រូវ"));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    toast.success(l("Data reset to defaults", "បានកំណត់ទិន្នន័យឡើងវិញ"));
  };

  return (
    <div className={`p-6 ${fontClass}`}>
      {/* Export section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 mb-4"><FileJson size={24} /></div>
          <h3 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>{l("Export JSON", "ចេញ JSON")}</h3>
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>{l("Full data backup including staff, menu, settings, and promotions", "បម្រុងទុកទិន្នន័យទាំងអស់")}</p>
          <button onClick={handleExportJSON} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-green-600 shadow-md shadow-green-200 dark:shadow-green-900" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Download size={16} />{l("Export JSON", "ចេញ JSON")}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-4"><Database size={24} /></div>
          <h3 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>{l("Export CSV", "ចេញ CSV")}</h3>
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>{l("Spreadsheet-friendly format for Excel or Google Sheets", "ទម្រង់សម្រាប់ Excel")}</p>
          <button onClick={handleExportCSV} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Download size={16} />{l("Export CSV", "ចេញ CSV")}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 mb-4"><Upload size={24} /></div>
          <h3 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>{l("Import Data", "នាំចូលទិន្នន័យ")}</h3>
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>{l("Restore from a JSON backup file", "ស្ដារពីឯកសារបម្រុងទុក JSON")}</p>
          <button onClick={handleImport} disabled={importing} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl shadow-md ${importing ? "bg-gray-300 cursor-wait" : "bg-purple-500 text-white hover:bg-purple-600 shadow-purple-200 dark:shadow-purple-900"}`} style={{ fontSize: "13px", fontWeight: 600 }}>
            <Upload size={16} />{importing ? l("Importing...", "កំពុងនាំចូល...") : l("Import JSON", "នាំចូល JSON")}
          </button>
        </div>
      </div>

      {/* Reset section */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0"><RotateCcw size={20} /></div>
          <div className="flex-1">
            <h3 className="text-red-700 dark:text-red-400" style={{ fontSize: "15px", fontWeight: 600 }}>{l("Reset to Defaults", "កំណត់ឡើងវិញ")}</h3>
            <p className="text-red-500/70 mt-0.5" style={{ fontSize: "12px" }}>{l("This will reset all data to factory defaults. This action cannot be undone.", "សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។")}</p>
            {showResetConfirm ? (
              <div className="flex items-center gap-2 mt-3">
                <button onClick={handleReset} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" style={{ fontSize: "12px", fontWeight: 600 }}>
                  <Check size={14} className="inline mr-1" />{l("Confirm Reset", "បញ្ជាក់")}
                </button>
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 rounded-lg" style={{ fontSize: "12px", fontWeight: 600 }}>{l("Cancel", "បោះបង់")}</button>
              </div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="mt-3 px-4 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors" style={{ fontSize: "12px", fontWeight: 600 }}>
                <RotateCcw size={13} className="inline mr-1" />{l("Reset All Data", "កំណត់ទាំងអស់ឡើងវិញ")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backup history */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <HardDrive size={16} className="text-[#22C55E]" />
          <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 600 }}>{l("Backup History", "ប្រវត្តិបម្រុងទុក")}</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {mockBackups.map((b) => (
            <div key={b.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.status === "completed" ? "bg-green-50 dark:bg-green-900/20 text-green-500" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                {b.status === "completed" ? <Check size={14} /> : <AlertTriangle size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-mono" style={{ fontSize: "13px", fontWeight: 500 }}>{b.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "11px" }}><Clock size={10} />{b.date}</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>{b.size}</span>
                  <span className="px-1.5 py-0.5 rounded capitalize" style={{ fontSize: "9px", fontWeight: 600, backgroundColor: b.type === "auto" ? "#3B82F615" : "#22C55E15", color: b.type === "auto" ? "#3B82F6" : "#22C55E" }}>{b.type}</span>
                </div>
              </div>
              {b.status === "completed" && (
                <button className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 transition-colors" style={{ fontSize: "11px", fontWeight: 500 }}>
                  <Download size={12} className="inline mr-1" />{l("Download", "ទាញយក")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
