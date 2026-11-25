"""Lexer for the mockitdown language, a declarative subset of Swift / SwiftUI.

Newlines are significant only as statement separators (the parser decides when to skip them).
String literals keep their interpolation segments: a STRING token's ``value`` is a tuple of parts,
each either a ``str`` (literal text) or an :class:`Interpolation` holding the raw source of the
``\\( ... )`` expression and where it starts, so the parser can parse it in place.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..diagnostics import Diagnostic, Location, MockitdownSyntaxError, Severity

KEYWORDS = frozenset(
    {"import", "struct", "var", "let", "if", "else", "in", "true", "false", "nil", "some", "private",
     "public", "fileprivate", "internal", "static", "return"}
)

# Longest punctuation first.
_PUNCT = (
    ("..<", "RANGE_HALF"), ("...", "RANGE_CLOSED"), ("==", "EQ"), ("!=", "NE"), ("&&", "AND"),
    ("||", "OR"), ("->", "ARROW"), ("<=", "LE"), (">=", "GE"),
    ("{", "LBRACE"), ("}", "RBRACE"), ("(", "LPAREN"), (")", "RPAREN"), ("[", "LBRACKET"),
    ("]", "RBRACKET"), (",", "COMMA"), (":", "COLON"), (";", "SEMI"), (".", "DOT"), ("=", "ASSIGN"),
    ("!", "BANG"), ("@", "AT"), ("#", "HASH"), ("+", "PLUS"), ("-", "MINUS"), ("*", "STAR"),
    ("/", "SLASH"), ("<", "LT"), (">", "GT"), ("?", "QUESTION"), ("\\", "BACKSLASH"), ("$", "DOLLAR"),
    ("&", "AMP"),
)

_ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "0": "\0", '"': '"', "'": "'", "\\": "\\"}


@dataclass(frozen=True)
class Interpolation:
    source: str
    location: Location


@dataclass(frozen=True)
class Token:
    kind: str
    value: object
    location: Location

    @property
    def text(self) -> str:
        return self.value if isinstance(self.value, str) else ""


def _err(msg: str, loc: Location) -> MockitdownSyntaxError:
    return MockitdownSyntaxError(Diagnostic(Severity.ERROR, msg, loc, "syntax"))


class Lexer:
    def __init__(self, src: str, source: str = "", line: int = 1, col: int = 1) -> None:
        self.src = src
        self.source = source
        self.i = 0
        self.line = line
        self.col = col

    def loc(self) -> Location:
        return Location(self.line, self.col, self.source)

    def _advance(self, n: int = 1) -> None:
        for _ in range(n):
            if self.i < len(self.src) and self.src[self.i] == "\n":
                self.line += 1
                self.col = 1
            else:
                self.col += 1
            self.i += 1

    def tokens(self) -> list[Token]:
        out: list[Token] = []
        src = self.src
        while self.i < len(src):
            c = src[self.i]
            if c == "\n":
                out.append(Token("NEWLINE", "\n", self.loc()))
                self._advance()
                continue
            if c in " \t\r﻿":
                self._advance()
                continue
            if src.startswith("//", self.i):
                while self.i < len(src) and src[self.i] != "\n":
                    self._advance()
                continue
            if src.startswith("/*", self.i):
                start = self.loc()
                depth = 0
                while self.i < len(src):
                    if src.startswith("/*", self.i):
                        depth += 1
                        self._advance(2)
                    elif src.startswith("*/", self.i):
                        depth -= 1
                        self._advance(2)
                        if depth == 0:
                            break
                    else:
                        self._advance()
                if depth:
                    raise _err("unterminated block comment", start)
                continue
            if c == '"':
                out.append(self._string())
                continue
            if c.isdigit():
                out.append(self._number())
                continue
            if c.isalpha() or c == "_":
                start = self.loc()
                j = self.i
                while j < len(src) and (src[j].isalnum() or src[j] == "_"):
                    j += 1
                word = src[self.i:j]
                self._advance(j - self.i)
                out.append(Token("KEYWORD" if word in KEYWORDS else "IDENT", word, start))
                continue
            if c == "`":  # Swift escaped identifier: `default`
                start = self.loc()
                j = src.find("`", self.i + 1)
                if j < 0:
                    raise _err("unterminated escaped identifier", start)
                word = src[self.i + 1:j]
                self._advance(j + 1 - self.i)
                out.append(Token("IDENT", word, start))
                continue
            for text, kind in _PUNCT:
                if src.startswith(text, self.i):
                    out.append(Token(kind, text, self.loc()))
                    self._advance(len(text))
                    break
            else:
                raise _err(f"unexpected character {c!r}", self.loc())
        out.append(Token("EOF", "", self.loc()))
        return out

    def _number(self) -> Token:
        start = self.loc()
        src = self.src
        j = self.i
        while j < len(src) and (src[j].isdigit() or src[j] == "_"):
            j += 1
        is_float = False
        # A '.' followed by a digit is a fraction; '...' / '..<' are range operators.
        if j + 1 < len(src) and src[j] == "." and src[j + 1].isdigit():
            is_float = True
            j += 1
            while j < len(src) and (src[j].isdigit() or src[j] == "_"):
                j += 1
        text = src[self.i:j].replace("_", "")
        self._advance(j - self.i)
        return Token("NUMBER", float(text) if is_float else int(text), start)

    def _string(self) -> Token:
        start = self.loc()
        src = self.src
        multiline = src.startswith('"""', self.i)
        self._advance(3 if multiline else 1)
        parts: list[object] = []
        buf: list[str] = []
        while True:
            if self.i >= len(src):
                raise _err("unterminated string literal", start)
            c = src[self.i]
            if multiline and src.startswith('"""', self.i):
                self._advance(3)
                break
            if not multiline and c == '"':
                self._advance()
                break
            if not multiline and c == "\n":
                raise _err("unterminated string literal", start)
            if c == "\\":
                nxt = src[self.i + 1] if self.i + 1 < len(src) else ""
                if nxt == "(":
                    if buf:
                        parts.append("".join(buf))
                        buf = []
                    self._advance(2)
                    expr_loc = self.loc()
                    depth = 1
                    j = self.i
                    while j < len(src):
                        if src[j] == "(":
                            depth += 1
                        elif src[j] == ")":
                            depth -= 1
                            if depth == 0:
                                break
                        elif src[j] == "\n" and not multiline:
                            break
                        j += 1
                    if depth:
                        raise _err("unterminated string interpolation", expr_loc)
                    parts.append(Interpolation(src[self.i:j], expr_loc))
                    self._advance(j + 1 - self.i)
                    continue
                if nxt == "u" and src.startswith("{", self.i + 2):
                    end = src.find("}", self.i + 3)
                    if end < 0:
                        raise _err("bad unicode escape", self.loc())
                    try:
                        buf.append(chr(int(src[self.i + 3:end], 16)))
                    except ValueError:
                        raise _err("bad unicode escape", self.loc()) from None
                    self._advance(end + 1 - self.i)
                    continue
                if nxt in _ESCAPES:
                    buf.append(_ESCAPES[nxt])
                    self._advance(2)
                    continue
                raise _err(f"unknown escape \\{nxt}", self.loc())
            buf.append(c)
            self._advance()
        if buf or not parts:
            parts.append("".join(buf))
        if multiline:
            parts = _dedent_multiline(parts)
        return Token("STRING", tuple(parts), start)


def _dedent_multiline(parts: list[object]) -> list[object]:
    """Swift multi-line strings drop the first newline and the closing line's indentation."""
    if parts and isinstance(parts[0], str) and parts[0].startswith("\n"):
        parts[0] = parts[0][1:]
    if parts and isinstance(parts[-1], str):
        last = parts[-1]
        cut = last.rfind("\n")
        if cut >= 0 and not last[cut + 1:].strip():
            indent = last[cut + 1:]
            parts[-1] = last[:cut]
            if indent:
                parts = [p.replace("\n" + indent, "\n") if isinstance(p, str) else p for p in parts]
                if isinstance(parts[0], str) and parts[0].startswith(indent):
                    parts[0] = parts[0][len(indent):]
    return parts


def tokenize(src: str, source: str = "") -> list[Token]:
    return Lexer(src, source).tokens()
