/**
 * The `mockitdown` package entry (A-WEB-2). It re-exports the core and the browser asset loader
 * `loadAssetsFromUrl`, and — where the host has `customElements` — defines the custom elements
 * (`mockitdown-mockup`, R-WEB-002.C1). Importing it in Node defines nothing.
 */

import { defineElements } from "./elements/mockup.js";

export * from "./core/index.js";
export { defaultAssetsUrl, loadAssetsFromUrl, type LoadAssetsOptions } from "./elements/assets.js";
export {
  clearImportCache, defineElements, DIAGNOSTICS_EVENT, ELEMENT_TAGS, MOCKUP_ATTRIBUTES, MOCKUP_TAG,
  MockupElement, SCRIPT_TYPE, scriptCode, shadowCss,
} from "./elements/mockup.js";

defineElements();
