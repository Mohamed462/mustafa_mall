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
  OrderStatus,
  PrintRequest,
  PrintStatus,
  InventoryMovement,
  Coupon,
  SmartDiscountCampaign,
  AuditLog,
  NavItem,
  StaffMember,
  UserProfile
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_BRANDS, 
  INITIAL_PRODUCTS, 
  INITIAL_PRINT_SERVICES, 
  INITIAL_SETTINGS, 
  INITIAL_BANNERS, 
  INITIAL_HOMEPAGE_SECTIONS, 
  INITIAL_CMS_PAGES, 
  INITIAL_COUPONS,
  INITIAL_NAV_ITEMS,
  INITIAL_STAFF
} from './mockData';

const STORAGE_KEY = 'al_mostafa_store_v1';

interface StoreState {
  settings: StoreSettings;
  categories: Category[];
  brands: Brand[];
  products: Product[];
  printServices: PrintService[];
  banners: Banner[];
  homepageSections: HomepageSection[];
  cmsPages: CmsPage[];
  orders: Order[];
  printRequests: PrintRequest[];
  coupons: Coupon[];
  discountCampaigns: SmartDiscountCampaign[];
  inventoryMovements: InventoryMovement[];
  auditLogs: AuditLog[];
  navItems: NavItem[];
  staffMembers: StaffMember[];
  registeredUsers: Array<UserProfile & { password?: string }>;
}

const clone = <T>(items: T[]): T[] => items.map(item => ({ ...item }));
const cloneObject = <T extends object>(obj: T): T => ({ ...obj });

function loadState(): StoreState {
  if (typeof window === 'undefined') {
    return {
      settings: cloneObject(INITIAL_SETTINGS),
      categories: clone(INITIAL_CATEGORIES),
      brands: clone(INITIAL_BRANDS),
      products: clone(INITIAL_PRODUCTS),
      printServices: clone(INITIAL_PRINT_SERVICES),
      banners: clone(INITIAL_BANNERS),
      homepageSections: clone(INITIAL_HOMEPAGE_SECTIONS),
      cmsPages: clone(INITIAL_CMS_PAGES),
      orders: [],
      printRequests: [],
      coupons: clone(INITIAL_COUPONS),
      discountCampaigns: [],
      inventoryMovements: [],
      auditLogs: [],
      navItems: clone(INITIAL_NAV_ITEMS),
      staffMembers: clone(INITIAL_STAFF),
      registeredUsers: [],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      // Homepage sections merging: preserve saved customizations, but ensure all default sections exist
      const savedSections: HomepageSection[] = Array.isArray(parsed.homepageSections) ? parsed.homepageSections : [];
      const mergedSections: HomepageSection[] = [...savedSections];
      for (const initSec of INITIAL_HOMEPAGE_SECTIONS) {
        if (!mergedSections.some(s => s.section_key === initSec.section_key)) {
          mergedSections.push({ ...initSec });
        }
      }

      // Nav items resolution from dedicated key or parsed store
      let resolvedNavItems: NavItem[] = clone(INITIAL_NAV_ITEMS);
      try {
        const navRaw = localStorage.getItem('al_mostafa_nav_items_v1');
        if (navRaw) {
          const parsedNav = JSON.parse(navRaw);
          if (Array.isArray(parsedNav) && parsedNav.length > 0) {
            resolvedNavItems = parsedNav;
          }
        } else if (Array.isArray(parsed.navItems) && parsed.navItems.length > 0) {
          resolvedNavItems = parsed.navItems;
        }
      } catch {
        resolvedNavItems = clone(INITIAL_NAV_ITEMS);
      }

      // Staff members resolution with permission hydration
      const rawStaff: StaffMember[] = Array.isArray(parsed.staffMembers) && parsed.staffMembers.length > 0
        ? parsed.staffMembers
        : clone(INITIAL_STAFF);

      const resolvedStaff: StaffMember[] = rawStaff.map(member => {
        const defaultMember = INITIAL_STAFF.find(s => s.id === member.id || s.role === member.role);
        return {
          ...member,
          password: member.password || defaultMember?.password || 'staff123',
          permissions: member.permissions && member.permissions.length > 0
            ? member.permissions
            : (defaultMember?.permissions || [
                'manage_products',
                'manage_categories',
                'manage_inventory',
                'manage_orders'
              ])
        };
      });

      return {
        settings: {
          ...INITIAL_SETTINGS,
          ...(parsed.settings || {}),
          logo_url: (!parsed.settings?.logo_url || parsed.settings.logo_url === '/logo.svg' || parsed.settings.logo_url === '/logo-light.svg')
            ? '/brand-logo-transparent.webp'
            : parsed.settings.logo_url,
        },
        categories: parsed.categories?.length ? parsed.categories : clone(INITIAL_CATEGORIES),
        brands: parsed.brands?.length ? parsed.brands : clone(INITIAL_BRANDS),
        products: parsed.products?.length 
          ? parsed.products.map((p: Product) => {
              const initial = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
              if (initial && (!p.images || p.images.length <= 1) && initial.images && initial.images.length > 1) {
                return { ...p, images: initial.images };
              }
              return p;
            })
          : clone(INITIAL_PRODUCTS),
        printServices: parsed.printServices?.length ? parsed.printServices : clone(INITIAL_PRINT_SERVICES),
        banners: (parsed.banners?.length && !parsed.banners.some((b: any) => b.image_desktop_url?.includes('unsplash') || b.image_url?.includes('unsplash')))
          ? parsed.banners 
          : clone(INITIAL_BANNERS),
        homepageSections: mergedSections.length ? mergedSections : clone(INITIAL_HOMEPAGE_SECTIONS),
        cmsPages: Array.isArray(parsed.cmsPages) && parsed.cmsPages.length >= INITIAL_CMS_PAGES.length
          ? parsed.cmsPages
          : clone(INITIAL_CMS_PAGES),
        orders: parsed.orders || [],
        printRequests: parsed.printRequests || [],
        coupons: parsed.coupons || clone(INITIAL_COUPONS),
        discountCampaigns: parsed.discountCampaigns || [],
        inventoryMovements: parsed.inventoryMovements || [],
        auditLogs: parsed.auditLogs || [],
        navItems: resolvedNavItems,
        staffMembers: resolvedStaff,
        registeredUsers: (() => {
          let users: Array<UserProfile & { password?: string }> = Array.isArray(parsed.registeredUsers)
            ? parsed.registeredUsers
            : [];
          try {
            const rawUsers = localStorage.getItem('al_mostafa_registered_users_v2');
            if (rawUsers) {
              const parsedUsers = JSON.parse(rawUsers);
              if (Array.isArray(parsedUsers)) {
                parsedUsers.forEach((pu: UserProfile & { password?: string }) => {
                  if (!users.some(ru => ru.id === pu.id || (pu.email && ru.email === pu.email))) {
                    users.push(pu);
                  }
                });
              }
            }
          } catch {}
          return users;
        })(),
      };
    }
  } catch (err) {
    console.error('Failed to load store state from localStorage:', err);
  }

  // Fallback nav items from dedicated key if available
  let fallbackNavItems = clone(INITIAL_NAV_ITEMS);
  try {
    const navRaw = localStorage.getItem('al_mostafa_nav_items_v1');
    if (navRaw) {
      const parsedNav = JSON.parse(navRaw);
      if (Array.isArray(parsedNav) && parsedNav.length > 0) {
        fallbackNavItems = parsedNav;
      }
    }
  } catch {
    // fallback
  }

  // Fallback registered users
  let fallbackUsers: Array<UserProfile & { password?: string }> = [];
  try {
    const rawUsers = localStorage.getItem('al_mostafa_registered_users_v2');
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      if (Array.isArray(parsedUsers)) {
        fallbackUsers = parsedUsers;
      }
    }
  } catch {}

  const initial: StoreState = {
    settings: cloneObject(INITIAL_SETTINGS),
    categories: clone(INITIAL_CATEGORIES),
    brands: clone(INITIAL_BRANDS),
    products: clone(INITIAL_PRODUCTS),
    printServices: clone(INITIAL_PRINT_SERVICES),
    banners: clone(INITIAL_BANNERS),
    homepageSections: clone(INITIAL_HOMEPAGE_SECTIONS),
    cmsPages: clone(INITIAL_CMS_PAGES),
    orders: [],
    printRequests: [],
    coupons: clone(INITIAL_COUPONS),
    discountCampaigns: [],
    inventoryMovements: [],
    auditLogs: [],
    navItems: fallbackNavItems,
    staffMembers: clone(INITIAL_STAFF),
    registeredUsers: fallbackUsers,
  };

  saveState(initial);
  return initial;
}

