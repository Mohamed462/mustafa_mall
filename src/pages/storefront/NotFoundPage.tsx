import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center max-w-4xl mx-auto px-4 py-16 text-right">
      <div className="bg-white rounded-xl p-8 sm:p-12 border border-[#E8E4DC] shadow-card w-full text-center space-y-6">
        
        {/* Large 404 Graphic Pill */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0A0A0B] text-[#B89B5E] border-2 border-[#B89B5E]/30 shadow-md mx-auto">
          <span className="font-mono text-2xl font-black">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
            الصفحة المطلوبة غير موجودة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            عذراً، يبدو أن الرابط الذي حاولت الوصول إليه قد يكون تغير أو أزيل من متجر مول المصطفى. يمكنك العودة للرئيسية أو تصفح الأقسام التالية.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B89B5E] hover:bg-[#D4AF37] text-[#0A0A0B] px-6 py-3 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0A0A0B] hover:bg-[#1C2526] text-white px-6 py-3 rounded-lg text-xs font-bold transition-all border border-[#1C2526]"
          >
            <ShoppingBag className="w-4 h-4 text-[#B89B5E]" />
            <span>تصفح كافة المنتجات</span>
          </Link>
        </div>

        {/* Quick Category Shortcuts */}
        <div className="pt-8 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-400 block mb-3">أو اختر إحدى الفئات السريعة:</span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link to="/category/electronics-and-mobile" className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-white text-slate-700 font-bold border border-slate-200">
              الإلكترونيات والموبايل
            </Link>
            <Link to="/category/home-and-cleaning" className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-white text-slate-700 font-bold border border-slate-200">
              المنزل والتنظيف
            </Link>
            <Link to="/print-center" className="px-3 py-1.5 rounded-lg bg-slate-900 text-gold-400 font-bold border border-gold-400/30">
              مركز الطباعة الرقمية
            </Link>
            <Link to="/offers" className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              العروض والتخفيضات
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
