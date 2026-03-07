-- ============================================
-- Row Level Security (RLS) - SMART VERSION
-- Automatically skips tables that don't exist yet!
-- ============================================

DO $$
DECLARE
    rec record;
    admin_email text := 'your_email@example.com';
    t text;
    tables text[] := ARRAY['menu_items', 'orders', 'staff', 'inventory', 'customers', 'promotions', 'audit_log', 'staff_shifts', 'notifications', 'smart_alerts', 'alert_rules', 'qr_tables', 'payments', 'roles', 'export_logs', 'data_backups', 'printer_devices', 'printer_settings', 'daily_summaries'];
BEGIN
    -- 1) Drop all existing policies on public schema to avoid conflicts
    FOR rec IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', rec.policyname, rec.tablename);
    END LOOP;

    -- 2) RESTAURANTS TABLE
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants') THEN
        ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "restaurants_owner_select" ON restaurants FOR SELECT USING (user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')';
        EXECUTE 'CREATE POLICY "restaurants_owner_update" ON restaurants FOR UPDATE USING (user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')';
        EXECUTE 'CREATE POLICY "restaurants_owner_delete" ON restaurants FOR DELETE USING (user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')';
        EXECUTE 'CREATE POLICY "restaurants_owner_insert" ON restaurants FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')';
    ELSE
        RAISE NOTICE 'Skipping restaurants table (does not exist)';
    END IF;

    -- 3) ALL OTHER STANDARD DIRECT TABLES
    FOREACH t IN ARRAY tables
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
            
            EXECUTE format('CREATE POLICY "%I_owner_select" ON %I FOR SELECT USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = %I.restaurant_id AND (r.user_id = auth.uid() OR auth.email() = ''%s'')))', t, t, t, admin_email);
            EXECUTE format('CREATE POLICY "%I_owner_insert" ON %I FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = %I.restaurant_id AND (r.user_id = auth.uid() OR auth.email() = ''%s'')))', t, t, t, admin_email);
            EXECUTE format('CREATE POLICY "%I_owner_update" ON %I FOR UPDATE USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = %I.restaurant_id AND (r.user_id = auth.uid() OR auth.email() = ''%s'')))', t, t, t, admin_email);
            EXECUTE format('CREATE POLICY "%I_owner_delete" ON %I FOR DELETE USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = %I.restaurant_id AND (r.user_id = auth.uid() OR auth.email() = ''%s'')))', t, t, t, admin_email);
        ELSE
            RAISE NOTICE 'Skipping % table (does not exist)', t;
        END IF;
    END LOOP;

    -- 4) PAYMENT_SPLITS (Nested relation)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_splits') THEN
        ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "payment_splits_owner_select" ON payment_splits FOR SELECT USING (EXISTS (SELECT 1 FROM payments p JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id = payment_splits.payment_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
        EXECUTE 'CREATE POLICY "payment_splits_owner_insert" ON payment_splits FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM payments p JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id = payment_splits.payment_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
        EXECUTE 'CREATE POLICY "payment_splits_owner_update" ON payment_splits FOR UPDATE USING (EXISTS (SELECT 1 FROM payments p JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id = payment_splits.payment_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
        EXECUTE 'CREATE POLICY "payment_splits_owner_delete" ON payment_splits FOR DELETE USING (EXISTS (SELECT 1 FROM payments p JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id = payment_splits.payment_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
    END IF;

    -- 5) ROLE_PERMISSIONS (Nested relation)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_permissions') THEN
        ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "role_permissions_owner_select" ON role_permissions FOR SELECT USING (EXISTS (SELECT 1 FROM roles ro JOIN restaurants r ON r.id = ro.restaurant_id WHERE ro.id = role_permissions.role_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
        EXECUTE 'CREATE POLICY "role_permissions_owner_insert" ON role_permissions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM roles ro JOIN restaurants r ON r.id = ro.restaurant_id WHERE ro.id = role_permissions.role_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
        EXECUTE 'CREATE POLICY "role_permissions_owner_update" ON role_permissions FOR UPDATE USING (EXISTS (SELECT 1 FROM roles ro JOIN restaurants r ON r.id = ro.restaurant_id WHERE ro.id = role_permissions.role_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
        EXECUTE 'CREATE POLICY "role_permissions_owner_delete" ON role_permissions FOR DELETE USING (EXISTS (SELECT 1 FROM roles ro JOIN restaurants r ON r.id = ro.restaurant_id WHERE ro.id = role_permissions.role_id AND (r.user_id = auth.uid() OR auth.email() = ''' || admin_email || ''')))';
    END IF;

END $$;
