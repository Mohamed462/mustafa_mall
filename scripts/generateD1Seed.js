import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to escape SQL strings
function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function run() {
  // Read mockData.ts
  const mockDataContent = fs.readFileSync(path.resolve('./src/services/mockData.ts'), 'utf-8');

  // Generate seed SQL
  let sql = `-- ========================================================
-- مول المصطفى — Initial Seed for Cloudflare D1
-- ========================================================

-- 1. Store Settings
INSERT OR REPLACE INTO store_settings (
  id, store_name_ar, store_name_en, logo_url, phone, whatsapp_number, 
  support_email, address_ar, shipping_flat_fee_egp, free_shipping_threshold_egp, 
  is_cod_enabled, announcement_text_ar, is_announcement_enabled, category_display_style, google_client_id
) VALUES (
  'global', 'مول المصطفى', 'Al Mostafa Mall', '/brand-logo-transparent.webp',
  '01017297414', '+201017297414', 'contact@almostafamall.com',
  'مصر — خدمة التوصيل لجميع المحافظات مع شحن فوري', 45.0, 750.0, 1,
  '🔥 عروض وتخفيضات مول المصطفى الكبرى — شحن مجاني للطلبات فوق 750 ج.م!', 0, 'images_only',
  '351405707678-fjrlebsu6j4q29ht2gltokhs8trq7l1s.apps.googleusercontent.com'
);

-- 2. Egyptian Governorates (27 Governorates)
INSERT OR REPLACE INTO governorate_shipping_rates (id, name_ar, fee_egp, estimated_days, is_active, sort_order) VALUES
('cairo', 'القاهرة', 35, '24 ساعة', 1, 1),
('giza', 'الجيزة', 35, '24 ساعة', 1, 2),
('alexandria', 'الإسكندرية', 45, '48 ساعة', 1, 3),
('qalyubia', 'القليوبية', 40, '24-48 ساعة', 1, 4),
('sharqia', 'الشرقية', 45, '48 ساعة', 1, 5),
('dakahlia', 'الدقهلية', 45, '48 ساعة', 1, 6),
('gharbia', 'الغربية', 45, '48 ساعة', 1, 7),
('monufia', 'المنوفية', 45, '48 ساعة', 1, 8),
('beheira', 'البحيرة', 45, '48 ساعة', 1, 9),
('kafr_el_sheikh', 'كفر الشيخ', 45, '48 ساعة', 1, 10),
('damietta', 'دمياط', 45, '48 ساعة', 1, 11),
('port_said', 'بورسعيد', 45, '48 ساعة', 1, 12),
('ismailia', 'الإسماعيلية', 45, '48 ساعة', 1, 13),
('suez', 'السويس', 45, '48 ساعة', 1, 14),
('fayoum', 'الفيوم', 50, '2-3 أيام', 1, 15),
('beni_suef', 'بني سويف', 50, '2-3 أيام', 1, 16),
('minya', 'المنيا', 55, '2-3 أيام', 1, 17),
('asyut', 'أسيوط', 55, '2-3 أيام', 1, 18),
('sohag', 'سوهاج', 55, '3-4 أيام', 1, 19),
('qena', 'قنا', 60, '3-4 أيام', 1, 20),
('luxor', 'الأقصر', 60, '3-4 أيام', 1, 21),
('aswan', 'أسوان', 60, '3-4 أيام', 1, 22),
('red_sea', 'البحر الأحمر', 65, '3-5 أيام', 1, 23),
('matrouh', 'مطروح', 60, '3-5 أيام', 1, 24),
('new_valley', 'الوادي الجديد', 70, '3-5 أيام', 1, 25),
('north_sinai', 'شمال سيناء', 65, '3-5 أيام', 1, 26),
('south_sinai', 'جنوب سيناء', 65, '3-5 أيام', 1, 27);

-- 3. Print Services
INSERT OR REPLACE INTO print_services (id, name_ar, name_en, slug, description_ar, pricing_model, base_price_egp, min_order_price_egp, turnaround_hours, requires_file_upload, is_active, sort_order) VALUES
('ps-1', 'طباعة المستندات والأوراق', 'Document Printing', 'document-printing', 'طباعة عالية الجودة أبيض وأسود وألوان بمقاسات A4 و A3 على خامات ورق ممتازة', 'per_page', 1.5, 10.0, 4, 1, 1, 1),
('ps-2', 'طباعة الأبحاث والرسائل العلمية', 'Research & Thesis Printing', 'research-thesis-printing', 'طباعة وتنسيق وتجليد رسائل الماجستير والدكتوراه والأبحاث الجامعية مع تغليف فاخر', 'per_page', 2.0, 30.0, 24, 1, 1, 2),
('ps-3', 'تصوير المستندات والكتب', 'Photocopying', 'photocopying', 'تصوير مستندات ومذكرات واضحة بدقة عالية على ورق ناصع البياض 80 جم', 'per_page', 0.75, 5.0, 2, 0, 1, 3),
('ps-4', 'طباعة وتجليد الكتب والمذكرات', 'Booklet & Binding', 'booklet-binding', 'تجليد سلك بلاستيك، سلك حلزوني، كعب حراري أو غلاف مقوى كرتوناج', 'per_unit', 25.0, 25.0, 12, 1, 1, 4),
('ps-5', 'كروت العمل الشخصية (Business Cards)', 'Business Cards', 'business-cards', 'طباعة كروت شخصية فاخرة كوشيه 350 جم مع سلفان مط أو لامع وبصمة ذهبية اختيارية', 'per_unit', 180.0, 180.0, 48, 1, 1, 5),
('ps-6', 'الفلايرات والبروشورات الدعائية', 'Flyers & Brochures', 'flyers-brochures', 'طباعة منشورات إعلانية وتوزيعية ألوان مميزة كوشيه 150 جم مط أو لامع', 'per_unit', 250.0, 250.0, 48, 1, 1, 6),
('ps-7', 'الاستيكرات والملصقات المقصوصة', 'Stickers & Labels', 'stickers-labels', 'استيكر بلاستيك فينيل ضد الماء أو ورقي مقصوص بنظام داي كت ديجيتال', 'per_sqm', 120.0, 50.0, 24, 1, 1, 7),
('ps-8', 'البانرات والفلكس الإعلاني (Outdoor)', 'Banners & Flex', 'banners-flex', 'طباعة لافتات بانر وفلكس واجهات وبوسترات خارجية مقاومة للشمس والمطر مع حلقات تثبيت', 'per_sqm', 85.0, 100.0, 24, 1, 1, 8),
('ps-9', 'رول اب بانر (Roll-Up Stand)', 'Roll-up Banners', 'roll-up-banners', 'ستاند رول اب ألومنيوم متحرك مقاس 85×200 سم مع طباعة فينيل مات فاخر وشنطة حمل', 'per_unit', 650.0, 650.0, 24, 1, 1, 9),
('ps-10', 'طلب طباعة وتصميم مخصص', 'Custom Printing Request', 'custom-print', 'للمشاريع والمطبوعات الخاصة والتصميمات المعقدة التي تتطلب مقايسة وحساب مواصفات خاصة', 'quote_only', 0.0, 0.0, 24, 1, 1, 10);
`;

  fs.writeFileSync(path.resolve('./d1/seed.sql'), sql, 'utf-8');
  console.log('d1/seed.sql written successfully.');
}

run();
