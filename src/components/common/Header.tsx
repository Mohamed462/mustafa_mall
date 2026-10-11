import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { AnnouncementBar } from './AnnouncementBar';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { CartDrawer } from '../cart/CartDrawer';
import { dbStore } from '../../services/dbStore';
import { arabicFuzzyMatch } from '../../utils/searchNormalization';
import { formatCurrencyEGP } from '../../utils/formatters';
import { handleImageError } from '../../utils/imageUtils';
import { Product, NavItem } from '../../types';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  MapPin, 
  ChevronDown, 
  Printer, 
  Percent, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings, categories } = useStoreSettings();
  const { isAuthenticated, currentUser, isAdmin, openAuthModal } = useAuth();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState('القاهرة والجيزة');

  // Dynamic Navigation Items
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

  const headerNavLinks = navItems.filter(item => item.location === 'header' && item.is_active);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Search debounce and auto-suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const allProducts = dbStore.getProducts().filter(p => p.is_active);
    const matches = allProducts.filter(p => 
      arabicFuzzyMatch(p.name_ar, searchQuery) ||
      (p.name_en && p.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    setSuggestions(matches);
    setIsSearching(true);
  }, [searchQuery]);

  // Click outside to dismiss search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideDesktop = searchContainerRef.current?.contains(target);
      const isInsideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (product: Product) => {
    setIsSearching(false);
    setSearchQuery('');
    navigate(`/product/${product.slug}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#04383f] shadow-editorial border-b border-[rgba(17,21,26,0.11)]">
      {/* Top Promotional Bar */}
      <AnnouncementBar />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Right Section: Mobile Menu Trigger + Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#04383f] hover:text-[#08606B] rounded-lg hover:bg-[#f3f4f6] transition-colors"
              aria-label="فتح القائمة الرئيسية"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Official Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <img 
                src="/brand-logo-transparent.webp" 
                alt="مول المصطفى - Al Mostafa Mall" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
              />
              <div className="flex flex-col text-right">
                <span className="font-sans font-black text-base sm:text-lg text-[#04383f] tracking-tight leading-none group-hover:text-[#08606B] transition-colors">
                  مول المصطفى
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#08606B] font-bold tracking-wider">
                  AL MOSTAFA MALL
                </span>
              </div>
            </Link>

            {/* Delivery Location Trigger (Desktop) */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden xl:flex items-center gap-2 text-xs text-[#04383f] hover:text-[#08606B] bg-[#f3f4f6] px-3 py-1.5 rounded-lg border border-[rgba(17,21,26,0.11)] transition-colors me-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#08606B]" />
              <div className="text-right">
                <span className="block text-[10px] text-[#687280]">التوصيل إلى:</span>
                <span className="font-bold text-[#04383f]">{selectedGovernorate}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#687280]" />
            </button>
          </div>

          {/* Center Section: Prominent Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-2xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="flex items-center w-full bg-[#f3f4f6] focus-within:bg-white rounded-lg overflow-hidden border border-[rgba(17,21,26,0.11)] focus-within:border-[#08606B] shadow-xs transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setIsSearching(true)}
                  placeholder="بتدور على إيه؟ (ابحث في أكثر من 8 أقسام ومئات المنتجات...)"
                  className="w-full py-2.5 px-4 text-sm text-[#04383f] placeholder:text-[#687280] focus:outline-none bg-transparent"
                  dir="rtl"
                />
                <button
                  type="submit"
                  className="bg-[#08606B] hover:bg-[#03292e] text-white font-bold px-6 py-2.5 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="بحث"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {isSearching && (
              <div className="absolute top-full start-0 w-full mt-1.5 bg-white rounded-xl shadow-2xl border border-[rgba(17,21,26,0.11)] overflow-hidden z-50 text-right animate-fade-in">
                {suggestions.length > 0 ? (
                  <div className="p-2">
                    <div className="text-[11px] font-bold text-[#687280] px-3 py-1 border-b border-[rgba(17,21,26,0.11)]/60">
                      منتجات مقترحة
                    </div>
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(p)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-[#f3f4f6] rounded-lg transition-colors group text-right"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.images[0]?.image_url} 
                            alt={p.name_ar} 
                            onError={handleImageError}
                            className="w-10 h-10 object-cover rounded border border-[rgba(17,21,26,0.11)] shrink-0" 
                          />
                          <div>
                            <p className="text-xs font-bold text-[#04383f] group-hover:text-[#08606B] line-clamp-1">
                              {p.name_ar}
                            </p>
                            <span className="text-[10px] text-[#687280]">
                              كود: {p.sku}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#04383f]">
                          {formatCurrencyEGP(p.price_egp)}
                        </span>
                      </button>
                    ))}
                    <div className="p-2 border-t border-[rgba(17,21,26,0.11)]/60 bg-[#f3f4f6] text-center">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-[#08606B] hover:text-[#03292e]"
                      >
                        عرض جميع نتائج البحث عن "{searchQuery}" ←
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#687280] text-xs">
                    لم نعثر على نتائج مطابقة لـ "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Left Section: User Actions (Wishlist, Account, Cart, Admin) */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Admin Badge Shortcut if logged in as staff */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1.5 bg-[rgba(8,96,107,0.08)] text-[#08606B] hover:bg-[rgba(8,96,107,0.22)] border border-[rgba(8,96,107,0.22)] text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span>لوحة الإدارة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center gap-0.5 text-[#04383f] hover:text-[#08606B] px-2 py-1 rounded-lg hover:bg-[#f3f4f6] transition-colors relative"
              aria-label="المفضلة"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-[#04383f] hover:text-red-500 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -start-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] hidden sm:block font-medium">المفضلة</span>
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="flex flex-col items-center gap-0.5 text-[#04383f] hover:text-[#08606B] px-2 py-1 rounded-lg hover:bg-[#f3f4f6] transition-colors"
                aria-label="حسابي"
              >
                <User className="w-5 h-5 text-[#08606B]" />
                <span className="text-[11px] hidden sm:block max-w-[80px] truncate text-[#08606B] font-bold">
                  {currentUser?.name?.split(' ')[0] || 'حسابي'}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex flex-col items-center gap-0.5 text-[#04383f] hover:text-[#08606B] px-2 py-1 rounded-lg hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                aria-label="تسجيل الدخول"
              >
                <User className="w-5 h-5" />
                <span className="text-[11px] hidden sm:block font-bold">
                  دخول
                </span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex flex-col items-center gap-0.5 bg-[#08606B] hover:bg-[#03292e] text-white font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm relative cursor-pointer"
              aria-label="عربة التسوق"
            >
              <div className="relative flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="text-xs font-black">{itemCount}</span>
              </div>
              <span className="text-[10px] hidden sm:block leading-none mt-0.5 font-bold">السلة</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Below Main Bar on small screens) */}
        <div ref={mobileSearchContainerRef} className="lg:hidden mt-2 pt-2 border-t border-[rgba(17,21,26,0.11)] relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="flex items-center w-full bg-[#f3f4f6] rounded-lg overflow-hidden shadow-xs border border-[rgba(17,21,26,0.11)] focus-within:border-[#08606B] focus-within:bg-white transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setIsSearching(true)}
                placeholder="بتدور على إيه في مول المصطفى؟"
                className="w-full py-2 px-3 text-xs text-[#04383f] placeholder:text-[#687280] focus:outline-none bg-transparent"
                dir="rtl"
              />
              <button
                type="submit"
                className="bg-[#08606B] hover:bg-[#03292e] text-white p-2 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="بحث"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Mobile Search Suggestions Dropdown */}
          {isSearching && (
            <div className="absolute top-full start-0 w-full mt-1.5 bg-white rounded-xl shadow-2xl border border-[rgba(17,21,26,0.11)] overflow-hidden z-50 text-right animate-fade-in max-h-80 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="p-2">
                  <div className="text-[11px] font-bold text-[#687280] px-3 py-1 border-b border-[rgba(17,21,26,0.11)]/60">
                    منتجات مقترحة
                  </div>
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(p)}
                      className="w-full flex items-center justify-between p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors group text-right"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={p.images[0]?.image_url} 
                          alt={p.name_ar} 
                          onError={handleImageError}
                          className="w-9 h-9 object-cover rounded border border-[rgba(17,21,26,0.11)] shrink-0" 
                        />
                        <div className="min-w-0 text-right">
                          <p className="text-xs font-bold text-[#04383f] group-hover:text-[#08606B] truncate">
                            {p.name_ar}
                          </p>
                          <span className="text-[10px] text-[#687280] block">
                            كود: {p.sku}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#04383f] shrink-0 me-1">
                        {formatCurrencyEGP(p.price_egp)}
                      </span>
                    </button>
                  ))}
                  <div className="p-2 border-t border-[rgba(17,21,26,0.11)]/60 bg-[#f3f4f6] text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-[#08606B] hover:text-[#03292e]"
                    >
                      عرض جميع نتائج البحث عن "{searchQuery}" ←
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-[#687280] text-xs">
                  لم نعثر على نتائج مطابقة لـ "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Bar: Categories & Quick Links (Desktop) */}
      <nav className="hidden lg:block bg-[#f3f4f6] border-t border-[rgba(17,21,26,0.11)] text-sm relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mega Menu Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs transition-colors rounded-t-lg cursor-pointer ${
                  isMegaMenuOpen 
                    ? 'bg-[#08606B] text-white' 
                    : 'bg-white hover:bg-[#EDE9DE] text-[#04383f] border border-[rgba(17,21,26,0.11)]'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>كل الأقسام والفئات</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dynamic Navigation Links managed by Admin Navigation Manager */}
            <div className="flex items-center gap-5 px-3 text-[14px] font-semibold text-[#04383f]">
              {headerNavLinks.length > 0 ? (
                headerNavLinks.map((item) => (
                  <Link 
                    key={item.id} 
                    to={item.url} 
                    className="hover:text-[#08606B] transition-colors py-2.5 relative group"
                  >
                    <span>{item.label}</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#08606B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                ))
              ) : (
                <>
                  <Link to="/category/home-and-cleaning" className="hover:text-[#08606B] transition-colors py-2.5 relative group">
                    <span>المنزل والتنظيف</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#08606B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                  <Link to="/category/electronics-and-mobile" className="hover:text-[#08606B] transition-colors py-2.5 relative group">
                    <span>الإلكترونيات والموبايل</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#08606B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                  <Link to="/category/office-and-school" className="hover:text-[#08606B] transition-colors py-2.5 relative group">
                    <span>المكتبي والمدرسي</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#08606B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                  <Link to="/category/toys-and-gifts" className="hover:text-[#08606B] transition-colors py-2.5 relative group">
                    <span>الألعاب والهدايا</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#08606B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Department Accents */}
          <div className="flex items-center gap-3">
            {/* Dedicated Print Center Highlight Badge */}
            <Link 
              to="/print-center" 
              className="flex items-center gap-1.5 bg-white hover:bg-[rgba(8,96,107,0.08)] border border-[rgba(8,96,107,0.22)] text-[#08606B] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>مركز الطباعة المتخصص</span>
            </Link>

            {/* Offers Page */}
            <Link 
              to="/offers" 
              className="flex items-center gap-1 text-[#00D2D3] hover:text-[#D45D2B] text-xs font-bold py-2"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>العروض والتخفيضات</span>
            </Link>
          </div>
        </div>

        {/* Mega Menu Overlay - spans the full width of the navbar */}
        <CategoryMegaMenu 
          categories={categories}
          isOpen={isMegaMenuOpen}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 start-0 max-w-xs w-full bg-white text-[#04383f] shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 bg-[#04383f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/brand-logo-transparent.webp" alt="مول المصطفى" className="h-9 w-9 object-contain" />
                <span className="font-sans font-black text-sm text-white">مول المصطفى</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded text-gray-300 hover:text-white"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right">
              {/* Account Quick Card in Drawer */}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 bg-[#f3f4f6] rounded-xl border border-[rgba(17,21,26,0.11)] text-[#04383f] font-bold text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#08606B] text-white flex items-center justify-center font-black">
                      {currentUser?.name?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <span className="block">{currentUser?.name}</span>
                      <span className="text-[10px] text-[#687280] font-normal">{currentUser?.phone}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#08606B]">حسابي ←</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full flex items-center justify-between p-3 bg-[#08606B] text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>تسجيل الدخول / إنشاء حساب</span>
                  </div>
                  <span className="text-[11px]">دخول ←</span>
                </button>
              )}
              {/* Special Print Center Button */}
              <Link
                to="/print-center"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 bg-[rgba(8,96,107,0.08)] border border-[rgba(8,96,107,0.22)] rounded-xl text-[#08606B] font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#08606B]" />
                  <span>مركز الطباعة المتخصص</span>
                </div>
                <span className="text-[10px] bg-[#08606B] text-white px-2 py-0.5 rounded-full">خدمي</span>
              </Link>

              {/* Special Offers Button */}
              <Link
                to="/offers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 bg-[#FDF2EB] border border-[#FBE4D7] rounded-xl text-[#04383f] font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#00D2D3]" />
                  <span>العروض والتخفيضات</span>
                </div>
                <span className="text-[10px] bg-[#00D2D3] text-white px-2 py-0.5 rounded-full font-black">خصومات</span>
              </Link>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-[#687280] uppercase mb-2">أقسام المتجر</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="border-b border-[rgba(17,21,26,0.11)]/60 pb-1">
                      <Link
                        to={cat.department_key === 'print_center' ? '/print-center' : `/category/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 text-xs font-bold text-[#04383f] hover:text-[#08606B]"
                      >
                        <span>{cat.name_ar}</span>
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <div className="pr-3 py-1 space-y-1">
                          {cat.children.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/category/${sub.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-[11px] text-[#687280] hover:text-[#08606B]"
                            >
                              • {sub.name_ar}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Information & Navigation links */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#687280] uppercase mb-2">روابط سريعة ومعلومات</h4>
                <div className="space-y-2 text-xs">
                  {headerNavLinks.length > 0 ? (
                    headerNavLinks.map(item => (
                      <Link 
                        key={item.id} 
                        to={item.url} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="block text-[#687280] hover:text-[#04383f] font-medium"
                      >
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/page/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#687280] hover:text-[#04383f]">عن مول المصطفى</Link>
                      <Link to="/page/delivery" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#687280] hover:text-[#04383f]">سياسة الشحن والتوصيل</Link>
                      <Link to="/page/returns" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#687280] hover:text-[#04383f]">سياسة الاسترجاع</Link>
                      <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#687280] hover:text-[#04383f]">تتبع طلباتي</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsLocationModalOpen(false)} />
          <div className="relative bg-white text-[#04383f] rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 text-right animate-scale-up">
            <h3 className="text-base font-black text-[#04383f] mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#08606B]" />
              <span>اختر وجهة التوصيل</span>
            </h3>
            <p className="text-xs text-[#687280] mb-4">
              حدد محافظتك لتخصيص عروض الشحن وأوقات التسليم المتاحة.
            </p>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {[
                'القاهرة والجيزة',
                'الإسكندرية والساحل',
                'محافظات الدلتا (المنصورة، طنطا، الزقازيق)',
                'محافظات القناة (السويس، الإسماعيلية، بورسعيد)',
                'محافظات الصعيد (بني سويف، المنيا، أسيوط، سوهاج)',
                'باقي محافظات الجمهورية'
              ].map((gov) => (
                <button
                  key={gov}
                  type="button"
                  onClick={() => {
                    setSelectedGovernorate(gov);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full text-right p-3 rounded-lg text-xs font-bold transition-colors ${
                    selectedGovernorate === gov 
                      ? 'bg-[#04383f] text-white' 
                      : 'bg-[#f3f4f6] hover:bg-[#EDE9DE] text-[#04383f]'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-[#04383f] text-xs font-bold rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
      />
    </header>
  );
};
