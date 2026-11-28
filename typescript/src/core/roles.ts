/**
 * Role rules (R-PACK-016): which elements may go where, decided by render role so that a pack element
 * inherits it (`VBtn` behaves as a button, `ShellBar` as a bar).
 *
 * The table is data, written once in the repository's `shared/language/roles.json` and copied into
 * the package beside `vocabulary.json` (R-REPO-002.C8); it reaches the core through `loadAssets`
 * (A-WEB-1.K1). Rendering never reads it: the design tools ask {@link canContain} and
 * {@link allowedChildren}, and each refusal comes with a sentence saying why.
 *
 *   {"params": {...}, "root": {"accepts": [...]},
 *    "roles": {"<role>": {"title", "category", "accepts", "attach", "params"}, ...}}
 *
 * An `accepts` entry is a role or a category written `@<category>`. A pack element may narrow its
 * role's `accepts` with `rules: {"accepts": [...]}` in `pack.json` (C5, {@link ElementDef.rules}).
 * A parent of role `unknown` accepts every child, and a child of role `unknown` (an element the pack
 * does not define, a struct) is accepted by every parent that accepts children (C8).
 *
 * The `params` maps (R-PACK-017.C1) give each labelled argument a role reads its type, the top-level map
 * those every role reads through the common element markup. Their labels, the keys, are what the
 * evaluator asks {@link roleReads} to warn about labelled arguments nothing reads (R-EVAL-004.C8, C9);
 * the design tools ask {@link parameterTypes} for the types, with a pack element's own `types` applied
 * (R-PACK-017.C3, C6). The Python variant reads the same file.
 */

import { MockitdownError } from "./diagnostics.js";
import { registry, type ElementDef, type Pack } from "./packs/registry.js";
import { typeMap, type TypeSpec } from "./paramtypes.js";

export const ROLE_CATEGORIES = ["frame", "bar", "layout", "collection", "content", "overlay", "annotation"] as const;
export type RoleCategory = (typeof ROLE_CATEGORIES)[number];
export type RoleAttach = "child" | "presentation" | "modifier";

/** One role's rule (M-PACK-3): its reader's name, category, the children it accepts and how it attaches. */
export interface RoleRule {
  readonly role: string;
  readonly title: string;
  readonly category: RoleCategory;
  readonly accepts: readonly string[];
  readonly attach: RoleAttach;
}

export type ContainResult = { ok: true } | { ok: false; reason: string };

/** The pack's elements a parent may hold, and the others grouped by the reason they are refused. */
export interface AllowedChildren {
  allowed: string[];
  refused: { reason: string; elements: string[] }[];
}

/** How a refusal names a category the parent accepts nothing of. */
const CATEGORY_NOUN: Record<RoleCategory, string> = {
  frame: "frame", bar: "bar", layout: "layout", collection: "collection", content: "content element",
  overlay: "overlay", annotation: "annotation",
};

let rules = new Map<string, RoleRule>();
let reads = new Map<string, ReadonlySet<string>>();
let commonTypes = new Map<string, TypeSpec>();
let roleTypes = new Map<string, ReadonlyMap<string, TypeSpec>>();
let rootAccepts: readonly string[] = [];
let loaded = false;
const expanded = new WeakMap<readonly string[], Set<string>>();

/** Install the role rules from the text (or parsed value) of `roles.json`. */
export function setRoles(data: string | { params?: unknown; root?: unknown; roles?: unknown }): void {
  const raw = (typeof data === "string" ? JSON.parse(data) : data) as { params?: unknown; root?: { accepts?: unknown }; roles?: Record<string, unknown> };
  const next = new Map<string, RoleRule>();
  const nextReads = new Map<string, ReadonlySet<string>>();
  const nextTypes = new Map<string, ReadonlyMap<string, TypeSpec>>();
  const common = labels(raw.params);
  for (const [role, r] of Object.entries(raw.roles ?? {})) {
    const own = (r as { params?: unknown }).params;
    if (own && typeof own === "object" && !Array.isArray(own)) {
      nextReads.set(role, new Set([...common, ...labels(own)]));
      nextTypes.set(role, typeMap(own));
    }
    const rule = r as Partial<RoleRule>;
    next.set(role, Object.freeze({
      role,
      title: typeof rule.title === "string" ? rule.title : role,
      category: (ROLE_CATEGORIES as readonly string[]).includes(String(rule.category)) ? rule.category as RoleCategory : "content",
      accepts: Object.freeze(strings(rule.accepts)),
      attach: rule.attach === "presentation" || rule.attach === "modifier" ? rule.attach : "child",
    }));
  }
  rules = next;
  reads = nextReads;
  commonTypes = typeMap(raw.params);
  roleTypes = nextTypes;
  rootAccepts = Object.freeze(strings(raw.root?.accepts));
  loaded = true;
}

