import { RICH_TEXT_PLACEHOLDER } from "./constants";
import { looksLikeHtml, stripHtmlToPlainText } from "./html";

/** True when HTML or plain text has no meaningful content (e.g. empty Quill `<p><br></p>`). */
export function isRichTextEmpty(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!looksLikeHtml(trimmed)) return false;
  return stripHtmlToPlainText(trimmed).length === 0;
}

export function hasRichTextContent(value: string | undefined | null): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === RICH_TEXT_PLACEHOLDER) return false;
  return !isRichTextEmpty(trimmed);
}
