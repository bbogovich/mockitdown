/**
 * The inspector's edit internals (R-TOOL-007.C9, A-WEB-5.K2): the selected node an edit applies to, the
 * edit op that writes a field's code ({@link opFor}), and {@link applyChecked}, which checks an edit with
 * the edit API and the diagnostics it would add at the node before applying it through the session as
 * one coalesced change. Used by `inspect.ts`; not part of the public API of `mockitdown/design`.
 */

import type * as A from "../core/syntax/ast.js";
import type { Diagnostic } from "../core/diagnostics.js";
import { registry, type Pack } from "../core/packs/registry.js";
import { edit, type EditOp } from "../core/syntax/edit.js";
import type { SyntaxTree, ViewNode } from "../core/syntax/tree.js";
import { modifierTypes } from "../core/vocabulary.js";
import type { FieldResult, FieldTarget, InspectorField } from "./inspect.js";
import { codeOf, matchArgs, modifierList } from "./inspect-values.js";
import type { DesignSession } from "./session.js";

/** The registered pack of an id, or null. */
export function packOf(id: string | null | undefined): Pack | null {
  if (!id) return null;
  try {
    return registry.get(id);
  } catch {
    return null;
  }
}

/** The attribute a pack modifier sets (`.variant` and `.buttonStyle` set `variant`), or null. */
export function attrOf(p: Pack | null, name: string): string | null {
  const spec = p?.modifiers.get(name, null) as { get(k: string, d: unknown): unknown } | null | undefined;
  if (!spec || typeof spec.get !== "function") return null;
  const attr = spec.get("attr", name);
  return typeof attr === "string" ? attr : null;
}

/** The positions (`line:col`) of the labels the evaluator reports as not understood (R-EVAL-004.C7). */
export function notUnderstood(diagnostics: readonly Diagnostic[]): Set<string> {
  const out = new Set<string>();
  for (const d of diagnostics) {
    if (d.code === "argument" && d.location.source === "" && d.message.includes("is not understood by")) out.add(`${d.location.line}:${d.location.col}`);
  }
  return out;
}

export function selected(session: DesignSession): { tree: SyntaxTree; node: ViewNode } | { error: string } {
  const name = session.active;
  if (name === null) return { error: "there is no active mockup" };
  if (session.selection.length !== 1) return { error: "select one element" };
  const tree = session.tree(name);
  const node = tree?.byId(session.selection[0]!);
  if (!tree || !node) return { error: "the selected element is not in the mockup" };
  if (tree.source !== session.code(name)) return { error: `the code of mockup ${JSON.stringify(name)} does not parse` };
  return { tree, node };
}

/** The edit that writes a field's code (null removes it), or null when there is nothing to change. */
export function opFor(tree: SyntaxTree, node: ViewNode, field: InspectorField, code: string | null): EditOp | null {
  const t = field.target;
  switch (t.kind) {
    case "argument":
      if (code === null && !field.present) return null;
      return t.label === null
        ? { op: "setArgument", node: node.id, label: null, position: t.position, value: code }
        : { op: "setArgument", node: node.id, label: t.label, value: code };
    case "state":
      if (code === null && !field.present) return null;
      if (t.at.kind === "argument") return { op: "setArgument", node: node.id, label: t.label, value: code };
      if (t.at.kind === "modifier") return { op: "setModifier", node: node.id, name: t.at.name, index: t.at.index, args: code };
      if (t.at.modifier) return { op: "setModifier", node: node.id, name: t.label, index: 0, args: code };
      return { op: "setArgument", node: node.id, label: t.label, value: code };
    case "modifierCode":
      return { op: "setModifier", node: node.id, name: t.name, index: t.index, args: code ?? "" };
    case "modifier":
      return modifierOp(tree, node, t, code);
    case "id": {
      const id = code === null ? "" : code.trim();
      if (id === "" && !field.present) return null;
      if (id === field.value) return null;
      return { op: "rename", node: node.id, id: id === "" ? null : id };
    }
    case "comment": {
      const text = code ?? "";
      if (text === "" && !field.present) return null;
      if (text === field.value) return null;
      return { op: "setComment", node: node.id, text: text === "" ? null : text };
    }
    default:
      return null;
  }
}

