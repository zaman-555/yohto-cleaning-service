import { extractUrlFromRichText, looksLikeHtml, stripHtmlToPlainText } from "@/lib/rich-text";

const DRIVE_HOST_PATTERN = /(drive|docs)\.google\.com/i;
const DRIVE_DOC_PARAGRAPH_PATTERN =
  /<p\b[^>]*\bdata-drive-doc\s*=\s*["']1["'][^>]*>[\s\S]*?<\/p>/gi;
const ANCHOR_PATTERN =
  /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

function tryParseUrl(value: string): string | null {
  try {
    return new URL(value.trim()).href;
  } catch {
    return null;
  }
}

function isGoogleDriveUrl(href: string): boolean {
  try {
    return DRIVE_HOST_PATTERN.test(new URL(href).hostname);
  } catch {
    return DRIVE_HOST_PATTERN.test(href);
  }
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Find a Google Drive / Docs URL inside rich text (dedicated marker or any Drive link). */
export function extractGoogleDriveLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const markerMatch = /data-drive-doc\s*=\s*["']1["'][^>]*>[\s\S]*?href\s*=\s*["']([^"']+)["']/i.exec(
    trimmed
  );
  if (markerMatch?.[1]) {
    const href = tryParseUrl(markerMatch[1]);
    if (href && isGoogleDriveUrl(href)) return href;
  }

  ANCHOR_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANCHOR_PATTERN.exec(trimmed)) !== null) {
    const href = tryParseUrl(match[1] ?? "");
    if (href && isGoogleDriveUrl(href)) return href;
  }

  const fromPlain = extractUrlFromRichText(trimmed);
  if (fromPlain && isGoogleDriveUrl(fromPlain)) return fromPlain;

  const plain = looksLikeHtml(trimmed) ? stripHtmlToPlainText(trimmed) : trimmed;
  const bare = tryParseUrl(plain);
  if (bare && isGoogleDriveUrl(bare)) return bare;

  return null;
}

/** Remove auto-appended Drive paragraphs and Drive anchors from instruction HTML. */
export function stripGoogleDriveLinks(html: string): string {
  let next = html.replace(DRIVE_DOC_PARAGRAPH_PATTERN, "");
  next = next.replace(ANCHOR_PATTERN, (full, href: string) => {
    const parsed = tryParseUrl(href);
    if (parsed && isGoogleDriveUrl(parsed)) return "";
    return full;
  });
  return next.trim();
}

/** Combine instruction body HTML with an optional Google Drive share URL at the bottom. */
export function combineInstructionsContent(
  bodyHtml: string,
  driveUrl: string
): string {
  const body = stripGoogleDriveLinks(bodyHtml);
  const href = tryParseUrl(driveUrl);
  if (!href || !isGoogleDriveUrl(href)) {
    return body;
  }
  const safeHref = escapeHtmlAttr(href);
  const driveBlock = `<p data-drive-doc="1"><a href="${safeHref}">Google Drive document</a></p>`;
  return body ? `${body}${driveBlock}` : driveBlock;
}

export function splitInstructionsContent(html: string): {
  bodyHtml: string;
  driveUrl: string;
} {
  const driveUrl = extractGoogleDriveLink(html) ?? "";
  const bodyHtml = stripGoogleDriveLinks(html);
  return { bodyHtml, driveUrl };
}
