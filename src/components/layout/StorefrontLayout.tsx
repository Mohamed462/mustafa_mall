import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { dbStore } from '../../services/dbStore';
import { NavItem } from '../../types';
import { Home, Grid, Printer, Heart, ShoppingCart } from 'lucide-react';

export const StorefrontLayout: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [navItems, setNavItems] = useState<NavItem[]>(() => dbStore.getNavItems());

  useEffect(() => {
    const handleNavUpdate = () => {
      setNavItems(dbStore.getNavItems());
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

  const mobileBarLinks = navItems.filter(item => item.location === 'mobile_bar' && item.is_active);

  const isCurrent = (path: string) => location.pathname === path;

  const getMobileIcon = (url: string, label: string) => {
    if (url === '/' || label.includes('الرئيسية')) return <Home className="w-5 h-5 mb-0.5" />;
    if (url.includes('print') || label.includes('طباعة')) {
      return (
        <div className="bg-[rgba(8,96,107,0.08)] p-1 rounded-full -mt-2 shadow-xs border border-[rgba(8,96,107,0.22)]">
          <Printer className="w-5 h-5 text-[#08606B]" />
        </div>
      );
    }
    if (url.includes('cart') || label.includes('السلة')) {
      return (
        <div className="relative">
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -end-2 bg-[#00D2D3] text-white font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
      );
    }
    if (url.includes('wishlist') || label.includes('المفضلة')) {
      return (
        <div className="relative">
          <Heart className="w-5 h-5 mb-0.5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -end-2 bg-red-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </div>
      );
    }
    return <Grid className="w-5 h-5 mb-0.5" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafb] text-[#04383f] pb-16 lg:pb-0">
      <Header />
      <main className="flex-1">
        <React.Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3 text-center">
            <div className="w-10 h-10 border-4 border-[#08606B] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#687280] font-bold">جاري تحميل الصفحة...</span>
          </div>
        }>
          <Outlet />
        </React.Suspense>
      </main>
      <Footer />

      {/* Mobile Sticky Bottom Navigation Bar (Editorial Retail Experience) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[rgba(17,21,26,0.11)] z-30 shadow-lg px-2 py-1.5" aria-label="شريط التنقل السفلي">
        <div className="flex items-center justify-around text-center text-[10px]">
          {mobileBarLinks.length > 0 ? (
            mobileBarLinks.map((item) => (
              <Link 
                key={item.id}
                to={item.url} 
                className={`flex flex-col items-center py-1 transition-colors flex-1 ${isCurrent(item.url) ? 'text-[#08606B] font-bold' : 'text-[#687280]'}`}
              >
                {getMobileIcon(item.url, item.label)}
                <span>{item.label}</span>
              </Link>
            ))
          ) : (
            <>
              {/* Home */}
              <Link 
                to="/" 
                className={`flex flex-col items-center py-1 transition-colors flex-1 ${isCurrent('/') ? 'text-[#08606B] font-bold' : 'text-[#687280]'}`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span>الرئيسية</span>
              </Link>

              {/* All Categories */}
              <Link 
                to="/shop" 
                className={`flex flex-col items-center py-1 transition-colors flex-1 ${isCurrent('/shop') ? 'text-[#08606B] font-bold' : 'text-[#687280]'}`}
              >
                <Grid className="w-5 h-5 mb-0.5" />
                <span>الأقسام</span>
              </Link>

              {/* Dedicated Print Center with visual highlight */}
              <Link 
                to="/print-center" 
                className={`flex flex-col items-center py-1 transition-colors flex-1 ${isCurrent('/print-center') ? 'text-[#08606B] font-extrabold' : 'text-[#08606B]/80 font-bold'}`}
              >
                <div className="bg-[rgba(8,96,107,0.08)] p-1 rounded-full -mt-2 shadow-xs border border-[rgba(8,96,107,0.22)]">
                  <Printer className="w-5 h-5 text-[#08606B]" />
                </div>
                <span>الطباعة</span>
              </Link>

              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className={`flex flex-col items-center py-1 transition-colors flex-1 relative ${isCurrent('/wishlist') ? 'text-[#08606B] font-bold' : 'text-[#687280]'}`}
              >
                <div className="relative">
                  <Heart className="w-5 h-5 mb-0.5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -end-2 bg-red-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span>المفضلة</span>
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className={`flex flex-col items-center py-1 transition-colors flex-1 relative ${isCurrent('/cart') ? 'text-[#08606B] font-bold' : 'text-[#687280]'}`}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 mb-0.5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -end-2 bg-[#00D2D3] text-white font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span>السلة</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};
