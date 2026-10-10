import React from 'react';
import { Category } from '../../types';
import { X, Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  selectedSubcategory?: string;
  selectedBrand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

interface FilterSidebarProps {
  categories?: Category[];
  subcategories?: Category[];
  brands?: any[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  resultCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  subcategories,
  filters,
  onFilterChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
  resultCount,
}) => {
  const content = (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-mall-900" />
          <h3 className="text-sm font-bold text-gray-900">تصفية النتائج ({resultCount})</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-gold-600 hover:text-gold-700 font-bold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      {/* Subcategories if provided */}
      {subcategories && subcategories.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-800 mb-2.5">الفئة الفرعية</h4>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pe-1">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, selectedSubcategory: undefined })}
              className={`w-full text-right py-1.5 px-2 rounded-lg text-xs transition-colors ${
                !filters.selectedSubcategory ? 'bg-mall-900 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكل
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, selectedSubcategory: sub.id })}
                className={`w-full text-right py-1.5 px-2 rounded-lg text-xs transition-colors ${
                  filters.selectedSubcategory === sub.id ? 'bg-mall-900 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sub.name_ar}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-800 mb-2.5">السعر (ج.م)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="الحد الأدنى"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg text-right focus:outline-none focus:border-gold-500"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="number"
            placeholder="الحد الأقصى"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg text-right focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Checkboxes: In Stock & On Sale */}
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded text-mall-900 focus:ring-gold-500 w-4 h-4 accent-mall-900"
          />
          <span>المنتجات المتوفرة فقط</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => onFilterChange({ ...filters, onSaleOnly: e.target.checked })}
            className="rounded text-mall-900 focus:ring-gold-500 w-4 h-4 accent-mall-900"
          />
          <span>العروض والخصومات فقط</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs shrink-0 self-start sticky top-28">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 start-0 max-w-xs w-full bg-white shadow-2xl p-5 flex flex-col z-50">
            <div className="flex justify-end mb-2">
              <button onClick={onCloseMobile} className="p-1 rounded text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold"
              >
                تطبيق الفلاتر ({resultCount} نتيجة)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
