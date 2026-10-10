import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { ProductCard } from '../../components/common/ProductCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { FilterSidebar, FilterState } from '../../components/catalog/FilterSidebar';
import { arabicFuzzyMatch } from '../../utils/searchNormalization';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const allProducts = useMemo(() => dbStore.getProducts().filter(p => p.is_active), []);

  const [sortBy, setSortBy] = useState<'recommended' | 'newest' | 'price_asc' | 'price_desc'>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    inStockOnly: false,
    onSaleOnly: false,
  });

  // Base Search Match
  const searchedProducts = useMemo(() => {
    if (!query.trim()) return allProducts;
    return allProducts.filter((p) => {
      const matchNameAr = arabicFuzzyMatch(p.name_ar, query);
      const matchNameEn = p.name_en ? p.name_en.toLowerCase().includes(query.toLowerCase()) : false;
      const matchSku = p.sku.toLowerCase().includes(query.toLowerCase());
      const matchDesc = arabicFuzzyMatch(p.description_ar, query);

      return matchNameAr || matchNameEn || matchSku || matchDesc;
    });
  }, [allProducts, query]);

  // Apply Secondary Filters and Sorting
  const finalProducts = useMemo(() => {
    return searchedProducts.filter((product) => {
      if (filters.minPrice !== undefined && product.price_egp < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && product.price_egp > filters.maxPrice) return false;
      if (filters.inStockOnly && product.stock_quantity <= 0) return false;
      if (filters.onSaleOnly && (!product.original_price_egp || product.original_price_egp <= product.price_egp)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'price_asc') return a.price_egp - b.price_egp;
      if (sortBy === 'price_desc') return b.price_egp - a.price_egp;
      return 0;
    });
  }, [searchedProducts, filters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'البحث' },
        { label: query ? `"${query}"` : 'جميع النتائج' }
      ]} />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gold-500" />
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              نتائج البحث عن: "{query}"
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            تم العثور على {finalProducts.length} منتج مطابق
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-mall-900" />
            <span>تصفية ({finalProducts.length})</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="recommended">الأكثر تطابقاً</option>
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Filters + Results */}
      <div className="flex items-start gap-6">
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({ inStockOnly: false, onSaleOnly: false })}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          resultCount={finalProducts.length}
        />

        <div className="flex-1">
          {finalProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
              <Search className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-800 text-base">لم نتمكن من العثور على أي نتائج مطابقة لـ "{query}"</p>
              <p className="text-xs text-gray-400">تأكد من كتابة الكلمات بشكل صحيح أو جرب البحث بكلمات عامة أو تصفح الأقسام مباشرة</p>
              <Link
                to="/shop"
                className="inline-block mt-3 py-2 px-6 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors"
              >
                تصفح كل المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {finalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
