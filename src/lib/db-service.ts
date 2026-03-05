import { supabase, isSupabaseConfigured } from "./supabase";
import type { Tables, InsertTables, UpdateTables } from "./database.types";

type MenuItem = Tables<"menu_items">;
type Order = Tables<"orders">;
type Staff = Tables<"staff">;
type InventoryItem = Tables<"inventory">;
type Customer = Tables<"customers">;
type Promotion = Tables<"promotions">;
type AuditEntry = Tables<"audit_log">;
type StaffShift = Tables<"staff_shifts">;
type Notification = Tables<"notifications">;
type SmartAlert = Tables<"smart_alerts">;
type AlertRule = Tables<"alert_rules">;
type QrTable = Tables<"qr_tables">;
type Payment = Tables<"payments">;
type PaymentSplit = Tables<"payment_splits">;
type Role = Tables<"roles">;
type RolePermission = Tables<"role_permissions">;
type ExportLog = Tables<"export_logs">;
type DataBackup = Tables<"data_backups">;
type PrinterDevice = Tables<"printer_devices">;
type PrinterSetting = Tables<"printer_settings">;
type DailySummary = Tables<"daily_summaries">;

// ─── Menu Items ───

export async function getMenuItems(): Promise<MenuItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}

export async function createMenuItem(item: InsertTables<"menu_items">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("menu_items")
    .insert(item as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMenuItem(id: number, updates: UpdateTables<"menu_items">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("menu_items")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("menu_items")
    .update({ active: false } as never)
    .eq("id", id);
  if (error) throw error;
}

// ─── Orders ───

export async function getOrders(limit = 50): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getOrdersByDateRange(from: string, to: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createOrder(order: InsertTables<"orders">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("orders")
    .insert(order as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: number, status: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("orders")
    .update({ status } as never)
    .eq("id", id);
  if (error) throw error;
}

// ─── Staff ───

export async function getStaff(): Promise<Staff[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("staff")
    .select("*")
    .order("created_at");
  return data ?? [];
}

export async function createStaffMember(staff: InsertTables<"staff">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("staff")
    .insert(staff as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStaffMember(id: string, updates: UpdateTables<"staff">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("staff")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStaffMember(id: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw error;
}

// ─── Inventory ───

export async function getInventory(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("inventory")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function createInventoryItem(item: InsertTables<"inventory">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("inventory")
    .insert(item as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInventoryItem(id: number, updates: UpdateTables<"inventory">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("inventory")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInventoryItem(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("inventory").delete().eq("id", id);
  if (error) throw error;
}

// ─── Customers ───

export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function createCustomer(customer: InsertTables<"customers">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("customers")
    .insert(customer as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(id: number, updates: UpdateTables<"customers">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("customers")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Promotions ───

export async function getPromotions(): Promise<Promotion[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createPromotion(promo: InsertTables<"promotions">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("promotions")
    .insert(promo as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePromotion(id: number, updates: UpdateTables<"promotions">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("promotions")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePromotion(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw error;
}

// ─── Audit Log ───

export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function addAuditEntry(entry: InsertTables<"audit_log">) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("audit_log").insert(entry as never);
}

// ─── Restaurant Settings ───

export async function getRestaurantSettings() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("restaurants")
    .select("id, name, settings, plan, trial_ends")
    .single();
  return data;
}

export async function updateRestaurantSettings(id: string, settings: Record<string, unknown>) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("restaurants")
    .update({ settings } as never)
    .eq("id", id);
  if (error) throw error;
}

// ─── Dashboard Stats ───

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [ordersRes, menuRes, staffRes, customersRes] = await Promise.all([
    supabase.from("orders").select("total, status, created_at").gte("created_at", todayStr),
    supabase.from("menu_items").select("id", { count: "exact" }).eq("active", true),
    supabase.from("staff").select("id", { count: "exact" }).eq("status", "active"),
    supabase.from("customers").select("id", { count: "exact" }),
  ]);

  const todayOrders = (ordersRes.data as { total: number; status: string; created_at: string }[]) ?? [];
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);

  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    totalMenuItems: menuRes.count ?? 0,
    activeStaff: staffRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
  };
}

// ─── Staff Shifts ───

export async function getStaffShifts(date?: string): Promise<StaffShift[]> {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from("staff_shifts").select("*").order("date", { ascending: false });
  if (date) query = query.eq("date", date);
  const { data } = await query;
  return (data as StaffShift[]) ?? [];
}

export async function createStaffShift(shift: InsertTables<"staff_shifts">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("staff_shifts").insert(shift as never).select().single();
  if (error) throw error;
  return data as StaffShift;
}

export async function updateStaffShift(id: number, updates: UpdateTables<"staff_shifts">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("staff_shifts").update(updates as never).eq("id", id).select().single();
  if (error) throw error;
  return data as StaffShift;
}

export async function clockIn(shiftId: number) {
  return updateStaffShift(shiftId, { clock_in: new Date().toISOString(), status: "active" } as never);
}

export async function clockOut(shiftId: number) {
  return updateStaffShift(shiftId, { clock_out: new Date().toISOString(), status: "completed" } as never);
}

// ─── Notifications ───

export async function getNotifications(limit = 50): Promise<Notification[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Notification[]) ?? [];
}

export async function createNotification(notif: InsertTables<"notifications">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("notifications").insert(notif as never).select().single();
  if (error) throw error;
  return data as Notification;
}

export async function markNotificationRead(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("notifications").update({ read: true } as never).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("notifications").update({ read: true } as never).eq("read", false);
  if (error) throw error;
}

export async function deleteNotification(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}

// ─── Smart Alerts ───

export async function getSmartAlerts(limit = 50): Promise<SmartAlert[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("smart_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as SmartAlert[]) ?? [];
}

export async function createSmartAlert(alert: InsertTables<"smart_alerts">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("smart_alerts").insert(alert as never).select().single();
  if (error) throw error;
  return data as SmartAlert;
}

export async function markAlertRead(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("smart_alerts").update({ read: true } as never).eq("id", id);
  if (error) throw error;
}

export async function dismissAlert(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("smart_alerts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Alert Rules ───

export async function getAlertRules(): Promise<AlertRule[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from("alert_rules").select("*").order("created_at");
  return (data as AlertRule[]) ?? [];
}

export async function createAlertRule(rule: InsertTables<"alert_rules">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("alert_rules").insert(rule as never).select().single();
  if (error) throw error;
  return data as AlertRule;
}

export async function updateAlertRule(id: number, updates: UpdateTables<"alert_rules">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("alert_rules").update(updates as never).eq("id", id).select().single();
  if (error) throw error;
  return data as AlertRule;
}

export async function toggleAlertRule(id: number, enabled: boolean) {
  return updateAlertRule(id, { enabled } as never);
}

// ─── QR Tables ───

export async function getQrTables(): Promise<QrTable[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from("qr_tables").select("*").order("table_number");
  return (data as QrTable[]) ?? [];
}

export async function createQrTable(table: InsertTables<"qr_tables">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("qr_tables").insert(table as never).select().single();
  if (error) throw error;
  return data as QrTable;
}

export async function updateQrTable(id: number, updates: UpdateTables<"qr_tables">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("qr_tables").update(updates as never).eq("id", id).select().single();
  if (error) throw error;
  return data as QrTable;
}

export async function deleteQrTable(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("qr_tables").delete().eq("id", id);
  if (error) throw error;
}

// ─── Payments ───

export async function getPayments(limit = 50): Promise<Payment[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Payment[]) ?? [];
}

export async function createPayment(payment: InsertTables<"payments">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("payments").insert(payment as never).select().single();
  if (error) throw error;
  return data as Payment;
}

export async function updatePaymentStatus(id: number, status: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("payments").update({ status } as never).eq("id", id);
  if (error) throw error;
}

// ─── Payment Splits ───

export async function getPaymentSplits(paymentId: number): Promise<PaymentSplit[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from("payment_splits").select("*").eq("payment_id", paymentId);
  return (data as PaymentSplit[]) ?? [];
}

export async function createPaymentSplit(split: InsertTables<"payment_splits">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("payment_splits").insert(split as never).select().single();
  if (error) throw error;
  return data as PaymentSplit;
}

export async function createPaymentWithSplits(
  payment: InsertTables<"payments">,
  splits: Omit<InsertTables<"payment_splits">, "payment_id">[]
) {
  const paymentRecord = await createPayment(payment);
  if (!paymentRecord) return null;
  const splitRecords = await Promise.all(
    splits.map((s) => createPaymentSplit({ ...s, payment_id: paymentRecord.id } as never))
  );
  return { payment: paymentRecord, splits: splitRecords };
}

// ─── Roles ───

export async function getRoles(): Promise<Role[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from("roles").select("*").order("created_at");
  return (data as Role[]) ?? [];
}

export async function createRole(role: InsertTables<"roles">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("roles").insert(role as never).select().single();
  if (error) throw error;
  return data as Role;
}

export async function updateRole(id: number, updates: UpdateTables<"roles">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("roles").update(updates as never).eq("id", id).select().single();
  if (error) throw error;
  return data as Role;
}

export async function deleteRole(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw error;
}

// ─── Role Permissions ───

export async function getRolePermissions(roleId: number): Promise<RolePermission[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from("role_permissions").select("*").eq("role_id", roleId);
  return (data as RolePermission[]) ?? [];
}

export async function setRolePermissions(roleId: number, permissionKeys: string[]) {
  if (!isSupabaseConfigured()) return;
  // Delete existing, then insert new
  await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (permissionKeys.length > 0) {
    const rows = permissionKeys.map((key) => ({ role_id: roleId, permission_key: key }));
    const { error } = await supabase.from("role_permissions").insert(rows as never);
    if (error) throw error;
  }
}

// ─── Export Logs ───

export async function getExportLogs(limit = 50): Promise<ExportLog[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("export_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ExportLog[]) ?? [];
}

export async function createExportLog(log: InsertTables<"export_logs">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("export_logs").insert(log as never).select().single();
  if (error) throw error;
  return data as ExportLog;
}

// ─── Data Backups ───

export async function getDataBackups(): Promise<DataBackup[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("data_backups")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as DataBackup[]) ?? [];
}

export async function createDataBackup(backup: InsertTables<"data_backups">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("data_backups").insert(backup as never).select().single();
  if (error) throw error;
  return data as DataBackup;
}

export async function updateBackupStatus(id: number, status: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("data_backups").update({ status } as never).eq("id", id);
  if (error) throw error;
}

// ─── Printer Devices ───

export async function getPrinterDevices(): Promise<PrinterDevice[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from("printer_devices").select("*").order("created_at");
  return (data as PrinterDevice[]) ?? [];
}

export async function createPrinterDevice(device: InsertTables<"printer_devices">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("printer_devices").insert(device as never).select().single();
  if (error) throw error;
  return data as PrinterDevice;
}

export async function updatePrinterDevice(id: number, updates: UpdateTables<"printer_devices">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("printer_devices").update(updates as never).eq("id", id).select().single();
  if (error) throw error;
  return data as PrinterDevice;
}

export async function deletePrinterDevice(id: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("printer_devices").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultPrinter(id: number) {
  if (!isSupabaseConfigured()) return;
  // Unset all defaults first, then set the chosen one
  await supabase.from("printer_devices").update({ is_default: false } as never).eq("is_default", true);
  const { error } = await supabase.from("printer_devices").update({ is_default: true } as never).eq("id", id);
  if (error) throw error;
}

// ─── Printer Settings ───

export async function getPrinterSettings(): Promise<PrinterSetting | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.from("printer_settings").select("*").single();
  return data ? (data as unknown as PrinterSetting) : null;
}

export async function upsertPrinterSettings(settings: InsertTables<"printer_settings">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("printer_settings")
    .upsert(settings as never, { onConflict: "restaurant_id" })
    .select()
    .single();
  if (error) throw error;
  return data as PrinterSetting;
}

// ─── Daily Summaries ───

export async function getDailySummaries(from?: string, to?: string): Promise<DailySummary[]> {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from("daily_summaries").select("*").order("date", { ascending: false });
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  const { data } = await query;
  return (data as DailySummary[]) ?? [];
}

export async function getDailySummary(date: string): Promise<DailySummary | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.from("daily_summaries").select("*").eq("date", date).maybeSingle();
  return data ? (data as unknown as DailySummary) : null;
}

export async function upsertDailySummary(summary: InsertTables<"daily_summaries">) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("daily_summaries")
    .upsert(summary as never, { onConflict: "restaurant_id,date" })
    .select()
    .single();
  if (error) throw error;
  return data as DailySummary;
}

