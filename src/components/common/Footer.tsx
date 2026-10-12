import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { getWhatsAppUrl } from '../../utils/formatters';
import { Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <footer className="bg-[#04383f] text-slate-300 pt-10 pb-6 border-t border-[#002830] text-right font-arabic">
      <div className="max-w-7xl mx-auto px-4">
        {/* Concise 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          
          {/* Column 1: Brand Info & Direct Contact (5 cols) */}
          <div className="md:col-span-5 space-y-3.5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img 
                src="/brand-logo-transparent.webp" 
                alt="مول المصطفى" 
                className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md" 
              />
              <div>
                <span className="font-black text-xl sm:text-2xl text-white block leading-tight group-hover:text-[#00D2D3] transition-colors">
                  مول المصطفى
                </span>
                <span className="text-[11px] text-[#00D2D3] font-bold block">
                  Al Mostafa Mall
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-sm">
              وجهتكم للتسوق المتكامل في مصر — مستلزمات المنزل، الإلكترونيات، الأدوات المدرسية، ومركز الطباعة مع شحن سريع لجميع المحافظات.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm">
              <a 
                href={`tel:${settings.phone || '01017297414'}`} 
                className="inline-flex items-center gap-2 text-white hover:text-[#00D2D3] font-mono transition-colors"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5 text-[#00D2D3]" />
                <span>{settings.phone || '01017297414'}</span>
              </a>

              <a 
                href={`mailto:${settings.support_email || 'contact@almostafamall.com'}`} 
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#00D2D3]" />
                <span>{settings.support_email || 'contact@almostafamall.com'}</span>
              </a>
            </div>

            <div className="pt-1">
              <a
                href={getWhatsAppUrl(settings.whatsapp_number || '01017297414', 'مرحباً مول المصطفى، أحتاج لمساعدة')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 font-bold transition-all text-xs"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>تواصل فوري عبر واتساب (01017297414)</span>
              </a>
            </div>
          </div>

          {/* Column 2: Main Store Links (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-white/10">
              أقسام وروابط سريعة
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>الصفحة الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>جميع المنتجات</span>
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>العروض والتخفيضات</span>
                </Link>
              </li>
              <li>
                <Link to="/print-center" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>مركز الطباعة وتصوير الورق</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-white/10">
              خدمة العملاء والسياسات
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/page/delivery" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>الشحن والتوصيل لجميع المحافظات</span>
                </Link>
              </li>
              <li>
                <Link to="/page/returns" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>سياسة الاسترجاع والاستبدال</span>
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>تتبع حالة طلبك</span>
                </Link>
              </li>
              <li>
                <Link to="/page/faq" className="text-slate-300/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-[#00D2D3]" />
                  <span>الأسئلة الشائعة والمساعدة</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Minimal Copyright Bar */}
        <div className="pt-5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <p>© {new Date().getFullYear()} مول المصطفى — جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <Link to="/page/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
            <span>•</span>
            <Link to="/page/privacy" className="hover:text-white transition-colors">الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
