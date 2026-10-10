import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Printer, HeartHandshake, Sparkles, Truck, CheckCircle2, ArrowLeft } from 'lucide-react';

export const BrandStorySection: React.FC = () => {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-12 my-8 border border-slate-200/80 shadow-card relative overflow-hidden text-right">
      
      {/* Subtle gold glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>قصتنا وهويتنا | مول المصطفى</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            الريادة والموثوقية في قلب <span className="text-gold-600">التجارة العائلية المصرية</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed">
            انطلق مول المصطفى برؤية طموحة تجمع بين دفء التعامل التجاري الأصيل وأحدث تقنيات التجارة الإلكترونية، لنقدم للبيت المصري تجربة تسوق شاملة، موثوقة، وبأسعار عادلة ومضمونة.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 hover:border-gold-400/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-white text-gold-600 border border-slate-200 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1.5">
              منتجات أصلية 100%
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              نتعامل مباشرة مع الموزعين والوكلاء المعتمدين لضمان مطابقة أعلى معايير الجودة والأصالة.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 hover:border-gold-400/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 border border-slate-200 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1.5">
              مركز طباعة رقمية متكامل
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ماكينات ديجيتال متطورة لطباعة الأبحاث، الرسائل الجامعية، البانرات وكروت العمل بدقة ليزر.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 hover:border-gold-400/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-white text-gold-600 border border-slate-200 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1.5">
              شحن سريع لكافة المحافظات
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              توصيل دقيق وتغليف آمن لباب منزلك في كافة أنحاء جمهورية مصر العربية مع تتبع مباشر.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 hover:border-gold-400/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 border border-slate-200 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1.5">
              حق المعاينة قبل الدفع
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              فريق دعم فني متواجد يومياً مع إمكانية فحص المنتج قبل الاستلام وسياسة استبدال مرنة.
            </p>
          </div>

        </div>

        {/* Big Numbers Banner */}
        <div className="bg-[#0A0A0B] text-white rounded-xl p-6 sm:p-8 border border-[#1C2526]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#1C2526]">
            
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-[#B89B5E] font-mono mb-1">
                +50,000
              </div>
              <div className="text-xs text-gray-200 font-bold">عميل يثق بنا</div>
              <div className="text-[10px] text-gray-400 mt-0.5">في مختلف محافظات مصر</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">
                27
              </div>
              <div className="text-xs text-gray-200 font-bold">محافظة مغطاة بالشحن</div>
              <div className="text-[10px] text-gray-400 mt-0.5">توصيل سريع وآمن</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-[#D4AF37] font-mono mb-1">
                +12,000
              </div>
              <div className="text-xs text-gray-200 font-bold">منتج متنوع متاح</div>
              <div className="text-[10px] text-gray-400 mt-0.5">في 8 أقسام رئيسية</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-[#0D7377] font-mono mb-1">
                99.4%
              </div>
              <div className="text-xs text-gray-200 font-bold">نسبة رضا العملاء</div>
              <div className="text-[10px] text-gray-400 mt-0.5">تقييمات إيجابية حقيقية</div>
            </div>

          </div>

          {/* Bottom Call to Action */}
          <div className="mt-6 pt-5 border-t border-[#1C2526] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0D7377]/20 text-[#0D7377] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="text-xs sm:text-sm font-bold text-white">هل ترغب في معرفة المزيد عن خدماتنا وتاريخنا؟</h4>
                <p className="text-[11px] text-gray-400">تفضل بزيارة صفحة "عن مول المصطفى" وتعرف على معاييرنا وسياساتنا.</p>
              </div>
            </div>

            <Link
              to="/page/about"
              className="inline-flex items-center gap-2 bg-[#1C2526] hover:bg-[#253032] text-white border border-[#2B3537] px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0"
            >
              <span>اقرأ قصة مول المصطفى كاملة</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};
