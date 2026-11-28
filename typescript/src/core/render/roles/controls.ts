/**
 * Control roles: buttons, toggles, choices, fields, pickers, sliders, steppers, dates, drop zones.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.controls`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { pyRoundTo } from "../../pyformat.js";
import { intStr, isList, pyBool, PyFloat } from "../../values.js";
import {
  at, bool, esc, fmt, formatDate, fx, int, isNum, isNumOrBool, isOption, len, name, num, numValue, or, or0, raw,
  stripTags, textHtml,
} from "../util.js";
import { ContainerRoles } from "./containers.js";
import type { RoleFn } from "../html.js";

/** SwiftUI picker styles showing one value: without `selection:` they show the first option (R-PACK-014.C6). */
const PICKER_FIRST = ["automatic", "menu", "navigationLink", "palette", "wheel"];

/** SwiftUI picker styles drawing their options; without options they fall back to the menu style. */
const PICKER_OPTIONS = ["segmented", "palette", "inline", "radioGroup", "radio", "wheel"];

/** SwiftUI date picker styles (R-PACK-014.C2): they always show a selection, 23 Nov 2026 9:41 AM by default. */
const DATE_STYLES = ["automatic", "compact", "graphical", "wheel", "field", "stepperField"];

export const ControlRoles: Record<string, RoleFn> = {
  button(v) {
    if (this.inMenu) return ContainerRoles.menuitem.call(this, v);
    let label = this.textOrSlot(v, "label", "title", "text");
    if (v.children.length) label = this.views(v.children);
    const icon = at(v, "systemImage", "icon", "startIcon", "leadingIcon");
    const iconOnly = bool(at(v, "iconOnly")) || name(at(v, "labelStyle")) === "iconOnly" || (!label && pyBool(icon));
    const data: Record<string, unknown> = {};
    const role = at(v, "role");
    if (pyBool(role)) data.role = name(role);
    if (iconOnly) data["icon-only"] = "true";
    const parts: string[] = [];
    if (pyBool(icon)) parts.push(`<span class="mkd-button__icon">${this.icon(icon, "mkd-icon", v)}</span>`);
    if (label && !(iconOnly && pyBool(icon))) parts.push(`<span class="mkd-button__label">${label}</span>`);
    const end = at(v, "trailingIcon", "endIcon");
    if (pyBool(end)) parts.push(`<span class="mkd-button__icon mkd-button__icon--end">${this.icon(end, "mkd-icon", v)}</span>`);
    if (bool(at(v, "dropdown", "menu", "split"))) parts.push(`<span class="mkd-button__caret">${this.icon("chevron.down")}</span>`);
    if (bool(at(v, "loading"))) parts.unshift('<span class="mkd-button__spinner"></span>');
    parts.push(this.badgeHtml(at(v, "badge"), "mkd-badge mkd-button__badge"));
    const aria: Record<string, unknown> = { role: "button" };
    if (iconOnly && label) aria["aria-label"] = stripTags(label);
    return this.open(v, "button", "span", { data, attrs: aria }) + parts.join("") + "</span>";
  },
  fab(v) {
    const icon = or(at(v, "systemImage", "icon"), "plus");
    const label = this.content(at(v, "label", "text", "title"));
    const inner = `<span class="mkd-fab__icon">${this.icon(icon, "mkd-icon", v)}</span>` + (label ? `<span class="mkd-fab__label">${label}</span>` : "");
    const markup = this.open(v, "fab", "span", { data: label ? { extended: "true" } : {}, attrs: { role: "button" } }) + inner + "</span>";
    if (bool(at(v, "inline"))) return markup;
    const pos = name(at(v, "position", "placement")) || "bottomTrailing";
    this.present(v, `<div class="mkd-layer" data-kind="fab" data-position="${esc(pos)}">`, markup);
    return "";
  },
  toggle(v) {
    const variant = name(at(v, "variant"));
    if (variant === "checkbox" || variant === "check") return ControlRoles.checkbox.call(this, v);
    const on = bool(at(v, "isOn", "on", "checked", "value", "selected"));
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const desc = this.content(at(v, "description", "subtitle"));
    if (variant === "button") {
      return this.open(v, "button", "span", { data: { pressed: on ? "true" : "false" }, attrs: { role: "button" } })
        + `<span class="mkd-button__label">${label}</span></span>`;
    }
    let text = "";
    if (label || desc) {
      text = `<span class="mkd-toggle__text"><span class="mkd-toggle__label">${label}</span>`
        + (desc ? `<span class="mkd-toggle__description">${desc}</span>` : "") + "</span>";
    }
    const stateText = at(v, on ? "onText" : "offText");
    const st = pyBool(stateText) ? `<span class="mkd-toggle__state">${esc(fmt(stateText))}</span>` : "";
    return this.open(v, "toggle", "span", { data: { on: on ? "true" : "false" }, attrs: { role: "switch", "aria-checked": on ? "true" : "false" } })
      + text + '<span class="mkd-toggle__track"><span class="mkd-toggle__thumb"></span></span>' + st + "</span>";
  },
  checkbox(v) {
    const r = at(v, "checked", "isOn", "on", "value", "selected", "state");
    const state = ["indeterminate", "mixed"].includes(name(r)) ? "mixed" : (bool(r) ? "true" : "false");
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const mark = state !== "false" ? this.icon(state === "mixed" ? "minus" : "checkmark") : "";
    return this.open(v, "checkbox", "span", { data: { checked: state }, attrs: { role: "checkbox", "aria-checked": state } })
      + `<span class="mkd-checkbox__box">${mark}</span>`
      + (label ? `<span class="mkd-checkbox__label">${label}</span>` : "") + "</span>";
  },
  radio(v) {
    const on = bool(at(v, "checked", "selected", "isOn", "value"));
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    return this.open(v, "radio", "span", { data: { checked: on ? "true" : "false" }, attrs: { role: "radio", "aria-checked": on ? "true" : "false" } })
      + '<span class="mkd-radio__dot"></span>'
      + (label ? `<span class="mkd-radio__label">${label}</span>` : "") + "</span>";
  },
  segmented(v) {
    const options = this.options(v);
    let sel = this.selectedIndex(v, options);
    const chosen = new Set<number>();
    v.children.filter(isOption).forEach((c, i) => {
      if (bool(at(c, "selected"))) chosen.add(i);
    });
    if (chosen.size && at(v, "selection", "selected", "value") === null) sel = -1;
    const label = this.content(at(v, "label", "title"));
    const items = options.map(([, markup], i) => `<span class="mkd-segmented__item" role="tab" aria-selected="${i === sel || chosen.has(i) ? "true" : "false"}">`
      + `${markup}</span>`).join("");
    return this.open(v, "segmented", "div", { attrs: { role: "tablist" } })
      + (label && !v.hasMod("labelsHidden") ? `<span class="mkd-segmented__label">${label}</span>` : "")
      + `<span class="mkd-segmented__items">${items}</span></div>`;
  },
  textfield(v) {
    let kind = name(at(v, "kind", "type", "axis")) || "";
    if (kind === "vertical") kind = "multiline";
    let value = at(v, "text", "value");
    const placeholderText = at(v, "placeholder", "prompt");
    if (isNum(value)) value = fmt(value);
    let inner: string;
    let isPh: boolean;
    if (typeof value === "string" && value) {
      const shown = kind === "password" ? "•".repeat(Math.min(len(value), 12)) : value;
      inner = textHtml(shown);
      isPh = false;
    } else {
      inner = this.content(placeholderText);
      isPh = true;
    }
    const style: Record<string, string> = {};
    if (kind === "multiline") style["--mkd-rows"] = intStr(int(or0(num(at(v, "rows", "lineLimit"), 3), 3)));
    const end = kind === "password" && bool(at(v, "reveal"), false) ? "eye.slash" : "";
    // A filled field still has a title: its placeholder names it (a Form's columns style shows it).
    const titled = ["label", "title", "header"].some((n) => v.slots.has(n) || ![null, "", false].includes(raw(v, n) as never));
    const named = !isPh && typeof placeholderText === "string" && placeholderText !== "" && !titled;
    // A static text box, named like a control (R-REND-007.C1).
    const attrs: Record<string, string> = { role: "textbox", ...(named ? { "aria-label": placeholderText as string } : {}) };
    return this.field(v, "textfield", inner, { placeholder: isPh, kind, endIcon: end, style, attrs });
  },
  select(v) {
    const variant = name(at(v, "variant"));
    const options = this.options(v);
    if (PICKER_OPTIONS.includes(variant) && !options.length && !v.children.length) {
      // nothing to draw the options of: the label and an empty value (R-PACK-014.C6)
    } else if (variant === "segmented" || variant === "palette") return ControlRoles.segmented.call(this, v);
    else if (["radioGroup", "inline", "radio"].includes(variant)) return ControlRoles.radiogroup.call(this, v);
    else if (variant === "wheel") {
      const s = this.selectedIndex(v, options);
      return this.open(v, "wheel", "div", { attrs: { role: "listbox" } }) + this.wheel([[options.map(([, m]) => m), s]]) + "</div>";
    }
    const sel = this.selectedIndex(v, options);
    const value = at(v, "selection", "value", "selected");
    const tags = this.optionTags(v);
    let shown: string;
    if (isNum(value) && int(numValue(value)) >= 0 && int(numValue(value)) < options.length) shown = options[int(numValue(value))][1];
    else if (typeof value === "string" && value && tags.includes(value)) shown = options[tags.indexOf(value)][1];
    else if (typeof value === "string" && value) shown = textHtml(value);
    else if (isList(value)) {
      shown = value.map((x) => '<span class="mkd-chip" data-el="Chip" data-size="small"><span class="mkd-chip__label">'
        + `${esc(fmt(x))}</span></span>`).join("");
    } else if (value === null && options.length && PICKER_FIRST.includes(variant)) shown = options[0][1];
    else shown = "";
    const placeholder = !shown;
    if (placeholder) shown = this.content(at(v, "placeholder", "prompt"));
    let popup = "";
    if (bool(at(v, "open", "expanded")) && options.length) {
      popup = '<div class="mkd-select__popup" role="listbox">' + options.map(([, markup], i) =>
        `<div class="mkd-select__option" role="option" aria-selected="${i === sel ? "true" : "false"}">${markup}</div>`).join("") + "</div>";
    }
    const menuLike = variant === "menu" || variant === "automatic" || (PICKER_OPTIONS.includes(variant) && !options.length);
    const chevron = menuLike && this.pack.id === "swiftui" ? "chevron.up.down" : "chevron.down";
    return this.field(v, "select", shown, { placeholder, endIcon: chevron, popup });
  },
  radiogroup(v) {
    const options = this.options(v);
    const sel = this.selectedIndex(v, options);
    const label = this.textOrSlot(v, "label", "title");
    let radios: string;
    if (options.length) {
      radios = options.map(([, markup], i) => `<span class="mkd-radio" data-el="RadioButton" data-checked="${i === sel ? "true" : "false"}" `
        + `role="radio"><span class="mkd-radio__dot"></span><span class="mkd-radio__label">${markup}</span></span>`).join("");
    } else radios = this.views(v.children);
    return this.open(v, "radiogroup", "div", { attrs: { role: "radiogroup" } })
      + (label ? `<div class="mkd-radiogroup__label">${label}</div>` : "")
      + `<div class="mkd-radiogroup__items">${radios}</div></div>`;
  },
  slider(v) {
    const rng = at(v, "in", "range", "bounds");
    let lo = num(at(v, "min", "minimumValue"), null);
    let hi = num(at(v, "max", "maximumValue"), null);
    if (isList(rng) && rng.length && lo === null) {
      lo = num(rng[0], 0);
      hi = num(rng[rng.length - 1], 1);
    }
    const loV = lo === null ? 0.0 : lo;
    const hiV = hi === null ? (or0(num(at(v, "value"), 0), 0) <= 1 ? 1.0 : 100.0) : hi;
    const val = at(v, "value");
    let a: number, b: number;
    if (isList(val) && val.length === 2) { // range slider
      a = or0(num(val[0], loV), 0);
      b = or0(num(val[1], hiV), 0);
    } else {
      a = loV;
      b = or0(num(val, loV), loV);
    }
    const span = (hiV - loV) || 1;
    const fa = (a - loV) / span * 100;
    const fb = (b - loV) / span * 100;
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const parts = label ? [`<div class="mkd-slider__label">${label}</div>`] : [];
    let track = `<span class="mkd-slider__track"><span class="mkd-slider__fill" style="left:${fx(fa, 1)}%;width:${fx(fb - fa, 1)}%"></span>`;
    const steps = at(v, "ticks", "steps", "step");
    const ticks = at(v, "ticks");
    if (bool(ticks) || isNumOrBool(ticks) && !(ticks instanceof PyFloat)) {
      let n = isNum(steps) ? int(or0(num(steps, 0), 0)) : 0;
      n = n || 5;
      track += '<span class="mkd-slider__ticks">' + "<i></i>".repeat(n + 1) + "</span>";
    }
    if (isList(val) && val.length === 2) track += `<span class="mkd-slider__thumb" style="left:${fx(fa, 1)}%"></span>`;
    track += `<span class="mkd-slider__thumb" style="left:${fx(fb, 1)}%"></span></span>`;
    const mn = this.slot(v, "minimumValueLabel") || (pyBool(at(v, "minLabel")) ? this.content(at(v, "minLabel")) : "");
    const mx = this.slot(v, "maximumValueLabel") || (pyBool(at(v, "maxLabel")) ? this.content(at(v, "maxLabel")) : "");
    let ctrl = (mn ? `<span class="mkd-slider__min">${mn}</span>` : "") + track + (mx ? `<span class="mkd-slider__max">${mx}</span>` : "");
    if (bool(at(v, "showValue"))) ctrl += `<span class="mkd-slider__value">${esc(fmt(new PyFloat(pyRoundTo(b, 2))))}</span>`;
    parts.push(`<div class="mkd-slider__control">${ctrl}</div>`);
    return this.open(v, "slider", "div", { attrs: { role: "slider" } }) + parts.join("") + "</div>";
  },
  stepper(v) {
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const value = at(v, "value");
    const valHtml = value !== null ? `<span class="mkd-stepper__value">${esc(fmt(value))}</span>` : "";
    const btns = '<span class="mkd-stepper__buttons"><span class="mkd-stepper__button" data-step="down">'
      + `${this.icon("minus")}</span><span class="mkd-stepper__divider"></span>`
      + `<span class="mkd-stepper__button" data-step="up">${this.icon("plus")}</span></span>`;
    return this.open(v, "stepper") + (label ? `<span class="mkd-stepper__label">${label}</span>` : "") + valHtml + btns + "</div>";
  },
  datepicker(v) {
    const variant = name(at(v, "variant", "style"));
    if (DATE_STYLES.includes(variant)) return this.dateStyle(v, variant);
    const value = at(v, "selection", "date", "value", "text");
    const shown = pyBool(value) ? formatDate(value, name(at(v, "format")) || "medium") : "";
    const kind = name(at(v, "kind")) || "date";
    const end = kind === "time" ? "clock" : "calendar";
    return this.field(v, "datepicker", shown ? textHtml(shown) : this.content(at(v, "placeholder")),
      { placeholder: !shown, kind, endIcon: end });
  },
  calendar(v) { return this.calendarOf(v, at(v, "selection", "date", "value")); },
  dropzone(v) {
    const label = this.content(at(v, "label", "title", "text")) || "Drop files here";
    const hint = this.content(at(v, "hint", "description"));
    const icon = or(at(v, "systemImage", "icon"), "arrow.up.to.line");
    return this.open(v, "dropzone") + `<span class="mkd-dropzone__icon">${this.icon(icon, "mkd-icon", v)}</span>`
      + `<span class="mkd-dropzone__label">${label}</span>`
      + (hint ? `<span class="mkd-dropzone__hint">${hint}</span>` : "") + this.views(v.children) + "</div>";
  },
};
