import { extractUrlFromHtml, isRichTextEmpty } from './rich-text-html';

/** @deprecated Use extractUrlFromHtml — kept for call-site clarity. */
export const extractUrlFromLocation = extractUrlFromHtml;

export function isLocationFieldEmpty(value: string): boolean {
  return isRichTextEmpty(value);
}
