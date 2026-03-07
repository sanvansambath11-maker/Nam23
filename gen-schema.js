const fs = require('fs');

const adminEmail = 'your_email@example.com';

const tables = [
    'menu_items', 'orders', 'staff', 'inventory', 'customers',
    'promotions', 'audit_log', 'staff_shifts', 'notifications',
    'smart_alerts', 'alert_rules', 'qr_tables', 'payments',
    'roles', 'export_logs', 'data_backups', 'printer_devices',
    'printer_settings', 'daily_summaries'
];

let sql = `-- ============================================
-- Row Level Security (RLS)
-- Each restaurant can only see their own data
-- ============================================

-- First, drop existing policies if they exist to avoid conflicts
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END
$$;

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

-- 1) Restaurants table
-- Only owner can see their restaurant
CREATE POLICY "restaurants_owner_select" ON restaurants FOR SELECT
USING (user_id = auth.uid() OR auth.email() = '${adminEmail}');

-- Only owner can update their restaurant
CREATE POLICY "restaurants_owner_update" ON restaurants FOR UPDATE
USING (user_id = auth.uid() OR auth.email() = '${adminEmail}');

-- Only owner can delete their restaurant
CREATE POLICY "restaurants_owner_delete" ON restaurants FOR DELETE
USING (user_id = auth.uid() OR auth.email() = '${adminEmail}');

-- Allow logged-in user to create a restaurant for themselves
CREATE POLICY "restaurants_owner_insert" ON restaurants FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.email() = '${adminEmail}');

`;

for (const table of tables) {
    sql += `-- 2) ${table} table
-- Read only ${table} of restaurants I own
CREATE POLICY "${table}_owner_select" ON ${table} FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = ${table}.restaurant_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

-- Insert ${table} only into restaurants I own
CREATE POLICY "${table}_owner_insert" ON ${table} FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = ${table}.restaurant_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

-- Update only my restaurants' ${table}
CREATE POLICY "${table}_owner_update" ON ${table} FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = ${table}.restaurant_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

-- Delete only my restaurants' ${table}
CREATE POLICY "${table}_owner_delete" ON ${table} FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = ${table}.restaurant_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

`;
}

// Special case for payment_splits
sql += `-- 3) payment_splits table (passes through payments block)
CREATE POLICY "payment_splits_owner_select" ON payment_splits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM payments p
    JOIN restaurants r ON r.id = p.restaurant_id
    WHERE p.id = payment_splits.payment_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

CREATE POLICY "payment_splits_owner_insert" ON payment_splits FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM payments p
    JOIN restaurants r ON r.id = p.restaurant_id
    WHERE p.id = payment_splits.payment_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

CREATE POLICY "payment_splits_owner_update" ON payment_splits FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM payments p
    JOIN restaurants r ON r.id = p.restaurant_id
    WHERE p.id = payment_splits.payment_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

CREATE POLICY "payment_splits_owner_delete" ON payment_splits FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM payments p
    JOIN restaurants r ON r.id = p.restaurant_id
    WHERE p.id = payment_splits.payment_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

`;

// Special case for role_permissions
sql += `-- 4) role_permissions table (passes through roles block)
CREATE POLICY "role_permissions_owner_select" ON role_permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roles ro
    JOIN restaurants r ON r.id = ro.restaurant_id
    WHERE ro.id = role_permissions.role_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

CREATE POLICY "role_permissions_owner_insert" ON role_permissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM roles ro
    JOIN restaurants r ON r.id = ro.restaurant_id
    WHERE ro.id = role_permissions.role_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

CREATE POLICY "role_permissions_owner_update" ON role_permissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM roles ro
    JOIN restaurants r ON r.id = ro.restaurant_id
    WHERE ro.id = role_permissions.role_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

CREATE POLICY "role_permissions_owner_delete" ON role_permissions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM roles ro
    JOIN restaurants r ON r.id = ro.restaurant_id
    WHERE ro.id = role_permissions.role_id
      AND (r.user_id = auth.uid() OR auth.email() = '${adminEmail}')
  )
);

`;

fs.writeFileSync('c:\\Users\\sanva\\Downloads\\Nam23-main\\supabase\\migrations\\20260304083710_new-migration.sql', sql);
