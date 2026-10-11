import React from 'react';
import { Star, CheckCircle, Quote, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  city: string;
  product: string;
  rating: number;
  date: string;
  content: string;
}

const REVIEWS: Review[] = [
  {
    id: 'r-1',
    author: 'د. محمود عبد الرحمن',
    city: 'المنصورة، الدقهلية',
    product: 'طباعة وتجليد رسالة دكتوراه فاخرة',
    rating: 5,
    date: 'منذ يومين',
    content: 'تجربة استثنائية في مركز الطباعة بمول المصطفى. طبعت رسالة الدكتوراه بتجليد كعب حراري وبصمة ذهبية في نفس اليوم، والجودة تفوقت على أي مطبعة تعاملت معها بالقاهرة. شكراً لاهتمامكم البالغ بالتفاصيل.'
  },
  {
    id: 'r-2',
    author: 'م. سارة خليل',
    city: 'المعادي، القاهرة',
    product: 'شاحن أنكر نانو GaN سريع ثلاثي المنافذ',
    rating: 5,
    date: 'منذ 4 أيام',
    content: 'المنتج أصلي 100% بالسيريال نمبر وضمان الوكيل المعتمد. التوصيل تم خلال أقل من 24 ساعة بمندوب محترم، وسمح لي بالمعاينة والتأكد قبل الدفع. متجر موثوق ويستحق أعلى تقييم.'
  },
  {
    id: 'r-3',
    author: 'أ. طارق إبراهيم',
    city: 'سموحة، الإسكندرية',
    product: 'طقم علب تخزين زجاجية وممسحة أرضيات دوارة',
    rating: 5,
    date: 'منذ أسبوع',
    content: 'التغليف كان مبهراً ومحكماً ضد الكسر تماماً. مستلزمات المنزل أصلية وبسعر أفضل بكثير من المحلات التجارية. خدمة عملاء الواتساب سريعة ومحترفة جداً.'
  },
  {
    id: 'r-4',
    author: 'أ. نهى الشربيني',
    city: 'الزقازيق، الشرقية',
    product: 'ألعاب أطفال تنموية وشنطة مدرسية',
    rating: 5,
    date: 'منذ أسبوعين',
    content: 'اشتريت هدايا عيد ميلاد أطفالي من قسم الألعاب. الخامات ممتازة وآمنة للأطفال، والتوصيل لباب المنزل في الشرقية أخذ يوم ونصف فقط. أصبحت وجهتي الأولى دائماً.'
  }
];

export const CustomerReviewsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08606B] mb-2 bg-[rgba(8,96,107,0.08)] px-3 py-1 rounded-full border border-[rgba(8,96,107,0.2)]">
          <ThumbsUp className="w-3.5 h-3.5 text-[#00D2D3]" />
          <span>تجارب حقيقية موثقة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#04383f] tracking-tight">
          ماذا يقول عملاؤنا عن مول المصطفى؟
        </h2>
        <p className="text-xs sm:text-sm text-[#687280] mt-1">
          أكثر من 50,000 عميل سعيد في 27 محافظة مصرية يثقون في جودة منتجاتنا وسرعة خدماتنا
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-5 border border-[rgba(17,21,26,0.11)] shadow-editorial hover:shadow-editorial-hover transition-all duration-300 flex flex-col justify-between text-right hover:border-[#08606B]/40"
          >
            <div>
              {/* Top Row: Stars + Quote Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-[#08606B]/20" />
              </div>

              {/* Review Text */}
              <p className="text-xs text-[#04383f]/90 leading-relaxed line-clamp-5 mb-4">
                "{rev.content}"
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-3 border-t border-[rgba(17,21,26,0.11)]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#04383f]">{rev.author}</span>
                <span className="text-[10px] text-[#687280]">{rev.date}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#687280]">{rev.city}</span>
                <span className="inline-flex items-center gap-1 text-[#08606B] font-bold">
                  <CheckCircle className="w-3 h-3 text-[#00D2D3]" />
                  <span>مشتري موثق</span>
                </span>
              </div>
              <div className="text-[10px] text-[#687280] mt-1 truncate">
                تم شراء: {rev.product}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
