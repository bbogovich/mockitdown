"""Syntax tree of a mockitdown source.

Views and values share one expression grammar, exactly as in Swift: ``Text("x").bold()`` is a call
on a member of a call. The evaluator decides from context whether an expression produces views
or a value.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from ..diagnostics import Location


class Node:
    loc: Location


# --- expressions ---------------------------------------------------------------------------------

@dataclass
class Literal(Node):
    value: object  # str | int | float | bool | None
    loc: Location = field(default_factory=Location)


@dataclass
class StringLit(Node):
    parts: list  # list[str | Expr]
    loc: Location = field(default_factory=Location)


@dataclass
class Ident(Node):
    name: str
    loc: Location = field(default_factory=Location)


@dataclass
class EnumCase(Node):
    """Implicit member expression: ``.red``, ``.title``, ``.system(size: 12)``."""

    name: str
    loc: Location = field(default_factory=Location)


@dataclass
class Member(Node):
    base: Node
    name: str
    loc: Location = field(default_factory=Location)


@dataclass
class Arg:
    label: str | None
    value: Node


@dataclass
class Closure(Node):
    params: list[str]
    body: list[Node]  # statements
    loc: Location = field(default_factory=Location)


@dataclass
class Call(Node):
    callee: Node
    args: list[Arg]
    #: Trailing closures in order; the first is unlabeled (label None), the rest labeled.
    trailing: list[tuple[str | None, Closure]] = field(default_factory=list)
    loc: Location = field(default_factory=Location)


@dataclass
class ArrayLit(Node):
    items: list[Node]
    loc: Location = field(default_factory=Location)


@dataclass
class DictLit(Node):
    items: list[tuple[Node, Node]]
    loc: Location = field(default_factory=Location)


@dataclass
class TupleLit(Node):
    items: list[Arg]
    loc: Location = field(default_factory=Location)


@dataclass
class RangeExpr(Node):
    lo: Node
    hi: Node
    inclusive: bool
    loc: Location = field(default_factory=Location)


@dataclass
class Unary(Node):
    op: str
    operand: Node
    loc: Location = field(default_factory=Location)


@dataclass
class Binary(Node):
    op: str
    left: Node
    right: Node
    loc: Location = field(default_factory=Location)


@dataclass
class Ternary(Node):
    cond: Node
    then: Node
    other: Node
    loc: Location = field(default_factory=Location)


@dataclass
class Subscript(Node):
    base: Node
    index: Node
    loc: Location = field(default_factory=Location)


@dataclass
class KeyPath(Node):
    """``\\.self`` / ``\\.id`` — accepted (for ``ForEach(id:)``) and otherwise ignored."""

    path: str
    loc: Location = field(default_factory=Location)


# --- statements ----------------------------------------------------------------------------------

@dataclass
class ExprStmt(Node):
    expr: Node
    loc: Location = field(default_factory=Location)


@dataclass
class IfStmt(Node):
    cond: Node
    then: list[Node]
    other: list[Node]
    loc: Location = field(default_factory=Location)


@dataclass
class LetStmt(Node):
    name: str
    value: Node
    loc: Location = field(default_factory=Location)


# --- declarations --------------------------------------------------------------------------------

@dataclass
class Import(Node):
    """``import SwiftUI`` (a pack module) or ``import "path/to/file.mockitdown"`` (components)."""

    module: str | None = None
    path: str | None = None
    loc: Location = field(default_factory=Location)


@dataclass
class Attribute(Node):
    """A top-level ``@Screen(...)`` directive (other attributes are parsed and dropped)."""

    name: str
    args: list[Arg]
    loc: Location = field(default_factory=Location)


@dataclass
class Property:
    name: str
    type: str  # the type as written, e.g. "String", "some View", "[String]"
    default: Node | None
    is_let: bool
    attributes: list[str]
    loc: Location = field(default_factory=Location)

    @property
    def is_view(self) -> bool:
        t = self.type.replace(" ", "")
        return ("ViewBuilder" in self.attributes or t in {"someView", "View", "Content", "AnyView"}
                or t.endswith("->someView") or t.endswith("->Content"))


@dataclass
class StructDecl(Node):
    name: str
    conformances: list[str]
    properties: list[Property]
    body: list[Node] | None  # statements of `var body: some View { ... }`
    source: str = ""
    loc: Location = field(default_factory=Location)


@dataclass
class Module:
    """A parsed source: imports, directives, struct declarations and top-level view statements."""

    imports: list[Import] = field(default_factory=list)
    attributes: list[Attribute] = field(default_factory=list)
    structs: list[StructDecl] = field(default_factory=list)
    statements: list[Node] = field(default_factory=list)
    source: str = ""
