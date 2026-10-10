import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { Order, OrderStatus } from '../../types';
import { formatEGP, formatDateTime, getWhatsAppLink } from '../../utils/formatters';
import { OrderInvoiceModal } from '../../components/admin/OrderInvoiceModal';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Filter, 
  Printer, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => dbStore.getOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = 
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.includes(searchTerm) ||
        o.customer_phone.includes(searchTerm);
      const matchStatus = selectedStatus === 'all' || o.order_status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, selectedStatus]);

  const [cancelModalOrder, setCancelModalOrder] = useState<{ id: string; status: OrderStatus; orderNumber: string } | null>(null);
  const [isDamagedGoods, setIsDamagedGoods] = useState(false);

  const handleQuickStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (newStatus === 'cancelled' || newStatus === 'returned') {
      setCancelModalOrder({ id: order.id, status: newStatus, orderNumber: order.order_number });
      setIsDamagedGoods(false);
      return;
    }
    dbStore.updateOrderStatus(order.id, newStatus, `تحديث سريع من لوحة التحكم`);
    setOrders(dbStore.getOrders());
  };

  const confirmCancellation = () => {
    if (!cancelModalOrder) return;
    dbStore.updateOrderStatus(
      cancelModalOrder.id, 
      cancelModalOrder.status, 
      isDamagedGoods ? 'إلغاء مع تسجيل بضاعة تالفة' : 'إلغاء وإعادة البضاعة للمخزون',
      'مدير المتجر',
      { isDamaged: isDamagedGoods }
    );
    setOrders(dbStore.getOrders());
    setCancelModalOrder(null);
  };

  const getStatusLabelArabic = (status: OrderStatus) => {
    switch (status) {
      case 'pending_confirmation': return 'قيد التأكيد والمراجعة';
      case 'confirmed': return 'تم التأكيد وجاري التحضير';
      case 'preparing': return 'جاري تجهيز وتغليف الطلب';
      case 'out_for_delivery': return 'خرج للتوصيل مع مندوب الشحن';
      case 'delivered': return 'تم التسليم بنجاح';
      case 'cancelled': return 'ملغي';
      case 'returned': return 'مرتجع';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 text-right font-arabic">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-mall-900" />
            <span>إدارة الطلبات والشحن والمبيعات ({orders.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة دقيقة لكل طلب، طباعة الفواتير وبوالص الشحن الرسمية، وتحديث الحالات فورياً
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم الطلب (MSM-XXXXXX) أو اسم العميل أو الهاتف..."
            className="w-full text-xs p-2.5 pe-9 border border-gray-200 rounded-xl focus:outline-none focus:border-mall-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-56 text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-mall-900 cursor-pointer font-bold"
        >
          <option value="all">جميع الحالات</option>
          <option value="pending_confirmation">قيد التأكيد</option>
          <option value="confirmed">مؤكد</option>
          <option value="preparing">جاري التجهيز</option>
          <option value="out_for_delivery">خرج للتوصيل</option>
          <option value="delivered">تم التوصيل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right divide-y divide-gray-100">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">رقم الطلب</th>
                <th className="py-3.5 px-4">العميل</th>
                <th className="py-3.5 px-4">المحافظة والعنوان</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">الإجمالي المستحق</th>
                <th className="py-3.5 px-4">حالة الشحن</th>
                <th className="py-3.5 px-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    لا توجد طلبات مسجلة مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const whatsappMsg = `مرحباً أستاذ ${order.customer_name}، نتواصل معك من إدارة مول المصطفى بخصوص طلبك رقم ${order.order_number}.\nحالة طلبك الحالية: ${getStatusLabelArabic(order.order_status)}.\nقيمة الفاتورة: ${formatEGP(order.total_egp)}`;
                  const whatsappUrl = getWhatsAppLink(order.customer_phone, whatsappMsg);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-mall-900">
                        {order.order_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">{order.customer_name}</span>
                        <span className="text-[10px] text-gray-500 font-mono dir-ltr text-right block">{order.customer_phone}</span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate">
                        <span className="font-bold text-gray-900">{order.governorate}</span> — {order.city}
                        <span className="block text-[10px] text-gray-400 truncate">{order.shipping_address}</span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formatDateTime(order.created_at)}
                      </td>

                      <td className="py-3.5 px-4 font-black text-green-700 font-mono">
                        {formatEGP(order.total_egp)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleQuickStatusChange(order, e.target.value as any)}
                          className={`text-xs p-1.5 rounded-xl border font-bold cursor-pointer transition-colors ${
                            order.order_status === 'delivered' ? 'bg-green-50 text-green-800 border-green-200' :
                            order.order_status === 'out_for_delivery' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            order.order_status === 'preparing' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            order.order_status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            order.order_status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending_confirmation">قيد التأكيد</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="preparing">جاري التجهيز</option>
                          <option value="out_for_delivery">خرج للتوصيل</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Invoice Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="p-1.5 bg-gray-100 hover:bg-mall-900 hover:text-white text-gray-700 rounded-lg transition-colors"
                            title="طباعة الفاتورة وبوليصة الشحن الرسمية"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Customer Contact */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-green-50 hover:bg-green-600 hover:text-white text-green-700 rounded-lg transition-colors"
                            title="مراسلة العميل بالواتساب بتفاصيل الطلب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* View Order Detail */}
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            title="عرض تفاصيل الطلب الكاملة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
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

      {/* Cancellation / Return Damaged Goods Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-right space-y-5 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-base font-black text-gray-900">
                تأكيد {cancelModalOrder.status === 'cancelled' ? 'إلغاء' : 'إرجاع'} الطلب #{cancelModalOrder.orderNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                يرجى تحديد حالة المنتجات في هذا الطلب لمعالجة كميات المخزون بدقة:
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="damaged_choice"
                  checked={!isDamagedGoods}
                  onChange={() => setIsDamagedGoods(false)}
                  className="mt-1 text-mall-900 focus:ring-mall-900"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">إعادة المنتجات إلى المخزون (بضاعة سليمة)</span>
                  <span className="text-[11px] text-gray-500 block">سيتم زيادة كميات المخزون المتاحة للبيع تلقائياً.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-gray-200">
                <input
                  type="radio"
                  name="damaged_choice"
                  checked={isDamagedGoods}
                  onChange={() => setIsDamagedGoods(true)}
                  className="mt-1 text-red-600 focus:ring-red-600"
                />
                <div>
                  <span className="text-xs font-bold text-red-700 block">تسجيل كبضاعة تالفة (تالف / هالك)</span>
                  <span className="text-[11px] text-gray-500 block">لن تضاف الكميات للمخزون الصالح للبيع، وسيتم قيدها كهالك في سجل الحركات.</span>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={confirmCancellation}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تأكيد العملية
              </button>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      <OrderInvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />
    </div>
  );
};
