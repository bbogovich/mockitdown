/**
 * The macOS menu bar (R-DEV-009): the bar above a `macos` window and its one open menu (port of
 * `mockitdown.render.menubar`).
 *
 *     div.mkd-menubar[role=menubar]
 *       span.mkd-menubar__apple                    the Apple menu glyph
 *       span.mkd-menubar__menu[data-menu=app][data-open=true]
 *         span.mkd-menubar__title                  the application name (bold), then each menu's title
 *         span.mkd-menubar__dropdown[role=menu]    the open menu only
 *           span.mkd-menubar__item[role=menuitem][data-state=disabled][data-checked][data-submenu][data-open]
 *             span.mkd-menubar__check  span.mkd-menubar__icon  span.mkd-menubar__label
 *             span.mkd-menubar__key    span.mkd-menubar__chevron
 *             span.mkd-menubar__dropdown.mkd-menubar__dropdown--sub   an open submenu
 *           span.mkd-menubar__sep[role=separator]  span.mkd-menubar__header
 *       span.mkd-menubar__gap
 *       span.mkd-menubar__status                   battery, Wi-Fi, Control Center, span.mkd-menubar__clock
 *
 * The standard menus (App, File, Edit, View, Window, Help) are data in `vocabulary.json` (`menubar`);
 * `.commands { CommandMenu … CommandGroup … }` on the root view adds menus and edits placements.
 */

import type { Diagnostics } from "../diagnostics.js";
import { iconSvg } from "../icons.js";
import { EnumValue, type View } from "../model.js";
import { isSeq, pyStrip } from "../values.js";
import { MENUBAR, type MenubarItem } from "../vocabulary.js";
import type { Renderer } from "./html.js";
import { bool, esc, fmt, isIn, name } from "./util.js";

/** Modifier glyphs in the order macOS draws them. */
const MODIFIER_GLYPHS: readonly (readonly [string, string])[] = [["control", "⌃"], ["option", "⌥"], ["shift", "⇧"], ["command", "⌘"]];
const MODIFIER_NAMES: Record<string, string> = {
  control: "control", ctrl: "control", option: "option", alt: "option", shift: "shift", command: "command", cmd: "command",
};
/** KeyEquivalent members and KeyboardShortcut presets → the glyph macOS draws. */
const KEY_GLYPHS: Record<string, string> = {
  return: "↩", defaultAction: "↩", escape: "⎋", cancelAction: "⎋", delete: "⌫", deleteForward: "⌦", tab: "⇥",
  space: "Space", upArrow: "↑", downArrow: "↓", leftArrow: "←", rightArrow: "→", home: "↖", end: "↘", pageUp: "⇞",
  pageDown: "⇟", clear: "⌧",
};
/** Presets that carry no modifier. */
const BARE = ["defaultAction", "cancelAction"];

interface Row {
  kind: "item" | "sep" | "header";
  label: string;
  key: string;
  icon: string;
  checked: boolean;
  disabled: boolean;
  submenu: Row[] | null;
  open: boolean;
}

interface Menu {
  title: string;
  titleHtml: string;
  rows: Row[];
  app: boolean;
  open: boolean;
}

function row(kind: Row["kind"], init: Partial<Row> = {}): Row {
  return { kind, label: "", key: "", icon: "", checked: false, disabled: false, submenu: null, open: false, ...init };
}

function has(o: Record<string, string>, k: string): boolean {
  return Object.prototype.hasOwnProperty.call(o, k);
}

/** The `menubar` option (C1) → [shown, title of the menu drawn open]. */
export function option(value: unknown): [boolean, string] {
  if (value === null || value === undefined || value === false) return [false, ""];
  if (value === true) return [true, ""];
  const text = pyStrip(fmt(value));
  if (["", "true"].includes(text.toLowerCase())) return [true, ""];
  if (text.toLowerCase() === "false") return [false, ""];
  return [true, text];
}

/** `.keyboardShortcut("c", modifiers: [.shift, .command])` → `⇧⌘C` (C7): ⌃⌥⇧⌘, then the key. */
export function shortcut(key: unknown, modifiers: unknown = null): string {
  const n = name(key);
  const glyph = key instanceof EnumValue ? (has(KEY_GLYPHS, n) ? KEY_GLYPHS[n] : n.toUpperCase()) : n.toUpperCase();
  if (!glyph) return "";
  let mods: string[];
  if (modifiers === null || modifiers === undefined) mods = BARE.includes(n) ? [] : ["command"];
  else {
    const items = isSeq(modifiers) ? modifiers : [modifiers];
    mods = items.map((m) => { const k = name(m); return has(MODIFIER_NAMES, k) ? MODIFIER_NAMES[k] : ""; });
  }
  return MODIFIER_GLYPHS.filter(([m]) => mods.includes(m)).map(([, g]) => g).join("") + glyph;
}

