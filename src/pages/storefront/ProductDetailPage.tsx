import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../services/dbStore';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ProductCard } from '../../components/common/ProductCard';
import { ProductVariant } from '../../types';
import { 
  formatCurrencyEGP, 
  calculateDiscountPercent, 
  getWhatsAppUrl 
} from '../../utils/formatters';
import { 
  ShoppingCart, 
  Heart, 
  Check, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MessageCircle, 
  AlertCircle,
  ZoomIn,
  ZoomOut,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useStoreSettings();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const product = useMemo(() => {
    return slug ? dbStore.getProductBySlug(slug) : undefined;
  }, [slug, version]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Set default variant if available
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setSelectedImageIndex(0);
    setQuantity(1);
    setAddedSuccess(false);
    setIsLightboxOpen(false);
    setLightboxZoom(false);
  }, [product]);

  // Lock body scroll when lightbox modal is open to avoid background touch scrolling
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || !product) return;

    const imagesCount = product.images.length > 0 ? product.images.length : 1;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setLightboxZoom(false);
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => (prev - 1 + imagesCount) % imagesCount);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => (prev + 1) % imagesCount);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, product]);

  // Related products from same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return dbStore.getProducts()
      .filter(p => p.is_active && p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-arabic">
        <h2 className="text-xl font-bold text-slate-800">المنتج غير موجود</h2>
        <p className="text-xs text-slate-500 mt-2">عذراً، لم يتم العثور على بيانات المنتج المطلوب.</p>
        <Link to="/shop" className="inline-block mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
          العودة للتسوق
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price_override_egp ?? product.price_egp;
  const originalPrice = product.original_price_egp;
  const discountPercent = calculateDiscountPercent(originalPrice, currentPrice);
  const activeStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const maxOrderLimit = Math.max(0, Math.min(activeStock, product.max_order_quantity && product.max_order_quantity > 0 ? product.max_order_quantity : 10));
  const isOutOfStock = activeStock <= 0 || maxOrderLimit <= 0;
  const isLowStock = !isOutOfStock && activeStock <= product.low_stock_threshold;
  const inWishlist = isInWishlist(product.id);

  const images = product.images.length > 0 ? product.images : [
    { id: 'def', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 1 }
  ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, Math.min(quantity, maxOrderLimit), selectedVariant);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const whatsappMessage = `مرحباً مول المصطفى، أود الاستفسار عن منتج: ${product.name_ar} (كود SKU: ${product.sku})`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 text-right pb-28 lg:pb-10 font-arabic">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'الأقسام', path: '/shop' },
        { label: product.name_ar }
      ]} />

      {/* Main Contained Product Card (B.TECH Compact Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Gallery Column (Compact, Not Stretched) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Image with Smooth B.TECH Mouse-Tracking Zoom */}
            <div
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
              className="group/img relative aspect-square rounded-2xl bg-slate-50/60 border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden cursor-crosshair shadow-2xs select-none"
              role="button"
              tabIndex={0}
              aria-label="تكبير صورة المنتج وتحريكها مع الماوس"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsLightboxOpen(true); } }}
            >
              {discountPercent > 0 && (
                <div className="absolute top-4 start-4 z-20 bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
                  خصم {discountPercent}%
                </div>
              )}

              {/* Dynamic Zoom Lens Badge */}
              <div className="absolute top-4 end-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm pointer-events-none transition-all">
                <ZoomIn className="w-3.5 h-3.5 text-gold-400" />
                <span>{isHovering ? 'حرّك للتفاصيل' : 'مرّر الماوس للتكبير'}</span>
              </div>

              {/* Product Image that pans and scales with mouse */}
              <img
                src={images[selectedImageIndex]?.image_url || images[0].image_url}
                alt={product.name_ar}
                loading="eager"
                decoding="async"
                onError={handleImageError}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isHovering ? 'scale(2.2)' : 'scale(1)',
                  transition: isHovering ? 'transform-origin 0.05s ease-out, transform 0.2s ease-out' : 'transform 0.3s ease-out'
                }}
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Thumbnails Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx 
                        ? 'border-gold-500 scale-105 ring-2 ring-gold-400/40 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category and SKU */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2.5 border-b border-slate-100">
                <span className="font-bold text-gold-600">
                  {product.category?.name_ar || 'مول المصطفى'}
                </span>
                <span>كود المنتج: <strong className="font-mono text-slate-800 font-bold">{product.sku}</strong></span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 leading-snug">
                {product.name_ar}
              </h1>

              {product.short_description_ar && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {product.short_description_ar}
                </p>
              )}

              {/* Price & Stock Container */}
              <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">السعر الحالي</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formatCurrencyEGP(currentPrice)}
                    </span>
                    {originalPrice && originalPrice > currentPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrencyEGP(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Indicator */}
                <div className="text-left">
                  {isOutOfStock ? (
                    <span className="inline-block bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      نفد من المخزن مؤقتاً
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>متبقي {activeStock} قطع بس!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>متوفر في المخزن (أقصى طلب: {maxOrderLimit} قطع)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    الخيارات المتاحة:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-gold-400 border-slate-900 shadow-sm'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {variant.name_ar}
                          {variant.price_override_egp && (
                            <span className="ms-1.5 opacity-80">
                              ({formatCurrencyEGP(variant.price_override_egp)})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Actions */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="تقليل الكمية"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-black text-sm text-slate-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= maxOrderLimit}
                    onClick={() => setQuantity(Math.min(maxOrderLimit, quantity + 1))}
                    className="p-3 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="زيادة الكمية"
                    title={quantity >= maxOrderLimit ? `الحد الأقصى للطلب ${maxOrderLimit} قطع` : 'زيادة الكمية'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 w-full py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gold-500 hover:bg-gold-600 text-slate-950 active:scale-98'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة إلى السلة بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>إضافة إلى سلة المشتريات</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                    inWishlist 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
                  aria-label="المفضلة"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
                </button>
              </div>

              {/* WhatsApp Direct Inquiry Button */}
              <div className="mt-3">
                <a
                  href={getWhatsAppUrl(settings.whatsapp_number, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>استفسر عن المنتج مباشرة عبر واتساب</span>
                </a>
              </div>
            </div>

            {/* Trust Policies Checklist */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Truck className="w-5 h-5 text-slate-900" />
                <span className="font-bold text-[11px]">شحن سريع لجميع المحافظات</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-[11px]">ضمان وأصالة 100%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <RotateCcw className="w-5 h-5 text-gold-600" />
                <span className="font-bold text-[11px]">استبدال خلال 14 يوماً</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
            تفاصيل ووصف المنتج
          </h2>
          <div className="text-xs sm:text-sm text-slate-700 mt-4 leading-relaxed whitespace-pre-line">
            {product.description_ar}
          </div>
        </div>

        {/* Specifications Table */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              المواصفات الفنية
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-right divide-y divide-slate-200">
                <tbody className="divide-y divide-slate-100 bg-white">
                  {product.attributes.map((attr, idx) => (
                    <tr key={attr.id} className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="py-3 px-4 font-bold text-slate-900 w-1/3">
                        {attr.name_ar}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {attr.value_ar}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Shelf */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-black text-slate-900">
            منتجات ذات صلة من نفس القسم
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Purchase Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={images[selectedImageIndex]?.image_url || images[0]?.image_url}
            alt=""
            className="w-11 h-11 object-contain rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0"
            onError={handleImageError}
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {product.name_ar}
            </h4>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-black text-slate-900">
                {formatCurrencyEGP(currentPrice)}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-[10px] text-slate-400 line-through">
                  {formatCurrencyEGP(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden text-xs">
            <button
              type="button"
              disabled={quantity <= 1 || isOutOfStock}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              aria-label="تقليل الكمية"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-black text-slate-900 font-mono text-xs">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= activeStock || isOutOfStock}
              onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
              className="px-2 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              aria-label="زيادة الكمية"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              inWishlist 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
            aria-label="المفضلة"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-600' : ''}`} />
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`py-2.5 px-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gold-500 hover:bg-gold-600 text-slate-950 active:scale-98'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>أضف</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`معاينة صور ${product.name_ar}`}
        >
          {/* Top Lightbox Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md">
                {product.name_ar}
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                صورة {selectedImageIndex + 1} من {images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom(!lightboxZoom)}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-200 transition-colors cursor-pointer"
                aria-label={lightboxZoom ? 'تصغير الصورة' : 'تكبير الصورة'}
                title={lightboxZoom ? 'تصغير' : 'تكبير'}
              >
                {lightboxZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => { setIsLightboxOpen(false); setLightboxZoom(false); }}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-red-900/60 text-gray-200 hover:text-white transition-colors cursor-pointer"
                aria-label="إغلاق المعاينة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewer with RTL Navigation Arrows and Touch Swipe */}
          <div 
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden select-none"
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX - touchEndX;
              if (Math.abs(diff) > 40) {
                if (diff > 0) {
                  // Swiped Left in RTL -> Next image
                  setSelectedImageIndex(prev => (prev + 1) % images.length);
                } else {
                  // Swiped Right in RTL -> Previous image
                  setSelectedImageIndex(prev => (prev - 1 + images.length) % images.length);
                }
              }
              setTouchStartX(null);
            }}
          >
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(prev => (prev - 1 + images.length) % images.length)}
                  className="absolute start-2 sm:start-6 z-20 w-11 h-11 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="الصورة السابقة"
                  title="الصورة السابقة"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(prev => (prev + 1) % images.length)}
                  className="absolute end-2 sm:end-6 z-20 w-11 h-11 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="الصورة التالية"
                  title="الصورة التالية"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Display Image with Smooth Zoom */}
            <div
              className={`transition-all duration-300 max-h-[70vh] max-w-[90vw] flex items-center justify-center cursor-pointer ${
                lightboxZoom ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
              onClick={() => setLightboxZoom(!lightboxZoom)}
            >
              <img
                src={images[selectedImageIndex]?.image_url || images[0].image_url}
                alt={product.name_ar}
                decoding="async"
                onError={handleImageError}
                className="max-h-[70vh] max-w-[90vw] object-contain drop-shadow-2xl rounded-xl"
              />
            </div>
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 overflow-x-auto no-scrollbar pt-2 pb-1 border-t border-neutral-800 max-w-2xl mx-auto w-full">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => { setSelectedImageIndex(idx); setLightboxZoom(false); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 p-1 bg-neutral-900 shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-gold-500 scale-105 ring-2 ring-gold-400/50'
                      : 'border-neutral-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    onError={handleImageError}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
