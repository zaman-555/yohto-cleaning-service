type LinkClickEvent = Pick<
  MouseEvent,
  "target" | "preventDefault" | "stopPropagation"
>;

/**
 * Opens rich-text links in a new tab. When `root` is set, only handles clicks inside it
 * (used by the Quill editor wrapper).
 */
export function handleRichTextLinkClick(
  event: LinkClickEvent,
  root?: HTMLElement | null
): void {
  const anchor = (event.target as HTMLElement).closest("a");
  if (!anchor?.href) return;
  if (root && !root.contains(anchor)) return;

  event.preventDefault();
  event.stopPropagation();
  window.open(anchor.href, "_blank", "noopener,noreferrer");
}

/** Delegated link handler for editor roots; returns cleanup for useEffect. */
export function attachRichTextLinkClick(root: HTMLElement): () => void {
  const onClick = (event: MouseEvent) => handleRichTextLinkClick(event, root);
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
