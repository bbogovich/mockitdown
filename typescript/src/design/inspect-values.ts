/**
 * The inspector's value internals (R-TOOL-007, A-WEB-5.K2): how a written value node is read by its type
 * ({@link readValue}), how a control's input becomes code ({@link valueCode}), the default code of a new
 * argument, the leading comment of a node, and the node's modifier chain with each written modifier's
 * arguments matched to its vocabulary entry. Used by `inspect.ts` and `inspect-edits.ts`; not part of
 * the public API of `mockitdown/design`.
 */

import type * as A from "../core/syntax/ast.js";
import type { TypeSpec } from "../core/paramtypes.js";
import { stringLiteral } from "../core/syntax/edit.js";
import type { SyntaxTree, ViewNode } from "../core/syntax/tree.js";
import type { FieldValue, InspectorControl, ValueForm } from "./inspect.js";

export const TEXT: TypeSpec = Object.freeze({ type: "text" });

// --- the modifier chain ---------------------------------------------------------------------------

export interface ChainModifier {
  name: string;
  index: number;
  syntax: A.Call | A.Member;
  call: A.Call | null;
}

/** The node's modifier chain with each modifier's name and occurrence index. */
export function modifierList(node: ViewNode): ChainModifier[] {
  const seen = new Map<string, number>();
  return node.modifiers.map((m) => {
    const name = m.kind === "Call" ? (m.callee as A.Member).name : m.name;
    const index = seen.get(name) ?? 0;
    seen.set(name, index + 1);
    return { name, index, syntax: m, call: m.kind === "Call" ? m : null };
  });
}

/**
 * The written arguments of a modifier by the key of the vocabulary argument each one is (`label`, or
 * `#k` for the k-th), positional ones matched in order to the next positional argument whose type reads
 * them; null when an argument matches none (the modifier is then edited as code).
 */
export function matchArgs(spec: readonly { label: string | null; type: TypeSpec }[], args: readonly A.Arg[]): Map<string, A.Arg> | null {
  const out = new Map<string, A.Arg>();
  let k = 0;
  for (const a of args) {
    if (a.label !== null) {
      if (!spec.some((s) => s.label === a.label) || out.has(a.label)) return null;
      out.set(a.label, a);
      continue;
    }
    while (k < spec.length && (spec[k]!.label !== null || !readValue(spec[k]!.type, a.value))) k++;
    if (k >= spec.length) return null;
    out.set(`#${k}`, a);
    k++;
  }
  return out;
}

// --- values ---------------------------------------------------------------------------------------

export function controlOf(type: TypeSpec): InspectorControl {
  switch (type.type) {
    case "text": return "text";
    case "number": return "number";
    case "bool": return "switch";
    case "enum": return "choice";
    case "color": return "color";
    case "icon": return "icon";
    case "array": return "list";
  }
}

/** A value node read by a type: its value and how it is written, or null when the type cannot show it. */
export function readValue(type: TypeSpec, v: A.Node): { value: FieldValue; form: ValueForm } | null {
  switch (type.type) {
    case "text":
    case "icon": {
      const s = stringOf(v);
      return s === null ? null : { value: s, form: "string" };
    }
    case "number": {
      const n = numberOf(v);
      return n === null ? null : { value: n, form: "string" };
    }
    case "bool":
      return v.kind === "Literal" && typeof v.value === "boolean" ? { value: v.value, form: "string" } : null;
    case "enum": {
      if (v.kind === "EnumCase") return type.values.includes(v.name) ? { value: v.name, form: "enum" } : null;
      const s = stringOf(v);
      return s !== null && type.values.includes(s) ? { value: s, form: "string" } : null;
    }
    case "color": {
      if (v.kind === "EnumCase") return { value: v.name, form: "enum" };
      const s = stringOf(v);
      return s !== null && colourOk(s) ? { value: s, form: "string" } : null;
    }
    case "array": {
      if (v.kind !== "ArrayLit") return null;
      const items: string[] = [];
      for (const i of v.items) {
        const r = readValue(type.items, i);
        if (!r || r.value === null || Array.isArray(r.value)) return null;
        items.push(String(r.value));
      }
      return { value: items, form: "string" };
    }
  }
}

