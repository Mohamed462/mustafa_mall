import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CategoryDiscoveryGridProps {
  categories: Category[];
}

const CATEGORY_IMAGES: Record<string, string> = {
  'home-and-cleaning': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
  'electronics-and-mobile': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'electronics-and-mobile-accessories': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'office-and-school': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80',
  'toys-and-gifts': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
  'bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  'fashion-accessories': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
  'beauty-and-personal-care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  'digital-printing-center': '/images/banners/banner-print-center.webp',
};

export const CategoryDiscoveryGrid: React.FC<CategoryDiscoveryGridProps> = ({ categories }) => {
  // Sort with flagship categories first
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-[rgba(17,21,26,0.11)]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08606B] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تسوق حسب الأقسام الرئيسية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#04383f] tracking-tight">
            أقسام مول المصطفى
          </h2>
          <p className="text-xs sm:text-sm text-[#687280] mt-0.5">
            تصفح تشكيلاتنا الكاملة في أقسام متخصصة تلبي كافة احتياجات الأسرة المصرية
          </p>
        </div>

        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#04383f] hover:text-[#08606B] transition-colors group"
        >
          <span>تصفح كافة الأقسام</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* Minimal Clean Category Cards Grid + Accent End Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
        {sortedCategories.map((cat) => {
          const isPrintCenter = cat.department_key === 'print_center';
          const link = isPrintCenter ? '/print-center' : `/category/${cat.slug}`;
          const bgImage = CATEGORY_IMAGES[cat.slug] || cat.image_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80';
          const subCount = cat.children?.length || 6;

          return (
            <Link
              key={cat.id}
              to={link}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[rgba(17,21,26,0.11)] shadow-editorial hover:shadow-editorial-hover transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 text-right hover:border-[#08606B]/50"
            >
              {/* Product cutout / category visual container with Warm Ivory framing */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#f8fafb] flex items-center justify-center p-3 mb-3 group-hover:bg-[#EDE9DE]/60 transition-colors">
                <img
                  src={bgImage}
                  alt={cat.name_ar}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {isPrintCenter && (
                  <span className="absolute top-2 start-2 text-[10px] bg-[#08606B] text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                    تسليم فوري
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#08606B]">
                    {isPrintCenter ? 'خدمات احترافية' : `${subCount} فئات فرعية`}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#04383f] leading-tight group-hover:text-[#08606B] transition-colors">
                  {cat.name_ar}
                </h3>

                <p className="text-[11px] text-[#687280] line-clamp-1">
                  {cat.description_ar}
                </p>

                {/* Editorial Arrow Link */}
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#08606B] group-hover:text-[#03292e]">
                  <span>{isPrintCenter ? 'طلب طباعة ومقايسة' : 'استكشف القسم'}</span>
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}

        {/* Accent End Card "جميع الأقسام" matching reference design */}
        <Link
          to="/shop"
          className="group relative rounded-2xl overflow-hidden border border-[#04383f] bg-gradient-to-br from-[#04383f] via-[#003746] to-[#08606B] text-white p-5 sm:p-6 flex flex-col justify-between text-right shadow-editorial hover:shadow-editorial-hover transition-all duration-300 hover:scale-[1.01]"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00D2D3] bg-white/10 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>دليل التسوق الشامل</span>
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              جميع الأقسام والفئات
            </h3>
            <p className="text-xs text-gray-200 leading-relaxed line-clamp-2">
              استكشف أكثر من 8 أقسام ومئات المنتجات المتاحة للشحن السريع لكافة المحافظات.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-white/15">
            <span className="text-xs font-bold text-white group-hover:text-[#00D2D3] transition-colors">
              تصفح الكتالوج كاملاً
            </span>
            <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-[#00D2D3] flex items-center justify-center transition-all duration-300">
              <ArrowLeft className="w-4 h-4 text-white rtl:rotate-0 ltr:rotate-180" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};
