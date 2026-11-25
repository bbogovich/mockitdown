/**
 * Public entry points (port of `mockitdown.api`). This part of the port provides `evaluate` and
 * `stylesheet`; `render` and `check` follow with the renderer (R-WEB-001.C3).
 */

import { assetsLoaded } from "./assets.js";
import { dirname } from "./components.js";
import { Diagnostics, MockitdownError, MockitdownSyntaxError } from "./diagnostics.js";
import { Evaluator } from "./evaluate.js";
import type { Screen } from "./model.js";
import { renderOptions, type RenderOptions } from "./options.js";
import { registry } from "./packs/registry.js";
import { buildStylesheet } from "./styles.js";
import { parse } from "./syntax/parser.js";

function requireAssets(): void {
  if (!assetsLoaded() && registry.ids().length === 0) {
    throw new MockitdownError("no packs are loaded: call loadAssets() (or mockitdown/node's loadSharedAssets()) first");
  }
}

export interface Evaluation {
  /** The evaluated screen, or null after a syntax error. */
  screen: Screen | null;
  diagnostics: Diagnostics;
}

/** Parse and evaluate `source`. The screen is null on a syntax error. */
export function evaluate(source: string, options?: Partial<RenderOptions> | null,
  diagnostics?: Diagnostics): Evaluation {
  requireAssets();
  const opts = renderOptions(options);
  const diags = diagnostics ?? new Diagnostics();
  const srcName = opts.source_path ? opts.source_path : "";
  let module;
  try {
    module = parse(source, srcName);
  } catch (e) {
    if (e instanceof MockitdownSyntaxError) {
      diags.extend([e.diagnostic]);
      return { screen: null, diagnostics: diags };
    }
    throw e;
  }
  const baseDir = opts.source_path ? dirname(opts.source_path) : null;
  const ev = new Evaluator(registry, diags, {
    default_pack: opts.default_pack, pack_override: opts.pack,
    imports: { search_paths: [...opts.import_paths], base_dir: baseDir, resolver: opts.import_resolver },
  });
  return { screen: ev.evaluate(module), diagnostics: diags };
}

/** CSS for the given pack ids (all known packs when null), their ancestors included once. */
export function stylesheet(packs?: readonly string[] | null, { minify = true }: { minify?: boolean } = {}): string {
  requireAssets();
  return buildStylesheet(packs ?? registry.ids(), registry, { minify });
}
