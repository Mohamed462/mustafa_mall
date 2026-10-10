import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatCurrencyEGP, getWhatsAppUrl } from '../../utils/formatters';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { 
  Printer, 
  Upload, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  MessageCircle, 
  Trash2, 
  ShieldAlert 
} from 'lucide-react';

export const PrintServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useStoreSettings();

  const service = useMemo(() => {
    return slug ? dbStore.getPrintServiceBySlug(slug) : undefined;
  }, [slug]);

  // Dynamic Options State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [pagesCount, setPagesCount] = useState<number>(10);
  const [copiesCount, setCopiesCount] = useState<number>(1);
  const [bannerWidth, setBannerWidth] = useState<number>(2); // meters
  const [bannerHeight, setBannerHeight] = useState<number>(1); // meters
  const [quantity, setQuantity] = useState<number>(1);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Customer Contact State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Submission State
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);

  // Initialize default options
  React.useEffect(() => {
    if (service?.options) {
      const defaults: Record<string, string> = {};
      service.options.forEach(opt => {
        const defaultVal = opt.values.find(v => v.is_default) || opt.values[0];
        if (defaultVal) {
          defaults[opt.option_key] = defaultVal.value_key;
        }
      });
      setSelectedOptions(defaults);
    }
  }, [service]);

  // Pricing Calculation Engine with itemized breakdown
  const calculationBreakdown = useMemo(() => {
    if (!service) return { total: 0, items: [] };
    if (service.pricing_model === 'quote_only') return { total: 0, items: [{ label: 'نوع الطلب', amount: 'مقايسة فنية مخصصة' }] };

    const items: Array<{ label: string; amount: string }> = [];
    let total = 0;

    if (service.pricing_model === 'per_page') {
      let pricePerPage = service.base_price_egp;
      let fixedAddonsPerCopy = 0;

      if (service.options) {
        service.options.forEach(opt => {
          const selectedKey = selectedOptions[opt.option_key];
          const valObj = opt.values.find(v => v.value_key === selectedKey);
          if (valObj && valObj.price_impact_egp > 0) {
            const isPageLevel = opt.option_key.includes('color') || opt.option_key.includes('paper') || opt.option_key.includes('size') || opt.option_key.includes('weight');
            if (isPageLevel) {
              pricePerPage += valObj.price_impact_egp;
              items.push({ label: `${opt.label_ar} (${valObj.label_ar})`, amount: `+${formatCurrencyEGP(valObj.price_impact_egp)} / صفحة` });
            } else {
              fixedAddonsPerCopy += valObj.price_impact_egp;
              items.push({ label: `${opt.label_ar} (${valObj.label_ar})`, amount: `+${formatCurrencyEGP(valObj.price_impact_egp)} لكل نسخة` });
            }
          }
        });
      }

      const pagesTotal = pricePerPage * pagesCount * copiesCount;
      const addonsTotal = fixedAddonsPerCopy * copiesCount;
      const subtotal = pagesTotal + addonsTotal;
      total = Math.max(service.min_order_price_egp, subtotal);

      items.unshift({ label: 'سعر الصفحة المعتمد', amount: formatCurrencyEGP(pricePerPage) });
      items.push({ label: `إجمالي الصفحات (${pagesCount} صفحة × ${copiesCount} نسخ)`, amount: formatCurrencyEGP(pagesTotal) });
      if (addonsTotal > 0) {
        items.push({ label: `إجمالي التجليد والإضافات (${copiesCount} نسخ)`, amount: formatCurrencyEGP(addonsTotal) });
      }
      if (total > subtotal) {
        items.push({ label: 'الحد الأدنى للطلب', amount: formatCurrencyEGP(service.min_order_price_egp) });
      }
    } else if (service.pricing_model === 'per_sqm') {
      const area = Math.max(0.2, bannerWidth * bannerHeight);
      let pricePerSqm = service.base_price_egp;
      items.push({ label: 'المساحة المقدرة', amount: `${area.toFixed(2)} م²` });

      if (service.options) {
        service.options.forEach(opt => {
          const selectedKey = selectedOptions[opt.option_key];
          const valObj = opt.values.find(v => v.value_key === selectedKey);
          if (valObj && valObj.price_impact_egp > 0) {
            pricePerSqm += valObj.price_impact_egp;
            items.push({ label: `${opt.label_ar} (${valObj.label_ar})`, amount: `+${formatCurrencyEGP(valObj.price_impact_egp)} / م²` });
          }
        });
      }

      const subtotal = area * pricePerSqm * quantity;
      total = Math.max(service.min_order_price_egp, subtotal);
      items.unshift({ label: 'سعر المتر المربع المعتمد', amount: formatCurrencyEGP(pricePerSqm) });
      items.push({ label: `إجمالي البانرات (${quantity} قطع)`, amount: formatCurrencyEGP(subtotal) });
    } else if (service.pricing_model === 'per_unit') {
      let unitPrice = service.base_price_egp;

      if (service.options) {
        service.options.forEach(opt => {
          const selectedKey = selectedOptions[opt.option_key];
          const valObj = opt.values.find(v => v.value_key === selectedKey);
          if (valObj && valObj.price_impact_egp > 0) {
            unitPrice += valObj.price_impact_egp;
            items.push({ label: `${opt.label_ar} (${valObj.label_ar})`, amount: `+${formatCurrencyEGP(valObj.price_impact_egp)}` });
          }
        });
      }

      const subtotal = unitPrice * quantity;
      total = Math.max(service.min_order_price_egp, subtotal);
      items.unshift({ label: 'سعر القطعة المعتمد', amount: formatCurrencyEGP(unitPrice) });
      items.push({ label: `إجمالي القطع (${quantity} قطعة)`, amount: formatCurrencyEGP(subtotal) });
    }

    return { total, items };
  }, [service, selectedOptions, pagesCount, copiesCount, bannerWidth, bannerHeight, quantity]);

  const calculatedPrice = calculationBreakdown.total;


  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">خدمة الطباعة غير موجودة</h2>
        <Link to="/print-center" className="inline-block mt-4 px-6 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold">
          العودة لمركز الطباعة
        </Link>
      </div>
    );
  }

  // Handle Mock File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setTimeout(() => {
      const newFiles = Array.from(files).map(f => ({
        name: f.name,
        size: Math.round(f.size / 1024), // KB
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
    }, 600);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!customerName.trim() || customerName.trim().length < 3) {
      setErrorMsg('يرجى إدخال اسم العميل بالكامل.');
      return;
    }
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً.');
      return;
    }
    if (service.requires_file_upload && uploadedFiles.length === 0) {
      setErrorMsg('يرجى إرفاق ملف الطباعة المطلوب للمتابعة.');
      return;
    }

    const specifications: Record<string, any> = {
      ...selectedOptions,
      pricing_model: service.pricing_model,
    };

    if (service.pricing_model === 'per_page') {
      specifications['pages_count'] = pagesCount;
      specifications['copies_count'] = copiesCount;
    } else if (service.pricing_model === 'per_sqm') {
      specifications['dimensions'] = `${bannerWidth} × ${bannerHeight} م`;
      specifications['quantity'] = quantity;
    } else {
      specifications['quantity'] = quantity;
    }

    const newReq = dbStore.createPrintRequest({
      service_id: service.id,
      customer_name: customerName.trim(),
      customer_phone: cleanPhone,
      customer_email: customerEmail.trim() || undefined,
      specifications,
      quantity: service.pricing_model === 'per_page' ? copiesCount : quantity,
      notes: notes.trim() || undefined,
      calculated_price_egp: service.pricing_model === 'quote_only' ? undefined : calculatedPrice,
      status: 'new',
      files: uploadedFiles.map(f => ({
        id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file_name: f.name,
        file_path: `/private-uploads/${f.name}`,
        file_size_bytes: f.size * 1024,
        created_at: new Date().toISOString()
      }))
    });

    setSubmittedRequestNumber(newReq.request_number);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6 text-right">
      <Breadcrumbs items={[
        { label: 'مركز الطباعة', path: '/print-center' },
        { label: service.name_ar }
      ]} />

      {/* Confirmation Modal if request submitted */}
      {submittedRequestNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl z-10 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-mall-900">
              تم استلام طلب الطباعة بنجاح!
            </h2>
            <p className="text-xs text-gray-600">
              رقم الطلب المرجعي الخاص بك هو:
            </p>
            <div className="font-mono text-xl font-black text-cyan-800 bg-cyan-50 p-3 rounded-2xl border border-cyan-200">
              {submittedRequestNumber}
            </div>
            <p className="text-xs text-gray-500">
              سيقوم فريق مركز الطباعة بمراجعة الملفات وتأكيد المواصفات والتجهيز فوراً.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={getWhatsAppUrl(settings.whatsapp_number, `مرحباً مول المصطفى، أود متابعة طلب الطباعة رقم: ${submittedRequestNumber}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>متابعة الطلب عبر واتساب</span>
              </a>
              <Link
                to="/print-center"
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                العودة لمركز الطباعة
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Service Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={service.image_url || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80'}
          alt={service.name_ar}
          className="w-full sm:w-48 aspect-video sm:aspect-square object-cover rounded-2xl border border-gray-100 shrink-0"
        />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full text-xs font-bold">
            <Printer className="w-3.5 h-3.5" />
            <span>مركز الطباعة المتخصص</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900">
            {service.name_ar}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {service.description_ar}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>مدة التنفيذ التقريبية: {service.turnaround_hours} ساعة</span>
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Options & Upload form */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Service Specifications */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-5">
              <h2 className="text-base font-bold text-mall-900 pb-3 border-b border-gray-100">
                1. تحديد مواصفات الطباعة
              </h2>

              {/* Dynamic options from database */}
              {service.options?.map((opt) => (
                <div key={opt.id} className="space-y-2">
                  <label className="block text-xs font-bold text-gray-800">
                    {opt.label_ar}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.option_key] === val.value_key;
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.option_key]: val.value_key }))}
                          className={`p-3 rounded-xl border text-right text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-cyan-50 border-cyan-700 text-cyan-950 shadow-xs'
                              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{val.label_ar}</span>
                            {val.price_impact_egp > 0 && opt.option_key !== 'color_mode' && (
                              <span className="text-[10px] text-gray-400">
                                (+{formatCurrencyEGP(val.price_impact_egp)})
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Page & Copy Count inputs for per_page services */}
              {service.pricing_model === 'per_page' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      عدد صفحات المستند / الملف:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pagesCount}
                      onChange={(e) => setPagesCount(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      عدد النسخ المطلوبة:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={copiesCount}
                      onChange={(e) => setCopiesCount(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}

              {/* Banner Dimensions for per_sqm services */}
              {service.pricing_model === 'per_sqm' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">العرض (بالمتر):</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.5}
                      value={bannerWidth}
                      onChange={(e) => setBannerWidth(Number(e.target.value))}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">الارتفاع (بالمتر):</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.5}
                      value={bannerHeight}
                      onChange={(e) => setBannerHeight(Number(e.target.value))}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">العدد / الكمية:</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Quantity for per_unit / quote_only services */}
              {(service.pricing_model === 'per_unit' || service.pricing_model === 'quote_only') && (
                <div className="pt-2 max-w-xs">
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">الكمية المطلوبة:</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* 2. File Upload Box */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-mall-900 pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>2. رفع ملفات الطباعة</span>
                <span className="text-[11px] text-gray-400 font-normal">تخزين آمن ومشفر</span>
              </h2>

              <div className="border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-2xl p-6 text-center bg-cyan-50/30 transition-colors">
                <Upload className="w-10 h-10 text-cyan-600 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="inline-block py-2 px-4 bg-cyan-700 text-white rounded-xl text-xs font-bold hover:bg-cyan-800 transition-colors mb-1">
                    اختر الملفات من جهازك
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.psd,.ai,.eps,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-2">
                  الملفات المدعومة: PDF, Word, PowerPoint, PSD, AI, ZIP, صور عالية الدقة (حد أقصى 100 ميجابايت)
                </p>
                {isUploading && (
                  <p className="text-xs text-cyan-700 font-bold mt-2 animate-pulse">
                    جاري رفع وفحص الملفات بأمان...
                  </p>
                )}
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-800">الملفات المرفوعة:</h4>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-800">{file.name}</span>
                        <span className="text-gray-400">({file.size} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Customer Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-mall-900 pb-3 border-b border-gray-100">
                3. بيانات الاتصال والتسليم
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: د. إسلام نبيل"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    رقم الهاتف المحمول (واتساب) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="مثال: 01012345678"
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    ملاحظات وتعليمات خاصة للطباعة
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="اكتب أي ملاحظات تتعلق بالترتيب، التجليد أو ألوان الصفحات..."
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Calculation Summary (Sidebar) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-5 sticky top-24">
            <h3 className="text-sm font-black text-mall-900 pb-3 border-b border-gray-100">
              حساب تكلفة الطباعة
            </h3>

            {service.pricing_model === 'quote_only' ? (
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 space-y-2">
                <span className="font-bold block">طلب مقايسة وعرض سعر</span>
                <p className="text-[11px] text-cyan-800">
                  نظراً للطبيعة المخصصة لهذه الخدمة، سيقوم مهندس الطباعة بدراسة المقاسات وحساب أفضل سعر للتنفيذ وإرسال عرض السعر إليك مباشرة.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>نمط التسعير:</span>
                  <span className="font-bold text-gray-900">
                    {service.pricing_model === 'per_page' ? 'حساب بالصفحة' :
                     service.pricing_model === 'per_sqm' ? 'حساب بالمتر المربع' : 'حساب بالقطعة'}
                  </span>
                </div>

                {service.pricing_model === 'per_page' && (
                  <div className="flex justify-between">
                    <span>إجمالي الصفحات:</span>
                    <span className="font-bold text-gray-900">{pagesCount * copiesCount} صفحة</span>
                  </div>
                )}

                {/* Detailed Breakdown List */}
                <div className="p-3 bg-cyan-50/50 rounded-2xl border border-cyan-100 space-y-1.5 text-[11px]">
                  <span className="font-bold text-cyan-950 block border-b border-cyan-100 pb-1">
                    تفنيد حساب التكلفة:
                  </span>
                  {calculationBreakdown.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{item.label}:</span>
                      <span className="font-bold font-mono">{item.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="text-sm font-black text-gray-900">التكلفة الإجمالية:</span>
                  <span className="text-2xl font-black text-cyan-800">
                    {formatCurrencyEGP(calculatedPrice)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  * هذا السعر محسوب بدقة وفقاً لأسعار وخامات مركز الطباعة المعتمدة، ويتم اعتماده نهائياً فور تدقيق الملفات.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-101"
            >
              <span>{service.pricing_model === 'quote_only' ? 'إرسال طلب المقايسة' : 'تسجيل طلب الطباعة'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
              <ShieldAlert className="w-4 h-4 text-cyan-600" />
              <span>ملفاتك محفوظة بأمان وسرية تامة</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
