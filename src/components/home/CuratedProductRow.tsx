import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { ArrowLeft } from 'lucide-react';

interface CuratedProductRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  badge?: string;
}

export const CuratedProductRow: React.FC<CuratedProductRowProps> = ({
  title,
  subtitle,
  products,
  viewAllLink = '/shop',
  badge,
}) => {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Shelf Header */}
      <div className="flex items-end justify-between mb-6 pb-2.5 border-b border-[rgba(17,21,26,0.11)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#04383f]">
              {title}
            </h2>
            {badge && (
              <span className="text-[10px] bg-[rgba(8,96,107,0.08)] text-[#08606B] font-bold px-2.5 py-0.5 rounded-full border border-[rgba(8,96,107,0.22)]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#687280] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs sm:text-sm font-bold text-[#04383f] hover:text-[#08606B] flex items-center gap-1.5 transition-colors shrink-0 group"
          >
            <span>شوف الكل</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        )}
      </div>

      {/* Products Grid - 6 products row on desktop, 3 on tablet, 2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile Quick View All Button */}
      {viewAllLink && (
        <div className="mt-4 text-center sm:hidden">
          <Link
            to={viewAllLink}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white border border-[rgba(17,21,26,0.12)] text-[#04383f] font-bold text-xs shadow-xs hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <span>عرض الكل في {title}</span>
            <ArrowLeft className="w-3.5 h-3.5 text-[#08606B]" />
          </Link>
        </div>
      )}
    </section>
  );
};
