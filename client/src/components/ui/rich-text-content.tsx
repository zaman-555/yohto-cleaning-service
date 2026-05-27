"use client";

import { memo, useMemo, type MouseEvent } from "react";
import {
  handleRichTextLinkClick,
  looksLikeHtml,
  sanitizeRichTextHtml,
} from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  html: string;
  className?: string;
  /** Use span wrapper for inline contexts (e.g. inside links). */
  inline?: boolean;
};

function RichTextContentComponent({
  html,
  className,
  inline = false,
}: RichTextContentProps) {
  const isHtml = looksLikeHtml(html);
  const sanitized = useMemo(
    () => (isHtml ? sanitizeRichTextHtml(html) : null),
    [html, isHtml]
  );

  if (!isHtml) {
    return (
      <span className={cn("whitespace-pre-wrap break-words", className)}>{html}</span>
    );
  }

  const onClick = (event: MouseEvent<HTMLElement>) => {
    handleRichTextLinkClick(event);
  };

  const shared = {
    className: cn("rich-text-content break-words font-normal text-inherit", className),
    dangerouslySetInnerHTML: { __html: sanitized! },
    onClick,
  };

  return inline ? <span {...shared} /> : <div {...shared} />;
}

export const RichTextContent = memo(RichTextContentComponent);
