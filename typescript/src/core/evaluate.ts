/**
 * Evaluator: syntax tree → resolved {@link Screen} (port of `mockitdown.evaluate`).
 *
 * It selects the pack, loads imported component files, instantiates user `struct` views, expands
 * `ForEach`/`if`/`let`, interpolates strings and maps call arguments onto element attributes.
 * Problems are reported to a {@link Diagnostics}; evaluation always completes, substituting an
 * `unknown` view for anything it cannot resolve.
 */

import { basename, dirname, joinPath, loadComponent, pathStr, readComponent } from "./components.js";
import { Diagnostics, Location, MockitdownError, MockitdownSyntaxError } from "./diagnostics.js";
import { CallValue, EnumValue, Modifier, Screen, Thunk, View, ViewList, type Value } from "./model.js";
import type { ImportResolver } from "./options.js";
import type { Pack, PackRegistry } from "./packs/registry.js";
import type * as A from "./syntax/ast.js";
import { isViewProperty } from "./syntax/ast.js";
import {
  codePoints, isDigits, isFloat, isIntLike, isList, isNumberLike, isSeq, isTuple, num, parseDigits, pyAdd,
  pyBool, pyCompare, PyDict, pyDiv, pyEq, PyError, PyFloat, pyLen, pyMul, pyNeg, pyStr, pySub, pyTypeName,
  strLen, strRepr, strTitle, toFloat, tuple, floatRepr, formatG, intStr,
} from "./values.js";
import { IGNORED, NEUTRAL_MODULES, RENDERED } from "./vocabulary.js";

export const MAX_DEPTH = 48;
export const MAX_ITERATIONS = 500;

const MISSING = Symbol("missing");
const ONCE_MODIFIERS = new Set(["callout", "annotation", "pointer", "cursor", "marquee", "dragSelect", "highlight", "tap"]);

export class Env {
  readonly vars: Map<string, Value>;
  readonly parent: Env | null;

  constructor(parent: Env | null = null, values?: Map<string, Value>) {
    this.vars = new Map(values ?? []);
    this.parent = parent;
  }

  lookup(name: string): [boolean, Value] {
    for (let e: Env | null = this; e !== null; e = e.parent) {
      if (e.vars.has(name)) return [true, e.vars.get(name)];
    }
    return [false, null];
  }

  child(values?: Map<string, Value>): Env {
    return new Env(this, values);
  }
}

/** Where `import "path"` statements are resolved. */
export interface ImportContext {
  search_paths: string[];
  /** Directory of the file holding the block (for relative imports), if known. */
  base_dir: string | null;
  /** Supplies a candidate's text when no registered component holds it. */
  resolver: ImportResolver | null;
}

/** How a value is written into text: `nil`, `true`, `3`, `0.5`, `[a, b]`. */
export function formatValue(v: Value): string {
  if (v === null || v === undefined) return "nil";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof PyFloat) {
    return Number.isInteger(v.value) ? intStr(v.value) : formatG(v.value);
  }
  if (v instanceof EnumValue) return v.name;
  if (isList(v)) return "[" + v.map(formatValue).join(", ") + "]";
  if (v instanceof ViewList) return "";
  return pyStr(v);
}

/** Python truthiness: empty strings and collections are false. */
export const truthy = pyBool;

export class Evaluator {
  readonly registry: PackRegistry;
  readonly diags: Diagnostics;
  readonly default_pack: string;
  readonly pack_override: string | null;
  readonly imports: ImportContext;
  readonly structs = new Map<string, A.StructDecl>();
  pack: Pack | null = null;
  depth = 0;
  used_components: string[] = [];
  /** True while rendering the implicit preview of a declarations-only block. */
  preview = false;

  constructor(registry: PackRegistry, diagnostics: Diagnostics, opts: {
    default_pack?: string; pack_override?: string | null; imports?: ImportContext;
  } = {}) {
    this.registry = registry;
    this.diags = diagnostics;
    this.default_pack = opts.default_pack ?? "base";
    this.pack_override = opts.pack_override ?? null;
    this.imports = opts.imports ?? { search_paths: [], base_dir: null, resolver: null };
  }

