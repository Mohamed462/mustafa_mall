-- ====================================================================
-- AL MOSTAFA MALL (مول المصطفى) — COMPLETE SUPABASE DATABASE MIGRATION
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'catalog_manager', 'order_manager', 'printing_staff', 'content_manager', 'customer');
CREATE TYPE order_status_enum AS ENUM ('pending_confirmation', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method_enum AS ENUM ('cash_on_delivery', 'instapay', 'vodafone_cash', 'card_on_delivery');
CREATE TYPE print_status_enum AS ENUM ('new', 'under_review', 'awaiting_files', 'awaiting_quote', 'quote_sent', 'approved', 'in_production', 'ready_for_pickup', 'completed', 'cancelled');
CREATE TYPE inventory_movement_type_enum AS ENUM ('restock', 'sale', 'adjustment', 'return', 'damaged');

-- 3. PROFILES & STAFF ROLES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    role user_role_enum DEFAULT 'customer' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. CATEGORIES (Nested Tree Hierarchy)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_ar TEXT,
    image_url TEXT,
    icon_name VARCHAR(100),
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    department_key VARCHAR(50) NOT NULL, -- home_cleaning, electronics, stationery, toys, bags, accessories, beauty, print_center
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_department ON categories(department_key);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description_ar TEXT,
    description_ar TEXT NOT NULL,
    price_egp DECIMAL(12, 2) NOT NULL,
    original_price_egp DECIMAL(12, 2), -- Original price if discounted
    cost_price_egp DECIMAL(12, 2),
    stock_quantity INT DEFAULT 0 NOT NULL,
    low_stock_threshold INT DEFAULT 5 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    allow_backorder BOOLEAN DEFAULT false NOT NULL,
    views_count INT DEFAULT 0 NOT NULL,
    sales_count INT DEFAULT 0 NOT NULL,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- 8. PRODUCT SPECIFICATIONS & ATTRIBUTES
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    attribute_key VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    value_ar VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes(product_id);

-- 9. PRODUCT VARIANTS (Colors, Sizes, Capacities)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    option_type VARCHAR(50) NOT NULL, -- color, size, capacity, pack
    option_value VARCHAR(100) NOT NULL,
    price_override_egp DECIMAL(12, 2),
    stock_quantity INT DEFAULT 0 NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- 10. INVENTORY MOVEMENTS (Full Audit Trail)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    change_quantity INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    movement_type inventory_movement_type_enum NOT NULL,
    reference_id VARCHAR(100), -- Order ID or Purchase Order
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);

-- 11. PROMOTIONS & COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value_egp DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    max_discount_egp DECIMAL(10, 2),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    usage_limit INT,
    times_used INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    shipping_address TEXT NOT NULL,
    delivery_notes TEXT,
    payment_method payment_method_enum DEFAULT 'cash_on_delivery' NOT NULL,
    payment_status payment_status_enum DEFAULT 'pending' NOT NULL,
    order_status order_status_enum DEFAULT 'pending_confirmation' NOT NULL,
    subtotal_egp DECIMAL(12, 2) NOT NULL,
    discount_egp DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    coupon_code VARCHAR(50),
    shipping_fee_egp DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    total_egp DECIMAL(12, 2) NOT NULL,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_ar VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    unit_price_egp DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price_egp DECIMAL(12, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    from_status order_status_enum,
    to_status order_status_enum NOT NULL,
    notes TEXT,
    changed_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_status_history ON order_status_history(order_id);

-- 13. PRINTING CENTER SERVICE CATALOG & WORKFLOW
CREATE TABLE IF NOT EXISTS print_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_ar TEXT NOT NULL,
    image_url TEXT,
    pricing_model VARCHAR(50) NOT NULL, -- per_page, per_unit, per_sqm, quote_only
    base_price_egp DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    min_order_price_egp DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    turnaround_hours INT DEFAULT 24 NOT NULL,
    requires_file_upload BOOLEAN DEFAULT true NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS print_service_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES print_services(id) ON DELETE CASCADE NOT NULL,
    option_key VARCHAR(100) NOT NULL, -- paper_size, paper_weight, color_mode, binding, lamination
    label_ar VARCHAR(100) NOT NULL,
    option_type VARCHAR(50) NOT NULL, -- select, radio, checkbox, number
    is_required BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS print_service_option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID REFERENCES print_service_options(id) ON DELETE CASCADE NOT NULL,
    label_ar VARCHAR(100) NOT NULL,
    value_key VARCHAR(100) NOT NULL,
    price_impact_egp DECIMAL(10, 2) DEFAULT 0 NOT NULL, -- Added fee or multiplier
    is_default BOOLEAN DEFAULT false NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS print_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    service_id UUID REFERENCES print_services(id) ON DELETE RESTRICT NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    specifications_json JSONB NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    notes TEXT,
    calculated_price_egp DECIMAL(12, 2),
    final_quote_egp DECIMAL(12, 2),
    status print_status_enum DEFAULT 'new' NOT NULL,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_print_requests_num ON print_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_print_requests_status ON print_requests(status);

CREATE TABLE IF NOT EXISTS print_request_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES print_requests(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Private Supabase Storage path
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS print_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES print_requests(id) ON DELETE CASCADE NOT NULL,
    from_status print_status_enum,
    to_status print_status_enum NOT NULL,
    notes TEXT,
    changed_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. HOMEPAGE SECTIONS, BANNERS & CMS PAGES
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(100) UNIQUE NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    subtitle_ar VARCHAR(255),
    section_type VARCHAR(50) NOT NULL, -- hero_carousel, category_grid, product_shelf, offers_banner, print_center, trust_badges
    collection_filter VARCHAR(50), -- featured, offers, newest, best_sellers, department
    target_department VARCHAR(50),
    sort_order INT DEFAULT 0 NOT NULL,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(255),
    subtitle_ar VARCHAR(255),
    image_desktop_url TEXT NOT NULL,
    image_mobile_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    cta_text_ar VARCHAR(100),
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    content_ar TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    store_name_ar VARCHAR(255) DEFAULT 'مول المصطفى' NOT NULL,
    store_name_en VARCHAR(255) DEFAULT 'Al Mostafa Mall' NOT NULL,
    logo_url TEXT DEFAULT '/logo.svg' NOT NULL,
    phone VARCHAR(50) DEFAULT '01000000000' NOT NULL,
    whatsapp_number VARCHAR(50) DEFAULT '+201000000000' NOT NULL,
    support_email VARCHAR(255) DEFAULT 'support@almostafamall.com' NOT NULL,
    address_ar TEXT DEFAULT 'جمهورية مصر العربية' NOT NULL,
    shipping_flat_fee_egp DECIMAL(10, 2) DEFAULT 40.00 NOT NULL,
    free_shipping_threshold_egp DECIMAL(10, 2) DEFAULT 800.00 NOT NULL,
    is_cod_enabled BOOLEAN DEFAULT true NOT NULL,
    announcement_text_ar TEXT DEFAULT 'أهلاً بكم في مول المصطفى — عروض مميزة وشحن سريع لجميع المحافظات!',
    is_announcement_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    actor_name VARCHAR(255) NOT NULL,
    details_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_request_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read active catalog and settings
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product attributes" ON product_attributes FOR SELECT USING (true);
CREATE POLICY "Public read active variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read homepage sections" ON homepage_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read cms pages" ON cms_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read print services" ON print_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read store settings" ON store_settings FOR SELECT USING (true);

-- Orders: Public can insert new orders, but can only read their own
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert print requests" ON print_requests FOR INSERT WITH CHECK (true);
