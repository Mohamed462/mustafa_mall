import React, { useState, useRef } from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { dbStore } from '../../services/dbStore';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  DollarSign, 
  Megaphone, 
  ShieldAlert, 
  CheckCircle2,
  Image as ImageIcon,
  Download,
  Upload,
  Database,
  Trash2,
  AlertTriangle,
  Layers,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { GovernorateShippingRate } from '../../types';
import { INITIAL_GOVERNORATE_SHIPPING_RATES } from '../../services/mockData';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStoreSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    store_name_ar: settings.store_name_ar,
    store_name_en: settings.store_name_en,
    logo_url: settings.logo_url,
    phone: settings.phone,
    whatsapp_number: settings.whatsapp_number,
    support_email: settings.support_email,
    address_ar: settings.address_ar,
    shipping_flat_fee_egp: settings.shipping_flat_fee_egp,
    free_shipping_threshold_egp: settings.free_shipping_threshold_egp,
    is_cod_enabled: settings.is_cod_enabled,
    announcement_text_ar: settings.announcement_text_ar,
    is_announcement_enabled: settings.is_announcement_enabled,
    category_display_style: settings.category_display_style || 'images_only',
    google_client_id: settings.google_client_id || '',
  });

  // Shipping Rates Management State
  const [shippingRates, setShippingRates] = useState<GovernorateShippingRate[]>(() => 
    settings.governorate_shipping_rates && settings.governorate_shipping_rates.length > 0 
      ? settings.governorate_shipping_rates 
      : dbStore.getGovernorateShippingRates()
  );
  const [shippingSearch, setShippingSearch] = useState('');
  const [shippingFilter, setShippingFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bulkFeeInput, setBulkFeeInput] = useState('');
  const [shippingSavedNotice, setShippingSavedNotice] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRateFeeChange = (id: string, fee: number) => {
    setShippingRates(prev => prev.map(r => r.id === id ? { ...r, fee_egp: Math.max(0, fee) } : r));
  };

  const handleRateDaysChange = (id: string, days: string) => {
    setShippingRates(prev => prev.map(r => r.id === id ? { ...r, estimated_days: days } : r));
  };

  const handleRateToggle = (id: string) => {
    setShippingRates(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  const handleApplyBulkFee = () => {
    const fee = parseFloat(bulkFeeInput);
    if (isNaN(fee) || fee < 0) {
      alert('يرجى كتابة مبلغ شحن صحيح (أكبر من أو يساوي 0)');
      return;
    }
    setShippingRates(prev => prev.map(r => ({ ...r, fee_egp: fee })));
    setBulkFeeInput('');
    setShippingSavedNotice(`تم تطبيق سعر (${fee} ج.م) على جميع المحافظات الـ 27! اضغط حفظ للاعتماد.`);
    setTimeout(() => setShippingSavedNotice(null), 4000);
  };

  const handleBulkToggle = (active: boolean) => {
    setShippingRates(prev => prev.map(r => ({ ...r, is_active: active })));
    setShippingSavedNotice(active ? 'تم تفعيل جميع المحافظات للشحن' : 'تم إيقاف الشحن لجميع المحافظات مؤقتاً');
    setTimeout(() => setShippingSavedNotice(null), 4000);
  };

  const handleResetShippingRates = () => {
    if (window.confirm('هل تريد استعادة قائمة أسعار ومواعيد التوصيل القياسية لجميع المحافظات؟')) {
      setShippingRates([...INITIAL_GOVERNORATE_SHIPPING_RATES]);
      setShippingSavedNotice('تم استعادة التسعير القياسي للمحافظات');
      setTimeout(() => setShippingSavedNotice(null), 4000);
    }
  };

  const handleSaveShippingOnly = () => {
    updateSettings({
      ...formData,
      shipping_flat_fee_egp: Number(formData.shipping_flat_fee_egp),
      free_shipping_threshold_egp: Number(formData.free_shipping_threshold_egp),
      category_display_style: formData.category_display_style as any,
      governorate_shipping_rates: shippingRates,
    });
    setShippingSavedNotice('تم حفظ وتحديث أسعار ومواعيد شحن المحافظات بنجاح!');
    setTimeout(() => setShippingSavedNotice(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      shipping_flat_fee_egp: Number(formData.shipping_flat_fee_egp),
      free_shipping_threshold_egp: Number(formData.free_shipping_threshold_egp),
      category_display_style: formData.category_display_style as any,
      governorate_shipping_rates: shippingRates,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportBackup = () => {
    const json = dbStore.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almostafa_mall_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupNotice('تم تحميل ملف النسخة الاحتياطية بنجاح إلى جهازك!');
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = dbStore.importBackup(content);
      if (res.success) {
        alert('تمت استعادة النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة لتطبيق البيانات.');
        window.location.reload();
      } else {
        alert(`فشلت استعادة النسخة الاحتياطية: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWipeOrdersOnly = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الطلبات والمبيعات التجريبية وسجلات الحركة؟ (سيتم الحفاظ الكامل على الأقسام والمنتجات والإعدادات)')) {
      dbStore.wipeMockData(false);
      setBackupNotice('تم مسح بيانات الطلبات والتجارب بنجاح مع الحفاظ على الأقسام والمنتجات!');
      setTimeout(() => setBackupNotice(null), 4000);
    }
  };

  const handleWipeMockDataAndProducts = () => {
    if (window.confirm('تحذير شديد: هل تريد مسح جميع المنتجات والطلبات التجريبية للبدء بمتجر فارغ تماماً؟ (سيتم الحفاظ على الأقسام والإعدادات فقط)')) {
      dbStore.wipeMockData(true);
      alert('تم مسح البيانات والمنتجات بنجاح. سيتم تحديث الصفحة.');
      window.location.reload();
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm('تحذير: هل أنت متأكد من إعادة ضبط قاعدة البيانات إلى الحالة الابتدائية لجميع المنتجات والأقسام والإعدادات؟')) {
      dbStore.resetToDefaults();
      window.location.reload();
    }
  };

  const filteredShippingRates = shippingRates.filter(r => {
    const matchesSearch = !shippingSearch.trim() || r.name_ar.includes(shippingSearch.trim());
    const matchesFilter = shippingFilter === 'all' 
      ? true 
      : shippingFilter === 'active' 
        ? r.is_active 
        : !r.is_active;
    return matchesSearch && matchesFilter;
  });

  const activeCount = shippingRates.filter(r => r.is_active).length;
  const averageFee = shippingRates.length > 0 
    ? Math.round(shippingRates.reduce((sum, r) => sum + r.fee_egp, 0) / shippingRates.length) 
    : 0;

  return (
    <div className="space-y-6 text-right max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-mall-900" />
            <span>إعدادات متجر مول المصطفى</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            إدارة بيانات المتجر، سياسات وتكاليف الشحن، أرقام خدمة العملاء وشريط الإعلانات
          </p>
        </div>

        {isSaved && (
          <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ الإعدادات بنجاح</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Brand & Identity */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-mall-900" />
            <span>الهوية التجارية والشعار</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">اسم المتجر (بالعربية) *</label>
              <input
                type="text"
                required
                value={formData.store_name_ar}
                onChange={(e) => handleChange('store_name_ar', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">اسم المتجر (بالإنجليزية) *</label>
              <input
                type="text"
                required
                value={formData.store_name_en}
                onChange={(e) => handleChange('store_name_en', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 block mb-1">مسار أو رابط الشعار الرسمي (Vector SVG / Image) *</label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  required
                  value={formData.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
                <div className="p-2 border border-gray-200 rounded-xl bg-gray-50 shrink-0">
                  <img src={formData.logo_url} alt="معاينة اللوجو" className="h-7 w-auto" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                المسار الافتراضي: <code>/logo.svg</code> (اللوجو الأساسي) أو <code>/logo-light.svg</code>
              </p>
            </div>
          </div>
        </div>

        {/* Section 1.5: Category Display Style */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-mall-900" />
              <span>نمط عرض بطاقات الأقسام في واجهة المتجر الرئيسية</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-bold">
              يحدد مظهر بطاقات الأقسام للزوار على الهاتف والكمبيوتر
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* images_only */}
            <div 
              onClick={() => handleChange('category_display_style', 'images_only')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.category_display_style === 'images_only'
                  ? 'border-[#08606B] bg-[#08606B]/5 ring-2 ring-[#08606B]/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-[#04383f] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#08606B]" />
                  <span>صور فقط (images_only)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D2D3]/20 text-[#04383f]">
                  الموصى به
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                بوسترات مرئية نقية بدون أي نصوص خارجية (الوضع المفضل للتصاميم والبوسترات المدمج بها خطوط وتصاميم).
              </p>
              <div className="text-[10px] font-bold text-[#08606B]">
                {formData.category_display_style === 'images_only' ? '✓ محدد حالياً' : 'انقر للتحديد'}
              </div>
            </div>

            {/* overlay */}
            <div 
              onClick={() => handleChange('category_display_style', 'overlay')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.category_display_style === 'overlay'
                  ? 'border-[#08606B] bg-[#08606B]/5 ring-2 ring-[#08606B]/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-[#04383f] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#08606B]" />
                  <span>نصوص مدمجة (overlay)</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                نصوص زجاجية متدرجة تظهر بشكل عصري فوق الصورة مع سهم التوجيه.
              </p>
              <div className="text-[10px] font-bold text-[#08606B]">
                {formData.category_display_style === 'overlay' ? '✓ محدد حالياً' : 'انقر للتحديد'}
              </div>
            </div>

            {/* minimal */}
            <div 
              onClick={() => handleChange('category_display_style', 'minimal')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.category_display_style === 'minimal'
                  ? 'border-[#08606B] bg-[#08606B]/5 ring-2 ring-[#08606B]/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-[#04383f] flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-[#08606B]" />
                  <span>بطاقات منفصلة (minimal)</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                تصميم بطاقات متاجر عالمية حيث تأتي الصورة في الأعلى وعنوان القسم وزر التصفح في شريط أبيض أنيق بالأسفل.
              </p>
              <div className="text-[10px] font-bold text-[#08606B]">
                {formData.category_display_style === 'minimal' ? '✓ محدد حالياً' : 'انقر للتحديد'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-mall-900" />
            <span>بيانات التواصل وعنوان المعرض في مصر</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">رقم الهاتف الأرضي / الموحد *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">رقم الواتساب المعتمد (WhatsApp) *</label>
              <input
                type="text"
                required
                value={formData.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">البريد الإلكتروني للدعم *</label>
              <input
                type="email"
                required
                value={formData.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-gray-700 block mb-1">عنوان المعرض والفرع الرئيسي *</label>
              <input
                type="text"
                required
                value={formData.address_ar}
                onChange={(e) => handleChange('address_ar', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-gray-700 block mb-1">
                معرف تطبيق Google لتسجيل الدخول (Google OAuth Client ID)
              </label>
              <input
                type="text"
                placeholder="مثال: 351405707678-xxxx.apps.googleusercontent.com"
                value={formData.google_client_id}
                onChange={(e) => handleChange('google_client_id', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden text-xs"
              />
              <span className="text-[11px] text-gray-500 block mt-1">
                من Google Cloud Console (APIs & Services ➔ Credentials) لتفعيل تسجيل الدخول الفوري للعملاء بحسابات Google.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Comprehensive Egyptian Governorates Shipping Management */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-mall-900" />
                <span>إدارة تسعير وشحن المحافظات المصرية (27 محافظة)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                تحكم كامل في سعر الشحن، مدة التوصيل، وتفعيل أو إيقاف أي محافظة بكل سهولة.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveShippingOnly}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ تسعير الشحن</span>
              </button>
            </div>
          </div>

          {shippingSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shippingSavedNotice}</span>
            </div>
          )}

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-gray-500 block">المحافظات المغطاة</span>
              <span className="text-base font-black text-mall-900 mt-0.5 block">
                {activeCount} / {shippingRates.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-gray-500 block">متوسط سعر الشحن</span>
              <span className="text-base font-black text-mall-900 mt-0.5 block">
                {averageFee} ج.م
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-gray-500 block">حد الشحن المجاني</span>
              <span className="text-base font-black text-emerald-700 mt-0.5 block">
                {formData.free_shipping_threshold_egp} ج.م
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-gray-500 block">الدفع عند الاستلام</span>
              <span className={`text-base font-black mt-0.5 block ${formData.is_cod_enabled ? 'text-emerald-700' : 'text-red-600'}`}>
                {formData.is_cod_enabled ? 'مُفعّل' : 'مُعطّل'}
              </span>
            </div>
          </div>

          {/* General Rules (Flat fee, Free shipping threshold, COD) */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
              <span>القواعد العامة للشحن والدفع</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">الشحن الافتراضي (لأي محافظة غير محددة) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.shipping_flat_fee_egp}
                    onChange={(e) => handleChange('shipping_flat_fee_egp', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl font-bold bg-white focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                  <span className="absolute end-3 top-2 text-gray-400 font-bold text-[11px]">ج.م</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">حد الشحن المجاني (Free Shipping) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.free_shipping_threshold_egp}
                    onChange={(e) => handleChange('free_shipping_threshold_egp', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl font-bold text-emerald-700 bg-white focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                  <span className="absolute end-3 top-2 text-gray-400 font-bold text-[11px]">ج.م</span>
                </div>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-gray-200 w-full hover:border-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.is_cod_enabled}
                    onChange={(e) => handleChange('is_cod_enabled', e.target.checked)}
                    className="rounded text-mall-900 focus:ring-mall-900 w-4 h-4"
                  />
                  <span className="font-bold text-gray-800 text-xs">تفعيل الدفع عند الاستلام (COD)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bulk Tools & Fast Control */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-mall-900" />
                <span>أدوات التعديل السريع لجميع المحافظات</span>
              </h4>
              <button
                type="button"
                onClick={handleResetShippingRates}
                className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 font-bold underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>استعادة التسعير الافتراضي</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white p-1.5 px-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="font-bold text-gray-600 text-[11px]">سعر موحد للكل:</span>
                <input
                  type="number"
                  min="0"
                  value={bulkFeeInput}
                  onChange={(e) => setBulkFeeInput(e.target.value)}
                  placeholder="مثال: 50"
                  className="w-20 p-1 border border-gray-200 rounded-lg text-center font-bold text-xs focus:outline-none focus:border-mall-900"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkFee}
                  className="px-3 py-1 bg-mall-900 hover:bg-mall-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  تطبيق على الكل
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkToggle(true)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  تفعيل جميع المحافظات (27)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkToggle(false)}
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-800 border border-red-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  تعطيل الكل مؤقتاً
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={shippingSearch}
                onChange={(e) => setShippingSearch(e.target.value)}
                placeholder="ابحث عن اسم محافظة..."
                className="w-full p-2 px-8 border border-gray-200 rounded-xl bg-white font-bold focus:outline-none focus:border-mall-900 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute start-2.5 top-2.5 pointer-events-none" />
              {shippingSearch && (
                <button
                  type="button"
                  onClick={() => setShippingSearch('')}
                  className="absolute end-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setShippingFilter('all')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  shippingFilter === 'all' ? 'bg-white text-mall-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                الكل ({shippingRates.length})
              </button>
              <button
                type="button"
                onClick={() => setShippingFilter('active')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  shippingFilter === 'active' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                المفعلة ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setShippingFilter('inactive')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  shippingFilter === 'inactive' ? 'bg-white text-red-800 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                المتوقفة ({shippingRates.length - activeCount})
              </button>
            </div>
          </div>

          {/* Interactive Governorates Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">المحافظة</th>
                    <th className="p-3">سعر الشحن (ج.م)</th>
                    <th className="p-3">مدة التوصيل المتوقعة</th>
                    <th className="p-3 text-center">حالة الشحن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredShippingRates.length > 0 ? (
                    filteredShippingRates.map((rate, index) => (
                      <tr 
                        key={rate.id}
                        className={`hover:bg-slate-50/80 transition-colors ${!rate.is_active ? 'bg-gray-50/40 opacity-70' : ''}`}
                      >
                        <td className="p-3 font-mono text-gray-400 text-[11px]">{index + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 text-xs">{rate.name_ar}</span>
                            <span className="text-[10px] text-gray-400 font-mono">({rate.id})</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 max-w-[140px]">
                            <input
                              type="number"
                              min="0"
                              value={rate.fee_egp}
                              onChange={(e) => handleRateFeeChange(rate.id, parseFloat(e.target.value) || 0)}
                              className="w-20 p-1.5 border border-gray-200 rounded-lg text-center font-black text-xs text-mall-900 focus:outline-none focus:border-mall-900 bg-white"
                            />
                            <span className="text-gray-400 font-bold text-[11px]">ج.م</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={rate.estimated_days}
                            onChange={(e) => handleRateDaysChange(rate.id, e.target.value)}
                            placeholder="مثال: 24 ساعة"
                            className="w-36 p-1.5 border border-gray-200 rounded-lg text-right font-medium text-xs text-gray-800 focus:outline-none focus:border-mall-900 bg-white"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRateToggle(rate.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                              rate.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {rate.is_active ? '✓ مفعّلة للشحن' : '✕ متوقفة مؤقتاً'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">
                        لا توجد محافظات مطابقة لبحثك "{shippingSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Announcement Bar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-mall-900" />
            <span>شريط الإعلانات الترويجي أعلى الصفحة (Announcement Bar)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">نص الإعلان *</label>
              <input
                type="text"
                value={formData.announcement_text_ar}
                onChange={(e) => handleChange('announcement_text_ar', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_announcement_enabled}
                  onChange={(e) => handleChange('is_announcement_enabled', e.target.checked)}
                  className="rounded text-mall-900 focus:ring-mall-900"
                />
                <span className="font-bold text-gray-800">إظهار شريط الإعلانات للزوار في واجهة المتجر</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Backup & Data Management */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-mall-900" />
              <span>النسخ الاحتياطي وإدارة البيانات (Backup & Mock Data)</span>
            </h3>
            <span className="text-[11px] text-gray-400">حفظ محلي فوري واسترجاع آمن</span>
          </div>

          {backupNotice && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{backupNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Export JSON */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-black text-gray-900">
                  <Download className="w-4 h-4 text-gold-600" />
                  <span>تحميل نسخة احتياطية محلية (Export JSON)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  تنزيل ملف JSON كامل يحتوي على كافة بيانات المتجر (المنتجات، الأقسام، الطلبات، الإعدادات، المستخدمين) لحفظها على جهازك.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-2 w-full py-2.5 px-4 bg-mall-900 hover:bg-mall-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تحميل النسخة الاحتياطية الآن</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-black text-gray-900">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>استعادة نسخة احتياطية من ملف (Import JSON)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  رفع ملف JSON محفوظ مسبقاً لاسترجاع بيانات المتجر وحالتها السابقة بالكامل.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختيار ملف النسخة الاحتياطية</span>
                </button>
              </div>
            </div>

            {/* Wipe Mock Orders Only */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <Trash2 className="w-4 h-4 text-amber-600" />
                  <span>مسح الطلبات والمبيعات التجريبية</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  تصفير سجلات الطلبات والمبيعات التجريبية وحركات المخزون مع الحفاظ الكامل على أقسام ومنتجات المتجر.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWipeOrdersOnly}
                className="mt-2 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح سجلات الطلبات التجريبية</span>
              </button>
            </div>

            {/* Wipe Mock Products & Orders */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-black text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>تفريغ الكتالوج والبدء بمتجر فارغ</span>
                </div>
                <p className="text-[11px] text-red-700 mt-1">
                  مسح جميع المنتجات والطلبات التجريبية للبدء بإدخال منتجات حقيقية، مع الإبقاء على الأقسام الرئيسية والإعدادات.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWipeMockDataAndProducts}
                className="mt-2 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>تفريغ المنتجات والطلبات التجريبية</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-mall-900 text-white rounded-xl font-bold text-xs hover:bg-mall-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وتطبيق جميع الإعدادات</span>
          </button>

          <button
            type="button"
            onClick={handleResetDatabase}
            className="w-full sm:w-auto px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط المتجر للحالة الافتراضية (Reset DB)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
