import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { Product, ProductAttribute, ProductVariant, ProductImage } from '../../types';
import { ArrowLeft, Save, Plus, Trash2, Image, Layers, Sparkles, Upload, FileImage, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { handleImageError, normalizeImageUrl, PRODUCT_FALLBACK_IMAGE } from '../../utils/imageUtils';

interface ImageMeta {
  width: number;
  height: number;
  sizeKb: number;
  fileName: string;
}

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const categories = useMemo(() => dbStore.getCategories(), []);
  const brands = useMemo(() => dbStore.getBrands(), []);

  // Form Fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [priceEgp, setPriceEgp] = useState<number | ''>('');
  const [originalPriceEgp, setOriginalPriceEgp] = useState<number | ''>('');
  const [costPriceEgp, setCostPriceEgp] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [primaryImageMeta, setPrimaryImageMeta] = useState<ImageMeta | null>(null);
  const [secondaryImageMetas, setSecondaryImageMetas] = useState<(ImageMeta | null)[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [shortDescAr, setShortDescAr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Dynamic Specs & Variants
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Load product if editing
  useEffect(() => {
    if (id) {
      const existing = dbStore.getProductById(id);
      if (existing) {
        setNameAr(existing.name_ar);
        setNameEn(existing.name_en || '');
        setSku(existing.sku);
        setBarcode(existing.barcode || '');
        setSlug(existing.slug);
        setCategoryId(existing.category_id);
        setBrandId(existing.brand_id || '');
        setPriceEgp(existing.price_egp);
        setOriginalPriceEgp(existing.original_price_egp || '');
        setCostPriceEgp(existing.cost_price_egp || '');
        setStockQuantity(existing.stock_quantity);
        setLowStockThreshold(existing.low_stock_threshold);
        setImageUrl(existing.images?.[0]?.image_url || '');
        const secUrls = existing.images?.slice(1).map(img => img.image_url) || [];
        setSecondaryImages(secUrls);
        setSecondaryImageMetas(new Array(secUrls.length).fill(null));
        setShortDescAr(existing.short_description_ar || '');
        setDescAr(existing.description_ar);
        setIsActive(existing.is_active);
        setIsFeatured(existing.is_featured);
        setAttributes(existing.attributes || []);
        setVariants(existing.variants || []);
      }
    } else {
      // Default category if new
      if (categories[0]) {
        setCategoryId(categories[0].children?.[0]?.id || categories[0].id);
      }
    }
  }, [id, categories]);

  // Auto-generate slug from name if empty
  const handleNameChange = (val: string) => {
    setNameAr(val);
    if (!isEditMode && !slug) {
      const generatedSlug = val.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0621-\u064A-]/g, '');
      setSlug(generatedSlug || `prod-${Date.now()}`);
    }
  };

  // Add Spec Attribute
  const handleAddAttribute = () => {
    setAttributes(prev => [
      ...prev,
      {
        id: `attr-${Date.now()}`,
        product_id: id || '',
        attribute_key: `key_${prev.length + 1}`,
        name_ar: '',
        value_ar: '',
        sort_order: prev.length + 1
      }
    ]);
  };

  const handleUpdateAttribute = (index: number, field: 'name_ar' | 'value_ar', val: string) => {
    setAttributes(prev => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  // Add Variant
  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        product_id: id || '',
        sku: `${sku || 'SKU'}-VAR-${prev.length + 1}`,
        name_ar: '',
        option_type: 'color',
        option_value: '',
        stock_quantity: 5,
        is_active: true
      }
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Secondary Images Handlers
  const handleAddSecondaryImage = () => {
    setSecondaryImages(prev => [...prev, '']);
    setSecondaryImageMetas(prev => [...prev, null]);
  };

  const handleUpdateSecondaryImage = (index: number, val: string) => {
    setSecondaryImages(prev => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
    setSecondaryImageMetas(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleRemoveSecondaryImage = (index: number) => {
    setSecondaryImages(prev => prev.filter((_, i) => i !== index));
    setSecondaryImageMetas(prev => prev.filter((_, i) => i !== index));
  };

  const processImageFile = (file: File): Promise<{ dataUrl: string; meta: ImageMeta }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('الملف المختار ليس صورة صالحة (يرجى اختيار JPG, PNG, WEBP)'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('حجم الصورة كبير جداً (الحد الأقصى 15 ميجابايت)'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          // Client-side canvas downscaling to protect against localStorage QuotaExceededError
          const MAX_DIMENSION = 1200;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              dataUrl: rawDataUrl,
              meta: {
                width: img.naturalWidth,
                height: img.naturalHeight,
                sizeKb: Math.round(file.size / 1024),
                fileName: file.name
              }
            });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const optimizedDataUrl = canvas.toDataURL(mimeType, 0.85);
          const approximateSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl: optimizedDataUrl,
            meta: {
              width,
              height,
              sizeKb: approximateSizeKb,
              fileName: file.name
            }
          });
        };
        img.onerror = () => reject(new Error('فشل فك تشفير وتحديد أبعاد الصورة'));
        img.src = rawDataUrl;
      };
      reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة من جهازك'));
      reader.readAsDataURL(file);
    });
  };

  const handlePrimaryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploadError(null);
    try {
      const { dataUrl, meta } = await processImageFile(file);
      setImageUrl(dataUrl);
      setPrimaryImageMeta(meta);
    } catch (err: any) {
      setImageUploadError(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      e.target.value = '';
    }
  };

  const handleSecondaryFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploadError(null);
    try {
      const { dataUrl, meta } = await processImageFile(file);
      setSecondaryImages(prev => {
        const updated = [...prev];
        updated[index] = dataUrl;
        return updated;
      });
      setSecondaryImageMetas(prev => {
        const updated = [...prev];
        updated[index] = meta;
        return updated;
      });
    } catch (err: any) {
      setImageUploadError(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      e.target.value = '';
    }
  };

  const handleAddSecondaryImageViaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploadError(null);
    try {
      const { dataUrl, meta } = await processImageFile(file);
      setSecondaryImages(prev => [...prev, dataUrl]);
      setSecondaryImageMetas(prev => [...prev, meta]);
    } catch (err: any) {
      setImageUploadError(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr.trim() || !sku.trim() || priceEgp === '' || !categoryId) {
      alert('يرجى ملء جميع الحقول الإلزامية (اسم المنتج، كود SKU، السعر، والقسم).');
      return;
    }

    // Build complete images array preserving primary and secondary gallery items
    const finalImages: ProductImage[] = [];
    if (imageUrl.trim()) {
      finalImages.push({
        id: `img-${Date.now()}-primary`,
        product_id: id || '',
        image_url: normalizeImageUrl(imageUrl.trim(), PRODUCT_FALLBACK_IMAGE),
        is_primary: true,
        sort_order: 1
      });
    }

    secondaryImages.forEach((imgUrl, idx) => {
      if (imgUrl.trim()) {
        finalImages.push({
          id: `img-${Date.now()}-sec-${idx}`,
          product_id: id || '',
          image_url: normalizeImageUrl(imgUrl.trim(), PRODUCT_FALLBACK_IMAGE),
          is_primary: finalImages.length === 0,
          sort_order: finalImages.length + 1
        });
      }
    });

    if (finalImages.length === 0) {
      finalImages.push({
        id: `img-${Date.now()}`,
        product_id: id || '',
        image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
        is_primary: true,
        sort_order: 1
      });
    }

    const saved = dbStore.saveProduct({
      id: id || undefined,
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || undefined,
      sku: sku.trim(),
      barcode: barcode.trim() || undefined,
      slug: slug.trim() || `prod-${Date.now()}`,
      category_id: categoryId,
      brand_id: brandId || null,
      price_egp: Number(priceEgp),
      original_price_egp: originalPriceEgp !== '' ? Number(originalPriceEgp) : undefined,
      cost_price_egp: costPriceEgp !== '' ? Number(costPriceEgp) : undefined,
      stock_quantity: Number(stockQuantity || 0),
      low_stock_threshold: Number(lowStockThreshold || 5),
      images: finalImages,
      short_description_ar: shortDescAr.trim() || undefined,
      description_ar: descAr.trim() || nameAr.trim(),
      attributes: attributes.filter(a => a.name_ar && a.value_ar),
      variants: variants.filter(v => v.name_ar),
      is_active: isActive,
      is_featured: isFeatured,
      allow_backorder: false,
    });

    navigate('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-mall-900">
            {isEditMode ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للكتالوج'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            املأ تفاصيل المنتج، الأسعار، المخزون، والمواصفات بدقة
          </p>
        </div>

        <Link
          to="/admin/products"
          className="text-xs text-gray-600 hover:text-mall-900 font-bold flex items-center gap-1"
        >
          <span>العودة لقائمة المنتجات</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-mall-900 pb-3 border-b border-gray-100">
            1. المعلومات الأساسية
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                اسم المنتج بالعربية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: شاحن أنكر 65W سريع ثلاثي المنافذ"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                اسم المنتج بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Anker 65W GaN Fast Charger"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                الرابط الدائم (Slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                كود SKU الفريد <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="مثال: ELC-ANK-65W"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                الباركود الدولي (Barcode)
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="مثال: 6221234567890"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                القسم / الفئة <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-gold-500"
              >
                {categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <option value={cat.id} className="font-bold">{cat.name_ar}</option>
                    {cat.children?.map(sub => (
                      <option key={sub.id} value={sub.id}>&nbsp;&nbsp;— {sub.name_ar}</option>
                    ))}
                  </React.Fragment>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                الماركة التجارية (Brand)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-gold-500"
              >
                <option value="">بدون ماركة محددة / مول المصطفى</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name_ar}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Pricing and Inventory */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-mall-900 pb-3 border-b border-gray-100">
            2. الأسعار وإدارة المخزون
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                سعر البيع الحالي (ج.م) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={priceEgp}
                onChange={(e) => setPriceEgp(e.target.value ? Number(e.target.value) : '')}
                placeholder="0.00"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl font-black text-mall-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                السعر الأصلي قبل الخصم (ج.م)
              </label>
              <input
                type="number"
                step="0.5"
                value={originalPriceEgp}
                onChange={(e) => setOriginalPriceEgp(e.target.value ? Number(e.target.value) : '')}
                placeholder="اتركه فارغاً إذا لم يكن عليه خصم"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                سعر التكلفة (سري للإدارة)
              </label>
              <input
                type="number"
                step="0.5"
                value={costPriceEgp}
                onChange={(e) => setCostPriceEgp(e.target.value ? Number(e.target.value) : '')}
                placeholder="لحساب أرباح المتجر"
                className="w-full text-xs p-3 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                الكمية المتوفرة بالمخزون <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                حد تنبيه نقص المخزون
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* 3. Media & Description */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-mall-900 pb-3 border-b border-gray-100 flex items-center gap-2">
            <Image className="w-4 h-4 text-gold-500" />
            <span>3. صورة المنتج والوصف</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  صورة المنتج الرئيسية (Primary Product Image)
                </label>
                <span className="text-[11px] text-gray-500">
                  يمكنك إدخال رابط ويب أو رفع صورة مباشرة من جهازك
                </span>
              </div>

              {imageUploadError && (
                <div className="mb-2 p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{imageUploadError}</span>
                </div>
              )}

              {/* Upload Drop Zone & URL Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* File Upload Area */}
                <div className="relative border-2 border-dashed border-gray-300 hover:border-gold-500 bg-gray-50/50 hover:bg-gold-50/20 rounded-2xl p-4 text-center transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="اختر صورة من جهازك"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-gold-100 text-mall-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-gold-600" />
                    </div>
                    <span className="text-xs font-black text-gray-800">رفع صورة من جهازك</span>
                    <span className="text-[10px] text-gray-500">JPG, PNG, WebP (فحص تلقائي للأبعاد)</span>
                  </div>
                </div>

                {/* Direct URL Input */}
                <div className="flex flex-col justify-center space-y-1.5 bg-white p-3 border border-gray-200 rounded-2xl">
                  <span className="text-xs font-bold text-gray-600">أو إدخال رابط صورة خارجي (URL):</span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPrimaryImageMeta(null);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl text-left font-mono focus:outline-none focus:border-gold-500"
                  />
                  {imageUrl.startsWith('data:image') && (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>صورة محملة محلياً (Base64 Data URL جاهزة للحفظ)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Image Preview & Metadata Check */}
              {imageUrl && (
                <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border border-gray-300 overflow-hidden bg-white p-1 shrink-0 shadow-xs">
                      <img 
                        src={imageUrl} 
                        alt="معاينة الصورة الرئيسية" 
                        onError={handleImageError} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-900 block">معاينة الصورة الرئيسية المعتمدة</span>
                      {primaryImageMeta ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] bg-gold-100 text-gold-900 font-bold px-2 py-0.5 rounded-full font-mono">
                            {primaryImageMeta.width} × {primaryImageMeta.height} px
                          </span>
                          <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full font-mono">
                            {primaryImageMeta.sizeKb} KB
                          </span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[180px]">
                            {primaryImageMeta.fileName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 mt-1 block">رابط صورة ويب نشط</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setPrimaryImageMeta(null);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>إزالة</span>
                  </button>
                </div>
              )}
            </div>

            {/* Secondary Gallery Images */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    صور إضافية لمعرض المنتج (Gallery Images)
                  </label>
                  <p className="text-[11px] text-gray-500">
                    تظهر في شريط المعاينة وزوم التكبير ومودال Lightbox في صفحة المنتج.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="py-1 px-2.5 bg-mall-900 hover:bg-mall-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddSecondaryImageViaFile}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSecondaryImage}
                    className="py-1 px-2.5 bg-gold-50 hover:bg-gold-100 text-gold-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-gold-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة رابط URL</span>
                  </button>
                </div>
              </div>

              {secondaryImages.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {secondaryImages.map((secImg, idx) => {
                    const meta = secondaryImageMetas[idx];
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 p-0.5">
                            {secImg ? (
                              <img src={secImg} alt="" onError={handleImageError} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Image className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={secImg}
                              onChange={(e) => handleUpdateSecondaryImage(idx, e.target.value)}
                              placeholder={`رابط أو كود الصورة الإضافية ${idx + 1}...`}
                              className="w-full text-xs p-2 border border-gray-200 rounded-lg text-left bg-white focus:outline-none focus:border-gold-500 font-mono"
                            />
                            {meta && (
                              <div className="flex gap-1.5 mt-1">
                                <span className="text-[9px] bg-gold-100 text-gold-900 font-bold px-1.5 py-0.5 rounded font-mono">
                                  {meta.width} × {meta.height} px
                                </span>
                                <span className="text-[9px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded font-mono">
                                  {meta.sizeKb} KB
                                </span>
                                <span className="text-[9px] text-gray-500 truncate max-w-[140px]">
                                  {meta.fileName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <label className="p-2 text-gray-600 hover:text-mall-900 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer" title="استبدال بملف من الجهاز">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSecondaryFileUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveSecondaryImage(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-1">
                  لا توجد صور إضافية. يمكنك رفع صور أو إضافة روابط لمعرض المنتج.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                الوصف المختصر (يظهر أعلى الصفحة)
              </label>
              <input
                type="text"
                value={shortDescAr}
                onChange={(e) => setShortDescAr(e.target.value)}
                placeholder="سطر تلخيصي لأهم مميزات المنتج..."
                className="w-full text-xs p-3 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                الوصف التفصيلي الكامل
              </label>
              <textarea
                rows={4}
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                placeholder="اكتب وصفاً مفصلاً للمنتج ومميزاته ومحتويات العلبة..."
                className="w-full text-xs p-3 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* 4. Specifications Table Attributes */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-mall-900">
              4. المواصفات الفنية التفصيلية (جدول المواصفات)
            </h2>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة خاصية</span>
            </button>
          </div>

          <div className="space-y-3">
            {attributes.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">لا توجد مواصفات فنية إضافية مدخلة بعد.</p>
            ) : (
              attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={attr.name_ar}
                    onChange={(e) => handleUpdateAttribute(idx, 'name_ar', e.target.value)}
                    placeholder="اسم الخاصية (مثال: الخامة، المقاس، القدرة)"
                    className="w-1/3 text-xs p-2.5 border border-gray-200 rounded-xl"
                  />
                  <input
                    type="text"
                    value={attr.value_ar}
                    onChange={(e) => handleUpdateAttribute(idx, 'value_ar', e.target.value)}
                    placeholder="القيمة (مثال: ستانلس ستيل، 65 واط)"
                    className="flex-1 text-xs p-2.5 border border-gray-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="text-gray-400 hover:text-red-500 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Product Variants */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-mall-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>5. خيارات المنتج المتعددة (Variants - الألوان أو المقاسات)</span>
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة خيار</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">هذا المنتج ذو خيار قياسي موحد بدون تفرعات.</p>
            ) : (
              variants.map((v, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <input
                    type="text"
                    value={v.name_ar}
                    onChange={(e) => handleUpdateVariant(idx, 'name_ar', e.target.value)}
                    placeholder="اسم الخيار (مثال: اللون الأسود)"
                    className="w-40 text-xs p-2 border border-gray-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                    placeholder="كود SKU للخيار"
                    className="w-36 text-xs p-2 border border-gray-200 rounded-lg bg-white font-mono"
                  />
                  <input
                    type="number"
                    value={v.stock_quantity}
                    onChange={(e) => handleUpdateVariant(idx, 'stock_quantity', Number(e.target.value))}
                    placeholder="المخزون"
                    className="w-24 text-xs p-2 border border-gray-200 rounded-lg bg-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="text-gray-400 hover:text-red-500 p-2 me-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. Visibility Toggles & Save Button */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-mall-900 rounded"
              />
              <span>تفعيل ونشر المنتج بالمتجر</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-gold-500 rounded"
              />
              <span>تمييز في الصفحة الرئيسية</span>
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/admin/products"
              className="py-3 px-5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 text-center flex-1 sm:flex-none"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="py-3 px-8 bg-gold-500 hover:bg-gold-600 text-mall-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4" />
              <span>حفظ ونشر التعديلات</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
