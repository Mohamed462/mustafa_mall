import React, { useMemo } from 'react';
import { dbStore } from '../../services/dbStore';
import { ProductCard } from '../../components/common/ProductCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Percent, Sparkles } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const discountedProducts = useMemo(() => {
    return dbStore.getProducts().filter(p => 
      p.is_active && p.original_price_egp && p.original_price_egp > p.price_egp
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      <Breadcrumbs items={[{ label: 'عروض وتخفيضات مول المصطفى' }]} />

      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-mall-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-right relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
            <Percent className="w-4 h-4" />
            <span>خصومات حقيقية معتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">
            تخفيضات مول المصطفى الكبرى
          </h1>
          <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed">
            استمتع بأقوى العروض على مستلزمات المنزل، الإلكترونيات، الأدوات المدرسية، الشنط والإكسسوارات بأسعار لا تقبل المنافسة وبكميات محدودة.
          </p>
        </div>
        <Sparkles className="absolute -bottom-8 -start-8 w-48 h-48 text-white/10 stroke-1" />
      </div>

      {/* Products Grid */}
      {discountedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-500">
          لا توجد عروض نشطة حالياً. ترقبوا حملات التخفيضات القادمة قريباً!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