  private get p(): Pack {
    return this.pack!;
  }

  private element(name: string): boolean {
    return !!this.pack && this.pack.element(name) !== null;
  }

  // --- entry -----------------------------------------------------------------------------------

  evaluate(module: A.Module): Screen {
    const meta = this.directives(module);
    this.pack = this.selectPack(module, meta);
    this.loadImports(module.imports, this.imports.base_dir, new Set());
    for (const s of module.structs) this.structs.set(s.name, s);
    const env = new Env();
    let statements = module.statements;
    if (!statements.length && module.structs.length) {
      // A block holding only declarations renders its last struct, as an Xcode preview would.
      const last = module.structs[module.structs.length - 1];
      statements = [{ kind: "ExprStmt", expr: { kind: "Call", callee: { kind: "Ident", name: last.name, loc: last.loc },
        args: [], trailing: [], loc: last.loc }, loc: last.loc }];
      this.preview = true;
    }
    const views = this.block(statements, env);
    if (!views.length) this.diags.warning("the mockup has no views", new Location(1, 1, module.source), "empty");
    return new Screen(views, this.p, meta, this.used_components);
  }

  private directives(module: A.Module): PyDict<Value> {
    const meta = new PyDict<Value>();
    const env = new Env();
    for (const attr of module.attributes) {
      if (attr.name !== "Screen") {
        this.diags.warning(`unknown directive @${attr.name}`, attr.loc, "directive");
        continue;
      }
      attr.args.forEach((arg, i) => {
        const key = arg.label || (i === 0 ? "title" : `_${i}`);
        const val = this.value(arg.value, env);
        meta.set(key, val instanceof EnumValue ? val.name : val);
      });
    }
    return meta;
  }

  private selectPack(module: A.Module, meta: PyDict<Value>): Pack {
    let chosen: string | null = null;
    for (const imp of module.imports) {
      if (imp.module === null) continue;
      const pid = this.registry.forModule(imp.module);
      if (pid) {
        if (chosen && chosen !== pid) {
          this.diags.warning(`import ${imp.module} selects pack ${strRepr(pid)}, but ${strRepr(chosen)} is already `
            + "selected; the first import wins", imp.loc, "pack");
          continue;
        }
        chosen = chosen || pid;
      } else if (!NEUTRAL_MODULES.has(imp.module)) {
        this.diags.warning(`import ${imp.module} names no known pack`, imp.loc, "pack");
      }
    }
    if (!chosen && typeof meta.get("pack") === "string") chosen = meta.get("pack") as string;
    const pid = this.pack_override || chosen || this.default_pack;
    try {
      return this.registry.get(pid);
    } catch (e) {
      if (!(e instanceof MockitdownError)) throw e;
      this.diags.error(e.diagnostic.message, new Location(1, 1, module.source), "pack");
      return this.registry.get("base");
    }
  }

  private resolveImport(path: string, baseDir: string | null): [string, string] | null {
    const candidates: string[] = [];
    if (path.startsWith("/")) candidates.push(path);
    else {
      if (baseDir !== null) candidates.push(joinPath(baseDir, path));
      for (const d of this.imports.search_paths) candidates.push(joinPath(d, path));
      if (!candidates.length) candidates.push(joinPath("", path));
    }
    for (const c of candidates) {
      for (const cand of [c, c + ".mockitdown"]) {
        const text = readComponent(cand, this.imports.resolver);
        if (text !== null) return [joinPath("", cand), text];
      }
    }
    return null;
  }

