import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, X, Heart, Printer, Flame, Volume2, VolumeX } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { getWhatsAppUrl } from '../../utils/formatters';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

const FUN_EGYPTIAN_QUOTES = [
  'يا مساء الفل يا عمدة! منور مول المصطفى كله 🌟',
  'عاوز تطبع مذكراتك أو ورقك؟ ارفع الملف وهنجهزهولك ع الفرازة! 🖨️',
  'بتدور على حاجة ومش لاقيها؟ كلمنا واتس فوراً وهنساعدك 💬',
  'عروض النهاردة بتطير.. ادخل بص بصة قبل ما تخلص! 🔥',
  'أصل وصاية وأسعار على قد الإيد وضمان ميرجعش فيه كلام 👌',
  'لو عجبك الشغل اديني لايك وشجع كابتن مصطفى! ❤️'
];

export const PeekabooMascot: React.FC = () => {
  const { settings } = useStoreSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [likeCount, setLikeCount] = useState(12);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Blinking eyes timer
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Waving animation timer
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setIsWaving(prev => !prev);
    }, 2500);
    return () => clearInterval(waveInterval);
  }, []);

  // Quotes cycling
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % FUN_EGYPTIAN_QUOTES.length);
    }, 7000);
    return () => clearInterval(quoteInterval);
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeCount(prev => prev + 1);
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * 40 - 20,
      y: -20 - Math.random() * 30
    };
    setHearts(prev => [...prev.slice(-8), newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1200);
  };

  if (isDismissed) return null;

  return (
    <aside 
      aria-label="تميمة مول المصطفى التفاعلية"
      className="fixed bottom-20 sm:bottom-24 end-0 z-40 flex items-center transition-all duration-300 pointer-events-auto select-none font-arabic"
    >
      {/* Speech Bubble / Mini Interaction Modal */}
      {isOpen && (
        <div className="me-3 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-slate-200/80 border-b-4 border-b-[#08606B] text-right w-72 animate-scale-up space-y-3 relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧢</span>
              <div>
                <h4 className="text-xs font-black text-[#04383f]">كابتن مصطفى</h4>
                <span className="text-[10px] text-[#08606B] font-bold">تميمة ومساعد المول التفاعلي</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="إغلاق التلميح"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Funny Egyptian Quote */}
          <div className="bg-[#f8fafb] rounded-2xl p-2.5 border border-slate-200/60 relative">
            <p className="text-xs text-[#04383f] font-medium leading-relaxed">
              {FUN_EGYPTIAN_QUOTES[quoteIndex]}
            </p>
            {/* Triangle pointer */}
            <div className="absolute top-1/2 -end-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-s-6 border-s-[#f8fafb]" />
          </div>

          {/* Action Links */}
          <div className="space-y-1.5 pt-0.5">
            <a
              href={getWhatsAppUrl(settings.whatsapp_number, 'يا كابتن مصطفى، أود الاستفسار عن منتجات وخدمات مول المصطفى 👋')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>كلمنا ع الواتساب فوراً 💬</span>
            </a>

            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/offers"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 px-2 rounded-xl bg-[#08606B]/10 hover:bg-[#08606B]/20 text-[#08606B] font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>عروض المول</span>
              </Link>

              <Link
                to="/print-center"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 px-2 rounded-xl bg-[#00D2D3]/15 hover:bg-[#00D2D3]/25 text-[#04383f] font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-[#08606B]" />
                <span>مركز الطباعة</span>
              </Link>
            </div>

            {/* Like Counter with Floating Hearts */}
            <div className="relative pt-1 flex items-center justify-between border-t border-gray-100">
              <span className="text-[11px] text-gray-500">حبيبي والله! عجبتك التميمة؟</span>
              <button
                type="button"
                onClick={handleLike}
                className="relative py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs flex items-center gap-1.5 transition-all active:scale-90 cursor-pointer"
                title="اضغط لايك!"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{likeCount}</span>
                
                {/* Floating Hearts Particles */}
                {hearts.map(h => (
                  <span
                    key={h.id}
                    className="absolute text-sm pointer-events-none animate-ping text-rose-500"
                    style={{
                      transform: `translate(${h.x}px, ${h.y}px)`,
                      opacity: 0.9
                    }}
                  >
                    ❤️
                  </span>
                ))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Animated Cartoon Mascot Character Peeking from Edge */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative cursor-pointer flex items-center transition-transform duration-300 transform translate-x-2 hover:translate-x-0"
        title="كابتن مصطفى — اضغط للتفاعل والمساعدة!"
      >
        {/* Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-[#00D2D3]/20 blur-md group-hover:scale-125 transition-transform" />

        {/* Mascot SVG Vector Illustration */}
        <div className="relative w-14 h-16 sm:w-16 sm:h-20 drop-shadow-xl transition-all duration-300 group-hover:scale-110">
          <svg 
            viewBox="0 0 100 120" 
            className="w-full h-full overflow-visible"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Waving Hand (Peeking outside edge) */}
            <g 
              className={`origin-[25px_65px] transition-transform duration-300 ${
                isWaving ? '-rotate-12 translate-y-[-3px]' : 'rotate-12 translate-y-[2px]'
              }`}
            >
              <ellipse cx="20" cy="62" rx="9" ry="8" fill="#FFFFFF" stroke="#08606B" strokeWidth="2.5" />
              {/* Fingers */}
              <circle cx="15" cy="56" r="3" fill="#FFFFFF" stroke="#08606B" strokeWidth="2" />
              <circle cx="21" cy="53" r="3" fill="#FFFFFF" stroke="#08606B" strokeWidth="2" />
              <circle cx="27" cy="56" r="3" fill="#FFFFFF" stroke="#08606B" strokeWidth="2" />
            </g>

            {/* Mascot Head (Cute Rounded Face) */}
            <circle cx="65" cy="65" r="32" fill="#FFE5D9" stroke="#08606B" strokeWidth="3" />

            {/* Rosy Cheeks */}
            <circle cx="46" cy="74" r="5" fill="#FF8FA3" opacity="0.6" />
            <circle cx="84" cy="74" r="5" fill="#FF8FA3" opacity="0.6" />

            {/* Big Expressive Cartoon Eyes */}
            {isBlinking ? (
              // Blinking Closed Eyes
              <>
                <path d="M 46 62 Q 52 66 58 62" stroke="#04383f" strokeWidth="3" strokeLinecap="round" />
                <path d="M 72 62 Q 78 66 84 62" stroke="#04383f" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              // Open Shiny Eyes
              <>
                <ellipse cx="52" cy="60" rx="7" ry="9" fill="#FFFFFF" stroke="#04383f" strokeWidth="2" />
                <ellipse cx="78" cy="60" rx="7" ry="9" fill="#FFFFFF" stroke="#04383f" strokeWidth="2" />
                {/* Pupils with Cyan reflection */}
                <ellipse cx="53" cy="61" rx="4.5" ry="6" fill="#04383f" />
                <ellipse cx="79" cy="61" rx="4.5" ry="6" fill="#04383f" />
                {/* Eye Highlights */}
                <circle cx="51" cy="58" r="2" fill="#FFFFFF" />
                <circle cx="77" cy="58" r="2" fill="#FFFFFF" />
                <circle cx="55" cy="63" r="1" fill="#00D2D3" />
                <circle cx="81" cy="63" r="1" fill="#00D2D3" />
              </>
            )}

            {/* Happy Smile */}
            <path 
              d="M 55 77 Q 65 88 75 77" 
              fill="#D90429" 
              stroke="#04383f" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Cute Tooth / Tongue */}
            <path d="M 60 81 Q 65 85 70 81" fill="#FF758F" />

            {/* Stylish Mall Cap (Teal #08606B with Visor and Gold/Cyan Badge) */}
            <path 
              d="M 38 48 C 38 28 92 28 92 48 Z" 
              fill="#08606B" 
              stroke="#04383f" 
              strokeWidth="2.5" 
            />
            {/* Cap Visor */}
            <path 
              d="M 30 47 C 32 40 70 42 75 48 Z" 
              fill="#04383f" 
              stroke="#04383f" 
              strokeWidth="2" 
            />
            {/* Cap Button on Top */}
            <circle cx="65" cy="30" r="4" fill="#00D2D3" stroke="#04383f" strokeWidth="1.5" />
            {/* Mall Emblem on Cap */}
            <circle cx="65" cy="40" r="4.5" fill="#00D2D3" />
            <path d="M 63 40 L 67 40" stroke="#04383f" strokeWidth="1.5" strokeLinecap="round" />

            {/* Left Edge Gripping Hand */}
            <g>
              <ellipse cx="94" cy="78" rx="7" ry="6" fill="#FFFFFF" stroke="#08606B" strokeWidth="2.5" />
              <circle cx="97" cy="74" r="2.5" fill="#FFFFFF" stroke="#08606B" strokeWidth="1.5" />
              <circle cx="98" cy="79" r="2.5" fill="#FFFFFF" stroke="#08606B" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Popout Badge on hover */}
        <div className="absolute top-1 end-1 bg-[#00D2D3] text-[#04383f] font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
          👋
        </div>
      </div>
    </aside>
  );
};
