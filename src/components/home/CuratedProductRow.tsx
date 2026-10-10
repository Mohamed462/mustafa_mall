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
      <div className="flex items-end justify-between mb-6 pb-2.5 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              {title}
            </h2>
            {badge && (
              <span className="text-[10px] bg-[#0D7377]/10 text-[#0D7377] font-bold px-2.5 py-0.5 rounded border border-[#0D7377]/20">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs sm:text-sm font-bold text-[#1A1A1A] hover:text-[#B89B5E] flex items-center gap-1.5 transition-colors shrink-0 group"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
