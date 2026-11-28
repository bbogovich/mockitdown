/**
 * The resolved view tree: what the evaluator produces and the renderer consumes (port of
 * `mockitdown.model`).
 *
 * Element attributes hold evaluated values (see `values.ts` for the Python value model):
 * strings, numbers, booleans, null, lists, tuples, dicts, {@link EnumValue} for `.member`
 * expressions, {@link ViewList} for view-valued arguments and {@link Thunk} for unevaluated closures
 * (actions, which are ignored).
 */

import { Location } from "./diagnostics.js";
import type { ElementDef, Pack } from "./packs/registry.js";
import type * as A from "./syntax/ast.js";
import { PyDict, pyEq, pyRepr, strRepr, tuple } from "./values.js";

/** A computed value: Python's `object` as the evaluator sees it. */
export type Value = unknown;

function kwargsRepr(kwargs: readonly (readonly [string, Value])[]): string {
  return pyRepr(tuple(kwargs.map((kv) => tuple(kv))));
}

function kwargsEq(a: readonly (readonly [string, Value])[], b: readonly (readonly [string, Value])[]): boolean {
  return a.length === b.length && a.every(([k, v], i) => k === b[i][0] && pyEq(v, b[i][1]));
}

function kwGet(kwargs: readonly (readonly [string, Value])[], key: string, fallback: Value): Value {
  let found: Value = fallback;
  for (const [k, v] of kwargs) if (k === key) found = v; // dict(kwargs): the last one wins
  return found;
}

/** `.red`, `Color.red` (namespace "Color"), `.system(size: 12)` (with arguments). */
export class EnumValue {
  readonly name: string;
  readonly namespace: string;
  readonly args: readonly Value[];
  readonly kwargs: readonly (readonly [string, Value])[];
  readonly pyTypeName = "EnumValue";

  constructor(name: string, namespace = "", args: readonly Value[] = [], kwargs: readonly (readonly [string, Value])[] = []) {
    this.name = name;
    this.namespace = namespace;
    this.args = tuple(args);
    this.kwargs = tuple(kwargs.map((kv) => tuple(kv) as unknown as readonly [string, Value]));
    Object.freeze(this);
  }

  kw(key: string, fallback: Value = null): Value {
    return kwGet(this.kwargs, key, fallback);
  }

  toString(): string {
    return this.name;
  }

  pyStr(): string {
    return this.name;
  }

  pyRepr(): string {
    return `EnumValue(name=${strRepr(this.name)}, namespace=${strRepr(this.namespace)}, args=${pyRepr(this.args)}, `
      + `kwargs=${kwargsRepr(this.kwargs)})`;
  }

  pyEq(o: unknown): boolean {
    return o instanceof EnumValue && o.name === this.name && o.namespace === this.namespace
      && pyEq(this.args, o.args) && kwargsEq(this.kwargs, o.kwargs);
  }

  hashKey(): string {
    return "e" + this.pyRepr();
  }
}

/** A call of an unknown, non-view callee used as a value, e.g. `GridItem(.flexible())`. */
export class CallValue {
  readonly name: string;
  readonly args: readonly Value[];
  readonly kwargs: readonly (readonly [string, Value])[];
  readonly pyTypeName = "CallValue";

  constructor(name: string, args: readonly Value[] = [], kwargs: readonly (readonly [string, Value])[] = []) {
    this.name = name;
    this.args = tuple(args);
    this.kwargs = tuple(kwargs.map((kv) => tuple(kv) as unknown as readonly [string, Value]));
    Object.freeze(this);
  }

  kw(key: string, fallback: Value = null): Value {
    return kwGet(this.kwargs, key, fallback);
  }

  pyRepr(): string {
    return `CallValue(name=${strRepr(this.name)}, args=${pyRepr(this.args)}, kwargs=${kwargsRepr(this.kwargs)})`;
  }

  pyEq(o: unknown): boolean {
    return o instanceof CallValue && o.name === this.name && pyEq(this.args, o.args) && kwargsEq(this.kwargs, o.kwargs);
  }

  hashKey(): string {
    return "c" + this.pyRepr();
  }
}

/** The evaluator's scope chain (defined by the evaluator; opaque here). */
export interface EnvLike {
  readonly vars: Map<string, Value>;
}

/** A closure captured with its environment; evaluated only where views are expected. */
export class Thunk {
  readonly closure: A.Closure;
  readonly env: EnvLike;
  readonly pyTypeName = "Thunk";

