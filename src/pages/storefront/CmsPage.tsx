import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

const SLUG_ALIASES: Record<string, string> = {
  'terms-conditions': 'terms',
  'privacy-policy': 'privacy',
  'return-policy': 'returns',
  'replacement-policy': 'returns',
};

export const CmsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const resolvedSlug = (slug && SLUG_ALIASES[slug]) || slug;
  const page = resolvedSlug ? dbStore.getCmsPageBySlug(resolvedSlug) : undefined;

  if (!page || !page.is_published) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">الصفحة غير متوفرة</h2>
        <Link to="/" className="inline-block px-6 py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-right">
      <Breadcrumbs items={[{ label: page.title_ar }]} />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-mall-900 pb-4 border-b border-gray-100">
          {page.title_ar}
        </h1>

        <div className="text-xs sm:text-sm text-gray-700 leading-loose whitespace-pre-line">
          {page.content_ar}
        </div>
      </div>
    </div>
  );
};
