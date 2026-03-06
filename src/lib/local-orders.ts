// Local order storage - works without Supabase
// Orders are stored in localStorage and used by admin dashboard

export interface LocalOrder {
    id: number;
    order_number: string;
    items: { name: string; price: number; qty: number; mods?: string[] }[];
    subtotal: number;
    vat: number;
    discount: number;
    total: number;
    payment_method: string;
    status: string;
    table_number: number | null;
    customer_name: string | null;
    staff_name: string | null;
    created_at: string;
}

const ORDERS_KEY = "kafesans_orders";
let nextOrderId = 1;

function loadOrders(): LocalOrder[] {
    try {
        const stored = localStorage.getItem(ORDERS_KEY);
        if (!stored) return [];
        const orders = JSON.parse(stored) as LocalOrder[];
        // Update nextOrderId
        if (orders.length > 0) {
            nextOrderId = Math.max(...orders.map(o => o.id)) + 1;
        }
        return orders;
    } catch {
        return [];
    }
}

function saveOrders(orders: LocalOrder[]) {
    try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch { /* ignore quota errors */ }
}

// Initialize on load
let cachedOrders: LocalOrder[] = loadOrders();

export function addLocalOrder(order: Omit<LocalOrder, "id" | "created_at">): LocalOrder {
    const newOrder: LocalOrder = {
        ...order,
        id: nextOrderId++,
        created_at: new Date().toISOString(),
    };
    cachedOrders = [newOrder, ...cachedOrders];
    saveOrders(cachedOrders);
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent("order-added", { detail: newOrder }));
    return newOrder;
}

export function getLocalOrders(limit = 200): LocalOrder[] {
    // Refresh from storage in case another tab updated
    cachedOrders = loadOrders();
    return cachedOrders.slice(0, limit);
}

export function updateLocalOrderStatus(id: number, status: string) {
    cachedOrders = loadOrders();
    const orderIndex = cachedOrders.findIndex((o) => o.id === id);
    if (orderIndex > -1) {
        cachedOrders[orderIndex].status = status;
        saveOrders(cachedOrders);
        window.dispatchEvent(new CustomEvent("order-updated", { detail: cachedOrders[orderIndex] }));
    }
}

export function getLocalOrdersToday(): LocalOrder[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    return getLocalOrders(500).filter(o => new Date(o.created_at).getTime() >= todayTs);
}

export function getLocalDashboardStats() {
    const todayOrders = getLocalOrdersToday();
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const uniqueCustomers = new Set(todayOrders.map(o => o.customer_name || "walk-in")).size;

    return {
        todayOrders: todayOrders.length,
        todayRevenue,
        totalCustomers: uniqueCustomers,
        avgOrder: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0,
    };
}

export function clearLocalOrders() {
    cachedOrders = [];
    saveOrders([]);
}
