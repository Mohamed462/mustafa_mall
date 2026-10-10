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
    <header className="sticky top-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md text-white shadow-sm border-b border-[#1C2526]">
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
              className="lg:hidden p-2 text-gray-200 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label="فتح القائمة الرئيسية"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Official Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <img 
                src="/brand-logo-transparent.webp" 
                alt="مول المصطفى - Al Mostafa Mall" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
              />
              <div className="flex flex-col text-right">
                <span className="font-cairo font-black text-base sm:text-lg text-white tracking-tight leading-none group-hover:text-[#D4AF37] transition-colors">
                  مول المصطفى
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#B89B5E] font-semibold tracking-wider">
                  AL MOSTAFA MALL
                </span>
              </div>
            </Link>

            {/* Delivery Location Trigger (Desktop) */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden xl:flex items-center gap-2 text-xs text-gray-300 hover:text-[#D4AF37] bg-[#1C2526]/80 px-3 py-1.5 rounded-lg border border-[#2B3537] transition-colors me-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#B89B5E]" />
              <div className="text-right">
                <span className="block text-[10px] text-gray-400">التوصيل إلى:</span>
                <span className="font-bold text-gray-100">{selectedGovernorate}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Center Section: Prominent Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-2xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="flex items-center w-full bg-white rounded-lg overflow-hidden border-2 border-transparent focus-within:border-[#B89B5E] shadow-sm transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setIsSearching(true)}
                  placeholder="بتدور على إيه؟ (ابحث في أكثر من 8 أقسام ومئات المنتجات...)"
                  className="w-full py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  dir="rtl"
                />
                <button
                  type="submit"
                  className="bg-[#B89B5E] hover:bg-[#D4AF37] text-[#0A0A0B] font-bold px-6 py-2.5 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="بحث"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {isSearching && (
              <div className="absolute top-full start-0 w-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-right animate-fade-in">
                {suggestions.length > 0 ? (
                  <div className="p-2">
                    <div className="text-[11px] font-bold text-gray-400 px-3 py-1 border-b border-gray-100">
                      منتجات مقترحة
                    </div>
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(p)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-gold-50/60 rounded-lg transition-colors group text-right"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.images[0]?.image_url} 
                            alt={p.name_ar} 
                            onError={handleImageError}
                            className="w-10 h-10 object-cover rounded border border-gray-100 shrink-0" 
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-mall-900 line-clamp-1">
                              {p.name_ar}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              كود: {p.sku}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-mall-900">
                          {formatCurrencyEGP(p.price_egp)}
                        </span>
                      </button>
                    ))}
                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-gold-600 hover:text-gold-700"
                      >
                        عرض جميع نتائج البحث عن "{searchQuery}" ←
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-xs">
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
                className="hidden md:inline-flex items-center gap-1.5 bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 border border-gold-500/40 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span>لوحة الإدارة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center gap-0.5 text-gray-300 hover:text-white px-2 py-1 rounded-lg hover:bg-mall-800 transition-colors relative"
              aria-label="المفضلة"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-gray-300 hover:text-red-400 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -start-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] hidden sm:block">المفضلة</span>
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="flex flex-col items-center gap-0.5 text-gray-300 hover:text-white px-2 py-1 rounded-lg hover:bg-mall-800 transition-colors"
                aria-label="حسابي"
              >
                <User className="w-5 h-5 text-gold-400" />
                <span className="text-[11px] hidden sm:block max-w-[80px] truncate text-gold-400 font-bold">
                  {currentUser?.name?.split(' ')[0] || 'حسابي'}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex flex-col items-center gap-0.5 text-gray-300 hover:text-white px-2 py-1 rounded-lg hover:bg-mall-800 transition-colors cursor-pointer"
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
              className="flex flex-col items-center gap-0.5 bg-[#B89B5E] hover:bg-[#D4AF37] text-[#0A0A0B] font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm relative cursor-pointer"
              aria-label="عربة التسوق"
            >
              <div className="relative flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-[#0A0A0B]" />
                <span className="text-xs font-black">{itemCount}</span>
              </div>
              <span className="text-[10px] hidden sm:block leading-none mt-0.5 font-bold">السلة</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Below Main Bar on small screens) */}
        <div ref={mobileSearchContainerRef} className="lg:hidden mt-2 pt-2 border-t border-[#1C2526] relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="flex items-center w-full bg-white rounded-lg overflow-hidden shadow-xs border border-transparent focus-within:border-[#B89B5E]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setIsSearching(true)}
                placeholder="بتدور على إيه في مول المصطفى؟"
                className="w-full py-2 px-3 text-xs text-gray-900 focus:outline-none"
                dir="rtl"
              />
              <button
                type="submit"
                className="bg-[#B89B5E] text-[#0A0A0B] p-2 flex items-center justify-center cursor-pointer"
                aria-label="بحث"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Mobile Search Suggestions Dropdown */}
          {isSearching && (
            <div className="absolute top-full start-0 w-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-right animate-fade-in max-h-80 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="p-2">
                  <div className="text-[11px] font-bold text-gray-400 px-3 py-1 border-b border-gray-100">
                    منتجات مقترحة
                  </div>
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(p)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gold-50/60 rounded-lg transition-colors group text-right"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={p.images[0]?.image_url} 
                          alt={p.name_ar} 
                          onError={handleImageError}
                          className="w-9 h-9 object-cover rounded border border-gray-100 shrink-0" 
                        />
                        <div className="min-w-0 text-right">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-mall-900 truncate">
                            {p.name_ar}
                          </p>
                          <span className="text-[10px] text-gray-400 block">
                            كود: {p.sku}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-mall-900 shrink-0 me-1">
                        {formatCurrencyEGP(p.price_egp)}
                      </span>
                    </button>
                  ))}
                  <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700"
                    >
                      عرض جميع نتائج البحث عن "{searchQuery}" ←
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-xs">
                  لم نعثر على نتائج مطابقة لـ "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Bar: Categories & Quick Links (Desktop) */}
      <nav className="hidden lg:block bg-[#0A0A0B] border-t border-[#1C2526] text-sm relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mega Menu Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-2 px-4 py-3 font-bold text-xs transition-colors rounded-t-lg cursor-pointer ${
                  isMegaMenuOpen 
                    ? 'bg-[#B89B5E] text-[#0A0A0B]' 
                    : 'bg-[#1C2526] hover:bg-[#253032] text-gray-200 border border-[#2B3537]'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>كل الأقسام والفئات</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dynamic Navigation Links managed by Admin Navigation Manager */}
            <div className="flex items-center gap-5 px-3 text-[15px] font-semibold text-gray-200">
              {headerNavLinks.length > 0 ? (
                headerNavLinks.map((item) => (
                  <Link 
                    key={item.id} 
                    to={item.url} 
                    className="hover:text-[#D4AF37] transition-colors py-3 relative group"
                  >
                    <span>{item.label}</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#B89B5E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                ))
              ) : (
                <>
                  <Link to="/category/home-and-cleaning" className="hover:text-[#D4AF37] transition-colors py-3 relative group">
                    <span>المنزل والتنظيف</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#B89B5E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                  <Link to="/category/electronics-and-mobile" className="hover:text-[#D4AF37] transition-colors py-3 relative group">
                    <span>الإلكترونيات والموبايل</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#B89B5E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                  <Link to="/category/office-and-school" className="hover:text-[#D4AF37] transition-colors py-3 relative group">
                    <span>المكتبي والمدرسي</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#B89B5E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>
                  <Link to="/category/toys-and-gifts" className="hover:text-[#D4AF37] transition-colors py-3 relative group">
                    <span>الألعاب والهدايا</span>
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#B89B5E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
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
              className="flex items-center gap-1.5 bg-[#1C2526] hover:bg-[#253032] border border-[#B89B5E]/50 text-[#B89B5E] hover:text-[#D4AF37] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>مركز الطباعة المتخصص</span>
            </Link>

            {/* Offers Page */}
            <Link 
              to="/offers"
              className="flex items-center gap-1 text-[#B89B5E] hover:text-[#D4AF37] text-xs font-bold py-2.5"
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
          <div className="fixed inset-y-0 start-0 max-w-xs w-full bg-white text-gray-900 shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 bg-mall-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/brand-logo-transparent.webp" alt="مول المصطفى" className="h-9 w-9 object-contain" />
                <span className="font-cairo font-black text-sm text-white">مول المصطفى</span>
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
                  className="flex items-center justify-between p-3 bg-mall-50 rounded-xl border border-mall-100 text-mall-950 font-bold text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gold-500 text-mall-950 flex items-center justify-center font-black">
                      {currentUser?.name?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <span className="block">{currentUser?.name}</span>
                      <span className="text-[10px] text-gray-500 font-normal">{currentUser?.phone}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gold-600">حسابي ←</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gold-500 text-mall-950 rounded-xl font-bold text-xs shadow-xs"
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
                className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-950 font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-cyan-700" />
                  <span>مركز الطباعة المتخصص</span>
                </div>
                <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded-full">خدمي</span>
              </Link>

              {/* Special Offers Button */}
              <Link
                to="/offers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 bg-gold-50 border border-gold-200 rounded-xl text-mall-950 font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gold-600" />
                  <span>العروض والتخفيضات</span>
                </div>
                <span className="text-[10px] bg-gold-500 text-mall-950 px-2 py-0.5 rounded-full font-black">خصومات</span>
              </Link>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">أقسام المتجر</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="border-b border-gray-100 pb-1">
                      <Link
                        to={cat.department_key === 'print_center' ? '/print-center' : `/category/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 text-xs font-bold text-gray-800 hover:text-mall-900"
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
                              className="block py-1 text-[11px] text-gray-600 hover:text-gold-600"
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
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">روابط سريعة ومعلومات</h4>
                <div className="space-y-2 text-xs">
                  {headerNavLinks.length > 0 ? (
                    headerNavLinks.map(item => (
                      <Link 
                        key={item.id} 
                        to={item.url} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="block text-gray-600 hover:text-mall-900 font-medium"
                      >
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/page/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600">عن مول المصطفى</Link>
                      <Link to="/page/delivery" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600">سياسة الشحن والتوصيل</Link>
                      <Link to="/page/returns" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600">سياسة الاسترجاع</Link>
                      <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600">تتبع طلباتي</Link>
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
          <div className="relative bg-white text-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 text-right animate-scale-up">
            <h3 className="text-base font-black text-mall-900 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-500" />
              <span>اختر وجهة التوصيل</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
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
                      ? 'bg-mall-900 text-white' 
                      : 'bg-gray-50 hover:bg-gold-50 text-gray-800'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
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
