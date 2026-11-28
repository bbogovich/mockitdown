/**
 * Document assembly: an evaluated screen → the figure HTML placed in the page (port of
 * `mockitdown.render`).
 *
 *     div.mkd-figure.mkd-pack-<id>[role=figure][data-pack][data-device][data-appearance]
 *       div.mkd-stage                        one cell per rendered appearance
 *         div.mkd-cell
 *           div.mkd-frame[data-appearance][data-device][data-chrome][data-window][data-titlebar][data-windowed]
 *                        [data-menubar]  style="--mkd-w;--mkd-h" | data-fit
 *             div.mkd-chrome …                  top chrome (the window's traffic lights when windowed)
 *             div.mkd-screen                    the views, then div.mkd-layer overlays
 *             div.mkd-chrome …                  bottom chrome
 *           with the macOS menu bar (data-menubar), the frame holds div.mkd-menubar (see ./menubar.ts) and
 *           div.mkd-window[data-titlebar], which holds the top chrome, the screen and the bottom chrome
 *           div.mkd-cell__label                 "Light" / "Dark" when appearance=both
 *       div.mkd-caption                         "<id> · <title>"
 *       table.mkd-elements                      optional Elements table
 */

import type { Diagnostics } from "../diagnostics.js";
import { walk, type Screen, type View } from "../model.js";
import { DEVICES, parseBool, type RenderOptions } from "../options.js";
import { sha1Hex } from "../sha1.js";
import { intStr, pyBool, pyRepr, pyStr, strRepr, strTitle } from "../values.js";
import * as chromeMod from "./chrome.js";
import * as menubarMod from "./menubar.js";
import { Renderer, RENDER_ROLES } from "./html.js";
import { bool, esc, name } from "./util.js";

export { Renderer, RENDER_ROLES };

function metaStr(screen: Screen, key: string): string | null {
  return pyBool(screen.meta.get(key, null)) ? pyStr(screen.meta.get(key)) : null;
}

function resolveDevice(screen: Screen, opts: RenderOptions, diags: Diagnostics): [string, readonly [number, number] | null] {
  let device = opts.device || metaStr(screen, "device") || opts.default_device || screen.pack.device;
  if (device === "fit") return ["fit", null];
  if (opts.width && opts.height) return [device, [opts.width, opts.height]];
  let size = screen.pack.sizes.get(device) ?? DEVICES.get(device) ?? null;
  if (size === null) {
    diags.warning(`unknown device ${strRepr(device)}; using desktop (known: ${[...DEVICES.keys(), "fit"].join(", ")})`, null, "device");
    device = "desktop";
    size = screen.pack.sizes.get(device) ?? DEVICES.get(device)!;
  }
  if (opts.width || opts.height) size = [opts.width || size[0], opts.height || size[1]];
  return [device, size];
}

/**
 * The figure's CSS anchor prefix (R-ANN-003): the first six hex digits of the SHA-1 of the pack id,
 * a line feed and the block source, as UTF-8 — portable, so every variant names anchors alike.
 */
export function anchorPrefix(packId: string, source: string): string {
  return sha1Hex(`${packId}\n${source}`).slice(0, 6);
}

/**
 * How the macOS title bar meets the root view (R-DEV-010.C2): "unified" when the root draws its own toolbar
 * row (a NavigationStack with a title or toolbar, a NavigationSplitView, a sidebar-adaptable TabView),
 * "toolbar" when the root carries `.navigationTitle` or `.toolbar` that the title bar draws, otherwise ""
 * (a centred window title).
 */
export function titlebarMode(views: readonly View[], renderer: Renderer): string {
  if (!views.length) return "";
  const root = views[0];
  if (root.role === "split") return "unified";
  if (root.role === "tabs") return name(root.attr(["variant"])) === "sidebarAdaptable" ? "unified" : "";
  if (root.role === "navstack") {
    if (bool(root.attr(["hideNavigationBar"]))) return "";
    const has = pyBool(root.attr(["title"])) || renderer.findMod(root.children, "navigationTitle") !== null
      || renderer.findMod(root.children, "toolbar") !== null;
    return has ? "unified" : "";
  }
  if (renderer.findMod([root], "navigationTitle") !== null || renderer.findMod([root], "toolbar") !== null) return "toolbar";
  return "";
}

/** The root's navigation title and its leading and trailing toolbar items, rendered for the title bar. */
function titleToolbar(views: readonly View[], renderer: Renderer): [string, string, string] {
  let titleHtml = "";
  const titleView = renderer.findMod(views.slice(0, 1), "navigationTitle");
  if (titleView !== null) {
    const m = titleView.mod("navigationTitle")!;
    titleHtml = m.args.length ? renderer.content(m.arg()) : renderer.views(m.content ?? []);
  }
  const tbViews: View[] = [];
  const holder = renderer.findMod(views.slice(0, 1), "toolbar");
  if (holder !== null) {
    for (const m of holder.modifiers) if (m.name === "toolbar" && m.content && m.content.length) tbViews.push(...m.content);
  }
  const groups = renderer.toolbarItems(tbViews);
  return [titleHtml, renderer.views(groups.leading), renderer.views([...groups.principal, ...groups.trailing])];
}

