export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          owner_name: string;
          phone: string;
          email: string | null;
          plan: "trial" | "basic" | "pro" | "enterprise";
          trial_ends: string | null;
          created_at: string;
          settings: RestaurantSettings | null;
        };
        Insert: Omit<Database["public"]["Tables"]["restaurants"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Insert"]>;
      };
      menu_items: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          name_km: string;
          price: number;
          old_price: number | null;
          image_url: string;
          discount: number | null;
          recommended: boolean;
          rating: number;
          category: string;
          sizes: MenuItemSize[] | null;
          add_ons: MenuItemAddOn[] | null;
          has_spice: boolean;
          customization_enabled: boolean;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["menu_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
      };
      orders: {
        Row: {
          id: number;
          restaurant_id: string;
          order_number: string;
          items: OrderItemData[];
          subtotal: number;
          vat: number;
          discount: number;
          total: number;
          payment_method: string | null;
          status: "pending" | "preparing" | "ready" | "served" | "cancelled";
          table_number: number | null;
          customer_name: string | null;
          staff_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      staff: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string | null;
          name: string;
          role: "manager" | "cashier" | "chef" | "waiter";
          email: string | null;
          phone: string | null;
          avatar: string | null;
          status: "active" | "inactive";
          pin: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          min_stock: number;
          max_stock: number;
          cost_per_unit: number;
          supplier: string | null;
          last_restocked: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      customers: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          points: number;
          tier: "bronze" | "silver" | "gold" | "platinum";
          visits: number;
          total_spent: number;
          last_visit: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      promotions: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          code: string;
          type: "percentage" | "fixed" | "bogo";
          value: number;
          min_order: number;
          max_uses: number;
          used_count: number;
          start_date: string;
          end_date: string;
          status: "active" | "inactive" | "expired";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["promotions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["promotions"]["Insert"]>;
      };
      audit_log: {
        Row: {
          id: number;
          restaurant_id: string;
          user_name: string;
          action: string;
          category: string;
          detail: string;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
      };
      staff_shifts: {
        Row: {
          id: number;
          restaurant_id: string;
          staff_id: string;
          staff_name: string;
          role: string;
          date: string;
          scheduled_start: string;
          scheduled_end: string;
          clock_in: string | null;
          clock_out: string | null;
          break_minutes: number;
          status: "scheduled" | "active" | "completed" | "late" | "absent";
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff_shifts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["staff_shifts"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: number;
          restaurant_id: string;
          type: "order" | "inventory" | "staff" | "system";
          title: string;
          title_km: string;
          message: string;
          message_km: string;
          priority: "low" | "medium" | "high";
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      smart_alerts: {
        Row: {
          id: number;
          restaurant_id: string;
          type: "low_stock" | "high_demand" | "revenue_milestone" | "peak_hour" | "vip_customer" | "expiry_warning" | "goal_achieved";
          priority: "critical" | "warning" | "info" | "success";
          title: string;
          title_km: string;
          message: string;
          message_km: string;
          action_label: string | null;
          action_label_km: string | null;
          data: Record<string, unknown> | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["smart_alerts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["smart_alerts"]["Insert"]>;
      };
      alert_rules: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          name_km: string;
          type: "low_stock" | "high_demand" | "revenue_milestone" | "peak_hour" | "vip_customer" | "expiry_warning" | "goal_achieved";
          enabled: boolean;
          threshold_value: number | null;
          threshold_config: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["alert_rules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["alert_rules"]["Insert"]>;
      };
      qr_tables: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          table_number: number;
          qr_code_url: string | null;
          is_active: boolean;
          scans: number;
          orders: number;
          last_scanned: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["qr_tables"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["qr_tables"]["Insert"]>;
      };
      payments: {
        Row: {
          id: number;
          restaurant_id: string;
          order_id: number | null;
          order_number: string;
          total: number;
          status: "completed" | "partial" | "refunded" | "voided";
          notes: string | null;
          processed_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      payment_splits: {
        Row: {
          id: number;
          payment_id: number;
          method: "cash" | "card" | "aba" | "wing" | "khqr" | "truemoney" | "acleda";
          amount: number;
          reference: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payment_splits"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payment_splits"]["Insert"]>;
      };
      roles: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          name_km: string;
          description: string;
          color: string;
          is_system: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["roles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
      };
      role_permissions: {
        Row: {
          id: number;
          role_id: number;
          permission_key: string;
        };
        Insert: Omit<Database["public"]["Tables"]["role_permissions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Insert"]>;
      };
      export_logs: {
        Row: {
          id: number;
          restaurant_id: string;
          report_type: "sales" | "inventory" | "staff" | "customers" | "orders" | "financial";
          format: "pdf" | "csv" | "excel";
          date_range_start: string | null;
          date_range_end: string | null;
          fields: string[] | null;
          file_url: string | null;
          file_size: string | null;
          generated_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["export_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["export_logs"]["Insert"]>;
      };
      data_backups: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          type: "auto" | "manual";
          status: "completed" | "failed" | "in_progress";
          size: string | null;
          file_url: string | null;
          tables_included: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["data_backups"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["data_backups"]["Insert"]>;
      };
      printer_devices: {
        Row: {
          id: number;
          restaurant_id: string;
          name: string;
          type: "thermal" | "dot-matrix" | "inkjet";
          connection_type: "usb" | "bluetooth" | "wifi" | "ethernet";
          ip_address: string | null;
          model: string | null;
          paper_width: 58 | 80;
          status: "online" | "offline" | "error" | "printing";
          is_default: boolean;
          print_count: number;
          last_print: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["printer_devices"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["printer_devices"]["Insert"]>;
      };
      printer_settings: {
        Row: {
          id: number;
          restaurant_id: string;
          auto_print: boolean;
          copies: number;
          print_kitchen_order: boolean;
          print_customer_receipt: boolean;
          show_logo: boolean;
          show_qr: boolean;
          footer_text: string;
          font_size: "small" | "medium" | "large";
          paper_width: 58 | 80;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["printer_settings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["printer_settings"]["Insert"]>;
      };
      daily_summaries: {
        Row: {
          id: number;
          restaurant_id: string;
          date: string;
          total_revenue: number;
          total_orders: number;
          total_customers: number;
          avg_order_value: number;
          top_items: Record<string, unknown>[] | null;
          hourly_data: Record<string, unknown>[] | null;
          payment_breakdown: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_summaries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["daily_summaries"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface MenuItemSize {
  key: string;
  en: string;
  km: string;
  priceMod: number;
}

export interface MenuItemAddOn {
  key: string;
  en: string;
  km: string;
  price: number;
}

export interface OrderItemData {
  name: string;
  price: number;
  quantity: number;
  modifications?: string[];
}

export interface RestaurantSettings {
  taxRate: number;
  currency: string;
  language: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotify?: boolean;
  telegramAlerts?: Record<string, boolean>;
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