/** Whether {@link setRoles} has run (through `loadAssets`). */
export function rolesLoaded(): boolean {
  return loaded;
}

/** The rule of a render role, or null when the table has none. */
export function roleRule(role: string): RoleRule | null {
  return rules.get(role) ?? null;
}

/**
 * The labels a render role reads (R-EVAL-004.C8), the common ones included, or null when no rules are
 * loaded or the role's rule lists none (then no label of it can be reported).
 */
export function roleReads(role: string): ReadonlySet<string> | null {
  return reads.get(role) ?? null;
}

/**
 * The types of the labelled arguments an element of `pack` (a pack id or a loaded pack) understands
 * (R-PACK-017.C6): the common `params`, then its role's, then the element's own `types` (C3); `variant`
 * is an `enum` of the element's declared variants when it declares some (C4). An element the pack does
 * not define has the common ones. Each type is in its object form; the keys follow that order.
 */
export function parameterTypes(pack: string | Pack, element: string): Record<string, TypeSpec> {
  const p = packOf(pack);
  const el = p.element(element);
  const out: Record<string, TypeSpec> = {};
  for (const [k, t] of commonTypes) out[k] = t;
  for (const [k, t] of (el && roleTypes.get(el.role)) || []) out[k] = t;
  for (const [k, t] of el?.types ?? []) out[k] = t;
  if (el && el.variants.length) out.variant = Object.freeze({ type: "enum", values: Object.freeze([...el.variants]) });
  return out;
}

/** Labels of an action closure: understood by every element, the closure discarded (R-EVAL-004.C7). */
export const ACTION_LABELS: ReadonlySet<string> = new Set(["action", "onCommit", "onEditingChanged", "perform"]);

/**
 * Whether an element of `pack` understands a labelled argument whatever its value (R-EVAL-004.C7): its
 * params or defaults name it, an argument alias of the element or its pack renames it, its role reads it
 * (or no rules are loaded, or the role lists none), its pack types it for the element, or it is an
 * action. The evaluator adds the value's cases (a closure, views, a binding); convert keeps the labels
 * this accepts (R-EDIT-009.C5).
 */
export function labelUnderstood(pack: Pack, el: ElementDef, label: string): boolean {
  const read = roleReads(el.role);
  if (read === null || read.has(label) || ACTION_LABELS.has(label)) return true;
  if (el.params.includes(label) || el.defaults.some(([k]) => k === label) || el.attrs.some(([k]) => k === label)) return true;
  if (el.types.has(label)) return true;
  return pack.attrs.has(label);
}

/** The roles an `accepts` list names, `@category` entries expanded. */
export function expandAccepts(accepts: readonly string[]): ReadonlySet<string> {
  let out = expanded.get(accepts);
  if (!out) {
    out = new Set<string>();
    for (const e of accepts) {
      if (e.startsWith("@")) {
        for (const r of rules.values()) if (r.category === e.slice(1)) out.add(r.role);
      } else out.add(e);
    }
    expanded.set(accepts, out);
  }
  return out;
}

/**
 * Whether `parent` (an element name, or null for the root of a mockup) may hold `child` in `pack`
 * (a pack id or a loaded pack): `{ok: true}`, or `{ok: false, reason}` with a sentence naming the
 * rule that refuses (C6).
 */
