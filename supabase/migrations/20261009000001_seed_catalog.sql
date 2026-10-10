-- ====================================================================
-- AL MOSTAFA MALL (مول المصطفى) — INITIAL SEED DATA
-- ====================================================================

-- 1. STORE SETTINGS
INSERT INTO store_settings (
    id, store_name_ar, store_name_en, logo_url, phone, whatsapp_number, 
    support_email, address_ar, shipping_flat_fee_egp, free_shipping_threshold_egp, 
    is_cod_enabled, announcement_text_ar, is_announcement_enabled
) VALUES (
    'global',
    'مول المصطفى',
    'Al Mostafa Mall',
    '/logo.svg',
    '01023456789',
    '+201023456789',
    'contact@almostafamall.com',
    'مصر، القاهرة والجيزة وجميع محافظات الجمهورية',
    45.00,
    750.00,
    true,
    '🔥 عروض التوفير الكبرى في مول المصطفى — شحن مجاني للطلبات فوق 750 ج.م!',
    true
) ON CONFLICT (id) DO NOTHING;

-- 2. MAIN CATEGORIES (The 8 Departments)
-- Department A: المنزل والتنظيف
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c1000000-0000-0000-0000-000000000001', NULL, 'المنزل والتنظيف', 'Home & Cleaning', 'home-and-cleaning', 'كل ما يحتاجه منزلك من منظفات ومطهرات وأدوات ترتيب المطبخ والمنزل', 'home_cleaning', 1, true, true, 'Sparkles')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for A
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'المنظفات', 'detergents', 'home_cleaning', 1, true),
('c1000000-0000-0000-0000-000000000001', 'أدوات التنظيف', 'cleaning-tools', 'home_cleaning', 2, true),
('c1000000-0000-0000-0000-000000000001', 'المطهرات ومعطرات المنزل', 'disinfectants-air-fresheners', 'home_cleaning', 3, true),
('c1000000-0000-0000-0000-000000000001', 'المناديل والمنتجات الورقية', 'tissues-and-paper', 'home_cleaning', 4, true),
('c1000000-0000-0000-0000-000000000001', 'مستلزمات المطبخ والمنزل', 'kitchen-and-home-supplies', 'home_cleaning', 5, true),
('c1000000-0000-0000-0000-000000000001', 'أدوات التخزين والتنظيم', 'storage-and-organizers', 'home_cleaning', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Department B: الإلكترونيات وإكسسوارات الموبايل
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c2000000-0000-0000-0000-000000000002', NULL, 'الإلكترونيات وإكسسوارات الموبايل', 'Electronics & Mobile', 'electronics-and-mobile', 'شواحن سريعة، كابلات، سماعات، باور بانك وإكسسوارات الموبايل والكمبيوتر المعتمدة', 'electronics', 2, true, true, 'Smartphone')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for B
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c2000000-0000-0000-0000-000000000002', 'الشواحن', 'chargers', 'electronics', 1, true),
('c2000000-0000-0000-0000-000000000002', 'الكابلات والتوصيلات', 'cables-and-connectors', 'electronics', 2, true),
('c2000000-0000-0000-0000-000000000002', 'السماعات', 'headphones-earbuds', 'electronics', 3, true),
('c2000000-0000-0000-0000-000000000002', 'الباور بانك', 'powerbanks', 'electronics', 4, true),
('c2000000-0000-0000-0000-000000000002', 'جرابات الموبايل', 'phone-cases', 'electronics', 5, true),
('c2000000-0000-0000-0000-000000000002', 'اسكرينات الحماية', 'screen-protectors', 'electronics', 6, true),
('c2000000-0000-0000-0000-000000000002', 'إكسسوارات الموبايل', 'mobile-accessories', 'electronics', 7, true),
('c2000000-0000-0000-0000-000000000002', 'إكسسوارات الكمبيوتر والإلكترونيات الصغيرة', 'pc-and-gadgets', 'electronics', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Department C: المكتبي والمدرسي
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c3000000-0000-0000-0000-000000000003', NULL, 'المكتبي والمدرسي', 'Office & School Supplies', 'office-and-school', 'كشاكيل، دفاتر، أقلام عالية الجودة، ورق تصوير، وملفات وأدوات هندسية ومكتبية', 'stationery', 3, true, true, 'BookOpen')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for C
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c3000000-0000-0000-0000-000000000003', 'الكشاكيل والدفاتر', 'notebooks-and-pads', 'stationery', 1, true),
('c3000000-0000-0000-0000-000000000003', 'الأقلام وأدوات الكتابة', 'pens-and-writing', 'stationery', 2, true),
('c3000000-0000-0000-0000-000000000003', 'الورق', 'paper-supplies', 'stationery', 3, true),
('c3000000-0000-0000-0000-000000000003', 'الملفات والفولدرات', 'files-and-folders', 'stationery', 4, true),
('c3000000-0000-0000-0000-000000000003', 'الأدوات الهندسية', 'geometry-tools', 'stationery', 5, true),
('c3000000-0000-0000-0000-000000000003', 'الأدوات المدرسية', 'school-supplies', 'stationery', 6, true),
('c3000000-0000-0000-0000-000000000003', 'المستلزمات المكتبية', 'desk-supplies', 'stationery', 7, true),
('c3000000-0000-0000-0000-000000000003', 'أدوات تنظيم المكتب والدراسة', 'desk-organizers', 'stationery', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Department D: الألعاب والهدايا
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c4000000-0000-0000-0000-000000000004', NULL, 'الألعاب والهدايا', 'Toys & Gifts', 'toys-and-gifts', 'ألعاب أطفال تنموية وتعليمية، بازل ذكاء، ومستلزمات تغليف الهدايا المميزة', 'toys', 4, true, true, 'Gift')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for D
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c4000000-0000-0000-0000-000000000004', 'ألعاب الأطفال', 'kids-toys', 'toys', 1, true),
('c4000000-0000-0000-0000-000000000004', 'الألعاب التعليمية', 'educational-toys', 'toys', 2, true),
('c4000000-0000-0000-0000-000000000004', 'البازل والألعاب الذهنية', 'puzzles-and-brain-games', 'toys', 3, true),
('c4000000-0000-0000-0000-000000000004', 'الدمى والمجسمات', 'dolls-and-action-figures', 'toys', 4, true),
('c4000000-0000-0000-0000-000000000004', 'الهدايا', 'gift-items', 'toys', 5, true),
('c4000000-0000-0000-0000-000000000004', 'مستلزمات تغليف الهدايا', 'gift-wrapping', 'toys', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Department E: الشنط
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c5000000-0000-0000-0000-000000000005', NULL, 'الشنط', 'Bags & Backpacks', 'bags', 'تشكيلة شنط المدارس المتينة، شنط الأطفال، شنط الاستخدام اليومي والمقالم', 'bags', 5, true, true, 'Briefcase')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for E
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c5000000-0000-0000-0000-000000000005', 'شنط المدارس', 'school-bags', 'bags', 1, true),
('c5000000-0000-0000-0000-000000000005', 'شنط الأطفال', 'kids-bags', 'bags', 2, true),
('c5000000-0000-0000-0000-000000000005', 'شنط الاستخدام اليومي', 'daily-backpacks', 'bags', 3, true),
('c5000000-0000-0000-0000-000000000005', 'المقالم', 'pencil-cases', 'bags', 4, true),
('c5000000-0000-0000-0000-000000000005', 'شنط وإكسسوارات السفر', 'travel-bags', 'bags', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Department F: الإكسسوارات
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c6000000-0000-0000-0000-000000000006', NULL, 'الإكسسوارات', 'Fashion Accessories', 'fashion-accessories', 'سلاسل، أساور، خواتم، حلق، إكسسوارات نسائية وموضة بتشطيبات راقية', 'accessories', 6, true, true, 'Gem')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for F
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c6000000-0000-0000-0000-000000000006', 'السلاسل', 'necklaces', 'accessories', 1, true),
('c6000000-0000-0000-0000-000000000006', 'الأساور', 'bracelets', 'accessories', 2, true),
('c6000000-0000-0000-0000-000000000006', 'الخواتم', 'rings', 'accessories', 3, true),
('c6000000-0000-0000-0000-000000000006', 'الحلق', 'earrings', 'accessories', 4, true),
('c6000000-0000-0000-0000-000000000006', 'الإكسسوارات النسائية', 'women-accessories', 'accessories', 5, true),
('c6000000-0000-0000-0000-000000000006', 'إكسسوارات الموضة', 'fashion-items', 'accessories', 6, true),
('c6000000-0000-0000-0000-000000000006', 'الإكسسوارات ذات التصميم الذهبي الصيني', 'chinese-gold-style', 'accessories', 7, true)
ON CONFLICT (slug) DO NOTHING;

-- Department G: التجميل والعناية الشخصية
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c7000000-0000-0000-0000-000000000007', NULL, 'التجميل والعناية الشخصية', 'Beauty & Personal Care', 'beauty-and-personal-care', 'أدوات التجميل، فرش المكياج، إكسسوارات الشعر، المرايات وأجهزة التصفيف والعناية', 'beauty', 7, true, true, 'HeartHandshake')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for G
INSERT INTO categories (parent_id, name_ar, slug, department_key, sort_order, is_active) VALUES
('c7000000-0000-0000-0000-000000000007', 'أدوات التجميل', 'cosmetic-tools', 'beauty', 1, true),
('c7000000-0000-0000-0000-000000000007', 'فرش وأدوات المكياج', 'makeup-brushes', 'beauty', 2, true),
('c7000000-0000-0000-0000-000000000007', 'إكسسوارات الشعر', 'hair-accessories', 'beauty', 3, true),
('c7000000-0000-0000-0000-000000000007', 'المرايات', 'mirrors', 'beauty', 4, true),
('c7000000-0000-0000-0000-000000000007', 'أدوات العناية الشخصية', 'grooming-tools', 'beauty', 5, true),
('c7000000-0000-0000-0000-000000000007', 'أدوات تصفيف الشعر', 'hair-styling-tools', 'beauty', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Department H: مركز الطباعة المتخصص (Dedicated Department)
INSERT INTO categories (id, parent_id, name_ar, name_en, slug, description_ar, department_key, sort_order, is_active, is_featured, icon_name)
VALUES ('c8000000-0000-0000-0000-000000000008', NULL, 'مركز الطباعة المتخصص', 'Print Center', 'print-center', 'مركز متكامل لطباعة وتجليد المستندات، الأبحاث، كروت الأعمال، البانرات والملصقات', 'print_center', 8, true, true, 'Printer')
ON CONFLICT (slug) DO NOTHING;

-- 3. PRINT SERVICES
INSERT INTO print_services (name_ar, name_en, slug, description_ar, pricing_model, base_price_egp, min_order_price_egp, turnaround_hours, requires_file_upload, is_active, sort_order) VALUES
('طباعة المستندات والأوراق', 'Document Printing', 'document-printing', 'طباعة عالية الجودة أبيض وأسود وألوان بمقاسات A4 و A3 على خامات ورق ممتازة', 'per_page', 1.50, 10.00, 4, true, true, 1),
('طباعة الأبحاث والرسائل العلمية', 'Research & Thesis Printing', 'research-thesis-printing', 'طباعة وتنسيق وتجليد رسائل الماجستير والدكتوراه والأبحاث الجامعية مع تغليف فاخر', 'per_page', 2.00, 30.00, 24, true, true, 2),
('تصوير المستندات والكتب', 'Photocopying', 'photocopying', 'تصوير مستندات ومذكرات واضحة بدقة عالية على ورق ناصع البياض 80 جم', 'per_page', 0.75, 5.00, 2, false, true, 3),
('طباعة وتجليد الكتب والمذكرات', 'Booklet & Binding', 'booklet-binding', 'تجليد سلك بلاستيك، سلك حلزوني، كعب حراري أو غلاف مقوى كرتوناج', 'per_unit', 25.00, 25.00, 12, true, true, 4),
('كروت العمل الشخصية (Business Cards)', 'Business Cards', 'business-cards', 'طباعة كروت شخصية فاخرة كوشيه 350 جم مع سلفان مط أو لامع وبصمة ذهبية اختيارية', 'per_unit', 180.00, 180.00, 48, true, true, 5),
('الفلايرات والبروشورات الدعائية', 'Flyers & Brochures', 'flyers-brochures', 'طباعة منشورات إعلانية وتوزيعية ألوان مميزة كوشيه 150 جم مط أو لامع', 'per_unit', 250.00, 250.00, 48, true, true, 6),
('الاستيكرات والملصقات المقصوصة', 'Stickers & Labels', 'stickers-labels', 'استيكر بلاستيك فينيل ضد الماء أو ورقي مقصوص بنظام داي كت ديجيتال', 'per_sqm', 120.00, 50.00, 24, true, true, 7),
('البانرات والفلكس الإعلاني (Outdoor)', 'Banners & Flex', 'banners-flex', 'طباعة لافتات بانر وفلكس واجهات وبوسترات خارجية مقاومة للشمس والمطر مع حلقات تثبيت', 'per_sqm', 85.00, 100.00, 24, true, true, 8),
('رول اب بانر (Roll-Up Stand)', 'Roll-up Banners', 'roll-up-banners', 'ستاند رول اب ألومنيوم متحرك مقاس 85×200 سم مع طباعة فينيل مات فاخر وشنطة حمل', 'per_unit', 650.00, 650.00, 24, true, true, 9),
('طلب طباعة وتصميم مخصص', 'Custom Printing Request', 'custom-print', 'للمشاريع والمطبوعات الخاصة والتصميمات المعقدة التي تتطلب مقايسة وحساب مواصفات خاصة', 'quote_only', 0.00, 0.00, 24, true, true, 10)
ON CONFLICT (slug) DO NOTHING;

-- 4. CMS PAGES
INSERT INTO cms_pages (slug, title_ar, content_ar, is_published) VALUES
('about', 'عن مول المصطفى', 'مول المصطفى هو وجهتكم التسويقية الشاملة التي تجمع بين تشكيلة متنوعة من المنتجات الاستهلاكية، الأدوات المدرسية والمكتبية، الإلكترونيات، العناية والجمال، إضافة إلى مركز متكامل لأحدث تقنيات الطباعة والتجليد الرقمي.', true),
('delivery', 'سياسة التوصيل والشحن', 'نوفر خدمة التوصيل السريع لجميع محافظات جمهورية مصر العربية. مدة التوصيل داخل القاهرة والجيزة من 24 إلى 48 ساعة، ولباقي المحافظات خلال 3 إلى 4 أيام عمل. الشحن مجاني للطلبات المؤهلة.', true),
('returns', 'سياسة الاستبدال والاسترجاع', 'يحق للعميل استبدال أو استرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون بحالتها الأصلية غير مستخدمة ومرفق معها الفاتورة وأصل التغليف. مستلزمات العناية الشخصية والطلبات المطبوعة بمواصفات العميل لا يمكن إرجاعها إلا في حال وجود عيب تصنيع.', true),
('privacy', 'سياسة الخصوصية وسرية البيانات', 'نلتزم في مول المصطفى بحماية خصوصية جميع عملائنا. لا تتم مشاركة بياناتك الشخصية مع أي طرف ثالث، كما أن جميع ملفات وتصميمات الطباعة المرفوعة تخضع لسرية تامة وتُحفظ في خوادم مشفرة.', true)
ON CONFLICT (slug) DO NOTHING;

-- 5. INITIAL BANNERS
INSERT INTO banners (title_ar, subtitle_ar, image_desktop_url, image_mobile_url, link_url, cta_text_ar, sort_order, is_active) VALUES
('أهلاً بكم في مول المصطفى', 'تسوق أرقى المنتجات المنزلية، المدرسية، الإلكترونيات ومستلزمات العناية في مكان واحد', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80', '/shop', 'تسوق الآن', 1, true),
('مركز الطباعة المتخصص', 'طباعة المستندات والأبحاث واللافتات والبوسترات بأعلى جودة وتسليم فوري', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', '/print-center', 'اطلب طباعتك', 2, true)
ON CONFLICT DO NOTHING;
