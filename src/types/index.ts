// TypeScript Data Contracts for Al Mostafa Mall (مول المصطفى)

export type DepartmentKey = 
  | 'home_cleaning'
  | 'electronics'
  | 'stationery'
  | 'toys'
  | 'bags'
  | 'accessories'
  | 'beauty'
  | 'print_center';

export interface Category {
  id: string;
  parent_id?: string | null;
  name_ar: string;
  name_en?: string;
  slug: string;
  description_ar?: string;
  image_url?: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  department_key: DepartmentKey;
  children?: Category[];
  custom_link?: string;
  hide_title?: boolean;
}

export interface Brand {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  logo_url?: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_key: string;
  name_ar: string;
  value_ar: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name_ar: string;
  option_type: 'color' | 'size' | 'capacity' | 'pack';
  option_value: string;
  price_override_egp?: number;
  stock_quantity: number;
  image_url?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  category?: Category;
  brand_id?: string | null;
  brand?: Brand | null;
  sku: string;
  barcode?: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  short_description_ar?: string;
  description_ar: string;
  price_egp: number;
  original_price_egp?: number;
  cost_price_egp?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  allow_backorder: boolean;
  views_count: number;
  sales_count: number;
  seo_title?: string;
  seo_description?: string;
  images: ProductImage[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'instapay' | 'vodafone_cash' | 'card_on_delivery';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name_ar: string;
  product_sku: string;
  unit_price_egp: number;
  quantity: number;
  total_price_egp: number;
  image_url?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  from_status?: OrderStatus | null;
  to_status: OrderStatus;
  notes?: string;
  changed_by?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  governorate: string;
  city: string;
  shipping_address: string;
  delivery_notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal_egp: number;
  discount_egp: number;
  coupon_code?: string;
  shipping_fee_egp: number;
  total_egp: number;
  internal_notes?: string;
  items: OrderItem[];
  status_history?: OrderStatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

export type PrintPricingModel = 'per_page' | 'per_unit' | 'per_sqm' | 'quote_only';

export interface PrintServiceOptionValue {
  id: string;
  label_ar: string;
  value_key: string;
  price_impact_egp: number;
  is_default?: boolean;
}

export interface PrintServiceOption {
  id: string;
  service_id: string;
  option_key: string;
  label_ar: string;
  option_type: 'select' | 'radio' | 'checkbox' | 'number';
  is_required: boolean;
  values: PrintServiceOptionValue[];
}

export interface PrintService {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  description_ar: string;
  image_url?: string;
  pricing_model: PrintPricingModel;
  base_price_egp: number;
  min_order_price_egp: number;
  turnaround_hours: number;
  requires_file_upload: boolean;
  is_active: boolean;
  sort_order: number;
  options?: PrintServiceOption[];
}

export type PrintStatus = 
  | 'new'
  | 'under_review'
  | 'awaiting_files'
  | 'awaiting_quote'
  | 'quote_sent'
  | 'approved'
  | 'in_production'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface PrintRequestFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  created_at: string;
}

export interface PrintRequest {
  id: string;
  request_number: string;
  service_id: string;
  service?: PrintService;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  specifications: Record<string, any>;
  quantity: number;
  notes?: string;
  calculated_price_egp?: number;
  final_quote_egp?: number;
  status: PrintStatus;
  internal_notes?: string;
  files: PrintRequestFile[];
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title_ar?: string;
  subtitle_ar?: string;
  image_desktop_url: string;
  image_mobile_url: string;
  link_url: string;
  cta_text_ar?: string;
  sort_order: number;
  is_active: boolean;
  show_overlay_text?: boolean;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title_ar: string;
  subtitle_ar?: string;
  section_type: 'hero_carousel' | 'category_grid' | 'product_shelf' | 'offers_banner' | 'print_center' | 'trust_badges' | 'brand_showcase' | 'reviews' | 'delivery_radar';
  collection_filter?: 'featured' | 'offers' | 'newest' | 'best_sellers' | 'department';
  target_department?: DepartmentKey;
  sort_order: number;
  is_visible: boolean;
  is_enabled?: boolean;
}

export interface StoreSettings {
  id: string;
  store_name_ar: string;
  store_name_en: string;
  logo_url: string;
  phone: string;
  whatsapp_number: string;
  support_email: string;
  address_ar: string;
  shipping_flat_fee_egp: number;
  free_shipping_threshold_egp: number;
  is_cod_enabled: boolean;
  announcement_text_ar: string;
  is_announcement_enabled: boolean;
  category_display_style?: 'images_only' | 'overlay' | 'minimal';
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_value_egp: number;
  max_discount_egp?: number;
  starts_at?: string;
  expires_at?: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
}

export type DiscountScope = 
  | 'all_categories' 
  | 'specific_category' 
  | 'specific_products' 
  | 'all_except_products' 
  | 'category_except_products';

export interface SmartDiscountCampaign {
  id: string;
  name: string;
  scope: DiscountScope;
  target_category_id?: string;
  target_product_ids?: string[];
  excluded_product_ids?: string[];
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  applied_count?: number;
  snapshot_prices?: Record<string, number>;
  created_at: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title_ar: string;
  content_ar: string;
  is_published: boolean;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name_ar: string;
  variant_id?: string | null;
  change_quantity: number;
  previous_quantity: number;
  new_quantity: number;
  movement_type: 'restock' | 'sale' | 'adjustment' | 'return' | 'damaged';
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_name: string;
  entity_id?: string;
  actor_name: string;
  details_json?: any;
  created_at: string;
}

export interface UserAddress {
  id: string;
  title: string;
  governorate: string;
  city: string;
  street_address: string;
  building_number?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  is_default: boolean;
}

export type UserRole = 
  | 'super_admin' 
  | 'catalog_manager' 
  | 'order_manager' 
  | 'printing_staff' 
  | 'content_manager' 
  | 'customer';

export type StaffPermission =
  | 'manage_products'
  | 'manage_categories'
  | 'manage_inventory'
  | 'manage_orders'
  | 'manage_discounts'
  | 'manage_banners'
  | 'manage_content'
  | 'manage_printing'
  | 'manage_staff'
  | 'manage_settings'
  | 'view_analytics';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions?: StaffPermission[];
  avatar_url?: string;
  governorate?: string;
  city?: string;
  address?: string;
  addresses?: UserAddress[];
  provider?: 'email' | 'google';
  created_at?: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  location: 'header' | 'footer' | 'mobile_bar';
  is_active: boolean;
  sort_order?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  permissions?: StaffPermission[];
  isActive: boolean;
  lastLogin: string;
  created_at?: string;
}
