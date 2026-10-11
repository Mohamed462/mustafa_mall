import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { TextureButton } from '../common/TextureButton';

interface CategoryDiscoveryGridProps {
  categories: Category[];
}

const CATEGORY_IMAGES: Record<string, string> = {
  'home-and-cleaning': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
  'electronics-and-mobile': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'electronics-and-mobile-accessories': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'office-and-school': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
  'toys-and-gifts': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
  'bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  'fashion-accessories': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'beauty-and-personal-care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'digital-printing-center': '/images/banners/banner-print-center.webp',
};

export const CategoryDiscoveryGrid: React.FC<CategoryDiscoveryGridProps> = ({ categories }) => {
  const [showAllMobile, setShowAllMobile] = useState(false);
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-[rgba(17,21,26,0.11)]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08606B] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2D3]" />
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
          className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#04383f] hover:text-[#08606B] transition-colors group"
        >
          <span>تصفح كافة الأقسام</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* Quick Mobile Category Story Bubbles (Horizontal swipeable on phone) */}
      <div className="sm:hidden flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none snap-x mb-4">
        {sortedCategories.map((cat) => {
          const isPrintCenter = cat.department_key === 'print_center';
          const link = isPrintCenter ? '/print-center' : `/category/${cat.slug}`;
          const bgImage = CATEGORY_IMAGES[cat.slug] || cat.image_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80';

          return (
            <Link
              key={`bubble-${cat.id}`}
              to={link}
              className="flex flex-col items-center gap-1.5 shrink-0 snap-start w-20 text-center group"
            >
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-[#08606B]/30 group-hover:border-[#00D2D3] transition-colors overflow-hidden bg-white shadow-xs">
                <img
                  src={bgImage}
                  alt={cat.name_ar}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-bold text-[#04383f] line-clamp-1 leading-tight group-hover:text-[#08606B]">
                {cat.name_ar}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Pure Visual Image-First Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sortedCategories.map((cat, idx) => {
          const isPrintCenter = cat.department_key === 'print_center';
          const link = isPrintCenter ? '/print-center' : `/category/${cat.slug}`;
          const bgImage = CATEGORY_IMAGES[cat.slug] || cat.image_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80';

          // Hide categories beyond the first 3 on mobile if not expanded
          const isHiddenOnMobile = idx >= 3 && !showAllMobile;

          return (
            <Link
              key={cat.id}
              to={link}
              className={`group relative rounded-2xl overflow-hidden border border-[rgba(17,21,26,0.12)] shadow-editorial hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1 block aspect-[16/10] sm:aspect-[4/3] bg-[#04383f] ${
                isHiddenOnMobile ? 'hidden sm:block' : 'block'
              }`}
            >
              {/* Full bleed cover image with smooth zoom */}
              <img
                src={bgImage}
                alt={cat.name_ar}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                loading="lazy"
              />

              {/* High-end cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#04383f]/95 via-[#04383f]/40 to-transparent transition-opacity duration-300" />

              {/* Tag / Badge for Print Center or Highlights */}
              {isPrintCenter && (
                <div className="absolute top-3 start-3 z-10">
                  <span className="text-[10px] font-mono font-bold bg-[#00D2D3] text-[#04383f] px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                    تسليم فوري // SLA
                  </span>
                </div>
              )}

              {/* Pure visual content overlay - category name & subtle interactive arrow */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D2D3]" />
                    <span className="text-[11px] text-[#00D2D3] font-bold">استكشف القسم</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-sm group-hover:text-[#00D2D3] transition-colors">
                    {cat.name_ar}
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white group-hover:bg-[#00D2D3] group-hover:text-[#04383f] group-hover:border-[#00D2D3] transition-all duration-300 shrink-0 shadow-sm">
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile "تصفح باقي الأقسام" Toggle Button (Visible ONLY on mobile phone) */}
      {sortedCategories.length > 3 && (
        <div className="sm:hidden mt-5 pt-2 text-center">
          <TextureButton
            variant="secondary"
            size="md"
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="w-full gap-2 justify-center font-bold text-xs"
          >
            {showAllMobile ? (
              <>
                <span>عرض أقل</span>
                <ChevronUp className="w-4 h-4 text-[#08606B]" />
              </>
            ) : (
              <>
                <span>تصفح باقي الأقسام ({sortedCategories.length - 3}+)</span>
                <ChevronDown className="w-4 h-4 text-[#08606B]" />
              </>
            )}
          </TextureButton>
        </div>
      )}
    </section>
  );
};
