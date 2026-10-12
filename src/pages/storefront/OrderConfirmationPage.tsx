import React, { useMemo, useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { formatCurrencyEGP, formatDateArabic, getWhatsAppUrl, normalizeArabicDigits } from '../../utils/formatters';
import { handleImageError, normalizeImageUrl, PRODUCT_FALLBACK_IMAGE } from '../../utils/imageUtils';
import { OrderInvoiceModal } from '../../components/admin/OrderInvoiceModal';
import { Order, OrderStatus } from '../../types';
import { 
  CheckCircle2, 
  MessageCircle, 
  ShoppingBag, 
  ArrowLeft, 
  Clock, 
  Search, 
  Printer, 
  Truck, 
  AlertCircle,
  PackageCheck
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryOrderNumber = searchParams.get('orderNumber') || searchParams.get('code') || '';
  const orderNumber = (paramOrderNumber || queryOrderNumber).trim();
  const { settings } = useStoreSettings();

  const [lookupInput, setLookupInput] = useState(orderNumber);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const [order, setOrder] = useState<Order | undefined>(() => orderNumber ? dbStore.getOrderByNumber(orderNumber) : undefined);
  const [isLoading, setIsLoading] = useState(!order && Boolean(orderNumber));

  // Sync lookup input and fetch authoritative order from cloud
  React.useEffect(() => {
    setLookupInput(orderNumber);
    if (orderNumber) {
      const local = dbStore.getOrderByNumber(orderNumber);
      if (local) {
        setOrder(local);
        setIsLoading(false);
      }
      dbStore.fetchOrderByNumberFromCloud(orderNumber).then((cloudOrder) => {
        if (cloudOrder) setOrder(cloudOrder);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setOrder(undefined);
      setIsLoading(false);
    }
  }, [orderNumber]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = normalizeArabicDigits(lookupInput.trim());
    if (!cleanInput) return;
    navigate(`/order-confirmation/${encodeURIComponent(cleanInput)}`);
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending_confirmation':
        return { label: 'قيد التأكيد والمراجعة', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock, currentStep: 1 };
      case 'confirmed':
        return { label: 'تم تأكيد الطلب وجاري التحضير', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: CheckCircle2, currentStep: 2 };
      case 'preparing':
        return { label: 'جاري تجهيز وتغليف الطلب', color: 'bg-purple-50 text-purple-800 border-purple-200', icon: ShoppingBag, currentStep: 3 };
      case 'out_for_delivery':
        return { label: 'خرج للتوصيل مع مندوب الشحن', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Truck, currentStep: 4 };
      case 'delivered':
        return { label: 'تم التسليم بنجاح', color: 'bg-green-50 text-green-800 border-green-200', icon: PackageCheck, currentStep: 5 };
      case 'cancelled':
        return { label: 'تم إلغاء الطلب', color: 'bg-red-50 text-red-800 border-red-200', icon: AlertCircle, currentStep: 0 };
      case 'returned':
        return { label: 'طلب مرتجع', color: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertCircle, currentStep: 0 };
      default:
        return { label: status, color: 'bg-gray-50 text-gray-800 border-gray-200', icon: Clock, currentStep: 1 };
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-bold text-gray-800">جاري استرجاع تفاصيل وفاتورة الطلب من السيرفر...</h2>
        <p className="text-xs text-gray-400 font-mono">{orderNumber}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-mall-100 text-mall-900 flex items-center justify-center mx-auto">
          <Search className="w-8 h-8 text-mall-900" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900">
            {orderNumber ? 'لم يتم العثور على بيانات الطلب' : 'الاستعلام عن حالة الطلب والشحنة'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            {orderNumber 
              ? `لم نتمكن من العثور على طلب برقم (${orderNumber}). يرجى التحقق من الرقم المدخل أو التواصل مع خدمة العملاء.`
              : 'أدخل رقم طلبك المرجعي (مثال: MSM-123456) لمعرفة تفاصيل الفاتورة ومسار الشحنة فوراً.'}
          </p>
        </div>

        {/* Interactive Lookup Form */}
        <form onSubmit={handleLookupSubmit} className="max-w-md mx-auto flex items-center gap-2">
          <input
            type="text"
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
            placeholder="مثال: MSM-654321"
            className="flex-1 px-4 py-3 text-xs bg-white border border-gray-300 rounded-xl font-mono text-center focus:outline-none focus:border-mall-900"
            dir="ltr"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-mall-900 hover:bg-mall-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            بحث
          </button>
        </form>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link to="/" className="inline-block px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors">
            العودة للرئيسية
          </Link>
          <Link to="/shop" className="inline-block px-6 py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold transition-colors">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  const whatsappText = order.payment_method === 'instapay'
    ? `*تأكيد تحويل إنستاباي — مول المصطفى* 📲
*كود الطلب:* ${order.order_number}
*اسم العميل:* ${order.customer_name}
*رقم الهاتف:* ${order.customer_phone}
*المبلغ المطلوب تحويله:* ${formatCurrencyEGP(order.total_egp)}
*عنوان التوصيل:* ${order.governorate} — ${order.city} — ${order.shipping_address}
*الأصناف:*
${order.items.map((it, idx) => `• ${it.product_name_ar} (الكمية: ${it.quantity})`).join('\n')}

📸 *مرفق مع هذه الرسالة صورة إشعار تحويل إنستاباي لتأكيد شحن الطلب فوراً.*`
    : `*تأكيد ومتابعة طلب جديد — مول المصطفى* 📦
*كود الطلب:* ${order.order_number}
*اسم العميل:* ${order.customer_name}
*رقم الهاتف:* ${order.customer_phone}
*المبلغ الإجمالي:* ${formatCurrencyEGP(order.total_egp)}
*طريقة الدفع:* ${order.payment_method === 'cash_on_delivery' ? 'الدفع نقداً عند الاستلام' : 'محافظ إلكترونية'}
*عنوان التوصيل:* ${order.governorate} — ${order.city} — ${order.shipping_address}
*الأصناف:*
${order.items.map((it, idx) => `• ${it.product_name_ar} (الكمية: ${it.quantity})`).join('\n')}

أرجو تأكيد تجهيز الشحنة وميعاد التوصيل. شكراً لك!`;

  const statusInfo = getStatusInfo(order.order_status);
  const StatusIcon = statusInfo.icon;

  const timelineSteps = [
    { step: 1, title: 'استلام الطلب', desc: 'تم تسجيل الطلب في النظام' },
    { step: 2, title: 'تأكيد الطلب', desc: 'تمت مراجعة بيانات الشحن' },
    { step: 3, title: 'التجهيز والتغليف', desc: 'يتم تجهيز المنتجات من المعرض' },
    { step: 4, title: 'خرج للتوصيل', desc: 'مع مندوب الشحن' },
    { step: 5, title: 'تم الاستلام', desc: 'تم تسليم الشحنة للعميل' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-right">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl border border-gold-200/60 shadow-card p-6 sm:p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-gold-800 bg-gold-50 px-3 py-1 rounded-full border border-gold-200/60">
            تتبع الشحنة والفاتورة الرسمية
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-mall-900 mt-2">
            شكراً لثقتكم بمول المصطفى
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            رقم الطلب المرجعي الخاص بك: <strong className="font-mono text-mall-900 font-black text-base">{order.order_number}</strong>
          </p>
        </div>

        {/* WhatsApp & Print CTA */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={getWhatsAppUrl(settings.whatsapp_number, whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{order.payment_method === 'instapay' ? 'تأكيد التحويل وإرسال الإشعار عبر واتساب 📲' : 'متابعة الطلب فوراً عبر واتساب'}</span>
          </a>
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gold-500 hover:bg-gold-600 text-mall-950 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة فاتورة الطلب (A4 / حراري)</span>
          </button>
          <Link
            to="/order-confirmation"
            className="inline-flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-gray-800 text-xs font-bold"
          >
            <Search className="w-3.5 h-3.5" />
            <span>تتبع شحنة أخرى</span>
          </Link>
        </div>
      </div>

      {/* Dedicated InstaPay Payment Action Card */}
      {order.payment_method === 'instapay' && (
        <div className="bg-gradient-to-br from-purple-50 via-purple-50/60 to-white border-2 border-purple-200/80 rounded-3xl p-6 sm:p-7 text-right space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-purple-200/60">
            <div className="flex items-center gap-2 text-purple-950 font-black text-base">
              <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
              <span>بيانات تحويل إنستاباي المعتمدة (InstaPay)</span>
            </div>
            <span className="text-xs font-mono font-black bg-purple-200 text-purple-900 px-3 py-1 rounded-full">
              المطلوب: {formatCurrencyEGP(order.total_egp)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-purple-100 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-gray-400 block text-[11px] font-medium">رقم الهاتف / حساب إنستاباي المول:</span>
                <span className="font-mono font-black text-base text-purple-950">{settings.phone}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(settings.phone);
                  setCopiedPhone(true);
                  setTimeout(() => setCopiedPhone(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                {copiedPhone ? 'تم النسخ ✓' : 'نسخ الرقم'}
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-100 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-gray-400 block text-[11px] font-medium">المبلغ المطلوب تحويله:</span>
                <span className="font-mono font-black text-base text-emerald-700">{formatCurrencyEGP(order.total_egp)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(String(order.total_egp));
                  setCopiedAmount(true);
                  setTimeout(() => setCopiedAmount(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                {copiedAmount ? 'تم النسخ ✓' : 'نسخ المبلغ'}
              </button>
            </div>
          </div>

          <div className="bg-purple-100/70 text-purple-950 rounded-2xl p-3.5 text-xs font-semibold leading-relaxed">
            💡 <strong>تعليمات إنهاء الدفع:</strong> افتح تطبيق InstaPay وقم بتحويل مبلغ <strong>{formatCurrencyEGP(order.total_egp)}</strong> إلى رقم <strong>{settings.phone}</strong>، ثم اضغط على زر <strong>"تأكيد التحويل وإرسال الإشعار عبر واتساب 📲"</strong> بالأعلى وأرفق لقطة الشاشة (سكرين شوت) لتأكيد وتجهيز شحنتك فوراً.
          </div>
        </div>
      )}

      {/* Interactive Visual Shipment Timeline Stepper */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-black text-sm text-mall-900">مسار وحالة الشحنة المباشر</h3>
            <p className="text-[11px] text-gray-400">تحديث لحظي لخطوات تجهيز وشحن طلبك</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {order.order_status === 'cancelled' || order.order_status === 'returned' ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">هذا الطلب بحالة: {statusInfo.label}</p>
              <p className="text-[11px] text-red-600 mt-0.5">إذا كان لديك أي استفسار يرجى التواصل مع فريق خدمة العملاء على الواتساب أو الخط الساخن.</p>
            </div>
          </div>
        ) : (
          <div className="pt-2 pb-1">
            <div className="relative">
              {/* Timeline Track */}
              <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0" />
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {timelineSteps.map((stepItem) => {
                  const isCompleted = statusInfo.currentStep >= stepItem.step;
                  const isCurrent = statusInfo.currentStep === stepItem.step;

                  return (
                    <div 
                      key={stepItem.step} 
                      className={`flex sm:flex-col items-center gap-3 sm:gap-2 text-right sm:text-center p-2 rounded-xl transition-all ${
                        isCurrent ? 'bg-gold-50/70 border border-gold-200' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-gold-500 text-mall-950 ring-4 ring-gold-200 font-black'
                          : isCompleted
                          ? 'bg-mall-900 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          stepItem.step
                        )}
                      </div>

                      <div className="flex-1 sm:flex-none">
                        <span className={`text-xs block font-bold leading-tight ${
                          isCurrent ? 'text-mall-950 font-black' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {stepItem.title}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5 hidden sm:block">
                          {stepItem.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Breakdown */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs text-gray-400 block">تاريخ التسجيل</span>
            <span className="text-xs font-bold text-gray-800">{formatDateArabic(order.created_at)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">كود الطلب</span>
            <span className="text-xs font-mono font-bold text-mall-900">{order.order_number}</span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 text-xs">
          <div>
            <h4 className="font-bold text-gray-900 mb-1">بيانات العميل والتوصيل</h4>
            <p className="text-gray-700">الاسم: {order.customer_name}</p>
            <p className="text-gray-700">الهاتف: {order.customer_phone}</p>
            <p className="text-gray-700">المحافظة: {order.governorate} — {order.city}</p>
            <p className="text-gray-700">العنوان: {order.shipping_address}</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">طريقة الدفع والتسليم</h4>
            <p className="text-gray-700">
              الدفع: {order.payment_method === 'cash_on_delivery' ? 'الدفع نقداً عند الاستلام' : order.payment_method === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}
            </p>
            <p className="text-gray-700">حالة الدفع: معلق (يتم التحصيل عند التسليم)</p>
            {order.delivery_notes && (
              <p className="text-gray-500 mt-1">ملاحظات: {order.delivery_notes}</p>
            )}
          </div>
        </div>

        {/* Purchased Items List */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 mb-3">الأصناف المشتراة</h4>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 sm:p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <img 
                      src={normalizeImageUrl(item.image_url, PRODUCT_FALLBACK_IMAGE)} 
                      alt="" 
                      onError={handleImageError}
                      className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-1" 
                    />
                  )}
                  <div>
                    <span className="font-bold text-gray-900 block">{item.product_name_ar}</span>
                    <span className="text-[10px] text-gray-400">كود: {item.product_sku} • الكمية: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-black text-mall-900">{formatCurrencyEGP(item.total_price_egp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600 max-w-xs ms-auto">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span className="font-bold text-gray-900">{formatCurrencyEGP(order.subtotal_egp)}</span>
          </div>
          {order.discount_egp > 0 && (
            <div className="flex justify-between text-green-600 font-bold">
              <span>الخصم:</span>
              <span>- {formatCurrencyEGP(order.discount_egp)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>مصاريف الشحن:</span>
            <span className="font-bold text-gray-900">
              {order.shipping_fee_egp === 0 ? 'مجاني' : formatCurrencyEGP(order.shipping_fee_egp)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-mall-900 pt-2 border-t border-gray-100">
            <span>الإجمالي:</span>
            <span>{formatCurrencyEGP(order.total_egp)}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-mall-900 hover:text-gold-600"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>مواصلة التسوق في أقسام المول</span>
          </Link>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            <span>سجل طلباتي</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Official Print Receipt Modal */}
      {showInvoiceModal && (
        <OrderInvoiceModal
          order={order}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};
