// Arabic Text Normalization & Search Utility

/**
 * Normalizes Arabic text for flexible and tolerant search matching:
 * - Unifies alef forms: أ, إ, آ, ٱ -> ا
 * - Unifies yaa and alef maqsura: ى -> ي
 * - Unifies taa marbuta and haa: ة -> ه
 * - Removes tashkeel (diacritics: fatha, damma, kasra, sukun, shadda, tanween)
 * - Removes tatweel / kashida (ـ)
 * - Converts to lowercase and trims
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';

  return text
    .trim()
    .toLowerCase()
    // Remove diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Yaa / Alef Maqsura
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه');
}

/**
 * Matches a query against Arabic candidate text using normalization and word-token matching
 */
export function arabicFuzzyMatch(candidate: string, query: string): boolean {
  if (!candidate || !query) return false;
  
  const normCandidate = normalizeArabicText(candidate);
  const normQuery = normalizeArabicText(query);

  if (normCandidate.includes(normQuery)) return true;

  // Check individual words
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every(token => normCandidate.includes(token));
  }

  return false;
}