function stdShortcut(item: MenubarItem): string {
  if (item.key === undefined) return "";
  return shortcut(item.key, item.modifiers ?? null);
}

function stdRows(items: readonly MenubarItem[], app: string): Row[] {
  return items.map((i) => row("item", {
    label: esc(String(i.title).split("{app}").join(app)), key: stdShortcut(i), submenu: i.submenu ? [] : null,
  }));
}

function viewShortcut(v: View): string {
  const m = v.mod("keyboardShortcut");
  if (m !== null && m.args.length) return shortcut(m.arg(), m.kwargs.get("modifiers", null));
  const s = v.attr(["shortcut", "keyboardShortcut"]);
  return !isIn(s, [null, ""]) ? fmt(s) : "";
}

/** The rows a menu's views draw (C7): Button, Divider, Menu (submenu), Toggle (checkmark), disabled. */
function viewRows(views: readonly View[], r: Renderer): Row[] {
  const out: Row[] = [];
  for (const v of views) {
    const role = v.role;
    if (role === "divider") out.push(row("sep"));
    else if (role === "group") out.push(...viewRows(v.children, r));
    else if (role === "section") {
      const header = r.textOrSlot(v, "title", "header", "label");
      if (header) out.push(row("header", { label: header }));
      out.push(...viewRows(v.children, r));
    } else if (role === "menu") {
      const label = r.textOrSlot(v, "label", "title");
      const icon = v.attr(["systemImage", "icon"]);
      out.push(row("item", {
        label, icon: icon !== null ? r.icon(icon, "mkd-icon", v) : "", disabled: bool(v.attr(["disabled"])),
        submenu: viewRows(v.children, r), open: bool(v.attr(["open", "isOpen", "isPresented", "expanded"])),
      }));
    } else if (role === "toggle") {
      const label = r.textOrSlot(v, "label", "title") || r.views(v.children);
      out.push(row("item", {
        label, key: viewShortcut(v), checked: bool(v.attr(["isOn", "on", "checked", "value", "selected"])),
        disabled: bool(v.attr(["disabled"])),
      }));
    } else if (["button", "menuitem", "link"].includes(role)) {
      const label = r.textOrSlot(v, "label", "title", "text") || r.views(v.children);
      const icon = v.attr(["systemImage", "icon"]);
      out.push(row("item", {
        label, key: viewShortcut(v), icon: icon !== null ? r.icon(icon, "mkd-icon", v) : "",
        checked: bool(v.attr(["checked"])), disabled: bool(v.attr(["disabled"])),
      }));
    }
  }
  return out;
}

/** No separator first, last or twice in a row. */
function tidy(rows: readonly Row[]): Row[] {
  const out: Row[] = [];
  for (const x of rows) {
    if (x.kind === "sep" && (!out.length || out[out.length - 1].kind === "sep")) continue;
    out.push(x);
  }
  while (out.length && out[out.length - 1].kind === "sep") out.pop();
  return out;
}

function hasOpen(rows: readonly Row[]): boolean {
  return rows.some((x) => x.open || (x.submenu !== null && x.submenu.length > 0 && hasOpen(x.submenu)));
}

/** Every placement a CommandGroup may name (C5). */
export function placements(): string[] {
  const out: string[] = [];
  for (const m of MENUBAR.menus) {
    for (const e of m.entries) if (e !== "-" && e.placement) out.push(e.placement);
  }
  return out;
}

function commands(views: readonly View[], r: Renderer): View[] {
  const holder = r.findMod(views, "commands");
  if (holder === null) return [];
  const out: View[] = [];
  for (const m of holder.modifiers) if (m.name === "commands" && m.content && m.content.length) out.push(...m.content);
  return out;
}

interface Edit { replacing: Row[] | null; before: Row[]; after: Row[] }

