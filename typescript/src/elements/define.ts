/**
 * The package's custom elements (R-WEB-002.C1, A-WEB-5.P1): their tags, each beginning with
 * `mockitdown-`, and {@link defineElements}, which the package entry calls where the host has
 * `customElements`.
 */

import { CODE_TAG, CodeElement } from "./code.js";
import { DESIGNER_TAG, DesignerElement } from "./designer.js";
import { EDITOR_TAG, EditorElement } from "./editor.js";
import { GALLERY_TAG, GalleryElement } from "./gallery.js";
import { INSPECTOR_TAG, InspectorElement } from "./inspector.js";
import { MOCKUP_TAG, MockupElement } from "./mockup.js";
import { OUTLINE_TAG, OutlineElement } from "./outline.js";

/** The tags of every custom element the package defines (each begins with `mockitdown-`). */
export const ELEMENT_TAGS: readonly string[] = [MOCKUP_TAG, DESIGNER_TAG, EDITOR_TAG, OUTLINE_TAG, GALLERY_TAG, INSPECTOR_TAG, CODE_TAG];

const CLASSES: readonly [string, CustomElementConstructor][] = [
  // The designer first, so that components inside it find its session when they connect.
  [MOCKUP_TAG, MockupElement], [DESIGNER_TAG, DesignerElement], [EDITOR_TAG, EditorElement], [OUTLINE_TAG, OutlineElement],
  [GALLERY_TAG, GalleryElement], [INSPECTOR_TAG, InspectorElement], [CODE_TAG, CodeElement],
];

/** Define the package's custom elements, where the host has `customElements`; idempotent. */
export function defineElements(): void {
  const registry = (globalThis as { customElements?: CustomElementRegistry }).customElements;
  if (!registry) return;
  for (const [tag, cls] of CLASSES) if (!registry.get(tag)) registry.define(tag, cls);
}
