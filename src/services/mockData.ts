import { 
  Category, 
  Brand, 
  Product, 
  PrintService, 
  StoreSettings, 
  Banner, 
  HomepageSection, 
  CmsPage,
  Order,
  PrintRequest,
  InventoryMovement,
  Coupon,
  NavItem,
  StaffMember
} from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  id: 'global',
  store_name_ar: 'مول المصطفى',
  store_name_en: 'Al Mostafa Mall',
  logo_url: '/brand-logo-transparent.webp',
  phone: '01023456789',
  whatsapp_number: '+201023456789',
  support_email: 'contact@almostafamall.com',
  address_ar: 'مصر — خدمة التوصيل لجميع المحافظات مع شحن فوري',
  shipping_flat_fee_egp: 45.0,
  free_shipping_threshold_egp: 750.0,
  is_cod_enabled: true,
  announcement_text_ar: '🔥 عروض وتخفيضات مول المصطفى الكبرى — شحن مجاني للطلبات فوق 750 ج.م!',
  is_announcement_enabled: true,
};

export const INITIAL_BRANDS: Brand[] = [
  { id: 'b1', name_ar: 'أنكر', name_en: 'Anker', slug: 'anker', is_featured: true, is_active: true },
  { id: 'b2', name_ar: 'شاومي', name_en: 'Xiaomi', slug: 'xiaomi', is_featured: true, is_active: true },
  { id: 'b3', name_ar: 'روتو', name_en: 'Roto', slug: 'roto', is_featured: true, is_active: true },
  { id: 'b4', name_ar: 'زيبرا', name_en: 'Zebra', slug: 'zebra', is_featured: true, is_active: true },
  { id: 'b5', name_ar: 'دابل إيه', name_en: 'Double A', slug: 'double-a', is_featured: true, is_active: true },
  { id: 'b6', name_ar: 'أريال', name_en: 'Ariel', slug: 'ariel', is_featured: true, is_active: true },
  { id: 'b7', name_ar: 'فيولا', name_en: 'Viola', slug: 'viola', is_featured: false, is_active: true },
];

