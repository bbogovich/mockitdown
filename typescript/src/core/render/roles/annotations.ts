/**
 * Annotation and overlay roles, freely placed with `.position` or inside a Canvas or ZStack.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.annotations`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { cssColor } from "../style.js";
import { at, cursorSvg, esc, fmt, name, or } from "../util.js";
import type { RoleFn } from "../html.js";

export const AnnotationRoles: Record<string, RoleFn> = {
  callout(v) {
    const n = fmt(or(at(v, "number", "index", "label"), ""));
    const text = this.textOrSlot(v, "text", "title", "message");
    const c = cssColor(at(v, "color"));
    const style: Record<string, string> = c ? { "--mkd-callout": c } : {};
    return this.open(v, "callout", "span", { style }) + `<span class="mkd-callout__badge">${esc(n)}</span>`
      + (text ? `<span class="mkd-callout__text">${text}</span>` : "") + "</span>";
  },
  pointer(v) {
    const kind = name(at(v, "kind", "style", "cursor")) || "arrow";
    return this.open(v, "pointer", "span", { data: { kind } }) + cursorSvg(kind) + "</span>";
  },
  marquee(v) { return this.open(v, "marquee") + this.views(v.children) + "</div>"; },
};