export function renderScreen(screen: Screen, renderer: Renderer, opts: RenderOptions, diags: Diagnostics, source = ""): string {
  const pack = screen.pack;
  const [device, size] = resolveDevice(screen, opts, diags);
  let appearance = opts.appearance || metaStr(screen, "appearance") || opts.default_appearance;
  if (!["light", "dark", "auto", "both"].includes(appearance)) {
    diags.warning(`unknown appearance ${strRepr(appearance)}; using light`, null, "appearance");
    appearance = "light";
  }
  let chrome: unknown = opts.chrome !== "" && opts.chrome !== "auto" ? opts.chrome : pyStr(screen.meta.get("chrome", "auto"));
  if (chrome === "auto") chrome = pack.chromeFor(device);
  if (!(chromeMod.CHROME_KINDS as readonly unknown[]).includes(chrome)) {
    diags.warning(`unknown chrome ${pyRepr(chrome)} (known: ${chromeMod.CHROME_KINDS.join(", ")})`, null, "chrome");
    chrome = "none";
  }
  const chromeKind = chrome as string;
  const metaOr = (key: string): string => {
    const x = screen.meta.get(key, null);
    return pyStr(pyBool(x) ? x : "");
  };
  const title = opts.title || metaOr("title");
  const sid = opts.id || metaOr("id");
  const url = opts.url || metaStr(screen, "url");
  const windowKind = opts.window || metaStr(screen, "window");
  let windowAttr = windowKind ? ` data-window="${esc(windowKind)}"` : "";
  let windowed = opts.windowed !== null && opts.windowed !== undefined ? opts.windowed : parseBool(screen.meta.get("windowed", false));
  if (windowed && chromeKind !== "ipados") {
    diags.warning("windowed needs iPadOS chrome; ignored", null, "chrome");
    windowed = false;
  }
  if (windowed) windowAttr += ' data-windowed="true"';
  let [menubar, menuTitle] = menubarMod.option(opts.menubar !== null && opts.menubar !== undefined
    ? opts.menubar : screen.meta.get("menubar", false));
  if (menubar && chromeKind !== "macos") {
    diags.warning("menubar needs macOS chrome", null, "chrome");
    menubar = false;
  }

  renderer.anchorPrefix = anchorPrefix(pack.id, source);
  const mode = chromeKind === "macos" ? titlebarMode(screen.views, renderer) : "";
  if (mode) windowAttr += ` data-titlebar="${mode}"`;
  if (menubar) windowAttr += ' data-menubar="true"';
  // The menu bar, then the title bar's toolbar are rendered before the body, in document order (anchors
  // number alike).
  let bar = "";
  if (menubar) {
    const appMeta = screen.meta.get("app", null);
    const app = opts.app || (pyBool(appMeta) ? metaText(appMeta) : "") || title || "App";
    bar = menubarMod.render(screen.views, renderer, app, menuTitle, diags);
  }
  const toolbar = mode === "toolbar" ? titleToolbar(screen.views, renderer) : null;
  const body = renderer.views(screen.views);
  const overlays = renderer.overlays.join("");
  const screenHtml = `<div class="mkd-screen">${body}${overlays}</div>`;
  let frameInner = chromeMod.top(chromeKind, title, url, { windowed, toolbar }) + screenHtml + chromeMod.bottom(chromeKind);
  if (menubar) {
    // The macOS menu bar (R-DEV-009.C9) above the window, which keeps its form below it.
    const titlebar = mode ? ` data-titlebar="${mode}"` : "";
    frameInner = `${bar}<div class="mkd-window"${titlebar}>${frameInner}</div>`;
  }

  const dims = size === null ? ' data-fit="true"' : ` style="--mkd-w:${intStr(Math.trunc(size[0]))};--mkd-h:${intStr(Math.trunc(size[1]))}"`;
  const modes = appearance === "both" ? ["light", "dark"] : [appearance];
  const cells = modes.map((mode) => {
    const label = appearance === "both" ? `<div class="mkd-cell__label">${strTitle(mode)}</div>` : "";
    return `<div class="mkd-cell"><div class="mkd-frame" data-appearance="${mode}" `
      + `data-device="${esc(device)}" data-chrome="${esc(chromeKind)}"${windowAttr}${dims}>${frameInner}</div>${label}</div>`;
  });
  let caption = "";
  if (opts.caption && (title || sid)) caption = `<div class="mkd-caption">${esc([sid, title].filter((x) => x).join(" · "))}</div>`;
  const table = opts.elements ? elementsTable(screen) : "";
  const aria = ` aria-label="${esc(title || sid || pack.name + " mockup")}"`;
  return `<div class="mkd-figure mkd-pack-${esc(pack.id)}" role="figure"${aria} data-pack="${esc(pack.id)}" `
    + `data-device="${esc(device)}" data-appearance="${esc(appearance)}">`
    + `<div class="mkd-stage" data-count="${cells.length}">${cells.join("")}</div>${caption}${table}</div>`;
}

function metaText(value: unknown): string {
  return value === true ? "true" : value === false ? "false" : pyStr(value);
}

/** The Elements table: one row per view carrying `.id()`, with its element, struct and refs. */
export function elementsTable(screen: Screen): string {
  const rows: string[] = [];
  for (const v of walk(screen.views)) {
    const m = v.mod("id");
    if (m === null || m.arg() === null) continue;
    const ref = v.mod("ref");
    const refs = ref ? ref.args.map((a) => pyStr(a)).join(" ") : "";
    rows.push(`<tr><td><code>${esc(m.arg())}</code></td><td>${esc(v.name)}</td>`
      + `<td>${esc(v.component)}</td><td>${esc(refs)}</td></tr>`);
  }
  if (!rows.length) return "";
  return '<table class="mkd-elements"><thead><tr><th>ID</th><th>Element</th><th>Component</th><th>Refs</th>'
    + `</tr></thead><tbody>${rows.join("")}</tbody></table>`;
}
