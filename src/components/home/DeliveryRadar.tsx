import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Clock, MapPin, Zap, Search, ShieldCheck, ArrowLeft, PackageCheck } from 'lucide-react';
import { TextureButton } from '../common/TextureButton';

interface GovernorateSpeed {
  id: string;
  name_ar: string;
  deliveryTime: string;
  standardCost: string;
  expressAvailable: boolean;
  notes: string;
}

const GOVERNORATES_DATA: GovernorateSpeed[] = [
  { id: 'cairo', name_ar: 'القاهرة', deliveryTime: 'خلال 24 ساعة (نفس اليوم متاح)', standardCost: '45 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: true, notes: 'تسليم سريع بمندوب خاص من مخازننا الرئيسية' },
  { id: 'giza', name_ar: 'الجيزة', deliveryTime: 'خلال 24 ساعة (نفس اليوم متاح)', standardCost: '45 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: true, notes: 'تغطية شاملة لجميع مناطق الجيزة والشيخ زايد وأكتوبر' },
  { id: 'alex', name_ar: 'الإسكندرية', deliveryTime: 'خلال 24 - 48 ساعة', standardCost: '55 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: true, notes: 'توصيل يومي منتظم' },
  { id: 'delta', name_ar: 'محافظات الدلتا (الدقهلية، الغربية، المنوفية، القليوبية، البحيرة)', deliveryTime: 'خلال 24 - 48 ساعة', standardCost: '55 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: false, notes: 'توصيل حتى باب المنزل في جميع المراكز والقرى' },
  { id: 'canal', name_ar: 'مدن القناة (بورسعيد، الإسماعيلية، السويس)', deliveryTime: 'خلال 24 - 48 ساعة', standardCost: '55 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: false, notes: 'شحن يومي عبر أسطولنا اللوجستي' },
  { id: 'upper1', name_ar: 'شمال الصعيد (بني سويف، الفيوم، المنيا)', deliveryTime: 'خلال 48 ساعة', standardCost: '65 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: false, notes: 'معاينة كاملة للمنتج قبل الاستلام والدفع' },
  { id: 'upper2', name_ar: 'جنوب الصعيد (أسيوط، سوهاج، قنا، الأقصر، أسوان)', deliveryTime: 'خلال 48 - 72 ساعة', standardCost: '75 ج.م (مجاناً فوق 1000 ج.م)', expressAvailable: false, notes: 'شحن آمن ومؤمن عليه بنسبة 100%' },
  { id: 'borders', name_ar: 'المحافظات الحدودية والبحر الأحمر ومطروح', deliveryTime: 'خلال 3 - 5 أيام عمل', standardCost: '85 ج.م', expressAvailable: false, notes: 'توصيل لجميع المدن الساحلية والحدودية' },
];

export const DeliveryRadar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGovId, setSelectedGovId] = useState<string>('cairo');
  const [trackNumber, setTrackNumber] = useState<string>('');
  
  // Real-time countdown calculation
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 45,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 30, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentGov = GOVERNORATES_DATA.find(g => g.id === selectedGovId) || GOVERNORATES_DATA[0];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumber.trim()) return;
    navigate(`/track-order?code=${encodeURIComponent(trackNumber.trim())}`);
  };

  const format2Digits = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 my-8 border border-[rgba(17,21,26,0.11)] shadow-editorial relative overflow-hidden text-right">
      {/* Top Banner with Cutoff Countdown */}
      <div className="bg-[#04383f] rounded-2xl p-4 sm:p-6 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#001E27]">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00D2D3] shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300">مستودعاتنا تعمل الآن بكامل طاقتها</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              رادار سرعة الشحن والتوصيل الفوري لمحافظات مصر
            </h3>
          </div>
        </div>

        {/* Live Timer Pill */}
        <div className="bg-[#001E27] border border-[#003746] px-4 py-2.5 rounded-xl flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-gray-300 block font-medium">اطلب الآن ليصلك طلبك غداً</span>
            <span className="text-xs text-white font-bold">متبقي قبل إغلاق شحنات اليوم:</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-base sm:text-lg font-black text-[#00D2D3] bg-[#04383f] px-3 py-1 rounded-lg border border-[#003746]" dir="ltr">
            <span>{format2Digits(timeLeft.hours)}</span>:
            <span>{format2Digits(timeLeft.minutes)}</span>:
            <span>{format2Digits(timeLeft.seconds)}</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Governorate Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[#08606B] text-xs font-bold mb-2">
              <MapPin className="w-4 h-4" />
              <span>اختر محافظتك للتحقق من سرعة وصول الطلب</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-[#04383f]">
              توصيل يغطي جميع المحافظات والقرى المصرية
            </h4>
            <p className="text-xs sm:text-sm text-[#687280] mt-1">
              نوفر خدمة الشحن السريع بالتعاون مع كبرى شركات الشحن وأسطول مول المصطفى المعتمد.
            </p>
          </div>

          {/* Quick Governorate Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {GOVERNORATES_DATA.map((gov) => (
              <button
                key={gov.id}
                type="button"
                onClick={() => setSelectedGovId(gov.id)}
                className={`p-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                  selectedGovId === gov.id
                    ? 'bg-[#04383f] text-white shadow-md ring-2 ring-[#08606B]'
                    : 'bg-[#f8fafb] text-[#04383f] hover:bg-[#EDE9DE] border border-[rgba(17,21,26,0.11)]'
                }`}
              >
                {gov.name_ar.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Governorate Dynamic Details Card */}
          <div className="bg-[#f8fafb] border border-[rgba(17,21,26,0.11)] rounded-2xl p-5 space-y-3.5">
            <div className="flex justify-between items-center pb-3 border-b border-[rgba(17,21,26,0.11)]">
              <span className="font-bold text-[#04383f] text-base">{currentGov.name_ar}</span>
              {currentGov.expressAvailable && (
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                  ⚡ شحن فوري متاح
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[rgba(17,21,26,0.11)]">
                <Clock className="w-5 h-5 text-[#08606B] shrink-0" />
                <div>
                  <span className="text-[#687280] block font-medium">المدة المتوقعة:</span>
                  <span className="font-black text-[#04383f] text-sm">{currentGov.deliveryTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[rgba(17,21,26,0.11)]">
                <Truck className="w-5 h-5 text-[#08606B] shrink-0" />
                <div>
                  <span className="text-[#687280] block font-medium">تكلفة الشحن:</span>
                  <span className="font-black text-[#04383f] text-sm">{currentGov.standardCost}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#687280] pt-1">
              💡 {currentGov.notes}
            </p>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-[#f8fafb] rounded-xl border border-[rgba(17,21,26,0.11)]">
              <ShieldCheck className="w-5 h-5 text-[#08606B] mx-auto mb-1" />
              <span className="font-bold text-[#04383f] block">معاينة قبل الاستلام</span>
              <span className="text-[10px] text-[#687280]">حق فتح الشحنة والفحص</span>
            </div>
            <div className="p-3 bg-[#f8fafb] rounded-xl border border-[rgba(17,21,26,0.11)]">
              <PackageCheck className="w-5 h-5 text-[#00D2D3] mx-auto mb-1" />
              <span className="font-bold text-[#04383f] block">شحن مجاني فوق 1000ج</span>
              <span className="text-[10px] text-[#687280]">لكافة المنتجات والأقسام</span>
            </div>
            <div className="p-3 bg-[#f8fafb] rounded-xl border border-[rgba(17,21,26,0.11)]">
              <Truck className="w-5 h-5 text-[#04383f] mx-auto mb-1" />
              <span className="font-bold text-[#04383f] block">تغليف آمن ومحكم</span>
              <span className="text-[10px] text-[#687280]">حماية ضد الكسر أو التلف</span>
            </div>
          </div>
        </div>

        {/* Live Tracking Tool (5 cols) */}
        <div className="lg:col-span-5 bg-[#04383f] text-white p-6 sm:p-8 rounded-2xl border border-[#001E27] shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00D2D3] mb-4">
            <Search className="w-6 h-6" />
          </div>

          <h4 className="text-xl font-black text-white mb-2">
            تتبع شحنتك لحظة بلحظة
          </h4>
          <p className="text-xs text-gray-300 mb-6 leading-relaxed">
            أدخل رقم طلبك أو كود التتبع الذي وصلك في رسالة تأكيد الشراء لمعرفة موقع شحنتك وموعد وصولها بالضبط.
          </p>

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-200 mb-2">
                رقم الطلب أو كود التتبع
              </label>
              <input
                type="text"
                value={trackNumber}
                onChange={(e) => setTrackNumber(e.target.value)}
                placeholder="مثال: ORD-1002 أو 2026-X"
                className="w-full bg-[#001E27] border border-[#003746] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#08606B] font-mono"
              />
            </div>

            <TextureButton
              type="submit"
              variant="accent"
              size="lg"
              className="w-full gap-2 font-black text-sm"
            >
              <span>استعلام عن حالة الشحنة</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </TextureButton>
          </form>

          {/* Quick status notice */}
          <div className="mt-6 pt-5 border-t border-[#003746] text-xs text-gray-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>إشعار تلقائي برسالة SMS فور تسليم الشحنة للمندوب</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D2D3]" />
              <span>إمكانية تعديل موعد الاستلام أو عنوان التوصيل بسهولة</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
