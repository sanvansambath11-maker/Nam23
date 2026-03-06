import { useState } from "react";
import { useTranslation } from "../translation-context";
import { useTheme } from "../theme-context";
import { useAuth } from "../auth-context";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Settings,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
  Globe,
  Shield,
  ChevronRight,
  FileBarChart,
  Package,
  Heart,
  Tag,
  ClipboardList,
  Clock,
  Bell,
  HardDrive,
  Lock,
  QrCode,
  CreditCard,
  Activity,
  Printer,
  BarChart3,
  FileDown,
  Zap,
} from "lucide-react";
import { KitchenDisplaySystem } from "../kitchen-display";
import { AdminDashboard } from "./admin-dashboard";
import { StaffManagement } from "./staff-management";
import { MenuManagement } from "./menu-management";
import { AdminSettings } from "./admin-settings";
import { AdminReports } from "./admin-reports";
import { InventoryManagement } from "./inventory-management";
import { CustomerLoyalty } from "./customer-loyalty";
import { PromotionsCoupons } from "./promotions-coupons";
import { AuditLog } from "./audit-log";
import { StaffShifts } from "./staff-shifts";
import { NotificationCenter } from "./notification-center";
import { DataBackup } from "./data-backup";
import { RolesPermissions } from "./roles-permissions";
import { SuperAdmin } from "./super-admin";
import { QROrdering } from "./qr-ordering";
import { MultiPayment } from "./multi-payment";
import { LiveSalesDashboard } from "./live-sales-dashboard";
import { ThermalPrinterSupport } from "./thermal-printer";
import { AdvancedAnalytics } from "./advanced-analytics";
import { ExportReports } from "./export-reports";
import { SmartAlerts } from "./smart-alerts";

type AdminTab = "dashboard" | "kitchen" | "staff" | "menuMgmt" | "inventory" | "customers" | "promotions" | "reports" | "shifts" | "notifications" | "auditLog" | "backup" | "roles" | "settings" | "superAdmin" | "qrOrdering" | "multiPayment" | "liveSales" | "thermalPrinter" | "advancedAnalytics" | "exportReports" | "smartAlerts";

interface AdminLayoutProps {
  onBackToPOS: () => void;
}

