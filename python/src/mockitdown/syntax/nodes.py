"""View nodes of a parsed source and their ordinals (R-EDIT-001.C3, C4; R-EDIT-004.C3).

A *view node* is what a designer selects: a call whose callee is an identifier or a dotted name of
capitalised identifiers (``Text("a")``, ``VStack { … }``, ``Badge.Ribbon("New")``), wherever it stands
(statements, arguments, modifier arguments, ``let`` values); an identifier standing alone as a view
statement or as the base of a modifier chain in one (``Divider``, ``Spacer.frame(height: 8)``); and an
``if`` statement. A member call on a view (``.font(.title)``) is a modifier and belongs to the node whose
chain it is in.

The nodes are numbered from 1 in the order of their first tokens across the whole source, struct
bodies included, and written ``n<k>``: the same numbering as the TypeScript ``parseTree``
(``typescript/src/core/syntax/tree.ts``), computed from source positions alone, so that both variants
write the same ordinals into edit-mode HTML. This module is the Python side of that mapping; it has no
spans, ids or edit API (ADR-22.C2).
"""

from __future__ import annotations

from dataclasses import dataclass

from . import ast as A


@dataclass(frozen=True)
class ViewNode:
    #: ``n1``, ``n2``, … in source order.
    ordinal: str
    #: ``call``, ``ident`` or ``if``.
    kind: str
    #: The element or struct name as written (``Text``, ``Badge.Ribbon``); ``if`` for an ``if`` statement.
    name: str
    #: The syntax node: an :class:`~mockitdown.syntax.ast.Call`, ``Ident`` or ``IfStmt``.
    node: A.Node


def _is_type_segment(name: str) -> bool:
    """Whether a member segment continues a dotted type name (``Badge.Ribbon``) rather than modifying."""
    return name[:1].isupper()


def _dotted(callee: A.Node) -> str | None:
    if isinstance(callee, A.Ident):
        return callee.name
    if isinstance(callee, A.Member) and _is_type_segment(callee.name):
        base = _dotted(callee.base)
        return None if base is None else f"{base}.{callee.name}"
    return None


def _first(callee: A.Node) -> A.Node:
    """The leftmost identifier of a dotted callee: where the call's first token is."""
    while isinstance(callee, A.Member):
        callee = callee.base
    return callee


class _Collector:
    def __init__(self) -> None:
        self.found: list[tuple[tuple[int, int], str, str, A.Node]] = []

    def keep(self, kind: str, name: str, node: A.Node, at: A.Node) -> None:
        self.found.append(((at.loc.line, at.loc.col), kind, name, node))

    def struct(self, s: A.StructDecl) -> None:
        for p in s.properties:
            if p.default is not None:
                self.expr(p.default, False)
        if s.body:
            self.stmts(s.body)

    def stmts(self, stmts: list[A.Node]) -> None:
        for s in stmts:
            self.stmt(s)

    def stmt(self, s: A.Node) -> None:
        if isinstance(s, A.IfStmt):
            self.keep("if", "if", s, s)
            self.expr(s.cond, False)
            self.stmts(s.then)
            self.stmts(s.other)
        elif isinstance(s, A.ExprStmt):
            self.expr(s.expr, True)
        elif isinstance(s, A.LetStmt):
            self.expr(s.value, False)
        else:
            self.expr(s, False)

    def expr(self, e: A.Node, statement: bool) -> None:
        modifiers: list[A.Node] = []
        cur = e
        while True:
            if isinstance(cur, A.Call) and isinstance(cur.callee, A.Member) and _dotted(cur.callee) is None:
                modifiers.append(cur)
                cur = cur.callee.base
            elif isinstance(cur, A.Member) and _dotted(cur) is None:
                modifiers.append(cur)  # `Color.red`, or `view.modifier` without parentheses
                cur = cur.base
            else:
                break
        modifiers.reverse()
        root = False
        if isinstance(cur, A.Call) and _dotted(cur.callee) is not None:
            root = True
            self.keep("call", _dotted(cur.callee), cur, _first(cur.callee))
            for a in cur.args:
                self.expr(a.value, False)
            for _, c in cur.trailing:
                self.stmts(c.body)
        elif isinstance(cur, A.Ident) and statement:
            root = True
            self.keep("ident", cur.name, cur, cur)
        if root:
            for m in modifiers:
                if not isinstance(m, A.Call):
                    continue
                for a in m.args:
                    self.expr(a.value, False)
                for _, c in m.trailing:
                    self.stmts(c.body)
            return
        self.children(e)

    def children(self, e: A.Node) -> None:
        """The sub-expressions of an expression that is no view node."""
        if isinstance(e, A.Call):
            self.expr(e.callee, False)
            for a in e.args:
                self.expr(a.value, False)
            for _, c in e.trailing:
                self.stmts(c.body)
        elif isinstance(e, A.Member):
            self.expr(e.base, False)
        elif isinstance(e, A.Closure):
            self.stmts(e.body)
        elif isinstance(e, A.StringLit):
            for p in e.parts:
                if not isinstance(p, str):
                    self.expr(p, False)
        elif isinstance(e, A.ArrayLit):
            for x in e.items:
                self.expr(x, False)
        elif isinstance(e, A.DictLit):
            for k, v in e.items:
                self.expr(k, False)
                self.expr(v, False)
        elif isinstance(e, A.TupleLit):
            for a in e.items:
                self.expr(a.value, False)
        elif isinstance(e, A.RangeExpr):
            self.expr(e.lo, False)
            self.expr(e.hi, False)
        elif isinstance(e, A.Unary):
            self.expr(e.operand, False)
        elif isinstance(e, A.Binary):
            self.expr(e.left, False)
            self.expr(e.right, False)
        elif isinstance(e, A.Ternary):
            self.expr(e.cond, False)
            self.expr(e.then, False)
            self.expr(e.other, False)
        elif isinstance(e, A.Subscript):
            self.expr(e.base, False)
            self.expr(e.index, False)
        elif isinstance(e, (A.IfStmt, A.ExprStmt, A.LetStmt)):
            self.stmt(e)


def view_nodes(module: A.Module) -> list[ViewNode]:
    """The view nodes of a parsed source in ordinal order (R-EDIT-001.C3, C4)."""
    c = _Collector()
    for s in module.structs:
        c.struct(s)
    c.stmts(module.statements)
    c.found.sort(key=lambda f: f[0])
    return [ViewNode(f"n{i}", kind, name, node) for i, (_, kind, name, node) in enumerate(c.found, 1)]


def struct_view_nodes(decl: A.StructDecl) -> list[A.Node]:
    """The syntax nodes of a struct's view nodes, unnumbered: those of a struct from another source,
    whose views are derived from the call that instantiates them but carry no ordinal (R-EDIT-004.C5)."""
    c = _Collector()
    c.struct(decl)
    return [node for _, _, _, node in c.found]
