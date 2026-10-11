import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Order } from '../../types';
import { formatEGP, formatDateTime } from '../../utils/formatters';
import { dbStore } from '../../services/dbStore';
import { X, Printer, ShieldCheck, Receipt, FileText, Download, ExternalLink } from 'lucide-react';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, onClose }) => {
  const [receiptMode, setReceiptMode] = useState<'thermal' | 'a4'>('thermal');
  const settings = dbStore.getSettings();

  if (!order) return null;

  // Primary Action: Instant Native Print via Body Portal
  const handlePrint = () => {
    window.print();
  };

  // Secondary Action: Open in dedicated external tab
  const handleOpenInNewTab = () => {
    const printableElement = document.getElementById('printable-receipt-sheet');
    if (!printableElement) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('يرجى السماح بالنوافذ المنبثقة (Popups) للمتصفح، أو استخدم زر الطباعة الفورية.');
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    printWin.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>فاتورة - ${order.order_number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page {
      size: ${receiptMode === 'thermal' ? '80mm auto' : 'A4 portrait'};
      margin: ${receiptMode === 'thermal' ? '2mm' : '8mm'};
    }
    body {
      margin: 0;
      padding: 16px;
      background: #f8fafc;
      font-family: 'Cairo', system-ui, sans-serif;
      direction: rtl;
      text-align: right;
    }
    .print-bar {
      margin-bottom: 20px;
      padding: 12px 20px;
      background: #042d32;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
    }
    .btn-action {
      background: #08606B;
      color: #fff;
      border: 1px solid #00D2D3;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }
    .paper-box {
      max-width: ${receiptMode === 'thermal' ? '80mm' : '210mm'};
      margin: 0 auto;
      background: #fff;
      padding: ${receiptMode === 'thermal' ? '8px' : '28px'};
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .print-bar { display: none !important; }
      .paper-box { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span style="font-weight: 800; color: #00D2D3;">مول المصطفى — معاينة الفاتورة رقم ${order.order_number}</span>
    <button class="btn-action" onclick="window.print()">🖨️ اضغط للطباعة الآن</button>
  </div>
  <div class="paper-box">
    ${printableElement.innerHTML}
  </div>
</body>
</html>`);
    printWin.document.close();
  };

  // Offline HTML Archiving
  const handleDownloadHtml = () => {
    const printableElement = document.getElementById('printable-receipt-sheet');
    if (!printableElement) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>فاتورة - ${order.order_number}</title>
  ${styles}
  <style>
    @page {
      size: ${receiptMode === 'thermal' ? '80mm auto' : 'A4 portrait'};
      margin: ${receiptMode === 'thermal' ? '2mm' : '8mm'};
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 16px; background: #ffffff !important; color: #000000 !important; font-family: 'Cairo', system-ui, sans-serif; direction: rtl; text-align: right; }
    .isolated-print-wrapper { width: ${receiptMode === 'thermal' ? '76mm' : '100%'} !important; max-width: ${receiptMode === 'thermal' ? '76mm' : '100%'} !important; margin: 0 auto !important; background: #ffffff !important; }
  </style>
</head>
<body>
  <div class="isolated-print-wrapper">
    ${printableElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.order_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Content Renderers (shared between onscreen view and print portal) ---
  const renderThermalReceipt = () => (
    <div className="p-4 sm:p-6 text-gray-900 bg-white max-w-[80mm] mx-auto text-xs font-mono leading-tight space-y-3" id="thermal-receipt">
      {/* Header */}
      <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
        <img 
          src="/brand-logo-transparent.webp" 
          alt="مول المصطفى" 
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('.png')) {
              target.src = '/brand-logo-transparent.png';
            }
          }}
          className="h-12 w-auto mx-auto object-contain"
        />
        <h2 className="font-black text-sm text-gray-900 tracking-wider">مول المصطفى (AL MOSTAFA)</h2>
        <p className="text-[10px] text-gray-600">كل احتياجاتك تحت سقف واحد</p>
        <p className="text-[10px] text-gray-500">س.ت: 458921 | ب.ض: 923-441-802</p>
        <p className="text-[10px] text-gray-600">خدمة العملاء: {settings.phone || '01023456789'}</p>
      </div>

      {/* Receipt Info */}
      <div className="text-[11px] space-y-1 border-b border-dashed border-gray-400 pb-2">
        <div className="flex justify-between">
          <span>رقم الطلب:</span>
          <span className="font-bold">{order.order_number}</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>التاريخ:</span>
          <span>{formatDateTime(order.created_at)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>طريقة الدفع:</span>
          <span>{order.payment_method === 'cash_on_delivery' ? 'دفع عند الاستلام' : order.payment_method}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>الحالة:</span>
          <span className="font-bold">{order.order_status}</span>
        </div>
      </div>

      {/* Customer Details */}
      <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-400 pb-2">
        <p><span className="text-gray-500 text-[10px]">العميل:</span> <strong className="font-sans">{order.customer_name}</strong></p>
        <p><span className="text-gray-500 text-[10px]">الهاتف:</span> <span className="dir-ltr inline-block font-mono">{order.customer_phone}</span></p>
        <p className="text-[10px] text-gray-700">{order.governorate} — {order.city}</p>
        <p className="text-[10px] text-gray-600 line-clamp-2">{order.shipping_address}</p>
        {order.delivery_notes && (
          <p className="text-[9px] text-gray-500 italic">ملاحظات: {order.delivery_notes}</p>
        )}
      </div>

      {/* Items List */}
      <div className="border-b border-dashed border-gray-400 pb-2">
        <div className="flex justify-between text-[10px] font-bold border-b border-gray-200 pb-1 mb-1">
          <span>الصنف والكمية</span>
          <span>الإجمالي</span>
        </div>
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="text-[11px]">
              <div className="font-bold font-sans text-gray-900 leading-snug">{item.product_name_ar}</div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>{item.quantity} × {formatEGP(item.unit_price_egp)}</span>
                <span className="font-bold text-gray-900">{formatEGP(item.total_price_egp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="text-[11px] space-y-1 border-b border-dashed border-gray-400 pb-2">
        <div className="flex justify-between text-gray-600">
          <span>المجموع الفرعي:</span>
          <span>{formatEGP(order.subtotal_egp)}</span>
        </div>
        {order.discount_egp > 0 && (
          <div className="flex justify-between text-green-700 font-bold">
            <span>خصم ترويجي:</span>
            <span>-{formatEGP(order.discount_egp)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>الشحن والتوصيل:</span>
          <span>{order.shipping_fee_egp === 0 ? 'مجاناً' : formatEGP(order.shipping_fee_egp)}</span>
        </div>
        <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-300">
          <span>الصافي المستحق:</span>
          <span className="text-base font-bold">{formatEGP(order.total_egp)}</span>
        </div>
      </div>

      {/* Thermal Barcode & Policy */}
      <div className="text-center pt-2 space-y-1 text-[9px] text-gray-500">
        <div 
          className="mx-auto my-1" 
          style={{ 
            height: '24px', 
            width: '150px', 
            backgroundImage: 'repeating-linear-gradient(90deg, #111, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 6px, transparent 6px, transparent 7px)' 
          }} 
        />
        <p className="font-mono tracking-widest">{order.order_number}</p>
        <p className="font-sans font-bold text-gray-700 text-[10px] pt-1">شكراً لتسوقكم من مول المصطفى!</p>
        <p className="text-[8px] text-gray-500 leading-tight">
          الاستبدال والاسترجاع خلال 14 يوماً من تاريخ الفاتورة شرط سلامة المنتج والغلاف.
        </p>
      </div>
    </div>
  );

  const renderA4Invoice = () => (
    <div className="p-8 sm:p-12 space-y-6 text-xs text-gray-800" id="printable-invoice">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-[#08606B] pb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/brand-logo-transparent.webp" 
            alt="مول المصطفى" 
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('.png')) {
                target.src = '/brand-logo-transparent.png';
              }
            }}
            className="h-16 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-black text-[#04383f]">مول المصطفى (Al Mostafa Mall)</h1>
            <p className="text-[11px] text-gray-600 font-bold">كل احتياجاتك تحت سقف واحد</p>
            <p className="text-[10px] text-gray-500 mt-0.5">سجل تجاري: 458921 | بطاقة ضريبية: 923-441-802</p>
            <p className="text-[10px] text-gray-500">
              خدمة العملاء: {settings.phone || '01023456789'} | {settings.support_email || 'contact@almostafamall.com'}
            </p>
            <p className="text-[10px] text-gray-500">{settings.address_ar}</p>
          </div>
        </div>

        <div className="text-left space-y-1">
          <span className="inline-block px-3 py-1 bg-[#08606B] text-white rounded-lg font-black text-xs">
            فاتورة مبيعات معتمدة
          </span>
          <p className="font-mono font-bold text-sm text-gray-900 block mt-1">{order.order_number}</p>
          <p className="text-[10px] text-gray-500">{formatDateTime(order.created_at)}</p>
          <p className="text-[10px] text-gray-600">
            طريقة الدفع: <strong className="text-gray-900">{order.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.payment_method}</strong>
          </p>
        </div>
      </div>

      {/* Customer & Shipping Details */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="space-y-1">
          <span className="font-bold text-gray-500 text-[10px] block">بيانات العميل المستلم:</span>
          <p className="font-bold text-sm text-gray-900">{order.customer_name}</p>
          <p className="font-mono font-bold text-gray-700 dir-ltr text-right">{order.customer_phone}</p>
          {order.customer_email && <p className="text-gray-500 text-[10px]">{order.customer_email}</p>}
        </div>

        <div className="space-y-1 text-left">
          <span className="font-bold text-gray-500 text-[10px] block">عنوان التوصيل (مصر):</span>
          <p className="font-bold text-gray-900">{order.governorate} — {order.city}</p>
          <p className="text-gray-700">{order.shipping_address}</p>
          {order.delivery_notes && (
            <p className="text-[10px] text-gray-500 italic">ملاحظات: {order.delivery_notes}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-[#04383f] text-white font-bold text-[11px]">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">بيان الصنف</th>
              <th className="p-3">كود SKU</th>
              <th className="p-3 text-center">الكمية</th>
              <th className="p-3 text-left">سعر الوحدة</th>
              <th className="p-3 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, idx) => (
              <tr key={item.id} className="text-[11px]">
                <td className="p-3 text-gray-500 font-bold">{idx + 1}</td>
                <td className="p-3 font-bold text-gray-900">{item.product_name_ar}</td>
                <td className="p-3 font-mono text-gray-500">{item.product_sku}</td>
                <td className="p-3 text-center font-bold">{item.quantity}</td>
                <td className="p-3 text-left font-mono">{formatEGP(item.unit_price_egp)}</td>
                <td className="p-3 text-left font-black font-mono text-gray-900">{formatEGP(item.total_price_egp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="flex justify-between items-start pt-2">
        <div className="space-y-2 max-w-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[10px] text-gray-600 space-y-1">
            <span className="font-bold text-gray-800 block">سياسة الاستبدال والضمان:</span>
            <p>يحق للعميل استبدال أو إرجاع المنتج خلال 14 يوماً من الاستلام بحالته الأصلية وفاتورة الشراء.</p>
          </div>

          {/* Barcode Mock */}
          <div className="pt-2 text-center space-y-0.5">
            <div 
              className="mx-auto my-1" 
              style={{ 
                height: '32px', 
                width: '180px', 
                backgroundImage: 'repeating-linear-gradient(90deg, #111, #111 2px, transparent 2px, transparent 5px, #111 5px, #111 8px, transparent 8px, transparent 10px)' 
              }} 
            />
            <span className="font-mono text-[9px] text-gray-500 tracking-widest">{order.order_number}</span>
          </div>
        </div>

        <div className="w-64 space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex justify-between text-gray-600">
            <span>المجموع الفرعي:</span>
            <span className="font-mono font-bold">{formatEGP(order.subtotal_egp)}</span>
          </div>
          {order.discount_egp > 0 && (
            <div className="flex justify-between text-green-700 font-bold">
              <span>خصم ترويجي:</span>
              <span className="font-mono">-{formatEGP(order.discount_egp)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>رسوم الشحن والتوصيل:</span>
            <span className="font-mono font-bold">{order.shipping_fee_egp === 0 ? 'مجاناً' : formatEGP(order.shipping_fee_egp)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-[#04383f] border-t border-gray-200 pt-2">
            <span>الإجمالي النهائي المستحق:</span>
            <span className="font-mono text-green-800">{formatEGP(order.total_egp)}</span>
          </div>
        </div>
      </div>

      {/* Stamp & Signature Footer */}
      <div className="pt-8 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
        <div className="space-y-1 text-center">
          <span className="block font-bold">توقيع المستلم</span>
          <div className="w-32 border-b border-gray-400 mt-6" />
        </div>

        <div className="text-center space-y-1">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#08606B] text-[#08606B] flex flex-col items-center justify-center p-1 mx-auto rotate-12 opacity-80">
            <ShieldCheck className="w-6 h-6 text-[#08606B]" />
            <span className="text-[8px] font-black">مول المصطفى</span>
            <span className="text-[7px]">معتمد رسمياً</span>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <span className="block font-bold">مسؤول قسم الشحن والتسليم</span>
          <div className="w-32 border-b border-gray-400 mt-6" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Global Print Isolation CSS: Hides #root and renders exclusively #al-mostafa-print-portal on print */}
      <style>{`
        #al-mostafa-print-portal {
          display: none;
        }
        @media print {
          #root {
            display: none !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          #al-mostafa-print-portal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: ${receiptMode === 'thermal' ? '80mm' : '100%'} !important;
            margin: 0 auto !important;
            padding: ${receiptMode === 'thermal' ? '2mm' : '8mm'} !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          @page {
            size: ${receiptMode === 'thermal' ? '80mm auto' : 'A4 portrait'};
            margin: ${receiptMode === 'thermal' ? '2mm' : '8mm'};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* On-Screen Modal View */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-2 sm:p-4 font-arabic text-right">
        <div 
          className="fixed inset-0" 
          onClick={onClose} 
          aria-hidden="true" 
        />

        <div className={`relative bg-white rounded-3xl w-full shadow-2xl overflow-hidden z-10 border border-gray-100 ${
          receiptMode === 'thermal' ? 'max-w-md' : 'max-w-3xl'
        }`}>
          {/* Top Control Bar */}
          <div className="bg-[#042d32] p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#08606B]/30">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#00D2D3]" />
              <span className="font-bold text-xs sm:text-sm">
                طباعة الفاتورة — طلب رقم {order.order_number}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Format Switcher */}
              <div className="bg-[#032328] p-1 rounded-xl flex items-center border border-[#08606B]/40">
                <button
                  type="button"
                  onClick={() => setReceiptMode('thermal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    receiptMode === 'thermal'
                      ? 'bg-[#08606B] text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>إيصال حراري (80mm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptMode('a4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    receiptMode === 'a4'
                      ? 'bg-[#08606B] text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>فاتورة رسمية (A4)</span>
                </button>
              </div>

              {/* Primary Instant Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-[#08606B] hover:bg-[#0b7c8a] text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#08606B]/25 border border-[#00D2D3]/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="طباعة فورية بنقرة واحدة (Ctrl + P)"
              >
                <Printer className="w-4 h-4 text-[#00D2D3]" />
                <span>طباعة فورية</span>
              </button>

              {/* External Tab Option */}
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
                title="فتح في نافذة مستقلة"
              >
                <ExternalLink className="w-4 h-4 text-[#00D2D3]" />
              </button>

              {/* Download HTML */}
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
                title="تحميل نسخة HTML مستقلة"
              >
                <Download className="w-4 h-4 text-[#00D2D3]" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* On-Screen Preview Paper */}
          <div id="printable-receipt-sheet" className="w-full bg-white max-h-[75vh] overflow-y-auto">
            {receiptMode === 'thermal' ? renderThermalReceipt() : renderA4Invoice()}
          </div>
        </div>
      </div>

      {/* Body Portal for Native Printing */}
      {typeof document !== 'undefined' && createPortal(
        <div id="al-mostafa-print-portal" dir="rtl" className="font-arabic text-right">
          {receiptMode === 'thermal' ? renderThermalReceipt() : renderA4Invoice()}
        </div>,
        document.body
      )}
    </>
  );
};