export const INITIAL_CATEGORIES: Category[] = [
  // 1. Home & Cleaning
  {
    id: 'cat-home',
    name_ar: 'المنزل والتنظيف',
    name_en: 'Home & Cleaning',
    slug: 'home-and-cleaning',
    department_key: 'home_cleaning',
    description_ar: 'كل ما يحتاجه منزلك من منظفات، مطهرات، أدوات تنظيف ومستلزمات المطبخ والتنظيم',
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Sparkles',
    sort_order: 1,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-det', parent_id: 'cat-home', name_ar: 'المنظفات', slug: 'detergents', department_key: 'home_cleaning', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-cleantools', parent_id: 'cat-home', name_ar: 'أدوات التنظيف', slug: 'cleaning-tools', department_key: 'home_cleaning', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-disinf', parent_id: 'cat-home', name_ar: 'المطهرات ومعطرات المنزل', slug: 'disinfectants', department_key: 'home_cleaning', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-tissues', parent_id: 'cat-home', name_ar: 'المناديل والمنتجات الورقية', slug: 'tissues-paper', department_key: 'home_cleaning', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-kitchen', parent_id: 'cat-home', name_ar: 'مستلزمات المطبخ والمنزل', slug: 'kitchen-supplies', department_key: 'home_cleaning', sort_order: 5, is_active: true, is_featured: false },
      { id: 'sub-storage', parent_id: 'cat-home', name_ar: 'أدوات التخزين والتنظيم', slug: 'storage-organizers', department_key: 'home_cleaning', sort_order: 6, is_active: true, is_featured: false },
    ]
  },
  // 2. Electronics & Mobile
  {
    id: 'cat-elec',
    name_ar: 'الإلكترونيات وإكسسوارات الموبايل',
    name_en: 'Electronics & Mobile',
    slug: 'electronics-and-mobile',
    department_key: 'electronics',
    description_ar: 'شواحن سريعة، كابلات أصلية، سماعات، باور بانك وإكسسوارات الموبايل والكمبيوتر',
    image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Smartphone',
    sort_order: 2,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-chargers', parent_id: 'cat-elec', name_ar: 'الشواحن', slug: 'chargers', department_key: 'electronics', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-cables', parent_id: 'cat-elec', name_ar: 'الكابلات والتوصيلات', slug: 'cables', department_key: 'electronics', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-audio', parent_id: 'cat-elec', name_ar: 'السماعات', slug: 'headphones', department_key: 'electronics', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-pb', parent_id: 'cat-elec', name_ar: 'الباور بانك', slug: 'powerbanks', department_key: 'electronics', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-cases', parent_id: 'cat-elec', name_ar: 'جرابات الموبايل', slug: 'phone-cases', department_key: 'electronics', sort_order: 5, is_active: true, is_featured: false },
      { id: 'sub-screens', parent_id: 'cat-elec', name_ar: 'اسكرينات الحماية', slug: 'screen-protectors', department_key: 'electronics', sort_order: 6, is_active: true, is_featured: false },
      { id: 'sub-mobacc', parent_id: 'cat-elec', name_ar: 'إكسسوارات الموبايل', slug: 'mobile-accessories', department_key: 'electronics', sort_order: 7, is_active: true, is_featured: false },
      { id: 'sub-pcgadgets', parent_id: 'cat-elec', name_ar: 'إكسسوارات الكمبيوتر والإلكترونيات الصغيرة', slug: 'pc-gadgets', department_key: 'electronics', sort_order: 8, is_active: true, is_featured: false },
    ]
  },
  // 3. Office & School
  {
    id: 'cat-school',
    name_ar: 'المكتبي والمدرسي',
    name_en: 'Office & School Supplies',
    slug: 'office-and-school',
    department_key: 'stationery',
    description_ar: 'كشاكيل ودفاتر، أقلام، ورق تصوير، ملفات، أدوات هندسية ومستلزمات مكتبية ودراسية',
    image_url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=400&q=80',
    icon_name: 'BookOpen',
    sort_order: 3,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-notebooks', parent_id: 'cat-school', name_ar: 'الكشاكيل والدفاتر', slug: 'notebooks', department_key: 'stationery', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-pens', parent_id: 'cat-school', name_ar: 'الأقلام وأدوات الكتابة', slug: 'pens-writing', department_key: 'stationery', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-paper', parent_id: 'cat-school', name_ar: 'الورق', slug: 'paper', department_key: 'stationery', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-folders', parent_id: 'cat-school', name_ar: 'الملفات والفولدرات', slug: 'files-folders', department_key: 'stationery', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-geometry', parent_id: 'cat-school', name_ar: 'الأدوات الهندسية', slug: 'geometry-tools', department_key: 'stationery', sort_order: 5, is_active: true, is_featured: false },
      { id: 'sub-supplies', parent_id: 'cat-school', name_ar: 'الأدوات المدرسية', slug: 'school-supplies', department_key: 'stationery', sort_order: 6, is_active: true, is_featured: false },
      { id: 'sub-office', parent_id: 'cat-school', name_ar: 'المستلزمات المكتبية', slug: 'office-supplies', department_key: 'stationery', sort_order: 7, is_active: true, is_featured: false },
      { id: 'sub-organize', parent_id: 'cat-school', name_ar: 'أدوات تنظيم المكتب والدراسة', slug: 'desk-organizers', department_key: 'stationery', sort_order: 8, is_active: true, is_featured: false },
    ]
  },
  // 4. Toys & Gifts
  {
    id: 'cat-toys',
    name_ar: 'الألعاب والهدايا',
    name_en: 'Toys & Gifts',
    slug: 'toys-and-gifts',
    department_key: 'toys',
    description_ar: 'ألعاب تنموية وتعليمية للأطفال، بازل وألعاب ذكاء، وهدايا ومستلزمات تغليف راقية',
    image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Gift',
    sort_order: 4,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-kidstoys', parent_id: 'cat-toys', name_ar: 'ألعاب الأطفال', slug: 'kids-toys', department_key: 'toys', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-edu', parent_id: 'cat-toys', name_ar: 'الألعاب التعليمية', slug: 'educational-toys', department_key: 'toys', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-puzzles', parent_id: 'cat-toys', name_ar: 'البازل والألعاب الذهنية', slug: 'puzzles-brain-games', department_key: 'toys', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-dolls', parent_id: 'cat-toys', name_ar: 'الدمى والمجسمات', slug: 'dolls-action-figures', department_key: 'toys', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-gifts', parent_id: 'cat-toys', name_ar: 'الهدايا', slug: 'gift-items', department_key: 'toys', sort_order: 5, is_active: true, is_featured: false },
      { id: 'sub-wrapping', parent_id: 'cat-toys', name_ar: 'مستلزمات تغليف الهدايا', slug: 'gift-wrapping', department_key: 'toys', sort_order: 6, is_active: true, is_featured: false },
    ]
  },
  // 5. Bags
  {
    id: 'cat-bags',
    name_ar: 'الشنط',
    name_en: 'Bags & Backpacks',
    slug: 'bags',
    department_key: 'bags',
    description_ar: 'شنط مدارس مريحة، شنط أطفال، شنط الظهر للاستخدام اليومي واللابتوب، ومقالم مميزة',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Briefcase',
    sort_order: 5,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-schoolbags', parent_id: 'cat-bags', name_ar: 'شنط المدارس', slug: 'school-bags', department_key: 'bags', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-kidsbags', parent_id: 'cat-bags', name_ar: 'شنط الأطفال', slug: 'kids-bags', department_key: 'bags', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-dailybags', parent_id: 'cat-bags', name_ar: 'شنط الاستخدام اليومي', slug: 'daily-backpacks', department_key: 'bags', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-pencilcases', parent_id: 'cat-bags', name_ar: 'المقالم', slug: 'pencil-cases', department_key: 'bags', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-travelbags', parent_id: 'cat-bags', name_ar: 'شنط وإكسسوارات السفر', slug: 'travel-bags', department_key: 'bags', sort_order: 5, is_active: true, is_featured: false },
    ]
  },
  // 6. Accessories
  {
    id: 'cat-acc',
    name_ar: 'الإكسسوارات',
    name_en: 'Fashion Accessories',
    slug: 'fashion-accessories',
    department_key: 'accessories',
    description_ar: 'سلاسل، أساور، خواتم، حلق، إكسسوارات نسائية وإكسسوارات بتصميم ذهبي صيني راقٍ',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Gem',
    sort_order: 6,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-necklaces', parent_id: 'cat-acc', name_ar: 'السلاسل', slug: 'necklaces', department_key: 'accessories', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-bracelets', parent_id: 'cat-acc', name_ar: 'الأساور', slug: 'bracelets', department_key: 'accessories', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-rings', parent_id: 'cat-acc', name_ar: 'الخواتم', slug: 'rings', department_key: 'accessories', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-earrings', parent_id: 'cat-acc', name_ar: 'الحلق', slug: 'earrings', department_key: 'accessories', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-womenacc', parent_id: 'cat-acc', name_ar: 'الإكسسوارات النسائية', slug: 'women-accessories', department_key: 'accessories', sort_order: 5, is_active: true, is_featured: false },
      { id: 'sub-fashion', parent_id: 'cat-acc', name_ar: 'إكسسوارات الموضة', slug: 'fashion-items', department_key: 'accessories', sort_order: 6, is_active: true, is_featured: false },
      { id: 'sub-chinesegold', parent_id: 'cat-acc', name_ar: 'الإكسسوارات ذات التصميم الذهبي الصيني', slug: 'chinese-gold-style', department_key: 'accessories', sort_order: 7, is_active: true, is_featured: false },
    ]
  },
  // 7. Beauty & Personal Care
  {
    id: 'cat-beauty',
    name_ar: 'التجميل والعناية الشخصية',
    name_en: 'Beauty & Personal Care',
    slug: 'beauty-and-personal-care',
    department_key: 'beauty',
    description_ar: 'أدوات التجميل، فرش المكياج، إكسسوارات الشعر، المرايات وأجهزة العناية الشخصية المعتمدة',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Sparkles',
    sort_order: 7,
    is_active: true,
    is_featured: true,
    children: [
      { id: 'sub-cosmetics', parent_id: 'cat-beauty', name_ar: 'أدوات التجميل', slug: 'cosmetic-tools', department_key: 'beauty', sort_order: 1, is_active: true, is_featured: false },
      { id: 'sub-brushes', parent_id: 'cat-beauty', name_ar: 'فرش وأدوات المكياج', slug: 'makeup-brushes', department_key: 'beauty', sort_order: 2, is_active: true, is_featured: false },
      { id: 'sub-hairacc', parent_id: 'cat-beauty', name_ar: 'إكسسوارات الشعر', slug: 'hair-accessories', department_key: 'beauty', sort_order: 3, is_active: true, is_featured: false },
      { id: 'sub-mirrors', parent_id: 'cat-beauty', name_ar: 'المرايات', slug: 'mirrors', department_key: 'beauty', sort_order: 4, is_active: true, is_featured: false },
      { id: 'sub-grooming', parent_id: 'cat-beauty', name_ar: 'أدوات العناية الشخصية', slug: 'grooming-tools', department_key: 'beauty', sort_order: 5, is_active: true, is_featured: false },
      { id: 'sub-hairstyling', parent_id: 'cat-beauty', name_ar: 'أدوات تصفيف الشعر', slug: 'hair-styling-tools', department_key: 'beauty', sort_order: 6, is_active: true, is_featured: false },
    ]
  },
  // 8. Dedicated Print Center
  {
    id: 'cat-print',
    name_ar: 'مركز الطباعة المتخصص',
    name_en: 'Print Center',
    slug: 'print-center',
    department_key: 'print_center',
    description_ar: 'طباعة وتجليد المستندات، الأبحاث، كروت الأعمال، البانرات، الاستيكرات والبوسترات الفاخرة',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80',
    icon_name: 'Printer',
    sort_order: 8,
    is_active: true,
    is_featured: true,
    children: []
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- 1. Home & Cleaning Products ---
  {
    id: 'p-home-1',
    category_id: 'sub-det',
    brand_id: 'b6',
    sku: 'HOM-ARI-001',
    name_ar: 'مسحوق غسيل أوتوماتيك أريال لافندر مركز - 4 كجم',
    name_en: 'Ariel Automatic Powder Detergent Lavender 4kg',
    slug: 'ariel-automatic-powder-lavender-4kg',
    description_ar: 'مسحوق غسيل أوتوماتيك بتركيبة متطورة تزيل أصعب البقع من الغسلة الأولى مع رائحة اللافندر المنعشة التي تدوم طويلاً.',
    short_description_ar: 'نظافة فائقة وعطر لافندر منعش للغسالات الأوتوماتيك',
    price_egp: 295.0,
    original_price_egp: 350.0,
    stock_quantity: 45,
    low_stock_threshold: 10,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 120,
    sales_count: 32,
    images: [
      { id: 'img-h1', product_id: 'p-home-1', image_url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80', alt_text: 'مسحوق أريال 4 كجم', is_primary: true, sort_order: 1 },
      { id: 'img-h1-2', product_id: 'p-home-1', image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80', alt_text: 'مستلزمات النظافة أريال', is_primary: false, sort_order: 2 }
    ],
    attributes: [
      { id: 'a1', product_id: 'p-home-1', attribute_key: 'weight', name_ar: 'الوزن', value_ar: '4 كجم', sort_order: 1 },
      { id: 'a2', product_id: 'p-home-1', attribute_key: 'scent', name_ar: 'الرائحة', value_ar: 'زهور اللافندر', sort_order: 2 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-home-2',
    category_id: 'sub-cleantools',
    brand_id: null,
    sku: 'HOM-MOP-002',
    name_ar: 'ممسحة أرضيات دوارة ذكية مع جردل تجفيف ستانلس ستيل',
    slug: 'smart-spin-mop-stainless-bucket',
    description_ar: 'طقم ممسحة مايكروفايبر ذكية مع عصر هيدروليكي 360 درجة وعمود تلسكوبي متين من الفولاذ المقاوم للصدأ لتنظيف مريح لجميع أنواع الأرضيات.',
    short_description_ar: 'عصر سريع وتنظيف 360 درجة للباركيه والسيراميك',
    price_egp: 380.0,
    original_price_egp: 450.0,
    stock_quantity: 20,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 85,
    sales_count: 14,
    images: [
      { id: 'img-h2', product_id: 'p-home-2', image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80', alt_text: 'ممسحة دوارة', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a3', product_id: 'p-home-2', attribute_key: 'material', name_ar: 'الخامة', value_ar: 'ستانلس ستيل وبلاستيك مقوى', sort_order: 1 },
      { id: 'a4', product_id: 'p-home-2', attribute_key: 'heads', name_ar: 'عدد الرؤوس', value_ar: '2 غيار مايكروفايبر', sort_order: 2 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-home-3',
    category_id: 'sub-storage',
    brand_id: null,
    sku: 'HOM-STR-003',
    name_ar: 'طقم علب تخزين زجاجية محكمة الغلق 4 قطع بأغطية بامبو',
    slug: 'glass-storage-containers-bamboo-lids-4pcs',
    description_ar: 'طقم برطمانات زجاج بوروسيليكات شفاف عالي الجودة ومقاوم للحرارة، مع أغطية خشب بامبو طبيعي محكمة بحلقة سيليكون لحفظ البقوليات والتوابل طازجة.',
    price_egp: 290.0,
    original_price_egp: 340.0,
    stock_quantity: 18,
    low_stock_threshold: 4,
    is_active: true,
    is_featured: false,
    allow_backorder: false,
    views_count: 60,
    sales_count: 9,
    images: [
      { id: 'img-h3', product_id: 'p-home-3', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', alt_text: 'علب تخزين زجاجية', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a5', product_id: 'p-home-3', attribute_key: 'pieces', name_ar: 'عدد القطع', value_ar: '4 قطع بأحجام متدرجة', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- 2. Electronics & Mobile ---
  {
    id: 'p-elec-1',
    category_id: 'sub-chargers',
    brand_id: 'b1',
    sku: 'ELC-ANK-65W',
    name_ar: 'شاحن أنكر نانو GaN سريع بقوة 65 واط ثلاثي المنافذ',
    name_en: 'Anker Nano II 65W GaN Fast Charger 3-Port',
    slug: 'anker-nano-65w-gan-fast-charger',
    description_ar: 'شاحن بتقنية GaN II فائقة الصغر والقوة. يتيح شحن اللابتوب، الموبايل والتابلت في نفس الوقت بأمان تام مع دعم PowerIQ 3.0 والشحن فائق السرعة.',
    short_description_ar: 'شحن فائق السرعة للابتوب والموبايل بتقنية النيتريد جاليوم',
    price_egp: 1450.0,
    original_price_egp: 1650.0,
    stock_quantity: 25,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 310,
    sales_count: 58,
    images: [
      { id: 'img-e1', product_id: 'p-elec-1', image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80', alt_text: 'شاحن أنكر 65W', is_primary: true, sort_order: 1 },
      { id: 'img-e1-2', product_id: 'p-elec-1', image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', alt_text: 'شاحن أنكر - زاوية أمامية', is_primary: false, sort_order: 2 },
      { id: 'img-e1-3', product_id: 'p-elec-1', image_url: 'https://images.unsplash.com/photo-1609592424367-e95e860952d7?auto=format&fit=crop&w=600&q=80', alt_text: 'شاحن أنكر في الاستخدام', is_primary: false, sort_order: 3 }
    ],
    attributes: [
      { id: 'a6', product_id: 'p-elec-1', attribute_key: 'power', name_ar: 'القدرة', value_ar: '65 واط', sort_order: 1 },
      { id: 'a7', product_id: 'p-elec-1', attribute_key: 'ports', name_ar: 'المنافذ', value_ar: '2x Type-C + 1x USB-A', sort_order: 2 }
    ],
    variants: [
      { id: 'v1', product_id: 'p-elec-1', sku: 'ELC-ANK-65W-BLK', name_ar: 'اللون الأسود', option_type: 'color', option_value: 'أسود', stock_quantity: 15, is_active: true },
      { id: 'v2', product_id: 'p-elec-1', sku: 'ELC-ANK-65W-WHT', name_ar: 'اللون الأبيض', option_type: 'color', option_value: 'أبيض', stock_quantity: 10, is_active: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-elec-2',
    category_id: 'sub-pb',
    brand_id: 'b2',
    sku: 'ELC-MI-20K',
    name_ar: 'باور بانك شاومي 20000 مللي أمبير شحن سريع بقوة 22.5 واط',
    name_en: 'Xiaomi Power Bank 20000mAh 22.5W Fast Charge',
    slug: 'xiaomi-powerbank-20000mah-22-5w',
    description_ar: 'بطارية متنقلة بسعة حقيقية 20000mAh مع 3 منافذ خروج تدعم الشحن السريع والشحن ثنائي الاتجاه، متوافقة مع جميع هواتف آيفون وأندرويد.',
    price_egp: 980.0,
    original_price_egp: 1150.0,
    stock_quantity: 30,
    low_stock_threshold: 6,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 240,
    sales_count: 42,
    images: [
      { id: 'img-e2', product_id: 'p-elec-2', image_url: 'https://images.unsplash.com/photo-1609592424367-e95e860952d7?auto=format&fit=crop&w=600&q=80', alt_text: 'باور بانك شاومي', is_primary: true, sort_order: 1 },
      { id: 'img-e2-2', product_id: 'p-elec-2', image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80', alt_text: 'باور بانك منافذ الشحن', is_primary: false, sort_order: 2 }
    ],
    attributes: [
      { id: 'a8', product_id: 'p-elec-2', attribute_key: 'capacity', name_ar: 'السعة', value_ar: '20,000 مللي أمبير', sort_order: 1 },
      { id: 'a9', product_id: 'p-elec-2', attribute_key: 'charging_speed', name_ar: 'سرعة الشحن', value_ar: '22.5W Fast Charge', sort_order: 2 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-elec-3',
    category_id: 'sub-audio',
    brand_id: 'b1',
    sku: 'ELC-ANK-P20I',
    name_ar: 'سماعة أذن لاسلكية أنكر ساوند كور P20i بلوتوث 5.3',
    name_en: 'Anker Soundcore P20i True Wireless Earbuds',
    slug: 'anker-soundcore-p20i-wireless-earbuds',
    description_ar: 'سماعة بلوتوث لاسلكية مع صوت نقي وباس قوي مشبع، بطارية تدوم حتى 30 ساعة مع علبة الشحن، ومقاومة لرذاذ الماء والتعرق IPX5.',
    price_egp: 850.0,
    original_price_egp: 990.0,
    stock_quantity: 15,
    low_stock_threshold: 4,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 190,
    sales_count: 36,
    images: [
      { id: 'img-e3', product_id: 'p-elec-3', image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', alt_text: 'سماعة أنكر ساوند كور', is_primary: true, sort_order: 1 },
      { id: 'img-e3-2', product_id: 'p-elec-3', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', alt_text: 'سماعة أنكر مع العلبة', is_primary: false, sort_order: 2 }
    ],
    attributes: [
      { id: 'a10', product_id: 'p-elec-3', attribute_key: 'battery_life', name_ar: 'عمر البطارية', value_ar: 'حتى 30 ساعة', sort_order: 1 },
      { id: 'a11', product_id: 'p-elec-3', attribute_key: 'bluetooth', name_ar: 'إصدار البلوتوث', value_ar: 'Bluetooth 5.3', sort_order: 2 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- 3. Office & School Supplies ---
  {
    id: 'p-sch-1',
    category_id: 'sub-paper',
    brand_id: 'b5',
    sku: 'SCH-DBL-A4',
    name_ar: 'رزمة ورق تصوير دابل إيه Double A قياس A4 وزن 80 جم (500 ورقة)',
    name_en: 'Double A Copy Paper A4 80gsm 500 Sheets',
    slug: 'double-a-copy-paper-a4-80gsm',
    description_ar: 'الورق رقم 1 في مصر والشرق الأوسط للتصوير والطباعة. بياض ناصع، نعومة استثنائية تحافظ على أحبار الطابعات وتمنع انحشار الورق.',
    short_description_ar: 'ورق تصوير ناصع البياض 80 جم مانع لانحشار الورق',
    price_egp: 285.0,
    original_price_egp: 310.0,
    stock_quantity: 120,
    low_stock_threshold: 20,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 420,
    sales_count: 160,
    images: [
      { id: 'img-s1', product_id: 'p-sch-1', image_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80', alt_text: 'ورق دابل إيه A4', is_primary: true, sort_order: 1 },
      { id: 'img-s1-2', product_id: 'p-sch-1', image_url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80', alt_text: 'أدوات مكتبية ومدرسية', is_primary: false, sort_order: 2 }
    ],
    attributes: [
      { id: 'a12', product_id: 'p-sch-1', attribute_key: 'paper_size', name_ar: 'المقاس', value_ar: 'A4 (210 × 297 مم)', sort_order: 1 },
      { id: 'a13', product_id: 'p-sch-1', attribute_key: 'weight', name_ar: 'الوزن', value_ar: '80 جرام لكل متر مربع', sort_order: 2 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-sch-2',
    category_id: 'sub-notebooks',
    brand_id: 'b3',
    sku: 'SCH-ROT-5DIV',
    name_ar: 'كشكول سلك جامعي روتو 5 فواصل 200 ورقة مسطر فاخر',
    slug: 'roto-college-notebook-5-dividers-200-sheets',
    description_ar: 'كشكول سلك حلزوني مزدوج مع غلاف بلاستيكي مقوى و5 فواصل ملونة لتنظيم المواد الدراسية، ورق 70 جم ناصع البياض غير نافذ للحبر.',
    price_egp: 135.0,
    original_price_egp: 160.0,
    stock_quantity: 60,
    low_stock_threshold: 15,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 140,
    sales_count: 48,
    images: [
      { id: 'img-s2', product_id: 'p-sch-2', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', alt_text: 'كشكول سلك 5 فواصل', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a14', product_id: 'p-sch-2', attribute_key: 'sheets', name_ar: 'عدد الأوراق', value_ar: '200 ورقة', sort_order: 1 },
      { id: 'a15', product_id: 'p-sch-2', attribute_key: 'dividers', name_ar: 'عدد الفواصل', value_ar: '5 فواصل ملونة', sort_order: 2 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-sch-3',
    category_id: 'sub-pens',
    brand_id: 'b4',
    sku: 'SCH-ZEB-SAR10',
    name_ar: 'طقم أقلام جل زيبرا ساراسا كليب 0.5 مم - عبوة 10 ألوان متنوعة',
    slug: 'zebra-sarasa-clip-gel-pens-05-10pack',
    description_ar: 'أقلام جل يابانية مشهورة بسلاسة الكتابة وسرعة جفاف الحبر المائي المقاوم للبهتان مع مشبك ميكانيكي مرن.',
    price_egp: 240.0,
    original_price_egp: 280.0,
    stock_quantity: 35,
    low_stock_threshold: 8,
    is_active: true,
    is_featured: false,
    allow_backorder: false,
    views_count: 110,
    sales_count: 22,
    images: [
      { id: 'img-s3', product_id: 'p-sch-3', image_url: 'https://images.unsplash.com/photo-1585336261026-77884bb00223?auto=format&fit=crop&w=600&q=80', alt_text: 'أقلام زيبرا ساراسا', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a16', product_id: 'p-sch-3', attribute_key: 'tip_size', name_ar: 'سُمك السن', value_ar: '0.5 مم', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- 4. Toys & Gifts ---
  {
    id: 'p-toy-1',
    category_id: 'sub-puzzles',
    brand_id: null,
    sku: 'TOY-PUZ-1000',
    name_ar: 'بازل خشبي ثلاثي الأبعاد هندسي ذكي لتقوية التركيز والتفكير',
    slug: '3d-wooden-geometric-brain-puzzle',
    description_ar: 'لعبة بازل خشبية تنمي مهارات التفكير المنطقي، الصبر والقدرة على حل المشكلات لدى الأطفال والكبار مصنوعة من خشب الزان الطبيعي الآمن.',
    price_egp: 195.0,
    original_price_egp: 240.0,
    stock_quantity: 28,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 95,
    sales_count: 19,
    images: [
      { id: 'img-t1', product_id: 'p-toy-1', image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80', alt_text: 'بازل خشبي ثلاثي الأبعاد', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a17', product_id: 'p-toy-1', attribute_key: 'age', name_ar: 'العمر المناسب', value_ar: 'من 6 سنوات فما فوق', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-toy-2',
    category_id: 'sub-wrapping',
    brand_id: null,
    sku: 'TOY-GFT-BOX',
    name_ar: 'صندوق هدايا كرتوني فاخر بغطاء مغناطيسي وشريط ستان ملكي',
    slug: 'luxury-gift-box-magnetic-ribbon',
    description_ar: 'علبة هدايا فخمة بملمس مخملي وقفل مغناطيسي خفي، مناسبة للساعات، العطور، الإكسسوارات والهدايا القيمة مع حشوة ورق ملون مجعد.',
    price_egp: 95.0,
    original_price_egp: 120.0,
    stock_quantity: 50,
    low_stock_threshold: 10,
    is_active: true,
    is_featured: false,
    allow_backorder: false,
    views_count: 75,
    sales_count: 24,
    images: [
      { id: 'img-t2', product_id: 'p-toy-2', image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', alt_text: 'صندوق هدايا فاخر', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a18', product_id: 'p-toy-2', attribute_key: 'size', name_ar: 'المقاس', value_ar: '25 × 20 × 10 سم', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- 5. Bags ---
  {
    id: 'p-bag-1',
    category_id: 'sub-schoolbags',
    brand_id: null,
    sku: 'BAG-SCH-ORTHO',
    name_ar: 'شنطة ظهر مدرسية طبية مريحة ضد الماء مع مقلمة متناسقة',
    slug: 'orthopedic-waterproof-school-backpack',
    description_ar: 'شنطة ظهر مصممة هندسياً لدعم العمود الفقري وتوزيع الوزن ببطانة تنفس مريحة، متعددة السحابات مع جيب خاص للزمزمية ومقاومة لتسرب الأمطار.',
    short_description_ar: 'دعم طبي للظهر وخامة مضادة للمياه مع مقلمة هدية',
    price_egp: 580.0,
    original_price_egp: 720.0,
    stock_quantity: 22,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 180,
    sales_count: 31,
    images: [
      { id: 'img-b1', product_id: 'p-bag-1', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', alt_text: 'شنطة ظهر مدرسية', is_primary: true, sort_order: 1 },
      { id: 'img-b1-2', product_id: 'p-bag-1', image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', alt_text: 'شنطة ظهر من زاوية جانبية', is_primary: false, sort_order: 2 }
    ],
    attributes: [
      { id: 'a19', product_id: 'p-bag-1', attribute_key: 'waterproof', name_ar: 'مقاومة الماء', value_ar: 'نعم — قماش أكسفورد معالج', sort_order: 1 },
      { id: 'a20', product_id: 'p-bag-1', attribute_key: 'capacity', name_ar: 'السعة', value_ar: '30 لتر', sort_order: 2 }
    ],
    variants: [
      { id: 'vb1', product_id: 'p-bag-1', sku: 'BAG-SCH-BLU', name_ar: 'اللون الكحلي', option_type: 'color', option_value: 'كحلي', stock_quantity: 12, is_active: true },
      { id: 'vb2', product_id: 'p-bag-1', sku: 'BAG-SCH-BLK', name_ar: 'اللون الأسود', option_type: 'color', option_value: 'أسود', stock_quantity: 10, is_active: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-bag-2',
    category_id: 'sub-dailybags',
    brand_id: null,
    sku: 'BAG-LAP-USB',
    name_ar: 'شنطة لابتوب واستخدام يومي أنيقة مع مخرج شحن USB وجيب أمان',
    slug: 'business-laptop-backpack-usb-port',
    description_ar: 'شنطة ظهر عصرية للمحترفين والجامعيين تتسع للابتوب حتى 15.6 بوصة مع بطانة امتصاص صدمات ومنفذ شحن خارجي وجيب سري في الظهر للمتعلقات الثمينة.',
    price_egp: 490.0,
    original_price_egp: 590.0,
    stock_quantity: 16,
    low_stock_threshold: 4,
    is_active: true,
    is_featured: false,
    allow_backorder: false,
    views_count: 130,
    sales_count: 18,
    images: [
      { id: 'img-b2', product_id: 'p-bag-2', image_url: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=80', alt_text: 'شنطة لابتوب USB', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a21', product_id: 'p-bag-2', attribute_key: 'laptop_size', name_ar: 'مقاس اللابتوب', value_ar: 'حتى 15.6 بوصة', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- 6. Accessories & Fashion Jewelry ---
  {
    id: 'p-acc-1',
    category_id: 'sub-chinesegold',
    brand_id: null,
    sku: 'ACC-GLD-SET',
    name_ar: 'طقم أساور وسلسلة بتصميم ذهبي صيني مقاوم لتغير اللون',
    slug: 'chinese-gold-style-bracelet-necklace-set',
    description_ar: 'طقم إكسسوار نسائي راقٍ بتشطيب ذهبي صيني لامع وعالي الثبات، مطلي بتقنية كهربية حديثة مقاومة لتغير اللون مع الاستخدام المعتاد.',
    short_description_ar: 'تصميم راقٍ ببريق ذهبي جذاب مقاوم لتغير اللون',
    price_egp: 220.0,
    original_price_egp: 280.0,
    stock_quantity: 25,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 175,
    sales_count: 27,
    images: [
      { id: 'img-a1', product_id: 'p-acc-1', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', alt_text: 'طقم إكسسوار بتصميم ذهبي صيني', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a22', product_id: 'p-acc-1', attribute_key: 'material', name_ar: 'الخامة والتشطيب', value_ar: 'سبيكة معدنية مطلية بتصميم ذهبي صيني', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-acc-2',
    category_id: 'sub-rings',
    brand_id: null,
    sku: 'ACC-RNG-ZRC',
    name_ar: 'خاتم نسائي ستانلس ستيل مطلي مرصع بفصوص الزركون السويسرية',
    slug: 'stainless-steel-zircon-ring',
    description_ar: 'خاتم بتصميم سوليتير عصري ناعم لا يتغير لونه بالماء، مرصع بأحجار زركون براقة تعكس الضوء ببريق نقي.',
    price_egp: 140.0,
    original_price_egp: 175.0,
    stock_quantity: 30,
    low_stock_threshold: 6,
    is_active: true,
    is_featured: false,
    allow_backorder: false,
    views_count: 110,
    sales_count: 20,
    images: [
      { id: 'img-a2', product_id: 'p-acc-2', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80', alt_text: 'خاتم زركون', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a23', product_id: 'p-acc-2', attribute_key: 'stones', name_ar: 'الأحجار', value_ar: 'زركون نقي', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- 7. Beauty & Personal Care ---
  {
    id: 'p-bt-1',
    category_id: 'sub-brushes',
    brand_id: null,
    sku: 'BTY-BRS-12P',
    name_ar: 'طقم فرش مكياج احترافي 12 قطعة بشعيرات ناعمة وحقيبة أنيقة',
    slug: 'professional-makeup-brushes-12pcs-case',
    description_ar: 'مجموعة متكاملة من فرش المكياج ذات الشعيرات الحريرية الكثيفة التي لا تتساقط، تشمل فرش كريم الأساس، البودرة، الآيشادو، الكونتور مع حقيبة جلدية للسفر والتخزين.',
    short_description_ar: '12 فرشاة ناعمة احترافية مع حقيبة جلدية أنيقة',
    price_egp: 260.0,
    original_price_egp: 320.0,
    stock_quantity: 35,
    low_stock_threshold: 6,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 165,
    sales_count: 38,
    images: [
      { id: 'img-bt1', product_id: 'p-bt-1', image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', alt_text: 'فرش مكياج 12 قطعة', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a24', product_id: 'p-bt-1', attribute_key: 'bristle_type', name_ar: 'نوع الشعيرات', value_ar: 'ألياف حريرية نباتية فائقة النعومة', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-bt-2',
    category_id: 'sub-mirrors',
    brand_id: null,
    sku: 'BTY-MIR-LED',
    name_ar: 'مرآة مكياج مضيئة بإضاءة LED قابلة للشحن باللمس وتعديل السطوع',
    slug: 'rechargeable-led-makeup-vanity-mirror',
    description_ar: 'مرآة طاولة ذكية مزودة بـ 3 مستويات إضاءة طبيعية (دافئة، بيضاء، طبيعية) مع زر تحكم لمس، قابلة للدوران 90 درجة مع بطارية ليثيوم قابلة للشحن Type-C.',
    price_egp: 310.0,
    original_price_egp: 380.0,
    stock_quantity: 18,
    low_stock_threshold: 4,
    is_active: true,
    is_featured: true,
    allow_backorder: false,
    views_count: 140,
    sales_count: 24,
    images: [
      { id: 'img-bt2', product_id: 'p-bt-2', image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80', alt_text: 'مرآة ليد مضيئة', is_primary: true, sort_order: 1 }
    ],
    attributes: [
      { id: 'a25', product_id: 'p-bt-2', attribute_key: 'charging', name_ar: 'نوع الشحن', value_ar: 'منفذ Type-C مدمج', sort_order: 1 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PRINT_SERVICES: PrintService[] = [
  {
    id: 'ps-1',
    name_ar: 'طباعة المستندات والأوراق',
    name_en: 'Document Printing',
    slug: 'document-printing',
    description_ar: 'طباعة فورية عالية النقاء للمذكرات والملفات والمستندات الرسمية أبيض وأسود أو ألوان، على ورق دابل إيه فاخر 80 جم.',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    pricing_model: 'per_page',
    base_price_egp: 1.5,
    min_order_price_egp: 10.0,
    turnaround_hours: 4,
    requires_file_upload: true,
    is_active: true,
    sort_order: 1,
    options: [
      {
        id: 'opt-p1-color',
        service_id: 'ps-1',
        option_key: 'color_mode',
        label_ar: 'نمط الطباعة والألوان',
        option_type: 'radio',
        is_required: true,
        values: [
          { id: 'v-bw', label_ar: 'أبيض وأسود (1.50 ج.م / صفحة)', value_key: 'bw', price_impact_egp: 1.5, is_default: true },
          { id: 'v-color', label_ar: 'ألوان دقيقة (4.00 ج.م / صفحة)', value_key: 'color', price_impact_egp: 4.0 },
        ]
      },
      {
        id: 'opt-p1-sides',
        service_id: 'ps-1',
        option_key: 'sides',
        label_ar: 'وجه الطباعة',
        option_type: 'radio',
        is_required: true,
        values: [
          { id: 'v-single', label_ar: 'وجه واحد (Single-sided)', value_key: 'single', price_impact_egp: 0, is_default: true },
          { id: 'v-double', label_ar: 'وجهين (Double-sided)', value_key: 'double', price_impact_egp: 0 },
        ]
      },
      {
        id: 'opt-p1-size',
        service_id: 'ps-1',
        option_key: 'paper_size',
        label_ar: 'مقاس الورق',
        option_type: 'select',
        is_required: true,
        values: [
          { id: 'v-a4', label_ar: 'ورق قياسي A4 (80 جم)', value_key: 'a4', price_impact_egp: 0, is_default: true },
          { id: 'v-a3', label_ar: 'ورق كبير A3 (80 جم) (+2.50 ج.م)', value_key: 'a3', price_impact_egp: 2.5 },
        ]
      }
    ]
  },
  {
    id: 'ps-2',
    name_ar: 'طباعة وتجليد الرسائل والأبحاث العلمية',
    name_en: 'Research & Thesis Printing',
    slug: 'research-thesis-printing',
    description_ar: 'طباعة فاخرة للأبحاث الجامعية ورسائل الماجستير والدكتوراه مع تجليد كعب حراري أو غلاف كرتوناج مقوى مع البصمة الذهبية.',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    pricing_model: 'per_page',
    base_price_egp: 2.0,
    min_order_price_egp: 40.0,
    turnaround_hours: 24,
    requires_file_upload: true,
    is_active: true,
    sort_order: 2,
    options: [
      {
        id: 'opt-p2-binding',
        service_id: 'ps-2',
        option_key: 'binding_type',
        label_ar: 'نوع التجليد والغلاف',
        option_type: 'select',
        is_required: true,
        values: [
          { id: 'v-b-spiral', label_ar: 'تجليد سلك حلزوني بلاستيك مع غلاف شفاف (+25 ج.م)', value_key: 'spiral', price_impact_egp: 25, is_default: true },
          { id: 'v-b-wire', label_ar: 'تجليد سلك معدني مزدوج فاخر (+35 ج.م)', value_key: 'wire', price_impact_egp: 35 },
          { id: 'v-b-thermal', label_ar: 'تجليد كعب حراري ديجيتال (+50 ج.م)', value_key: 'thermal', price_impact_egp: 50 },
          { id: 'v-b-hardcover', label_ar: 'غلاف مقوى كرتوناج مع بصمة ذهبية (+120 ج.م)', value_key: 'hardcover', price_impact_egp: 120 },
        ]
      }
    ]
  },
  {
    id: 'ps-3',
    name_ar: 'كروت العمل الشخصية (Business Cards)',
    name_en: 'Business Cards',
    slug: 'business-cards',
    description_ar: 'طباعة كروت شخصية ومؤسسية على كوشيه 350 جم فائق الصلابة مع سلفان مط أو لامع وبصمة ذهبية اختيارية (علبة 100 كارت).',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    pricing_model: 'per_unit',
    base_price_egp: 180.0,
    min_order_price_egp: 180.0,
    turnaround_hours: 48,
    requires_file_upload: true,
    is_active: true,
    sort_order: 3,
    options: [
      {
        id: 'opt-p3-lamination',
        service_id: 'ps-3',
        option_key: 'lamination',
        label_ar: 'نوع السلفان والحماية',
        option_type: 'radio',
        is_required: true,
        values: [
          { id: 'v-l-matte', label_ar: 'سلفان مط حريري فاخر (Matte)', value_key: 'matte', price_impact_egp: 0, is_default: true },
          { id: 'v-l-glossy', label_ar: 'سلفان لامع برّاق (Glossy)', value_key: 'glossy', price_impact_egp: 0 },
          { id: 'v-l-spotuv', label_ar: 'سلفان مط + يوفي بارز Spot UV (+70 ج.م)', value_key: 'spot_uv', price_impact_egp: 70 },
        ]
      }
    ]
  },
  {
    id: 'ps-4',
    name_ar: 'البانرات والفلكس الإعلاني (Banners & Flex)',
    name_en: 'Banners & Flex Outdoor',
    slug: 'banners-and-flex',
    description_ar: 'طباعة لافتات بانر خارجية وبوسترات معارض بدقة عالية وخامات مقاومة للشمس والمطر مع تركيب حلقات معدنية للتثبيت.',
    image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    pricing_model: 'per_sqm',
    base_price_egp: 85.0,
    min_order_price_egp: 100.0,
    turnaround_hours: 24,
    requires_file_upload: true,
    is_active: true,
    sort_order: 4,
    options: [
      {
        id: 'opt-p4-type',
        service_id: 'ps-4',
        option_key: 'material',
        label_ar: 'نوع الخامة الإعلانية',
        option_type: 'select',
        is_required: true,
        values: [
          { id: 'v-m-banner', label_ar: 'بانر تقيل كوري 440 جم (85 ج.م / م²)', value_key: 'banner_korean', price_impact_egp: 85, is_default: true },
          { id: 'v-m-flex', label_ar: 'فلكس مضيء للواجهات المضاءة (120 ج.م / م²)', value_key: 'flex_illuminated', price_impact_egp: 120 },
        ]
      }
    ]
  },
  {
    id: 'ps-5',
    name_ar: 'استيكرات وملصقات مقصوصة (Stickers & Labels)',
    name_en: 'Stickers & Labels',
    slug: 'stickers-labels',
    description_ar: 'طباعة وقص استيكرات منتجات، علب ومطاعم ديجيتال بأي شكل دائري أو مخصص، خامة فينيل ضد الماء أو ورقي لامع.',
    image_url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80',
    pricing_model: 'per_sqm',
    base_price_egp: 120.0,
    min_order_price_egp: 60.0,
    turnaround_hours: 24,
    requires_file_upload: true,
    is_active: true,
    sort_order: 5,
    options: []
  },
  {
    id: 'ps-6',
    name_ar: 'طلب طباعة وتصميم مخصص (Custom Quote)',
    name_en: 'Custom Print Quote',
    slug: 'custom-print',
    description_ar: 'هل لديك مواصفات خاصة، كتاب ضخم، علب تغليف كرتونية أو كميات تجارية؟ اطلب عرض سعر وسيقوم فريق مركز الطباعة بالرد عليك فوراً.',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    pricing_model: 'quote_only',
    base_price_egp: 0,
    min_order_price_egp: 0,
    turnaround_hours: 24,
    requires_file_upload: true,
    is_active: true,
    sort_order: 6,
    options: []
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b-1',
    title_ar: 'مهرجان التسوق الضخم لمصر | خصومات حتى 70%',
    subtitle_ar: 'أقوى عروض الأجهزة، مستلزمات المنزل، الشنط والأدوات المدرسية بأسعار استثنائية وشحن سريع لجميع المحافظات!',
    image_desktop_url: '/images/banners/banner-mega-sale.webp',
    image_mobile_url: '/images/banners/banner-mega-sale.webp',
    link_url: '/offers',
    cta_text_ar: 'تسوق العروض الكبرى',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'b-2',
    title_ar: 'مركز الطباعة الرقمية المتخصص المعتمد',
    subtitle_ar: 'طباعة الأبحاث، الرسائل الجامعية، كروت العمل الفاخرة، البانرات والمطبوعات الإعلانية بأعلى دقة CMYK وتسليم فوري',
    image_desktop_url: '/images/banners/banner-print-center.webp',
    image_mobile_url: '/images/banners/banner-print-center.webp',
    link_url: '/print-center',
    cta_text_ar: 'احسب تكلفة طباعتك فوراً',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'b-3',
    title_ar: 'عالم الإلكترونيات وإكسسوارات الهواتف الذكية',
    subtitle_ar: 'أحدث الشواحن الأصلية، الساعات الذكية، السماعات وبنوك الطاقة المعتمدة بضمان كامل وبأفضل سعر في مصر',
    image_desktop_url: '/images/banners/banner-tech-deals.webp',
    image_mobile_url: '/images/banners/banner-tech-deals.webp',
    link_url: '/category/electronics-and-mobile',
    cta_text_ar: 'اكتشف أحدث الإلكترونيات',
    sort_order: 3,
    is_active: true,
  }
];

export const INITIAL_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: 's-hero', section_key: 'hero_carousel', title_ar: 'البانر الترويجي الرئيسي', section_type: 'hero_carousel', sort_order: 1, is_visible: true, is_enabled: true },
  { id: 's-cats', section_key: 'category_grid', title_ar: 'تصفح أقسام مول المصطفى', subtitle_ar: 'اكتشف الأقسام الرئيسية وتعرف على كافة المنتجات المتاحة', section_type: 'category_grid', sort_order: 2, is_visible: true, is_enabled: true },
  { id: 's-offers', section_key: 'offers_shelf', title_ar: 'عروض وتخفيضات مميزة', subtitle_ar: 'خصومات حقيقية على منتجات مختارة لفترة محدودة', section_type: 'product_shelf', collection_filter: 'offers', sort_order: 3, is_visible: true, is_enabled: true },
  { id: 's-newest', section_key: 'newest_shelf', title_ar: 'أحدث الإضافات في المول', subtitle_ar: 'منتجات جديدة تم إضافتها حديثاً إلى رفوف المتجر', section_type: 'product_shelf', collection_filter: 'newest', sort_order: 4, is_visible: true, is_enabled: true },
  { id: 's-best', section_key: 'best_sellers_shelf', title_ar: 'اختيارات مول المصطفى الأكثر طلباً', subtitle_ar: 'المنتجات الأعلى طلباً والأكثر ثقة من عملائنا في مختلف المحافظات', section_type: 'product_shelf', collection_filter: 'best_sellers', sort_order: 5, is_visible: true, is_enabled: true },
  { id: 's-brands', section_key: 'brands_row', title_ar: 'الماركات والعلامات التجارية المعتمدة', subtitle_ar: 'تسوق من كبرى الماركات العالمية والمحلية المضمونة', section_type: 'brand_showcase', sort_order: 6, is_visible: true, is_enabled: true },
  { id: 's-print', section_key: 'print_center', title_ar: 'خدمات مركز الطباعة الرقمية', subtitle_ar: 'طباعة مستندات، أبحاث، كروت ولافتات مع حساب فوري للسعر', section_type: 'print_center', sort_order: 7, is_visible: true, is_enabled: true },
  { id: 's-trust', section_key: 'trust_badges', title_ar: 'لماذا تتسوق من مول المصطفى؟', subtitle_ar: 'قصة علامتنا التجارية والمزايا الاستثنائية التي نقدمها لعملائنا', section_type: 'trust_badges', sort_order: 8, is_visible: true, is_enabled: true },
  { id: 's-reviews', section_key: 'reviews', title_ar: 'تقييمات وآراء العملاء الحقيقية', subtitle_ar: 'تجارب عملائنا الموثقة وشهاداتهم في مختلف المحافظات', section_type: 'reviews', sort_order: 9, is_visible: true, is_enabled: true },
  { id: 's-delivery', section_key: 'delivery_radar', title_ar: 'رادار سرعة ومناطق التوصيل الحي', subtitle_ar: 'تغطية فورية وسريعة لجميع محافظات جمهورية مصر العربية', section_type: 'delivery_radar', sort_order: 10, is_visible: true, is_enabled: true },
];

export const INITIAL_CMS_PAGES: CmsPage[] = [
  {
    id: 'p-about',
    slug: 'about',
    title_ar: 'عن مول المصطفى',
    content_ar: `أهلاً بكم في مول المصطفى (Al Mostafa Mall)، الصرح التجاري الرائد والمتنوع الذي يقدم تجربة تسوق عائلية متكاملة.

نجمع تحت سقف واحد أحدث وأفضل المنتجات في مجالات:
• مستلزمات المنزل والنظافة الأصلية
• الإلكترونيات وإكسسوارات الموبايل والكمبيوتر المعتمدة
• الأدوات المدرسية والمكتبية لجميع المراحل التعليمية
• الألعاب التنموية والتعليمية والهدايا ومستلزمات التغليف
• الشنط المدرسية واليومية المتينة
• الإكسسوارات والموضة الراقية
• أدوات التجميل ومستحضرات العناية الشخصية
• مركز الطباعة والتصوير الرقمي المتخصص

رؤيتنا هي تقديم جودة مضمونة بأسعار عادلة تناسب الأسرة المصرية، مع التزام تام بالصدق والأمانة والخدمة الراقية.`,
    is_published: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-delivery',
    slug: 'delivery',
    title_ar: 'سياسة التوصيل والشحن',
    content_ar: `نحرص في مول المصطفى على إيصال طلباتكم بأسرع وقت وأعلى درجات الأمان:

1. مناطق التغطية:
نوفر التوصيل لجميع محافظات جمهورية مصر العربية (القاهرة، الجيزة، الإسكندرية، الدلتا، القناة، والصعيد).

2. مدة التوصيل:
• القاهرة والجيزة: من 24 إلى 48 ساعة من تأكيد الطلب.
• باقي المحافظات: خلال 3 إلى 5 أيام عمل.

3. تكلفة الشحن:
• مصاريف الشحن الثابتة هي 45 ج.م فقط لكافة المناطق المعتمدة.
• الشحن مجاني تماماً للطلبات التي تزيد قيمتها عن 750 ج.م!`,
    is_published: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-returns',
    slug: 'returns',
    title_ar: 'سياسة الاستبدال والاسترجاع',
    content_ar: `حقوق العميل محفوظة بالكامل وفقاً لقانون حماية المستهلك المصري:

• يحق للعميل استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام.
• يجب أن يكون المنتج بحالته الأصلية، غير مستخدم، ومرفق معه الكرتونة الأصلية وجميع الملحقات.
• مستلزمات العناية الشخصية والأقراط لا تسترجع لدواعي الصحة والسلامة العامة إلا في حال وجود عيب مصنعي.
• المطبوعات المنفذة حسب طلب ومواصفات العميل لا يمكن إلغاؤها بعد بدء مرحلة الإنتاج.`,
    is_published: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-privacy',
    slug: 'privacy',
    title_ar: 'سياسة الخصوصية وسرية البيانات',
    content_ar: `خصوصيتكم وأمان بياناتكم هي أولويتنا القصوى:

• لا نقوم بمشاركة أي بيانات اتصال أو عناوين مع أي جهات خارجية غير معنية بتوصيل طلبكم.
• الملفات والمستندات المرفوعة إلى مركز الطباعة تخضع لسرية تامة ومطلقة ويتم التعامل معها حصرياً بواسطة فريق الإنتاج المختص.
• جميع معاملات الدفع مشفرة ومؤمنة بالكامل.`,
    is_published: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-terms',
    slug: 'terms',
    title_ar: 'الشروط والأحكام العامة',
    content_ar: `مرحباً بكم في مول المصطفى (Al Mostafa Mall). يخضع استخدامكم للمتجر للشروط والأحكام التالية:

1. شروط الطلب والتعاقد:
• يعتبر إرسال الطلب عبر المتجر موافقة تامة على تفاصيل الأسعار والمواصفات وسياسات الشحن الموضحة.
• نقوم بمراجعة وتأكيد كافة الطلبات لضمان جاهزية المخزون وسرعة الشحن.

2. الأسعار والعروض:
• كافة الأسعار المذكورة بالجنيه المصري (EGP) وشاملة للضرائب المقررة.
• تطبق كوبونات الخصم والعروض الترويجية وفق الشروط والحد الأدنى لكل كود خصم.

3. خدمات الطباعة المخصصة:
• يتحمل العميل المسؤولية القانونية الكاملة عن حقوق الملكية الفكرية للمحتوى المرفوع للطباعة.
• تبدأ مرحلة الإنتاج فور مراجعة الملف واعتماد المواصفات النهائية.`,
    is_published: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-faq',
    slug: 'faq',
    title_ar: 'الأسئلة الشائعة والدعم الفني',
    content_ar: `إليكم إجابات أكثر الأسئلة شيوعاً حول التسوق والخدمات في مول المصطفى:

س: كيف يمكنني تتبع طلبي؟
ج: يمكنك متابعة حالة شحنتك لحظياً من خلال صفحة "طلباتي" في حسابك، أو عبر إرسال رقم الطلب عبر واتساب لخدمة العملاء.

س: ما هي طرق الدفع المتاحة؟
ج: نوفر الدفع عند الاستلام (كاش)، التحويل عبر إنستاباي (InstaPay)، المحافظ الإلكترونية (فودافون كاش)، والدفع الإلكتروني المعتمد.

س: كيف يعمل مركز الطباعة الرقمية؟
ج: يمكنك اختيار نوع الخدمة (مستندات، كروت، أبحاث، بانرات)، رفع ملفك (PDF/Word/AI)، وسيقوم المحرك الذكي بحساب السعر الدقيق فوراً وإضافته لسلتك مع معاينة واضحة!`,
    is_published: true,
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp-welcome',
    code: 'MOSTAFA10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value_egp: 200,
    max_discount_egp: 50,
    times_used: 12,
    is_active: true
  },
  {
    id: 'cp-save50',
    code: 'SAVE50',
    discount_type: 'fixed_amount',
    discount_value: 50,
    min_order_value_egp: 500,
    times_used: 8,
    is_active: true
  }
];

export const INITIAL_NAV_ITEMS: NavItem[] = [
  { id: 'nav-1', label: 'جميع المنتجات والكتالوج', url: '/shop', location: 'header', is_active: true, sort_order: 1 },
  { id: 'nav-2', label: 'عروض وتخفيضات اليوم', url: '/offers', location: 'header', is_active: true, sort_order: 2 },
  { id: 'nav-3', label: 'مركز الطباعة المتخصص', url: '/print-center', location: 'header', is_active: true, sort_order: 3 },
  { id: 'nav-4', label: 'ألعاب وهدايا', url: '/category/toys-and-gifts', location: 'header', is_active: true, sort_order: 4 },
  { id: 'nav-5', label: 'تتبع الطلبات', url: '/account', location: 'header', is_active: true, sort_order: 5 },
  { id: 'nav-6', label: 'عن مول المصطفى', url: '/page/about', location: 'footer', is_active: true, sort_order: 1 },
  { id: 'nav-7', label: 'الشحن والتوصيل', url: '/page/delivery', location: 'footer', is_active: true, sort_order: 2 },
  { id: 'nav-8', label: 'سياسة الاسترجاع', url: '/page/returns', location: 'footer', is_active: true, sort_order: 3 },
  { id: 'nav-9', label: 'الشروط والأحكام', url: '/page/terms', location: 'footer', is_active: true, sort_order: 4 },
  { id: 'nav-10', label: 'الأسئلة الشائعة', url: '/page/faq', location: 'footer', is_active: true, sort_order: 5 },
  { id: 'nav-11', label: 'الرئيسية', url: '/', location: 'mobile_bar', is_active: true, sort_order: 1 },
  { id: 'nav-12', label: 'الأقسام', url: '/shop', location: 'mobile_bar', is_active: true, sort_order: 2 },
  { id: 'nav-13', label: 'مركز الطباعة', url: '/print-center', location: 'mobile_bar', is_active: true, sort_order: 3 },
  { id: 'nav-14', label: 'المفضلة', url: '/wishlist', location: 'mobile_bar', is_active: true, sort_order: 4 },
  { id: 'nav-15', label: 'السلة', url: '/cart', location: 'mobile_bar', is_active: true, sort_order: 5 },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'usr-1',
    name: 'أحمد مصطفى (المدير العام)',
    email: 'admin@almostafamall.com',
    phone: '01023456789',
    password: 'admin123',
    role: 'super_admin',
    permissions: [
      'manage_products',
      'manage_categories',
      'manage_inventory',
      'manage_orders',
      'manage_discounts',
      'manage_banners',
      'manage_content',
      'manage_printing',
      'manage_staff',
      'manage_settings',
      'view_analytics',
    ],
    isActive: true,
    lastLogin: 'الآن (نشط)'
  },
  {
    id: 'usr-2',
    name: 'محمود عبد الرحيم',
    email: 'catalog@almostafamall.com',
    phone: '01198765432',
    password: 'staff123',
    role: 'catalog_manager',
    permissions: ['manage_products', 'manage_categories', 'manage_inventory'],
    isActive: true,
    lastLogin: 'أمس 04:15 م'
  },
  {
    id: 'usr-3',
    name: 'سامح حسن',
    email: 'orders@almostafamall.com',
    phone: '01234567801',
    password: 'staff123',
    role: 'order_manager',
    permissions: ['manage_orders', 'manage_inventory', 'view_analytics'],
    isActive: true,
    lastLogin: 'اليوم 09:30 ص'
  },
  {
    id: 'usr-4',
    name: 'طارق الدسوقي',
    email: 'print@almostafamall.com',
    phone: '01087654321',
    password: 'staff123',
    role: 'printing_staff',
    permissions: ['manage_printing'],
    isActive: true,
    lastLogin: 'منذ ساعتين'
  },
  {
    id: 'usr-5',
    name: 'هند سليمان',
    email: 'content@almostafamall.com',
    phone: '01511223344',
    password: 'staff123',
    role: 'content_manager',
    permissions: ['manage_banners', 'manage_content', 'manage_discounts'],
    isActive: true,
    lastLogin: 'قبل 3 أيام'
  }
];

export const INITIAL_ORDERS: import('../types').Order[] = [
  {
    id: 'ord-sample-1',
    order_number: 'MSM-849201',
    customer_id: 'usr-cust-1',
    customer_name: 'محمود عبد الرحمن',
    customer_phone: '01012345678',
    customer_email: 'mahmoud.abdelrahman@gmail.com',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    shipping_address: 'شارع عباس العقاد، عمارة 14، الدور الرابع، شقة 8',
    delivery_notes: 'يرجى الاتصال قبل الوصول بنصف ساعة',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    order_status: 'pending_confirmation',
    subtotal_egp: 885.0,
    discount_egp: 88.5,
    coupon_code: 'MOSTAFA10',
    shipping_fee_egp: 45.0,
    total_egp: 841.5,
    internal_notes: 'طلب جديد تم تأكيده هاتفياً',
    items: [
      {
        id: 'item-1',
        order_id: 'ord-sample-1',
        product_id: 'p-home-1',
        product_name_ar: 'مسحوق غسيل أوتوماتيك أريال لافندر مركز - 4 كجم',
        product_sku: 'HOM-ARI-001',
        unit_price_egp: 295.0,
        quantity: 2,
        total_price_egp: 590.0,
      },
      {
        id: 'item-2',
        order_id: 'ord-sample-1',
        product_id: 'p-home-2',
        product_name_ar: 'ممسحة أرضيات دوارة ذكية مع جردل تجفيف ستانلس ستيل',
        product_sku: 'HOM-MOP-002',
        unit_price_egp: 295.0,
        quantity: 1,
        total_price_egp: 295.0,
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'ord-sample-2',
    order_number: 'MSM-723145',
    customer_id: 'usr-cust-2',
    customer_name: 'سارة إبراهيم الشناوي',
    customer_phone: '01123456789',
    customer_email: 'sara.shennawy@outlook.com',
    governorate: 'الجيزة',
    city: 'الدقي',
    shipping_address: 'ميدان المساحة، شارع إيران، برج الأطباء، الدور السادس',
    delivery_notes: 'الدفع نقداً عند الاستلام',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    order_status: 'preparing',
    subtotal_egp: 420.0,
    discount_egp: 0,
    shipping_fee_egp: 40.0,
    total_egp: 460.0,
    items: [
      {
        id: 'item-3',
        order_id: 'ord-sample-2',
        product_id: 'p-stat-1',
        product_name_ar: 'طقم أقلام حبر جاف فاخرة يوني بول - 12 قلم',
        product_sku: 'STA-UNI-001',
        unit_price_egp: 210.0,
        quantity: 2,
        total_price_egp: 420.0,
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];
