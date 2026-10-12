import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatCurrencyEGP, formatDateArabic, normalizeEgyptianPhone, normalizeArabicDigits, getOrderStatusBadge } from '../../utils/formatters';
import { handleImageError } from '../../utils/imageUtils';
import { Package, Clock, CheckCircle2, ShoppingBag, LogIn, Search, FileText, ArrowLeft } from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, openAuthModal, isAdmin } = useAuth();
  const [quickOrderInput, setQuickOrderInput] = useState('');

  const [allOrders, setAllOrders] = useState(() => dbStore.getOrders());

  React.useEffect(() => {
    dbStore.fetchOrdersFromCloud().then(setAllOrders);
    const handleUpdate = () => setAllOrders(dbStore.getOrders());
    window.addEventListener('al_mostafa_orders_updated', handleUpdate);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_orders_updated', handleUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
    };
  }, []);

  const orders = useMemo(() => {
    if (!isAuthenticated || !currentUser) return [];

    // Admin can see store orders, but customer only sees their own
    if (isAdmin) {
      return allOrders;
    }

    const cleanUserPhone = currentUser.phone ? normalizeEgyptianPhone(currentUser.phone) : '';
    return allOrders.filter(order => {
      const matchId = order.customer_id && order.customer_id === currentUser.id;
      const matchPhone = cleanUserPhone && order.customer_phone && normalizeEgyptianPhone(order.customer_phone) === cleanUserPhone;
      return matchId || matchPhone;
    });
  }, [allOrders, isAuthenticated, currentUser, isAdmin]);

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = normalizeArabicDigits(quickOrderInput.trim());
    if (!cleanInput) return;
    navigate(`/order-confirmation/${encodeURIComponent(cleanInput)}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-right">
        <Breadcrumbs items={[
          { label: 'حسابي', path: '/account' },
          { label: 'طلباتي السابقة' }
        ]} />

        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              تسجيل الدخول مطلوب لعرض سجل الطلبات
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              لحماية خصوصية بياناتك ومعاملاتك، يرجى تسجيل الدخول إلى حسابك المسجل لمشاهدة كافة الطلبات السابقة وتفاصيل الشحن.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-6 py-3 bg-mall-900 hover:bg-mall-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              تسجيل الدخول إلى حسابي
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Quick guest lookup */}
          <div className="pt-6 border-t border-gray-100 max-w-md mx-auto space-y-3">
            <span className="text-xs font-bold text-gray-600 block">
              قمت بالطلب كزائر؟ تتبع طلبك مباشرة برقم الطلب:
            </span>
            <form onSubmit={handleQuickLookup} className="flex items-center gap-2">
              <input
                type="text"
                value={quickOrderInput}
                onChange={(e) => setQuickOrderInput(e.target.value)}
                placeholder="رقم الطلب (مثال: MSM-123456)"
                className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono text-center focus:outline-none focus:border-mall-900"
                dir="ltr"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تتبع
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-right">
      <Breadcrumbs items={[
        { label: 'حسابي', path: '/account' },
        { label: 'طلباتي السابقة' }
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-mall-900">
            سجل طلباتي ({orders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            مرحباً {currentUser?.name}، فيما يلي تفاصيل وتتبع جميع مشترياتك المسجلة.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-mall-900 hover:text-gold-600 bg-gray-50 hover:bg-gold-50 px-3.5 py-2 rounded-xl border border-gray-200 transition-colors self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>تصفح أحدث المنتجات</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-4">
          <Package className="w-16 h-16 text-gray-300 mx-auto stroke-1" />
          <h2 className="text-lg font-bold text-gray-800">لا توجد طلبات مسجلة باسمك حتى الآن</h2>
          <p className="text-xs text-gray-500">عند قيامك بإتمام أي طلب تسوق، سيظهر هنا بكافة تفاصيل التوصيل ومراحل الشحن.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تسوق الآن</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <span className="text-[11px] text-gray-400 block">رقم الطلب</span>
                  <strong className="font-mono text-sm font-black text-mall-900">{order.order_number}</strong>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-gray-400 block">تاريخ الطلب</span>
                    <span className="text-gray-700 font-medium">{formatDateArabic(order.created_at)}</span>
                  </div>
                  <span className={`py-1 px-3 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getOrderStatusBadge(order.order_status).badgeClass}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getOrderStatusBadge(order.order_status).label}</span>
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt="" 
                          onError={handleImageError}
                          className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-1" 
                        />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{item.product_name_ar}</span>
                        <span className="text-[10px] text-gray-400">الكمية: {item.quantity} • {formatCurrencyEGP(item.unit_price_egp)}</span>
                      </div>
                    </div>
                    <span className="font-black text-mall-900">{formatCurrencyEGP(item.total_price_egp)}</span>
                  </div>
                ))}
              </div>

              {/* Totals, Delivery address and Action */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-3">
                <div>
                  <span>عنوان التوصيل: <strong>{order.governorate} — {order.city}</strong> ({order.shipping_address})</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div>
                    <span>الإجمالي: </span>
                    <strong className="text-sm font-black text-mall-900">{formatCurrencyEGP(order.total_egp)}</strong>
                  </div>
                  <Link
                    to={`/order-confirmation/${order.order_number}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-mall-900 hover:bg-gold-500 text-white hover:text-mall-950 rounded-lg text-xs font-bold transition-all shadow-2xs"
                  >
                    <span>تفاصيل الطلب</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
