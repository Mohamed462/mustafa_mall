import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { PrintStatus } from '../../types';
import { formatCurrencyEGP, formatDateArabic, getWhatsAppUrl } from '../../utils/formatters';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { 
  Printer, 
  FileText, 
  Download, 
  MessageCircle, 
  Save, 
  Clock, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

export const AdminPrintRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useStoreSettings();

  const [request, setRequest] = useState(() => id ? dbStore.getPrintRequestById(id) : undefined);
  const [status, setStatus] = useState<PrintStatus>(request?.status || 'new');
  const [finalQuote, setFinalQuote] = useState<number | ''>(request?.final_quote_egp || '');
  const [internalNotes, setInternalNotes] = useState(request?.internal_notes || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">طلب الطباعة غير موجود</h2>
        <Link to="/admin/printing/requests" className="text-xs font-bold text-cyan-800 underline">
          العودة لقائمة طلبات الطباعة
        </Link>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbStore.updatePrintRequestStatus(
      request.id,
      status,
      finalQuote !== '' ? Number(finalQuote) : undefined,
      internalNotes
    );
    if (updated) {
      setRequest({ ...updated });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const whatsappMessage = `مرحباً ${request.customer_name}، نتواصل معك من مركز الطباعة بمول المصطفى بخصوص طلبك رقم (${request.request_number}). ${
    finalQuote ? `عرض السعر المعتمد لطلبك هو ${formatCurrencyEGP(Number(finalQuote))}.` : ''
  }`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              طلب الطباعة: {request.request_number}
            </h1>
            <span className="text-xs bg-cyan-100 text-cyan-800 font-bold px-3 py-0.5 rounded-full">
              {request.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            الخدمة: <strong>{request.service?.name_ar || 'خدمة مخصصة'}</strong> • تاريخ التقديم: {formatDateArabic(request.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppUrl(request.customer_phone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال السعر عبر واتساب</span>
          </a>
          <Link
            to="/admin/printing/requests"
            className="py-2 px-3 text-xs text-gray-500 hover:text-gray-800"
          >
            ← العودة للقائمة
          </Link>
        </div>
      </div>

      {/* Quotation & Status Control Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-mall-900 pb-2 border-b border-gray-100">
          تحديد عرض السعر وتحديث حالة الإنتاج
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">حالة الطلب الحالية:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white font-bold"
              >
                <option value="new">طلب جديد</option>
                <option value="under_review">قيد الفحص الفني للملفات</option>
                <option value="awaiting_quote">بانتظار التسعير</option>
                <option value="quote_sent">تم إرسال عرض السعر للعميل</option>
                <option value="approved">معتمد من العميل</option>
                <option value="in_production">في مرحلة الطباعة والإنتاج</option>
                <option value="ready_for_pickup">جاهز للاستلام أو الشحن</option>
                <option value="completed">مكتمل ومسلم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">عرض السعر النهائي المعتمد (ج.م):</label>
              <input
                type="number"
                step="0.5"
                value={finalQuote}
                onChange={(e) => setFinalQuote(e.target.value ? Number(e.target.value) : '')}
                placeholder="أدخل السعر النهائي المحسوب"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-black text-cyan-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات فريق العمل الداخلية (سري):</label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="مثال: تم التأكد من جودة دقة الصور والألوان CMYK..."
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات وعرض السعر</span>
            </button>
            {saveSuccess && (
              <span className="text-xs font-bold text-green-600">✓ تم حفظ الحالة وعرض السعر بنجاح!</span>
            )}
          </div>
        </form>
      </div>

      {/* Customer Info & Submitted Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-2 text-xs">
          <h4 className="font-bold text-mall-900 text-sm mb-2">بيانات العميل</h4>
          <p>الاسم: <strong className="text-gray-900">{request.customer_name}</strong></p>
          <p>الهاتف: <strong className="font-mono text-gray-900">{request.customer_phone}</strong></p>
          {request.customer_email && <p>البريد: {request.customer_email}</p>}
          {request.notes && (
            <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-bold block text-gray-700 mb-0.5">تعليمات العميل:</span>
              <p className="text-gray-600">{request.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-2 text-xs">
          <h4 className="font-bold text-mall-900 text-sm mb-2">المواصفات المطلوبة</h4>
          <div className="space-y-1">
            {Object.entries(request.specifications).map(([key, val]) => (
              <div key={key} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-[11px]">{key}:</span>
                <span className="font-bold text-gray-800">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Uploaded Files (Controlled Access) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <h4 className="font-black text-mall-900 text-sm pb-2 border-b border-gray-100">
          الملفات المرفوعة للطباعة ({request.files.length})
        </h4>

        {request.files.length === 0 ? (
          <p className="text-xs text-gray-400 py-3">لم يقم العميل برفع ملفات في هذا الطلب.</p>
        ) : (
          <div className="space-y-2">
            {request.files.map((file) => (
              <div key={file.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-700" />
                  <div>
                    <strong className="text-gray-900 block">{file.file_name}</strong>
                    <span className="text-[10px] text-gray-400">
                      الحجم: {file.file_size_bytes ? `${Math.round(file.file_size_bytes / 1024)} KB` : 'غير محدد'}
                    </span>
                  </div>
                </div>

                <a
                  href={`#download-${file.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`جاري تحميل ملف "${file.file_name}" من المستودع الآمن...`);
                  }}
                  className="py-1 px-3 bg-white border border-gray-200 hover:border-cyan-600 text-cyan-800 rounded-lg font-bold flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الملف</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