const sidebarItems: { key: AdminTab; icon: React.ReactNode; section?: string }[] = [
  { key: "dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "kitchen", icon: <UtensilsCrossed size={20} />, section: "pos" },
  { key: "liveSales", icon: <Activity size={20} /> },
  { key: "staff", icon: <Users size={20} />, section: "manage" },
  { key: "menuMgmt", icon: <UtensilsCrossed size={20} /> },
  { key: "inventory", icon: <Package size={20} /> },
  { key: "customers", icon: <Heart size={20} /> },
  { key: "promotions", icon: <Tag size={20} /> },
  { key: "qrOrdering", icon: <QrCode size={20} />, section: "pos" },
  { key: "multiPayment", icon: <CreditCard size={20} /> },
  { key: "thermalPrinter", icon: <Printer size={20} /> },
  { key: "reports", icon: <FileBarChart size={20} />, section: "insights" },
  { key: "advancedAnalytics", icon: <BarChart3 size={20} /> },
  { key: "exportReports", icon: <FileDown size={20} /> },
  { key: "smartAlerts", icon: <Zap size={20} /> },
  { key: "shifts", icon: <Clock size={20} /> },
  { key: "notifications", icon: <Bell size={20} /> },
  { key: "auditLog", icon: <ClipboardList size={20} /> },
  { key: "backup", icon: <HardDrive size={20} />, section: "system" },
  { key: "roles", icon: <Lock size={20} /> },
  { key: "settings", icon: <Settings size={20} /> },
  { key: "superAdmin", icon: <Shield size={20} />, section: "owner" },
];

const tabLabels: Record<AdminTab, { en: string; km: string }> = {
  dashboard: { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
  kitchen: { en: "Kitchen Display", km: "ផ្ទះបាយ" },
  liveSales: { en: "Live Sales", km: "ផ្សាយផ្ទាល់" },
  staff: { en: "Staff", km: "\u1794\u17BB\u1782\u17D2\u1782\u179B\u17B7\u1780" },
  menuMgmt: { en: "Menu", km: "\u1798\u17C9\u17BA\u1793\u17BB\u1799" },
  inventory: { en: "Inventory", km: "\u179F\u17D2\u178F\u17BB\u1780" },
  customers: { en: "Customers", km: "\u17A2\u178F\u17B7\u1790\u17B7\u1787\u1793" },
  promotions: { en: "Promotions", km: "\u1794\u17D2\u179A\u17BC\u1798\u17C9\u17BC\u179F\u17B7\u1793" },
  qrOrdering: { en: "QR Ordering", km: "បញ្ជាទិញ QR" },
  multiPayment: { en: "Multi-Payment", km: "ទូទាត់ច្រើនវិធី" },
  thermalPrinter: { en: "Printer", km: "ម៉ាស៊ីនបោះពុម្ព" },
  reports: { en: "Reports", km: "\u179A\u1794\u17B6\u1799\u1780\u17B6\u179A\u178E\u17CD" },
  advancedAnalytics: { en: "Analytics+", km: "វិភាគកម្រិតខ្ពស់" },
  exportReports: { en: "Export", km: "នាំចេញ" },
  smartAlerts: { en: "Smart Alerts", km: "ការជូនដំណឹង" },
  shifts: { en: "Shifts", km: "\u179C\u17C1\u1793" },
  notifications: { en: "Notifications", km: "\u1780\u17B6\u179A\u1787\u17BC\u1793\u178A\u17C6\u178E\u17B9\u1784" },
  auditLog: { en: "Audit Log", km: "\u1780\u17C6\u178E\u178F\u17CB\u17A0\u17C1\u178F\u17BB" },
  backup: { en: "Backup", km: "\u1794\u17C6\u179A\u17BB\u1784\u1791\u17BB\u1780" },
  roles: { en: "Roles", km: "\u178F\u17BD\u1793\u17B6\u1791\u17B8" },
  settings: { en: "Settings", km: "\u1780\u17B6\u179A\u1780\u17C6\u178E\u178F\u17CB" },
  superAdmin: { en: "Super Admin", km: "អ្នកគ្រប់គ្រងកំពូល" },
};

export function AdminLayout({ onBackToPOS }: AdminLayoutProps) {
  const { lang, setLang, fontClass } = useTranslation();
  const { isDark, toggleDark } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "kitchen":
        return <KitchenDisplaySystem onBack={() => setActiveTab("dashboard")} />;
      case "liveSales":
        return <LiveSalesDashboard />;
      case "staff":
        return <StaffManagement />;
      case "menuMgmt":
        return <MenuManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "customers":
        return <CustomerLoyalty />;
      case "promotions":
        return <PromotionsCoupons />;
      case "qrOrdering":
        return <QROrdering />;
      case "multiPayment":
        return <MultiPayment />;
      case "thermalPrinter":
        return <ThermalPrinterSupport />;
      case "reports":
        return <AdminReports />;
      case "advancedAnalytics":
        return <AdvancedAnalytics />;
      case "exportReports":
        return <ExportReports />;
      case "smartAlerts":
        return <SmartAlerts />;
      case "shifts":
        return <StaffShifts />;
      case "notifications":
        return <NotificationCenter />;
      case "auditLog":
        return <AuditLog />;
      case "backup":
        return <DataBackup />;
      case "roles":
        return <RolesPermissions />;
      case "settings":
        return <AdminSettings />;
      case "superAdmin":
        return <SuperAdmin />;
    }
  };

  return (
    <div className={`h-screen flex bg-gray-50 dark:bg-gray-950 ${fontClass}`}>
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-[72px]" : "w-64"
          } bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <img src="/images/logo.png" alt="POS Batto" className="w-9 h-9 rounded-xl object-cover shrink-0" />
          {!sidebarCollapsed && (
            <div>
              <p className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 700 }}>
                Admin
              </p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>
                POS Batto
              </p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <div key={item.key}>
              {item.section && !sidebarCollapsed && (
                <p className="text-gray-300 dark:text-gray-700 uppercase tracking-wider px-3 mt-3 mb-1" style={{ fontSize: "9px", fontWeight: 700 }}>
                  {item.section === "manage" ? (lang === "km" ? "គ្រប់គ្រង" : "Manage") : item.section === "pos" ? (lang === "km" ? "POS" : "POS Tools") : item.section === "insights" ? (lang === "km" ? "វិភាគ" : "Intelligence") : item.section === "owner" ? (lang === "km" ? "ម្ចាស់" : "Owner") : (lang === "km" ? "ប្រព័ន្ធ" : "System")}
                </p>
              )}
              {item.section && sidebarCollapsed && <div className="border-t border-gray-100 dark:border-gray-800 my-2 mx-2" />}
              <button
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeTab === item.key
                  ? "bg-[#22C55E]/10 text-[#22C55E]"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                style={{ fontSize: "12px", fontWeight: activeTab === item.key ? 600 : 500 }}
              >
                {item.icon}
                {!sidebarCollapsed && (
                  <span>{lang === "km" ? tabLabels[item.key].km : tabLabels[item.key].en}</span>
                )}
              </button>
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button
            onClick={onBackToPOS}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <ChevronLeft size={20} />
            {!sidebarCollapsed && <span>{lang === "km" ? "ត្រឡប់ POS" : "Back to POS"}</span>}
          </button>

          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!sidebarCollapsed && <span>{lang === "km" ? "ម៉ូដងងឹត" : "Dark Mode"}</span>}
          </button>

          <button
            onClick={() => setLang(lang === "en" ? "km" : "en")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Globe size={20} />
            {!sidebarCollapsed && <span>{lang === "en" ? "EN" : "ខ្មែរ"}</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>{lang === "km" ? "ចាកចេញ" : "Logout"}</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 mx-3 mb-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
              {lang === "km" ? tabLabels[activeTab].km : tabLabels[activeTab].en}
            </h1>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>
              {lang === "km" ? "គ្រប់គ្រងភោជនីយដ្ឋានរបស់អ្នក" : "Manage your restaurant"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: user?.color
                    ? `linear-gradient(135deg, ${user.color}, ${user.color}CC)`
                    : "linear-gradient(135deg, #A855F7, #A855F7CC)",
                }}
              >
                <span className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {user?.initials || "AD"}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-gray-900 dark:text-white" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {lang === "km" ? user?.nameKm : user?.name}
                </p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                  {lang === "km" ? "គ្រប់គ្រង" : "Manager"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
