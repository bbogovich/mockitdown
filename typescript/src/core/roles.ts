/**
 * Role rules (R-PACK-016): which elements may go where, decided by render role so that a pack element
 * inherits it (`VBtn` behaves as a button, `ShellBar` as a bar).
 *
 * The table is data, written once in the repository's `shared/language/roles.json` and copied into
 * the package beside `vocabulary.json` (R-REPO-002.C8); it reaches the core through `loadAssets`
 * (A-WEB-1.K1). Rendering never reads it: the design tools ask {@link canContain} and
 * {@link allowedChildren}, and each refusal comes with a sentence saying why.
 *
 *   {"reads": [...], "root": {"accepts": [...]},
 *    "roles": {"<role>": {"title", "category", "accepts", "attach", "reads"}, ...}}
 *
 * An `accepts` entry is a role or a category written `@<category>`. A pack element may narrow its
 * role's `accepts` with `rules: {"accepts": [...]}` in `pack.json` (C5, {@link ElementDef.rules}).
 * A parent of role `unknown` accepts every child, and a child of role `unknown` (an element the pack
 * does not define, a struct) is accepted by every parent that accepts children (C8).
 *
 * The `reads` lists (R-EVAL-004.C8) are the labels each role reads, the top-level list those every role
 * reads through the common element markup; the evaluator asks {@link roleReads} to warn about labelled
 * arguments nothing reads (R-EVAL-004.C9). The Python variant reads the same file.
 */

import { MockitdownError } from "./diagnostics.js";
import { registry, type Pack } from "./packs/registry.js";

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
let rootAccepts: readonly string[] = [];
let loaded = false;
const expanded = new WeakMap<readonly string[], Set<string>>();

/** Install the role rules from the text (or parsed value) of `roles.json`. */
export function setRoles(data: string | { reads?: unknown; root?: unknown; roles?: unknown }): void {
  const raw = (typeof data === "string" ? JSON.parse(data) : data) as { reads?: unknown; root?: { accepts?: unknown }; roles?: Record<string, unknown> };
  const next = new Map<string, RoleRule>();
  const nextReads = new Map<string, ReadonlySet<string>>();
  const common = strings(raw.reads);
  for (const [role, r] of Object.entries(raw.roles ?? {})) {
    const own = (r as { reads?: unknown }).reads;
    if (Array.isArray(own)) nextReads.set(role, new Set([...common, ...strings(own)]));
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

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function article(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