  private loadImports(imports: readonly A.Import[], baseDir: string | null, seen: Set<string>): void {
    for (const imp of imports) {
      if (imp.path === null) continue;
      const resolved = this.resolveImport(imp.path, baseDir);
      if (resolved === null) {
        const searched = this.imports.search_paths.map(pathStr).join(", ") || "(no import paths)";
        this.diags.error(`cannot find import ${strRepr(imp.path)} (searched ${searched})`, imp.loc, "import");
        continue;
      }
      const [key, text] = resolved;
      if (seen.has(key)) continue;
      seen.add(key);
      let mod: A.Module;
      try {
        mod = loadComponent(key, text);
      } catch (e) {
        if (e instanceof MockitdownSyntaxError) {
          this.diags.extend([e.diagnostic]);
          continue;
        }
        throw e;
      }
      this.loadImports(mod.imports, dirname(key), seen);
      for (const s of mod.structs) {
        const prev = this.structs.get(s.name);
        if (prev && prev.source !== s.source) {
          this.diags.warning(`struct ${s.name} from ${basename(key)} replaces an earlier definition`, s.loc, "import");
        }
        this.structs.set(s.name, s);
      }
      if (mod.statements.length) {
        this.diags.warning(`${basename(key)}: top-level views in an imported file are ignored`,
          mod.statements[0].loc, "import");
      }
    }
  }

  // --- statements → views ----------------------------------------------------------------------

  block(stmts: readonly A.Node[], env: Env): View[] {
    const out: View[] = [];
    const local = env.child();
    for (const st of stmts) {
      if (st.kind === "LetStmt") local.vars.set(st.name, this.value(st.value, local));
      else if (st.kind === "IfStmt") {
        const branch = truthy(this.value(st.cond, local)) ? st.then : st.other;
        out.push(...this.block(branch, local));
      } else if (st.kind === "ExprStmt") out.push(...this.views(st.expr, local));
      else this.diags.error("unsupported statement", st.loc);
    }
    return out;
  }

  runThunk(thunk: Thunk, args?: Value[] | null): View[] {
    const closure = thunk.closure;
    const values = new Map<string, Value>();
    if (closure.params.length) {
      let a: readonly Value[] = args ?? [];
      if (closure.params.length > 1 && a.length === 1 && isSeq(a[0])) a = [...(a[0] as readonly Value[])];
      closure.params.forEach((name, i) => {
        if (name !== "_") values.set(name, i < a.length ? a[i] : null);
      });
    }
    return this.block(closure.body, (thunk.env as Env).child(values));
  }

  views(expr: A.Node, env: Env): View[] {
    if (expr.kind === "Call") {
      const callee = expr.callee;
      if (callee.kind === "Member") return this.applyModifier(callee, expr, env);
      if (callee.kind === "Ident") return this.callView(callee.name, expr, env);
      this.diags.error("this expression does not produce a view", expr.loc, "view");
      return [];
    }
    if (expr.kind === "Member") {
      if (expr.base.kind === "Ident" && expr.base.name === "Color" && this.p.element("Color")) {
        return [this.elementView("Color", { kind: "Call", callee: { kind: "Ident", name: "Color", loc: expr.loc },
          args: [{ label: null, value: { kind: "EnumCase", name: expr.name, loc: expr.loc } }], trailing: [], loc: expr.loc }, env)];
      }
      // `view.modifier` without parentheses: Swift requires them; accept leniently.
      return this.applyModifier(expr, { kind: "Call", callee: expr, args: [], trailing: [], loc: expr.loc }, env);
    }
    if (expr.kind === "Ident") {
      const [found, val] = env.lookup(expr.name);
      if (found) return this.viewsFromValue(val, expr.loc);
      if (this.structs.has(expr.name) || this.p.element(expr.name)) {
        return this.callView(expr.name, { kind: "Call", callee: expr, args: [], trailing: [], loc: expr.loc }, env);
      }
      this.diags.error(`unknown view or variable ${strRepr(expr.name)}`, expr.loc, "unknown");
      return [new View(expr.name, "unknown", { loc: expr.loc })];
    }
    if ((expr.kind === "Literal" || expr.kind === "StringLit") && this.p.element("Text")) {
      const text = this.value(expr, env);
      return [this.elementView("Text", textCall(text, expr.loc), env)];
    }
    if (expr.kind === "Ternary") {
      return this.views(truthy(this.value(expr.cond, env)) ? expr.then : expr.other, env);
    }
    this.diags.error("this expression does not produce a view", expr.loc, "view");
    return [];
  }

