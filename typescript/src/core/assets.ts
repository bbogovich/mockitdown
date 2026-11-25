/**
 * The shared assets as data (A-WEB-1.K1: the core reads no files and fetches nothing).
 *
 * The package publishes `shared/` under `dist/shared/` (R-WEB-001.C2): the packs
 * (`packs/<id>/pack.json`, `pack.css`), the page stylesheet `page.css`, the icon table `icons.json`,
 * the modifier vocabulary `vocabulary.json`, and `manifest.json` listing the pack ids. Whoever hosts
 * the core reads them — `mockitdown/node` from the file system, the custom elements by `fetch` —
 * and hands them over once with {@link loadAssets}.
 */

import { parseJson } from "./json.js";
import { registry, type PackData } from "./packs/registry.js";
import { PyDict } from "./values.js";
import { setVocabulary } from "./vocabulary.js";

export interface SharedAssets {
  /** The text of `vocabulary.json` (or its parsed value). */
  vocabulary: string | { rendered?: unknown; ignored?: unknown; neutral_modules?: unknown };
  /** The built-in packs, id → data. */
  packs: ReadonlyMap<string, PackData> | Record<string, PackData>;
  /** The text of `page.css`. */
  pageCss?: string;
  /** The text of `icons.json`. */
  icons?: string;
}

/** `dist/shared/manifest.json`: what the package publishes, for loaders. */
export interface SharedManifest {
  packs: string[];
  files: string[];
}

let page = "";
let icons: PyDict<unknown> = new PyDict();
let loaded = false;

/** Install the shared assets: the vocabulary, the built-in packs, the page stylesheet and icons. */
export function loadAssets(assets: SharedAssets): void {
  setVocabulary(assets.vocabulary);
  registry.setBuiltin(assets.packs);
  page = assets.pageCss ?? "";
  const table = assets.icons ? parseJson(assets.icons) : null;
  icons = table instanceof PyDict ? table : new PyDict();
  loaded = true;
}

/** Whether {@link loadAssets} has run. */
export function assetsLoaded(): boolean {
  return loaded;
}

/** The page stylesheet (`page.css`). */
export function pageCss(): string {
  return page;
}

/** The icon table (`icons.json`) as Python values. */
export function iconTable(): PyDict<unknown> {
  return icons;
}
