import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatCurrencyEGP } from '../../utils/formatters';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Tag, 
  Truck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    shippingFee, 
    discount, 
    total, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const { settings } = useStoreSettings();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const freeThreshold = settings.free_shipping_threshold_egp;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode);
    setCouponMessage({
      text: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponCode('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Breadcrumbs items={[{ label: 'عربة التسوق' }]} />
        <div className="bg-white rounded-3xl border border-gray-100 p-16 max-w-md mx-auto shadow-xs">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto stroke-1 mb-3" />
          <h2 className="text-xl font-black text-gray-800">عربة التسوق فارغة</h2>
          <p className="text-xs text-gray-500 mt-1">لم تقم بإضافة أي منتجات إلى عربة التسوق بعد.</p>
          <Link
            to="/shop"
            className="inline-block mt-6 px-8 py-3 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors"
          >
            تصفح منتجات المول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 text-right">
      <Breadcrumbs items={[{ label: 'عربة التسوق' }]} />

      <h1 className="text-2xl font-black text-mall-900">
        عربة التسوق ({cartItems.length} أصناف)
      </h1>

      {/* Free Shipping Meter */}
      <div className="bg-gold-50 p-4 rounded-2xl border border-gold-200">
        <div className="flex items-center gap-2 text-xs font-bold text-gold-950 mb-2">
          <Truck className="w-4 h-4 text-gold-600 shrink-0" />
          {remainingForFree > 0 ? (
            <span>
              أضف منتجات بقيمة <strong className="text-mall-900">{formatCurrencyEGP(remainingForFree)}</strong> إضافية للحصول على <strong>شحن مجاني!</strong>
            </span>
          ) : (
            <span className="text-green-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-600 inline" />
              تهانينا! طلبيتك مؤهلة للشحن المجاني بالكامل
            </span>
          )}
        </div>
        <div className="w-full bg-gold-200/80 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gold-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table / List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500">تفاصيل المنتجات المختارة</span>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ السلة</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {cartItems.map((item, idx) => {
              const unitPrice = item.variant?.price_override_egp ?? item.product.price_egp;
              const itemTotal = unitPrice * item.quantity;
              const imageSrc = item.variant?.image_url || item.product.images[0]?.image_url;

              return (
                <div key={`${item.product.id}-${idx}`} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={imageSrc} 
                      alt={item.product.name_ar} 
                      className="w-20 h-20 object-contain rounded-xl border border-gray-100 p-1 shrink-0" 
                    />
                    <div>
                      <Link to={`/product/${item.product.slug}`} className="text-xs sm:text-sm font-bold text-gray-900 hover:text-mall-900 line-clamp-2">
                        {item.product.name_ar}
                      </Link>
                      {item.variant && (
                        <span className="text-xs text-gray-500 block mt-0.5">
                          الخيار: {item.variant.name_ar}
                        </span>
                      )}
                      <span className="text-xs font-bold text-mall-900 block mt-1">
                        {formatCurrencyEGP(unitPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                        className="p-2 text-gray-600 hover:bg-gray-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-black text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                        className="p-2 text-gray-600 hover:bg-gray-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Price & Delete */}
                    <div className="text-left flex items-center gap-4">
                      <span className="text-sm font-black text-mall-900">
                        {formatCurrencyEGP(itemTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link to="/shop" className="text-xs font-bold text-mall-900 hover:text-gold-600">
              ← استمرار التسوق وإضافة المزيد من المنتجات
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
            <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gold-500" />
              <span>كوبون الخصم أو الرمز الترويجي</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-green-800 block">تم تفعيل كود: {appliedCoupon.code}</span>
                  <span className="text-[11px] text-green-700">وفرت {formatCurrencyEGP(discount)}</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:text-red-700 font-bold"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="أدخل كود الخصم (مثال: MOSTAFA10)"
                    className="flex-1 text-xs p-2.5 border border-gray-200 rounded-xl uppercase text-center focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors"
                  >
                    تطبيق
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] font-bold ${couponMessage.isError ? 'text-red-600' : 'text-green-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Totals Summary */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-black text-mall-900 pb-3 border-b border-gray-100">
              ملخص الطلب
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-gray-900">{formatCurrencyEGP(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600 font-bold">
                  <span>قيمة الخصم:</span>
                  <span>- {formatCurrencyEGP(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>مصاريف الشحن:</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-bold">مجاني</span>
                  ) : (
                    formatCurrencyEGP(shippingFee)
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
              <span className="text-sm font-black text-gray-900">المجموع الكلي:</span>
              <span className="text-xl font-black text-mall-900">
                {formatCurrencyEGP(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>متابعة الشراء وإنهاء الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