  private viewsFromValue(val: Value, loc: Location): View[] {
    if (val instanceof Thunk) return this.runThunk(val);
    if (val instanceof ViewList) return val.views;
    if ((typeof val === "string" || isNumberLike(val)) && this.p.element("Text")) {
      return [this.elementView("Text", textCall(val, loc), new Env())];
    }
    if (val === null || val === undefined) return [];
    this.diags.error(`a ${pyTypeName(val)} value is not a view`, loc, "view");
    return [];
  }

  private callView(name: string, call: A.Call, env: Env): View[] {
    if (name === "ForEach") return this.forEach(call, env);
    const decl = this.structs.get(name);
    if (decl) return this.instantiate(decl, call, env);
    const [found, val] = env.lookup(name);
    if (found) return this.viewsFromValue(val, call.loc); // calling a view-typed property: `content()`
    if (this.p.element(name)) return [this.elementView(name, call, env)];
    this.diags.error(`${strRepr(name)} is not an element of pack ${strRepr(this.p.id)} and no struct of that name `
      + "is declared or imported", call.loc, "unknown");
    const v = new View(name, "unknown", { loc: call.loc });
    v.children = this.trailingChildren(call, env);
    return [v];
  }

  private trailingChildren(call: A.Call, env: Env): View[] {
    const out: View[] = [];
    for (const [label, closure] of call.trailing) if (label === null) out.push(...this.block(closure.body, env));
    return out;
  }

  private forEach(call: A.Call, env: Env): View[] {
    let data: Value = [];
    let body: Thunk | null = null;
    for (const [i, arg] of call.args.entries()) {
      if ((arg.label === null || arg.label === "data") && i === 0) data = this.value(arg.value, env);
      else if (arg.label === "content") {
        const v = this.value(arg.value, env);
        body = v instanceof Thunk ? v : null;
      }
    }
    for (const [label, closure] of call.trailing) {
      if (label === null || label === "content") body = new Thunk(closure, env);
    }
    if (body === null) {
      this.diags.error("ForEach needs a content closure", call.loc, "foreach");
      return [];
    }
    if (isIntLike(data)) data = range(0, num(data));
    else if (data instanceof PyDict) data = data.items().map((kv) => tuple(kv));
    else if (typeof data === "string") data = [data];
    if (!isSeq(data)) {
      this.diags.error("ForEach needs an array, a range or a count", call.loc, "foreach");
      return [];
    }
    let items = data as readonly Value[];
    if (items.length > MAX_ITERATIONS) {
      this.diags.warning(`ForEach truncated to ${MAX_ITERATIONS} items`, call.loc, "foreach");
      items = items.slice(0, MAX_ITERATIONS);
    }
    const out: View[] = [];
    for (const item of items) out.push(...this.runThunk(body, [item]));
    return out;
  }

