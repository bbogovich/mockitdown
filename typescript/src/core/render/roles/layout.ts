/**
 * Layout roles: stacks, scroll, grid, spacer, divider, shape and colour.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.layout`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { CallValue, EnumValue } from "../../model.js";
import { isList, pyBool } from "../../values.js";
import { cssColor, u } from "../style.js";
import { at, int, isNum, name, num, numValue } from "../util.js";
import type { RoleFn } from "../html.js";

export const LayoutRoles: Record<string, RoleFn> = {
  vstack(v) { return this.stack(v, "vstack"); },
  hstack(v) { return this.stack(v, "hstack"); },
  zstack(v) { return this.stack(v, "zstack"); },
  group(v) { return this.open(v, "group") + this.views(v.children) + "</div>"; },
  scroll(v) {
    const axis = at(v, "axes", "axis");
    const data = name(axis) === "horizontal" || (isList(axis) && axis.some((a) => name(a) === "horizontal"))
      ? { axis: "horizontal" } : {};
    return this.open(v, "scroll", "div", { data }) + this.views(v.children) + "</div>";
  },
  grid(v) {
    const cols = at(v, "columns", "count", "cols");
    let template = "";
    if (isNum(cols)) template = `repeat(${int(numValue(cols))}, minmax(0, 1fr))`;
    else if (isList(cols) && cols.length) {
      const items: string[] = [];
      for (const c of cols) {
        const spec = c instanceof CallValue && c.args.length ? c.args[0] : null;
        if (spec instanceof EnumValue && spec.name === "adaptive") {
          const mn = u(num(spec.kw("minimum"), 100)) || "100px";
          template = `repeat(auto-fill, minmax(${mn}, 1fr))`;
          break;
        }
        if (spec instanceof EnumValue && spec.name === "fixed" && spec.args.length) items.push(u(num(spec.args[0], 100)) || "auto");
        else items.push("minmax(0, 1fr)");
      }
      template = template || items.join(" ");
    } else {
      const rows = v.children.filter((c) => c.role === "gridrow");
      const n = rows.length ? Math.max(...rows.map((r) => r.children.length)) : 0;
      if (n) template = `repeat(${n}, auto)`;
    }
    const style: Record<string, string> = template ? { "grid-template-columns": template } : {};
    const length = u(num(at(v, "spacing", "horizontalSpacing", "gap")));
    if (length !== null) style.gap = length;
    return this.open(v, "grid", "div", { style }) + this.views(v.children) + "</div>";
  },
  gridrow(v) { return this.open(v, "gridrow") + this.views(v.children) + "</div>"; },
  spacer(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "minLength")));
    if (length !== null) {
      style["min-width"] = length;
      style["min-height"] = length;
    }
    return this.open(v, "spacer", "div", { style }) + "</div>";
  },
  divider(v) {
    const label = at(v, "label", "text");
    const inner = pyBool(label) ? `<span class="mkd-divider__label">${this.content(label)}</span>` : "";
    return this.open(v, "divider", "div", { attrs: { role: "separator" } }) + inner + "</div>";
  },
  shape(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "cornerRadius")));
    if (length !== null) style["border-radius"] = length;
    return this.open(v, "shape", "div", { data: { shape: name(at(v, "shape")) || "rectangle" }, style }) + "</div>";
  },
  color(v) {
    const c = cssColor(at(v, "color"));
    return this.open(v, "color", "div", { style: c ? { background: c } : {} }) + "</div>";
  },
};
