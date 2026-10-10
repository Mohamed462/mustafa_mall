import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { Brand } from '../../types';
import { Award, Plus, Edit, Trash2 } from 'lucide-react';

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState(() => dbStore.getBrands());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);

  const handleOpenAdd = () => {
    setEditingBrand({
      name_ar: '',
      name_en: '',
      slug: '',
      is_featured: false,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand({ ...b });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?.name_ar || !editingBrand?.slug) return;

    dbStore.saveBrand({
      id: editingBrand.id,
      name_ar: editingBrand.name_ar,
      name_en: editingBrand.name_en,
      slug: editingBrand.slug,
      is_featured: editingBrand.is_featured,
      is_active: editingBrand.is_active,
    });

    setBrands(dbStore.getBrands());
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900">
            إدارة الماركات والبراندات المعتمدة ({brands.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            الماركات المعروضة في المتجر (براند شوب) وربطها بالمنتجات
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ماركة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-mall-900 text-sm">
                <Award className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <span className="font-bold text-xs text-gray-900 block">{brand.name_ar}</span>
                {brand.name_en && (
                  <span className="text-[10px] text-gray-400 font-mono block">{brand.name_en}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(brand)}
              className="p-1.5 text-gray-400 hover:text-gold-600"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 text-right space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-mall-900 pb-2 border-b border-gray-100">
              {editingBrand.id ? 'تعديل الماركة' : 'إضافة ماركة جديدة'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.name_ar}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name_ar: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={editingBrand.name_en || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name_en: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">الرابط الدائم (Slug) *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.slug}
                  onChange={(e) => setEditingBrand({ ...editingBrand, slug: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl text-left font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 rounded-xl text-xs font-black"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
