import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, FileText, BookOpen, Layers, CheckCircle2, ArrowLeft } from 'lucide-react';

export const PrintCenterHighlight: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0A0A0B] via-[#14181B] to-[#1C2526] text-white p-6 sm:p-10 border border-[#B89B5E]/30 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-4 text-right">
            <div className="inline-flex items-center gap-2 bg-[#B89B5E]/15 border border-[#B89B5E]/40 text-[#B89B5E] px-3.5 py-1 rounded-full text-xs font-bold">
              <Printer className="w-3.5 h-3.5" />
              <span>مركز الطباعة والتصوير الرقمي المعتمد</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              خدمات طباعة متكاملة للطلاب والباحثين والمؤسسات
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
              نوفر خطوط إنتاج ديجيتال متطورة: طباعة وتجليد الرسائل والأبحاث الجامعية، كروت العمل الفاخرة، البانرات الإعلانية، والاستيكرات المقصوصة بأعلى دقة ألوان CMYK مع تسليم سريع وحساب فوري للتكلفة.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D7377] shrink-0" />
                <span>أعلى دقة وضوح ليزر 1200 DPI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D7377] shrink-0" />
                <span>تجليد كعب حراري وبصمة ذهبية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D7377] shrink-0" />
                <span>سرية وأمان تام لكافة المستندات</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D7377] shrink-0" />
                <span>حساب تكلفة فوري ورفع الملفات أونلاين</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/print-center"
                className="inline-flex items-center gap-2 bg-[#B89B5E] hover:bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs sm:text-sm px-6 py-3 rounded-lg shadow-md transition-all hover:scale-102"
              >
                <span>احسب تكلفة طلبك واطلب الطباعة فوراً</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Service Cards Showcase */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-right">
            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <FileText className="w-6 h-6 text-[#B89B5E] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">طباعة المستندات</h4>
              <p className="text-[10px] text-gray-400">أبيض وأسود وألوان A4/A3 بأعلى نقاء</p>
            </Link>

            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <BookOpen className="w-6 h-6 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">أبحاث ورسائل ماجستير</h4>
              <p className="text-[10px] text-gray-400">تجليد فاخر وغلاف كرتوناج مقوى</p>
            </Link>

            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <Layers className="w-6 h-6 text-[#B89B5E] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">كروت شخصية وفلايرات</h4>
              <p className="text-[10px] text-gray-400">كوشيه 350 جم وسلوفان مطفي فاخر</p>
            </Link>

            <Link
              to="/print-center"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <Printer className="w-6 h-6 text-[#0D7377] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">بانرات ولافتات فلكس</h4>
              <p className="text-[10px] text-gray-400">مقاومة للعوامل الجوية وتسليم فوري</p>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
