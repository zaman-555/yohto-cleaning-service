import { HREF_ATTR_PATTERN } from "./constants";
import { stripHtmlToPlainText } from "./html";

function tryParseUrl(value: string): string | null {
  try {
    return new URL(value).href;
  } catch {
    return null;
  }
}

/** Pull a navigable URL from plain text or Quill HTML (href, or visible text). */
export function extractUrlFromRichText(value: string): string | null {
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
