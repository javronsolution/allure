-- ============================================================
-- Allure — Boutique Management Database Schema
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'received',
  'in_progress',
  'trial',
  'ready',
  'delivered'
);

CREATE TYPE garment_type AS ENUM (
  'blouse',
  'salwar_kameez',
  'lehenga',
  'gown',
  'dress',
  'skirt',
  'top',
  'other'
);

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  -- Core body measurements
  bust DECIMAL,
  under_bust DECIMAL,
  waist DECIMAL,
  hip DECIMAL,
  shoulder_width DECIMAL,
  arm_length DECIMAL,
  upper_arm DECIMAL,
  neck_round DECIMAL,
  front_neck_depth DECIMAL,
  back_neck_depth DECIMAL,
  full_height DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================

-- Sequence for order numbers
CREATE SEQUENCE order_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  status order_status NOT NULL DEFAULT 'received',
  total_amount DECIMAL NOT NULL DEFAULT 0,
  advance_paid DECIMAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate order number on insert
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  seq_val INT;
BEGIN
  -- Get the prefix from settings, default to 'ALR'
  SELECT COALESCE(
    (SELECT order_prefix FROM boutique_settings LIMIT 1),
    'ALR'
  ) INTO prefix;
  
  seq_val := nextval('order_number_seq');
  NEW.order_number := prefix || '-' || LPAD(seq_val::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  garment_type garment_type NOT NULL DEFAULT 'other',
  description TEXT,
  measurements JSONB DEFAULT '{}',
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL NOT NULL DEFAULT 0,
  notes TEXT
);

-- ============================================================
-- DESIGN IMAGES TABLE
-- ============================================================

CREATE TABLE design_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOUTIQUE SETTINGS TABLE (single row)
-- ============================================================

CREATE TABLE boutique_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_name TEXT NOT NULL DEFAULT 'My Boutique',
  logo_path TEXT,
  phone TEXT,
  address TEXT,
  measurement_unit TEXT NOT NULL DEFAULT 'inches' CHECK (measurement_unit IN ('inches', 'cm')),
  reminder_days INT NOT NULL DEFAULT 2,
  pdf_footer_text TEXT,
  order_prefix TEXT NOT NULL DEFAULT 'ALR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO boutique_settings (boutique_name, order_prefix) 
VALUES ('Allure Boutique', 'ALR');

-- ============================================================
-- UPDATED_AT TRIGGER (auto-update timestamp)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER boutique_settings_updated_at
  BEFORE UPDATE ON boutique_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Since this is a single-user app, allow all for authenticated users
-- ============================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_settings ENABLE ROW LEVEL SECURITY;

-- Policies: allow everything for authenticated users
CREATE POLICY "Authenticated users can do everything" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do everything" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do everything" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do everything" ON design_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do everything" ON boutique_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_design_images_order_item_id ON design_images(order_item_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_full_name ON customers(full_name);

-- ============================================================
-- STORAGE BUCKET (run separately in Supabase Dashboard or via API)
-- Create a private bucket called 'design-references'
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('design-references', 'design-references', false);
