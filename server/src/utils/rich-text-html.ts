/** Mirrors client `lib/rich-text` — keep in sync when changing URL/empty logic. */

const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;
const HREF_ATTR_PATTERN = /href\s*=\s*["']([^"']+)["']/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}

export function stripHtmlToPlainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tryParseUrl(value: string): string | null {
  try {
    return new URL(value).href;
  } catch {
    return null;
  }
}

export function extractUrlFromHtml(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = tryParseUrl(trimmed);
  if (direct) return direct;

  const hrefMatch = HREF_ATTR_PATTERN.exec(trimmed);
  if (hrefMatch?.[1]) {
    const fromHref = tryParseUrl(hrefMatch[1]);
    if (fromHref) return fromHref;
  }

  const plain = stripHtmlToPlainText(trimmed);
  return plain ? tryParseUrl(plain) : null;
}

export function isRichTextEmpty(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!looksLikeHtml(trimmed)) return false;
  return stripHtmlToPlainText(trimmed).length === 0;
}
