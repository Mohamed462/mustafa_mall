import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { formatCurrencyEGP } from '../../utils/formatters';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();
  const { settings } = useStoreSettings();

  if (!isOpen) return null;

  const freeThreshold = settings.free_shipping_threshold_egp;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 start-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-right">
          {/* Header */}
          <div className="p-4 border-b border-[#1C2526] flex items-center justify-between bg-[#0A0A0B] text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B89B5E]" />
              <h2 className="font-bold text-base">سلة التسوق ({itemCount} منتجات)</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-slate-50 p-3.5 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1.5">
              <Truck className="w-4 h-4 text-gold-600" />
              {remainingForFree > 0 ? (
                <span>
                  أضف منتجات بقيمة <strong className="text-slate-900 font-bold">{formatCurrencyEGP(remainingForFree)}</strong> للحصول على <strong>شحن مجاني!</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  🎉 مبروك! طلبك مؤهل للشحن المجاني بالكامل
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gold-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400 space-y-3">
                <ShoppingBag className="w-16 h-16 mx-auto stroke-1 text-gray-300" />
                <p className="font-bold text-gray-700">سلة التسوق فارغة حالياً</p>
                <p className="text-xs text-gray-400">تصفح أقسام مول المصطفى وأضف ما ترغب به إلى السلة</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="inline-block mt-4 bg-[#0A0A0B] text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-[#1C2526] transition-colors"
                >
                  تسوق الآن
                </Link>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const unitPrice = item.variant?.price_override_egp ?? item.product.price_egp;
                const itemTotal = unitPrice * item.quantity;
                const imageSrc = item.variant?.image_url || item.product.images[0]?.image_url;

                return (
                  <div key={`${item.product.id}-${item.variant?.id || 'base'}-${idx}`} className="flex gap-3 pb-4 border-b border-slate-200 last:border-b-0">
                    <img 
                      src={imageSrc} 
                      alt={item.product.name_ar} 
                      className="w-20 h-20 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 shrink-0" 
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                          {item.product.name_ar}
                        </h4>
                        {item.variant && (
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            النوع / اللون: {item.variant.name_ar}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900 block mt-1">
                          {formatCurrencyEGP(unitPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                            className="p-1.5 hover:bg-slate-200 text-gray-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                            className="p-1.5 hover:bg-slate-200 text-gray-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total & Remove button */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-900">
                            {formatCurrencyEGP(itemTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer and Checkout Trigger */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">المجموع الفرعي:</span>
                <span className="text-base font-black text-slate-900">{formatCurrencyEGP(subtotal)}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                يتم حساب مصاريف الشحن والخصومات في الخطوة التالية.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-3 bg-white border border-[#E8E4DC] rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  معاينة السلة كاملة
                </Link>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-3 bg-[#B89B5E] hover:bg-[#D4AF37] rounded-lg text-xs font-bold text-[#0A0A0B] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>متابعة الشراء</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
