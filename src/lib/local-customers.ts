export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
    points: number;
    tier: "bronze" | "silver" | "gold" | "platinum";
    visits: number;
    totalSpent: number;
    lastVisit: string;
    joinDate: string;
    notes: string;
}

const CUSTOMERS_KEY = "battoclub_customers_v2";

const initialCustomers: Customer[] = [];

let nextCustId = 1;

export function loadCustomers(): Customer[] {
    try {
        const stored = localStorage.getItem(CUSTOMERS_KEY);
        if (!stored) {
            saveCustomers(initialCustomers);
            return initialCustomers;
        }
        const customers = JSON.parse(stored) as Customer[];
        if (customers.length > 0) {
            nextCustId = Math.max(...customers.map(c => c.id)) + 1;
        }
        return customers;
    } catch {
        return initialCustomers;
    }
}

export function saveCustomers(customers: Customer[]) {
    try {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
        window.dispatchEvent(new Event("customers-updated"));
    } catch { /* ignore */ }
}

export function addCustomer(data: Omit<Customer, "id">): Customer {
    const customers = loadCustomers();
    const newCust = { ...data, id: nextCustId++ };
    customers.push(newCust);
    saveCustomers(customers);
    return newCust;
}

export function updateCustomer(data: Customer) {
    const customers = loadCustomers();
    const idx = customers.findIndex(c => c.id === data.id);
    if (idx > -1) {
        customers[idx] = data;
        saveCustomers(customers);
    }
}

export function addPoints(id: number, pts: number) {
    const customers = loadCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx > -1) {
        const newPts = customers[idx].points + pts;
        let tier: Customer["tier"] = "bronze";
        if (newPts >= 1000) tier = "platinum";
        else if (newPts >= 500) tier = "gold";
        else if (newPts >= 200) tier = "silver";
        customers[idx].points = newPts;
        customers[idx].tier = tier;
        saveCustomers(customers);
    }
}

export function recordCustomerVisit(id: number, spent: number, earnedPoints: number) {
    const customers = loadCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx > -1) {
        customers[idx].visits += 1;
        customers[idx].totalSpent += spent;
        customers[idx].lastVisit = new Date().toISOString().split("T")[0];
        const newPts = customers[idx].points + earnedPoints;
        let tier: Customer["tier"] = "bronze";
        if (newPts >= 1000) tier = "platinum";
        else if (newPts >= 500) tier = "gold";
        else if (newPts >= 200) tier = "silver";
        customers[idx].points = newPts;
        customers[idx].tier = tier;
        saveCustomers(customers);
    }
}