export function canContain(pack: string | Pack, parent: string | null, child: string): ContainResult {
  return check(packOf(pack), parent, child);
}

/** The pack's elements `parent` may hold, in the pack's order, and the others grouped by reason (C7). */
export function allowedChildren(pack: string | Pack, parent: string | null): AllowedChildren {
  const p = packOf(pack);
  const allowed: string[] = [];
  const groups = new Map<string, string[]>();
  for (const name of p.elements.keys()) {
    const r = check(p, parent, name);
    if (r.ok) allowed.push(name);
    else {
      const g = groups.get(r.reason);
      if (g) g.push(name);
      else groups.set(r.reason, [name]);
    }
  }
  return { allowed, refused: [...groups].map(([reason, elements]) => ({ reason, elements })) };
}

/**
 * Whether an element of `pack` holds children at all: its role (or its pack's narrowing, C5) accepts
 * some role; an element the pack does not define (role `unknown`, a struct) does. The editor takes the
 * elements that do as the containers a drop goes into (R-TOOL-005.C3).
 */
export function holdsChildren(pack: string | Pack, name: string): boolean {
  const p = packOf(pack);
  const rule = ruleOf(p, name);
  if (rule.role === "unknown") return true;
  return expandAccepts(p.element(name)?.rules?.accepts ?? rule.accepts).size > 0;
}

function packOf(pack: string | Pack): Pack {
  if (!loaded) throw new MockitdownError("no role rules are loaded: call loadAssets() (or mockitdown/node's loadSharedAssets()) first");
  return typeof pack === "string" ? registry.get(pack) : pack;
}

/** An element's role rule; names the pack does not define, and roles without a rule, are `unknown`. */
function ruleOf(pack: Pack, name: string): RoleRule {
  const el = pack.element(name);
  return (el && rules.get(el.role)) || rules.get("unknown") || UNKNOWN;
}

const UNKNOWN: RoleRule = Object.freeze({
  role: "unknown", title: "unknown element", category: "content" as const, accepts: Object.freeze([]), attach: "child" as const,
});

function check(pack: Pack, parent: string | null, child: string): ContainResult {
  const c = ruleOf(pack, child);
  let accepts: readonly string[];
  let place: string;
  let narrowedBy: string | null = null;
  if (parent === null) {
    accepts = rootAccepts;
    place = "at the root of a mockup";
  } else {
    const p = ruleOf(pack, parent);
    if (p.role === "unknown") return { ok: true };
    const own = pack.element(parent)?.rules;
    if (own) {
      accepts = own.accepts;
      narrowedBy = parent;
    } else accepts = p.accepts;
    place = `inside ${article(p.title)}`;
    if (!expandAccepts(p.accepts).size) return { ok: false, reason: `${cap(article(p.title))} cannot hold other elements` };
  }
  const allowed = expandAccepts(accepts);
  if (c.role === "unknown" && (allowed.size || parent === null)) return { ok: true };
  if (allowed.has(c.role)) return { ok: true };
  const subject = cap(article(c.title));
  if (c.category === "overlay") return { ok: false, reason: `${subject} is attached through a presentation modifier (.sheet, .alert, .overlay), not placed ${place}` };
  if (c.category === "annotation") return { ok: false, reason: `${subject} is attached as a modifier, not placed ${place}` };
  if (narrowedBy !== null) {
    const names = accepts.map((e) => (e.startsWith("@") ? CATEGORY_NOUN[e.slice(1) as RoleCategory] ?? e : rules.get(e)?.title ?? e));
    return { ok: false, reason: `${subject} cannot be placed inside ${narrowedBy}, which its pack limits to ${names.join(", ")}` };
  }
  const someOfCategory = [...allowed].some((r) => rules.get(r)?.category === c.category);
  const what = someOfCategory ? subject : cap(article(CATEGORY_NOUN[c.category]));
  return { ok: false, reason: `${what} cannot be placed ${place}` };
}

function labels(v: unknown): string[] {
  return v && typeof v === "object" && !Array.isArray(v) ? Object.keys(v) : [];
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function article(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
