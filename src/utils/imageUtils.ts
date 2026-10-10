// Utility functions and SVG placeholders for resilient, high-performance image handling
import React from 'react';

/**
 * Self-contained SVG data URI placeholder for products
 * Requires zero network calls and works 100% offline with zero layout shift.
 */
export const PRODUCT_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#F8FAFC"/>
  <rect x="16" y="16" width="368" height="368" rx="16" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="200" cy="170" r="44" fill="#B89B5E" fill-opacity="0.12"/>
  <path d="M188 170H212M200 158V182" stroke="#B89B5E" stroke-width="3" stroke-linecap="round"/>
  <text x="200" y="245" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#0A0A0B" text-anchor="middle">مول المصطفى</text>
  <text x="200" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#888888" text-anchor="middle">صورة المنتج قيد التحديث</text>
</svg>
`.trim())}`;

/**
 * Banner and hero fallback data URI
 */
export const BANNER_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400" fill="none">
  <rect width="1200" height="400" fill="#0A0A0B"/>
  <text x="600" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#B89B5E" text-anchor="middle">مول المصطفى - AL MOSTAFA MALL</text>
  <text x="600" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#888888" text-anchor="middle">أفضل العروض والمنتجات المعتمدة في مصر</text>
</svg>
`.trim())}`;

/**
 * Handles image loading error safely, preventing infinite recursive firing
 * by stripping the onerror callback before assigning the fallback.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = PRODUCT_FALLBACK_IMAGE
) {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = fallbackUrl;
}
