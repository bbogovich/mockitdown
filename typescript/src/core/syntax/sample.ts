/**
 * The code a new element is inserted as (R-TOOL-006.C1) and the text its first argument holds
 * (R-TOOL-006.C2): the core's rules, which the design session and the gallery use (A-WEB-5.K2).
 *
 * An element is inserted as the top-level call of its reference sample (R-PACK-013), with that call's
 * arguments and modifiers as written and without its trailing closures: `List() { Text("First item") }`
 * becomes `List()`, `NavigationSplitView { … }` becomes `NavigationSplitView()`, and
 * `Image().frame(width: 160, height: 96)` stays as it is. A sample that is not one call of the
 * element (a `Tab` shown inside a `TabView`, several statements, code that does not parse) gives
 * `<Name>()`, as does a missing sample.
 */

import type * as A from "./ast.js";
import { parseTree, type ViewNode } from "./tree.js";

/** The code an element is inserted as: its sample's top-level call without trailing closures, else `<name>()`. */
export function sampleCall(name: string, sample?: string | null): string {
  const bare = `${name}()`;
  if (!sample) return bare;
  const { tree } = parseTree(sample);
  if (!tree) return bare;
  const m = tree.module;
  if (m.statements.length !== 1 || m.structs.length || m.imports.length || m.attributes.length) return bare;
  const roots = tree.roots;
  const root = roots[0];
  if (roots.length !== 1 || !root || root.kind !== "call" || root.name !== name) return bare;
  const call = root.syntax as A.Call;
  const text = tree.source;
  const end = root.span.end;
  if (!call.trailing.length) return text.slice(root.first, end).trim();
  const first = call.trailing[0]![1];
  const last = call.trailing[call.trailing.length - 1]![1];
  if (first.start === undefined || last.end === undefined) return bare;
  // The text before the first closure without its spaces; a call written without parentheses gets them.
  let head = text.slice(root.first, first.start).replace(/[ \t\r\n]+$/, "");
  if (!head.endsWith(")")) head = `${head}()`;
  return `${head}${text.slice(last.end, end)}`.trim();
}

/**
 * The text of a node's first positional argument when it is a string literal without interpolation
 * (R-TOOL-006.C2), else null.
 */
export function firstText(node: ViewNode): string | null {
  if (node.kind !== "call") return null;
  const arg = (node.syntax as A.Call).args.find((a) => a.label === null);
  if (!arg) return null;
  const v = arg.value;
  if (v.kind === "Literal") return typeof v.value === "string" ? v.value : null;
  if (v.kind !== "StringLit") return null;
  return v.parts.every((p) => typeof p === "string") ? (v.parts as string[]).join("") : null;
}
