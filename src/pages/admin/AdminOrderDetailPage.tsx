import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order, OrderItem, OrderStatus, OrderStatusHistoryItem } from '../../types';
import { dbStore } from '../../services/dbStore';
import { formatCurrencyEGP, formatDateArabic, getWhatsAppUrl, getOrderStatusBadge } from '../../utils/formatters';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { OrderInvoiceModal } from '../../components/admin/OrderInvoiceModal';
import { 
  ArrowLeft, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Save 
} from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useStoreSettings();

  const [order, setOrder] = useState<Order | undefined>(() => id ? dbStore.getOrderById(id) : undefined);
  const [isLoading, setIsLoading] = useState(!order);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.order_status || 'pending_confirmation');
  const [statusNote, setStatusNote] = useState('');
  const [isDamagedGoods, setIsDamagedGoods] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  React.useEffect(() => {
    if (id) {
      const current = dbStore.getOrderById(id);
      if (current) {
        setOrder(current);
        setSelectedStatus(current.order_status);
        setIsLoading(false);
      }
      // Guarantee cloud synchronization
      dbStore.fetchOrderByIdFromCloud(id).then((cloudOrder) => {
        if (cloudOrder) {
          setOrder(cloudOrder);
          setSelectedStatus(cloudOrder.order_status);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-bold text-gray-800">جاري تحميل وتحديث تفاصيل الطلب من السيرفر...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">الطلب غير موجود</h2>
        <Link to="/admin/orders" className="text-xs font-bold text-mall-900 underline">
          العودة لقائمة الطلبات
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = await dbStore.updateOrderStatusAsync(
      order.id, 
      selectedStatus, 
      statusNote || undefined, 
      'مدير الطلبات',
      { isDamaged: isDamagedGoods }
    );
    if (updated) {
      setOrder({ ...updated });
      setStatusNote('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
    setIsSaving(false);
  };

  const whatsappLink = getWhatsAppUrl(
    order.customer_phone, 
    `مرحباً ${order.customer_name}، نتواصل معك من إدارة مول المصطفى بخصوص طلبك رقم (${order.order_number}).`
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      {/* Top Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              تفاصيل الطلب: {order.order_number}
            </h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getOrderStatusBadge(order.order_status).badgeClass}`}>
              {getOrderStatusBadge(order.order_status).label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            تاريخ الإنشاء: {formatDateArabic(order.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-mall-900" />
            <span>طباعة الفاتورة</span>
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب العميل</span>
          </a>
          <Link
            to="/admin/orders"
            className="py-2 px-3 text-xs text-gray-500 hover:text-gray-800"
          >
            ← العودة
          </Link>
        </div>
      </div>

      {/* Status Update Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-mall-900 pb-2 border-b border-gray-100">
          تحديث حالة الطلب وإضافة ملاحظات
        </h3>

        <form onSubmit={handleUpdateStatus} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="w-full sm:w-56">
            <label className="block text-xs font-bold text-gray-700 mb-1">الحالة الجديدة:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white font-bold"
            >
              <option value="pending_confirmation">قيد التأكيد</option>
              <option value="confirmed">مؤكد</option>
              <option value="preparing">جاري التجهيز</option>
              <option value="out_for_delivery">خرج للتوصيل</option>
              <option value="delivered">تم التوصيل بنجاح</option>
              <option value="cancelled">ملغي</option>
              <option value="returned">مرتجع</option>
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظة التحديث (تظهر في السجل):</label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="مثال: تم التنسيق مع شركة الشحن وتسليم الطرد..."
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-gold-500 hover:bg-gold-600 text-mall-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الحالة</span>
          </button>
        </form>

        {(selectedStatus === 'cancelled' || selectedStatus === 'returned') && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-900 animate-fade-in">
            <input
              type="checkbox"
              id="is_damaged_checkbox"
              checked={isDamagedGoods}
              onChange={(e) => setIsDamagedGoods(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-600 cursor-pointer"
            />
            <label htmlFor="is_damaged_checkbox" className="cursor-pointer font-bold select-none">
              تسجيل الأصناف كـ <span className="underline">بضاعة تالفة</span> (لن يتم إعادة الكميات للمخزون الصالح للبيع، وسيتم تسجيل الحركة كهالك)
            </label>
          </div>
        )}

        {saveSuccess && (
          <p className="text-xs font-bold text-green-600 animate-fade-in">
            ✓ تم تحديث حالة الطلب وتسجيل الحركة بنجاح!
          </p>
        )}
      </div>

      {/* Customer & Delivery Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-2 text-xs">
          <h4 className="font-black text-mall-900 text-sm mb-2">بيانات العميل والتواصل</h4>
          <p>الاسم: <strong className="text-gray-900">{order.customer_name}</strong></p>
          <p>الهاتف: <strong className="font-mono text-gray-900">{order.customer_phone}</strong></p>
          {order.customer_email && <p>البريد: {order.customer_email}</p>}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-2 text-xs">
          <h4 className="font-black text-mall-900 text-sm mb-2">عنوان الشحن والتوصيل</h4>
          <p>المحافظة: <strong>{order.governorate}</strong></p>
          <p>المدينة / المركز: <strong>{order.city}</strong></p>
          <p>العنوان التفصيلي: <span className="text-gray-700">{order.shipping_address}</span></p>
          {order.delivery_notes && (
            <p className="text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
              ملاحظات: {order.delivery_notes}
            </p>
          )}
        </div>
      </div>

      {/* Items Snapshot */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <h4 className="font-black text-mall-900 text-sm pb-2 border-b border-gray-100">
          الأصناف المحجوزة في الطلب ({order.items.length})
        </h4>

        <div className="divide-y divide-gray-100">
          {order.items.map((item: OrderItem, idx: number) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt="" className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-gray-50 p-1" />
                )}
                <div>
                  <strong className="text-gray-900 block text-xs">{item.product_name_ar}</strong>
                  <span className="text-[10px] text-gray-400 font-mono">كود SKU: {item.product_sku}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-gray-600">{item.quantity} × {formatCurrencyEGP(item.unit_price_egp)}</span>
                <span className="font-black text-mall-900 text-sm">{formatCurrencyEGP(item.total_price_egp)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-gray-100 max-w-xs ms-auto space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>المجموع الفرعي:</span>
            <span>{formatCurrencyEGP(order.subtotal_egp)}</span>
          </div>
          {order.discount_egp > 0 && (
            <div className="flex justify-between text-green-600 font-bold">
              <span>الخصم:</span>
              <span>- {formatCurrencyEGP(order.discount_egp)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>مصاريف الشحن:</span>
            <span>{order.shipping_fee_egp === 0 ? 'مجاني' : formatCurrencyEGP(order.shipping_fee_egp)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-mall-900 pt-2 border-t border-gray-100">
            <span>الإجمالي الكلي:</span>
            <span>{formatCurrencyEGP(order.total_egp)}</span>
          </div>
        </div>
      </div>

      {/* Status History Audit Trail */}
      {order.status_history && order.status_history.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-3">
          <h4 className="font-black text-mall-900 text-xs pb-2 border-b border-gray-100">
            سجل حركة وتتبع حالة الطلب (Audit History)
          </h4>
          <div className="space-y-2">
            {order.status_history.map((h: OrderStatusHistoryItem) => (
              <div key={h.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">الحالة: {h.to_status}</span>
                  {h.notes && <p className="text-[11px] text-gray-500 mt-0.5">{h.notes}</p>}
                </div>
                <div className="text-left text-[10px] text-gray-400">
                  <span>{formatDateArabic(h.created_at)}</span>
                  <span className="block">{h.changed_by || 'النظام'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thermal & Official Invoice Receipt Modal */}
      {isInvoiceModalOpen && (
        <OrderInvoiceModal
          order={order}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};
