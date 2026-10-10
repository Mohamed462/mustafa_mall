import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { getWhatsAppUrl } from '../../utils/formatters';
import { dbStore } from '../../services/dbStore';
import { NavItem } from '../../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Printer, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories } = useStoreSettings();
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

  const footerNavLinks = navItems.filter(item => item.location === 'footer' && item.is_active);

  return (
    <footer className="bg-[#0A0A0B] text-gray-300 pt-12 pb-8 border-t border-[#1C2526] text-right">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-[#1C2526]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1C2526] border border-[#2B3537] text-[#B89B5E]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">توصيل سريع وموثوق</h4>
              <p className="text-[11px] text-gray-400">شحن مجاني للطلبات فوق {settings.free_shipping_threshold_egp} ج.م</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1C2526] border border-[#2B3537] text-[#0D7377]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">جودة أصلية 100%</h4>
              <p className="text-[11px] text-gray-400">منتجات معتمدة ومطابقة للمواصفات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1C2526] border border-[#2B3537] text-[#B89B5E]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">استبدال واسترجاع مرن</h4>
              <p className="text-[11px] text-gray-400">خلال 14 يوماً وفقاً لحماية المستهلك</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1C2526] border border-[#2B3537] text-[#0D7377]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">دفع آمن ومتعدد الطرق</h4>
              <p className="text-[11px] text-gray-400">كاش، إنستاباي، فودافون كاش وبطاقات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img 
                src="/brand-logo-transparent.webp" 
                alt="مول المصطفى" 
                className="h-12 w-12 object-contain transition-transform group-hover:scale-105" 
              />
              <div>
                <span className="font-cairo font-black text-xl text-white block leading-tight group-hover:text-[#D4AF37] transition-colors">
                  مول المصطفى
                </span>
                <span className="text-[10px] text-[#B89B5E] font-medium tracking-wider">
                  AL MOSTAFA MALL
                </span>
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              وجهتكم الأولى في مصر للتسوق الشامل في مستلزمات المنزل، الإلكترونيات، الأدوات المدرسية والمكتبية، الألعاب، الشنط، الإكسسوارات، ومركز الطباعة الرقمية المتخصص.
            </p>
            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#B89B5E] shrink-0" />
                <span>{settings.address_ar}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-[#B89B5E] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-[#D4AF37] font-mono">{settings.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#B89B5E] shrink-0" />
                <a href={`mailto:${settings.support_email}`} className="hover:text-[#D4AF37]">{settings.support_email}</a>
              </div>
            </div>
          </div>

          {/* Department Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-[#1C2526] pb-2">
              أقسام المتجر
            </h4>
            <ul className="space-y-2.5 text-xs">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                    {cat.name_ar}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Printing Center & Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-[#1C2526] pb-2 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-[#B89B5E]" />
              <span>مركز الطباعة</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/print-center" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                  كتالوج خدمات الطباعة
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                  طباعة المستندات والرسائل
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                  كروت العمل والبروشورات
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                  البانرات والفلكس الإعلاني
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                  طلب مقايسة وعرض سعر
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-[#1C2526] pb-2">
              خدمة العملاء والسياسات
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerNavLinks.length > 0 ? (
                footerNavLinks.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url} className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link to="/page/about" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      عن مول المصطفى
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/delivery" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      سياسة الشحن والتوصيل
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/returns" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      سياسة الاسترجاع والاستبدال
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/privacy" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      سياسة الخصوصية
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/terms" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      الشروط والأحكام
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/faq" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      الأسئلة الشائعة
                    </Link>
                  </li>
                  <li>
                    <Link to="/account" className="text-gray-400 hover:text-[#B89B5E] transition-colors">
                      تتبع طلبك
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-2">
                <a
                  href={getWhatsAppUrl(settings.whatsapp_number, 'مرحباً مول المصطفى، أحتاج لمساعدة')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>دعم مباشر عبر واتساب</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-[#1C2526] text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} مول المصطفى (Al Mostafa Mall) — جميع الحقوق محفوظة.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/page/terms" className="text-gray-400 hover:text-white">الشروط والأحكام</Link>
          <span>•</span>
          <Link to="/page/privacy" className="text-gray-400 hover:text-white">الخصوصية</Link>
          <span>•</span>
          <Link to="/admin" className="text-[#B89B5E] hover:text-[#D4AF37] font-bold">بوابة الإدارة</Link>
        </div>
      </div>
    </footer>
  );
};
