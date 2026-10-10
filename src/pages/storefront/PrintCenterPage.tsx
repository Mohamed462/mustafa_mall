import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatCurrencyEGP } from '../../utils/formatters';
import { 
  Printer, 
  FileText, 
  BookOpen, 
  Layers, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Sparkles,
  HelpCircle,
  UploadCloud 
} from 'lucide-react';

export const PrintCenterPage: React.FC = () => {
  const printServices = useMemo(() => {
    return dbStore.getPrintServices().filter(s => s.is_active);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-8 text-right">
      <Breadcrumbs items={[{ label: 'مركز الطباعة المتخصص' }]} />

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-mall-950 via-mall-900 to-cyan-950 text-white p-6 sm:p-12 shadow-xl border border-mall-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-3 py-1 rounded-full text-xs font-bold">
            <Printer className="w-4 h-4" />
            <span>خدمات طباعة رقمية متكاملة</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            مركز الطباعة والتصوير الرقمي بمول المصطفى
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
            نقدم أعلى مستويات الجودة في طباعة الأبحاث، الرسائل الجامعية، تجليد الكتب، كروت العمل الفاخرة، البانرات والفلكس الإعلاني، والاستيكرات المقصوصة. ارفع ملفاتك فوراً واحسب تكلفتك بدقة.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <ShieldCheck className="w-4 h-4" />
              <span>سرية تامة وأمان للمستندات</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Clock className="w-4 h-4" />
              <span>تسليم قياسي وفوري</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300">
              <UploadCloud className="w-4 h-4" />
              <span>دعم كافة صيغ الملفات (PDF / Word / PSD)</span>
            </div>
          </div>
        </div>
        <Sparkles className="absolute -bottom-10 -start-10 w-64 h-64 text-white/5 stroke-1 pointer-events-none" />
      </div>

      {/* Services Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-mall-900">
              كتالوج خدمات الطباعة المتاحة
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              اختر الخدمة المطلوبة لبدء تخصيص الخيارات وحساب التكلفة ورفع الملفات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {printServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-50 mb-4 border border-gray-100">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80'}
                    alt={service.name_ar}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 end-2.5 bg-mall-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {service.pricing_model === 'per_page' ? 'حساب بالصفحة' :
                     service.pricing_model === 'per_sqm' ? 'حساب بالمتر المربع' :
                     service.pricing_model === 'per_unit' ? 'حساب بالقطعة' : 'عرض سعر مخصص'}
                  </div>
                </div>

                <h3 className="text-base font-black text-mall-900 mb-1">
                  {service.name_ar}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {service.description_ar}
                </p>

                {/* Base price */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span>يبدأ من:</span>
                  <span className="font-black text-mall-900 text-sm">
                    {service.pricing_model === 'quote_only' ? (
                      <span className="text-cyan-700 font-bold">حسب المقايسة</span>
                    ) : (
                      formatCurrencyEGP(service.base_price_egp)
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <Link
                  to={`/print-center/service/${service.slug}`}
                  className="w-full py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>طلب الخدمة وحساب التكلفة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works info */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-10 space-y-6">
        <h3 className="text-lg font-black text-mall-900">
          كيف يعمل طلب الطباعة عبر مول المصطفى؟
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-right">
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="w-7 h-7 rounded-full bg-cyan-700 text-white font-black text-xs flex items-center justify-center">1</span>
            <h4 className="font-bold text-xs text-gray-900">اختر الخدمة والمواصفات</h4>
            <p className="text-[11px] text-gray-500">حدد المقاس، نوع الورق، الألوان والتجليد المطلوب.</p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="w-7 h-7 rounded-full bg-cyan-700 text-white font-black text-xs flex items-center justify-center">2</span>
            <h4 className="font-bold text-xs text-gray-900">ارفع ملفاتك بأمان</h4>
            <p className="text-[11px] text-gray-500">ارفع ملف PDF أو مستند البحث المشفر في سيرفراتنا الآمنة.</p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="w-7 h-7 rounded-full bg-cyan-700 text-white font-black text-xs flex items-center justify-center">3</span>
            <h4 className="font-bold text-xs text-gray-900">احسب التكلفة وسجل الطلب</h4>
            <p className="text-[11px] text-gray-500">احصل على رقم مرجعي لتتبع حالة الطباعة والتجهيز.</p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="w-7 h-7 rounded-full bg-cyan-700 text-white font-black text-xs flex items-center justify-center">4</span>
            <h4 className="font-bold text-xs text-gray-900">استلم طلبك فوراً</h4>
            <p className="text-[11px] text-gray-500">استلم من مقر المول أو اطلب التوصيل حتى باب بيتك.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
