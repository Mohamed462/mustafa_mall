import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useCart, getProductMaxOrderLimit } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { formatCurrencyEGP } from '../../utils/formatters';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();
  const { settings } = useStoreSettings();

  if (!isOpen) return null;

  const rawThreshold = Number(settings.free_shipping_threshold_egp);
  const freeThreshold = (rawThreshold > 0 && rawThreshold !== 500) ? rawThreshold : 750;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden font-arabic">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 start-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-right">
          {/* Header */}
          <div className="p-4 border-b border-[#08606B]/20 flex items-center justify-between bg-[#04383f] text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00D2D3]" />
              <h2 className="font-bold text-base">سلة مشترياتك ({itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'})</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#f8fafb] p-3.5 border-b border-[rgba(17,21,26,0.11)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#04383f] mb-1.5">
              <Truck className="w-4 h-4 text-[#08606B]" />
              {remainingForFree > 0 ? (
                <span>
                  فاضلك <strong className="text-[#08606B] font-black">{formatCurrencyEGP(remainingForFree)}</strong> والشحن يكون <strong className="text-emerald-700">ببلاش لحد بيتك! 🚀</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  🎉 يا عمدة! طلبك كسب شحن مجاني بالكامل
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#08606B] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400 space-y-3">
                <ShoppingBag className="w-16 h-16 mx-auto stroke-1 text-gray-300" />
                <p className="font-bold text-gray-700 text-base">السلة لسه فاضية يا غالي!</p>
                <p className="text-xs text-gray-500">لف لفة في أقسام مول المصطفى ونقي اللي يعجبك</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="inline-block mt-4 bg-[#08606B] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#03292e] transition-colors shadow-sm"
                >
                  تفرّج على المنتجات دلوقتي
                </Link>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const unitPrice = item.variant?.price_override_egp ?? item.product.price_egp;
                const itemTotal = unitPrice * item.quantity;
                const imageSrc = item.variant?.image_url || item.product.images[0]?.image_url;
                const maxLimit = getProductMaxOrderLimit(item.product, item.variant);
                const isAtMax = item.quantity >= maxLimit;

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
                        <span className="text-xs font-bold text-[#04383f] block mt-1">
                          {formatCurrencyEGP(unitPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                              className="p-1.5 hover:bg-slate-200 text-gray-600 transition-colors cursor-pointer"
                              aria-label="تقليل الكمية"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-black text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isAtMax}
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                              className={`p-1.5 transition-colors ${
                                isAtMax 
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                  : 'hover:bg-slate-200 text-gray-600 cursor-pointer'
                              }`}
                              aria-label="زيادة الكمية"
                              title={isAtMax ? `أقصى كمية متاحة: ${maxLimit}` : 'زيادة الكمية'}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isAtMax && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 font-bold">
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>الحد: {maxLimit}</span>
                            </span>
                          )}
                        </div>

                        {/* Item Total & Remove button */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-[#04383f]">
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
                <span className="text-gray-600 font-medium">المجموع المبدئي:</span>
                <span className="text-base font-black text-[#04383f]">{formatCurrencyEGP(subtotal)}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                مصاريف التوصيل والكوبونات بتتحدد في خطوة تأكيد الطلب.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  معاينة السلة
                </Link>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-3 bg-[#08606B] hover:bg-[#03292e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  كمّل الطلب واستلم فوراً ←
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
