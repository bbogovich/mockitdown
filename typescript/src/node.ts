/**
 * `mockitdown/node`: feeds the core from the file system in Node (the core itself reads no files,
 * A-WEB-1.K1). `loadSharedAssets()` reads the shared assets the package publishes in
 * `dist/shared/` and hands them to `loadAssets`; `registerComponentFiles()` registers component
 * files from a directory for `import "path"`.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAssets, registerComponents, type PackData, type SharedManifest } from "./core/index.js";

export * from "./core/index.js";

/** The directory of the shared assets this package publishes (`dist/shared/`). */
export function sharedDir(): string {
  return fileURLToPath(new URL("./shared/", import.meta.url));
}

/** Read the shared assets from `dir` (default: the package's own) and load them into the core. */
export function loadSharedAssets(dir: string = sharedDir()): void {
  const read = (p: string): string => readFileSync(join(dir, p), "utf8");
  const manifest = JSON.parse(read("manifest.json")) as SharedManifest;
  const packs = new Map<string, PackData>();
  for (const id of manifest.packs) {
    const css = join(dir, "packs", id, "pack.css");
    packs.set(id, { json: read(join("packs", id, "pack.json")), css: existsSync(css) ? readFileSync(css, "utf8") : "" });
  }
  const roles = manifest.files.includes("roles.json") ? read("roles.json") : undefined;
  loadAssets({ vocabulary: read("vocabulary.json"), packs, pageCss: read("page.css"), icons: read("icons.json"), roles });
}

/**
 * Register every `.mockitdown` file under `dir` as a component, named by its path relative to
 * `dir` (`components/pill.mockitdown`), so imports resolve as against an import path `dir`.
 */
export function registerComponentFiles(dir: string, prefix = ""): string[] {
  const names: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d).sort()) {
      const p = join(d, entry);
      if (entry.endsWith(".mockitdown")) {
        const name = (prefix ? prefix + "/" : "") + relative(dir, p).split("\\").join("/");
        registerComponents(name, readFileSync(p, "utf8"));
        names.push(name);
      } else if (!entry.includes(".")) {
        try {
          walk(p);
        } catch {
          // not a directory
        }
      }
    }
  };
  walk(dir);
  return names;
}
