/**
 * The `mockitdown` package entry (A-WEB-2). It re-exports the core and the browser asset loader
 * `loadAssetsFromUrl`, and — where the host has `customElements` — defines the custom elements
 * (`mockitdown-mockup`, R-WEB-002.C1; `mockitdown-editor`, R-TOOL-001; `mockitdown-outline`, R-TOOL-002; `mockitdown-designer`, R-TOOL-003). Importing it in Node defines nothing.
 */

import { defineElements } from "./elements/define.js";

export * from "./core/index.js";
export { defaultAssetsUrl, loadAssetsFromUrl, type LoadAssetsOptions } from "./elements/assets.js";
export {
  clearImportCache, DIAGNOSTICS_EVENT, MOCKUP_ATTRIBUTES, MOCKUP_TAG, MockupElement, SCRIPT_TYPE, scriptCode, shadowCss,
} from "./elements/mockup.js";
export {
  EDITOR_ATTRIBUTES, EDITOR_TAG, EditorElement, elementName, sizeTag,
} from "./elements/editor.js";
export {
  DEFAULT_LAYOUT, DESIGNER_ATTRIBUTES, DESIGNER_MODES, DESIGNER_SLOTS, DESIGNER_TAG, DesignerElement, designerMode, DesignOpenError,
  PANEL_MAX, PANEL_MIN, PREVIEW_APPEARANCES,
  type DesignerLayout, type DesignerLayoutUpdate, type DesignerMode, type PreviewAppearance,
} from "./elements/designer.js";
export { OUTLINE_ATTRIBUTES, OUTLINE_INDENT, OUTLINE_TAG, OutlineElement, type OutlineRow } from "./elements/outline.js";
export { defineElements, ELEMENT_TAGS } from "./elements/define.js";

defineElements();
