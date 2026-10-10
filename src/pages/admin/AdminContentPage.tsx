import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { HomepageSection } from '../../types';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  RotateCcw,
  Check
} from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>(() => dbStore.getHomepageSections());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const reloadData = () => {
    setSections(dbStore.getHomepageSections());
  };

  useEffect(() => {
    const handleUpdate = () => {
      setSections(dbStore.getHomepageSections());
    };
    window.addEventListener('al_mostafa_content_updated', handleUpdate);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_content_updated', handleUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleToggleVisibility = (sec: HomepageSection) => {
    const currentVal = (sec.is_visible ?? sec.is_enabled ?? true) !== false;
    const nextVal = !currentVal;
    dbStore.updateHomepageSection(sec.section_key, {
      is_visible: nextVal,
      is_enabled: nextVal
    });
    reloadData();
    showNotice(nextVal ? `تم تفعيل قسم "${sec.title_ar}"` : `تم إخفاء قسم "${sec.title_ar}"`);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    newSections.forEach((sec, idx) => {
      sec.sort_order = idx + 1;
    });

    dbStore.saveHomepageSections(newSections);
    reloadData();
    showNotice('تم تحديث ترتيب الأقسام بنجاح');
  };

  const handleStartEdit = (sec: HomepageSection) => {
    setEditingKey(sec.section_key);
    setEditTitle(sec.title_ar);
    setEditSubtitle(sec.subtitle_ar || '');
  };

  const handleSaveEdit = (secKey: string) => {
    dbStore.updateHomepageSection(secKey, {
      title_ar: editTitle,
      subtitle_ar: editSubtitle
    });
    setEditingKey(null);
    reloadData();
    showNotice('تم حفظ التعديلات النصية بنجاح');
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في استعادة ترتيب وعناوين أقسام الصفحة الرئيسية الافتراضية بالكامل؟')) {
      const defaults = dbStore.resetHomepageSectionsToDefault();
      setSections(defaults);
      showNotice('تمت استعادة الأقسام والترتيب الافتراضي بنجاح');
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-mall-900" />
            <span>محتوى وتخطيط الصفحة الرئيسية</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            إعادة ترتيب أقسام الواجهة، إظهار وإخفاء البلوكات، وتعديل العناوين الترويجية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {actionNotice && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{actionNotice}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="استعادة تخطيط وأقسام الصفحة الرئيسية الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            <span>استعادة الترتيب الافتراضي</span>
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, index) => {
          const isEditing = editingKey === sec.section_key;
          const isSecVisible = (sec.is_visible ?? sec.is_enabled ?? true) !== false;

          return (
            <div
              key={sec.id}
              className={`bg-white rounded-2xl border p-4 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isSecVisible ? 'border-gray-200' : 'border-gray-100 opacity-60 bg-gray-50'
              }`}
            >
              {/* Order Controls & Info */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-1 text-gray-400 hover:text-mall-900 disabled:opacity-20 rounded hover:bg-gray-100 cursor-pointer"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-1 text-gray-400 hover:text-mall-900 disabled:opacity-20 rounded hover:bg-gray-100 cursor-pointer"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-8 h-8 rounded-xl bg-mall-50 text-mall-950 font-black flex items-center justify-center text-xs shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                        placeholder="عنوان القسم"
                      />
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                        placeholder="الوصف الفرعي للقسم"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(sec.section_key)}
                          className="px-3 py-1 bg-mall-900 text-white rounded-lg text-xs font-bold hover:bg-mall-800 cursor-pointer"
                        >
                          حفظ التعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{sec.title_ar}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">
                          {sec.section_type}
                        </span>
                      </div>
                      {sec.subtitle_ar && (
                        <p className="text-xs text-gray-500 mt-0.5">{sec.subtitle_ar}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => handleStartEdit(sec)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 inline ms-1" />
                  <span>تعديل النصوص</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleVisibility(sec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    isSecVisible
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {isSecVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>ظاهر في الواجهة</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>مخفي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
