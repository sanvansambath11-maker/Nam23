import { useState, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { TranslationProvider, useTranslation } from "./components/translation-context";
import { ThemeProvider } from "./components/theme-context";
import { CurrencyProvider } from "./components/currency-context";
import { AuthProvider, useAuth } from "./components/auth-context";
import { Navbar } from "./components/navbar";
import { Categories } from "./components/categories";
import { MenuGrid, type MenuItem } from "./components/menu-grid";
import { OrderSidebar, type OrderItem } from "./components/order-sidebar";
import { PaymentModal } from "./components/payment-modal";
import { InvoiceModal } from "./components/invoice-modal";
import { InvoiceProvider, useInvoice } from "./components/invoice-context";
import { SplitBillModal } from "./components/split-bill-modal";
import { ReceiptModal } from "./components/receipt-modal";
import { KitchenView } from "./components/kitchen-view";
import { TableMapView } from "./components/table-map-view";
import { AnalyticsView } from "./components/analytics-view";
import { HistoryView } from "./components/history-view";
import { MobileDrawer } from "./components/mobile-drawer";
import { StaffLogin, type StaffMember } from "./components/staff-login";
import { ItemCustomizationModal } from "./components/item-customization-modal";
import { DailySummaryModal } from "./components/daily-summary-modal";
import { AdminLayout } from "./components/admin/admin-layout";
import { AnimatePresence } from "motion/react";
import { notifyPaymentReceived } from "../lib/telegram-notify";
import { createOrder } from "../lib/db-service";
import { isSupabaseConfigured } from "../lib/supabase";
import { addLocalOrder } from "../lib/local-orders";

import { WebNavbar } from "./components/website/website-navbar";
import { WebFooter } from "./components/website/website-footer";
import { HomePage } from "./components/website/home-page";
import { AboutPage } from "./components/website/about-page";
import { FeaturesPage } from "./components/website/features-page";
import { PricingPage } from "./components/website/pricing-page";
import { ContactPage } from "./components/website/contact-page";
import { RegisterPage } from "./components/website/register-page";
import { LoginPage } from "./components/website/login-page";

const initialItems: OrderItem[] = [];

let nextId = 100;

type AppView = "pos" | "admin";
type AppMode = "website" | "dashboard";

function POSDashboard({ onBackToWebsite }: { onBackToWebsite?: () => void }) {
  const { t, fontClass } = useTranslation();
  const { user, isAuthenticated, isAdmin, login, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("menu");
  const [activeCategory, setActiveCategory] = useState("allMenu");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const [appView, setAppView] = useState<AppView>("pos");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoicePayMethod, setInvoicePayMethod] = useState("cash");
  const [invoiceItems, setInvoiceItems] = useState<{ name: string; price: number; quantity: number; modifications?: string[] }[]>([]);
  const { nextInvoiceNumber } = useInvoice();

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.10;
  const discount = subtotal * 0.05;
  const total = subtotal + vat - discount;

  const handleAddItem = useCallback((item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) => (i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: nextId++, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`${item.name} added!`, { duration: 1500 });
  }, []);

  const handleCustomizedAdd = useCallback((item: MenuItem, quantity: number, modifications: string[], _notes: string) => {
    setOrderItems((prev) => {
      return [...prev, { id: nextId++, name: item.name, price: item.price, quantity, modifications: modifications.length > 0 ? modifications : undefined }];
    });
    toast.success(`${item.name} x${quantity} added!`, { duration: 1500 });
  }, []);

  const handleUpdateQuantity = useCallback((id: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item)).filter((item) => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((id: number) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item removed", { duration: 1000 });
  }, []);

  const handlePaymentSuccess = async (paymentMethod: string) => {
    const itemCount = orderItems.reduce((s, i) => s + i.quantity, 0);
    const orderNumber = nextInvoiceNumber();
    const restaurantName = (() => {
      try {
        const u = localStorage.getItem("battoclub_user");
        if (!u) return undefined;
        const j = JSON.parse(u);
        return j.restaurantName ?? j.name ?? undefined;
      } catch {
        return undefined;
      }
    })();

    // Save order to Supabase
    if (isSupabaseConfigured()) {
      try {
        // Get restaurant_id from localStorage user data
        let restaurantId = "";
        try {
          const u = localStorage.getItem("battoclub_user");
          if (u) {
            const j = JSON.parse(u);
            restaurantId = j.restaurantId ?? j.restaurant_id ?? "";
          }
        } catch { /* ignore */ }

        await createOrder({
          restaurant_id: restaurantId,
          order_number: orderNumber,
          items: orderItems.map(i => ({ name: i.name, price: i.price, qty: i.quantity, mods: i.modifications })) as unknown as never,
          subtotal: Number(subtotal.toFixed(2)),
          vat: Number(vat.toFixed(2)),
          discount: Number(discount.toFixed(2)),
          total: Number(total.toFixed(2)),
          payment_method: paymentMethod,
          status: "served",
          table_number: null,
          customer_name: null,
          staff_id: null,
          notes: null,
        });
      } catch (err) {
        console.error("Failed to save order:", err);
      }
    }

    // Always save order locally (works without Supabase)
    addLocalOrder({
      order_number: orderNumber,
      items: orderItems.map(i => ({ name: i.name, price: i.price, qty: i.quantity, mods: i.modifications })),
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
      payment_method: paymentMethod,
      status: "served",
      table_number: null,
      customer_name: null,
      staff_name: null,
    });

    notifyPaymentReceived({
      total,
      paymentMethod,
      itemCount,
      restaurantName,
    });
    setShowPayment(false);
    // Save items for invoice before clearing
    setInvoiceItems([...orderItems]);
    setInvoicePayMethod(paymentMethod);
    setShowInvoice(true);
    setOrderItems([]);
  };

  const handleCancelOrder = useCallback(() => {
    if (orderItems.length === 0) return;

    const orderNumber = nextInvoiceNumber();
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const vatAmt = subtotal * 0.10;
    const discountAmt = subtotal * 0.05;
    const totalAmt = subtotal + vatAmt - discountAmt;

    // Save cancelled order locally so admin can see it
    addLocalOrder({
      order_number: orderNumber,
      items: orderItems.map(i => ({ name: i.name, price: i.price, qty: i.quantity, mods: i.modifications })),
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vatAmt.toFixed(2)),
      discount: Number(discountAmt.toFixed(2)),
      total: Number(totalAmt.toFixed(2)),
      payment_method: "none",
      status: "cancelled",
      table_number: null,
      customer_name: null,
      staff_name: user?.name ?? null,
    });

    setOrderItems([]);
    toast.error(t("cancelOrder") || "Order cancelled", { duration: 2000, icon: "❌" });
  }, [orderItems, nextInvoiceNumber, user]);

  const handleLogin = useCallback((staff: StaffMember) => {
    login({ ...staff, isActive: true });
    toast.success(`Welcome, ${staff.name}!`, { duration: 2000, icon: "👋" });
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    setAppView("pos");
    toast.info("Logged out", { duration: 1500 });
  }, [logout]);

  const handleOpenAdmin = useCallback(() => {
    if (isAdmin) {
      setAppView("admin");
    } else {
      toast.error("Access denied. Manager role required.", { duration: 2000 });
    }
  }, [isAdmin]);

  if (!isAuthenticated) {
    return <StaffLogin onLogin={handleLogin} onBackToWebsite={onBackToWebsite} />;
  }

  if (appView === "admin" && isAdmin) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AdminLayout onBackToPOS={() => setAppView("pos")} />
      </>
    );
  }

  const handleTabChange = (tab: string) => {
    if (tab === "kitchen" && !hasPermission("kitchen.access")) {
      toast.error(t("accessDenied") || "Access denied", { duration: 1500 });
      return;
    }
    if (tab === "analytics" && !hasPermission("analytics.access")) {
      toast.error(t("accessDenied") || "Access denied", { duration: 1500 });
      return;
    }
    if (tab === "history" && !hasPermission("history.access")) {
      toast.error(t("accessDenied") || "Access denied", { duration: 1500 });
      return;
    }
    setActiveTab(tab);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "kitchen":
        return <KitchenView />;
      case "tables":
        return <TableMapView />;
      case "analytics":
        return <AnalyticsView />;
      case "history":
        return <HistoryView />;
      case "menu":
      default:
        return (
          <div className="p-6">
            <Categories activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            <MenuGrid
              onAddItem={handleAddItem}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onCustomize={setCustomizeItem}
            />
          </div>
        );
    }
  };

  const sidebarContent = (
    <OrderSidebar
      items={orderItems}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
      onPay={() => setShowPayment(true)}
      onSplitBill={() => setShowSplitBill(true)}
      onReceipt={() => setShowReceipt(true)}
      onCancelOrder={handleCancelOrder}
    />
  );

  return (
    <div className={`h-screen flex flex-col premium-bg ${useTranslation().fontClass}`}>
      <Toaster position="top-right" richColors />
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        staffName={user?.name}
        staffNameKm={user?.nameKm}
        staffRole={user?.role}
        staffInitials={user?.initials}
        staffColor={user?.color}
        onLogout={handleLogout}
        onDailySummary={() => setShowDailySummary(true)}
        isAdmin={isAdmin}
        onOpenAdmin={handleOpenAdmin}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto premium-scrollbar">
          {renderMainContent()}
        </div>

        {(activeTab === "menu" || activeTab === "reservation" || activeTab === "delivery") && (
          <div className="hidden lg:flex p-4 pl-0">
            {sidebarContent}
          </div>
        )}
      </div>

      {(activeTab === "menu" || activeTab === "reservation" || activeTab === "delivery") && (
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          onToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          itemCount={orderItems.reduce((sum, i) => sum + i.quantity, 0)}
        >
          {sidebarContent}
        </MobileDrawer>
      )}

      <AnimatePresence>
        {showPayment && (
          <PaymentModal key="payment" total={total} items={orderItems} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />
        )}
        {showSplitBill && (
          <SplitBillModal key="splitbill" total={total} onClose={() => setShowSplitBill(false)} />
        )}
        {showReceipt && (
          <ReceiptModal key="receipt" items={orderItems} onClose={() => setShowReceipt(false)} />
        )}
        {customizeItem && (
          <ItemCustomizationModal
            key={`customize-${customizeItem.id}`}
            item={customizeItem}
            onClose={() => setCustomizeItem(null)}
            onAdd={handleCustomizedAdd}
          />
        )}
        {showDailySummary && (
          <DailySummaryModal key="dailysummary" onClose={() => setShowDailySummary(false)} />
        )}
        {showInvoice && (
          <InvoiceModal
            key="invoice"
            items={invoiceItems}
            paymentMethod={invoicePayMethod}
            onClose={() => setShowInvoice(false)}
            onNewOrder={() => { setShowInvoice(false); setOrderItems([]); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WebsiteShell({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  const { fontClass } = useTranslation();
  const [page, setPage] = useState("home");

  const handleNavigate = (target: string) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showNavFooter = !["login", "register"].includes(page);

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "about":
        return <AboutPage />;
      case "features":
        return <FeaturesPage onNavigate={handleNavigate} />;
      case "pricing":
        return <PricingPage onNavigate={handleNavigate} />;
      case "contact":
        return <ContactPage />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} onRegisterSuccess={onEnterDashboard} />;
      case "login":
        return <LoginPage onNavigate={handleNavigate} onLoginSuccess={onEnterDashboard} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${fontClass}`}>
      <Toaster position="top-right" richColors />
      {showNavFooter && <WebNavbar currentPage={page} onNavigate={handleNavigate} />}
      {renderPage()}
      {showNavFooter && <WebFooter onNavigate={handleNavigate} />}
    </div>
  );
}

function isValidRestaurantUser(raw: string | null): boolean {
  if (!raw || typeof raw !== "string") return false;
  try {
    const data = JSON.parse(raw);
    return !!(data && (data.restaurantName ?? data.name ?? data.owner_name));
  } catch {
    return false;
  }
}

function AppContent() {
  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem("battoclub_user");
    return isValidRestaurantUser(saved) ? "dashboard" : "website";
  });

  const handleEnterDashboard = () => setMode("dashboard");
  const handleBackToWebsite = () => {
    localStorage.removeItem("battoclub_user");
    setMode("website");
  };

  if (mode === "website") {
    return <WebsiteShell onEnterDashboard={handleEnterDashboard} />;
  }

  return (
    <AuthProvider>
      <POSDashboard onBackToWebsite={handleBackToWebsite} />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <CurrencyProvider>
          <InvoiceProvider>
            <AppContent />
          </InvoiceProvider>
        </CurrencyProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
