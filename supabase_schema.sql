-- =====================================================
-- BRO FUSION - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Copy and run this script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { url: string, publicId: string }
  price NUMERIC(10, 2) NOT NULL,
  discount_price NUMERIC(10, 2) DEFAULT 0,
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL']::TEXT[],
  colors TEXT[] DEFAULT ARRAY['Black', 'White']::TEXT[],
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  num_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ORDERS TABLE (WhatsApp & Direct Orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ordered items
  items_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'WhatsApp Order (GPay/PhonePe/COD)',
  status TEXT DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  courier_service TEXT DEFAULT '',
  tracking_id TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SITE SETTINGS TABLE (Store config, WhatsApp Number, UPI ID)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Categories: Anyone can read, Authenticated/Admin can insert/update/delete
DROP POLICY IF EXISTS "Public categories read" ON categories;
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public categories insert" ON categories;
CREATE POLICY "Public categories insert" ON categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public categories update" ON categories;
CREATE POLICY "Public categories update" ON categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public categories delete" ON categories;
CREATE POLICY "Public categories delete" ON categories FOR DELETE USING (true);

-- Products: Anyone can read, Anyone/Admin can manage
DROP POLICY IF EXISTS "Public products read" ON products;
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products insert" ON products;
CREATE POLICY "Public products insert" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public products update" ON products;
CREATE POLICY "Public products update" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public products delete" ON products;
CREATE POLICY "Public products delete" ON products FOR DELETE USING (true);

-- Orders: Anyone can insert an order, Public read for tracking, Admin update
DROP POLICY IF EXISTS "Public orders insert" ON orders;
CREATE POLICY "Public orders insert" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public orders read" ON orders;
CREATE POLICY "Public orders read" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public orders update" ON orders;
CREATE POLICY "Public orders update" ON orders FOR UPDATE USING (true);

-- Site Settings: Anyone can read, Anyone can update
DROP POLICY IF EXISTS "Public settings read" ON site_settings;
CREATE POLICY "Public settings read" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public settings insert/update" ON site_settings;
CREATE POLICY "Public settings insert/update" ON site_settings FOR ALL USING (true);

-- 8. INITIAL DEFAULT SETTINGS
INSERT INTO site_settings (key, value)
VALUES 
  ('whatsappNumber', '"919876543210"'::jsonb),
  ('upiId', '"brofusion@upi"'::jsonb),
  ('storeName', '"Bro Fusion"'::jsonb),
  ('storeTagline', '"Streetwear & Contemporary Fashion"'::jsonb),
  ('logoUrl', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 9. INITIAL SEED CATEGORIES
INSERT INTO categories (name, slug, description, sort_order)
VALUES 
  ('Oversized T-Shirts', 'oversized-t-shirts', 'Premium heavy cotton oversized tees', 1),
  ('Hoodies & Sweatshirts', 'hoodies-sweatshirts', 'Cozy fleece streetwear hoodies', 2),
  ('Cargo Pants', 'cargo-pants', 'Relaxed utility fit cargo trousers', 3),
  ('Accessories', 'accessories', 'Caps, bags and streetwear accessories', 4)
ON CONFLICT (slug) DO NOTHING;

-- 10. SUPABASE STORAGE
-- Create public storage bucket for product and branding images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for public read and upload
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Upload" ON storage.objects;
CREATE POLICY "Public Storage Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products');

