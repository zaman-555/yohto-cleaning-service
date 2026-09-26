"use client";

import { memo, useMemo, type MouseEvent } from "react";
import {
  handleRichTextLinkClick,
  looksLikeHtml,
  normalizeRichTextForWrap,
  sanitizeRichTextHtml,
} from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  html: string;
  className?: string;
  /** Use span wrapper for inline contexts (e.g. inside links). */
  inline?: boolean;
  /**
   * Weekly showcase: normalize Quill spaces and apply wrap-at-words styles
   * so sentences break only at word boundaries.
   */
  wrapAtWords?: boolean;
};

function RichTextContentComponent({
  html,
  className,
  inline = false,
  wrapAtWords = false,
}: RichTextContentProps) {
  const prepared = wrapAtWords ? normalizeRichTextForWrap(html) : html;
  const isHtml = looksLikeHtml(prepared);
  const sanitized = useMemo(
    () => (isHtml ? sanitizeRichTextHtml(prepared) : null),
    [prepared, isHtml]
  );

  if (!isHtml) {
    return (
      <span
        className={cn(
          "whitespace-pre-wrap [overflow-wrap:break-word] [word-break:normal]",
          wrapAtWords && "weekly-rich-text whitespace-normal",
          className
        )}
      >
        {prepared}
      </span>
    );
  }

  const onClick = (event: MouseEvent<HTMLElement>) => {
    handleRichTextLinkClick(event);
  };

  const shared = {
    className: cn(
      "rich-text-content font-normal text-inherit [overflow-wrap:break-word] [word-break:normal]",
      wrapAtWords && "weekly-rich-text",
      className
    ),
    dangerouslySetInnerHTML: { __html: sanitized! },
    onClick,
  };

  return inline ? <span {...shared} /> : <div {...shared} />;
}

export const RichTextContent = memo(RichTextContentComponent);
