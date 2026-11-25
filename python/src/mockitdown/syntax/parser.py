"""Recursive-descent parser: tokens → :class:`~mockitdown.syntax.ast.Module`.

Grammar (informal; see the specification's language reference for the normative form)::

    module     := { import | attribute | struct | preview | statement }
    import     := 'import' ( STRING | IDENT { '.' IDENT } )
    attribute  := '@' IDENT [ '(' args ')' ]            -- top level: a directive such as @Screen
    struct     := 'struct' IDENT [ ':' IDENT { ',' IDENT } ] '{' { property } '}'
    property   := { '@' IDENT | modifier-kw } ('var'|'let') IDENT [ ':' type ] [ '=' expr ] [ block ]
    preview    := '#' 'Preview' [ '(' args ')' ] block   -- its statements become top-level ones
    statement  := 'if' expr block [ 'else' ( if | block ) ] | 'let' IDENT '=' expr | expr
    expr       := ternary over || && comparison range additive multiplicative unary postfix
    postfix    := primary { '.' IDENT | '(' args ')' | '[' expr ']' | trailing-closures }
    primary    := NUMBER | STRING | true | false | nil | IDENT | '.' IDENT | array | dict
                | tuple | closure | '\\' '.' path | '$' IDENT

Newlines separate statements. A newline before ``.name`` continues a modifier chain, as in Swift.
A call's ``(`` and a trailing closure's ``{`` must be on the same line as what they follow.
"""

from __future__ import annotations

from ..diagnostics import Diagnostic, Location, MockitdownSyntaxError, Severity
from . import ast as A
from .lexer import Interpolation, Lexer, Token

_DECL_MODIFIERS = {"private", "public", "fileprivate", "internal", "static"}
#: Top-level attributes that are directives rather than declaration attributes.
DIRECTIVES = frozenset({"Screen"})


