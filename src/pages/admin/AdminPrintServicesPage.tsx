import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { PrintService, PrintPricingModel, PrintServiceOption, PrintServiceOptionValue } from '../../types';
import { formatEGP } from '../../utils/formatters';
import { 
  Printer, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Sliders, 
  Calculator, 
  PlusCircle, 
  MinusCircle, 
  Layers, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';

export const AdminPrintServicesPage: React.FC = () => {
  const [services, setServices] = useState<PrintService[]>(() => dbStore.getPrintServices());
  const [editingService, setEditingService] = useState<PrintService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'options' | 'calculator'>('details');

  // Interactive Test Calculator in Admin Modal
  const [testPages, setTestPages] = useState<number>(20);
  const [testCopies, setTestCopies] = useState<number>(2);
  const [testWidth, setTestWidth] = useState<number>(1);
  const [testHeight, setTestHeight] = useState<number>(2);
  const [testQuantity, setTestQuantity] = useState<number>(100);
  const [testSelectedOptions, setTestSelectedOptions] = useState<Record<string, string>>({});

  const reloadData = () => {
    setServices(dbStore.getPrintServices());
  };

  const handleOpenAdd = () => {
    const newService: PrintService = {
      id: '',
      name_ar: '',
      slug: '',
      description_ar: '',
      pricing_model: 'per_page',
      base_price_egp: 1.5,
      min_order_price_egp: 15.0,
      turnaround_hours: 12,
      requires_file_upload: true,
      is_active: true,
      sort_order: services.length + 1,
      options: [
        {
          id: `opt-${Date.now()}-1`,
          service_id: '',
          option_key: 'color_mode',
          label_ar: 'ألوان الطباعة',
          option_type: 'radio',
          is_required: true,
          values: [
            { id: `v-1`, label_ar: 'أبيض وأسود', value_key: 'bw', price_impact_egp: 0, is_default: true },
            { id: `v-2`, label_ar: 'ألوان دقيقة', value_key: 'color', price_impact_egp: 3.0 },
          ]
        },
        {
          id: `opt-${Date.now()}-2`,
          service_id: '',
          option_key: 'paper_weight',
          label_ar: 'وزن وخامة الورق',
          option_type: 'select',
          is_required: true,
          values: [
            { id: `v-3`, label_ar: 'ورق قياسي 80 جم', value_key: '80g', price_impact_egp: 0, is_default: true },
            { id: `v-4`, label_ar: 'ورق فاخر 100 جم', value_key: '100g', price_impact_egp: 0.75 },
          ]
        }
      ]
    };
    setEditingService(newService);
    setActiveModalTab('details');
    initTestOptions(newService);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: PrintService) => {
    // Deep copy to prevent mutating state until save
    const copy: PrintService = JSON.parse(JSON.stringify(s));
    if (!copy.options) copy.options = [];
    setEditingService(copy);
    setActiveModalTab('details');
    initTestOptions(copy);
    setIsModalOpen(true);
  };

  const initTestOptions = (s: PrintService) => {
    const defaults: Record<string, string> = {};
    if (s.options) {
      s.options.forEach(opt => {
        const def = opt.values.find(v => v.is_default) || opt.values[0];
        if (def) defaults[opt.option_key] = def.value_key;
      });
    }
    setTestSelectedOptions(defaults);
  };

  // Option Handlers
  const handleAddOption = () => {
    if (!editingService) return;
    const newOpt: PrintServiceOption = {
      id: `opt-${Date.now()}`,
      service_id: editingService.id || '',
      option_key: `option_${(editingService.options?.length || 0) + 1}`,
      label_ar: 'خيار جديد (مثال: نوع التجليد)',
      option_type: 'select',
      is_required: true,
      values: [
        { id: `val-${Date.now()}-1`, label_ar: 'بدون تجليد', value_key: 'none', price_impact_egp: 0, is_default: true },
        { id: `val-${Date.now()}-2`, label_ar: 'تجليد سلك معدني', value_key: 'spiral', price_impact_egp: 15.0 },
      ]
    };
    setEditingService({
      ...editingService,
      options: [...(editingService.options || []), newOpt]
    });
  };

  const handleRemoveOption = (optIndex: number) => {
    if (!editingService || !editingService.options) return;
    const updated = [...editingService.options];
    updated.splice(optIndex, 1);
    setEditingService({ ...editingService, options: updated });
  };

  const handleAddOptionValue = (optIndex: number) => {
    if (!editingService || !editingService.options) return;
    const updated = [...editingService.options];
    const opt = updated[optIndex];
    opt.values.push({
      id: `val-${Date.now()}`,
      label_ar: 'قيمة جديدة',
      value_key: `val_${opt.values.length + 1}`,
      price_impact_egp: 5.0,
      is_default: false
    });
    setEditingService({ ...editingService, options: updated });
  };

  const handleRemoveOptionValue = (optIndex: number, valIndex: number) => {
    if (!editingService || !editingService.options) return;
    const updated = [...editingService.options];
    const opt = updated[optIndex];
    if (opt.values.length <= 1) {
      alert('يجب أن يحتوي الخيار على قيمة واحدة على الأقل');
      return;
    }
    opt.values.splice(valIndex, 1);
    setEditingService({ ...editingService, options: updated });
  };

  // Test Calculator Result
  const calculateTestPrice = (): { total: number; breakdown: string[] } => {
    if (!editingService) return { total: 0, breakdown: [] };
    const breakdown: string[] = [];

    if (editingService.pricing_model === 'per_page') {
      let pagePrice = editingService.base_price_egp;
      breakdown.push(`السعر الأساسي للصفحة: ${formatEGP(pagePrice)}`);

      let fixedAddons = 0;
      editingService.options?.forEach(opt => {
        const valKey = testSelectedOptions[opt.option_key];
        const val = opt.values.find(v => v.value_key === valKey);
        if (val && val.price_impact_egp > 0) {
          if (opt.option_key.includes('color') || opt.option_key.includes('paper') || opt.option_key.includes('size')) {
            pagePrice += val.price_impact_egp;
            breakdown.push(`إضافة ${opt.label_ar} (${val.label_ar}): +${formatEGP(val.price_impact_egp)} / صفحة`);
          } else {
            fixedAddons += val.price_impact_egp;
            breakdown.push(`إضافة ${opt.label_ar} (${val.label_ar}): +${formatEGP(val.price_impact_egp)} مقطوعة للنسخة`);
          }
        }
      });

      const pagesTotal = pagePrice * testPages * testCopies;
      const fixedTotal = fixedAddons * testCopies;
      const rawTotal = pagesTotal + fixedTotal;
      const finalPrice = Math.max(editingService.min_order_price_egp, rawTotal);

      breakdown.push(`إجمالي الصفحات (${testPages} صفحة × ${testCopies} نسخ × ${formatEGP(pagePrice)}): ${formatEGP(pagesTotal)}`);
      if (fixedTotal > 0) breakdown.push(`إجمالي الإضافات المقطوعة: ${formatEGP(fixedTotal)}`);
      if (finalPrice > rawTotal) breakdown.push(`تم تطبيق الحد الأدنى للطلب: ${formatEGP(editingService.min_order_price_egp)}`);

      return { total: finalPrice, breakdown };
    } 
    
    if (editingService.pricing_model === 'per_sqm') {
      const area = Math.max(0.2, testWidth * testHeight);
      let sqmPrice = editingService.base_price_egp;
      breakdown.push(`المساحة: ${area.toFixed(2)} م² (العرض ${testWidth}م × الارتفاع ${testHeight}م)`);
      breakdown.push(`سعر المتر المربع الأساسي: ${formatEGP(sqmPrice)}`);

      editingService.options?.forEach(opt => {
        const valKey = testSelectedOptions[opt.option_key];
        const val = opt.values.find(v => v.value_key === valKey);
        if (val && val.price_impact_egp > 0) {
          sqmPrice += val.price_impact_egp;
          breakdown.push(`إضافة ${opt.label_ar} (${val.label_ar}): +${formatEGP(val.price_impact_egp)} للمتر`);
        }
      });

      const rawTotal = area * sqmPrice * testQuantity;
      const finalPrice = Math.max(editingService.min_order_price_egp, rawTotal);
      return { total: finalPrice, breakdown };
    }

    if (editingService.pricing_model === 'per_unit') {
      let unitPrice = editingService.base_price_egp;
      breakdown.push(`سعر الوحدة الأساسي: ${formatEGP(unitPrice)}`);

      editingService.options?.forEach(opt => {
        const valKey = testSelectedOptions[opt.option_key];
        const val = opt.values.find(v => v.value_key === valKey);
        if (val && val.price_impact_egp > 0) {
          unitPrice += val.price_impact_egp;
          breakdown.push(`إضافة ${opt.label_ar}: +${formatEGP(val.price_impact_egp)}`);
        }
      });

      const rawTotal = unitPrice * testQuantity;
      const finalPrice = Math.max(editingService.min_order_price_egp, rawTotal);
      return { total: finalPrice, breakdown };
    }

    return { total: 0, breakdown: ['الخدمة تعتمد المقايسة الفنية اليدوية (Quote Only)'] };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name_ar || !editingService?.slug) return;

    dbStore.savePrintService({
      id: editingService.id || undefined,
      name_ar: editingService.name_ar,
      slug: editingService.slug,
      description_ar: editingService.description_ar || editingService.name_ar,
      pricing_model: editingService.pricing_model,
      base_price_egp: Number(editingService.base_price_egp || 0),
      min_order_price_egp: Number(editingService.min_order_price_egp || 0),
      turnaround_hours: Number(editingService.turnaround_hours || 24),
      requires_file_upload: editingService.requires_file_upload ?? true,
      is_active: editingService.is_active ?? true,
      sort_order: editingService.sort_order || 0,
      options: editingService.options || [],
    });

    reloadData();
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف خدمة "${name}" نهائياً؟`)) {
      dbStore.deletePrintService(id);
      reloadData();
    }
  };

  return (
    <div className="space-y-6 text-right font-arabic">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900 flex items-center gap-2">
            <Printer className="w-7 h-7 text-cyan-700" />
            <span>إدارة خدمات ومصفوفة تسعير مركز الطباعة</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            تحكم كامل في نماذج التسعير، أسعار الورق والصفحات، والمتر المربع، والتجليد، مع حاسبة اختبار حية
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة طباعة جديدة</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold px-2.5 py-0.5 rounded-full">
                  {service.pricing_model === 'per_page' ? 'حساب بالصفحة' :
                   service.pricing_model === 'per_sqm' ? 'حساب بالمتر المربع' :
                   service.pricing_model === 'per_unit' ? 'حساب بالقطعة' : 'مقايسة خاصة'}
                </span>
                <span className="text-xs text-gray-400 font-mono">/{service.slug}</span>
              </div>

              <h3 className="text-base font-black text-mall-900 mt-3">{service.name_ar}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">{service.description_ar}</p>

              {/* Price Details Snapshot */}
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs space-y-2 text-gray-700 bg-gray-50 p-3 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-gray-500">السعر الأساسي:</span>
                  <span className="font-black text-mall-900">
                    {service.pricing_model === 'quote_only' ? 'حسب المقايسة' : formatEGP(service.base_price_egp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الحد الأدنى للطلب:</span>
                  <span className="font-bold">{formatEGP(service.min_order_price_egp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">مدة التنفيذ المعتادة:</span>
                  <span className="font-bold">{service.turnaround_hours} ساعة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">خيارات التسعير المتاحة:</span>
                  <span className="font-bold text-cyan-800">{service.options?.length || 0} خيارات فرعية</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${service.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                {service.is_active ? '✓ نشطة بالمتجر' : 'معطلة مؤقتاً'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(service)}
                  className="py-1.5 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>ضبط وتعديل الأسعار</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteService(service.id, service.name_ar)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="حذف الخدمة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen / Large Modal for Editing Service and Pricing Matrix */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-base text-mall-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-cyan-700" />
                  <span>{editingService.id ? `تعديل خدمة: ${editingService.name_ar}` : 'إضافة خدمة طباعة جديدة'}</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  تحكم كامل في نموذج الحساب، أسعار الخامات، والخيارات الإضافية
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 gap-4">
              <button
                type="button"
                onClick={() => setActiveModalTab('details')}
                className={`pb-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeModalTab === 'details'
                    ? 'border-cyan-700 text-cyan-800'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <span>البيانات الأساسية ونموذج التسعير</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('options')}
                className={`pb-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeModalTab === 'options'
                    ? 'border-cyan-700 text-cyan-800'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>مصفوفة الخامات والأسعار ({editingService.options?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('calculator')}
                className={`pb-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeModalTab === 'calculator'
                    ? 'border-cyan-700 text-cyan-800'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>حاسبة الاختبار الحية (Test Calculator)</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* TAB 1: Details */}
              {activeModalTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">اسم خدمة الطباعة *</label>
                      <input
                        type="text"
                        required
                        value={editingService.name_ar}
                        onChange={(e) => setEditingService({ ...editingService, name_ar: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-700 focus:outline-hidden font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">الرابط المباشر (Slug) *</label>
                      <input
                        type="text"
                        required
                        value={editingService.slug}
                        onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-cyan-700 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">نموذج وطريقة حساب السعر للعميل *</label>
                    <select
                      value={editingService.pricing_model}
                      onChange={(e) => setEditingService({ ...editingService, pricing_model: e.target.value as any })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-700 focus:outline-hidden font-bold"
                    >
                      <option value="per_page">حساب بالصفحة (الكتب، الأبحاث، المذكرات، المخططات الهندسية)</option>
                      <option value="per_sqm">حساب بالمتر المربع (البانرات، الرول أب، الفينيل، اليافطات)</option>
                      <option value="per_unit">حساب بالقطعة / الباقة (كروت العمل، الفولدرات، البروشورات)</option>
                      <option value="quote_only">طلب مقايسة خاصة وعرض سعر يدوي من الفريق الفني</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">السعر الأساسي (ج.م) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={editingService.base_price_egp}
                        onChange={(e) => setEditingService({ ...editingService, base_price_egp: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">الحد الأدنى لقيمة الطلب (ج.م) *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={editingService.min_order_price_egp}
                        onChange={(e) => setEditingService({ ...editingService, min_order_price_egp: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">مدة التنفيذ المتوقعة (بالساعات) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingService.turnaround_hours}
                        onChange={(e) => setEditingService({ ...editingService, turnaround_hours: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">وصف الخدمة وشروط الطباعة</label>
                    <textarea
                      rows={3}
                      value={editingService.description_ar}
                      onChange={(e) => setEditingService({ ...editingService, description_ar: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingService.requires_file_upload}
                        onChange={(e) => setEditingService({ ...editingService, requires_file_upload: e.target.checked })}
                        className="rounded text-cyan-700"
                      />
                      <span className="font-bold text-gray-800">تتطلب رفع ملفات للطباعة (PDF / AI / PSD / Word)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingService.is_active}
                        onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                        className="rounded text-cyan-700"
                      />
                      <span className="font-bold text-gray-800">الخدمة نشطة ومتاحة للعملاء</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: Dynamic Pricing Options Matrix */}
              {activeModalTab === 'options' && (
                <div className="space-y-4 max-h-96 overflow-y-auto pe-1">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-bold text-gray-800">
                      قائمة الخيارات والمواصفات المحددة لهذه الخدمة:
                    </span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 text-white rounded-xl text-xs font-bold hover:bg-cyan-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة خيار تسعير جديد</span>
                    </button>
                  </div>

                  {(!editingService.options || editingService.options.length === 0) ? (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl text-gray-500">
                      لا توجد خيارات مخصصة بعد. أضف خيارات للتحكم في أسعار الورق والتجليد.
                    </div>
                  ) : (
                    editingService.options.map((opt, optIndex) => (
                      <div key={opt.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={opt.label_ar}
                              onChange={(e) => {
                                const updated = [...editingService.options!];
                                updated[optIndex].label_ar = e.target.value;
                                setEditingService({ ...editingService, options: updated });
                              }}
                              placeholder="عنوان الخيار (مثال: ألوان الطباعة)"
                              className="p-2 border border-gray-300 rounded-lg font-bold bg-white"
                            />
                            <input
                              type="text"
                              value={opt.option_key}
                              onChange={(e) => {
                                const updated = [...editingService.options!];
                                updated[optIndex].option_key = e.target.value;
                                setEditingService({ ...editingService, options: updated });
                              }}
                              placeholder="كود الخيار (color_mode)"
                              className="p-2 border border-gray-300 rounded-lg font-mono text-left dir-ltr bg-white"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIndex)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف هذا الخيار بالكامل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Values Table */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-gray-600 block">
                            القيم المتاحة وتأثيرها على السعر بالجنيه (EGP):
                          </span>

                          <div className="space-y-1.5">
                            {opt.values.map((val, valIndex) => (
                              <div key={val.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                                <input
                                  type="text"
                                  value={val.label_ar}
                                  onChange={(e) => {
                                    const updated = [...editingService.options!];
                                    updated[optIndex].values[valIndex].label_ar = e.target.value;
                                    setEditingService({ ...editingService, options: updated });
                                  }}
                                  placeholder="تسمية القيمة (مثال: أبيض وأسود)"
                                  className="flex-1 p-1.5 border border-gray-200 rounded-lg text-xs"
                                />

                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500 font-bold">+</span>
                                  <input
                                    type="number"
                                    step="0.25"
                                    value={val.price_impact_egp}
                                    onChange={(e) => {
                                      const updated = [...editingService.options!];
                                      updated[optIndex].values[valIndex].price_impact_egp = Number(e.target.value);
                                      setEditingService({ ...editingService, options: updated });
                                    }}
                                    className="w-20 p-1.5 border border-gray-200 rounded-lg text-center font-bold font-mono"
                                  />
                                  <span className="text-gray-500 text-[10px]">ج.م</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionValue(optIndex, valIndex)}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddOptionValue(optIndex)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 hover:text-cyan-900 mt-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>إضافة قيمة سعرية جديدة لهذا الخيار</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Interactive Test Calculator */}
              {activeModalTab === 'calculator' && (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-3">
                    <h4 className="font-black text-cyan-950 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-cyan-700" />
                      <span>محاكاة تجربة الأسعار الحية للعميل</span>
                    </h4>
                    <p className="text-[11px] text-gray-600">
                      جرب إدخال كميات واختيار خامات للتأكد من صحة معادلة السعر قبل الحفظ
                    </p>

                    {editingService.pricing_model === 'per_page' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">عدد الصفحات</label>
                          <input
                            type="number"
                            min="1"
                            value={testPages}
                            onChange={(e) => setTestPages(Math.max(1, Number(e.target.value)))}
                            className="w-full p-2 border border-gray-300 rounded-xl font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">عدد النسخ المطلوبة</label>
                          <input
                            type="number"
                            min="1"
                            value={testCopies}
                            onChange={(e) => setTestCopies(Math.max(1, Number(e.target.value)))}
                            className="w-full p-2 border border-gray-300 rounded-xl font-bold bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {editingService.pricing_model === 'per_sqm' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">العرض (بالمتر)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={testWidth}
                            onChange={(e) => setTestWidth(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-xl font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">الارتفاع (بالمتر)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={testHeight}
                            onChange={(e) => setTestHeight(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-xl font-bold bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Option Selectors for Testing */}
                    <div className="space-y-2 pt-2">
                      {editingService.options?.map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-700">{opt.label_ar}:</span>
                          <select
                            value={testSelectedOptions[opt.option_key] || ''}
                            onChange={(e) => setTestSelectedOptions({ ...testSelectedOptions, [opt.option_key]: e.target.value })}
                            className="p-1.5 border border-gray-300 rounded-lg bg-white font-bold"
                          >
                            {opt.values.map(val => (
                              <option key={val.id} value={val.value_key}>
                                {val.label_ar} (+{val.price_impact_egp} ج.م)
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Calculation Output Box */}
                    {(() => {
                      const result = calculateTestPrice();
                      return (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-cyan-300 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="font-black text-gray-800 text-sm">السعر النهائي المقدر للعميل:</span>
                            <span className="text-xl font-black text-cyan-800 font-mono">
                              {formatEGP(result.total)}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-gray-500">
                            {result.breakdown.map((line, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                                <span>{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Modal Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black text-xs transition-colors shadow-sm"
                >
                  حفظ وتطبيق إعدادات الخدمة ومصفوفة الأسعار
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
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
