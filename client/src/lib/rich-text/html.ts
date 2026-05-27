import DOMPurify from "isomorphic-dompurify";
import { HTML_TAG_PATTERN } from "./constants";

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ["target", "rel"] as string[],
};

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const SANITIZE_CACHE_MAX = 256;
const sanitizeCache = new Map<string, string>();

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}

/** Strip tags and normalize whitespace — used for empty checks and URL fallback. */
export function stripHtmlToPlainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sanitize Quill HTML; links always open in a new tab. Results are cached for table cells. */
export function sanitizeRichTextHtml(html: string): string {
  const cached = sanitizeCache.get(html);
  if (cached !== undefined) return cached;

  const sanitized = DOMPurify.sanitize(html, SANITIZE_OPTIONS);

  if (sanitizeCache.size >= SANITIZE_CACHE_MAX) {
    const oldest = sanitizeCache.keys().next().value;
    if (oldest !== undefined) sanitizeCache.delete(oldest);
  }
  sanitizeCache.set(html, sanitized);

  return sanitized;
}
