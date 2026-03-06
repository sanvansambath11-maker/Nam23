import { createContext, useContext, useState, type ReactNode } from "react";

export interface InvoiceSettings {
    logo: string; // base64 data URL or empty
    businessName: string;
    businessNameKm: string;
    tagline: string;
    taglineKm: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    vatRate: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    footerNote: string;
    footerNoteKm: string;
    showLogo: boolean;
    showQR: boolean;
    invoicePrefix: string;
}

const defaultInvoiceSettings: InvoiceSettings = {
    logo: "",
    businessName: "POS Batto",
    businessNameKm: "កាហ្វេ សង់",
    tagline: "Restaurant & Cafe",
    taglineKm: "ភោជនីយដ្ឋាន និង កាហ្វេ",
    address: "St. 214, Phnom Penh, Cambodia",
    phone: "+855 23 456 789",
    email: "info@posbatto.kh",
    website: "www.posbatto.com",
    taxId: "TIN-KH-1234567",
    vatRate: 10,
    bankName: "ABA Bank",
    accountName: "POS Batto Co., Ltd",
    accountNumber: "001 234 567",
    footerNote: "Thank you for dining with us!",
    footerNoteKm: "អរគុណសម្រាប់ការញ៉ាំ!",
    showLogo: true,
    showQR: false,
    invoicePrefix: "INV",
};

interface InvoiceContextValue {
    invoiceSettings: InvoiceSettings;
    updateInvoiceSetting: <K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) => void;
    nextInvoiceNumber: () => string;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

// Persist invoice counter in localStorage to prevent duplicates across reloads
const INVOICE_COUNTER_KEY = "battoclub_invoice_counter_v2";
function getPersistedCounter(): number {
    try {
        const stored = localStorage.getItem(INVOICE_COUNTER_KEY);
        return stored ? parseInt(stored, 10) : 0;
    } catch {
        return 0;
    }
}
function setPersistedCounter(value: number) {
    try {
        localStorage.setItem(INVOICE_COUNTER_KEY, String(value));
    } catch { /* ignore */ }
}
let invoiceCounter = getPersistedCounter();

export function InvoiceProvider({ children }: { children: ReactNode }) {
    const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(defaultInvoiceSettings);

    const updateInvoiceSetting = <K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) => {
        setInvoiceSettings((prev) => ({ ...prev, [key]: value }));
    };

    const nextInvoiceNumber = () => {
        invoiceCounter++;
        setPersistedCounter(invoiceCounter);
        return `${invoiceSettings.invoicePrefix}-${String(invoiceCounter).padStart(4, "0")}`;
    };

    return (
        <InvoiceContext.Provider value={{ invoiceSettings, updateInvoiceSetting, nextInvoiceNumber }}>
            {children}
        </InvoiceContext.Provider>
    );
}

export function useInvoice() {
    const ctx = useContext(InvoiceContext);
    if (!ctx) throw new Error("useInvoice must be used within InvoiceProvider");
    return ctx;
}
