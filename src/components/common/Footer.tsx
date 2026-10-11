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
  ShieldCheck 
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
    <footer className="bg-[#04383f] text-slate-300 pt-12 pb-8 border-t border-[#002830] text-right font-sans">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img 
                src="/brand-logo-transparent.webp" 
                alt="مول المصطفى" 
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md" 
              />
              <div>
                <span className="font-bold text-2xl text-white block leading-tight tracking-tight group-hover:text-[#00D2D3] transition-colors">
                  مول المصطفى
                </span>
                <span className="text-[11px] text-[#00D2D3] font-mono tracking-wider block">
                  AL MOSTAFA MALL // HIGH-END EDITORIAL
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-sm">
              وجهتكم الأولى في مصر للتسوق المتكامل في مستلزمات المنزل، الإلكترونيات، الأدوات المدرسية والمكتبية، الألعاب، الشنط، الإكسسوارات، ومركز الطباعة الرقمية المتخصص.
            </p>
            <div className="pt-2 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <span>{settings.address_ar}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white font-mono transition-colors">{settings.phone}</a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-[#00D2D3] shrink-0" />
                <a href={`mailto:${settings.support_email}`} className="hover:text-white transition-colors">{settings.support_email}</a>
              </div>
            </div>
          </div>

          {/* Department Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2.5">
              أقسام المتجر
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-slate-300/70 hover:text-white transition-colors">
                    {cat.name_ar}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Printing Center & Services */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2.5 flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#00D2D3]" />
              <span>مركز الطباعة</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/print-center" className="text-slate-300/70 hover:text-white transition-colors">
                  كتالوج خدمات الطباعة
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-slate-300/70 hover:text-white transition-colors">
                  طباعة المستندات والرسائل
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-slate-300/70 hover:text-white transition-colors">
                  كروت العمل والبروشورات
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-slate-300/70 hover:text-white transition-colors">
                  البانرات والفلكس الإعلاني
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-slate-300/70 hover:text-white transition-colors">
                  طلب مقايسة وعرض سعر
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2.5">
              خدمة العملاء والسياسات
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {footerNavLinks.length > 0 ? (
                footerNavLinks.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url} className="text-slate-300/70 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link to="/page/about" className="text-slate-300/70 hover:text-white transition-colors">
                      عن مول المصطفى
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/delivery" className="text-slate-300/70 hover:text-white transition-colors">
                      سياسة الشحن والتوصيل
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/returns" className="text-slate-300/70 hover:text-white transition-colors">
                      سياسة الاسترجاع والاستبدال
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/privacy" className="text-slate-300/70 hover:text-white transition-colors">
                      سياسة الخصوصية
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/terms" className="text-slate-300/70 hover:text-white transition-colors">
                      الشروط والأحكام
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/faq" className="text-slate-300/70 hover:text-white transition-colors">
                      الأسئلة الشائعة
                    </Link>
                  </li>
                  <li>
                    <Link to="/account" className="text-slate-300/70 hover:text-white transition-colors">
                      تتبع طلبك
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-3">
                <a
                  href={getWhatsAppUrl(settings.whatsapp_number, 'مرحباً مول المصطفى، أحتاج لمساعدة')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/40 font-bold transition-all text-xs"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>دعم مباشر عبر واتساب</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} مول المصطفى (Al Mostafa Mall) — جميع الحقوق محفوظة.</p>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/page/terms" className="text-slate-400 hover:text-white transition-colors">الشروط والأحكام</Link>
          <span>•</span>
          <Link to="/page/privacy" className="text-slate-400 hover:text-white transition-colors">الخصوصية</Link>
        </div>
      </div>
    </footer>
  );
};
