import React, { useState, useMemo } from 'react';
import { dbStore } from '../../services/dbStore';
import { ProductCard } from '../../components/common/ProductCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { FilterSidebar, FilterState } from '../../components/catalog/FilterSidebar';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [productsVersion, setProductsVersion] = useState(0);

  React.useEffect(() => {
    const handleUpdate = () => setProductsVersion(v => v + 1);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const allProducts = useMemo(() => dbStore.getProducts().filter(p => p.is_active), [productsVersion]);
  const categories = useMemo(() => dbStore.getCategories(), [productsVersion]);

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

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Subcategory / Category
      if (filters.selectedSubcategory && product.category_id !== filters.selectedSubcategory) {
        return false;
      }
      // Min Price
      if (filters.minPrice !== undefined && product.price_egp < filters.minPrice) {
        return false;
      }
      // Max Price
      if (filters.maxPrice !== undefined && product.price_egp > filters.maxPrice) {
        return false;
      }
      // Stock
      if (filters.inStockOnly && product.stock_quantity <= 0) {
        return false;
      }
      // On sale
      if (filters.onSaleOnly && (!product.original_price_egp || product.original_price_egp <= product.price_egp)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.price_egp - b.price_egp;
      }
      if (sortBy === 'price_desc') {
        return b.price_egp - a.price_egp;
      }
      if (sortBy === 'popular') {
        return b.sales_count - a.sales_count;
      }
      return 0; // recommended
    });
  }, [allProducts, filters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'كل المنتجات' }]} />

      {/* Page Title & Sort Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900">
            جميع منتجات مول المصطفى
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            عرض {filteredProducts.length} من إجمالي {allProducts.length} منتج متوفر
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-mall-900" />
            <span>تصفية ({filteredProducts.length})</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 hidden sm:inline">الترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="recommended">الموصى به</option>
              <option value="newest">الأحدث وصولاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="popular">الأكثر مبيعاً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout Grid: Sidebar + Products */}
      <div className="flex items-start gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          resultCount={filteredProducts.length}
        />

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
              <p className="font-bold text-gray-800 text-base">لا توجد منتجات مطابقة لخيارات التصفية</p>
              <p className="text-xs text-gray-400">جرب تعديل خيارات البحث أو إعادة ضبط الفلاتر لعرض المنتجات</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 py-2 px-5 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors"
              >
                إعادة ضبط جميع الفلاتر
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
