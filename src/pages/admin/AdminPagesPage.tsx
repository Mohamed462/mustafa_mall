import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { formatDateTime } from '../../utils/formatters';
import { CmsPage } from '../../types';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPagesPage: React.FC = () => {
  const [pages, setPages] = useState<CmsPage[]>(() => dbStore.getCmsPages());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const reloadData = () => {
    setPages(dbStore.getCmsPages());
  };

  const handleOpenCreate = () => {
    setEditingPage(null);
    setTitleAr('');
    setSlug('');
    setContentAr('');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page: CmsPage) => {
    setEditingPage(page);
    setTitleAr(page.title_ar);
    setSlug(page.slug);
    setContentAr(page.content_ar);
    setIsPublished(page.is_published);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصفحة التعريفية نهائياً؟')) {
      dbStore.deleteCmsPage(id);
      reloadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !slug.trim()) return;

    dbStore.saveCmsPage({
      id: editingPage?.id,
      title_ar: titleAr.trim(),
      slug: slug.trim().toLowerCase(),
      content_ar: contentAr,
      is_published: isPublished
    });

    reloadData();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-mall-900" />
            <span>إدارة الصفحات التعريفية والسياسات (CMS)</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            إدارة صفحات من نحن، الشروط والأحكام، سياسات الإرجاع، وإرشادات التصميم والطباعة
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء صفحة جديدة</span>
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">عنوان الصفحة</th>
                <th className="p-3">الرابط المباشر (Slug)</th>
                <th className="p-3">حجم المحتوى</th>
                <th className="p-3">آخر تحديث</th>
                <th className="p-3 text-center">حالة النشر</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-mall-900 shrink-0" />
                      <span>{p.title_ar}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-mall-900 font-bold dir-ltr text-right">
                    /page/{p.slug}
                  </td>
                  <td className="p-3 text-gray-500 font-mono">
                    {p.content_ar.length.toLocaleString('ar-EG')} حرف
                  </td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">
                    {formatDateTime(p.updated_at)}
                  </td>
                  <td className="p-3 text-center">
                    {p.is_published ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" />
                        <span>منشورة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        <XCircle className="w-3 h-3" />
                        <span>مسودة</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/page/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-600 hover:text-mall-900 hover:bg-gray-100 rounded-lg"
                        title="معاينة الصفحة بالمتجر"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-gray-600 hover:text-mall-900 hover:bg-gray-100 rounded-lg"
                        title="تعديل المحتوى"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        title="حذف الصفحة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-mall-900" />
                <span>{editingPage ? 'تعديل الصفحة التعريفية' : 'إنشاء صفحة تعريفية جديدة'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">عنوان الصفحة (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سياسة الاستبدال والاسترجاع"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">الرابط المباشر (Slug بالإنجليزية) *</label>
                  <input
                    type="text"
                    required
                    placeholder="return-policy"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">محتوى وتفاصيل الصفحة (يدعم التنسيق النصي) *</label>
                <textarea
                  rows={10}
                  required
                  placeholder="اكتب تفاصيل وبنود الصفحة هنا..."
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl leading-relaxed focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="page_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-mall-900 focus:ring-mall-900"
                />
                <label htmlFor="page_published" className="font-bold text-gray-800 cursor-pointer">
                  نشر الصفحة وإتاحتها للزوار في روابط التذييل والقوائم
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-mall-900 text-white rounded-xl font-bold hover:bg-mall-800 transition-colors"
                >
                  حفظ ونشر التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
