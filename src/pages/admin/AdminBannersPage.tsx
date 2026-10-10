import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { Banner } from '../../types';
import { 
  Image, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(() => dbStore.getBanners());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [imageDesktopUrl, setImageDesktopUrl] = useState('');
  const [imageMobileUrl, setImageMobileUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/offers');
  const [ctaTextAr, setCtaTextAr] = useState('تسوق الآن');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [showOverlayText, setShowOverlayText] = useState<boolean>(true);

  const reloadData = () => {
    setBanners(dbStore.getBanners());
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitleAr('');
    setSubtitleAr('');
    setImageDesktopUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80');
    setImageMobileUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80');
    setLinkUrl('/offers');
    setCtaTextAr('تسوق العروض الآن');
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setShowOverlayText(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitleAr(b.title_ar || '');
    setSubtitleAr(b.subtitle_ar || '');
    setImageDesktopUrl(b.image_desktop_url);
    setImageMobileUrl(b.image_mobile_url || b.image_desktop_url);
    setLinkUrl(b.link_url);
    setCtaTextAr(b.cta_text_ar || 'تسوق الآن');
    setSortOrder(b.sort_order);
    setIsActive(b.is_active);
    setShowOverlayText(b.show_overlay_text !== false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البانر نهائياً؟')) {
      dbStore.deleteBanner(id);
      reloadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDesktopUrl) return;

    dbStore.saveBanner({
      id: editingBanner?.id,
      title_ar: titleAr,
      subtitle_ar: subtitleAr,
      image_desktop_url: imageDesktopUrl,
      image_mobile_url: imageMobileUrl || imageDesktopUrl,
      link_url: linkUrl,
      cta_text_ar: ctaTextAr,
      sort_order: Number(sortOrder),
      is_active: isActive,
      show_overlay_text: showOverlayText,
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
            <Image className="w-7 h-7 text-mall-900" />
            <span>إدارة البانرات الإعلانية وسلايدر الواجهة</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            التحكم في شرائح العرض الرئيسية وسلايدر الصفحة الرئيسية (بنسبة 3:1 للكمبيوتر و 1.5:1 للموبايل)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بانر جديد</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              {/* Banner visual preview */}
              <div className="relative aspect-3/1 bg-gray-100 overflow-hidden group">
                <img
                  src={b.image_desktop_url}
                  alt={b.title_ar || 'بانر'}
                  className="w-full h-full object-cover"
                />
                {b.show_overlay_text !== false && (b.title_ar || b.subtitle_ar) ? (
                  <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end text-white">
                    {b.title_ar && <span className="font-black text-sm block">{b.title_ar}</span>}
                    {b.subtitle_ar && <span className="text-xs text-gray-200 block">{b.subtitle_ar}</span>}
                  </div>
                ) : (
                  <div className="absolute bottom-2 start-2 bg-blue-950/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    صورة فقط (نصوص مخفية)
                  </div>
                )}
                {!b.is_active && (
                  <div className="absolute top-2 start-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    معطل
                  </div>
                )}
                <div className="absolute top-2 end-2 bg-mall-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  الترتيب: {b.sort_order}
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-bold">رابط التوجيه:</span>
                  <span className="font-mono text-mall-900 font-bold dir-ltr">{b.link_url}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-bold">نص زر الإجراء (CTA):</span>
                  <span className="text-gray-900 font-bold">{b.cta_text_ar || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-bold">الحالة الحالية:</span>
                  <span className={b.is_active ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {b.is_active ? 'ظاهر لزوار المتجر' : 'مخفي مؤقتاً'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions bar */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <a
                href={b.link_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-mall-900"
              >
                <ExternalLink className="w-3 h-3" />
                <span>معاينة الرابط</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(b)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5 inline ms-1" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 inline ms-1" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Image className="w-5 h-5 text-mall-900" />
                <span>{editingBanner ? 'تعديل البانر الإعلاني' : 'إضافة بانر إعلاني جديد'}</span>
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
              {/* Overlay Text Switch */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverlayText}
                    onChange={(e) => setShowOverlayText(e.target.checked)}
                    className="w-4 h-4 text-mall-900 rounded focus:ring-mall-900"
                  />
                  <span className="font-bold text-gray-900 text-xs">
                    عرض نصوص وأزرار ترويجية فوق صورة البانر
                  </span>
                </label>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  إذا كانت صورة البانر مصممة وجاهزة بالفعل، يمكنك تعطيل هذا الخيار لتظهر الصورة نظيفة تماماً بدون أي تعتيم أو نصوص مكررة. النقر على الصورة سينقل العميل مباشرة للرابط المحدد.
                </p>
              </div>

              {showOverlayText && (
                <>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">عنوان البانر الرئيسي</label>
                    <input
                      type="text"
                      placeholder="مثال: مهرجان تحطيم الأسعار الأسبوعي"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">الوصف الترويجي الفرعي</label>
                    <input
                      type="text"
                      placeholder="مثال: خصومات حقيقية تصل إلى 40% على جميع الأقسام"
                      value={subtitleAr}
                      onChange={(e) => setSubtitleAr(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">رابط صورة الكمبيوتر (نسبة 3:1) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/banner-desktop.jpg"
                  value={imageDesktopUrl}
                  onChange={(e) => setImageDesktopUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-left dir-ltr focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">رابط صورة الموبايل (نسبة 1.5:1 - اختياري)</label>
                <input
                  type="url"
                  placeholder="https://example.com/banner-mobile.jpg"
                  value={imageMobileUrl}
                  onChange={(e) => setImageMobileUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-left dir-ltr focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">رابط الوجهة عند النقر *</label>
                  <input
                    type="text"
                    required
                    placeholder="/offers أو /shop"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-left dir-ltr focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">نص زر التفاعل (CTA)</label>
                  <input
                    type="text"
                    value={ctaTextAr}
                    onChange={(e) => setCtaTextAr(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ترتيب الظهور</label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-mall-900 focus:ring-mall-900"
                    />
                    <span className="font-bold text-gray-800">بانر نشط بالمتجر</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-mall-900 text-white rounded-xl font-bold hover:bg-mall-800 transition-colors"
                >
                  حفظ البانر
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