  private instantiate(decl: A.StructDecl, call: A.Call, env: Env): View[] {
    if (this.depth >= MAX_DEPTH) {
      this.diags.error(`struct ${decl.name} nests too deeply (recursive?)`, call.loc, "recursion");
      return [];
    }
    if (!this.used_components.includes(decl.name)) this.used_components.push(decl.name);
    const props = [...decl.properties];
    const byName = new Map(props.map((p) => [p.name, p]));
    const bound = new Map<string, Value>();
    const positional: Value[] = [];
    for (const arg of call.args) {
      if (arg.label === null) positional.push(this.value(arg.value, env));
      else if (byName.has(arg.label)) bound.set(arg.label, this.value(arg.value, env));
      else this.diags.warning(`struct ${decl.name} has no property ${strRepr(arg.label)}`, call.loc, "argument");
    }
    for (const [label, closure] of call.trailing) {
      const thunk = new Thunk(closure, env);
      if (label === null) {
        const target = props.find((p) => isViewProperty(p) && !bound.has(p.name) && !p.attributes.includes("computed"));
        if (target === undefined) {
          this.diags.warning(`struct ${decl.name} has no view property for a trailing closure`, call.loc, "argument");
        } else bound.set(target.name, thunk);
      } else if (byName.has(label)) bound.set(label, thunk);
      else this.diags.warning(`struct ${decl.name} has no property ${strRepr(label)}`, call.loc, "argument");
    }
    const senv = new Env();
    let posIndex = 0;
    const nextPositional = (): Value | typeof MISSING => (posIndex < positional.length ? positional[posIndex++] : MISSING);
    for (const p of props) {
      if (p.attributes.includes("computed")) {
        senv.vars.set(p.name, new Thunk(p.default as A.Closure, senv));
        continue;
      }
      if (bound.has(p.name)) {
        senv.vars.set(p.name, bound.get(p.name));
        continue;
      }
      const nxt = nextPositional();
      if (nxt !== MISSING) senv.vars.set(p.name, nxt);
      else if (p.default !== null) senv.vars.set(p.name, this.value(p.default, senv));
      else if (this.preview && this.depth === 0) senv.vars.set(p.name, isViewProperty(p) ? null : p.name); // placeholder text in a preview
      else {
        if (!p.type.endsWith("?")) {
          this.diags.error(`missing argument ${strRepr(p.name)} for struct ${decl.name}`, call.loc, "argument");
        }
        senv.vars.set(p.name, null);
      }
    }
    if (nextPositional() !== MISSING) this.diags.warning(`too many arguments for struct ${decl.name}`, call.loc, "argument");
    if (decl.body === null) {
      this.diags.error(`struct ${decl.name} has no \`var body: some View { … }\``, decl.loc, "struct");
      return [];
    }
    this.depth += 1;
    let views: View[];
    try {
      views = this.block(decl.body, senv);
    } finally {
      this.depth -= 1;
    }
    for (const v of views) v.component = v.component || decl.name;
    return views;
  }

  private labelFor(el: { attrFor(l: string): string | undefined }, label: string): string {
    const own = el.attrFor(label);
    if (own) return own;
    return this.p.attrs.get(label, label) as string;
  }

  private elementView(name: string, call: A.Call, env: Env): View {
    const el = this.p.element(name)!;
    const attrs = el.default_attrs;
    const extra: Value[] = [];
    const positional: Value[] = [];
    for (const arg of call.args) {
      const val = this.value(arg.value, env);
      if (arg.label === null) positional.push(val);
      else attrs.set(this.labelFor(el, arg.label), val);
    }
    positional.forEach((val, i) => {
      if (i < el.params.length) attrs.set(el.params[i], val);
      else extra.push(val);
    });
    const view = new View(name, el.role, { element: el, attrs, extra_args: extra, loc: call.loc });
    for (const [label, closure] of call.trailing) {
      const views = this.block(closure.body, env);
      if (label === null) view.children = views;
      else view.slots.set(this.labelFor(el, label), views);
    }
    // A closure passed as a labelled argument (`content: { … }`) is a slot too.
    for (const [k, val] of attrs.items()) {
      const key = k as string;
      if (val instanceof Thunk) {
        if (["action", "onCommit", "onEditingChanged", "perform"].includes(key)) {
          attrs.delete(key);
          continue;
        }
        const views = this.runThunk(val);
        attrs.delete(key);
        if (key === "content" && !view.children.length) view.children = views;
        else view.slots.set(key, views);
      } else if (val instanceof ViewList) {
        if (!view.slots.has(key)) view.slots.set(key, val.views);
      }
    }
    return view;
  }

