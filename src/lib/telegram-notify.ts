/**
 * Telegram automation: read settings from localStorage (set in Admin Settings)
 * and send alerts when payment received, new order, etc.
 */

const STORAGE_KEY = "battoclub_telegram";

export interface TelegramStoredSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
  alerts: {
    paymentReceived: boolean;
    newOrder: boolean;
    lowStock: boolean;
    dailySummary: boolean;
    staffClock: boolean;
    orderVoid: boolean;
  };
}

function getTelegramSettings(): TelegramStoredSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.botToken || !data.chatId) return null;
    return {
      enabled: !!data.enabled,
      botToken: data.botToken,
      chatId: data.chatId,
      alerts: {
        paymentReceived: data.alerts?.paymentReceived !== false,
        newOrder: data.alerts?.newOrder !== false,
        lowStock: data.alerts?.lowStock !== false,
        dailySummary: data.alerts?.dailySummary !== false,
        staffClock: !!data.alerts?.staffClock,
        orderVoid: data.alerts?.orderVoid !== false,
      },
    };
  } catch {
    return null;
  }
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

/** Call after payment success; sends to Telegram if enabled and paymentReceived alert is on. */
export async function notifyPaymentReceived(payload: {
  total: number;
  paymentMethod: string;
  itemCount: number;
  restaurantName?: string;
}): Promise<void> {
  const settings = getTelegramSettings();
  if (!settings?.enabled || !settings.alerts.paymentReceived) return;

  const { total, paymentMethod, itemCount, restaurantName = "Restaurant" } = payload;
  const time = new Date().toLocaleString();
  const msg = `💰 *Payment received*\n\n🍽️ ${restaurantName}\n📦 ${itemCount} item(s)\n💵 Total: $${total.toFixed(2)}\n💳 Method: ${paymentMethod}\n🕐 ${time}`;
  await sendTelegramMessage(settings.botToken, settings.chatId, msg);
}

/** Call when a new order is placed (optional). */
export async function notifyNewOrder(payload: {
  orderSummary: string;
  total: number;
  tableOrCustomer?: string;
  restaurantName?: string;
}): Promise<void> {
  const settings = getTelegramSettings();
  if (!settings?.enabled || !settings.alerts.newOrder) return;

  const { orderSummary, total, tableOrCustomer, restaurantName = "Restaurant" } = payload;
  const time = new Date().toLocaleString();
  let msg = `🆕 *New order*\n\n🍽️ ${restaurantName}\n${orderSummary}\n💵 Total: $${total.toFixed(2)}\n🕐 ${time}`;
  if (tableOrCustomer) msg += `\n📍 ${tableOrCustomer}`;
  await sendTelegramMessage(settings.botToken, settings.chatId, msg);
}

/** Call to send End of Day Z-Report */
export async function notifyDailySummary(payload: {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  restaurantName?: string;
  paymentBreakdown: { method: string; amount: number }[];
}): Promise<void> {
  const settings = getTelegramSettings();
  if (!settings?.enabled || !settings.alerts.dailySummary) return;

  const { totalRevenue, totalOrders, totalCustomers, restaurantName = "Restaurant", paymentBreakdown } = payload;
  const time = new Date().toLocaleString();

  let msg = `📊 *End of Day Z-Report*\n\n🍽️ ${restaurantName}\n🕐 ${time}\n\n`;
  msg += `💵 *Total Revenue*: $${totalRevenue.toFixed(2)}\n`;
  msg += `📦 *Total Orders*: ${totalOrders}\n`;
  msg += `👥 *Customers*: ${totalCustomers}\n\n`;

  msg += `💳 *Payment Breakdown*:\n`;
  paymentBreakdown.forEach(p => {
    msg += `• ${p.method.toUpperCase()}: $${p.amount.toFixed(2)}\n`;
  });

  await sendTelegramMessage(settings.botToken, settings.chatId, msg);
}

/** Persist Telegram config from Admin Settings so POS can use it. */
export function saveTelegramSettings(settings: TelegramStoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getTelegramStorageKey(): string {
  return STORAGE_KEY;
}