function saveState(state: StoreState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem('al_mostafa_nav_items_v1', JSON.stringify(state.navItems));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    } catch (err) {
      console.error('Failed to save store state to localStorage:', err);
    }
  }
}

// In-Memory active singleton
let state = loadState();

export const dbStore = {
  // Reset database back to default seed state
  resetToDefaults: () => {
    state = {
      settings: cloneObject(INITIAL_SETTINGS),
      categories: clone(INITIAL_CATEGORIES),
      brands: clone(INITIAL_BRANDS),
      products: clone(INITIAL_PRODUCTS),
      printServices: clone(INITIAL_PRINT_SERVICES),
      banners: clone(INITIAL_BANNERS),
      homepageSections: clone(INITIAL_HOMEPAGE_SECTIONS),
      cmsPages: clone(INITIAL_CMS_PAGES),
      orders: [],
      printRequests: [],
      coupons: clone(INITIAL_COUPONS),
      discountCampaigns: [],
      inventoryMovements: [],
      auditLogs: [],
      navItems: clone(INITIAL_NAV_ITEMS),
      staffMembers: clone(INITIAL_STAFF),
      registeredUsers: [],
    };
    saveState(state);
    return state;
  },

  // SETTINGS
  getSettings: (): StoreSettings => {
    return { ...state.settings };
  },
  updateSettings: (newSettings: Partial<StoreSettings>): StoreSettings => {
    state.settings = { ...state.settings, ...newSettings };
    saveState(state);
    dbStore.logAudit('update', 'store_settings', 'global', 'تم تحديث إعدادات المتجر');
    return state.settings;
  },

  // CATEGORIES
  getCategories: (): Category[] => {
    return [...state.categories];
  },
  getCategoryBySlug: (slug: string): Category | undefined => {
    for (const cat of state.categories) {
      if (cat.slug === slug) return cat;
      if (cat.children) {
        const child = cat.children.find(c => c.slug === slug);
        if (child) return child;
      }
    }
    return undefined;
  },
  saveCategory: (category: Partial<Category> & { name_ar: string; slug: string; department_key: any }): Category => {
    const isNew = !category.id;
    const catId = category.id || `cat-${Date.now()}`;
    const newCat: Category = {
      id: catId,
      parent_id: category.parent_id || null,
      name_ar: category.name_ar,
      name_en: category.name_en || '',
      slug: category.slug,
      department_key: category.department_key,
      description_ar: category.description_ar || '',
      image_url: category.image_url || '',
      icon_name: category.icon_name || 'ShoppingBag',
      sort_order: category.sort_order ?? 0,
      is_active: category.is_active ?? true,
      is_featured: category.is_featured ?? false,
      children: category.children || [],
    };

    if (newCat.parent_id) {
      // Subcategory
      const parent = state.categories.find(c => c.id === newCat.parent_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        const existingIdx = parent.children.findIndex(c => c.id === catId);
        if (existingIdx >= 0) {
          parent.children[existingIdx] = newCat;
        } else {
          parent.children.push(newCat);
        }
      }
    } else {
      // Root department category
      const existingIdx = state.categories.findIndex(c => c.id === catId);
      if (existingIdx >= 0) {
        state.categories[existingIdx] = { ...state.categories[existingIdx], ...newCat };
      } else {
        state.categories.push(newCat);
      }
    }

    saveState(state);
    dbStore.logAudit(isNew ? 'create' : 'update', 'categories', catId, `حفظ الفئة: ${newCat.name_ar}`);
    return newCat;
  },
  deleteCategory: (id: string): boolean => {
    // Check root
    const rootIdx = state.categories.findIndex(c => c.id === id);
    if (rootIdx >= 0) {
      state.categories.splice(rootIdx, 1);
      saveState(state);
      return true;
    }
    // Check children
    for (const parent of state.categories) {
      if (parent.children) {
        const childIdx = parent.children.findIndex(c => c.id === id);
        if (childIdx >= 0) {
          parent.children.splice(childIdx, 1);
          saveState(state);
          return true;
        }
      }
    }
    return false;
  },

  // BRANDS
  getBrands: (): Brand[] => {
    return [...state.brands];
  },
  saveBrand: (brand: Partial<Brand> & { name_ar: string; slug: string }): Brand => {
    const brandId = brand.id || `b-${Date.now()}`;
    const newBrand: Brand = {
      id: brandId,
      name_ar: brand.name_ar,
      name_en: brand.name_en,
      slug: brand.slug,
      logo_url: brand.logo_url,
      is_featured: brand.is_featured ?? false,
      is_active: brand.is_active ?? true,
    };
    const idx = state.brands.findIndex(b => b.id === brandId);
    if (idx >= 0) {
      state.brands[idx] = newBrand;
    } else {
      state.brands.push(newBrand);
    }
    saveState(state);
    return newBrand;
  },

  // PRODUCTS
  getProducts: (): Product[] => {
    return [...state.products];
  },
  getProductById: (id: string): Product | undefined => {
    return state.products.find(p => p.id === id);
  },
  getProductBySlug: (slug: string): Product | undefined => {
    return state.products.find(p => p.slug === slug);
  },
  saveProduct: (product: Partial<Product> & { name_ar: string; slug: string; sku: string; price_egp: number; category_id: string }): Product => {
    const isNew = !product.id;
    const prodId = product.id || `p-${Date.now()}`;
    const now = new Date().toISOString();

    const existing = state.products.find(p => p.id === prodId);

    const fullProduct: Product = {
      id: prodId,
      category_id: product.category_id,
      brand_id: product.brand_id || null,
      sku: product.sku,
      barcode: product.barcode,
      name_ar: product.name_ar,
      name_en: product.name_en,
      slug: product.slug,
      short_description_ar: product.short_description_ar,
      description_ar: product.description_ar || product.name_ar,
      price_egp: Number(product.price_egp),
      original_price_egp: product.original_price_egp ? Number(product.original_price_egp) : undefined,
      cost_price_egp: product.cost_price_egp ? Number(product.cost_price_egp) : undefined,
      stock_quantity: Number(product.stock_quantity ?? 0),
      low_stock_threshold: Number(product.low_stock_threshold ?? 5),
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      allow_backorder: product.allow_backorder ?? false,
      views_count: existing?.views_count || 0,
      sales_count: existing?.sales_count || 0,
      images: product.images?.length ? product.images : [
        { id: `img-${Date.now()}`, product_id: prodId, image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 1 }
      ],
      attributes: product.attributes || [],
      variants: product.variants || [],
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (existing) {
      const idx = state.products.findIndex(p => p.id === prodId);
      // Log stock change if modified
      if (existing.stock_quantity !== fullProduct.stock_quantity) {
        dbStore.logInventoryMovement(
          prodId,
          fullProduct.name_ar,
          null,
          fullProduct.stock_quantity - existing.stock_quantity,
          existing.stock_quantity,
          fullProduct.stock_quantity,
          'adjustment',
          'تعديل المخزون من صفحة المنتج'
        );
      }
      state.products[idx] = fullProduct;
    } else {
      state.products.unshift(fullProduct);
      dbStore.logInventoryMovement(
        prodId,
        fullProduct.name_ar,
        null,
        fullProduct.stock_quantity,
        0,
        fullProduct.stock_quantity,
        'restock',
        'إضافة منتج جديد للمخزون'
      );
    }

    saveState(state);
    dbStore.logAudit(isNew ? 'create' : 'update', 'products', prodId, `حفظ المنتج: ${fullProduct.name_ar}`);
    return fullProduct;
  },
  deleteProduct: (id: string): boolean => {
    const idx = state.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      const p = state.products[idx];
      state.products.splice(idx, 1);
      saveState(state);
      dbStore.logAudit('delete', 'products', id, `حذف المنتج: ${p.name_ar}`);
      return true;
    }
    return false;
  },
  adjustStock: (productId: string, newQuantity: number, reason: string): boolean => {
    const p = state.products.find(prod => prod.id === productId);
    if (!p) return false;
    const oldQty = p.stock_quantity;
    p.stock_quantity = Math.max(0, newQuantity);
    p.updated_at = new Date().toISOString();

    dbStore.logInventoryMovement(
      p.id,
      p.name_ar,
      null,
      p.stock_quantity - oldQty,
      oldQty,
      p.stock_quantity,
      newQuantity > oldQty ? 'restock' : 'adjustment',
      reason
    );

    saveState(state);
    return true;
  },

  // INVENTORY MOVEMENTS LOG
  logInventoryMovement: (
    productId: string,
    productNameAr: string,
    variantId: string | null,
    changeQty: number,
    prevQty: number,
    newQty: number,
    type: 'restock' | 'sale' | 'adjustment' | 'return' | 'damaged',
    notes?: string
  ) => {
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product_id: productId,
      product_name_ar: productNameAr,
      variant_id: variantId,
      change_quantity: changeQty,
      previous_quantity: prevQty,
      new_quantity: newQty,
      movement_type: type,
      notes: notes || '',
      created_by: 'مدير النظام',
      created_at: new Date().toISOString()
    };
    state.inventoryMovements.unshift(movement);
    saveState(state);
  },
  getInventoryMovements: (): InventoryMovement[] => {
    return [...state.inventoryMovements];
  },

  // ORDERS
  getOrders: (): Order[] => {
    return [...state.orders];
  },
  getOrderById: (id: string): Order | undefined => {
    return state.orders.find(o => o.id === id);
  },
  getOrderByNumber: (orderNumber: string): Order | undefined => {
    if (!orderNumber) return undefined;
    const clean = orderNumber.trim().toUpperCase();
    return state.orders.find(o => {
      const num = o.order_number.toUpperCase();
      return num === clean || num === `MSM-${clean}` || num.replace('MSM-', '') === clean;
    });
  },
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status_history'>): Order => {
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `MSM-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    // Deduct stock safely and record movement
    for (const item of orderData.items) {
      const prod = state.products.find(p => p.id === item.product_id);
      if (prod) {
        const oldStock = prod.stock_quantity;
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        prod.sales_count += item.quantity;
        dbStore.logInventoryMovement(
          prod.id,
          prod.name_ar,
          item.variant_id || null,
          -item.quantity,
          oldStock,
          prod.stock_quantity,
          'sale',
          `طلب رقم ${orderNumber}`
        );
      }
    }

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      order_number: orderNumber,
      order_status: 'pending_confirmation',
      payment_status: 'pending',
      created_at: now,
      updated_at: now,
      status_history: [
        {
          id: `hist-${Date.now()}`,
          order_id: orderId,
          from_status: null,
          to_status: 'pending_confirmation',
          notes: 'تم استلام وتوثيق الطلب بنجاح',
          changed_by: 'النظام الآلي',
          created_at: now,
        }
      ]
    };

    // Increment coupon usage count if used
    if (orderData.coupon_code) {
      const usedCoupon = state.coupons.find(c => c.code.toUpperCase() === orderData.coupon_code?.toUpperCase());
      if (usedCoupon) {
        usedCoupon.times_used = (usedCoupon.times_used || 0) + 1;
      }
    }

    state.orders.unshift(newOrder);
    saveState(state);
    dbStore.logAudit('create', 'orders', orderId, `إنشاء طلب جديد رقم ${orderNumber}`);
    return newOrder;
  },
  updateOrderStatus: (
    orderId: string, 
    toStatus: OrderStatus, 
    notes?: string, 
    changedBy = 'مدير المتجر',
    options?: { isDamaged?: boolean }
  ): Order | null => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return null;

    const fromStatus = order.order_status;
    const isNowCancelled = toStatus === 'cancelled' || toStatus === 'returned';
    const wasAlreadyCancelled = fromStatus === 'cancelled' || fromStatus === 'returned';

    // Stock management on cancellation/return
    if (isNowCancelled && !wasAlreadyCancelled) {
      if (options?.isDamaged) {
        // Record damaged items movement without restocking to sellable inventory
        for (const item of order.items) {
          const prod = state.products.find(p => p.id === item.product_id);
          if (prod) {
            dbStore.logInventoryMovement(
              prod.id,
              prod.name_ar,
              item.variant_id || null,
              0, // 0 quantity added back to available stock
              prod.stock_quantity,
              prod.stock_quantity,
              'damaged',
              `طلب ملغي #${order.order_number} - بضاعة تالفة مستبعدة من المخزون`
            );
          }
        }
      } else {
        // Restock to available inventory
        for (const item of order.items) {
          const prod = state.products.find(p => p.id === item.product_id);
          if (prod) {
            const oldStock = prod.stock_quantity;
            prod.stock_quantity += item.quantity;
            prod.sales_count = Math.max(0, prod.sales_count - item.quantity);
            if (item.variant_id && prod.variants) {
              const variant = prod.variants.find(v => v.id === item.variant_id);
              if (variant) {
                variant.stock_quantity = (variant.stock_quantity || 0) + item.quantity;
              }
            }
            dbStore.logInventoryMovement(
              prod.id,
              prod.name_ar,
              item.variant_id || null,
              item.quantity,
              oldStock,
              prod.stock_quantity,
              'return',
              `إرجاع للمخزون إثر إلغاء طلب #${order.order_number}`
            );
          }
        }
      }
    }

    order.order_status = toStatus;
    order.updated_at = new Date().toISOString();

    const noteText = notes 
      ? notes 
      : options?.isDamaged 
      ? `تم إلغاء الطلب وتسجيل البضاعة كتالفة (لم يتم إرجاعها للمخزون)` 
      : isNowCancelled 
      ? `تم إلغاء الطلب واسترجاع الكميات للمخزون تلقائياً` 
      : `تم تحديث الحالة إلى ${toStatus}`;

    if (!order.status_history) order.status_history = [];
    order.status_history.unshift({
      id: `hist-${Date.now()}`,
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      notes: noteText,
      changed_by: changedBy,
      created_at: new Date().toISOString()
    });

    saveState(state);
    dbStore.logAudit('update', 'orders', orderId, `تحديث حالة الطلب ${order.order_number} إلى ${toStatus}`);
    return order;
  },

  // PRINT SERVICES & REQUESTS
  getPrintServices: (): PrintService[] => {
    return [...state.printServices];
  },
  getPrintServiceBySlug: (slug: string): PrintService | undefined => {
    return state.printServices.find(s => s.slug === slug);
  },
  savePrintService: (service: Partial<PrintService> & { name_ar: string; slug: string }): PrintService => {
    const servId = service.id || `ps-${Date.now()}`;
    const newService: PrintService = {
      id: servId,
      name_ar: service.name_ar,
      name_en: service.name_en,
      slug: service.slug,
      description_ar: service.description_ar || service.name_ar,
      image_url: service.image_url,
      pricing_model: service.pricing_model || 'per_unit',
      base_price_egp: Number(service.base_price_egp ?? 0),
      min_order_price_egp: Number(service.min_order_price_egp ?? 0),
      turnaround_hours: Number(service.turnaround_hours ?? 24),
      requires_file_upload: service.requires_file_upload ?? true,
      is_active: service.is_active ?? true,
      sort_order: service.sort_order ?? 0,
      options: service.options || [],
    };
    const idx = state.printServices.findIndex(s => s.id === servId);
    if (idx >= 0) {
      state.printServices[idx] = newService;
    } else {
      state.printServices.push(newService);
    }
    saveState(state);
    return newService;
  },
  deletePrintService: (id: string): boolean => {
    const idx = state.printServices.findIndex(s => s.id === id);
    if (idx >= 0) {
      const name = state.printServices[idx].name_ar;
      state.printServices.splice(idx, 1);
      saveState(state);
      dbStore.logAudit('delete', 'print_services', id, `حذف خدمة الطباعة: ${name}`);
      return true;
    }
    return false;
  },
  getPrintRequests: (): PrintRequest[] => {
    return [...state.printRequests];
  },
  getPrintRequestById: (id: string): PrintRequest | undefined => {
    return state.printRequests.find(r => r.id === id);
  },
  getPrintRequestByNumber: (reqNumber: string): PrintRequest | undefined => {
    return state.printRequests.find(r => r.request_number.toUpperCase() === reqNumber.toUpperCase());
  },
  createPrintRequest: (requestData: Omit<PrintRequest, 'id' | 'request_number' | 'created_at' | 'updated_at'>): PrintRequest => {
    const reqId = `preq-${Date.now()}`;
    const reqNumber = `PRNT-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const service = state.printServices.find(s => s.id === requestData.service_id);

    const newReq: PrintRequest = {
      ...requestData,
      id: reqId,
      request_number: reqNumber,
      service: service,
      status: 'new',
      created_at: now,
      updated_at: now,
    };

    state.printRequests.unshift(newReq);
    saveState(state);
    dbStore.logAudit('create', 'print_requests', reqId, `تقديم طلب طباعة جديد رقم ${reqNumber}`);
    return newReq;
  },
  updatePrintRequestStatus: (reqId: string, toStatus: PrintStatus, finalQuote?: number, internalNotes?: string): PrintRequest | null => {
    const req = state.printRequests.find(r => r.id === reqId);
    if (!req) return null;

    req.status = toStatus;
    if (finalQuote !== undefined) req.final_quote_egp = finalQuote;
    if (internalNotes) req.internal_notes = internalNotes;
    req.updated_at = new Date().toISOString();

    saveState(state);
    dbStore.logAudit('update', 'print_requests', reqId, `تحديث حالة طلب الطباعة ${req.request_number} إلى ${toStatus}`);
    return req;
  },

  // BANNERS & SECTIONS
  getBanners: (): Banner[] => {
    return [...state.banners];
  },
  saveBanner: (banner: Partial<Banner> & { image_desktop_url: string; link_url: string }): Banner => {
    const bannerId = banner.id || `b-${Date.now()}`;
    const newBanner: Banner = {
      id: bannerId,
      title_ar: banner.title_ar,
      subtitle_ar: banner.subtitle_ar,
      image_desktop_url: banner.image_desktop_url,
      image_mobile_url: banner.image_mobile_url || banner.image_desktop_url,
      link_url: banner.link_url,
      cta_text_ar: banner.cta_text_ar,
      sort_order: banner.sort_order ?? 0,
      is_active: banner.is_active ?? true,
    };
    const idx = state.banners.findIndex(b => b.id === bannerId);
    if (idx >= 0) {
      state.banners[idx] = newBanner;
    } else {
      state.banners.push(newBanner);
    }
    saveState(state);
    return newBanner;
  },
  deleteBanner: (id: string): boolean => {
    const idx = state.banners.findIndex(b => b.id === id);
    if (idx >= 0) {
      state.banners.splice(idx, 1);
      saveState(state);
      return true;
    }
    return false;
  },
  getHomepageSections: (): HomepageSection[] => {
    return [...state.homepageSections].sort((a, b) => a.sort_order - b.sort_order);
  },
  updateHomepageSection: (sectionKey: string, updates: Partial<HomepageSection>): boolean => {
    const sec = state.homepageSections.find(s => s.section_key === sectionKey);
    if (!sec) return false;
    const mergedUpdates = { ...updates };
    if (updates.is_visible !== undefined && updates.is_enabled === undefined) {
      mergedUpdates.is_enabled = updates.is_visible;
    } else if (updates.is_enabled !== undefined && updates.is_visible === undefined) {
      mergedUpdates.is_visible = updates.is_enabled;
    }
    Object.assign(sec, mergedUpdates);
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_content_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
    return true;
  },
  saveHomepageSections: (sections: HomepageSection[]): void => {
    state.homepageSections = [...sections];
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_content_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
  },
  resetHomepageSectionsToDefault: (): HomepageSection[] => {
    state.homepageSections = clone(INITIAL_HOMEPAGE_SECTIONS);
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_content_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
    return [...state.homepageSections];
  },

  // CMS PAGES
  getCmsPages: (): CmsPage[] => {
    return [...state.cmsPages];
  },
  getCmsPageBySlug: (slug: string): CmsPage | undefined => {
    return state.cmsPages.find(p => p.slug === slug);
  },
  saveCmsPage: (page: Partial<CmsPage> & { slug: string; title_ar: string; content_ar: string }): CmsPage => {
    const pId = page.id || `page-${Date.now()}`;
    const newPage: CmsPage = {
      id: pId,
      slug: page.slug,
      title_ar: page.title_ar,
      content_ar: page.content_ar,
      is_published: page.is_published ?? true,
      updated_at: new Date().toISOString()
    };
    const idx = state.cmsPages.findIndex(p => p.slug === page.slug);
    if (idx >= 0) {
      state.cmsPages[idx] = newPage;
    } else {
      state.cmsPages.push(newPage);
    }
    saveState(state);
    return newPage;
  },
  deleteCmsPage: (id: string): boolean => {
    const idx = state.cmsPages.findIndex(p => p.id === id);
    if (idx >= 0) {
      const title = state.cmsPages[idx].title_ar;
      state.cmsPages.splice(idx, 1);
      saveState(state);
      dbStore.logAudit('delete', 'cms_pages', id, `حذف صفحة تعريفية: ${title}`);
      return true;
    }
    return false;
  },

  // COUPONS
  getCoupons: (): Coupon[] => {
    return [...state.coupons];
  },
  saveCoupon: (coupon: Partial<Coupon> & { code: string; discount_type: 'percentage' | 'fixed_amount'; discount_value: number }): Coupon => {
    const coupId = coupon.id || `cpn-${Date.now()}`;
    const newCoupon: Coupon = {
      id: coupId,
      code: coupon.code.toUpperCase().trim(),
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      min_order_value_egp: Number(coupon.min_order_value_egp || 0),
      max_discount_egp: coupon.max_discount_egp ? Number(coupon.max_discount_egp) : undefined,
      starts_at: coupon.starts_at,
      expires_at: coupon.expires_at,
      usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : undefined,
      times_used: Number(coupon.times_used || 0),
      is_active: coupon.is_active ?? true,
    };
    const idx = state.coupons.findIndex(c => c.id === coupId);
    if (idx >= 0) {
      state.coupons[idx] = newCoupon;
    } else {
      state.coupons.unshift(newCoupon);
    }
    saveState(state);
    dbStore.logAudit('save', 'coupons', coupId, `حفظ كوبون الخصم: ${newCoupon.code}`);
    return newCoupon;
  },
  deleteCoupon: (id: string): boolean => {
    const idx = state.coupons.findIndex(c => c.id === id);
    if (idx >= 0) {
      const code = state.coupons[idx].code;
      state.coupons.splice(idx, 1);
      saveState(state);
      dbStore.logAudit('delete', 'coupons', id, `حذف كوبون الخصم: ${code}`);
      return true;
    }
    return false;
  },
  validateCoupon: (code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discount: number; error?: string } => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      return { valid: false, discount: 0, error: 'يرجى إدخال كود الخصم أولاً' };
    }
    const coupon = state.coupons.find(c => c.code.toUpperCase() === trimmedCode);
    if (!coupon) {
      return { valid: false, discount: 0, error: 'كود الخصم غير موجود، يرجى التأكد من كتابة الرمز بشكل صحيح' };
    }
    if (!coupon.is_active) {
      return { valid: false, discount: 0, error: 'عفواً، تم إيقاف تفعيل هذا الكوبون من قبل الإدارة' };
    }
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { valid: false, discount: 0, error: 'عفواً، لم يبدأ موعد سريان هذا الكوبون بعد' };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { valid: false, discount: 0, error: 'عفواً، انتهت صلاحية هذا الكوبون ولم يعد متاحاً' };
    }
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { valid: false, discount: 0, error: 'عفواً، تم استنفاد الحد الأقصى لمرات استخدام هذا الكوبون' };
    }
    if (subtotal < coupon.min_order_value_egp) {
      return { 
        valid: false, 
        discount: 0, 
        error: `الحد الأدنى لقيمة المشتريات لتفعيل هذا الكوبون هو ${coupon.min_order_value_egp} ج.م (المجموع الحالي: ${subtotal} ج.م)` 
      };
    }
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_egp && discount > coupon.max_discount_egp) {
        discount = coupon.max_discount_egp;
      }
    } else {
      discount = coupon.discount_value;
    }
    discount = Math.round(Math.min(discount, subtotal) * 100) / 100;
    return { valid: true, coupon, discount };
  },

  // AUDIT LOGS
  logAudit: (action: string, entity_name: string, entity_id: string, details: string, actor = 'مدير النظام') => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      entity_name,
      entity_id,
      actor_name: actor,
      details_json: { message: details },
      created_at: new Date().toISOString()
    };
    state.auditLogs.unshift(log);
    // Keep max 200 logs
    if (state.auditLogs.length > 200) state.auditLogs.pop();
    saveState(state);
  },
  getAuditLogs: (): AuditLog[] => {
    return [...state.auditLogs];
  },

  // NAVIGATION MANAGER
  getNavItems: (): NavItem[] => {
    return [...state.navItems].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },
  saveNavItems: (items: NavItem[]): void => {
    state.navItems = [...items];
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_nav_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
  },
  updateNavItem: (id: string, updates: Partial<NavItem>): boolean => {
    const item = state.navItems.find(i => i.id === id);
    if (!item) return false;
    Object.assign(item, updates);
    dbStore.saveNavItems(state.navItems);
    return true;
  },
  deleteNavItem: (id: string): boolean => {
    const idx = state.navItems.findIndex(i => i.id === id);
    if (idx >= 0) {
      state.navItems.splice(idx, 1);
      dbStore.saveNavItems(state.navItems);
      return true;
    }
    return false;
  },
  resetNavItemsToDefault: (): NavItem[] => {
    state.navItems = clone(INITIAL_NAV_ITEMS);
    dbStore.saveNavItems(state.navItems);
    return [...state.navItems];
  },

  // SMART DISCOUNT CAMPAIGNS
  getDiscountCampaigns: (): SmartDiscountCampaign[] => {
    return [...(state.discountCampaigns || [])];
  },
  saveDiscountCampaign: (campaign: Partial<SmartDiscountCampaign> & { name: string; scope: any; discount_type: any; discount_value: number }): SmartDiscountCampaign => {
    if (!state.discountCampaigns) state.discountCampaigns = [];
    const id = campaign.id || `camp-${Date.now()}`;
    const newCamp: SmartDiscountCampaign = {
      id,
      name: campaign.name,
      scope: campaign.scope,
      target_category_id: campaign.target_category_id,
      target_product_ids: campaign.target_product_ids || [],
      excluded_product_ids: campaign.excluded_product_ids || [],
      discount_type: campaign.discount_type,
      discount_value: Number(campaign.discount_value),
      starts_at: campaign.starts_at,
      expires_at: campaign.expires_at,
      is_active: campaign.is_active ?? true,
      applied_count: campaign.applied_count || 0,
      created_at: campaign.created_at || new Date().toISOString()
    };

    const idx = state.discountCampaigns.findIndex(c => c.id === id);
    if (idx >= 0) {
      state.discountCampaigns[idx] = newCamp;
    } else {
      state.discountCampaigns.unshift(newCamp);
    }

    saveState(state);
    dbStore.logAudit(idx >= 0 ? 'update' : 'create', 'promotions', id, `حفظ حملة التخفيضات: ${newCamp.name}`);
    return newCamp;
  },
  applyDiscountCampaign: (campaignId: string): { success: boolean; affectedCount: number } => {
    const campaign = (state.discountCampaigns || []).find(c => c.id === campaignId);
    if (!campaign) return { success: false, affectedCount: 0 };

    let affectedCount = 0;
    const excludedIds = new Set(campaign.excluded_product_ids || []);
    const targetIds = new Set(campaign.target_product_ids || []);
    const snapshot: Record<string, number> = {};

    state.products.forEach(prod => {
      let matches = false;
      if (campaign.scope === 'all_categories') {
        matches = !excludedIds.has(prod.id);
      } else if (campaign.scope === 'specific_category') {
        matches = (prod.category_id === campaign.target_category_id) && !excludedIds.has(prod.id);
      } else if (campaign.scope === 'specific_products') {
        matches = targetIds.has(prod.id);
      } else if (campaign.scope === 'all_except_products') {
        matches = !excludedIds.has(prod.id);
      } else if (campaign.scope === 'category_except_products') {
        matches = (prod.category_id === campaign.target_category_id) && !excludedIds.has(prod.id);
      }

      if (matches) {
        snapshot[prod.id] = prod.price_egp;
        // Store base original price if not already set or if original <= current price
        if (!prod.original_price_egp || prod.original_price_egp <= prod.price_egp) {
          prod.original_price_egp = prod.price_egp;
        }
        const base = prod.original_price_egp;
        let newPrice = prod.price_egp;
        if (campaign.discount_type === 'percentage') {
          newPrice = Math.max(1, Math.round(base * (1 - campaign.discount_value / 100)));
        } else {
          newPrice = Math.max(1, Math.round(base - campaign.discount_value));
        }
        prod.price_egp = newPrice;
        affectedCount++;
      }
    });

    campaign.snapshot_prices = snapshot;
    campaign.is_active = true;
    campaign.applied_count = affectedCount;
    saveState(state);
    dbStore.logAudit('apply', 'promotions', campaignId, `تطبيق حملة التخفيضات ${campaign.name} على ${affectedCount} منتج`);
    return { success: true, affectedCount };
  },
  rollbackDiscountCampaign: (campaignId: string): boolean => {
    const campaign = (state.discountCampaigns || []).find(c => c.id === campaignId);
    if (!campaign) return false;

    if (campaign.snapshot_prices && Object.keys(campaign.snapshot_prices).length > 0) {
      Object.entries(campaign.snapshot_prices).forEach(([prodId, previousPrice]) => {
        const prod = state.products.find(p => p.id === prodId);
        if (prod) {
          prod.price_egp = previousPrice;
        }
      });
    } else {
      const excludedIds = new Set(campaign.excluded_product_ids || []);
      const targetIds = new Set(campaign.target_product_ids || []);

      state.products.forEach(prod => {
        let matches = false;
        if (campaign.scope === 'all_categories' || campaign.scope === 'all_except_products') {
          matches = !excludedIds.has(prod.id);
        } else if (campaign.scope === 'specific_category' || campaign.scope === 'category_except_products') {
          matches = (prod.category_id === campaign.target_category_id) && !excludedIds.has(prod.id);
        } else if (campaign.scope === 'specific_products') {
          matches = targetIds.has(prod.id);
        }

        if (matches && prod.original_price_egp) {
          prod.price_egp = prod.original_price_egp;
        }
      });
    }

    campaign.is_active = false;
    saveState(state);
    dbStore.logAudit('rollback', 'promotions', campaignId, `إلغاء واستعادة أسعار حملة ${campaign.name}`);
    return true;
  },
  deleteDiscountCampaign: (campaignId: string): boolean => {
    if (!state.discountCampaigns) return false;
    const idx = state.discountCampaigns.findIndex(c => c.id === campaignId);
    if (idx >= 0) {
      const camp = state.discountCampaigns[idx];
      if (camp.is_active) {
        dbStore.rollbackDiscountCampaign(campaignId);
      }
      state.discountCampaigns.splice(idx, 1);
      saveState(state);
      dbStore.logAudit('delete', 'promotions', campaignId, `حذف حملة التخفيضات ${camp.name}`);
      return true;
    }
    return false;
  },

  // STAFF MANAGEMENT
  getStaffMembers: (): StaffMember[] => {
    return [...state.staffMembers];
  },
  createStaffMember: (member: Omit<StaffMember, 'id'> | Partial<StaffMember>): StaffMember => {
    const newMember: StaffMember = {
      id: `usr-${Date.now()}`,
      name: member.name || 'موظف جديد',
      email: member.email || '',
      phone: member.phone || '',
      password: member.password || 'staff123',
      role: member.role || 'catalog_manager',
      permissions: member.permissions && member.permissions.length > 0
        ? member.permissions
        : ['manage_products', 'manage_categories', 'manage_inventory', 'manage_orders'],
      isActive: member.isActive ?? true,
      lastLogin: member.lastLogin || 'لم يسجل دخول بعد',
      created_at: new Date().toISOString()
    };
    state.staffMembers.push(newMember);
    saveState(state);
    dbStore.logAudit('create', 'staff', newMember.id, `إضافة موظف جديد: ${newMember.name} بدور ${newMember.role}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_staff_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
    return newMember;
  },
  updateStaffMember: (id: string, updates: Partial<StaffMember>): boolean => {
    const member = state.staffMembers.find(m => m.id === id);
    if (!member) return false;
    Object.assign(member, updates);
    saveState(state);
    dbStore.logAudit('update', 'staff', id, `تعديل بيانات وصلاحيات الموظف: ${member.name}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_staff_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
    return true;
  },
  deleteStaffMember: (id: string): boolean => {
    const idx = state.staffMembers.findIndex(m => m.id === id);
    if (idx >= 0) {
      const name = state.staffMembers[idx].name;
      state.staffMembers.splice(idx, 1);
      saveState(state);
      dbStore.logAudit('delete', 'staff', id, `حذف الموظف: ${name}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('al_mostafa_staff_updated'));
        window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
      }
      return true;
    }
    return false;
  },
  resetStaffToDefaults: (): StaffMember[] => {
    state.staffMembers = clone(INITIAL_STAFF);
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_staff_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
    return [...state.staffMembers];
  },

  // BACKUP & WIPE DATA
  exportBackup: (): string => {
    return JSON.stringify(state, null, 2);
  },
  importBackup: (jsonContent: string): { success: boolean; error?: string } => {
    try {
      const imported = JSON.parse(jsonContent);
      if (!imported || typeof imported !== 'object') {
        return { success: false, error: 'ملف النسخة الاحتياطية غير صالح' };
      }
      if (!Array.isArray(imported.products) || !Array.isArray(imported.categories)) {
        return { success: false, error: 'الملف لا يحتوي على هيكل بيانات متجر مول المصطفى' };
      }
      state = {
        settings: imported.settings || cloneObject(INITIAL_SETTINGS),
        categories: imported.categories || clone(INITIAL_CATEGORIES),
        brands: imported.brands || clone(INITIAL_BRANDS),
        products: imported.products || clone(INITIAL_PRODUCTS),
        printServices: imported.printServices || clone(INITIAL_PRINT_SERVICES),
        banners: imported.banners || clone(INITIAL_BANNERS),
        homepageSections: imported.homepageSections || clone(INITIAL_HOMEPAGE_SECTIONS),
        cmsPages: imported.cmsPages || clone(INITIAL_CMS_PAGES),
        orders: imported.orders || [],
        printRequests: imported.printRequests || [],
        coupons: imported.coupons || clone(INITIAL_COUPONS),
        discountCampaigns: imported.discountCampaigns || [],
        inventoryMovements: imported.inventoryMovements || [],
        auditLogs: imported.auditLogs || [],
        navItems: imported.navItems || clone(INITIAL_NAV_ITEMS),
        staffMembers: imported.staffMembers || clone(INITIAL_STAFF),
        registeredUsers: imported.registeredUsers || [],
      };
      saveState(state);
      try {
        localStorage.setItem('al_mostafa_registered_users_v2', JSON.stringify(state.registeredUsers));
      } catch {}
      dbStore.logAudit('import', 'system', 'backup', 'استعادة نسخة احتياطية محلية');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطأ أثناء قراءة ملف النسخة الاحتياطية' };
    }
  },
  wipeMockData: (clearProducts = false): { success: boolean } => {
    state.orders = [];
    state.printRequests = [];
    state.inventoryMovements = [];
    state.auditLogs = [];
    if (clearProducts) {
      state.products = [];
    }
    saveState(state);
    dbStore.logAudit('wipe', 'system', 'mock_data', clearProducts ? 'مسح بيانات العمليات والمنتجات التجريبية' : 'مسح سجلات الطلبات والعمليات التجريبية مع الحفاظ على الأقسام والهيكل');
    return { success: true };
  },

  // REGISTERED CUSTOMERS / USERS MANAGEMENT
  getRegisteredUsers: (): Array<UserProfile & { password?: string }> => {
    return [...(state.registeredUsers || [])];
  },
  saveRegisteredUser: (user: UserProfile & { password?: string }): UserProfile => {
    if (!state.registeredUsers) state.registeredUsers = [];
    const idx = state.registeredUsers.findIndex(u => u.id === user.id || (user.email && u.email === user.email));
    if (idx >= 0) {
      state.registeredUsers[idx] = { ...state.registeredUsers[idx], ...user };
    } else {
      state.registeredUsers.push({ ...user });
    }
    saveState(state);
    try {
      localStorage.setItem('al_mostafa_registered_users_v2', JSON.stringify(state.registeredUsers));
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('al_mostafa_users_updated'));
      window.dispatchEvent(new CustomEvent('al_mostafa_db_updated'));
    }
    const { password: _, ...cleanProfile } = user;
    return cleanProfile;
  },
  findRegisteredUser: (identifier: string): (UserProfile & { password?: string }) | undefined => {
    const clean = identifier.trim().toLowerCase();
    return (state.registeredUsers || []).find(u => 
      u.email.toLowerCase() === clean || 
      (u.phone && u.phone.trim() === clean)
    );
  }
};
