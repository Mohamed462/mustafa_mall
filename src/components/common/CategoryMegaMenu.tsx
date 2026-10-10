import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { 
  Sparkles, 
  Smartphone, 
  BookOpen, 
  Gift, 
  Briefcase, 
  Gem, 
  Printer, 
  ChevronLeft, 
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';

interface CategoryMegaMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles className="w-5 h-5 text-gold-500" />;
    case 'Smartphone': return <Smartphone className="w-5 h-5 text-blue-500" />;
    case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
    case 'Gift': return <Gift className="w-5 h-5 text-purple-500" />;
    case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-600" />;
    case 'Gem': return <Gem className="w-5 h-5 text-rose-500" />;
    case 'Printer': return <Printer className="w-5 h-5 text-cyan-600" />;
    default: return <ShoppingBag className="w-5 h-5 text-gray-500" />;
  }
};

export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ categories, isOpen, onClose }) => {
  const [activeDepartmentId, setActiveDepartmentId] = useState<string>(
    categories[0]?.id || ''
  );

  if (!isOpen) return null;

  const activeCategory = categories.find(c => c.id === activeDepartmentId) || categories[0];

  return (
    <>
      {/* Backdrop - only on desktop to prevent trapping mobile touch */}
      <div 
        className="hidden lg:block fixed inset-0 bg-black/40 z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Desktop Mega Menu Dropdown */}
      <div className="hidden lg:block absolute top-full inset-x-0 w-full bg-white shadow-2xl border-t border-gray-100 z-50">
        <div className="max-w-7xl mx-auto flex min-h-[460px] border-b border-gray-100">
          {/* Main Departments Column (Right side in RTL) */}
          <div className="w-1/4 border-s border-gray-100 bg-gray-50/70 py-4">
            <h3 className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              أقسام مول المصطفى
            </h3>
            <ul className="space-y-1">
              {categories.map((cat) => {
                const isActive = cat.id === activeCategory?.id;
                const isPrintCenter = cat.department_key === 'print_center';

                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveDepartmentId(cat.id)}
                      onClick={() => setActiveDepartmentId(cat.id)}
                      className={`w-full text-right px-5 py-3.5 flex items-center justify-between text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-white text-mall-900 border-r-4 border-gold-500 shadow-sm font-bold' 
                          : 'text-gray-700 hover:bg-gray-100/80 hover:text-mall-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-1 rounded bg-white shadow-xs">
                          {getCategoryIcon(cat.icon_name)}
                        </span>
                        <span>{cat.name_ar}</span>
                      </div>
                      {isPrintCenter ? (
                        <span className="text-[10px] bg-gold-100 text-gold-800 font-bold px-2 py-0.5 rounded-full">
                          خدمي فوري
                        </span>
                      ) : (
                        <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${isActive ? 'rotate-180 text-gold-500' : ''}`} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Subcategories Details Pane (Left side in RTL) */}
          <div className="w-3/4 p-8 bg-white flex flex-col justify-between">
            <div>
              {/* Department Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h4 className="text-xl font-black text-mall-900 flex items-center gap-2">
                    {getCategoryIcon(activeCategory?.icon_name)}
                    {activeCategory?.name_ar}
                  </h4>
                  {activeCategory?.description_ar && (
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      {activeCategory.description_ar}
                    </p>
                  )}
                </div>

                <Link
                  to={activeCategory?.department_key === 'print_center' ? '/print-center' : `/category/${activeCategory?.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-mall-900 hover:text-gold-600 bg-gray-50 hover:bg-gold-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-all"
                >
                  <span>عرض جميع منتجات القسم</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategories Grid */}
              {activeCategory?.department_key === 'print_center' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gold-200 bg-gold-50/40">
                    <h5 className="font-bold text-mall-900 mb-2">خدمات الطباعة الورقية والأكاديمية</h5>
                    <p className="text-xs text-gray-600 mb-3">طباعة الأبحاث والرسائل والمذكرات وتجليد الكتب والشهادات مع تسليم سريع.</p>
                    <Link
                      to="/print-center"
                      onClick={onClose}
                      className="text-xs font-bold text-gold-700 hover:underline"
                    >
                      تصفح خيارات المستندات ←
                    </Link>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                    <h5 className="font-bold text-mall-900 mb-2">الدعاية والإعلان والمطبوعات التجارية</h5>
                    <p className="text-xs text-gray-600 mb-3">كروت شخصية، فلايرات، لافتات بانر وفلكس، واستيكرات مقصوصة بالطلب.</p>
                    <Link
                      to="/print-center"
                      onClick={onClose}
                      className="text-xs font-bold text-blue-700 hover:underline"
                    >
                      تصفح خيارات الدعاية والبانرات ←
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-y-4 gap-x-6">
                  {activeCategory?.children && activeCategory.children.length > 0 ? (
                    activeCategory.children.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-mall-900 group-hover:font-semibold">
                          {sub.name_ar}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-gold-500 group-hover:-translate-x-1 transition-all" />
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10 text-gray-400">
                      لا توجد فئات فرعية مخصصة حالياً
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Promo Note */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>جميع المنتجات والأسعار معتمدة ومحدثة دورياً</span>
              <span className="text-gold-600 font-semibold">شحن فوري داخل مصر</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
