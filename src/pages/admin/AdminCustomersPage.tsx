import React, { useState, useMemo } from 'react';
import { dbStore } from '../../services/dbStore';
import { formatEGP, formatDateTime, getWhatsAppLink } from '../../utils/formatters';
import { Order } from '../../types';
import { 
  Users, 
  Search, 
  Phone, 
  ShoppingBag, 
  DollarSign, 
  MapPin, 
  MessageCircle, 
  ExternalLink,
  Calendar,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomerSummary {
  phone: string;
  name: string;
  email?: string;
  governorate: string;
  city: string;
  address: string;
  ordersCount: number;
  totalSpentEgp: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: Order[];
}

export const AdminCustomersPage: React.FC = () => {
  const [orders] = useState<Order[]>(() => dbStore.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Group orders by phone to form unique customer profiles
  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    // Initial mock customer base if orders are empty or few
    const initialProfiles = [
      {
        phone: '01012345678',
        name: 'كريم عبد العزيز',
        email: 'karim@example.com',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        address: 'شارع عباس العقاد، عمارة 15',
        ordersCount: 3,
        totalSpentEgp: 2850,
        firstOrderDate: '2026-09-15T10:00:00.000Z',
        lastOrderDate: '2026-10-05T14:30:00.000Z',
        orders: [] as Order[]
      },
      {
        phone: '01123456789',
        name: 'مروة الشافعي',
        email: 'marwa@example.com',
        governorate: 'الجيزة',
        city: 'الدقي',
        address: 'شارع مصدق، برج الأطباء',
        ordersCount: 2,
        totalSpentEgp: 1420,
        firstOrderDate: '2026-09-20T12:00:00.000Z',
        lastOrderDate: '2026-10-02T16:00:00.000Z',
        orders: [] as Order[]
      },
      {
        phone: '01234567890',
        name: 'أحمد محمود سليمان',
        email: 'ahmed.m@example.com',
        governorate: 'الإسكندرية',
        city: 'سموحة',
        address: 'طريق 14 مايو، بجوار نادي سموحة',
        ordersCount: 4,
        totalSpentEgp: 6900,
        firstOrderDate: '2026-08-10T09:00:00.000Z',
        lastOrderDate: '2026-10-08T11:20:00.000Z',
        orders: [] as Order[]
      }
    ];

    for (const p of initialProfiles) {
      map.set(p.phone, p);
    }

    // Merge actual orders from dbStore
    for (const order of orders) {
      const cleanPhone = order.customer_phone.trim();
      const existing = map.get(cleanPhone);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpentEgp += order.total_egp;
        existing.orders.unshift(order);
        if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.created_at;
          existing.name = order.customer_name;
          existing.governorate = order.governorate;
          existing.city = order.city;
          existing.address = order.shipping_address;
        }
      } else {
        map.set(cleanPhone, {
          phone: cleanPhone,
          name: order.customer_name,
          email: order.customer_email,
          governorate: order.governorate,
          city: order.city,
          address: order.shipping_address,
          ordersCount: 1,
          totalSpentEgp: order.total_egp,
          firstOrderDate: order.created_at,
          lastOrderDate: order.created_at,
          orders: [order]
        });
      }
    }

    // Merge registered accounts from dbStore
    const registeredUsers = dbStore.getRegisteredUsers();
    for (const u of registeredUsers) {
      if (u.phone) {
        const cleanPhone = u.phone.trim();
        const existing = map.get(cleanPhone);
        if (existing) {
          existing.name = u.name || existing.name;
          existing.email = u.email || existing.email;
        } else {
          map.set(cleanPhone, {
            phone: cleanPhone,
            name: u.name,
            email: u.email,
            governorate: u.governorate || 'القاهرة',
            city: u.city || 'مدينة نصر',
            address: u.address || 'حساب عميل مسجل عبر المتجر',
            ordersCount: 0,
            totalSpentEgp: 0,
            firstOrderDate: u.created_at || new Date().toISOString(),
            lastOrderDate: u.created_at || new Date().toISOString(),
            orders: []
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpentEgp - a.totalSpentEgp);
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.governorate.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCustomers = customers.length;
    const totalSpent = customers.reduce((acc, c) => acc + c.totalSpentEgp, 0);
    const avgOrderValue = totalSpent / Math.max(1, customers.reduce((acc, c) => acc + c.ordersCount, 0));
    return { totalCustomers, totalSpent, avgOrderValue };
  }, [customers]);

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-mall-900" />
          <span>قاعدة بيانات العملاء وسجل المشتريات</span>
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          بيانات العملاء، عناوين التوصيل بمصر، وقيمة المشتريات التراكمية وسجل الطلبات
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block">إجمالي العملاء المسجلين</span>
          <span className="text-2xl font-black text-mall-900 block mt-1">{metrics.totalCustomers}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">عملاء نشطين</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block">إجمالي مشتريات العملاء</span>
          <span className="text-2xl font-black text-green-700 block mt-1">{formatEGP(metrics.totalSpent)}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">قيمة المبيعات التراكمية</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block">متوسط قيمة سلة العميل</span>
          <span className="text-2xl font-black text-gold-600 block mt-1">{formatEGP(metrics.avgOrderValue)}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">متوسط قيمة كل طلب</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="ابحث باسم العميل أو رقم الهاتف المحمول أو المحافظة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-1 text-xs border-0 focus:ring-0 focus:outline-hidden"
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            مسح
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">العميل</th>
                <th className="p-3">رقم الهاتف</th>
                <th className="p-3">المحافظة والمنطقة</th>
                <th className="p-3 text-center">عدد الطلبات</th>
                <th className="p-3">إجمالي المنفق</th>
                <th className="p-3">آخر طلب</th>
                <th className="p-3 text-center">التواصل والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    لا يوجد عملاء يطابقون معايير البحث
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.phone} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-bold text-gray-900">
                      <div>
                        <span>{c.name}</span>
                        {c.email && (
                          <span className="block text-[10px] text-gray-400 font-normal">{c.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-gray-700 dir-ltr text-right">
                      {c.phone}
                    </td>
                    <td className="p-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{c.governorate} — {c.city}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-mall-900 font-black rounded-full">
                        {c.ordersCount}
                      </span>
                    </td>
                    <td className="p-3 font-black text-green-700 font-mono">
                      {formatEGP(c.totalSpentEgp)}
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {formatDateTime(c.lastOrderDate)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={getWhatsAppLink(c.phone, `مرحباً أستاذ ${c.name}، نتواصل معك من إدارة مول المصطفى`)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-lg text-[11px] font-bold hover:bg-green-700 transition-colors shadow-xs"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold hover:bg-gray-200 transition-colors"
                        >
                          <span>التفاصيل</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-mall-900" />
                <span>ملف العميل: {selectedCustomer.name}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedCustomer(null)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">الهاتف:</span>
                <span className="font-mono font-bold text-gray-900 dir-ltr">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">الموقع:</span>
                <span className="font-bold text-gray-900">{selectedCustomer.governorate} — {selectedCustomer.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">العنوان التفصيلي:</span>
                <span className="text-gray-700 text-left max-w-[250px]">{selectedCustomer.address}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-500 font-bold">إجمالي المشتريات:</span>
                <span className="font-black text-green-700">{formatEGP(selectedCustomer.totalSpentEgp)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <span>طلبات العميل المسجلة ({selectedCustomer.orders.length})</span>
              </h4>

              {selectedCustomer.orders.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  تم استيراد رصيد هذا العميل من سجل المبيعات السابق (لا توجد طلبات إلكترونية مسجلة حالياً)
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {selectedCustomer.orders.map(o => (
                    <div key={o.id} className="p-3 border border-gray-200 rounded-xl flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <span className="font-mono font-bold text-mall-900 block">{o.order_number}</span>
                        <span className="text-[10px] text-gray-500">{formatDateTime(o.created_at)}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-green-700 block">{formatEGP(o.total_egp)}</span>
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="text-[10px] text-mall-900 font-bold hover:underline"
                        >
                          عرض الطلب &larr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
