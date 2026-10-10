import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Check, 
  Edit2, 
  Menu, 
  Link as LinkIcon,
  Navigation,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';
import { NavItem } from '../../types';
import { dbStore } from '../../services/dbStore';

export const AdminNavigationPage: React.FC = () => {
  const [items, setItems] = useState<NavItem[]>(() => dbStore.getNavItems());
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'mobile_bar'>('header');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const reload = () => {
    setItems(dbStore.getNavItems());
  };

  useEffect(() => {
    const handleNavUpdate = () => {
      setItems(dbStore.getNavItems());
    };
    window.addEventListener('al_mostafa_nav_updated', handleNavUpdate);
    window.addEventListener('al_mostafa_db_updated', handleNavUpdate);
    window.addEventListener('storage', handleNavUpdate);
    return () => {
      window.removeEventListener('al_mostafa_nav_updated', handleNavUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleNavUpdate);
      window.removeEventListener('storage', handleNavUpdate);
    };
  }, []);

  const saveItems = (updated: NavItem[]) => {
    dbStore.saveNavItems(updated);
    setItems(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleToggle = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, is_active: !item.is_active } : item);
    saveItems(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الرابط من القائمة؟')) {
      const remainingTabItems = items.filter(item => item.location === activeTab && item.id !== id);
      remainingTabItems.forEach((item, idx) => {
        item.sort_order = idx + 1;
      });
      const otherItems = items.filter(item => item.location !== activeTab && item.id !== id);
      saveItems([...otherItems, ...remainingTabItems]);
    }
  };

  const handleStartEdit = (item: NavItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
  };

  const handleSaveEdit = (id: string) => {
    if (!editLabel.trim() || !editUrl.trim()) return;
    const updated = items.map(item => item.id === id ? { ...item, label: editLabel.trim(), url: editUrl.trim() } : item);
    saveItems(updated);
    setEditingId(null);
  };

  const handleMoveOrder = (tabIndex: number, direction: 'up' | 'down') => {
    const tabItems = items.filter(item => item.location === activeTab);
    const targetTabIndex = direction === 'up' ? tabIndex - 1 : tabIndex + 1;
    if (targetTabIndex < 0 || targetTabIndex >= tabItems.length) return;

    // Reorder items within activeTab
    const reorderedTabItems = [...tabItems];
    const [moved] = reorderedTabItems.splice(tabIndex, 1);
    reorderedTabItems.splice(targetTabIndex, 0, moved);

    // Reassign strict sequential sort_order (1, 2, 3...)
    reorderedTabItems.forEach((item, idx) => {
      item.sort_order = idx + 1;
    });

    // Merge with all other tabs
    const otherItems = items.filter(item => item.location !== activeTab);
    const updatedAll = [...otherItems, ...reorderedTabItems];

    saveItems(updatedAll);
  };

  const handleAdd = () => {
    const label = window.prompt('أدخل اسم الرابط (بالعربية):');
    if (!label) return;
    const url = window.prompt('أدخل مسار الرابط (مثال: /shop أو /page/about):', '/');
    if (!url) return;

    const currentTabCount = items.filter(i => i.location === activeTab).length;
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: label.trim(),
      url: url.trim(),
      location: activeTab,
      is_active: true,
      sort_order: currentTabCount + 1
    };
    saveItems([...items, newItem]);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في استعادة جميع روابط التنقل الافتراضية للهيدر والفوتر وشريط الموبايل؟')) {
      const defaults = dbStore.resetNavItemsToDefault();
      setItems(defaults);
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2500);
    }
  };

  const currentTabItems = items.filter(item => item.location === activeTab);

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Compass className="w-7 h-7 text-mall-900" />
            <span>قوائم التنقل والروابط السريعة</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            إدارة روابط الهيدر وشريط الفوتر السفلي والشريط الثابت على الهواتف الذكية
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSavedNotice && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>تم حفظ التعديلات بنجاح</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="استعادة الروابط والقوائم الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            <span>استعادة الافتراضي</span>
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رابط للقائمة الحالية</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'header'
              ? 'border-mall-900 text-mall-900'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>شريط الهيدر العلوي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'footer'
              ? 'border-mall-900 text-mall-900'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>روابط التذييل (الفوتر)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mobile_bar')}
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'mobile_bar'
              ? 'border-mall-900 text-mall-900'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>شريط الموبايل السفلي الثابت</span>
        </button>
      </div>

      {/* Nav Items List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-gray-100">
          {currentTabItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              لا توجد عناصر مسجلة في هذه القائمة حالياً
            </div>
          ) : (
            currentTabItems.map((item, idx) => {
              const isEditing = editingId === item.id;
              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-xs">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Order buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        className="p-1 text-gray-400 hover:text-mall-900 disabled:opacity-20 rounded hover:bg-gray-100"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentTabItems.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        className="p-1 text-gray-400 hover:text-mall-900 disabled:opacity-20 rounded hover:bg-gray-100"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>

                    {isEditing ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="اسم الرابط"
                          className="p-1.5 border border-gray-300 rounded-lg text-xs font-bold w-full sm:w-48"
                        />
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="المسار (/page/...)"
                          className="p-1.5 border border-gray-300 rounded-lg text-xs font-mono dir-ltr text-right flex-1"
                        />
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-2.5 py-1 bg-mall-900 text-white rounded-lg text-xs font-bold hover:bg-mall-800"
                          >
                            حفظ
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 text-sm block">{item.label}</span>
                        <span className="font-mono text-gray-500 dir-ltr text-right block mt-0.5">{item.url}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-gray-500 hover:text-mall-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="تعديل الرابط"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                        item.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.is_active ? 'نشط' : 'معطل'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الرابط"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
