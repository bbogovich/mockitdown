/**
 * Public entry points (port of `mockitdown.api`): `render`, `check`, `stylesheet` with the semantics
 * of the Python library API (R-WEB-001.C3), and `evaluate` for tools that need the view tree.
 */

import { assetsLoaded } from "./assets.js";
import { dirname } from "./components.js";
import { AssetResolver } from "./asset-resolver.js";
import { Diagnostic, Diagnostics, MockitdownError, MockitdownSyntaxError } from "./diagnostics.js";
import { Evaluator } from "./evaluate.js";
import type { Screen } from "./model.js";
import { renderOptions, type RenderOptions } from "./options.js";
import { registry } from "./packs/registry.js";
import { buildStylesheet } from "./styles.js";
import { Renderer, renderScreen } from "./render/index.js";
import { esc } from "./render/util.js";
import { parse } from "./syntax/parser.js";
import { pyStrip } from "./values.js";

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

/** What {@link render} returns (Python's `RenderResult`). */
export class RenderResult {
  /** The figure HTML (with the error box in front of it when there are errors to show). */
  readonly html: string;
  /** Every diagnostic, in the order reported. */
  readonly diagnostics: Diagnostic[];
  /** Ids of the packs the output needs CSS for, root first (empty when nothing rendered). */
  readonly packs: string[];
  /** The evaluated screen, or null after a syntax error. */
  readonly screen: Screen | null;

  constructor(html: string, diagnostics: Diagnostic[] = [], packs: string[] = [], screen: Screen | null = null) {
    this.html = html;
    this.diagnostics = diagnostics;
    this.packs = packs;
    this.screen = screen;
  }

  get errors(): Diagnostic[] {
    return this.diagnostics.filter((d) => d.severity === "error");
  }

  get ok(): boolean {
    return this.errors.length === 0;
  }
}

/** Render one mockup to an HTML fragment (no CSS; see {@link stylesheet}). */
export function render(source: string, options?: Partial<RenderOptions> | null): RenderResult {
  const opts = renderOptions(options);
  const { screen, diagnostics: diags } = evaluate(source, opts);
  if (screen === null) return new RenderResult(errorHtml(diags.items), diags.items);
  const assets = new AssetResolver(opts.asset_base, diags);
  const renderer = new Renderer(screen.pack, diags, assets);
  let body = renderScreen(screen, renderer, opts, diags, source);
  const shown = [...diags.errors, ...(opts.show_warnings ? diags.warnings : [])];
  const prefix = shown.length ? errorHtml(shown) : "";
  const packs = screen.pack.lineage().map((p) => p.id);
  if (opts.source) {
    body += '<details class="mkd-source"><summary>Source</summary><pre><code class="language-swift">'
      + `${esc(pyStrip(source))}</code></pre></details>`;
  }
  return new RenderResult(prefix + body, diags.items, packs, screen);
}

/** All diagnostics for `source` (rendering included, so asset and icon problems are found). */
export function check(source: string, options?: Partial<RenderOptions> | null): Diagnostic[] {
  return render(source, options).diagnostics;
}

/** The error box shown above a figure (`div.mkd-error`). */
export function errorHtml(items: readonly Diagnostic[]): string {
  const errors = items.filter((d) => d.severity === "error");
  const title = "mockitdown: " + (errors.length ? `${errors.length} error${errors.length !== 1 ? "s" : ""}` : "warnings");
  const lis = items.map((d) => `<li>${esc(String(d))}</li>`).join("");
  return `<div class="mkd-error" role="alert"><div class="mkd-error__title">${esc(title)}</div><ul>${lis}</ul></div>`;
}
