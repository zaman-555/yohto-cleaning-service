"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import {
  attachRichTextLinkClick,
  QUILL_FORMATS,
  QUILL_MODULES,
} from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import "quill/dist/quill.snow.css";

/** Loads with the parent editor chunk when the dialog opens. */
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return attachRichTextLinkClick(root);
  }, []);

  return (
    <div
      ref={rootRef}
      id={id}
      className={cn("rich-text-editor", className)}
      data-disabled={disabled ? "" : undefined}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  );
}
