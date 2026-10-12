-- ========================================================
-- مول المصطفى (Al Mostafa Mall) — Cloudflare D1 Schema
-- ========================================================

-- 1. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  store_name_ar TEXT NOT NULL,
  store_name_en TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  support_email TEXT NOT NULL,
  address_ar TEXT NOT NULL,
  shipping_flat_fee_egp REAL NOT NULL DEFAULT 45.0,
  free_shipping_threshold_egp REAL NOT NULL DEFAULT 750.0,
  is_cod_enabled INTEGER NOT NULL DEFAULT 1,
  announcement_text_ar TEXT,
  is_announcement_enabled INTEGER NOT NULL DEFAULT 0,
  category_display_style TEXT DEFAULT 'images_only',
  google_client_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Egyptian Governorates Shipping Rates (27 Governorates)
CREATE TABLE IF NOT EXISTS governorate_shipping_rates (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL UNIQUE,
  fee_egp REAL NOT NULL DEFAULT 45.0,
  estimated_days TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  department_key TEXT,
  description_ar TEXT,
  image_url TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  brand_id TEXT,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  description_ar TEXT,
  price_egp REAL NOT NULL,
  compare_at_price_egp REAL,
  cost_price_egp REAL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  max_order_quantity INTEGER DEFAULT 5,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  images_json TEXT NOT NULL DEFAULT '[]',
  variants_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. Print Services Table
CREATE TABLE IF NOT EXISTS print_services (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_ar TEXT,
  pricing_model TEXT NOT NULL DEFAULT 'per_page',
  base_price_egp REAL NOT NULL DEFAULT 1.0,
  min_order_price_egp REAL NOT NULL DEFAULT 10.0,
  turnaround_hours INTEGER NOT NULL DEFAULT 4,
  requires_file_upload INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending_confirmation',
  subtotal_egp REAL NOT NULL,
  discount_egp REAL NOT NULL DEFAULT 0,
  coupon_code TEXT,
  shipping_fee_egp REAL NOT NULL,
  total_egp REAL NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  min_order_value_egp REAL DEFAULT 0,
  max_discount_egp REAL,
  times_used INTEGER DEFAULT 0,
  usage_limit INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 9. Homepage Sections Table (Dynamic cross-device section ordering & visibility)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  subtitle_ar TEXT,
  is_visible INTEGER NOT NULL DEFAULT 1,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  settings_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. Banners Table (Hero & Promotional Banners)
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title_ar TEXT,
  subtitle_ar TEXT,
  image_desktop_url TEXT NOT NULL,
  image_mobile_url TEXT,
  link_url TEXT NOT NULL DEFAULT '/offers',
  cta_text_ar TEXT DEFAULT 'تسوق الآن',
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  show_overlay_text INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON banners(sort_order);

