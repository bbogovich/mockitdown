/**
 * The browser side of asset loading (A-WEB-2): fetch the shared assets the package publishes in
 * `dist/shared/` and hand them to the core once with `loadAssets` (the core itself fetches nothing,
 * A-WEB-1.K1). The custom elements call this before their first render; a page that uses the core
 * API directly calls it itself.
 *
 *   await loadAssetsFromUrl();                    // the package's own dist/shared/
 *   await loadAssetsFromUrl("/dist/shared/");     // or any URL serving the same layout
 */

import { loadAssets, type PackData, type SharedManifest } from "../core/index.js";

interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}
type Fetch = (url: string) => Promise<FetchResponse>;

export interface LoadAssetsOptions {
  /** The fetch function (default: the global `fetch`). */
  fetch?: Fetch;
}

const pending = new Map<string, Promise<SharedManifest>>();

/** The default base: the `shared/` folder beside this package's `dist/` modules. */
export function defaultAssetsUrl(): string {
  return new URL("../shared/", import.meta.url).href;
}

/**
 * Fetch `manifest.json` from `base`, then `vocabulary.json`, `page.css`, `icons.json` and, for every
 * pack the manifest lists, `packs/<id>/pack.json` and (when listed) `pack.css`; load them into the
 * core. Calls with the same base share one load; a failed load is forgotten so it can be retried.
 * Resolves to the manifest.
 */
export function loadAssetsFromUrl(base: string | URL = defaultAssetsUrl(), options: LoadAssetsOptions = {}): Promise<SharedManifest> {
  const g = globalThis as unknown as { fetch?: Fetch; location?: { href: string } };
  let href = new URL(String(base), g.location?.href).href;
  if (!href.endsWith("/")) href += "/";
  const known = pending.get(href);
  if (known && !options.fetch) return known;
  const fetcher = options.fetch ?? g.fetch;
  if (!fetcher) return Promise.reject(new Error("loadAssetsFromUrl: no fetch function"));
  const promise = load(href, fetcher);
  if (!options.fetch) {
    pending.set(href, promise);
    promise.catch(() => pending.delete(href));
  }
  return promise;
}

async function load(href: string, fetcher: Fetch): Promise<SharedManifest> {
  const get = async (path: string): Promise<string> => {
    const url = new URL(path, href).href;
    const res = await fetcher(url);
    if (!res.ok) throw new Error(`mockitdown: cannot load ${url} (HTTP ${res.status})`);
    return res.text();
  };
  const manifest = JSON.parse(await get("manifest.json")) as SharedManifest;
  const files = new Set(manifest.files);
  const [vocabulary, pageCss, icons, packs] = await Promise.all([
    get("vocabulary.json"),
    files.has("page.css") ? get("page.css") : Promise.resolve(""),
    files.has("icons.json") ? get("icons.json") : Promise.resolve(""),
    Promise.all(manifest.packs.map(async (id): Promise<[string, PackData]> => {
      const css = `packs/${id}/pack.css`;
      const [json, text] = await Promise.all([get(`packs/${id}/pack.json`), files.has(css) ? get(css) : Promise.resolve("")]);
      return [id, { json, css: text }];
    })),
  ]);
  loadAssets({ vocabulary, packs: new Map(packs), pageCss, icons: icons || undefined });
  return manifest;
}
