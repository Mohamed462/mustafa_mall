import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart, getProductMaxOrderLimit } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrencyEGP, calculateDiscountPercent } from '../../utils/formatters';
import { handleImageError, PRODUCT_FALLBACK_IMAGE } from '../../utils/imageUtils';
import { Heart, Plus, Check, ShoppingBag } from 'lucide-react';
import { TextureButton } from './TextureButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = calculateDiscountPercent(product.original_price_egp, product.price_egp);
  const maxLimit = getProductMaxOrderLimit(product);
  const isOutOfStock = product.stock_quantity <= 0 || maxLimit <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= (product.low_stock_threshold || 5);
  const inWishlist = isInWishlist(product.id);
  const hasVariants = product.variants && product.variants.length > 0;
  
  const primaryImage = product.images[0]?.image_url || PRODUCT_FALLBACK_IMAGE;
  const secondaryImage = product.images[1]?.image_url || primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (hasVariants) {
      setIsQuickViewOpen(true);
      return;
    }

    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <>
      <div 
        className="group relative bg-white rounded-2xl border border-[rgba(17,21,26,0.11)] hover:border-[#08606B]/60 shadow-editorial hover:shadow-editorial-hover transition-all duration-300 flex flex-col justify-between overflow-hidden text-right p-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Badges & Product Image Box with Warm Ivory Framing */}
        <div className="relative aspect-square w-full bg-[#f8fafb] rounded-xl overflow-hidden flex items-center justify-center p-3 mb-2.5">
          
          {/* Cyber Cyan Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 start-2 z-10 bg-[#00D2D3] text-[#04383f] font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              خصم {discountPercent}%
            </div>
          )}

          {/* Low Stock Badge */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute bottom-2 start-2 z-10 bg-amber-500/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
              متبقي {product.stock_quantity} بس!
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#04383f]/75 z-20 flex items-center justify-center">
              <span className="bg-[#04383f] text-white text-[11px] font-bold px-2.5 py-1 rounded border border-[#003746]">
                نفد من المخزن مؤقتاً
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`absolute top-2 end-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inWishlist
                ? 'bg-red-50 text-red-600 shadow-xs'
                : 'bg-white/90 text-[#687280] hover:text-red-500 hover:bg-white shadow-xs'
            }`}
            aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`} />
          </button>

          {/* Dual Image Swap with smooth 400ms transition */}
          <Link to={`/product/${product.slug}`} className="w-full h-full relative flex items-center justify-center overflow-hidden">
            <img
              src={primaryImage}
              alt={product.name_ar}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className={`max-h-full max-w-full object-contain transition-all duration-400 ease-out ${
                isHovered && secondaryImage !== primaryImage
                  ? 'opacity-0 scale-95'
                  : 'opacity-100 scale-100 group-hover:scale-103'
              }`}
            />
            {secondaryImage !== primaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name_ar} - منظور إضافي`}
                loading="lazy"
                decoding="async"
                onError={handleImageError}
                className={`absolute inset-0 max-h-full max-w-full m-auto object-contain transition-all duration-400 ease-out ${
                  isHovered
                    ? 'opacity-100 scale-103'
                    : 'opacity-0 scale-95'
                }`}
              />
            )}
          </Link>

          {/* Quick Add Button - Accessible on mobile touch without requiring hover, animated slide-up on desktop */}
          <div className="absolute bottom-2 inset-x-2 z-10 transition-all duration-300 transform opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-3 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full min-h-[38px] py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 bg-gray-200 text-gray-400 cursor-not-allowed"
              >
                نفدت الكمية
              </button>
            ) : (
              <TextureButton
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                className="w-full min-h-[38px] font-bold text-xs shadow-md justify-center"
                title="أضف إلى عربة التسوق"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-[#00D2D3]" />
                    <span>تمت الإضافة للسلة</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>أضف للسلة</span>
                  </>
                )}
              </TextureButton>
            )}
          </div>

        </div>

        {/* Product Details Section */}
        <div className="flex flex-col flex-1 justify-between gap-1 text-right">
          {/* Price Row */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-[#04383f]">
                {formatCurrencyEGP(product.price_egp)}
              </span>
              {product.original_price_egp && product.original_price_egp > product.price_egp && (
                <span className="text-xs text-[#687280] line-through">
                  {formatCurrencyEGP(product.original_price_egp)}
                </span>
              )}
            </div>

            {/* Special Promo Tag in petrol teal */}
            {discountPercent > 0 && (
              <p className="text-[10px] text-[#08606B] font-bold mt-0.5 flex items-center gap-1">
                <span>خصم خاص عند إتمام الطلب</span>
              </p>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-[rgba(17,21,26,0.11)]">
            {/* Category tag */}
            <span className="text-[11px] font-bold text-[#687280] block mb-0.5">
              {product.category?.name_ar || 'مول المصطفى'}
            </span>

            {/* Title */}
            <Link to={`/product/${product.slug}`} className="block">
              <h3 className="text-xs sm:text-[13px] font-medium text-[#04383f] line-clamp-2 hover:text-[#08606B] transition-colors leading-snug">
                {product.name_ar}
              </h3>
            </Link>

            {/* Variants Swatches */}
            {hasVariants && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {product.variants?.slice(0, 3).map((v) => (
                  <span key={v.id} className="text-[10px] bg-[#f8fafb] text-[#04383f] px-2 py-0.5 rounded-md border border-[rgba(17,21,26,0.11)]">
                    {v.name_ar}
                  </span>
                ))}
                {(product.variants?.length || 0) > 3 && (
                  <span className="text-[10px] text-[#687280]">+{product.variants!.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsQuickViewOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 text-right animate-scale-up max-h-[90vh] overflow-y-auto border border-[rgba(17,21,26,0.11)]">
            <div className="flex items-start justify-between pb-3 border-b border-[rgba(17,21,26,0.11)] mb-4">
              <h3 className="text-base font-bold text-[#04383f]">{product.name_ar}</h3>
              <button onClick={() => setIsQuickViewOpen(false)} className="text-[#687280] hover:text-[#04383f] cursor-pointer">
                ✕
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <img 
                src={primaryImage} 
                alt={product.name_ar} 
                onError={handleImageError}
                className="w-32 h-32 object-contain rounded-xl border border-[rgba(17,21,26,0.11)] bg-[#f8fafb] p-2" 
              />
              <div>
                <p className="text-base font-black text-[#04383f] mb-1">{formatCurrencyEGP(product.price_egp)}</p>
                {product.original_price_egp && (
                  <p className="text-xs text-[#687280] line-through mb-2">{formatCurrencyEGP(product.original_price_egp)}</p>
                )}
                <p className="text-xs text-[#687280] line-clamp-3">{product.description_ar}</p>
              </div>
            </div>

            {hasVariants && (
              <div className="mb-4">
                <span className="text-xs font-bold text-[#04383f] block mb-2">الخيارات المتاحة:</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants?.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        addToCart(product, 1, v);
                        setIsQuickViewOpen(false);
                      }}
                      className="text-xs border border-[rgba(17,21,26,0.11)] hover:border-[#08606B] px-3 py-1.5 rounded-xl bg-[#f8fafb] hover:bg-white text-[#04383f] font-bold cursor-pointer transition-colors"
                    >
                      {v.name_ar} ({formatCurrencyEGP(v.price_override_egp ?? product.price_egp)}) +
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[rgba(17,21,26,0.11)]">
              <Link
                to={`/product/${product.slug}`}
                onClick={() => setIsQuickViewOpen(false)}
                className="flex-1 text-center py-2.5 bg-[#08606B] hover:bg-[#03292e] text-white text-xs font-bold rounded-lg transition-colors"
              >
                عرض الصفحة الكاملة للمنتج
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
