// ============================================================
// Allure — Database Types
// These types mirror the Supabase PostgreSQL schema
// ============================================================

// ---- Enums ----

export type OrderStatus =
  | "received"
  | "in_progress"
  | "trial"
  | "ready"
  | "delivered";

export type GarmentType =
  | "blouse"
  | "salwar_kameez"
  | "lehenga"
  | "gown"
  | "dress"
  | "skirt"
  | "top"
  | "other";

// ---- Tables ----

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  // Core body measurements (in the user's preferred unit)
  bust: number | null;
  under_bust: number | null;
  waist: number | null;
  hip: number | null;
  shoulder_width: number | null;
  arm_length: number | null;
  upper_arm: number | null;
  neck_round: number | null;
  front_neck_depth: number | null;
  back_neck_depth: number | null;
  full_height: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  delivery_date: string;
  status: OrderStatus;
  total_amount: number;
  advance_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  garment_type: GarmentType;
  description: string | null;
  measurements: Record<string, number | string> | null;
  quantity: number;
  price: number;
  notes: string | null;
}

export interface DesignImage {
  id: string;
  order_item_id: string;
  storage_path: string;
  caption: string | null;
  uploaded_at: string;
}

export interface BoutiqueSettings {
  id: string;
  boutique_name: string;
  logo_path: string | null;
  phone: string | null;
  address: string | null;
  measurement_unit: "inches" | "cm";
  reminder_days: number;
  pdf_footer_text: string | null;
  order_prefix: string;
  created_at: string;
  updated_at: string;
}

// ---- Extended types (with joins) ----

export interface OrderWithCustomer extends Order {
  customer: Customer;
}

export interface OrderWithDetails extends Order {
  customer: Customer;
  order_items: OrderItemWithImages[];
}

export interface OrderItemWithImages extends OrderItem {
  design_images: DesignImage[];
}

// ---- Form input types (for creating/updating) ----

export type CustomerInsert = Omit<Customer, "id" | "created_at" | "updated_at">;
export type CustomerUpdate = Partial<CustomerInsert>;

export type OrderInsert = Omit<Order, "id" | "order_number" | "created_at" | "updated_at">;
export type OrderUpdate = Partial<Omit<OrderInsert, "customer_id">>;

export type OrderItemInsert = Omit<OrderItem, "id">;
export type OrderItemUpdate = Partial<Omit<OrderItemInsert, "order_id">>;

export type BoutiqueSettingsUpdate = Partial<
  Omit<BoutiqueSettings, "id" | "created_at" | "updated_at">
>;
