import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { formatCurrencyEGP } from '../../utils/formatters';
import { Product } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  AlertCircle,
  Save,
  CheckCircle2,
  Sliders,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => dbStore.getProducts());
  const categories = useMemo(() => dbStore.getCategories(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'active' | 'low_stock' | 'out_of_stock' | 'discounted'>('all');
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  // In-line editing state for individual rows
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [rowDraft, setRowDraft] = useState<{
    price_egp: number;
    original_price_egp: number | undefined;
    stock_quantity: number;
  }>({ price_egp: 0, original_price_egp: undefined, stock_quantity: 0 });

  // Bulk edit draft map for table-wide quick edit
  const [bulkDrafts, setBulkDrafts] = useState<Record<string, {
    price_egp: number;
    original_price_egp?: number;
    stock_quantity: number;
  }>>({});

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter(p => p.is_active).length;
    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
    const outOfStockCount = products.filter(p => p.stock_quantity <= 0).length;
    const totalValuation = products.reduce((sum, p) => sum + (p.price_egp * p.stock_quantity), 0);

    return { total, activeCount, lowStockCount, outOfStockCount, totalValuation };
  }, [products]);

  // Filtered Products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name_ar.includes(searchTerm) || 
                          (p.name_en && p.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCat === 'all' || p.category_id === selectedCat;
      
      let matchStock = true;
      if (stockFilter === 'active') matchStock = p.is_active;
      else if (stockFilter === 'low_stock') matchStock = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
      else if (stockFilter === 'out_of_stock') matchStock = p.stock_quantity <= 0;
      else if (stockFilter === 'discounted') matchStock = Boolean(p.original_price_egp && p.original_price_egp > p.price_egp);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchTerm, selectedCat, stockFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${name}" نهائياً من الكتالوج؟`)) {
      dbStore.deleteProduct(id);
      setProducts(dbStore.getProducts());
    }
  };

  const handleToggleActive = (product: Product) => {
    dbStore.saveProduct({
      ...product,
      is_active: !product.is_active,
    });
    setProducts(dbStore.getProducts());
  };

  // Start single-row inline edit
  const startRowEdit = (product: Product) => {
    setEditingRowId(product.id);
    setRowDraft({
      price_egp: product.price_egp,
      original_price_egp: product.original_price_egp,
      stock_quantity: product.stock_quantity,
    });
  };

  // Cancel single-row inline edit
  const cancelRowEdit = () => {
    setEditingRowId(null);
  };

  // Save single-row inline edit
  const saveRowEdit = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    dbStore.saveProduct({
      ...product,
      price_egp: Number(rowDraft.price_egp) || product.price_egp,
      original_price_egp: rowDraft.original_price_egp ? Number(rowDraft.original_price_egp) : undefined,
      stock_quantity: Number(rowDraft.stock_quantity) >= 0 ? Number(rowDraft.stock_quantity) : product.stock_quantity,
    });

    setProducts(dbStore.getProducts());
    setEditingRowId(null);
    setSaveSuccessId(productId);
    setTimeout(() => setSaveSuccessId(null), 2500);
  };

  // Handle Bulk Quick Edit Inputs
  const handleBulkDraftChange = (productId: string, field: 'price_egp' | 'original_price_egp' | 'stock_quantity', val: number | undefined) => {
    const existing = bulkDrafts[productId] || {
      price_egp: products.find(p => p.id === productId)?.price_egp || 0,
      original_price_egp: products.find(p => p.id === productId)?.original_price_egp,
      stock_quantity: products.find(p => p.id === productId)?.stock_quantity || 0,
    };

    setBulkDrafts(prev => ({
      ...prev,
      [productId]: {
        ...existing,
        [field]: val,
      }
    }));
  };

  // Save specific product from bulk quick edit
  const saveBulkProduct = (productId: string) => {
    const draft = bulkDrafts[productId];
    const product = products.find(p => p.id === productId);
    if (!product || !draft) return;

    dbStore.saveProduct({
      ...product,
      price_egp: Number(draft.price_egp) || product.price_egp,
      original_price_egp: draft.original_price_egp ? Number(draft.original_price_egp) : undefined,
      stock_quantity: Number(draft.stock_quantity) >= 0 ? Number(draft.stock_quantity) : product.stock_quantity,
    });

    setProducts(dbStore.getProducts());
    setSaveSuccessId(productId);
    setTimeout(() => setSaveSuccessId(null), 2500);
  };

  // Save all modified bulk drafts at once
  const saveAllBulkDrafts = () => {
    const draftIds = Object.keys(bulkDrafts);
    if (draftIds.length === 0) {
      alert('لم تقم بتعديل أي منتجات بعد.');
      return;
    }

    draftIds.forEach(id => {
      const draft = bulkDrafts[id];
      const product = products.find(p => p.id === id);
      if (product && draft) {
        dbStore.saveProduct({
          ...product,
          price_egp: Number(draft.price_egp) || product.price_egp,
          original_price_egp: draft.original_price_egp ? Number(draft.original_price_egp) : undefined,
          stock_quantity: Number(draft.stock_quantity) >= 0 ? Number(draft.stock_quantity) : product.stock_quantity,
        });
      }
    });

    setProducts(dbStore.getProducts());
    setBulkDrafts({});
    setIsQuickEditMode(false);
    alert(`تم حفظ التعديلات بنجاح على ${draftIds.length} منتج!`);
  };

  return (
    <div className="space-y-6 text-right font-arabic">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              إدارة الكتالوج والمنتجات ({products.length})
            </h1>
            <span className="text-[11px] bg-gold-500/20 text-gold-700 font-bold px-2.5 py-0.5 rounded-full border border-gold-400/40">
              ERP Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            تحكم كامل في الأسعار، نسب الخصومات، أرصدة المخازن، والبيانات الوصفية لمنتجات المول
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Edit Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsQuickEditMode(!isQuickEditMode);
              setEditingRowId(null);
            }}
            className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isQuickEditMode
                ? 'bg-mall-900 text-gold-400 border border-gold-500'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isQuickEditMode ? 'إغلاق التعديل السريع' : 'وضع التعديل السريع (ERP)'}</span>
          </button>

          {isQuickEditMode && Object.keys(bulkDrafts).length > 0 && (
            <button
              type="button"
              onClick={saveAllBulkDrafts}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs animate-bounce"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الكل ({Object.keys(bulkDrafts).length})</span>
            </button>
          )}

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-black rounded-xl text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </Link>
        </div>
      </div>

      {/* Real-time Inventory Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] text-gray-500 block">إجمالي المنتجات</span>
          <span className="text-xl font-black text-gray-900 mt-1 block">{metrics.total}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] text-emerald-600 block">المنتجات المعروضة</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{metrics.activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] text-amber-600 block">تنبيهات نقص المخزون</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{metrics.lowStockCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] text-rose-600 block">منتجات نفدت</span>
          <span className="text-xl font-black text-rose-700 mt-1 block">{metrics.outOfStockCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-mall-700 block">قيمة البضاعة التقديرية</span>
          <span className="text-sm sm:text-base font-black text-mall-950 mt-1 block truncate">
            {formatCurrencyEGP(metrics.totalValuation)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم المنتج، الكود SKU، أو الماركة..."
              className="w-full text-xs p-2.5 ps-9 pe-4 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-64 text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="all">جميع الأقسام والفئات</option>
            {categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <option value={cat.id} className="font-bold">{cat.name_ar}</option>
                {cat.children?.map(sub => (
                  <option key={sub.id} value={sub.id}>&nbsp;&nbsp;— {sub.name_ar}</option>
                ))}
              </React.Fragment>
            ))}
          </select>
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-50 text-xs">
          <span className="text-gray-400 text-[11px] font-bold">الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'النشطة فقط' },
            { id: 'low_stock', label: 'مخزون منخفض' },
            { id: 'out_of_stock', label: 'نفدت من المخزن' },
            { id: 'discounted', label: 'عليها عروض وتخفيضات' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStockFilter(tab.id as typeof stockFilter)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                stockFilter === tab.id
                  ? 'bg-mall-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table with Inline Fast ERP Edits */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right divide-y divide-gray-100">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">صورة المنتج</th>
                <th className="py-3.5 px-4">اسم المنتج</th>
                <th className="py-3.5 px-4">كود SKU</th>
                <th className="py-3.5 px-4">السعر الحالي (ج.م)</th>
                <th className="py-3.5 px-4">السعر الأصلي (ج.م)</th>
                <th className="py-3.5 px-4">الكمية بالمخزن</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    لا توجد منتجات مطابقة لخيارات البحث المحددة
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isLow = product.stock_quantity <= product.low_stock_threshold;
                  const isOut = product.stock_quantity <= 0;
                  const isEditingThisRow = editingRowId === product.id;
                  const isSavedRecently = saveSuccessId === product.id;
                  const bulkDraft = bulkDrafts[product.id];

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isSavedRecently ? 'bg-green-50/70 transition-all duration-700' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <td className="py-3 px-4">
                        <img
                          src={product.images[0]?.image_url}
                          alt=""
                          className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white p-1"
                        />
                      </td>

                      {/* Name & Brand */}
                      <td className="py-3 px-4 font-bold text-gray-900 max-w-xs">
                        <span className="line-clamp-2">{product.name_ar}</span>
                        {product.brand && (
                          <span className="text-[10px] text-gold-600 block mt-0.5">{product.brand.name_ar}</span>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {product.sku}
                      </td>

                      {/* Current Selling Price */}
                      <td className="py-3 px-4 font-black">
                        {isQuickEditMode ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={bulkDraft?.price_egp !== undefined ? bulkDraft.price_egp : product.price_egp}
                            onChange={(e) => handleBulkDraftChange(product.id, 'price_egp', Number(e.target.value))}
                            className="w-24 p-1.5 border border-gold-400 rounded-lg text-xs font-bold text-mall-900 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                          />
                        ) : isEditingThisRow ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={rowDraft.price_egp}
                            onChange={(e) => setRowDraft(prev => ({ ...prev, price_egp: Number(e.target.value) }))}
                            className="w-24 p-1.5 border border-gold-400 rounded-lg text-xs font-bold text-mall-900 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                          />
                        ) : (
                          <span className="text-mall-900 font-black">
                            {formatCurrencyEGP(product.price_egp)}
                          </span>
                        )}
                      </td>

                      {/* Original / Strike-through Price */}
                      <td className="py-3 px-4">
                        {isQuickEditMode ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="بدون خصم"
                            value={bulkDraft?.original_price_egp !== undefined ? bulkDraft.original_price_egp : (product.original_price_egp || '')}
                            onChange={(e) => handleBulkDraftChange(product.id, 'original_price_egp', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-24 p-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                          />
                        ) : isEditingThisRow ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="بدون خصم"
                            value={rowDraft.original_price_egp || ''}
                            onChange={(e) => setRowDraft(prev => ({ ...prev, original_price_egp: e.target.value ? Number(e.target.value) : undefined }))}
                            className="w-24 p-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                          />
                        ) : product.original_price_egp && product.original_price_egp > product.price_egp ? (
                          <span className="text-gray-400 line-through text-[11px]">
                            {formatCurrencyEGP(product.original_price_egp)}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4">
                        {isQuickEditMode ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={bulkDraft?.stock_quantity !== undefined ? bulkDraft.stock_quantity : product.stock_quantity}
                            onChange={(e) => handleBulkDraftChange(product.id, 'stock_quantity', Number(e.target.value))}
                            className="w-20 p-1.5 border border-gold-400 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                          />
                        ) : isEditingThisRow ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={rowDraft.stock_quantity}
                            onChange={(e) => setRowDraft(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                            className="w-20 p-1.5 border border-gold-400 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                          />
                        ) : (
                          <div>
                            <span className={`font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-gray-800'}`}>
                              {product.stock_quantity} قطعة
                            </span>
                            {isOut ? (
                              <span className="block text-[9px] text-rose-600 font-bold">نفد من المخزن!</span>
                            ) : isLow ? (
                              <span className="block text-[9px] text-amber-600 font-bold">أوشك على النفاد</span>
                            ) : null}
                          </div>
                        )}
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {product.is_active ? 'معروض بالمتجر' : 'معطل'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isQuickEditMode ? (
                            <button
                              type="button"
                              onClick={() => saveBulkProduct(product.id)}
                              className="p-1.5 text-green-600 hover:text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              title="حفظ تعديل هذا المنتج"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : isEditingThisRow ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveRowEdit(product.id)}
                                className="p-1.5 text-green-600 hover:text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                title="حفظ"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelRowEdit}
                                className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                title="إلغاء"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startRowEdit(product)}
                                className="p-1.5 text-gold-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-colors"
                                title="تعديل سريع للأسعار والمخزون"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <Link
                                to={`/product/${product.slug}`}
                                target="_blank"
                                className="p-1.5 text-gray-400 hover:text-mall-900 rounded-lg hover:bg-gray-100 transition-colors"
                                title="معاينة المنتج"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/admin/products/${product.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="تعديل تفاصيل المنتج والخصائص"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id, product.name_ar)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="حذف المنتج"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
