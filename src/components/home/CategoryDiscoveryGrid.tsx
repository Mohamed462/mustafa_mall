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
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E8E4DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B89B5E] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تسوق حسب الأقسام الرئيسية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
            أقسام مول المصطفى
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            تصفح تشكيلاتنا الكاملة في 8 أقسام متخصصة تلبي كافة احتياجات الأسرة
          </p>
        </div>

        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1A1A1A] hover:text-[#B89B5E] transition-colors group"
        >
          <span>تصفح كافة الأقسام</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* 4:5 Aspect Ratio Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sortedCategories.map((cat) => {
          const isPrintCenter = cat.department_key === 'print_center';
          const link = isPrintCenter ? '/print-center' : `/category/${cat.slug}`;
          const bgImage = CATEGORY_IMAGES[cat.slug] || cat.image_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80';
          const subCount = cat.children?.length || 6;

          return (
            <Link
              key={cat.id}
              to={link}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-[#E8E4DC] shadow-xs hover:shadow-card-hover transition-all duration-500 flex flex-col justify-end p-4 sm:p-5 text-right bg-[#0A0A0B]"
            >
              {/* Background Image with Gentle 5% Zoom on Hover */}
              <img
                src={bgImage}
                alt={cat.name_ar}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Bottom-Only Dark Gradient Overlay for Maximum Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/95 via-[#0A0A0B]/40 to-transparent pointer-events-none" />

              {/* Content Overlay */}
              <div className="relative z-10 space-y-1">
                {/* Department or Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#B89B5E]">
                    {isPrintCenter ? 'خدمات احترافية' : `${subCount} فئات فرعية`}
                  </span>
                  {isPrintCenter && (
                    <span className="text-[10px] bg-[#B89B5E] text-[#0A0A0B] font-black px-2 py-0.5 rounded">
                      تسليم فوري
                    </span>
                  )}
                </div>

                {/* Bold Category Name */}
                <h3 className="text-base sm:text-lg font-black text-white leading-tight group-hover:text-[#D4AF37] transition-colors">
                  {cat.name_ar}
                </h3>

                {/* Brief Subtitle */}
                <p className="text-[11px] text-gray-300 line-clamp-1 opacity-90">
                  {cat.description_ar}
                </p>

                {/* Golden "تسوق الآن" Action Pill Button Appearing on Hover */}
                <div className="pt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span className="inline-flex items-center gap-1.5 bg-[#B89B5E] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm">
                    <span>{isPrintCenter ? 'طلب طباعة ومقايسة' : 'تسوق القسم'}</span>
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
