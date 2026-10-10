// Formatting helpers for Egyptian Currency, Numbers, and Dates

/**
 * Formats a monetary number into Egyptian Pounds (ج.م)
 * e.g. 1250 -> "1,250 ج.م"
 */
export function formatCurrencyEGP(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ج.م';
  }
  
  // Format with thousands separator
  const formatted = new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

  return `${formatted} ج.م`;
}

/**
 * Formats an English numeric price with EGP suffix for admin or dual display
 */
export function formatCurrencyEn(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EGP`;
}

/**
 * Calculates genuine discount percentage from original and current prices
 */
export function calculateDiscountPercent(originalPrice?: number, currentPrice?: number): number {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Formats date into readable Arabic locale
 */
export function formatDateArabic(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Converts Eastern Arabic (Arabic-Indic) numerals (٠-٩) and Persian numerals (۰-۹) to standard ASCII digits (0-9).
 * Crucial for Egyptian mobile users typing on Arabic keyboards.
 */
export function normalizeArabicDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u0660-\u0669]/g, d => (d.charCodeAt(0) - 1632).toString())
    .replace(/[\u06F0-\u06F9]/g, d => (d.charCodeAt(0) - 1776).toString());
}

/**
 * Normalizes an Egyptian phone or WhatsApp number to the official international format (201XXXXXXXXX)
 * Handles Egyptian mobile numbers, Arabic keyboard inputs, and international prefixes:
 * e.g. "01012345678" -> "201012345678"
 * e.g. "٠١٠١٢٣٤٥٦٧٨" -> "201012345678"
 * e.g. "+20 10 1234 5678" -> "201012345678"
 * e.g. "+2001012345678" -> "201012345678"
 */
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return '';
  let clean = normalizeArabicDigits(phone).replace(/[^0-9]/g, '');
  if (clean.startsWith('0020')) {
    clean = clean.slice(2);
  }
  if (clean.startsWith('2001') && clean.length === 13) {
    clean = '20' + clean.slice(3);
  }
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '20' + clean.slice(1);
  } else if (clean.startsWith('1') && clean.length === 10) {
    clean = '20' + clean;
  }
  return clean;
}

/**
 * Generates official WhatsApp click-to-chat URL with normalized Egyptian country code
 */
export function getWhatsAppUrl(phone: string, text?: string): string {
  const normalized = normalizeEgyptianPhone(phone);
  const url = `https://wa.me/${normalized}`;
  if (text) {
    return `${url}?text=${encodeURIComponent(text)}`;
  }
  return url;
}

// Aliases for convenient consistency across components
export const formatEGP = formatCurrencyEGP;
export const formatDateTime = formatDateArabic;
export const formatDate = formatDateArabic;
export const getWhatsAppLink = getWhatsAppUrl;

export interface OrderStatusBadgeInfo {
  label: string;
  badgeClass: string;
  step: number;
}

export function getOrderStatusBadge(status: string): OrderStatusBadgeInfo {
  switch (status) {
    case 'pending_confirmation':
      return {
        label: 'قيد المراجعة والتأكيد',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        step: 1
      };
    case 'confirmed':
      return {
        label: 'تم التأكيد وجاري التحضير',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        step: 2
      };
    case 'preparing':
      return {
        label: 'جاري التجهيز والتغليف',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        step: 3
      };
    case 'out_for_delivery':
      return {
        label: 'خرج للتوصيل مع المندوب',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        step: 4
      };
    case 'delivered':
      return {
        label: 'تم التسليم بنجاح',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        step: 5
      };
    case 'cancelled':
      return {
        label: 'تم إلغاء الطلب',
        badgeClass: 'bg-red-50 text-red-800 border-red-200',
        step: 0
      };
    case 'returned':
      return {
        label: 'طلب مرتجع',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        step: 0
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        step: 1
      };
  }
}


