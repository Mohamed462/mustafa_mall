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
 * Extract Google Drive file ID from any Google Drive URL format:
 * - /file/d/{id} (including multi-account /file/u/0/d/{id}, /file/u/1/d/{id})
 * - /d/{id}
 * - /document/d/{id}, /spreadsheets/d/{id}, etc.
 * - ?id={id} or &id={id}
 * - /uc?id={id}
 * - /open?id={id}
 * - /thumbnail?id={id}
 * Explicitly rejects Google Drive folders (/folders/) since they cannot be rendered as images.
 */
export function extractGoogleDriveFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Folder URLs cannot be displayed as images
  if (trimmed.includes('/folders/')) return null;

  // 1. Any path containing /d/{fileId}
  const pathMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // 2. Query parameter id=FILE_ID or &id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  return null;
}

/**
 * Normalizes any image URL. If the user pasted a Google Drive sharing link,
 * converts it into a direct displayable Google CDN endpoint (`lh3.googleusercontent.com/d/{id}`),
 * which bypasses OpaqueResponseBlocking (CORB) and HTML preview wrappers.
 */
export function normalizeImageUrl(url?: string | null, fallback: string = PRODUCT_FALLBACK_IMAGE): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Already a direct Google CDN link
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }

  // Reject folder URLs immediately
  if (trimmed.includes('drive.google.com') && trimmed.includes('/folders/')) {
    return fallback;
  }

  // Check if it's a Google Drive link
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileId = extractGoogleDriveFileId(trimmed);
    if (fileId) {
      // lh3.googleusercontent.com serves direct static image bytes without CORS/CORB blocks
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return fallback;
  }

  return trimmed;
}

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

