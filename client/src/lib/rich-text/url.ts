import { HREF_ATTR_PATTERN } from "./constants";
import { looksLikeHtml, stripHtmlToPlainText } from "./html";

/** Matches the first `<a href="...">label</a>` in Quill HTML. */
const ANCHOR_PATTERN = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i;

export type RichTextLink = { href: string; label: string };

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

/**
 * When a cell's content is essentially a single link (a Quill anchor or a bare URL),
 * return its navigable `href` plus a display `label` (the anchor text / file name).
 * Returns `null` when the content is plain text or mixes a link with other text,
 * so callers can fall back to normal rich-text rendering.
 */
export function extractRichTextLink(value: string): RichTextLink | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = ANCHOR_PATTERN.exec(trimmed);
  if (match?.[1]) {
    const href = tryParseUrl(match[1]) ?? match[1];
    const anchorText = stripHtmlToPlainText(match[2]);
    const fullText = stripHtmlToPlainText(trimmed);
    // Only treat as a link chip when the anchor is the whole cell content.
    if (anchorText && fullText === anchorText) {
      // Prefer human-friendly anchor text over a raw URL label.
      const label = tryParseUrl(anchorText) ? labelFromUrl(href) : anchorText;
      return { href, label };
    }
    return null;
  }

  // A bare URL pasted as plain text — possibly wrapped in Quill markup (`<p>…</p>`).
  const plain = looksLikeHtml(trimmed) ? stripHtmlToPlainText(trimmed) : trimmed;
  const direct = tryParseUrl(plain);
  if (direct) return { href: direct, label: labelFromUrl(direct) };

  return null;
}

/** Best-effort display label for a URL: a file name from the path, else the host. */
function labelFromUrl(href: string): string {
  try {
    const url = new URL(href);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    const decoded = last ? decodeURIComponent(last) : "";
    if (decoded.includes(".")) return decoded;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
