import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { formatEGP, formatDateTime } from '../../utils/formatters';
import { Coupon, SmartDiscountCampaign, DiscountScope, Category, Product } from '../../types';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Tag, 
  Layers,
  Sparkles,
  RotateCcw,
  Play,
  X,
  Search,
  AlertCircle
} from 'lucide-react';

export const AdminPromotionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'coupons'>('campaigns');

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => dbStore.getCoupons());
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [couponDiscountValue, setCouponDiscountValue] = useState<number>(10);
  const [couponMinOrderValue, setCouponMinOrderValue] = useState<number>(300);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState<number | undefined>(150);
  const [couponExpiresAt, setCouponExpiresAt] = useState<string>('');
  const [couponUsageLimit, setCouponUsageLimit] = useState<number | undefined>(100);
  const [couponIsActive, setCouponIsActive] = useState<boolean>(true);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<SmartDiscountCampaign[]>(() => dbStore.getDiscountCampaigns());
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SmartDiscountCampaign | null>(null);
  const [campaignFeedback, setCampaignFeedback] = useState<string | null>(null);

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('');
  const [campaignScope, setCampaignScope] = useState<DiscountScope>('all_categories');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [targetProductIds, setTargetProductIds] = useState<string[]>([]);
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);
  const [campaignDiscountType, setCampaignDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [campaignDiscountValue, setCampaignDiscountValue] = useState<number>(15);
  const [campaignExpiresAt, setCampaignExpiresAt] = useState<string>('');
  const [applyImmediately, setApplyImmediately] = useState<boolean>(true);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Data helpers
  const categories: Category[] = dbStore.getCategories();
  const allProducts: Product[] = dbStore.getProducts();

  const reloadData = () => {
    setCoupons(dbStore.getCoupons());
    setCampaigns(dbStore.getDiscountCampaigns());
  };

  const showFeedback = (msg: string) => {
    setCampaignFeedback(msg);
    setTimeout(() => setCampaignFeedback(null), 4000);
  };

  // --- Coupon Handlers ---
  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponCode('');
    setCouponDiscountType('percentage');
    setCouponDiscountValue(10);
    setCouponMinOrderValue(300);
    setCouponMaxDiscount(150);
    setCouponExpiresAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setCouponUsageLimit(100);
    setCouponIsActive(true);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponCode(c.code);
    setCouponDiscountType(c.discount_type);
    setCouponDiscountValue(c.discount_value);
    setCouponMinOrderValue(c.min_order_value_egp);
    setCouponMaxDiscount(c.max_discount_egp);
    setCouponExpiresAt(c.expires_at ? c.expires_at.split('T')[0] : '');
    setCouponUsageLimit(c.usage_limit);
    setCouponIsActive(c.is_active);
    setIsCouponModalOpen(true);
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف كوبون الخصم هذا نهائياً؟')) {
      dbStore.deleteCoupon(id);
      reloadData();
    }
  };

  const handleSubmitCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    dbStore.saveCoupon({
      id: editingCoupon?.id,
      code: couponCode.trim().toUpperCase(),
      discount_type: couponDiscountType,
      discount_value: Number(couponDiscountValue),
      min_order_value_egp: Number(couponMinOrderValue),
      max_discount_egp: couponMaxDiscount ? Number(couponMaxDiscount) : undefined,
      expires_at: couponExpiresAt ? new Date(couponExpiresAt).toISOString() : undefined,
      usage_limit: couponUsageLimit ? Number(couponUsageLimit) : undefined,
      times_used: editingCoupon?.times_used || 0,
      is_active: couponIsActive,
    });

    reloadData();
    setIsCouponModalOpen(false);
  };

  // --- Campaign Handlers ---
  const handleOpenCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignName('');
    setCampaignScope('all_categories');
    setTargetCategoryId(categories[0]?.id || '');
    setTargetProductIds([]);
    setExcludedProductIds([]);
    setCampaignDiscountType('percentage');
    setCampaignDiscountValue(15);
    setCampaignExpiresAt('');
    setApplyImmediately(true);
    setProductSearchTerm('');
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaign = (camp: SmartDiscountCampaign) => {
    setEditingCampaign(camp);
    setCampaignName(camp.name);
    setCampaignScope(camp.scope);
    setTargetCategoryId(camp.target_category_id || categories[0]?.id || '');
    setTargetProductIds(camp.target_product_ids || []);
    setExcludedProductIds(camp.excluded_product_ids || []);
    setCampaignDiscountType(camp.discount_type);
    setCampaignDiscountValue(camp.discount_value);
    setCampaignExpiresAt(camp.expires_at ? camp.expires_at.split('T')[0] : '');
    setApplyImmediately(false);
    setProductSearchTerm('');
    setIsCampaignModalOpen(true);
  };

  const handleDeleteCampaign = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الحملة؟ (إذا كانت مطبقة يمكنك استرجاع الأسعار أولاً)')) {
      dbStore.deleteDiscountCampaign(id);
      reloadData();
      showFeedback('تم حذف حملة التخفيضات');
    }
  };

  const handleApplyCampaign = (campaignId: string) => {
    const result = dbStore.applyDiscountCampaign(campaignId);
    if (result.success) {
      reloadData();
      showFeedback(`تم تطبيق التخفيض بنجاح وتحديث أسعار (${result.affectedCount}) منتج!`);
    }
  };

  const handleRollbackCampaign = (campaignId: string) => {
    const success = dbStore.rollbackDiscountCampaign(campaignId);
    if (success) {
      reloadData();
      showFeedback('تم إلغاء التخفيض واسترجاع الأسعار الأساسية للمنتجات بنجاح!');
    }
  };

  const handleSubmitCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    const saved = dbStore.saveDiscountCampaign({
      id: editingCampaign?.id,
      name: campaignName.trim(),
      scope: campaignScope,
      target_category_id: (campaignScope === 'specific_category' || campaignScope === 'category_except_products') ? targetCategoryId : undefined,
      target_product_ids: targetProductIds,
      excluded_product_ids: excludedProductIds,
      discount_type: campaignDiscountType,
      discount_value: Number(campaignDiscountValue),
      expires_at: campaignExpiresAt ? new Date(campaignExpiresAt).toISOString() : undefined,
      is_active: true,
    });

    if (applyImmediately) {
      const applyRes = dbStore.applyDiscountCampaign(saved.id);
      showFeedback(`تم حفظ وتطبيق حملة "${saved.name}" على ${applyRes.affectedCount} منتج بنجاح!`);
    } else {
      showFeedback(`تم حفظ حملة "${saved.name}" بنجاح!`);
    }

    reloadData();
    setIsCampaignModalOpen(false);
  };

  const getScopeDescription = (camp: SmartDiscountCampaign) => {
    switch (camp.scope) {
      case 'all_categories':
        return 'جميع أقسام المتجر';
      case 'specific_category': {
        const cat = categories.find(c => c.id === camp.target_category_id);
        return `قسم: ${cat ? cat.name_ar : 'قسم محدد'}`;
      }
      case 'specific_products':
        return `${camp.target_product_ids?.length || 0} منتجات مختارة`;
      case 'all_except_products':
        return `جميع الأقسام (استثناء ${camp.excluded_product_ids?.length || 0} منتجات)`;
      case 'category_except_products': {
        const cat = categories.find(c => c.id === camp.target_category_id);
        return `قسم ${cat ? cat.name_ar : ''} (استثناء ${camp.excluded_product_ids?.length || 0} منتجات)`;
      }
      default:
        return camp.scope;
    }
  };

  const filteredProductsForPicker = allProducts.filter(p => {
    if (!productSearchTerm) return true;
    return p.name_ar.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
           p.sku.toLowerCase().includes(productSearchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 text-right font-arabic">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-mall-900 flex items-center gap-2">
            <Percent className="w-7 h-7 text-mall-900" />
            <span>إدارة العروض وحملات التخفيضات الذكية</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            نظام تخفيضات ذكي ومرن لتطبيق وتراجع الخصومات على مستوى الأقسام أو المنتجات أو المتجر بالكامل
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'campaigns' ? (
            <button
              type="button"
              onClick={handleOpenCreateCampaign}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء حملة تخفيضات ذكية</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateCoupon}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mall-900 hover:bg-mall-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كوبون جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-1.5 flex items-center gap-2 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-mall-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-mall-900 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>حملات التخفيضات الذكية ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-mall-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-mall-900 hover:bg-gray-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>كوبونات الخصم ({coupons.length})</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {campaignFeedback && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <span>{campaignFeedback}</span>
        </div>
      )}

      {/* ======================= TAB 1: SMART DISCOUNT CAMPAIGNS ======================= */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">اسم الحملة</th>
                  <th className="py-3.5 px-4">نطاق الاستهداف</th>
                  <th className="py-3.5 px-4">نوع وقيمة الخصم</th>
                  <th className="py-3.5 px-4">المنتجات المشمولة</th>
                  <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                  <th className="py-3.5 px-4 text-center">تطبيق وتراجع</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      لا توجد حملات تخفيضات مسجلة حالياً. أنشئ حملة الآن لاختيار قسم أو منتجات وتطبيق الخصم بضغطة زر!
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gold-500 shrink-0" />
                          <span className="font-black text-sm text-mall-900">{camp.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
                          {getScopeDescription(camp)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        {camp.discount_type === 'percentage' ? (
                          <span className="text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full font-black">
                            {camp.discount_value}% خصم مئوي
                          </span>
                        ) : (
                          <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-black">
                            {formatEGP(camp.discount_value)} خصم مباشر
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {(camp.applied_count || 0) > 0 ? (
                          <span className="text-mall-900 font-black">{camp.applied_count} منتج مخصوم</span>
                        ) : (
                          <span className="text-gray-400">غير مطبق حالياً</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formatDateTime(camp.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Apply Button */}
                          <button
                            type="button"
                            onClick={() => handleApplyCampaign(camp.id)}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="تطبيق الخصم وتعديل أسعار المنتجات في المتجر"
                          >
                            <Play className="w-3 h-3" />
                            <span>تطبيق الخصم</span>
                          </button>

                          {/* Rollback Button */}
                          <button
                            type="button"
                            onClick={() => handleRollbackCampaign(camp.id)}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="إلغاء الخصم واستعادة الأسعار الأساسية"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>استعادة الأسعار</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCampaign(camp)}
                            className="p-1.5 text-gray-600 hover:text-mall-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الحملة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحملة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: COUPONS ======================= */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th className="p-3.5">كود الخصم</th>
                  <th className="p-3.5">نوع وقيمة الخصم</th>
                  <th className="p-3.5">الحد الأدنى للطلب</th>
                  <th className="p-3.5">أقصى خصم</th>
                  <th className="p-3.5">مرات الاستخدام</th>
                  <th className="p-3.5">تاريخ الانتهاء</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      لا توجد كوبونات خصم حالياً. أضف كوبوناً جديداً لتنشيط المبيعات!
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-mall-900 shrink-0" />
                            <span className="font-mono font-black text-sm text-mall-900 tracking-wider">
                              {c.code}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-gray-900">
                          {c.discount_type === 'percentage' ? (
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-black">
                              {c.discount_value}% خصم
                            </span>
                          ) : (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-black">
                              {formatEGP(c.discount_value)} خصم مباشر
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-gray-700 font-semibold">
                          {c.min_order_value_egp > 0 ? formatEGP(c.min_order_value_egp) : 'بدون حد أدنى'}
                        </td>
                        <td className="p-3.5 text-gray-700 font-semibold">
                          {c.max_discount_egp ? formatEGP(c.max_discount_egp) : 'غير مقيد'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-gray-600">
                          {c.times_used} {c.usage_limit ? `/ ${c.usage_limit}` : 'مرة'}
                        </td>
                        <td className="p-3.5 text-gray-500 whitespace-nowrap">
                          {c.expires_at ? formatDateTime(c.expires_at) : 'دائم'}
                        </td>
                        <td className="p-3.5 text-center">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3" />
                              <span>منتهي</span>
                            </span>
                          ) : c.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3" />
                              <span>فعال</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              <XCircle className="w-3 h-3" />
                              <span>معطل</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCoupon(c)}
                              className="p-1.5 text-gray-600 hover:text-mall-900 hover:bg-gray-100 rounded-lg"
                              title="تعديل الكوبون"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="حذف الكوبون"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= CAMPAIGN MODAL ======================= */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <span>{editingCampaign ? 'تعديل حملة التخفيضات الذكية' : 'إنشاء حملة تخفيضات ذكية جديدة'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCampaign} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم الحملة الترويجية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تخفيضات عيد الفطر 20%، عروض قسم الإلكترونيات، إلخ."
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              {/* Scope Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">نطاق الاستهداف والتطبيق *</label>
                  <select
                    value={campaignScope}
                    onChange={(e: any) => setCampaignScope(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  >
                    <option value="all_categories">جميع أقسام المتجر (شامل)</option>
                    <option value="specific_category">قسم محدد فقط</option>
                    <option value="specific_products">منتجات مختارة يدوياً</option>
                    <option value="all_except_products">جميع الأقسام ما عدا منتجات مستثناة</option>
                    <option value="category_except_products">قسم محدد مع استثناء منتجات معينة</option>
                  </select>
                </div>

                {(campaignScope === 'specific_category' || campaignScope === 'category_except_products') && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">القسم المستهدف *</label>
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">نوع التخفيض *</label>
                  <select
                    value={campaignDiscountType}
                    onChange={(e: any) => setCampaignDiscountType(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed_amount">مبلغ ثابت بالجنيه (ج.م)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    قيمة التخفيض ({campaignDiscountType === 'percentage' ? '%' : 'ج.م'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={campaignDiscountValue}
                    onChange={(e) => setCampaignDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Product Multi-Picker for Specific Products */}
              {campaignScope === 'specific_products' && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800">
                      اختر المنتجات المشمولة بالتخفيض ({targetProductIds.length} محددة):
                    </label>
                    <span className="text-[10px] text-gray-500">ابحث واختر بوضع علامة صح</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث بالاسم أو كود SKU..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-xl pe-8 bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute start-2.5 top-2.5" />
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-200 bg-white rounded-xl border border-gray-200 p-2 space-y-1">
                    {filteredProductsForPicker.map(p => {
                      const isChecked = targetProductIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 cursor-pointer rounded">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setTargetProductIds(prev => 
                                  isChecked ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                );
                              }}
                              className="rounded text-mall-900 focus:ring-mall-900"
                            />
                            <span className="font-bold text-gray-900">{p.name_ar}</span>
                          </div>
                          <span className="font-mono text-gray-500">{formatEGP(p.price_egp)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Multi-Picker for Excluded Products */}
              {(campaignScope === 'all_except_products' || campaignScope === 'category_except_products' || campaignScope === 'all_categories') && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-red-800">
                      استثناء منتجات معينة من التخفيض ({excludedProductIds.length} مستثناة):
                    </label>
                    <span className="text-[10px] text-gray-500">هذه المنتجات لن تتأثر بالتخفيض</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث لاستثناء منتج..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-xl pe-8 bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute start-2.5 top-2.5" />
                  </div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-gray-200 bg-white rounded-xl border border-gray-200 p-2 space-y-1">
                    {filteredProductsForPicker.map(p => {
                      const isExcluded = excludedProductIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 cursor-pointer rounded">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isExcluded}
                              onChange={() => {
                                setExcludedProductIds(prev => 
                                  isExcluded ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                );
                              }}
                              className="rounded text-red-600 focus:ring-red-600"
                            />
                            <span className="font-bold text-gray-900">{p.name_ar}</span>
                          </div>
                          <span className="font-mono text-gray-500">{formatEGP(p.price_egp)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expiry & Apply immediately */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">تاريخ انتهاء الحملة (اختياري)</label>
                  <input
                    type="date"
                    value={campaignExpiresAt}
                    onChange={(e) => setCampaignExpiresAt(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyImmediately}
                      onChange={(e) => setApplyImmediately(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-600 w-4 h-4"
                    />
                    <span className="font-bold text-gray-900">تطبيق الخصم فوراً وتحديث الأسعار بالمتجر</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-black rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  حفظ وتأكيد الحملة
                </button>
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= COUPON MODAL ======================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-mall-900" />
                <span>{editingCoupon ? 'تعديل كوبون الخصم' : 'إضافة كوبون خصم جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">كود الكوبون (بالأحرف اللاتينية) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: WELCOME10 أو MOSTAFA50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">نوع الخصم *</label>
                  <select
                    value={couponDiscountType}
                    onChange={(e: any) => setCouponDiscountType(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed_amount">مبلغ مالي ثابت (ج.م)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">قيمة الخصم *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponDiscountValue}
                    onChange={(e) => setCouponDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">الحد الأدنى لقيمة الطلب (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponMinOrderValue}
                    onChange={(e) => setCouponMinOrderValue(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">أقصى حد للخصم (ج.م - اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponMaxDiscount || ''}
                    onChange={(e) => setCouponMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="بدون سقف"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={couponExpiresAt}
                    onChange={(e) => setCouponExpiresAt(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">أقصى عدد للاستخدامات الكلية</label>
                  <input
                    type="number"
                    min="1"
                    value={couponUsageLimit || ''}
                    onChange={(e) => setCouponUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="غير محدود"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active_checkbox"
                  checked={couponIsActive}
                  onChange={(e) => setCouponIsActive(e.target.checked)}
                  className="rounded text-mall-900 focus:ring-mall-900"
                />
                <label htmlFor="coupon_active_checkbox" className="font-bold text-gray-800 cursor-pointer">
                  تفعيل الكوبون للعملاء فوراً
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-mall-900 hover:bg-mall-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  حفظ وتفعيل الكوبون
                </button>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
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
