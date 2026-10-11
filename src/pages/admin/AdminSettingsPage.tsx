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
  LayoutGrid
} from 'lucide-react';

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
  });

  const [isSaved, setIsSaved] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      shipping_flat_fee_egp: Number(formData.shipping_flat_fee_egp),
      free_shipping_threshold_egp: Number(formData.free_shipping_threshold_egp),
      category_display_style: formData.category_display_style as any,
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
          </div>
        </div>

        {/* Section 3: Shipping & Payment Rules */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-mall-900" />
            <span>سياسات الشحن والدفع (جمهورية مصر العربية)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">تكلفة الشحن الثابتة (ج.م) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.shipping_flat_fee_egp}
                onChange={(e) => handleChange('shipping_flat_fee_egp', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">حد الشحن المجاني (ج.م) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.free_shipping_threshold_egp}
                onChange={(e) => handleChange('free_shipping_threshold_egp', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-bold text-green-700 focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_cod_enabled}
                  onChange={(e) => handleChange('is_cod_enabled', e.target.checked)}
                  className="rounded text-mall-900 focus:ring-mall-900"
                />
                <span className="font-bold text-gray-800">تفعيل الدفع عند الاستلام (COD)</span>
              </label>
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