class Parser:
    def __init__(self, tokens: list[Token], source: str = "") -> None:
        self.toks = tokens
        self.pos = 0
        self.source = source

    # --- token helpers ---------------------------------------------------------------------------

    def peek(self, k: int = 0) -> Token:
        return self.toks[min(self.pos + k, len(self.toks) - 1)]

    def at(self, kind: str, value: str | None = None, k: int = 0) -> bool:
        t = self.peek(k)
        return t.kind == kind and (value is None or t.value == value)

    def at_kw(self, word: str) -> bool:
        return self.at("KEYWORD", word)

    def next(self) -> Token:
        t = self.toks[self.pos]
        if t.kind != "EOF":
            self.pos += 1
        return t

    def error(self, msg: str, tok: Token | None = None) -> MockitdownSyntaxError:
        t = tok or self.peek()
        return MockitdownSyntaxError(Diagnostic(Severity.ERROR, msg, t.location, "syntax"))

    def expect(self, kind: str, what: str | None = None) -> Token:
        if not self.at(kind):
            t = self.peek()
            found = "end of input" if t.kind == "EOF" else repr(t.value if isinstance(t.value, str) else t.kind)
            raise self.error(f"expected {what or kind.lower()}, found {found}")
        return self.next()

    def skip_newlines(self) -> None:
        while self.peek().kind in ("NEWLINE", "SEMI"):
            self.pos += 1

    def skip_nl_only(self) -> None:
        while self.peek().kind == "NEWLINE":
            self.pos += 1

    def end_statement(self) -> None:
        if self.peek().kind in ("NEWLINE", "SEMI"):
            self.skip_newlines()
        elif not self.at("RBRACE") and not self.at("EOF"):
            raise self.error("expected a new line or ';' between statements")

    # --- module ----------------------------------------------------------------------------------

    def parse_module(self) -> A.Module:
        mod = A.Module(source=self.source)
        self.skip_newlines()
        while not self.at("EOF"):
            if self.at_kw("import"):
                mod.imports.append(self.parse_import())
            elif self.at("HASH") and self.at("IDENT", "Preview", 1):
                mod.statements.extend(self.parse_preview())
            elif self.at("AT") or self.at_kw("struct") or self.peek().value in _DECL_MODIFIERS:
                decl = self.parse_decl_or_attribute()
                if isinstance(decl, A.StructDecl):
                    mod.structs.append(decl)
                elif decl is not None:
                    mod.attributes.append(decl)
            else:
                mod.statements.append(self.parse_statement())
            self.end_statement()
        return mod

    def parse_import(self) -> A.Import:
        tok = self.next()  # import
        if self.at("STRING"):
            s = self.next()
            parts = s.value
            if len(parts) != 1 or not isinstance(parts[0], str):
                raise self.error("an import path cannot contain interpolation", s)
            return A.Import(path=parts[0], loc=tok.location)
        name = self.expect("IDENT", "a module name or a quoted path").value
        while self.at("DOT"):
            self.next()
            name += "." + self.expect("IDENT", "a module name").value
        return A.Import(module=name, loc=tok.location)

    def parse_preview(self) -> list[A.Node]:
        self.next()  # '#'
        self.next()  # Preview
        if self.at("LPAREN"):
            self.parse_args()
        return self.parse_block()

    def parse_decl_or_attribute(self) -> A.StructDecl | A.Attribute | None:
        attrs: list[A.Attribute] = []
        while True:
            if self.at("AT"):
                at = self.next()
                name = self.expect("IDENT", "an attribute name").value
                args = self.parse_args() if self.at("LPAREN") else []
                attrs.append(A.Attribute(name, args, at.location))
                if name in DIRECTIVES:
                    return attrs[-1]
                # Continue across newlines only when more of a declaration follows.
                k = 0
                while self.peek(k).kind == "NEWLINE":
                    k += 1
                nxt = self.peek(k)
                if nxt.kind == "AT" or (nxt.kind == "KEYWORD" and (nxt.value == "struct" or nxt.value in _DECL_MODIFIERS)):
                    self.pos += k
            elif self.peek().value in _DECL_MODIFIERS and self.peek().kind == "KEYWORD":
                self.next()
            else:
                break
        if self.at_kw("struct"):
            return self.parse_struct()
        if len(attrs) == 1:
            return attrs[0]  # a bare top-level attribute is a directive (@Screen)
        raise self.error("expected 'struct' after attributes")

    def parse_struct(self) -> A.StructDecl:
        start_tok = self.next()  # struct
        start = self.pos
        name = self.expect("IDENT", "a struct name").value
        conformances: list[str] = []
        if self.at("COLON"):
            self.next()
            conformances.append(self.expect("IDENT", "a protocol name").value)
            while self.at("COMMA"):
                self.next()
                conformances.append(self.expect("IDENT", "a protocol name").value)
        self.skip_nl_only()
        self.expect("LBRACE", "'{'")
        props: list[A.Property] = []
        body: list[A.Node] | None = None
        while True:
            self.skip_newlines()
            if self.at("RBRACE"):
                self.next()
                break
            if self.at("EOF"):
                raise self.error(f"struct {name} is missing its closing '}}'")
            prop_attrs: list[str] = []
            while self.at("AT") or (self.peek().kind == "KEYWORD" and self.peek().value in _DECL_MODIFIERS):
                if self.at("AT"):
                    self.next()
                    prop_attrs.append(self.expect("IDENT", "an attribute name").value)
                    if self.at("LPAREN"):
                        self.parse_args()
                else:
                    self.next()
                self.skip_nl_only()
            if not (self.at_kw("var") or self.at_kw("let")):
                if self.at("IDENT", "init") or self.at("IDENT", "func"):
                    raise self.error(f"struct {name}: initializers and functions are not supported; "
                                     "declare properties and a `body`")
                raise self.error(f"struct {name}: expected a 'var' or 'let' property")
            is_let = self.next().value == "let"
            ptok = self.expect("IDENT", "a property name")
            ptype = ""
            if self.at("COLON"):
                self.next()
                ptype = self.parse_type_text()
            default = None
            if self.at("ASSIGN"):
                self.next()
                self.skip_nl_only()
                default = self.parse_expr()
            if self.at("LBRACE"):
                block = self.parse_block()
                if ptok.value == "body":
                    body = block
                # other computed properties are views too: store as a closure default
                else:
                    default = A.Closure([], block, ptok.location)
                    if "View" not in ptype:
                        ptype = ptype or "some View"
                if ptok.value != "body":
                    props.append(A.Property(ptok.value, ptype, default, is_let, prop_attrs + ["computed"],
                                            ptok.location))
                continue
            props.append(A.Property(ptok.value, ptype, default, is_let, prop_attrs, ptok.location))
        return A.StructDecl(name, conformances, props, body, self.source, start_tok.location)

    def parse_type_text(self) -> str:
        depth = 0
        words: list[str] = []
        while True:
            t = self.peek()
            if t.kind == "EOF":
                break
            if depth == 0 and t.kind in ("ASSIGN", "LBRACE", "NEWLINE", "SEMI", "RBRACE"):
                break
            if t.kind in ("LT", "LBRACKET", "LPAREN"):
                depth += 1
            elif t.kind in ("GT", "RBRACKET", "RPAREN"):
                depth -= 1
            self.next()
            words.append(t.value if isinstance(t.value, str) else str(t.value))
        text = ""
        for w in words:
            text += (" " if text and (w[:1].isalnum() and text[-1:].isalnum()) else "") + w
        return text

    # --- statements ------------------------------------------------------------------------------

    def parse_block(self) -> list[A.Node]:
        self.expect("LBRACE", "'{'")
        return self._statements_until_rbrace()

    def _statements_until_rbrace(self) -> list[A.Node]:
        stmts: list[A.Node] = []
        while True:
            self.skip_newlines()
            if self.at("RBRACE"):
                self.next()
                return stmts
            if self.at("EOF"):
                raise self.error("missing '}'")
            stmts.append(self.parse_statement())
            self.end_statement()

    def parse_statement(self) -> A.Node:
        t = self.peek()
        if self.at_kw("if"):
            return self.parse_if()
        if self.at_kw("let") or self.at_kw("var"):
            self.next()
            name = self.expect("IDENT", "a name").value
            if self.at("COLON"):
                self.next()
                self.parse_type_text()
            self.expect("ASSIGN", "'='")
            self.skip_nl_only()
            return A.LetStmt(name, self.parse_expr(), t.location)
        if self.at_kw("return"):
            self.next()
        return A.ExprStmt(self.parse_expr(), t.location)

    def parse_if(self) -> A.IfStmt:
        tok = self.next()  # if
        cond = self.parse_expr(no_trailing=True)
        then = self.parse_block()
        other: list[A.Node] = []
        save = self.pos
        self.skip_nl_only()
        if self.at_kw("else"):
            self.next()
            other = [self.parse_if()] if self.at_kw("if") else self.parse_block()
        else:
            self.pos = save
        return A.IfStmt(cond, then, other, tok.location)

    # --- expressions -----------------------------------------------------------------------------

    def parse_expr(self, no_trailing: bool = False) -> A.Node:
        cond = self.parse_binary(0, no_trailing)
        if self.at("QUESTION"):
            q = self.next()
            self.skip_nl_only()
            then = self.parse_expr(no_trailing)
            self.skip_nl_only()
            self.expect("COLON", "':' in a conditional expression")
            self.skip_nl_only()
            other = self.parse_expr(no_trailing)
            return A.Ternary(cond, then, other, q.location)
        return cond

    _LEVELS = (
        ("OR",),
        ("AND",),
        ("EQ", "NE", "LT", "GT", "LE", "GE"),
        ("RANGE_CLOSED", "RANGE_HALF"),
        ("PLUS", "MINUS"),
        ("STAR", "SLASH"),
    )

    def parse_binary(self, level: int, no_trailing: bool) -> A.Node:
        if level == len(self._LEVELS):
            return self.parse_unary(no_trailing)
        left = self.parse_binary(level + 1, no_trailing)
        while self.peek().kind in self._LEVELS[level]:
            op = self.next()
            self.skip_nl_only()
            right = self.parse_binary(level + 1, no_trailing)
            if op.kind in ("RANGE_CLOSED", "RANGE_HALF"):
                left = A.RangeExpr(left, right, op.kind == "RANGE_CLOSED", op.location)
            else:
                left = A.Binary(op.value, left, right, op.location)
        return left

    def parse_unary(self, no_trailing: bool) -> A.Node:
        if self.at("BANG") or self.at("MINUS"):
            op = self.next()
            return A.Unary(op.value, self.parse_unary(no_trailing), op.location)
        return self.parse_postfix(self.parse_primary(no_trailing), no_trailing)

    def parse_postfix(self, expr: A.Node, no_trailing: bool) -> A.Node:
        while True:
            t = self.peek()
            if t.kind == "DOT" and self.peek(1).kind == "NUMBER" and isinstance(self.peek(1).value, int):
                self.next()  # tuple element: pair.0
                num = self.next()
                expr = A.Member(expr, str(num.value), num.location)
                continue
            if t.kind == "DOT" and self.peek(1).kind in ("IDENT", "KEYWORD"):
                self.next()
                name = self.next()
                expr = A.Member(expr, name.value, name.location)
                continue
            if t.kind == "NEWLINE":
                # Leading-dot modifier continuation on a following line.
                k = 0
                while self.peek(k).kind == "NEWLINE":
                    k += 1
                if self.peek(k).kind == "DOT" and self.peek(k + 1).kind in ("IDENT", "KEYWORD"):
                    self.pos += k
                    continue
                return expr
            if t.kind == "LPAREN":
                args = self.parse_args()
                expr = A.Call(expr, args, [], t.location)
                expr = self.parse_trailing(expr, no_trailing)
                continue
            if t.kind == "LBRACE" and not no_trailing and self._callable(expr):
                expr = self.parse_trailing(A.Call(expr, [], [], t.location), no_trailing)
                continue
            if t.kind == "LBRACKET":
                self.next()
                self.skip_nl_only()
                idx = self.parse_expr()
                self.skip_nl_only()
                self.expect("RBRACKET", "']'")
                expr = A.Subscript(expr, idx, t.location)
                continue
            if t.kind == "BANG" and self.peek(1).kind not in ("IDENT",):  # force unwrap: ignore
                self.next()
                continue
            return expr

    @staticmethod
    def _callable(expr: A.Node) -> bool:
        return isinstance(expr, (A.Ident, A.Member, A.EnumCase, A.Call))

    def parse_trailing(self, call: A.Call, no_trailing: bool) -> A.Call:
        if no_trailing:
            return call
        if self.at("LBRACE"):
            call.trailing.append((None, self.parse_closure()))
        elif (self.peek().kind in ("IDENT", "KEYWORD") and self.at("COLON", k=1) and self.at("LBRACE", k=2)):
            # Only labelled closures, on the same line: `Banner("x") actions: { … }`
            label = self.next().value
            self.next()
            call.trailing.append((label, self.parse_closure()))
        # Labeled trailing closures: `} label: { ... }`, possibly on following lines.
        while call.trailing:
            k = 0
            while self.peek(k).kind == "NEWLINE":
                k += 1
            if (self.peek(k).kind in ("IDENT", "KEYWORD") and self.peek(k + 1).kind == "COLON"
                    and self.peek(k + 2).kind == "LBRACE"):
                self.pos += k
                label = self.next().value
                self.next()  # ':'
                call.trailing.append((label, self.parse_closure()))
            else:
                break
        return call

    def parse_closure(self) -> A.Closure:
        tok = self.expect("LBRACE", "'{'")
        self.skip_nl_only()
        params: list[str] = []
        # Lookahead for `a, b in` or `(a, b) in` or `_ in`.
        k = 0
        paren = self.peek().kind == "LPAREN"
        if paren:
            k = 1
        names: list[str] = []
        ok = False
        while True:
            t = self.peek(k)
            if t.kind == "IDENT":
                names.append(t.value)
                k += 1
                if self.peek(k).kind == "COLON":  # typed param `x: Int`
                    k += 2
                if self.peek(k).kind == "COMMA":
                    k += 1
                    continue
                if paren and self.peek(k).kind == "RPAREN":
                    k += 1
                if self.peek(k).kind == "KEYWORD" and self.peek(k).value == "in":
                    ok = True
                    k += 1
            break
        if ok:
            params = names
            self.pos += k
        body = self._statements_until_rbrace()
        return A.Closure(params, body, tok.location)

    def parse_args(self) -> list[A.Arg]:
        self.expect("LPAREN", "'('")
        args: list[A.Arg] = []
        while True:
            self.skip_nl_only()
            if self.at("RPAREN"):
                self.next()
                return args
            label = None
            if self.peek().kind in ("IDENT", "KEYWORD") and self.at("COLON", k=1):
                label = self.next().value
                self.next()
                self.skip_nl_only()
            args.append(A.Arg(label, self.parse_expr()))
            self.skip_nl_only()
            if self.at("COMMA"):
                self.next()
            elif not self.at("RPAREN"):
                raise self.error("expected ',' or ')' in an argument list")

    def parse_primary(self, no_trailing: bool) -> A.Node:
        t = self.peek()
        k = t.kind
        if k == "NUMBER":
            self.next()
            return A.Literal(t.value, t.location)
        if k == "STRING":
            self.next()
            return self._string_node(t)
        if k == "KEYWORD" and t.value in ("true", "false"):
            self.next()
            return A.Literal(t.value == "true", t.location)
        if k == "KEYWORD" and t.value == "nil":
            self.next()
            return A.Literal(None, t.location)
        if k == "IDENT":
            self.next()
            return A.Ident(t.value, t.location)
        if k == "DOLLAR":  # $binding → the bound value
            self.next()
            name = self.expect("IDENT", "a name after '$'")
            return A.Ident(name.value, name.location)
        if k == "DOT":
            self.next()
            name = self.peek()
            if name.kind not in ("IDENT", "KEYWORD"):
                raise self.error("expected a name after '.'")
            self.next()
            return A.EnumCase(name.value, name.location)
        if k == "BACKSLASH":
            self.next()
            path = ""
            if self.at("IDENT"):
                path = self.next().value
            while self.at("DOT"):
                self.next()
                path += "." + str(self.next().value)
            return A.KeyPath(path, t.location)
        if k == "LBRACKET":
            return self.parse_collection()
        if k == "LPAREN":
            self.next()
            items: list[A.Arg] = []
            while True:
                self.skip_nl_only()
                if self.at("RPAREN"):
                    self.next()
                    break
                label = None
                if self.at("IDENT") and self.at("COLON", k=1):
                    label = self.next().value
                    self.next()
                items.append(A.Arg(label, self.parse_expr()))
                self.skip_nl_only()
                if self.at("COMMA"):
                    self.next()
                elif not self.at("RPAREN"):
                    raise self.error("expected ',' or ')'")
            if len(items) == 1 and items[0].label is None:
                return items[0].value
            return A.TupleLit(items, t.location)
        if k == "LBRACE":
            return self.parse_closure()
        found = "end of input" if k == "EOF" else repr(t.value if isinstance(t.value, str) else k)
        raise self.error(f"expected an expression, found {found}")

    def parse_collection(self) -> A.Node:
        tok = self.next()  # [
        self.skip_nl_only()
        if self.at("COLON") and self.at("RBRACKET", k=1):  # [:]
            self.next()
            self.next()
            return A.DictLit([], tok.location)
        items: list[A.Node] = []
        pairs: list[tuple[A.Node, A.Node]] = []
        while True:
            self.skip_nl_only()
            if self.at("RBRACKET"):
                self.next()
                break
            first = self.parse_expr()
            self.skip_nl_only()
            if self.at("COLON"):
                self.next()
                self.skip_nl_only()
                pairs.append((first, self.parse_expr()))
            else:
                items.append(first)
            self.skip_nl_only()
            if self.at("COMMA"):
                self.next()
            elif not self.at("RBRACKET"):
                raise self.error("expected ',' or ']'")
        if pairs and items:
            raise self.error("a collection literal mixes array and dictionary entries", tok)
        return A.DictLit(pairs, tok.location) if pairs else A.ArrayLit(items, tok.location)

    def _string_node(self, tok: Token) -> A.Node:
        parts: list[object] = []
        for p in tok.value:
            if isinstance(p, Interpolation):
                sub = Lexer(p.source, p.location.source, p.location.line, p.location.col).tokens()
                sp = Parser(sub, self.source)
                expr = sp.parse_expr()
                if not sp.at("EOF"):
                    raise sp.error("unexpected text in string interpolation")
                parts.append(expr)
            else:
                parts.append(p)
        if len(parts) == 1 and isinstance(parts[0], str):
            return A.Literal(parts[0], tok.location)
        return A.StringLit(parts, tok.location)


def parse(src: str, source: str = "") -> A.Module:
    """Parse mockitdown source. Raises :class:`MockitdownSyntaxError` on the first syntax error."""
    from .lexer import tokenize

    return Parser(tokenize(src, source), source).parse_module()


__all__ = ["parse", "Parser", "Location"]
