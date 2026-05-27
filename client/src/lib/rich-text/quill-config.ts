/** Shared Quill toolbar — single source of truth for all editors in the app. */
export const QUILL_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
] as const;

/** Mutable copy for ReactQuill prop typing. */
export const QUILL_FORMATS: string[] = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "link",
];

/** Stable reference — avoids re-init on every ReactQuill render. */
export const QUILL_MODULES = {
  toolbar: QUILL_TOOLBAR,
} as const;
