import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../../types';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { handleImageError, BANNER_FALLBACK_IMAGE } from '../../utils/imageUtils';

interface HeroCarouselProps {
  banners: Banner[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const activeBanners = banners.filter(b => b.is_active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused, currentIndex]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const isExternalUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const bannerInner = (
    <div className="relative w-full h-full overflow-hidden">
      {/* Responsive Image with smooth transition */}
      <picture>
        <source media="(min-width: 768px)" srcSet={current.image_desktop_url} />
        <img
          src={current.image_mobile_url || current.image_desktop_url}
          alt={current.title_ar || 'بانر مول المصطفى'}
          onError={(e) => handleImageError(e, BANNER_FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-[1.01]"
        />
      </picture>
    </div>
  );

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 pt-4 pb-2 font-arabic">
      <div 
        className="relative rounded-3xl overflow-hidden shadow-editorial bg-[#f3f4f6] group border border-[rgba(17,21,26,0.11)] select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const touchEndX = e.changedTouches[0].clientX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              handleNext();
            } else {
              handlePrev();
            }
          }
          setTouchStartX(null);
        }}
      >
        {/* Main Banner Slide Container wrapped in clickable Link or external Anchor */}
        <div className="relative w-full aspect-[2/1] sm:aspect-[2.4/1] lg:aspect-[3/1] min-h-[240px]">
          {isExternalUrl(current.link_url) ? (
            <a
              href={current.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative cursor-pointer"
              aria-label={current.title_ar || 'بانر إعلاني'}
            >
              {bannerInner}
            </a>
          ) : (
            <Link
              to={current.link_url || '/shop'}
              className="block w-full h-full relative cursor-pointer"
              aria-label={current.title_ar || 'بانر إعلاني'}
            >
              {bannerInner}
            </Link>
          )}
        </div>

        {/* Carousel Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute top-1/2 -translate-y-1/2 start-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#04383f] border border-[rgba(17,21,26,0.11)] flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-20 cursor-pointer backdrop-blur-xs"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5 text-[#04383f] hover:text-[#08606B]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute top-1/2 -translate-y-1/2 end-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#04383f] border border-[rgba(17,21,26,0.11)] flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-20 cursor-pointer backdrop-blur-xs"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5 text-[#04383f] hover:text-[#08606B]" />
            </button>
          </>
        )}
      </div>

      {/* Progress Indicators */}
      {activeBanners.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3 px-4 max-w-md mx-auto">
          {activeBanners.map((banner, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={banner.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className="group relative flex-1 h-1 bg-[rgba(17,21,26,0.11)] hover:bg-[#C9C4B7] rounded-full overflow-hidden transition-all focus:outline-none cursor-pointer"
                aria-label={`شريحة ${idx + 1}`}
              >
                {isActive && !isPaused && (
                  <div 
                    key={`progress-${idx}-${currentIndex}`}
                    className="h-full bg-[#08606B] rounded-full animate-progress"
                    style={{ animationDuration: '6000ms' }}
                  />
                )}
                {isActive && isPaused && (
                  <div className="h-full bg-[#08606B] rounded-full w-full" />
                )}
                {!isActive && (
                  <div className="h-full w-0 bg-[#08606B]/40 group-hover:w-full transition-all duration-300" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
