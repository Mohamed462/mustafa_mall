import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/formatters';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStoreSettings();

  if (!settings.is_announcement_enabled) return null;

  return (
    <div className="bg-[#04383f] text-gray-200 text-xs py-2 px-4 border-b border-[#08606B]/30 font-arabic">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center bg-[#00D2D3] text-[#04383f] font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wide shadow-xs">
            حصرياً
          </span>
          <p className="font-semibold text-white/95 text-center sm:text-right text-xs">
            {settings.announcement_text_ar}
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs text-gray-300">
          <div className="hidden md:flex items-center gap-1.5 text-gray-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D2D3]" />
            <span>منتجات أصلية 100% ومضمونة</span>
          </div>

          <a 
            href={getWhatsAppUrl(settings.whatsapp_number, 'مرحباً، أود الاستفسار عن منتجات مول المصطفى')}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-200 hover:text-[#00D2D3] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>تواصل عبر واتساب</span>
          </a>

          <a 
            href={`tel:${settings.phone}`}
            className="flex items-center gap-1.5 text-gray-200 hover:text-[#00D2D3] transition-colors font-mono"
          >
            <Phone className="w-3.5 h-3.5 text-[#00D2D3]" />
            <span>{settings.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
