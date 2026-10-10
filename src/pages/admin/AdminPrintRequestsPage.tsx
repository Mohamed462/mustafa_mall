import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { PrintStatus } from '../../types';
import { formatCurrencyEGP, formatDateArabic } from '../../utils/formatters';
import { Printer, Search, Eye, Clock, FileText } from 'lucide-react';

export const AdminPrintRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState(() => dbStore.getPrintRequests());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch = 
        r.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer_name.includes(searchTerm) ||
        r.customer_phone.includes(searchTerm);
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  const getStatusBadge = (status: PrintStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">طلب جديد</span>;
      case 'under_review':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">قيد الفحص الفني</span>;
      case 'awaiting_quote':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">بانتظار التسعير</span>;
      case 'quote_sent':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">تم إرسال المقايسة</span>;
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">معتمد من العميل</span>;
      case 'in_production':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">في مرحلة الطباعة</span>;
      case 'ready_for_pickup':
        return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">جاهز للاستلام</span>;
      case 'completed':
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">مكتمل ومسلم</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">ملغي</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900">
            طلبات مركز الطباعة والمقايسات ({requests.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة ملفات العملاء المرفوعة، إعداد عروض الأسعار، وتحديث حالات التنفيذ
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم الطلب (PRNT-XXXXXX) أو اسم العميل أو الهاتف..."
            className="w-full text-xs p-2.5 pe-9 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-56 text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 cursor-pointer"
        >
          <option value="all">جميع الحالات</option>
          <option value="new">طلب جديد</option>
          <option value="under_review">قيد الفحص الفني</option>
          <option value="awaiting_quote">بانتظار التسعير</option>
          <option value="quote_sent">تم إرسال المقايسة</option>
          <option value="in_production">في مرحلة الطباعة</option>
          <option value="ready_for_pickup">جاهز للاستلام</option>
          <option value="completed">مكتمل</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right divide-y divide-gray-100">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">رقم الطلب</th>
                <th className="py-3.5 px-4">الخدمة</th>
                <th className="py-3.5 px-4">العميل والهاتف</th>
                <th className="py-3.5 px-4">الملفات</th>
                <th className="py-3.5 px-4">التكلفة التقديرية</th>
                <th className="py-3.5 px-4">عرض السعر المعتمد</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    لا توجد طلبات طباعة مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-900">
                      {req.request_number}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {req.service?.name_ar || 'خدمة مخصصة'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800 block">{req.customer_name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{req.customer_phone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{req.files.length} ملفات</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {req.calculated_price_egp ? formatCurrencyEGP(req.calculated_price_egp) : 'مقايسة'}
                    </td>

                    <td className="py-3.5 px-4 font-black text-cyan-900">
                      {req.final_quote_egp ? formatCurrencyEGP(req.final_quote_egp) : '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/admin/printing/requests/${req.id}`}
                        className="inline-flex items-center gap-1 py-1 px-3 bg-gray-50 hover:bg-cyan-50 text-cyan-800 rounded-lg font-bold border border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص وتسعير</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
