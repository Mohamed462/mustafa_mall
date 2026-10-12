import React, { useState, useMemo } from 'react';
import { dbStore } from '../../services/dbStore';
import { formatEGP, formatDateTime } from '../../utils/formatters';
import { normalizeImageUrl, handleImageError, PRODUCT_FALLBACK_IMAGE } from '../../utils/imageUtils';
import { Product, InventoryMovement } from '../../types';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown, 
  PlusCircle, 
  MinusCircle, 
  History, 
  Layers, 
  Filter,
  RefreshCw,
  PackageCheck
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => dbStore.getProducts());
  const [movements, setMovements] = useState<InventoryMovement[]>(() => dbStore.getInventoryMovements());
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out_of_stock' | 'in_stock'>('all');
  
  // Modal for Stock Adjustment
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('توريد بضاعة جديدة (إعادة تموين)');
  const [movementType, setMovementType] = useState<'restock' | 'adjustment' | 'damaged' | 'return'>('restock');

  const reloadData = () => {
    setProducts(dbStore.getProducts());
    setMovements(dbStore.getInventoryMovements());
  };

  // Metrics
  const stats = useMemo(() => {
    const totalSkus = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
    const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
    const inventoryValuation = products.reduce((acc, p) => acc + (p.stock_quantity * (p.cost_price_egp || p.price_egp * 0.7)), 0);

    return { totalSkus, totalUnits, lowStockCount, outOfStockCount, inventoryValuation };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (stockFilter === 'low') {
        return p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
      }
      if (stockFilter === 'out_of_stock') {
        return p.stock_quantity === 0;
      }
      if (stockFilter === 'in_stock') {
        return p.stock_quantity > p.low_stock_threshold;
      }
      return true;
    });
  }, [products, searchQuery, stockFilter]);

  const handleOpenAdjust = (product: Product) => {
    setAdjustingProduct(product);
    setAdjustmentQty(product.stock_quantity);
    setMovementType('restock');
    setAdjustmentReason('توريد بضاعة جديدة للمخزن');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const diff = adjustmentQty - adjustingProduct.stock_quantity;
    if (diff === 0) {
      setAdjustingProduct(null);
      return;
    }

    dbStore.adjustStock(
      adjustingProduct.id, 
      Math.max(0, adjustmentQty), 
      `${adjustmentReason} (نوع الحركة: ${movementType})`
    );

    reloadData();
    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-mall-900" />
            <span>إدارة المخزون وسجل حركات البضائع</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            متابعة دقيقة للأرصدة المتوفرة، تنبيهات النواقص، وتسجيل التوريدات والتسويات المخزنية
          </p>
        </div>

        <button
          type="button"
          onClick={reloadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block">إجمالي المنتجات (SKU)</span>
          <span className="text-2xl font-black text-gray-900 block mt-1">{stats.totalSkus}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">صنف مسجل بالنظام</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block">إجمالي الوحدات بالمخزن</span>
          <span className="text-2xl font-black text-mall-900 block mt-1">{stats.totalUnits.toLocaleString('ar-EG')}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">قطعة متوفرة حالياً</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>أوشكت على النفاد</span>
          </span>
          <span className="text-2xl font-black text-amber-900 block mt-1">{stats.lowStockCount}</span>
          <span className="text-[10px] text-amber-700 mt-0.5 block">تحتاج إعادة طلب عاجلة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-red-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>نفدت تماماً</span>
          </span>
          <span className="text-2xl font-black text-red-900 block mt-1">{stats.outOfStockCount}</span>
          <span className="text-[10px] text-red-700 mt-0.5 block">الرصيد بالمخزن 0</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-gray-500 block">قيمة المخزون المقدرة</span>
          <span className="text-xl font-black text-green-700 block mt-1">{formatEGP(stats.inventoryValuation)}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">تكلفة تقديرية للبضاعة</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-mall-900 text-mall-900'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>جدول أرصدة المنتجات</span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'movements'
              ? 'border-mall-900 text-mall-900'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل حركات المخزون والتوريدات</span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
            {movements.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم المنتج أو كود SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs font-bold text-gray-500 shrink-0">الحالة:</span>
              
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  stockFilter === 'all' ? 'bg-mall-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                الكل ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  stockFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                منخفض ({stats.lowStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  stockFilter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                نافد ({stats.outOfStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('in_stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  stockFilter === 'in_stock' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-800 hover:bg-green-100'
                }`}
              >
                متوفر
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">المنتج</th>
                    <th className="p-3">كود SKU</th>
                    <th className="p-3">سعر البيع</th>
                    <th className="p-3 text-center">الرصيد الحالي</th>
                    <th className="p-3 text-center">حد الأمان</th>
                    <th className="p-3 text-center">حالة المخزون</th>
                    <th className="p-3 text-center">إجراءات المخزن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        لا توجد منتجات تطابق معايير البحث والتصفية
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
                      const isOut = p.stock_quantity === 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={normalizeImageUrl(p.images[0]?.image_url, PRODUCT_FALLBACK_IMAGE)}
                                alt={p.name_ar}
                                onError={handleImageError}
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-gray-900 line-clamp-1 block">{p.name_ar}</span>
                                <span className="text-[10px] text-gray-500">{p.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-gray-600 font-semibold">{p.sku}</td>
                          <td className="p-3 font-bold text-gray-900">{formatEGP(p.price_egp)}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full font-black text-xs ${
                              isOut 
                                ? 'bg-red-100 text-red-800' 
                                : isLow 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="p-3 text-center text-gray-500 font-semibold">{p.low_stock_threshold}</td>
                          <td className="p-3 text-center">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                <XCircle className="w-3 h-3" />
                                <span>نافد</span>
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                <span>أوشك على النفاد</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>متوفر</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenAdjust(p)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-mall-900 text-white rounded-lg text-xs font-bold hover:bg-mall-800 transition-colors shadow-xs"
                            >
                              <ArrowUpDown className="w-3 h-3" />
                              <span>تعديل الرصيد</span>
                            </button>
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
      )}

      {/* TAB 2: Movements Log */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
              <History className="w-4 h-4 text-mall-900" />
              <span>سجل التحركات المخزنية والتدقيق الدوري</span>
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              إجمالي الحركات المسجلة: {movements.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">اسم المنتج</th>
                  <th className="p-3 text-center">نوع الحركة</th>
                  <th className="p-3 text-center">التغيير</th>
                  <th className="p-3 text-center">قبل</th>
                  <th className="p-3 text-center">بعد</th>
                  <th className="p-3">البيان / السبب</th>
                  <th className="p-3">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      لا توجد حركات مخزنية مسجلة بعد
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.change_quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 text-gray-500 whitespace-nowrap font-mono">
                          {formatDateTime(m.created_at)}
                        </td>
                        <td className="p-3 font-bold text-gray-900">{m.product_name_ar}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.movement_type === 'restock' ? 'bg-green-100 text-green-800' :
                            m.movement_type === 'sale' ? 'bg-blue-100 text-blue-800' :
                            m.movement_type === 'damaged' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {m.movement_type === 'restock' && 'إعادة توريد'}
                            {m.movement_type === 'sale' && 'مبيعات طلب'}
                            {m.movement_type === 'damaged' && 'تالف / هالك'}
                            {m.movement_type === 'return' && 'مرتجع عميل'}
                            {m.movement_type === 'adjustment' && 'تسوية جردية'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold font-mono">
                          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {isPositive ? `+${m.change_quantity}` : m.change_quantity}
                          </span>
                        </td>
                        <td className="p-3 text-center text-gray-500 font-mono">{m.previous_quantity}</td>
                        <td className="p-3 text-center font-bold text-gray-900 font-mono">{m.new_quantity}</td>
                        <td className="p-3 text-gray-600">{m.notes || '—'}</td>
                        <td className="p-3 text-gray-500 font-semibold">{m.created_by || 'النظام'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-mall-900" />
                <span>تعديل رصيد المخزون</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setAdjustingProduct(null)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
              <img
                src={normalizeImageUrl(adjustingProduct.images[0]?.image_url, PRODUCT_FALLBACK_IMAGE)}
                alt={adjustingProduct.name_ar}
                onError={handleImageError}
                className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0"
              />
              <div>
                <span className="font-bold text-xs text-gray-900 block line-clamp-1">
                  {adjustingProduct.name_ar}
                </span>
                <span className="text-[10px] text-gray-500">
                  كود: {adjustingProduct.sku} | الرصيد الحالي بالمخزن: <strong className="text-mall-900">{adjustingProduct.stock_quantity}</strong>
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">الرصيد الجديد الفعلي بالمخزن *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustmentQty(q => Math.max(0, q - 1))}
                    className="p-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                  >
                    <MinusCircle className="w-4 h-4 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-xl font-black text-sm focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustmentQty(q => q + 1)}
                    className="p-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                  >
                    <PlusCircle className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                  <span>الفرق: {adjustmentQty - adjustingProduct.stock_quantity} وحدة</span>
                  <span>حد الأمان: {adjustingProduct.low_stock_threshold}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">نوع الحركة *</label>
                <select
                  value={movementType}
                  onChange={(e: any) => setMovementType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                >
                  <option value="restock">إعادة توريد بضاعة جديدة (Restock)</option>
                  <option value="adjustment">تسوية جردية دورية (Adjustment)</option>
                  <option value="damaged">تسجيل تالف أو هالك بالمخزن (Damaged)</option>
                  <option value="return">إعادة منتج مرتجع من عميل (Return)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">بيان وسبب التعديل *</label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="مثال: فاتورة توريد رقم 5412 من المورد"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-mall-900 text-white rounded-xl font-bold hover:bg-mall-800 transition-colors"
                >
                  حفظ وتوثيق الحركة
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
