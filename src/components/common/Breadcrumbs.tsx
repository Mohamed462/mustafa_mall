import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 py-3 overflow-x-auto no-scrollbar" aria-label="مسار التنقل">
      <Link to="/" className="flex items-center gap-1 hover:text-mall-900 transition-colors shrink-0">
        <Home className="w-3.5 h-3.5 text-gray-400" />
        <span>الرئيسية</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronLeft className="w-3 h-3 text-gray-400 shrink-0" />
            {isLast || !item.path ? (
              <span className="font-bold text-gray-900 shrink-0 truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="hover:text-mall-900 transition-colors shrink-0">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
