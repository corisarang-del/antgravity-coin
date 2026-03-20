const HANGUL_REGEX = /[\uac00-\ud7a3]/g;
const HAN_REGEX = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const HIRAGANA_KATAKANA_REGEX = /[\u3040-\u30ff]/g;
const ARABIC_REGEX = /[\u0600-\u06ff]/g;
const CYRILLIC_REGEX = /[\u0400-\u04ff]/g;
const LATIN_WORD_REGEX = /\b[A-Za-z]*[a-z][A-Za-z]*\b/g;
const REPLACEMENT_CHAR_REGEX = /\uFFFD/;

function countMatches(text: string, regex: RegExp) {
  return text.match(regex)?.length ?? 0;
}

export function hasSuspiciousEncoding(text: string) {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return true;
  }

  if (REPLACEMENT_CHAR_REGEX.test(trimmed)) {
    return true;
  }

  const hangulCount = countMatches(trimmed, HANGUL_REGEX);
  const hanCount = countMatches(trimmed, HAN_REGEX);
  const kanaCount = countMatches(trimmed, HIRAGANA_KATAKANA_REGEX);
  const arabicCount = countMatches(trimmed, ARABIC_REGEX);
  const cyrillicCount = countMatches(trimmed, CYRILLIC_REGEX);
  const latinWordCount = countMatches(trimmed, LATIN_WORD_REGEX);

  if (kanaCount > 0 || arabicCount > 0 || cyrillicCount > 0) {
    return true;
  }

  if (latinWordCount > 0) {
    return true;
  }

  if (hanCount >= 3 && hanCount > hangulCount) {
    return true;
  }

  return hanCount >= 3 && hangulCount >= 3;
}

export function containsHangul(text: string) {
  return countMatches(text, HANGUL_REGEX) > 0;
}

export function sanitizeKoreanText(text: string, fallback: string) {
  const trimmed = text.trim();

  if (!trimmed || hasSuspiciousEncoding(trimmed) || !containsHangul(trimmed)) {
    return fallback;
  }

  return trimmed;
}

export function sanitizeDisplayText(text: string, fallback: string) {
  const trimmed = text.trim();

  if (!trimmed || hasSuspiciousEncoding(trimmed)) {
    return fallback;
  }

  return trimmed;
}
