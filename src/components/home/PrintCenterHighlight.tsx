import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, FileText, BookOpen, Layers, CheckCircle2, ArrowLeft } from 'lucide-react';
import { TextureButton } from '../common/TextureButton';

export const PrintCenterHighlight: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 font-arabic">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#04383f] via-[#064850] to-[#08606B] text-white p-6 sm:p-10 border border-[#08606B]/40 shadow-floating">
        
        {/* FullMark Terminal / Blueprint SLA Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-white/80 font-semibold tracking-wider text-[11px] ms-2">
              CENTRAL PRINTING & LUXURY FINISHING // 2026
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#00D2D3]/15 text-[#00D2D3] border border-[#00D2D3]/30 px-3 py-1 rounded-full font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D2D3] animate-pulse"></span>
            <span>ضمان جودة معتمد</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-4 text-right">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#00D2D3] px-3.5 py-1 rounded-full text-xs font-bold">
              <Printer className="w-3.5 h-3.5" />
              <span>مركز الطباعة وتصوير الورق</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              اطبع مذكراتك، أبحاثك وكروتك.. هاتها تطبع في ثواني!
            </h2>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl">
              اطبع ورقك بأعلى جودة ليزر وتجليد فاخر هارد كفر مذهب، مع تسليم سريع وحساب فوري للتكلفة ع الملليم ومن غير ما تقف في طوابير!
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <span>أعلى وضوح ليزر وطباعة حبر أصلية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <span>تجليد فاخر هارد كفر وبصمة ذهبية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <span>سرية وأمان كامل لملفاتك وأبحاثك</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <span>حساب فوري للتكلفة وإرسال ع الواتس فوراً</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link to="/print-center">
                <TextureButton variant="accent" size="lg">
                  <span>احسب تكلفة طباعتك واطلب فوراً</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </TextureButton>
              </Link>
            </div>
          </div>

          {/* Service Cards Showcase */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-right">
            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all group hover:border-[#00D2D3]/50"
            >
              <FileText className="w-6 h-6 text-[#00D2D3] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">طباعة المستندات</h4>
              <p className="text-[10px] text-gray-300">أبيض وأسود وألوان A4/A3 بأعلى نقاء ليزر</p>
            </Link>

            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all group hover:border-[#00D2D3]/50"
            >
              <BookOpen className="w-6 h-6 text-[#00D2D3] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">أبحاث ورسائل ماجستير</h4>
              <p className="text-[10px] text-gray-300">تجليد هارد كفر فاخر وغلاف كرتوناج مذهب</p>
            </Link>

            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all group hover:border-[#00D2D3]/50"
            >
              <Layers className="w-6 h-6 text-[#00D2D3] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">كروت شخصية وفلايرات</h4>
              <p className="text-[10px] text-gray-300">كوشيه 350 جم وسلوفان مطفي وبصمة بارزة</p>
            </Link>

            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all group hover:border-[#00D2D3]/50"
            >
              <Printer className="w-6 h-6 text-[#00D2D3] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">بانرات ولوحات هندسية</h4>
              <p className="text-[10px] text-gray-300">طباعة بلوتر عالية الدقة ومقاومة للعوامل الجوية</p>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
