-- ============================================
-- BathAI POS - Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- Restaurants (each customer's restaurant)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('trial', 'basic', 'pro', 'enterprise')),
  trial_ends TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Link restaurant to auth user
ALTER TABLE restaurants ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX idx_restaurants_user ON restaurants(user_id);

-- Menu Items
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_km TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price NUMERIC(10,2),
  image_url TEXT DEFAULT '',
  discount INTEGER,
  recommended BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 4.5,
  category TEXT NOT NULL DEFAULT 'khmer',
  sizes JSONB,
  add_ons JSONB,
  has_spice BOOLEAN DEFAULT true,
  customization_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_restaurant ON menu_items(restaurant_id);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  table_number INTEGER,
  customer_name TEXT,
  staff_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'waiter' CHECK (role IN ('manager', 'cashier', 'chef', 'waiter')),
  email TEXT,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  pin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_restaurant ON staff(restaurant_id);

-- Inventory
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  min_stock NUMERIC(10,2) DEFAULT 10,
  max_stock NUMERIC(10,2) DEFAULT 100,
  cost_per_unit NUMERIC(10,2) DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_restaurant ON inventory(restaurant_id);

-- Customers (loyalty)
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  visits INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_restaurant ON customers(restaurant_id);

-- Promotions
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed', 'bogo')),
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_promotions_restaurant ON promotions(restaurant_id);

-- Audit Log
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_restaurant ON audit_log(restaurant_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Staff Shifts (staff-shifts.tsx)
CREATE TABLE staff_shifts (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'waiter',
  date DATE NOT NULL,
  scheduled_start TIME NOT NULL,
  scheduled_end TIME NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'late', 'absent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shifts_restaurant ON staff_shifts(restaurant_id);
CREATE INDEX idx_shifts_staff ON staff_shifts(staff_id);
CREATE INDEX idx_shifts_date ON staff_shifts(date DESC);

-- Notifications (notification-center.tsx)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('order', 'inventory', 'staff', 'system')),
  title TEXT NOT NULL,
  title_km TEXT DEFAULT '',
  message TEXT NOT NULL,
  message_km TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_restaurant ON notifications(restaurant_id);
CREATE INDEX idx_notifications_read ON notifications(restaurant_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Smart Alerts (smart-alerts.tsx)
CREATE TABLE smart_alerts (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'high_demand', 'revenue_milestone', 'peak_hour', 'vip_customer', 'expiry_warning', 'goal_achieved')),
  priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('critical', 'warning', 'info', 'success')),
  title TEXT NOT NULL,
  title_km TEXT DEFAULT '',
  message TEXT NOT NULL,
  message_km TEXT DEFAULT '',
  action_label TEXT,
  action_label_km TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_smart_alerts_restaurant ON smart_alerts(restaurant_id);
CREATE INDEX idx_smart_alerts_type ON smart_alerts(restaurant_id, type);
CREATE INDEX idx_smart_alerts_created ON smart_alerts(created_at DESC);

-- Alert Rules / Thresholds (smart-alerts.tsx)
CREATE TABLE alert_rules (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_km TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'high_demand', 'revenue_milestone', 'peak_hour', 'vip_customer', 'expiry_warning', 'goal_achieved')),
  enabled BOOLEAN DEFAULT true,
  threshold_value NUMERIC(10,2),
  threshold_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alert_rules_restaurant ON alert_rules(restaurant_id);

-- QR Tables (qr-ordering.tsx)
CREATE TABLE qr_tables (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  scans INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  last_scanned TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qr_tables_restaurant ON qr_tables(restaurant_id);
CREATE UNIQUE INDEX idx_qr_tables_number ON qr_tables(restaurant_id, table_number);

-- Payments (multi-payment.tsx)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'partial', 'refunded', 'voided')),
  notes TEXT,
  processed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_restaurant ON payments(restaurant_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Payment Splits (multi-payment.tsx - split bill)
CREATE TABLE payment_splits (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'aba', 'wing', 'khqr', 'truemoney', 'acleda')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payment_splits_payment ON payment_splits(payment_id);

-- Custom Roles (roles-permissions.tsx)
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_km TEXT DEFAULT '',
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3B82F6',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_roles_restaurant ON roles(restaurant_id);

-- Role Permissions (roles-permissions.tsx)
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_role_permissions_unique ON role_permissions(role_id, permission_key);

-- Export Logs (export-reports.tsx)
CREATE TABLE export_logs (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('sales', 'inventory', 'staff', 'customers', 'orders', 'financial')),
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'excel')),
  date_range_start DATE,
  date_range_end DATE,
  fields JSONB DEFAULT '[]',
  file_url TEXT,
  file_size TEXT,
  generated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_export_logs_restaurant ON export_logs(restaurant_id);
CREATE INDEX idx_export_logs_created ON export_logs(created_at DESC);

-- Data Backups (data-backup.tsx)
CREATE TABLE data_backups (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('auto', 'manual')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'in_progress')),
  size TEXT,
  file_url TEXT,
  tables_included JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_backups_restaurant ON data_backups(restaurant_id);
