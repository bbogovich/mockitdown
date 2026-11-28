/**
 * Syntax tree of a mockitdown source (port of `mockitdown.syntax.ast`).
 *
 * Views and values share one expression grammar, exactly as in Swift: `Text("x").bold()` is a call
 * on a member of a call. The evaluator decides from context whether an expression produces views
 * or a value. Nodes are plain objects discriminated by `kind`, named after the Python classes.
 */

import { Location } from "../diagnostics.js";
import type { PyFloat } from "../values.js";

/**
 * Every node the parser builds also carries `start` and `end`: the UTF-16 offsets of its first code
 * unit and after its last one in the source (R-EDIT-001.C1). They are optional in the types because
 * the evaluator synthesises nodes of its own (`Color.red` as `Color(.red)`), which have none.
 */
export type LiteralValue = string | number | PyFloat | boolean | null;

// --- expressions ---------------------------------------------------------------------------------

export interface Literal { kind: "Literal"; value: LiteralValue; loc: Location; start?: number; end?: number }
export interface StringLit { kind: "StringLit"; parts: (string | Node)[]; loc: Location; start?: number; end?: number }
/** `binding` is set for `$name`, which evaluates to the bound value (R-EVAL-004.C9 exempts it). */
export interface Ident { kind: "Ident"; name: string; loc: Location; binding?: true; start?: number; end?: number }
/** Implicit member expression: `.red`, `.title`, `.system(size: 12)`. */
export interface EnumCase { kind: "EnumCase"; name: string; loc: Location; start?: number; end?: number }
export interface Member { kind: "Member"; base: Node; name: string; loc: Location; start?: number; end?: number }
/** `loc` is where the label was written (absent for a positional argument). */
export interface Arg { label: string | null; value: Node; loc?: Location }
export interface Closure { kind: "Closure"; params: string[]; body: Node[]; loc: Location; start?: number; end?: number }
/** Trailing closures in order; the first is unlabeled (label null), the rest labeled. */
export interface Call { kind: "Call"; callee: Node; args: Arg[]; trailing: [string | null, Closure][]; loc: Location; start?: number; end?: number }
export interface ArrayLit { kind: "ArrayLit"; items: Node[]; loc: Location; start?: number; end?: number }
export interface DictLit { kind: "DictLit"; items: [Node, Node][]; loc: Location; start?: number; end?: number }
export interface TupleLit { kind: "TupleLit"; items: Arg[]; loc: Location; start?: number; end?: number }
export interface RangeExpr { kind: "RangeExpr"; lo: Node; hi: Node; inclusive: boolean; loc: Location; start?: number; end?: number }
export interface Unary { kind: "Unary"; op: string; operand: Node; loc: Location; start?: number; end?: number }
export interface Binary { kind: "Binary"; op: string; left: Node; right: Node; loc: Location; start?: number; end?: number }
export interface Ternary { kind: "Ternary"; cond: Node; then: Node; other: Node; loc: Location; start?: number; end?: number }
export interface Subscript { kind: "Subscript"; base: Node; index: Node; loc: Location; start?: number; end?: number }
/** `\.self` / `\.id` — accepted (for `ForEach(id:)`) and otherwise ignored. */
export interface KeyPath { kind: "KeyPath"; path: string; loc: Location; start?: number; end?: number }

// --- statements ----------------------------------------------------------------------------------

export interface ExprStmt { kind: "ExprStmt"; expr: Node; loc: Location; start?: number; end?: number }
export interface IfStmt { kind: "IfStmt"; cond: Node; then: Node[]; other: Node[]; loc: Location; start?: number; end?: number }
export interface LetStmt { kind: "LetStmt"; name: string; value: Node; loc: Location; start?: number; end?: number }

export type Node =
  | Literal | StringLit | Ident | EnumCase | Member | Closure | Call | ArrayLit | DictLit | TupleLit
  | RangeExpr | Unary | Binary | Ternary | Subscript | KeyPath | ExprStmt | IfStmt | LetStmt;

// --- declarations --------------------------------------------------------------------------------

/** `import SwiftUI` (a pack module) or `import "path/to/file.mockitdown"` (components). */
export interface Import { module: string | null; path: string | null; loc: Location; start?: number; end?: number }

/** A top-level `@Screen(...)` directive (other attributes are parsed and dropped). */
export interface Attribute { name: string; args: Arg[]; loc: Location; start?: number; end?: number }

export interface Property {
  name: string;
  /** The type as written, e.g. "String", "some View", "[String]". */
  type: string;
  default: Node | null;
  is_let: boolean;
  attributes: string[];
  loc: Location;
  start?: number;
  end?: number;
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
  start?: number;
  end?: number;
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