  private applyModifier(member: A.Member, call: A.Call, env: Env): View[] {
    const targets = this.views(member.base, env);
    const name = member.name;
    if (IGNORED.has(name) && !this.p.modifiers.has(name)) {
      return targets; // behaviour only (.onTapGesture { … }): its closures are never evaluated
    }
    const args: Value[] = [];
    const kwargs = new PyDict<Value>();
    for (const arg of call.args) {
      const val = this.value(arg.value, env);
      if (arg.label === null) args.push(val);
      else kwargs.set(arg.label, val);
    }
    let content: View[] | null = null;
    const slots = new Map<string, View[]>();
    for (const [label, closure] of call.trailing) {
      const views = this.block(closure.body, env);
      if (label === null) content = views;
      else slots.set(label, views);
    }
    for (const k of kwargs.keys()) {
      const key = k as string;
      const val = kwargs.get(key);
      if (val instanceof Thunk) {
        kwargs.delete(key);
        if (key !== "action" && key !== "perform") slots.set(key, this.runThunk(val));
      } else if (val instanceof ViewList && content === null && key === "content") {
        content = val.views;
      }
    }
    if (content === null) {
      const i = args.findIndex((a) => a instanceof ViewList);
      if (i >= 0) {
        content = (args[i] as ViewList).views;
        args.splice(i, 1);
      }
    }
    const spec = this.p.modifiers.get(name, null) as PyDict<Value> | null;
    if (spec === null && !RENDERED.has(name) && !IGNORED.has(name)) {
      this.diags.warning(`unknown modifier .${name}() is ignored`, member.loc, "modifier");
      return targets;
    }
    if (IGNORED.has(name) && spec === null) return targets;
    const targetsToMark = ONCE_MODIFIERS.has(name) && targets.length > 1 ? targets.slice(0, 1) : targets;
    for (const v of targetsToMark) {
      if (spec !== null) {
        const attr = spec.get("attr", name) as string;
        let value: Value;
        if (spec.has("value")) value = spec.get("value");
        else if (args.length) value = args[0];
        else if (kwargs.size) value = kwargs.values()[0];
        else value = true;
        if (value instanceof EnumValue) value = value.name;
        v.attrs.set(attr, value);
      } else {
        v.modifiers.push(new Modifier(name, [...args], kwargs.copy(), content, slots, member.loc));
      }
    }
    return targets;
  }

  // --- values ----------------------------------------------------------------------------------

  value(expr: A.Node, env: Env): Value {
    switch (expr.kind) {
      case "Literal":
        return expr.value;
      case "StringLit":
        return expr.parts.map((p) => (typeof p === "string" ? p : formatValue(this.value(p, env)))).join("");
      case "Ident": {
        const [found, val] = env.lookup(expr.name);
        if (found) return val;
        if (this.structs.has(expr.name) || this.element(expr.name)) return new ViewList(this.views(expr, env));
        this.diags.error(`unknown name ${strRepr(expr.name)}`, expr.loc, "unknown");
        return null;
      }
      case "EnumCase":
        return new EnumValue(expr.name);
      case "Member":
        return this.memberValue(expr, env);
      case "Call":
        return this.callValue(expr, env);
      case "ArrayLit":
        return expr.items.map((i) => this.value(i, env));
      case "DictLit": {
        const d = new PyDict<Value>();
        for (const [k, v] of expr.items) {
          const key = k.kind === "Literal" ? k.value : formatValue(this.value(k, env));
          d.set(key, this.value(v, env));
        }
        return d;
      }
      case "TupleLit": {
        if (expr.items.some((a) => a.label)) {
          const d = new PyDict<Value>();
          expr.items.forEach((a, i) => d.set(a.label || String(i), this.value(a.value, env)));
          return d;
        }
        return tuple(expr.items.map((a) => this.value(a.value, env)));
      }
      case "RangeExpr": {
        const lo = this.value(expr.lo, env);
        const hi = this.value(expr.hi, env);
        if (isNumberLike(lo) && isNumberLike(hi) && !(isIntLike(lo) && isIntLike(hi))) {
          return [toFloat(lo), toFloat(hi)]; // a continuous range (Slider in: 0.2...0.8): its bounds
        }
        if (!isIntLike(lo) || !isIntLike(hi)) {
          this.diags.error("a range needs numeric bounds", expr.loc, "value");
          return [];
        }
        return range(num(lo), expr.inclusive ? num(hi) + 1 : num(hi));
      }
      case "Unary": {
        const v = this.value(expr.operand, env);
        if (expr.op === "!") return !truthy(v);
        if (isNumberLike(v)) return pyNeg(v);
        this.diags.error("'-' needs a number", expr.loc, "value");
        return null;
      }
      case "Binary":
        return this.binary(expr, env);
      case "Ternary":
        return this.value(truthy(this.value(expr.cond, env)) ? expr.then : expr.other, env);
      case "Subscript": {
        const base = this.value(expr.base, env);
        const idx = this.value(expr.index, env);
        try {
          return subscript(base, idx);
        } catch (e) {
          if (!(e instanceof PyError)) throw e;
          this.diags.error("subscript out of range", expr.loc, "value");
          return null;
        }
      }
      case "KeyPath":
        return null;
      case "Closure":
        return new Thunk(expr, env);
      default:
        this.diags.error("unsupported expression", expr.loc, "value");
        return null;
    }
  }