  constructor(closure: A.Closure, env: EnvLike) {
    this.closure = closure;
    this.env = env;
  }

  pyRepr(): string {
    return `Thunk(closure=<closure at ${this.closure.loc}>, env=<Env>)`;
  }
}

export class ViewList {
  readonly views: View[];
  readonly pyTypeName = "ViewList";

  constructor(views: View[]) {
    this.views = views;
  }

  pyRepr(): string {
    return `ViewList(views=[${this.views.map((v) => `View(name=${strRepr(v.name)}, …)`).join(", ")}])`;
  }
}

export class Modifier {
  name: string;
  args: Value[];
  kwargs: PyDict<Value>;
  content: View[] | null;
  /** Further labeled closures, e.g. `.alert("T", isPresented: true) { … } message: { … }`. */
  slots: Map<string, View[]>;
  loc: Location;

  constructor(name: string, args: Value[] = [], kwargs: PyDict<Value> = new PyDict(), content: View[] | null = null,
    slots: Map<string, View[]> = new Map(), loc: Location = new Location()) {
    this.name = name;
    this.args = args;
    this.kwargs = kwargs;
    this.content = content;
    this.slots = slots;
    this.loc = loc;
  }

  /** `m.arg(i, default)`: the i-th positional argument. */
  arg(i = 0, fallback: Value = null): Value {
    return this.args.length > i ? this.args[i] : fallback;
  }
}

export class View {
  name: string;
  role: string;
  element: ElementDef | null;
  attrs: PyDict<Value>;
  extra_args: Value[];
  children: View[];
  slots: Map<string, View[]>;
  modifiers: Modifier[];
  /** Name of the user struct this view is the root of, if any. */
  component: string;
  loc: Location;
  /** Ordinal (`n<k>`) of the view node of the rendered source it was produced from (R-EDIT-001.C4), or "". */
  node = "";
  /** Ordinal of the innermost `ForEach` call, `if` statement or struct call that produced it (R-EDIT-004.C5), or "". */
  derived = "";

  constructor(name: string, role: string, init: {
    element?: ElementDef | null; attrs?: PyDict<Value>; extra_args?: Value[]; children?: View[];
    slots?: Map<string, View[]>; modifiers?: Modifier[]; component?: string; loc?: Location;
  } = {}) {
    this.name = name;
    this.role = role;
    this.element = init.element ?? null;
    this.attrs = init.attrs ?? new PyDict();
    this.extra_args = init.extra_args ?? [];
    this.children = init.children ?? [];
    this.slots = init.slots ?? new Map();
    this.modifiers = init.modifiers ?? [];
    this.component = init.component ?? "";
    this.loc = init.loc ?? new Location();
  }

  /** The last modifier of that name, if any. */
  mod(name: string): Modifier | null {
    for (let i = this.modifiers.length - 1; i >= 0; i--) if (this.modifiers[i].name === name) return this.modifiers[i];
    return null;
  }

  hasMod(...names: string[]): boolean {
    return this.modifiers.some((m) => names.includes(m.name));
  }

  /** The first of the named attributes that is set and not null. */
  attr(names: string | string[], fallback: Value = null): Value {
    for (const n of typeof names === "string" ? [names] : names) {
      if (this.attrs.has(n) && this.attrs.get(n) !== null) return this.attrs.get(n);
    }
    return fallback;
  }

  readonly pyTypeName = "View";
}

/** One evaluated mockup: its views, the pack it renders with, and `@Screen` metadata. */
export class Screen {
  views: View[];
  pack: Pack;
  meta: PyDict<Value>;
  components: string[];

  constructor(views: View[], pack: Pack, meta: PyDict<Value> = new PyDict(), components: string[] = []) {
    this.views = views;
    this.pack = pack;
    this.meta = meta;
    this.components = components;
  }
}

/** Every view in a tree, depth first, including slot and modifier content. */
export function* walk(views: readonly View[]): Generator<View> {
  for (const v of views) {
    yield v;
    yield* walk(v.children);
    for (const s of v.slots.values()) yield* walk(s);
    for (const m of v.modifiers) {
      if (m.content) yield* walk(m.content);
      for (const s of m.slots.values()) yield* walk(s);
    }
    for (const a of v.attrs.values()) if (a instanceof ViewList) yield* walk(a.views);
  }
}
