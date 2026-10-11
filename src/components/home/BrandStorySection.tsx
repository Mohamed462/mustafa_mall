import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Printer, HeartHandshake, Sparkles, Truck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { TextureButton } from '../common/TextureButton';

export const BrandStorySection: React.FC = () => {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-12 my-8 border border-[rgba(17,21,26,0.11)] shadow-card relative overflow-hidden text-right font-arabic">
      
      {/* Subtle FullMark teal glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#08606B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00D2D3]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#08606B]/8 border border-[#08606B]/20 text-[#08606B] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2D3]" />
            <span>ليه مول المصطفى؟</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#11151a] tracking-tight">
            ليه تشتري وتطبع من <span className="text-[#08606B]">مول المصطفى</span>؟
          </h2>
          <p className="text-[#5f6870] text-xs sm:text-sm mt-2 leading-relaxed">
            علشان بنجمعلك الأصلي بأحسن سعر في مصر، وشحن سريع لباب بيتك، ومتابعة ع الواتساب لحظة بلحظة!
          </p>
        </div>

        {/* 4 Pillars Grid (Inspired by Kairo UI Why Choose Us) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-[#f8fafb] p-5 rounded-2xl border border-[rgba(17,21,26,0.08)] hover:border-[#08606B]/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#08606B]/10 text-[#08606B] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#08606B]" />
              </div>
              <h3 className="text-sm font-black text-[#11151a] mb-1">
                بضاعة أصلية ومضمونة 100%
              </h3>
              <p className="text-xs text-[#5f6870] leading-relaxed">
                توريد مباشر من الوكلاء المعتمدين مع حق استبدال واسترجاع مريح.
              </p>
            </div>
          </div>

          <div className="bg-[#f8fafb] p-5 rounded-2xl border border-[rgba(17,21,26,0.08)] hover:border-[#08606B]/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#08606B]/10 text-[#08606B] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
                <Printer className="w-5 h-5 text-[#08606B]" />
              </div>
              <h3 className="text-sm font-black text-[#11151a] mb-1">
                طباعة وتجليد ديجيتال فاخر
              </h3>
              <p className="text-xs text-[#5f6870] leading-relaxed">
                أحدث خطوط طباعة الرسائل والأبحاث والبانرات بدقة ليزر وتجليد مذهب.
              </p>
            </div>
          </div>

          <div className="bg-[#f8fafb] p-5 rounded-2xl border border-[rgba(17,21,26,0.08)] hover:border-[#08606B]/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#08606B]/10 text-[#08606B] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
                <Truck className="w-5 h-5 text-[#08606B]" />
              </div>
              <h3 className="text-sm font-black text-[#11151a] mb-1">
                شحن سريع لكل المحافظات
              </h3>
              <p className="text-xs text-[#5f6870] leading-relaxed">
                تغليف محترم ويوصلك في 24 إلى 48 ساعة مع كود تتبع مباشر.
              </p>
            </div>
          </div>

          <div className="bg-[#f8fafb] p-5 rounded-2xl border border-[rgba(17,21,26,0.08)] hover:border-[#08606B]/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#08606B]/10 text-[#08606B] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
                <HeartHandshake className="w-5 h-5 text-[#08606B]" />
              </div>
              <h3 className="text-sm font-black text-[#11151a] mb-1">
                عاين وافحص قبل ما تدفع
              </h3>
              <p className="text-xs text-[#5f6870] leading-relaxed">
                حقك تعاين وتتأكد من طلبك مع مندوب الشحن قبل ما تدفع أي مليم.
              </p>
            </div>
          </div>

        </div>

        {/* Big Blueprint SLA Metrics Banner from FullMark */}
        <div className="bg-[#04383f] text-white rounded-2xl p-6 sm:p-8 border border-[#08606B]/40 shadow-blueprint">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/10">
            
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-[#00D2D3] font-mono mb-1">
                +50,000
              </div>
              <div className="text-xs text-gray-200 font-bold">طلب ناجح تم تسليمه</div>
              <div className="text-[10px] text-gray-400 mt-0.5">ثقة عملائنا في كافة محافظات مصر</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">
                27
              </div>
              <div className="text-xs text-gray-200 font-bold">محافظة مغطاة بالشحن</div>
              <div className="text-[10px] text-gray-400 mt-0.5">توصيل سريع ومتابعة مباشرة</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-[#00D2D3] font-mono mb-1">
                100%
              </div>
              <div className="text-xs text-gray-200 font-bold">فحص ومعاينة قبل الدفع</div>
              <div className="text-[10px] text-gray-400 mt-0.5">شفافية كاملة مع كل عميل</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">
                24/7
              </div>
              <div className="text-xs text-gray-200 font-bold">دعم واستشارات ومتابعة</div>
              <div className="text-[10px] text-gray-400 mt-0.5">فريق متخصص للإجابة عن أسئلتك</div>
            </div>

          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#f8fafb] border border-[rgba(17,21,26,0.08)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#08606B]" />
            <p className="text-xs sm:text-sm font-bold text-[#11151a]">
              جاهز تبدأ تجربة التسوق أو تطلب مقايسة طباعة لأبحاثك ومشاريعك؟
            </p>
          </div>
          <Link to="/shop">
            <TextureButton variant="primary" size="default">
              <span>تصفح كتالوج المتجر الآن</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </TextureButton>
          </Link>
        </div>

      </div>
    </section>
  );
};
