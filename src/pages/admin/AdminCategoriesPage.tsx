import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Category, DepartmentKey, Product } from '../../types';
import { formatEGP } from '../../utils/formatters';
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  X,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  LayoutGrid,
  Eye,
  Check,
  Sparkles
} from 'lucide-react';

const DEPARTMENTS: { key: DepartmentKey; label: string }[] = [
  { key: 'home_cleaning', label: 'المنزل والتنظيف' },
  { key: 'electronics', label: 'الإلكترونيات وإكسسوارات الموبايل' },
  { key: 'stationery', label: 'المكتبي والمدرسي' },
  { key: 'toys', label: 'الألعاب والهدايا' },
  { key: 'bags', label: 'الشنط' },
  { key: 'accessories', label: 'الإكسسوارات' },
  { key: 'beauty', label: 'التجميل والعناية الشخصية' },
  { key: 'print_center', label: 'مركز الطباعة المتخصص' },
];

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => dbStore.getCategories());
  const [products, setProducts] = useState<Product[]>(() => dbStore.getProducts());
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [expandedCatIds, setExpandedCatIds] = useState<string[]>([]);
  
  // Store Settings (Display Style Control)
  const { settings, updateSettings } = useStoreSettings();
  const currentDisplayStyle = settings.category_display_style || 'images_only';
  const [styleNotice, setStyleNotice] = useState<string | null>(null);

  const handleSelectDisplayStyle = (style: 'images_only' | 'overlay' | 'minimal') => {
    updateSettings({ category_display_style: style });
    const labels = {
      images_only: '🖼️ صور فقط (بوسترات نقية)',
      overlay: '🏷️ نصوص مدمجة (Glass Overlay)',
      minimal: '📱 بطاقات منفصلة (Cards Minimal)',
    };
    setStyleNotice(`تم تحديث نمط عرض الأقسام في المتجر بنجاح إلى: ${labels[style]}`);
    setTimeout(() => setStyleNotice(null), 4000);
  };
  
  // Quick Add Product Modal state
  const [quickAddCat, setQuickAddCat] = useState<Category | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<number>(150);
  const [productStock, setProductStock] = useState<number>(25);
  const [productSku, setProductSku] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [quickAddNotice, setQuickAddNotice] = useState<string | null>(null);

  const reloadData = () => {
    setCategories(dbStore.getCategories());
    setProducts(dbStore.getProducts());
  };

  const toggleExpand = (catId: string) => {
    setExpandedCatIds(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleOpenAddCategory = (parentId?: string, defaultDept?: DepartmentKey) => {
    setEditingCategory({
      parent_id: parentId || null,
      name_ar: '',
      slug: '',
      department_key: defaultDept || 'home_cleaning',
      description_ar: '',
      is_active: true,
      sort_order: 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الفئة "${name}"؟`)) {
      dbStore.deleteCategory(id);
      reloadData();
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name_ar || !editingCategory?.slug) return;

    dbStore.saveCategory({
      id: editingCategory.id,
      parent_id: editingCategory.parent_id,
      name_ar: editingCategory.name_ar,
      slug: editingCategory.slug,
      department_key: editingCategory.department_key as any,
      description_ar: editingCategory.description_ar,
      image_url: editingCategory.image_url,
      custom_link: editingCategory.custom_link,
      hide_title: editingCategory.hide_title ?? false,
      sort_order: editingCategory.sort_order || 0,
      is_active: editingCategory.is_active ?? true,
    });

    reloadData();
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // --- Quick Add Product Handlers ---
  const handleOpenQuickAddProduct = (cat: Category) => {
    setQuickAddCat(cat);
    setProductName('');
    setProductPrice(150);
    setProductStock(25);
    setProductSku(`MSM-${Math.floor(100000 + Math.random() * 900000)}`);
    setProductImage('');
    setProductDesc('');
  };

  const handleSaveQuickProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddCat || !productName.trim()) return;

    const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
    const finalImg = productImage.trim() || defaultImg;
    const generatedSlug = `product-${Date.now()}`;

    dbStore.saveProduct({
      name_ar: productName.trim(),
      slug: generatedSlug,
      category_id: quickAddCat.id,
      price_egp: Number(productPrice),
      stock_quantity: Number(productStock),
      sku: productSku.trim() || `MSM-${Math.floor(100000 + Math.random() * 900000)}`,
      description_ar: productDesc.trim(),
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: '',
          image_url: finalImg,
          is_primary: true,
          sort_order: 0,
        }
      ],
      is_active: true,
      is_featured: false,
    });

    reloadData();
    // Expand category to show the newly added product
    if (!expandedCatIds.includes(quickAddCat.id)) {
      setExpandedCatIds(prev => [...prev, quickAddCat.id]);
    }
    setQuickAddNotice(`تمت إضافة المنتج "${productName.trim()}" إلى قسم ${quickAddCat.name_ar} بنجاح!`);
    setTimeout(() => setQuickAddNotice(null), 3500);
    setQuickAddCat(null);
  };

  const getProductsForCategory = (catId: string) => {
    return products.filter(p => p.category_id === catId);
  };

  return (
    <div className="space-y-6 text-right font-arabic">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900 flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-mall-900" />
            <span>إدارة الأقسام والمنتجات ({categories.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            استعراض المنتجات المندرجة تحت كل قسم وإضافة منتجات مباشرة مع مزامنة المخزون اللحظية
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddCategory()}
          className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Category Display Mode Settings in Storefront */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#08606B]/10 text-[#08606B]">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-base font-black text-mall-900">
                نمط عرض بطاقات الأقسام في واجهة المتجر الرئيسية
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              تحكم بأسلوب عرض صور وأقسام المول للزوار على اللابتوب والموبايل (يتم التطبيق فورياً على المتجر)
            </p>
          </div>

          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5 text-[#08606B]" />
            <span>معاينة المتجر في نافذة جديدة</span>
          </a>
        </div>

        {styleNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{styleNotice}</span>
          </div>
        )}

        {/* 3 Interactive Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Option 1: images_only */}
          <button
            type="button"
            onClick={() => handleSelectDisplayStyle('images_only')}
            className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
              currentDisplayStyle === 'images_only'
                ? 'border-[#08606B] bg-[#08606B]/5 ring-2 ring-[#08606B]/30 shadow-sm'
                : 'border-gray-200 hover:border-[#08606B]/40 hover:bg-gray-50/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm font-black text-[#04383f]">
                  <ImageIcon className="w-4 h-4 text-[#08606B]" />
                  <span>صور فقط (Images Only)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D2D3]/20 text-[#04383f]">
                  الموصى به
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                بوسترات مرئية نقية بدون أي نصوص خارجية (الوضع المفضل للتصاميم والبوسترات المدمج بها خطوط وتصاميم جاهزة).
              </p>
              {/* Visual Mini Preview */}
              <div className="mt-3 h-20 rounded-xl overflow-hidden bg-gray-200 relative border border-gray-300/40">
                <img 
                  src="https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=70" 
                  alt="معاينة صور فقط" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${
                currentDisplayStyle === 'images_only' ? 'text-[#08606B]' : 'text-gray-400'
              }`}>
                {currentDisplayStyle === 'images_only' ? '✓ النمط المعتمد حالياً' : 'انقر للتفعيل'}
              </span>
              {currentDisplayStyle === 'images_only' && (
                <div className="w-5 h-5 rounded-full bg-[#08606B] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          </button>

          {/* Option 2: overlay */}
          <button
            type="button"
            onClick={() => handleSelectDisplayStyle('overlay')}
            className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
              currentDisplayStyle === 'overlay'
                ? 'border-[#08606B] bg-[#08606B]/5 ring-2 ring-[#08606B]/30 shadow-sm'
                : 'border-gray-200 hover:border-[#08606B]/40 hover:bg-gray-50/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm font-black text-[#04383f]">
                  <Layers className="w-4 h-4 text-[#08606B]" />
                  <span>نصوص مدمجة (Glass Overlay)</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                نصوص زجاجية متدرجة تظهر بشكل عصري فوق خلفية الصورة مع سهم التوجيه.
              </p>
              {/* Visual Mini Preview */}
              <div className="mt-3 h-20 rounded-xl overflow-hidden bg-gray-200 relative border border-gray-300/40">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=70" 
                  alt="معاينة نصوص مدمجة" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04383f]/90 via-[#04383f]/40 to-transparent flex items-end p-2 justify-between">
                  <span className="text-[10px] font-bold text-white drop-shadow-xs">اسم القسم</span>
                  <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[8px]">←</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${
                currentDisplayStyle === 'overlay' ? 'text-[#08606B]' : 'text-gray-400'
              }`}>
                {currentDisplayStyle === 'overlay' ? '✓ النمط المعتمد حالياً' : 'انقر للتفعيل'}
              </span>
              {currentDisplayStyle === 'overlay' && (
                <div className="w-5 h-5 rounded-full bg-[#08606B] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          </button>

          {/* Option 3: minimal */}
          <button
            type="button"
            onClick={() => handleSelectDisplayStyle('minimal')}
            className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
              currentDisplayStyle === 'minimal'
                ? 'border-[#08606B] bg-[#08606B]/5 ring-2 ring-[#08606B]/30 shadow-sm'
                : 'border-gray-200 hover:border-[#08606B]/40 hover:bg-gray-50/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm font-black text-[#04383f]">
                  <LayoutGrid className="w-4 h-4 text-[#08606B]" />
                  <span>بطاقات منفصلة (Cards Minimal)</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                تصميم بطاقات متاجر عالمية حيث تأتي الصورة في الأعلى وعنوان القسم وزر التصفح في شريط أبيض أنيق بالأسفل.
              </p>
              {/* Visual Mini Preview */}
              <div className="mt-3 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex flex-col">
                <div className="h-12 bg-gray-200 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=400&q=70" 
                    alt="معاينة بطاقات منفصلة" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-8 px-2 flex items-center justify-between bg-white border-t border-gray-100">
                  <span className="text-[9px] font-bold text-gray-800">اسم القسم</span>
                  <span className="text-[8px] text-[#08606B] font-bold">استعراض ←</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${
                currentDisplayStyle === 'minimal' ? 'text-[#08606B]' : 'text-gray-400'
              }`}>
                {currentDisplayStyle === 'minimal' ? '✓ النمط المعتمد حالياً' : 'انقر للتفعيل'}
              </span>
              {currentDisplayStyle === 'minimal' && (
                <div className="w-5 h-5 rounded-full bg-[#08606B] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {quickAddNotice && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{quickAddNotice}</span>
        </div>
      )}

      {/* Categories Tree & Product Expansion */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catProducts = getProductsForCategory(cat.id);
          const isExpanded = expandedCatIds.includes(cat.id);

          return (
            <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 space-y-4 transition-all">
              {/* Main Category Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-gray-50 text-mall-900 border border-gray-100 font-black text-sm">
                    {cat.name_ar}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-gray-400">/{cat.slug}</span>
                      <span className="text-[10px] bg-mall-100 text-mall-900 font-bold px-2 py-0.5 rounded-full">
                        {cat.department_key}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-600 mt-0.5 block">
                      {catProducts.length} منتجات في هذا القسم
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Add Product Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAddProduct(cat)}
                    className="py-1.5 px-3 bg-gold-50 hover:bg-gold-100 text-mall-950 border border-gold-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    title="إضافة منتج جديد فوراً داخل هذا القسم"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-700" />
                    <span>+ إضافة منتج بالقسم</span>
                  </button>

                  {/* Toggle Products Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(cat.id)}
                    className="py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Package className="w-3.5 h-3.5 text-gray-500" />
                    <span>منتجات القسم ({catProducts.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Add Subcategory */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddCategory(cat.id, cat.department_key)}
                    className="py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>فئة فرعية</span>
                  </button>

                  {/* Edit Category */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1.5 text-gray-400 hover:text-mall-900 rounded-lg cursor-pointer"
                    title="تعديل بيانات القسم"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Category */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name_ar)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="حذف القسم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories list */}
              {cat.children && cat.children.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-4 border-r-2 border-gold-400">
                  {cat.children.map((sub) => {
                    const subProducts = getProductsForCategory(sub.id);
                    return (
                      <div key={sub.id} className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-gray-800 block">{sub.name_ar}</span>
                          <span className="text-[10px] text-gray-400">{subProducts.length} منتجات</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenQuickAddProduct(sub)}
                            className="p-1 text-gold-700 hover:bg-gold-100 rounded"
                            title="إضافة منتج في هذه الفئة الفرعية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(sub)}
                            className="p-1 text-gray-400 hover:text-gold-600 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(sub.id, sub.name_ar)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expanded Products Section inside Category */}
              {isExpanded && (
                <div className="pt-3 border-t border-dashed border-gray-200 animate-fade-in space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-mall-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-mall-900" />
                      <span>قائمة المنتجات التابعة لقسم ({cat.name_ar})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAddProduct(cat)}
                      className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة منتج جديد الآن</span>
                    </button>
                  </div>

                  {catProducts.length === 0 ? (
                    <div className="p-6 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 border border-gray-100">
                      لا توجد منتجات مسجلة في هذا القسم حالياً. استخدم زر "+ إضافة منتج بالقسم" لإدراج أول منتج!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {catProducts.map(prod => (
                        <div key={prod.id} className="p-2.5 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-gold-300 transition-all flex items-center gap-3 shadow-2xs">
                          <img 
                            src={prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'} 
                            alt={prod.name_ar} 
                            className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-gray-100 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-gray-900 block truncate" title={prod.name_ar}>
                              {prod.name_ar}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">SKU: {prod.sku}</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-black text-xs text-green-700">{formatEGP(prod.price_egp)}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                prod.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                المخزون: {prod.stock_quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ==================== QUICK ADD PRODUCT MODAL ==================== */}
      {quickAddCat && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs text-right">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-gold-500" />
                  <span>إضافة منتج سريع في قسم: {quickAddCat.name_ar}</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">سيتم ربط المنتج وتحديث المخزون والكتالوج تلقائياً</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddCat(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickProduct} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم المنتج (بالعربية) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طقم علب حفظ طعام فاخرة 5 قطع"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">سعر البيع (ج.م) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-bold text-green-700 focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">كمية المخزون المتاحة *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productStock}
                    onChange={(e) => setProductStock(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">كود الصنف (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">رابط صورة المنتج</label>
                  <input
                    type="text"
                    placeholder="رابط الصورة (اختياري)"
                    value={productImage}
                    onChange={(e) => setProductImage(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">وصف المنتج (اختياري)</label>
                <textarea
                  rows={2}
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="مواصفات وخامة ومميزات المنتج..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-black rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  إضافة المنتج وتحديث المخزون
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAddCat(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CATEGORY EDIT/ADD MODAL ==================== */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 text-right space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-mall-900 pb-2 border-b border-gray-100">
              {editingCategory.id ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name_ar}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_ar: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">الرابط الدائم (Slug) *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">القسم الرئيسي المتبع له</label>
                <select
                  value={editingCategory.department_key}
                  onChange={(e) => setEditingCategory({ ...editingCategory, department_key: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">رابط صورة الغلاف أو البوستر (Image URL)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... أو /images/banners/..."
                    value={editingCategory.image_url || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                    className="flex-1 text-xs p-2.5 border border-gray-200 rounded-xl font-mono text-left"
                  />
                  {editingCategory.image_url && (
                    <img 
                      src={editingCategory.image_url} 
                      alt="معاينة" 
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">يمكنك وضع رابط صورة أو بوستر جاهز تم تصميمه للقسم.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">رابط التحويل المخصص عند النقر (Target Link)</label>
                <input
                  type="text"
                  placeholder="مثال: /offers أو /print-center أو رابط خارجي (اختياري)"
                  value={editingCategory.custom_link || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, custom_link: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono text-left"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">إذا ترك فارغاً، يتم التوجيه لصفحة تصفح منتجات القسم تلقائياً.</span>
              </div>

              {/* Pure Image / Hide Title Toggle */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.hide_title ?? false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, hide_title: e.target.checked })}
                    className="mt-0.5 rounded text-[#08606B] focus:ring-[#08606B]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">إلغاء الكتابة وعرض كـ (بوستر صور فقط)</span>
                    <span className="text-[11px] text-gray-500 block leading-relaxed">
                      عند التفعيل، لن يظهر اسم القسم أو النص الشفاف فوق الصورة، وسيتم عرض البوستر بصرياً بنقاء 100%، وعند النقر عليه ينقل العميل للرابط المحدد مباشرةً.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">الوصف المختصر</label>
                <textarea
                  rows={2}
                  value={editingCategory.description_ar || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description_ar: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#08606B] hover:bg-[#0b7c8a] text-white rounded-xl text-xs font-black shadow-md shadow-[#08606B]/20 transition-all cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