CREATE INDEX idx_backups_created ON data_backups(created_at DESC);

-- Printer Devices (thermal-printer.tsx)
CREATE TABLE printer_devices (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'thermal' CHECK (type IN ('thermal', 'dot-matrix', 'inkjet')),
  connection_type TEXT NOT NULL DEFAULT 'usb' CHECK (connection_type IN ('usb', 'bluetooth', 'wifi', 'ethernet')),
  ip_address TEXT,
  model TEXT,
  paper_width INTEGER DEFAULT 80 CHECK (paper_width IN (58, 80)),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error', 'printing')),
  is_default BOOLEAN DEFAULT false,
  print_count INTEGER DEFAULT 0,
  last_print TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_printer_devices_restaurant ON printer_devices(restaurant_id);

-- Printer Settings (thermal-printer.tsx)
CREATE TABLE printer_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  auto_print BOOLEAN DEFAULT false,
  copies INTEGER DEFAULT 1,
  print_kitchen_order BOOLEAN DEFAULT true,
  print_customer_receipt BOOLEAN DEFAULT true,
  show_logo BOOLEAN DEFAULT true,
  show_qr BOOLEAN DEFAULT true,
  footer_text TEXT DEFAULT 'Thank you for dining with us!',
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  paper_width INTEGER DEFAULT 80 CHECK (paper_width IN (58, 80)),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_printer_settings_restaurant ON printer_settings(restaurant_id);

-- Daily Summaries (live-sales-dashboard.tsx)
CREATE TABLE daily_summaries (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  top_items JSONB DEFAULT '[]',
  hourly_data JSONB DEFAULT '[]',
  payment_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_daily_summaries_unique ON daily_summaries(restaurant_id, date);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date DESC);

-- ============================================
-- Row Level Security (RLS)
-- Each restaurant can only see their own data
-- ============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Restaurants: owner can see/edit their own
CREATE POLICY "Users can view own restaurant" ON restaurants
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own restaurant" ON restaurants
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own restaurant" ON restaurants
  FOR INSERT WITH CHECK (true);

-- Helper function to get current user's restaurant_id
CREATE OR REPLACE FUNCTION get_my_restaurant_id()
RETURNS UUID AS $$
  SELECT id FROM restaurants WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Menu items: restaurant-scoped
CREATE POLICY "Restaurant menu access" ON menu_items
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Orders: restaurant-scoped
CREATE POLICY "Restaurant orders access" ON orders
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Staff: restaurant-scoped
CREATE POLICY "Restaurant staff access" ON staff
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Inventory: restaurant-scoped
CREATE POLICY "Restaurant inventory access" ON inventory
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Customers: restaurant-scoped
CREATE POLICY "Restaurant customers access" ON customers
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Promotions: restaurant-scoped
CREATE POLICY "Restaurant promotions access" ON promotions
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Audit log: restaurant-scoped
CREATE POLICY "Restaurant audit access" ON audit_log
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Staff shifts: restaurant-scoped
CREATE POLICY "Restaurant shifts access" ON staff_shifts
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Notifications: restaurant-scoped
CREATE POLICY "Restaurant notifications access" ON notifications
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Smart alerts: restaurant-scoped
CREATE POLICY "Restaurant smart alerts access" ON smart_alerts
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Alert rules: restaurant-scoped
CREATE POLICY "Restaurant alert rules access" ON alert_rules
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- QR tables: restaurant-scoped
CREATE POLICY "Restaurant qr tables access" ON qr_tables
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Payments: restaurant-scoped
CREATE POLICY "Restaurant payments access" ON payments
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Payment splits: scoped through payments table
CREATE POLICY "Restaurant payment splits access" ON payment_splits
  FOR ALL USING (
    payment_id IN (
      SELECT id FROM payments WHERE restaurant_id = get_my_restaurant_id()
    )
  );

-- Roles: restaurant-scoped
CREATE POLICY "Restaurant roles access" ON roles
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Role permissions: scoped through roles table
CREATE POLICY "Restaurant role permissions access" ON role_permissions
  FOR ALL USING (
    role_id IN (
      SELECT id FROM roles WHERE restaurant_id = get_my_restaurant_id()
    )
  );

-- Export logs: restaurant-scoped
CREATE POLICY "Restaurant export logs access" ON export_logs
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Data backups: restaurant-scoped
CREATE POLICY "Restaurant backups access" ON data_backups
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Printer devices: restaurant-scoped
CREATE POLICY "Restaurant printer devices access" ON printer_devices
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Printer settings: restaurant-scoped
CREATE POLICY "Restaurant printer settings access" ON printer_settings
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- Daily summaries: restaurant-scoped
CREATE POLICY "Restaurant daily summaries access" ON daily_summaries
  FOR ALL USING (restaurant_id = get_my_restaurant_id());

-- ============================================
-- Storage bucket for menu images
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menu images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menu images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
