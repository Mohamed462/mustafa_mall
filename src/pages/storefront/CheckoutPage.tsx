import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, getProductMaxOrderLimit } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../services/dbStore';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatCurrencyEGP, normalizeArabicDigits } from '../../utils/formatters';
import { handleImageError } from '../../utils/imageUtils';
import { PaymentMethod } from '../../types';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Wallet, 
  Banknote, 
  ArrowLeft, 
  AlertCircle,
  Tag,
  Check,
  Trash2
} from 'lucide-react';
import { TextureButton } from '../../components/common/TextureButton';

const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الدقهلية',
  'الشرقية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'بني سويف',
  'الفيوم',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'مطروح',
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    subtotal, 
    shippingFee, 
    discount, 
    total, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    clearCart,
    selectedGovernorate,
    setSelectedGovernorate
  } = useCart();
  const { settings } = useStoreSettings();
  const { currentUser, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [governorate, setGovernorate] = useState(selectedGovernorate || 'القاهرة');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');

  useEffect(() => {
    if (selectedGovernorate && selectedGovernorate !== governorate) {
      setGovernorate(selectedGovernorate);
    }
  }, [selectedGovernorate]);

  const handleGovernorateChange = (newGov: string) => {
    setGovernorate(newGov);
    setSelectedGovernorate(newGov);
  };

  // Coupon Code state
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponFeedback({ type: 'error', message: 'يرجى كتابة كود الخصم أولاً' });
      return;
    }
    setIsApplyingCoupon(true);
    const result = applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
    setCouponInput('');
  };

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill fields from authenticated profile and saved addresses
  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (!email && currentUser.email && !currentUser.email.includes('@client.almostafamall.com')) {
        setEmail(currentUser.email);
      }

      const defaultAddr = currentUser.addresses?.find(a => a.is_default) || currentUser.addresses?.[0];
      if (defaultAddr) {
        if (defaultAddr.governorate) {
          setGovernorate(defaultAddr.governorate);
          setSelectedGovernorate(defaultAddr.governorate);
        }
        if (defaultAddr.city && !city) setCity(defaultAddr.city);
        if (defaultAddr.street_address && !address) {
          const fullAddr = [
            defaultAddr.street_address,
            defaultAddr.building_number ? `عمارة ${defaultAddr.building_number}` : '',
            defaultAddr.floor ? `دور ${defaultAddr.floor}` : '',
            defaultAddr.apartment ? `شقة ${defaultAddr.apartment}` : '',
          ].filter(Boolean).join(' - ');
          setAddress(fullAddr);
        }
        if (defaultAddr.notes && !notes) setNotes(defaultAddr.notes);
      } else if (currentUser.address && !address) {
        setAddress(currentUser.address);
        if (currentUser.governorate) {
          setGovernorate(currentUser.governorate);
          setSelectedGovernorate(currentUser.governorate);
        }
        if (currentUser.city) setCity(currentUser.city);
      }
    }
  }, [currentUser]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">لا توجد منتجات لإتمام الطلب</h2>
        <Link to="/shop" className="inline-block mt-4 px-6 py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold">
          العودة للتسوق
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Egyptian phone validation: supports Arabic and English numerals, starts with 01 and has 11 digits
    const cleanedPhone = normalizeArabicDigits(phone).replace(/[^0-9]/g, '');
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('يرجى إدخال الاسم بالكامل ثلاثياً على الأقل.');
      return;
    }
    if (!/^01[0125][0-9]{8}$/.test(cleanedPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً (مثال: 01012345678).');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('يرجى كتابة اسم المدينة أو الحي أو المركز.');
      return;
    }
    if (!address.trim() || address.trim().length < 10) {
      setErrorMsg('يرجى إدخال العنوان التفصيلي بدقة (الشارع، رقم العمارة، رقم الشقة، علامة مميزة).');
      return;
    }

    // التحقق من توافر المخزون وحدود الطلبات لكل صنف
    for (const item of cartItems) {
      const maxLimit = getProductMaxOrderLimit(item.product, item.variant);
      const stock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
      if (stock <= 0) {
        setErrorMsg(`عفواً يا فندم، المنتج "${item.product.name_ar}" نفد من المخزن حالياً. يرجى حذفه للمتابعة.`);
        return;
      }
      if (item.quantity > maxLimit) {
        setErrorMsg(`الكمية المطلوبة من "${item.product.name_ar}" (${item.quantity} قطع) تتجاوز الحد المسموح به (${maxLimit} قطع) أو المتاح بالمخزن.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const order = dbStore.createOrder({
        customer_id: currentUser?.id || null,
        customer_name: fullName.trim(),
        customer_phone: cleanedPhone,
        customer_email: email.trim() || undefined,
        governorate,
        city: city.trim(),
        shipping_address: address.trim(),
        delivery_notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'pending_confirmation',
        subtotal_egp: subtotal,
        discount_egp: discount,
        coupon_code: appliedCoupon?.code,
        shipping_fee_egp: shippingFee,
        total_egp: total,
        items: cartItems.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          order_id: '',
          product_id: item.product.id,
          variant_id: item.variant?.id || null,
          product_name_ar: item.product.name_ar,
          product_sku: item.variant ? item.variant.sku : item.product.sku,
          unit_price_egp: item.variant?.price_override_egp ?? item.product.price_egp,
          quantity: item.quantity,
          total_price_egp: (item.variant?.price_override_egp ?? item.product.price_egp) * item.quantity,
          image_url: item.variant?.image_url || item.product.images[0]?.image_url,
        }))
      });

      clearCart();
      navigate(`/order-confirmation?orderNumber=${order.order_number}`);
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 text-right">
      <Breadcrumbs items={[
        { label: 'عربة التسوق', path: '/cart' },
        { label: 'إتمام الطلب والدفع' }
      ]} />

      <h1 className="text-2xl font-black text-mall-900">
        إتمام الطلب وبيانات الشحن
      </h1>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping & Payment Fields */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Customer & Delivery Address Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-mall-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-500" />
                <span>1. بيانات المستلم وعنوان التوصيل</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: محمد أحمد محمود"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    رقم الهاتف المحمول (واتساب) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 01012345678"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    المحافظة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => handleGovernorateChange(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-gold-500 cursor-pointer font-bold"
                  >
                    {dbStore.getGovernorateShippingRates()
                      .filter(r => r.is_active)
                      .map((gov) => (
                        <option key={gov.id} value={gov.name_ar}>{gov.name_ar}</option>
                      ))}
                  </select>
                  {(() => {
                    const currentRate = dbStore.getGovernorateShippingRates().find(r => r.name_ar === governorate);
                    if (!currentRate) return null;
                    return (
                      <span className="block text-[11px] text-gray-500 mt-1.5 font-medium">
                        ⚡ مدة التوصيل: <strong className="text-gray-900">{currentRate.estimated_days}</strong> | الشحن: <strong className="text-emerald-700">{shippingFee === 0 ? 'مجاني 🎉' : `${currentRate.fee_egp} ج.م`}</strong>
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    المدينة / المركز / المنطقة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: مدينة نصر / الدقي / سموحة"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    العنوان التفصيلي <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، الطابق، رقم الشقة، وأقرب علامة مميزة"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    البريد الإلكتروني (اختياري لاستلام الفاتورة)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    ملاحظات لمندوب التوصيل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: الاتصال قبل الوصول بنصف ساعة"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-mall-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-500" />
                <span>2. طريقة الدفع المعتمدة</span>
              </h2>

              <div className="space-y-3 pt-2">
                {/* Cash on delivery */}
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery' 
                    ? 'border-mall-900 bg-mall-50/40 shadow-xs' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-mall-900 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-gray-900 block">الدفع نقداً عند الاستلام (COD)</span>
                      <span className="text-[11px] text-gray-500">ادفع براحة وأمان لمندوب الشحن عند فحص واستلام الطلب</span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-mall-900" />
                </label>

                {/* InstaPay */}
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'instapay' 
                    ? 'border-mall-900 bg-mall-50/40 shadow-xs' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="instapay"
                      checked={paymentMethod === 'instapay'}
                      onChange={() => setPaymentMethod('instapay')}
                      className="accent-mall-900 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-gray-900 block">تحويل إنستاباي الفوري (InstaPay)</span>
                      <span className="text-[11px] text-gray-500">تحويل سريع لحساب المول البنكي المعتمد</span>
                    </div>
                  </div>
                  <Wallet className="w-5 h-5 text-purple-600" />
                </label>

                {/* Vodafone Cash */}
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'vodafone_cash' 
                    ? 'border-mall-900 bg-mall-50/40 shadow-xs' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="vodafone_cash"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={() => setPaymentMethod('vodafone_cash')}
                      className="accent-mall-900 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-gray-900 block">محافظ إلكترونية / فودافون كاش</span>
                      <span className="text-[11px] text-gray-500">تحويل لمحفظة كاش الخاصة بمول المصطفى</span>
                    </div>
                  </div>
                  <Wallet className="w-5 h-5 text-red-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar (In RTL left side) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-5 sticky top-24">
            <h3 className="text-sm font-black text-mall-900 pb-3 border-b border-gray-100">
              ملخص الأصناف ({cartItems.length})
            </h3>

            {/* Compact items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pe-1">
              {cartItems.map((item, idx) => {
                const unitPrice = item.variant?.price_override_egp ?? item.product.price_egp;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-gray-50">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <img 
                        src={item.variant?.image_url || item.product.images[0]?.image_url} 
                        alt="" 
                        onError={handleImageError}
                        className="w-10 h-10 object-contain rounded-lg border border-gray-100" 
                      />
                      <div>
                        <span className="font-bold text-gray-900 line-clamp-1">{item.product.name_ar}</span>
                        <span className="text-[10px] text-gray-400">الكمية: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrencyEGP(unitPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span className="flex items-center gap-1.5 text-[#04383f]">
                  <Tag className="w-3.5 h-3.5 text-[#08606B]" />
                  <span>كود الخصم أو القسيمة</span>
                </span>
                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponInput('MOSTAFA10');
                      setCouponFeedback(null);
                    }}
                    className="text-[10px] text-[#08606B] font-mono hover:underline cursor-pointer bg-[rgba(8,96,107,0.08)] px-2 py-0.5 rounded-full"
                  >
                    جرب: MOSTAFA10
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-emerald-950">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          تم التطبيق
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                        خصم {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value} ج.م`} على الطلب
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="إزالة الكوبون"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponFeedback(null);
                      }}
                      placeholder="أدخل كود الخصم (مثال: MOSTAFA10)"
                      className="flex-1 text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#08606B] focus:bg-white font-mono uppercase tracking-wider text-right transition-colors"
                    />
                    <TextureButton
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="shrink-0 text-xs px-4 py-2 font-bold cursor-pointer"
                    >
                      {isApplyingCoupon ? 'تحقق...' : 'تطبيق'}
                    </TextureButton>
                  </div>
                </div>
              )}

              {couponFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
                  couponFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-gray-900">{formatCurrencyEGP(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  <span>الخصم ({appliedCoupon?.code}):</span>
                  <span className="font-mono">- {formatCurrencyEGP(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>مصاريف الشحن والتوصيل:</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-black">شحن مجاني</span> : formatCurrencyEGP(shippingFee)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
              <span className="text-sm font-black text-gray-900">الإجمالي المستحق:</span>
              <span className="text-xl font-black text-[#04383f]">
                {formatCurrencyEGP(total)}
              </span>
            </div>

            <TextureButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full py-4 font-black text-sm gap-2 shadow-lg cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري تسجيل وتأكيد الطلب...</span>
              ) : (
                <>
                  <span>تأكيد وتسجيل الطلب الآن</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </>
              )}
            </TextureButton>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>معاملة مشفرة ومحمية بضمان مول المصطفى</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