/** One argument of a modifier set (null: removed); the others kept as written, in their order. */
export function modifierOp(tree: SyntaxTree, node: ViewNode, t: Extract<FieldTarget, { kind: "modifier" }>, code: string | null): EditOp | null {
  const m = modifierList(node).find((x) => x.name === t.name && x.index === t.index);
  if (!m) return null;
  const args = m.call?.args ?? [];
  const assigned = matchArgs(modifierTypes()[t.name]?.args ?? [], args) ?? new Map<string, A.Arg>();
  const keyOf = new Map<A.Arg, string>([...assigned].map(([k, a]) => [a, k]));
  const parts = args.map((a) => ({
    key: keyOf.get(a) ?? "", text: a.label === null ? codeOf(a.value, tree.source) : `${a.label}: ${codeOf(a.value, tree.source)}`,
  }));
  const at = parts.findIndex((p) => p.key === t.arg);
  const label = t.arg.startsWith("#") ? null : t.arg;
  const text = code === null ? null : label === null ? code : `${label}: ${code}`;
  if (at >= 0) {
    if (text === null) parts.splice(at, 1);
    else parts[at] = { key: t.arg, text };
  } else if (text === null) return null;
  else if (label === null) {
    // A positional argument goes before the first written argument the vocabulary lists after it.
    const k = Number(t.arg.slice(1));
    const i = parts.findIndex((p) => !p.key.startsWith("#") || Number(p.key.slice(1)) > k);
    parts.splice(i < 0 ? parts.length : i, 0, { key: t.arg, text });
  } else parts.push({ key: t.arg, text });
  return { op: "setModifier", node: node.id, name: t.name, index: t.index, args: parts.map((p) => p.text).join(", ") };
}

/**
 * C9: an edit is checked before it is applied. The edit API may refuse it (a value that does not parse,
 * an identifier in use), and the code it gives may hold diagnostics located at the node that the
 * current code does not; either way nothing is applied and the reason is returned.
 */
export function applyChecked(session: DesignSession, nodeId: string, op: EditOp, key: string): FieldResult {
  const name = session.active!;
  const tree = session.tree(name)!;
  const r = edit(tree, op);
  if ("error" in r) return { ok: false, error: sentence(r.error), diagnostics: r.diagnostics };
  if (!r.edits.length) return { ok: true };
  const before = atNode(session.diagnostics(name), tree.source, tree.byId(nodeId));
  const after = atNode(session.diagnosticsOf(name, r.source), r.source, r.tree.byId(nodeId));
  const added = minus(after, before);
  if (added.length) return { ok: false, error: added[0]!.message, diagnostics: added };
  const applied = session.apply(op, { coalesce: key });
  if ("error" in applied) return { ok: false, error: sentence(applied.error), diagnostics: applied.diagnostics };
  return { ok: true };
}

/** The diagnostics located in a node's span. */
export function atNode(diagnostics: readonly Diagnostic[], src: string, node: ViewNode | null): Diagnostic[] {
  if (!node) return [];
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) starts.push(i + 1);
  return diagnostics.filter((d) => {
    if (d.location.source !== "" || d.location.line < 1) return false;
    const at = (starts[d.location.line - 1] ?? Infinity) + d.location.col - 1;
    return at >= node.span.start && at < node.span.end;
  });
}

/** The diagnostics of `a` that `b` does not have, by severity, code and message, counted. */
export function minus(a: readonly Diagnostic[], b: readonly Diagnostic[]): Diagnostic[] {
  const counts = new Map<string, number>();
  const k = (d: Diagnostic): string => `${d.severity}\n${d.code}\n${d.message}`;
  for (const d of b) counts.set(k(d), (counts.get(k(d)) ?? 0) + 1);
  const out: Diagnostic[] = [];
  for (const d of a) {
    const n = counts.get(k(d)) ?? 0;
    if (n > 0) counts.set(k(d), n - 1);
    else out.push(d);
  }
  return out;
}

export function refuse(error: string): FieldResult {
  return { ok: false, error: sentence(error), diagnostics: [] };
}

export function sentence(text: string): string {
  return text ? text[0]!.toUpperCase() + text.slice(1) : text;
}
