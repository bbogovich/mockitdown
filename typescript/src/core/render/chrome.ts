/**
 * Device chrome: the status bars, title bars and browser bars drawn around a screen (port of
 * `mockitdown.render.chrome`). Chrome is static markup styled by the base stylesheet and the pack.
 */

import { iconSvg } from "../icons.js";
import { esc } from "./util.js";

export const CHROME_KINDS = ["none", "ios", "ipados", "macos", "windows", "android", "browser", "gnome", "kde", "win31",
  "window"] as const;

function i(name: string): string {
  return iconSvg(name, "mkd-icon")[0];
}

export function top(kind: string, title: string, url: string | null): string {
  switch (kind) {
    case "ios":
      return '<div class="mkd-chrome mkd-chrome--status" data-chrome="ios"><span class="mkd-chrome__time">9:41</span>'
        + '<span class="mkd-chrome__island"></span><span class="mkd-chrome__icons">'
        + `${i("cellularbars")}${i("wifi")}${i("battery")}</span></div>`;
    case "ipados":
      return '<div class="mkd-chrome mkd-chrome--status" data-chrome="ipados"><span class="mkd-chrome__time">'
        + '9:41 Mon Nov 23</span><span class="mkd-chrome__icons">'
        + `${i("wifi")}<span class="mkd-chrome__pct">100%</span>${i("battery")}</span></div>`;
    case "android":
      return '<div class="mkd-chrome mkd-chrome--status" data-chrome="android"><span class="mkd-chrome__time">'
        + `9:30</span><span class="mkd-chrome__icons">${i("wifi")}${i("cellularbars")}${i("battery")}`
        + "</span></div>";
    case "macos":
      return '<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="macos"><span class="mkd-chrome__lights">'
        + '<i data-light="close"></i><i data-light="min"></i><i data-light="max"></i></span>'
        + `<span class="mkd-chrome__title">${esc(title)}</span><span class="mkd-chrome__spacer"></span></div>`;
    case "windows":
      return '<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="windows"><span class="mkd-chrome__app">'
        + `${i("app")}</span><span class="mkd-chrome__title">${esc(title)}</span>`
        + '<span class="mkd-chrome__controls"><i data-control="min"></i><i data-control="max"></i>'
        + '<i data-control="close"></i></span></div>';
    case "gnome":
      // libadwaita apps draw their own header bar (HeaderBar element); the window is just rounded.
      return "";
    case "kde":
      return '<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="kde"><span class="mkd-chrome__app">'
        + `${i("app")}</span><span class="mkd-chrome__title">${esc(title)}</span>`
        + '<span class="mkd-chrome__controls"><i data-control="min"></i><i data-control="max"></i>'
        + '<i data-control="close"></i></span></div>';
    case "win31":
      return '<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="win31"><span class="mkd-chrome__sysmenu">'
        + `<i></i></span><span class="mkd-chrome__title">${esc(title)}</span>`
        + '<span class="mkd-chrome__controls"><i data-control="min"></i><i data-control="max"></i></span></div>';
    case "window":
      // Generic title bar for packs that draw their own window style (retro systems).
      return '<div class="mkd-chrome mkd-chrome--titlebar mkd-chrome--window" data-chrome="window">'
        + '<span class="mkd-chrome__lead"><i data-btn="close"></i><i data-btn="menu"></i></span>'
        + `<span class="mkd-chrome__title"><span class="mkd-chrome__title-text">${esc(title)}</span></span>`
        + '<span class="mkd-chrome__trail"><i data-btn="help"></i><i data-btn="min"></i><i data-btn="max"></i>'
        + '<i data-btn="zoom"></i><i data-btn="collapse"></i><i data-btn="close"></i></span></div>';
    case "browser": {
      const address = url || "https://app.example.com";
      return '<div class="mkd-chrome mkd-chrome--browser" data-chrome="browser"><span class="mkd-chrome__lights">'
        + '<i data-light="close"></i><i data-light="min"></i><i data-light="max"></i></span>'
        + `<span class="mkd-chrome__nav">${i("chevron.left")}${i("chevron.right")}${i("arrow.clockwise")}</span>`
        + `<span class="mkd-chrome__address">${i("lock")}<span>${esc(address)}</span></span>`
        + `<span class="mkd-chrome__menu">${i("ellipsis.vertical")}</span></div>`;
    }
    default:
      return "";
  }
}

export function bottom(kind: string): string {
  if (kind === "window") return '<div class="mkd-chrome mkd-chrome--statusbar" data-chrome="window"><i data-btn="grow"></i></div>';
  if (kind === "ios") return '<div class="mkd-chrome mkd-chrome--home" data-chrome="ios"><span class="mkd-chrome__indicator"></span></div>';
  if (kind === "android") {
    return '<div class="mkd-chrome mkd-chrome--home" data-chrome="android"><span class="mkd-chrome__indicator">'
      + "</span></div>";
  }
  return "";
}
