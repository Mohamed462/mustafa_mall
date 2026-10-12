import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { Order, Product, PrintRequest } from '../../types';
import { formatCurrencyEGP, formatDateArabic } from '../../utils/formatters';
import { normalizeImageUrl, handleImageError, PRODUCT_FALLBACK_IMAGE } from '../../utils/imageUtils';
import { 
  ShoppingCart, 
  Package, 
  Printer, 
  AlertTriangle, 
  ArrowLeft, 
  Plus, 
  Eye, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => dbStore.getOrders());
  const [products, setProducts] = useState<Product[]>(() => dbStore.getProducts());
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>(() => dbStore.getPrintRequests());

  useEffect(() => {
    dbStore.fetchOrdersFromCloud().then(setOrders);

    const handleUpdate = () => {
      setOrders(dbStore.getOrders());
      setProducts(dbStore.getProducts());
      setPrintRequests(dbStore.getPrintRequests());
    };
    window.addEventListener('al_mostafa_orders_updated', handleUpdate);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);

    return () => {
      window.removeEventListener('al_mostafa_orders_updated', handleUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
    };
  }, []);

  // Actual Metrics derived directly from persisted data
  const totalSales = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_egp : 0), 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending_confirmation');
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
  const pendingPrintRequests = printRequests.filter(r => r.status === 'new' || r.status === 'awaiting_quote');

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900">
            لوحة مؤشرات مول المصطفى
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة حية للمبيعات، الطلبات الواردة، حالة المخزون ومركز الطباعة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-gold-500 hover:bg-gold-600 text-mall-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-mall-900 hover:bg-mall-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>معاينة الطلبات</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">إجمالي المبيعات المحصلة</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-mall-900">
            {formatCurrencyEGP(totalSales)}
          </div>
          <p className="text-[11px] text-gray-400">محسوبة من إجمالي الطلبات المدفوعة</p>
        </div>

        {/* Orders awaiting action */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">طلبات بحاجة للمراجعة</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-mall-900">
            {pendingOrders.length} طلبات
          </div>
          <Link to="/admin/orders" className="text-[11px] text-amber-700 font-bold hover:underline inline-block">
            معالجة الطلبات الواردة ←
          </Link>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">تنبيهات المخزون المنخفض</span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-mall-900">
            {lowStockProducts.length} صنفاً
          </div>
          <Link to="/admin/inventory" className="text-[11px] text-red-600 font-bold hover:underline inline-block">
            إدارة المخزون والتوريد ←
          </Link>
        </div>

        {/* Print requests needing review */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">طلبات مركز الطباعة</span>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-mall-900">
            {pendingPrintRequests.length} طلبات
          </div>
          <Link to="/admin/printing/requests" className="text-[11px] text-cyan-700 font-bold hover:underline inline-block">
            مراجعة ملفات الطباعة والمقايسات ←
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders + Recent Print Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-mall-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gold-500" />
              <span>أحدث الطلبات المسجلة</span>
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-gold-600 hover:text-gold-700">
              عرض الكل ({orders.length})
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <ShoppingCart className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
              <p className="text-xs font-bold text-gray-700">لا توجد طلبات مسجلة بعد</p>
              <p className="text-[11px] text-gray-400">ستظهر الطلبات الجديدة هنا فور قيام العملاء بالشراء</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-gray-900">{order.order_number}</strong>
                      <span className="text-gray-500">({order.customer_name})</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {formatDateArabic(order.created_at)} • {order.items.length} أصناف
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-mall-900">
                      {formatCurrencyEGP(order.total_egp)}
                    </span>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gold-50 text-gray-600 hover:text-mall-900"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Print Requests */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-mall-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-600" />
              <span>أحدث طلبات مركز الطباعة</span>
            </h3>
            <Link to="/admin/printing/requests" className="text-xs font-bold text-cyan-600 hover:text-cyan-700">
              عرض الكل ({printRequests.length})
            </Link>
          </div>

          {printRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Printer className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
              <p className="text-xs font-bold text-gray-700">لا توجد طلبات طباعة جديدة</p>
              <p className="text-[11px] text-gray-400">ستظهر طلبات طباعة الأبحاث والبانرات هنا فور تسجيلها</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {printRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-cyan-800">{req.request_number}</strong>
                      <span className="text-gray-800 font-bold">({req.customer_name})</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {req.service?.name_ar || 'خدمة طباعة'} • {req.files.length} ملفات مرفوعة
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">
                      {req.calculated_price_egp ? formatCurrencyEGP(req.calculated_price_egp) : 'مقايسة'}
                    </span>
                    <Link
                      to={`/admin/printing/requests/${req.id}`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-cyan-50 text-gray-600 hover:text-cyan-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Catalog & Low Stock Alert Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-mall-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-mall-900" />
            <span>منتجات قاربت على النفاد (تنبيه إعادة الطلب)</span>
          </h3>
          <Link to="/admin/inventory" className="text-xs font-bold text-gold-600 hover:text-gold-700">
            سجل المخزون الكامل
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="py-6 text-center text-xs text-green-700 font-bold bg-green-50 rounded-2xl">
            مستويات المخزون لجميع المنتجات كافية وآمنة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3">المنتج</th>
                  <th className="py-2.5 px-3">كود SKU</th>
                  <th className="py-2.5 px-3">المخزون الحالي</th>
                  <th className="py-2.5 px-3">حد التنبيه</th>
                  <th className="py-2.5 px-3">السعر</th>
                  <th className="py-2.5 px-3">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-2">
                      <img 
                        src={normalizeImageUrl(p.images[0]?.image_url, PRODUCT_FALLBACK_IMAGE)} 
                        alt="" 
                        onError={handleImageError}
                        className="w-8 h-8 rounded object-cover" 
                      />
                      <span>{p.name_ar}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">{p.sku}</td>
                    <td className="py-2.5 px-3 font-black text-red-600">{p.stock_quantity} قطع</td>
                    <td className="py-2.5 px-3 text-gray-500">{p.low_stock_threshold}</td>
                    <td className="py-2.5 px-3 font-bold text-mall-900">{formatCurrencyEGP(p.price_egp)}</td>
                    <td className="py-2.5 px-3">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="text-xs text-gold-600 hover:underline font-bold"
                      >
                        تعديل / توريد
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