/** The code a control makes of an input; null removes, when `removable`. */
export function valueCode(control: InspectorControl, type: TypeSpec | null, input: unknown, form: ValueForm, removable: boolean): { code: string | null } | { error: string } {
  const text = input === null || input === undefined ? "" : typeof input === "string" ? input : String(input);
  const empty = (): { code: null } | { error: string } => (removable ? { code: null } : { error: "a value is required" });
  switch (control) {
    case "text":
      return { code: stringLiteral(text) };
    case "icon":
      return text === "" ? empty() : { code: stringLiteral(text) };
    case "number": {
      if (text.trim() === "") return empty();
      const r = numberValue(text, type as Extract<TypeSpec, { type: "number" }>);
      return "error" in r ? r : { code: String(r.value) };
    }
    case "switch":
      return { code: input === true || text === "true" ? "true" : "false" };
    case "choice": {
      if (text === "") return empty();
      const values = type && type.type === "enum" ? type.values : [];
      if (!values.includes(text)) return { error: `${JSON.stringify(text)} is not one of ${values.join(", ")}` };
      return { code: form === "enum" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(text) ? `.${text}` : stringLiteral(text) };
    }
    case "color": {
      const t = text.trim();
      if (t === "") return empty();
      if (!colourOk(t)) return { error: `${JSON.stringify(t)} is not a colour name or a #hex value` };
      return { code: t.startsWith("#") || form === "string" ? stringLiteral(t) : `.${t}` };
    }
    case "list": {
      if (!Array.isArray(input)) return { error: "a list is required" };
      const items = type && type.type === "array" ? type.items : TEXT;
      const codes: string[] = [];
      for (const [i, x] of (input as unknown[]).entries()) {
        const r = valueCode(controlOf(items), items, x, "string", false);
        if ("error" in r) return { error: `item ${i + 1}: ${r.error}` };
        codes.push(r.code!);
      }
      return { code: `[${codes.join(", ")}]` };
    }
    case "code":
      return text.trim() === "" ? empty() : { code: text };
    default:
      return { error: "this field cannot be edited" };
  }
}

export function numberValue(input: unknown, type: Extract<TypeSpec, { type: "number" }> | null): { value: number } | { error: string } {
  const text = typeof input === "number" ? String(input) : String(input ?? "").trim();
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(text)) return { error: `${JSON.stringify(text)} is not a number` };
  const value = Number(text);
  if (type?.min !== undefined && value < type.min) return { error: `must be at least ${type.min}` };
  if (type?.max !== undefined && value > type.max) return { error: `must be at most ${type.max}` };
  return { value };
}

export function colourOk(s: string): boolean {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(s) || /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

/** The value a new argument of a type is added with (C2). */
export function defaultCode(type: TypeSpec): string {
  switch (type.type) {
    case "text": return '""';
    case "number": return String(type.min !== undefined && type.min > 0 ? type.min : 0);
    case "bool": return "true";
    case "enum": return stringLiteral(type.values[0]!);
    case "color": return ".blue";
    case "icon": return '"star"';
    case "array": return "[]";
  }
}

export function stringOf(v: A.Node): string | null {
  if (v.kind === "Literal") return typeof v.value === "string" ? v.value : null;
  if (v.kind !== "StringLit") return null;
  return v.parts.every((p) => typeof p === "string") ? (v.parts as string[]).join("") : null;
}

export function numberOf(v: A.Node): number | null {
  if (v.kind === "Literal") {
    const x = v.value as unknown;
    if (typeof x === "number") return x;
    if (x && typeof x === "object" && typeof (x as { value?: unknown }).value === "number") return (x as { value: number }).value;
    return null;
  }
  if (v.kind === "Unary" && (v.op === "-" || v.op === "+")) {
    const n = numberOf(v.operand);
    return n === null ? null : v.op === "-" ? -n : n;
  }
  return null;
}

export function codeOf(v: A.Node, src: string): string {
  return v.start !== undefined && v.end !== undefined ? src.slice(v.start, v.end) : "";
}

/** A call's arguments as code (`label: value, …`), each value as written. */
export function argsCode(call: A.Call, src: string): string {
  return call.args.map((a) => (a.label === null ? codeOf(a.value, src) : `${a.label}: ${codeOf(a.value, src)}`)).join(", ");
}

/** The text of the comment lines leading a node (R-EDIT-001.C11), or null when none lead it. */
export function leadingComment(tree: SyntaxTree, node: ViewNode): string | null {
  const src = tree.source;
  if (node.span.start >= node.first) return null;
  const start = src.lastIndexOf("\n", node.span.start - 1) + 1;
  const end = src.lastIndexOf("\n", node.first - 1) + 1;
  if (end <= start) return null;
  return src.slice(start, end).replace(/\n$/, "").split("\n").map((l) => l.trim().replace(/^\/\/ ?/, "")).join("\n");
}
