/**
 * The `mockitdown` package entry (R-WEB-002.C1 makes it define the custom elements once they exist).
 * It re-exports the core and the browser asset loader `loadAssetsFromUrl` (A-WEB-2).
 */

export * from "./core/index.js";
export { defaultAssetsUrl, loadAssetsFromUrl, type LoadAssetsOptions } from "./elements/assets.js";