/** The menus of the bar, left to right (C5, C6): the standard menus with the commands merged in. */
function build(views: readonly View[], r: Renderer, app: string, diags: Diagnostics): Menu[] {
  const known = new Set(placements());
  const edits = new Map<string, Edit>();
  const custom: Menu[] = [];

  const collect = (vs: readonly View[]): void => {
    for (const v of vs) {
      if (v.name === "CommandGroup") {
        let kind = "";
        let placement = "";
        for (const k of ["replacing", "before", "after"]) {
          if (v.attr([k]) !== null) {
            kind = k;
            placement = name(v.attr([k]));
            break;
          }
        }
        if (!kind) {
          diags.warning("CommandGroup needs replacing:, before: or after:; ignored", v.loc, "chrome");
          continue;
        }
        if (!known.has(placement)) {
          diags.warning(`CommandGroup placement ".${placement}" is unknown; ignored`, v.loc, "chrome");
          continue;
        }
        if (!edits.has(placement)) edits.set(placement, { replacing: null, before: [], after: [] });
        const e = edits.get(placement)!;
        const rows = viewRows(v.children, r);
        if (kind === "replacing") e.replacing = rows;
        else e[kind as "before" | "after"].push(...rows);
      } else if (v.role === "menu") {
        const title = fmt(v.attr(["label", "title"]));
        const rows = viewRows(v.children, r);
        custom.push({
          title, titleHtml: r.textOrSlot(v, "label", "title"), rows, app: false,
          open: bool(v.attr(["open", "isOpen", "isPresented", "expanded"])),
        });
      } else if (v.role === "group") collect(v.children);
    }
  };

  collect(commands(views, r));
  const menus: Menu[] = [];
  for (const spec of MENUBAR.menus) {
    if (spec.id === "window") menus.push(...custom);
    const rows: Row[] = [];
    for (const entry of spec.entries) {
      if (entry === "-") {
        rows.push(row("sep"));
        continue;
      }
      const e = edits.get(entry.placement ?? "");
      const base = stdRows(entry.items ?? [], app);
      if (e === undefined) rows.push(...base);
      else {
        rows.push(...e.before);
        rows.push(...(e.replacing === null ? base : e.replacing));
        rows.push(...e.after);
      }
    }
    const title = String(spec.title).split("{app}").join(app);
    menus.push({ title, titleHtml: esc(title), rows: tidy(rows), app: spec.id === "app", open: false });
  }
  for (const m of menus) m.rows = tidy(m.rows);
  return menus;
}

function rowsHtml(rows: readonly Row[], r: Renderer): string {
  const out: string[] = [];
  let subOpen = false;
  for (const x of rows) {
    if (x.kind === "sep") {
      out.push('<span class="mkd-menubar__sep" role="separator"></span>');
      continue;
    }
    if (x.kind === "header") {
      out.push(`<span class="mkd-menubar__header">${x.label}</span>`);
      continue;
    }
    const opened: boolean = x.submenu !== null && !subOpen && (x.open || hasOpen(x.submenu));
    subOpen = subOpen || opened;
    const attrs = (x.disabled ? ' data-state="disabled"' : "") + (x.checked ? ' data-checked="true"' : "")
      + (x.submenu !== null ? ' data-submenu="true"' : "") + (opened ? ' data-open="true"' : "");
    const check = x.checked ? r.icon("checkmark") : "";
    out.push(`<span class="mkd-menubar__item" role="menuitem"${attrs}>`
      + `<span class="mkd-menubar__check">${check}</span>`
      + (x.icon ? `<span class="mkd-menubar__icon">${x.icon}</span>` : "")
      + `<span class="mkd-menubar__label">${x.label}</span>`
      + (x.key ? `<span class="mkd-menubar__key">${esc(x.key)}</span>` : "")
      + (x.submenu !== null ? `<span class="mkd-menubar__chevron">${r.icon("chevron.right")}</span>` : "")
      + (opened ? '<span class="mkd-menubar__dropdown mkd-menubar__dropdown--sub" role="menu">'
        + `${rowsHtml(tidy(x.submenu!), r)}</span>` : "")
      + "</span>");
  }
  return out.join("");
}

function i(iconName: string): string {
  return iconSvg(iconName, "mkd-icon")[0];
}

/**
 * The menu bar's markup (C3): the Apple glyph, the menus (the first one asked for drawn open, C8), the status
 * items and the clock.
 */
export function render(views: readonly View[], r: Renderer, app: string, title: string, diags: Diagnostics): string {
  const menus = build(views, r, app, diags);
  if (title && !menus.some((m) => m.title === title)) {
    diags.warning(`menubar names no menu "${title}" (menus: ${menus.map((m) => m.title).join(", ")})`, null, "chrome");
  }
  const opened: Menu | null = menus.find((m) => (title && m.title === title) || m.open || hasOpen(m.rows)) ?? null;
  const parts = ['<div class="mkd-menubar" role="menubar">', `<span class="mkd-menubar__apple">${i("apple.logo")}</span>`];
  for (const m of menus) {
    const isOpen = m === opened;
    parts.push('<span class="mkd-menubar__menu"' + (m.app ? ' data-menu="app"' : "")
      + (isOpen ? ' data-open="true"' : "") + `><span class="mkd-menubar__title">${m.titleHtml}</span>`
      + (isOpen ? `<span class="mkd-menubar__dropdown" role="menu">${rowsHtml(m.rows, r)}</span>` : "")
      + "</span>");
  }
  const clock = esc(MENUBAR.clock);
  parts.push('<span class="mkd-menubar__gap"></span><span class="mkd-menubar__status">'
    + `${i("battery")}${i("wifi")}${i("switch.2")}<span class="mkd-menubar__clock">${clock}</span></span></div>`);
  return parts.join("");
}
