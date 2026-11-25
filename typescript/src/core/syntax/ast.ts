/**
 * Syntax tree of a mockitdown source (port of `mockitdown.syntax.ast`).
 *
 * Views and values share one expression grammar, exactly as in Swift: `Text("x").bold()` is a call
 * on a member of a call. The evaluator decides from context whether an expression produces views
 * or a value. Nodes are plain objects discriminated by `kind`, named after the Python classes.
 */

import { Location } from "../diagnostics.js";
import type { PyFloat } from "../values.js";

export type LiteralValue = string | number | PyFloat | boolean | null;

// --- expressions ---------------------------------------------------------------------------------

export interface Literal { kind: "Literal"; value: LiteralValue; loc: Location }
export interface StringLit { kind: "StringLit"; parts: (string | Node)[]; loc: Location }
export interface Ident { kind: "Ident"; name: string; loc: Location }
/** Implicit member expression: `.red`, `.title`, `.system(size: 12)`. */
export interface EnumCase { kind: "EnumCase"; name: string; loc: Location }
export interface Member { kind: "Member"; base: Node; name: string; loc: Location }
export interface Arg { label: string | null; value: Node }
export interface Closure { kind: "Closure"; params: string[]; body: Node[]; loc: Location }
/** Trailing closures in order; the first is unlabeled (label null), the rest labeled. */
export interface Call { kind: "Call"; callee: Node; args: Arg[]; trailing: [string | null, Closure][]; loc: Location }
export interface ArrayLit { kind: "ArrayLit"; items: Node[]; loc: Location }
export interface DictLit { kind: "DictLit"; items: [Node, Node][]; loc: Location }
export interface TupleLit { kind: "TupleLit"; items: Arg[]; loc: Location }
export interface RangeExpr { kind: "RangeExpr"; lo: Node; hi: Node; inclusive: boolean; loc: Location }
export interface Unary { kind: "Unary"; op: string; operand: Node; loc: Location }
export interface Binary { kind: "Binary"; op: string; left: Node; right: Node; loc: Location }
export interface Ternary { kind: "Ternary"; cond: Node; then: Node; other: Node; loc: Location }
export interface Subscript { kind: "Subscript"; base: Node; index: Node; loc: Location }
/** `\.self` / `\.id` — accepted (for `ForEach(id:)`) and otherwise ignored. */
export interface KeyPath { kind: "KeyPath"; path: string; loc: Location }

// --- statements ----------------------------------------------------------------------------------

export interface ExprStmt { kind: "ExprStmt"; expr: Node; loc: Location }
export interface IfStmt { kind: "IfStmt"; cond: Node; then: Node[]; other: Node[]; loc: Location }
export interface LetStmt { kind: "LetStmt"; name: string; value: Node; loc: Location }

export type Node =
  | Literal | StringLit | Ident | EnumCase | Member | Closure | Call | ArrayLit | DictLit | TupleLit
  | RangeExpr | Unary | Binary | Ternary | Subscript | KeyPath | ExprStmt | IfStmt | LetStmt;

// --- declarations --------------------------------------------------------------------------------

/** `import SwiftUI` (a pack module) or `import "path/to/file.mockitdown"` (components). */
export interface Import { module: string | null; path: string | null; loc: Location }

/** A top-level `@Screen(...)` directive (other attributes are parsed and dropped). */
export interface Attribute { name: string; args: Arg[]; loc: Location }

export interface Property {
  name: string;
  /** The type as written, e.g. "String", "some View", "[String]". */
  type: string;
  default: Node | null;
  is_let: boolean;
  attributes: string[];
  loc: Location;
}

const VIEW_TYPES = new Set(["someView", "View", "Content", "AnyView"]);

/** Whether a property holds views (a `@ViewBuilder` or view-typed property). */
export function isViewProperty(p: Property): boolean {
  const t = p.type.split(" ").join("");
  return p.attributes.includes("ViewBuilder") || VIEW_TYPES.has(t)
    || t.endsWith("->someView") || t.endsWith("->Content");
}

export interface StructDecl {
  kind: "StructDecl";
  name: string;
  conformances: string[];
  properties: Property[];
  /** Statements of `var body: some View { ... }`. */
  body: Node[] | null;
  source: string;
  loc: Location;
}

/** A parsed source: imports, directives, struct declarations and top-level view statements. */
export interface Module {
  imports: Import[];
  attributes: Attribute[];
  structs: StructDecl[];
  statements: Node[];
  source: string;
}

/** A location with no position, as the Python nodes' default. */
export function noLoc(): Location {
  return new Location();
}
