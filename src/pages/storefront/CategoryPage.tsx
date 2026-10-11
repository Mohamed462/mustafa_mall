import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { ProductCard } from '../../components/common/ProductCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { FilterSidebar, FilterState } from '../../components/catalog/FilterSidebar';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [version, setVersion] = useState(0);

  React.useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const category = useMemo(() => {
    return slug ? dbStore.getCategoryBySlug(slug) : undefined;
  }, [slug, version]);

  // Determine all category IDs under this category (parent + children)
  const categoryIds = useMemo(() => {
    if (!category) return [];
    const ids = [category.id];
    if (category.children) {
      ids.push(...category.children.map(c => c.id));
    }
    return ids;
  }, [category, version]);

  const allProducts = useMemo(() => {
    if (!category) return [];
    return dbStore.getProducts().filter(p => p.is_active && categoryIds.includes(p.category_id));
  }, [category, categoryIds, version]);

  const [sortBy, setSortBy] = useState<'recommended' | 'newest' | 'price_asc' | 'price_desc' | 'popular'>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    inStockOnly: false,
    onSaleOnly: false,
  });

  const handleResetFilters = () => {
    setFilters({
      inStockOnly: false,
      onSaleOnly: false,
    });
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Subcategory filter
      if (filters.selectedSubcategory && product.category_id !== filters.selectedSubcategory) {
        return false;
      }
      // Min price
      if (filters.minPrice !== undefined && product.price_egp < filters.minPrice) {
        return false;
      }
      // Max price
      if (filters.maxPrice !== undefined && product.price_egp > filters.maxPrice) {
        return false;
      }
      // Stock
      if (filters.inStockOnly && product.stock_quantity <= 0) {
        return false;
      }
      // Sale
      if (filters.onSaleOnly && (!product.original_price_egp || product.original_price_egp <= product.price_egp)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'price_asc') return a.price_egp - b.price_egp;
      if (sortBy === 'price_desc') return b.price_egp - a.price_egp;
      if (sortBy === 'popular') return b.sales_count - a.sales_count;
      return 0;
    });
  }, [allProducts, filters, sortBy]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">القسم غير موجود</h2>
        <p className="text-xs text-gray-500 mt-2">عذراً، لم نتمكن من العثور على القسم المطلوب.</p>
        <Link to="/shop" className="inline-block mt-4 px-6 py-2 bg-mall-900 text-white rounded-xl text-xs font-bold">
          العودة للتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'الأقسام', path: '/shop' },
        { label: category.name_ar }
      ]} />

      {/* Header Banner for Category */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              {category.name_ar}
            </h1>
            {category.description_ar && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                {category.description_ar}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4 text-mall-900" />
              <span>تصفية ({filteredProducts.length})</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="recommended">الموصى به</option>
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: الأقل أولاً</option>
                <option value="price_desc">السعر: الأعلى أولاً</option>
                <option value="popular">الأكثر طلباً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subcategories Quick Pills */}
        {category.children && category.children.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, selectedSubcategory: undefined })}
              className={`py-1.5 px-3.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                !filters.selectedSubcategory ? 'bg-mall-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              الكل ({allProducts.length})
            </button>
            {category.children.map((sub) => {
              const subCount = allProducts.filter(p => p.category_id === sub.id).length;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, selectedSubcategory: sub.id })}
                  className={`py-1.5 px-3.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                    filters.selectedSubcategory === sub.id ? 'bg-mall-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {sub.name_ar} ({subCount})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="flex items-start gap-6">
        <FilterSidebar
          subcategories={category.children}
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          resultCount={filteredProducts.length}
        />

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
              <p className="font-bold text-gray-800 text-base">لا توجد منتجات مطابقة في هذا القسم حالياً</p>
              <p className="text-xs text-gray-400">يمكنك تعديل خيارات التصفية أو تصفح باقي أقسام المول</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 py-2 px-5 bg-mall-900 text-white rounded-xl text-xs font-bold"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
