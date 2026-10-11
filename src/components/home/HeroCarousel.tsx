import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../../types';
import { ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { handleImageError, BANNER_FALLBACK_IMAGE } from '../../utils/imageUtils';

interface HeroCarouselProps {
  banners: Banner[];
}

const DURATION_MS = 6000;
const TICK_MS = 50;

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const activeBanners = banners.filter(b => b.is_active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Real-time interactive progress ticker
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + (TICK_MS / DURATION_MS) * 100;
        if (next >= 100) {
          setCurrentIndex(curr => (curr + 1) % activeBanners.length);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    setProgress(0);
  };

  const handleSelectSlide = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
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

      {/* Interactive Progress & Navigation Dock */}
      {activeBanners.length > 1 && (
        <div className="flex items-center justify-between gap-3 mt-3.5 px-2 max-w-2xl mx-auto select-none">
          {/* Play/Pause Autoplay Toggle Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
              isPaused 
                ? 'bg-[#08606B] text-white border-[#08606B]' 
                : 'bg-white hover:bg-gray-50 text-[#04383f] hover:text-[#08606B] border-gray-200/80'
            }`}
            title={isPaused ? "تشغيل التبديل التلقائي" : "إيقاف مؤقت للتبديل التلقائي"}
            aria-label={isPaused ? "تشغيل التبديل التلقائي" : "إيقاف مؤقت للتبديل التلقائي"}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Segmented Story-Style Progress Bars */}
          <div className="flex-1 flex items-center gap-2">
            {activeBanners.map((banner, idx) => {
              const isActive = currentIndex === idx;
              const isPast = idx < currentIndex;

              return (
                <div
                  key={banner.id || idx}
                  className="relative flex-1 group/bar py-2 cursor-pointer"
                  onClick={() => handleSelectSlide(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectSlide(idx);
                  }}
                  aria-label={`الانتقال إلى الشريحة ${idx + 1}: ${banner.title_ar || ''}`}
                >
                  {/* Floating Hover Tooltip with Banner Title & Thumbnail */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none z-30 flex flex-col items-center">
                    <div className="bg-[#04383f] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/10 flex items-center gap-2 whitespace-nowrap">
                      {banner.image_mobile_url || banner.image_desktop_url ? (
                        <img 
                          src={banner.image_mobile_url || banner.image_desktop_url} 
                          alt="" 
                          className="w-7 h-4 object-cover rounded-xs border border-white/20 shrink-0"
                        />
                      ) : null}
                      <span>{banner.title_ar || `شريحة ${idx + 1}`}</span>
                    </div>
                    <div className="w-2 h-2 bg-[#04383f] rotate-45 -mt-1" />
                  </div>

                  {/* Interactive Bar Track */}
                  <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 relative ${
                    isActive 
                      ? 'bg-gray-200/90 group-hover/bar:h-2.5 shadow-inner' 
                      : 'bg-gray-200/70 hover:bg-gray-300 group-hover/bar:h-2'
                  }`}>
                    {/* Filled Bar */}
                    <div
                      className={`h-full rounded-full transition-[width] ease-linear relative ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#08606B] via-[#0d8391] to-[#00D2D3] duration-75 shadow-xs' 
                          : isPast 
                            ? 'bg-[#08606B] w-full duration-300' 
                            : 'bg-transparent w-0 duration-300'
                      }`}
                      style={{
                        width: isActive ? `${progress}%` : isPast ? '100%' : '0%'
                      }}
                    >
                      {/* Active glowing tip light on currently loading bar */}
                      {isActive && (
                        <span className="absolute top-0 bottom-0 end-0 w-2.5 bg-[#00D2D3] rounded-full blur-[1px] shadow-[0_0_8px_#00D2D3]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide Counter Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 rounded-xl border border-gray-200/80 shadow-xs text-xs font-mono font-bold shrink-0">
            <span className="text-[#08606B] font-black">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">
              {String(activeBanners.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
