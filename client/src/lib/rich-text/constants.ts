/** Placeholder shown in empty weekly cells. */
export const RICH_TEXT_PLACEHOLDER = "—";

/** Detects HTML tags (Quill output or manual markup). */
export const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

/** Extracts first `href` from HTML. */
export const HREF_ATTR_PATTERN = /href\s*=\s*["']([^"']+)["']/i;