  private binary(expr: A.Binary, env: Env): Value {
    const op = expr.op;
    if (op === "&&") return truthy(this.value(expr.left, env)) && truthy(this.value(expr.right, env));
    if (op === "||") return truthy(this.value(expr.left, env)) || truthy(this.value(expr.right, env));
    const a = this.value(expr.left, env);
    const b = this.value(expr.right, env);
    try {
      switch (op) {
        case "==": return pyEq(a, b);
        case "!=": return !pyEq(a, b);
        case "+":
          if (typeof a === "string" || typeof b === "string") return formatValue(a) + formatValue(b);
          return pyAdd(a, b);
        case "-": return pySub(a, b);
        case "*": return pyMul(a, b);
        case "/": return pyDiv(a, b);
        case "<": return pyCompare(a, b, "<") < 0;
        case ">": return pyCompare(a, b, ">") > 0;
        case "<=": return pyCompare(a, b, "<=") <= 0;
        case ">=": return pyCompare(a, b, ">=") >= 0;
        default: return null;
      }
    } catch (e) {
      if (e instanceof PyError && (e.kind === "TypeError" || e.kind === "ZeroDivisionError")) {
        this.diags.error(`cannot apply ${strRepr(op)} to these values`, expr.loc, "value");
        return null;
      }
      throw e;
    }
  }

  /** Whether an expression's root is a view call (so a member call on it is a modifier). */
  private isViewExpr(expr: A.Node, env: Env): boolean {
    while (expr.kind === "Call" || expr.kind === "Member") expr = expr.kind === "Call" ? expr.callee : expr.base;
    if (expr.kind === "Ident") {
      const [found, val] = env.lookup(expr.name);
      if (found) return val instanceof Thunk || val instanceof ViewList;
      return this.structs.has(expr.name) || this.element(expr.name);
    }
    return false;
  }

  private memberValue(expr: A.Member, env: Env): Value {
    const base = expr.base;
    if (base.kind === "Ident") {
      const [found] = env.lookup(base.name);
      if (!found && !this.structs.has(base.name)) return new EnumValue(expr.name, base.name);
    }
    const val = this.value(base, env);
    const name = expr.name;
    if (val instanceof PyDict && val.has(name)) return val.get(name);
    if (typeof val === "string" || isSeq(val) || val instanceof PyDict) {
      if (name === "count") return pyLen(val);
      if (name === "isEmpty") return pyLen(val) === 0;
      if (isSeq(val) && (name === "first" || name === "last")) {
        return val.length ? (name === "first" ? val[0] : val[val.length - 1]) : null;
      }
    }
    if (isTuple(val) && isDigits(name) && parseDigits(name) < val.length) return val[parseDigits(name)];
    if (val instanceof EnumValue) return new EnumValue(name, val.name);
    if (typeof val === "string" && name === "self") return val;
    this.diags.error(`value has no member ${strRepr(name)}`, expr.loc, "value");
    return null;
  }

