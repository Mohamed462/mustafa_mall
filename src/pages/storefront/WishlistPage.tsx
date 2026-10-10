import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { dbStore } from '../../services/dbStore';
import { ProductCard } from '../../components/common/ProductCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlistIds } = useWishlist();
  const allProducts = dbStore.getProducts();
  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      <Breadcrumbs items={[{ label: 'قائمة الرغبات والمفضلة' }]} />

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-mall-900">
              قائمتي المفضلة
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              لديك {wishlistProducts.length} منتجات محفوظة في المفضلة
            </p>
          </div>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-4">
          <Heart className="w-16 h-16 mx-auto stroke-1 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-800">قائمة المفضلة فارغة</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            احفظ المنتجات التي تهمك للرجوع إليها في أي وقت وتتبع تخفيضاتها وإضافتها للسلة بسهولة.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-mall-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-mall-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ابدأ التسوق الآن</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