  private callValue(expr: A.Call, env: Env): Value {
    const callee = expr.callee;
    const args = expr.args.filter((a) => a.label === null).map((a) => this.value(a.value, env));
    const kwargs = expr.args.filter((a) => a.label !== null).map((a) => [a.label as string, this.value(a.value, env)] as const);
    if (callee.kind === "EnumCase") {
      if (callee.name === "constant" && args.length === 1) return args[0]; // Binding.constant(x)
      return new EnumValue(callee.name, "", args, kwargs);
    }
    if (callee.kind === "Ident") {
      const n = callee.name;
      if (this.structs.has(n) || n === "ForEach" || this.element(n)) return new ViewList(this.views(expr, env));
      const [found, val] = env.lookup(n);
      if (found && val instanceof Thunk) return new ViewList(this.runThunk(val));
      return new CallValue(n, args, kwargs);
    }
    if (callee.kind === "Member") {
      // String / collection methods; otherwise a view with modifiers used as a value.
      if (callee.name === "uppercased" || callee.name === "lowercased" || callee.name === "capitalized") {
        const s = this.value(callee.base, env);
        if (typeof s === "string") {
          return callee.name === "uppercased" ? s.toUpperCase() : callee.name === "lowercased" ? s.toLowerCase() : strTitle(s);
        }
      }
      if ((callee.name === "contains" || callee.name === "hasPrefix" || callee.name === "hasSuffix") && args.length === 1) {
        const seq = this.value(callee.base, env);
        if (callee.name === "contains" && (typeof seq === "string" || isSeq(seq) || seq instanceof PyDict)) {
          if (typeof seq === "string") return seq.includes(pyStr(args[0]));
          if (seq instanceof PyDict) return seq.has(args[0]);
          return seq.some((x) => pyEq(x, args[0]));
        }
        if (typeof seq === "string") {
          return callee.name === "hasPrefix" ? seq.startsWith(pyStr(args[0])) : seq.endsWith(pyStr(args[0]));
        }
      }
      if (callee.name === "joined") {
        const seq = this.value(callee.base, env);
        if (isSeq(seq)) {
          let sep: Value = "";
          for (const [k, v] of kwargs) if (k === "separator") sep = v;
          return seq.map(formatValue).join(pyStr(sep));
        }
      }
      if ((callee.base.kind === "EnumCase" || callee.base.kind === "Member" || callee.base.kind === "Call")
        && !this.isViewExpr(callee.base, env)) {
        const baseVal = this.value(callee.base, env);
        if (baseVal instanceof EnumValue) { // .red.opacity(0.3), .title.bold()
          return new EnumValue(callee.name, baseVal.name, args, kwargs);
        }
      }
      if (callee.base.kind === "Ident" && !env.lookup(callee.base.name)[0]
        && !this.element(callee.base.name) && !this.structs.has(callee.base.name)) {
        return new EnumValue(callee.name, callee.base.name, args, kwargs);
      }
      return new ViewList(this.views(expr, env));
    }
    return new CallValue("", args, kwargs);
  }
}

function textCall(text: Value, loc: Location): A.Call {
  return {
    kind: "Call", callee: { kind: "Ident", name: "Text", loc },
    args: [{ label: null, value: { kind: "Literal", value: text as A.LiteralValue, loc: new Location() } }],
    trailing: [], loc,
  };
}

/** Python's `list(range(lo, hi))`. */
function range(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let i = lo; i < hi; i++) out.push(i);
  return out;
}

/** Python's `base[idx]` for lists, tuples, strings and dicts. */
function subscript(base: Value, idx: Value): Value {
  if (base instanceof PyDict) return base.item(idx);
  if (isSeq(base) || typeof base === "string") {
    if (!isIntLike(idx)) throw new PyError("TypeError", "indices must be integers");
    const items: readonly Value[] = typeof base === "string" ? codePoints(base) : base;
    let i = num(idx);
    if (i < 0) i += items.length;
    if (i < 0 || i >= items.length) throw new PyError("IndexError", "index out of range");
    return items[i];
  }
  throw new PyError("TypeError", `'${pyTypeName(base)}' object is not subscriptable`);
}

// Re-exported for callers that format values the way the evaluator does.
export { floatRepr, formatG, isFloat, strLen };
