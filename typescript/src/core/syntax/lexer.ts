/**
 * Lexer for the mockitdown language, a declarative subset of Swift / SwiftUI (port of
 * `mockitdown.syntax.lexer`).
 *
 * Newlines are significant only as statement separators (the parser decides when to skip them).
 * String literals keep their interpolation segments: a STRING token's `value` is a list of parts,
 * each either a string (literal text) or an {@link Interpolation} holding the raw source of the
 * `\( ... )` expression and where it starts, so the parser can parse it in place.
 *
 * The source is scanned by code point, as Python indexes strings, so columns match the Python
 * variant's for any text (`🚀` is one column).
 */

import { Diagnostic, Location, MockitdownSyntaxError } from "../diagnostics.js";
import { isPySpace, PyFloat, strRepr } from "../values.js";

export const KEYWORDS: ReadonlySet<string> = new Set([
  "import", "struct", "var", "let", "if", "else", "in", "true", "false", "nil", "some", "private",
  "public", "fileprivate", "internal", "static", "return",
]);

/** Longest punctuation first. */
const PUNCT: readonly [string, string][] = [
  ["..<", "RANGE_HALF"], ["...", "RANGE_CLOSED"], ["==", "EQ"], ["!=", "NE"], ["&&", "AND"],
  ["||", "OR"], ["->", "ARROW"], ["<=", "LE"], [">=", "GE"],
  ["{", "LBRACE"], ["}", "RBRACE"], ["(", "LPAREN"], [")", "RPAREN"], ["[", "LBRACKET"],
  ["]", "RBRACKET"], [",", "COMMA"], [":", "COLON"], [";", "SEMI"], [".", "DOT"], ["=", "ASSIGN"],
  ["!", "BANG"], ["@", "AT"], ["#", "HASH"], ["+", "PLUS"], ["-", "MINUS"], ["*", "STAR"],
  ["/", "SLASH"], ["<", "LT"], [">", "GT"], ["?", "QUESTION"], ["\\", "BACKSLASH"], ["$", "DOLLAR"],
  ["&", "AMP"],
];

const ESCAPES: Readonly<Record<string, string>> = {
  n: "\n", t: "\t", r: "\r", "0": "\0", '"': '"', "'": "'", "\\": "\\",
};

export class Interpolation {
  readonly source: string;
  readonly location: Location;
  constructor(source: string, location: Location) {
    this.source = source;
    this.location = location;
  }
  pyRepr(): string {
    return `Interpolation(source=${strRepr(this.source)}, location=${this.location.pyRepr()})`;
  }
}

export type StringPart = string | Interpolation;
export type TokenValue = string | number | PyFloat | readonly StringPart[];

export class Token {
  readonly kind: string;
  readonly value: TokenValue;
  readonly location: Location;
  constructor(kind: string, value: TokenValue, location: Location) {
    this.kind = kind;
    this.value = value;
    this.location = location;
  }
  get text(): string {
    return typeof this.value === "string" ? this.value : "";
  }
}

function err(msg: string, loc: Location): MockitdownSyntaxError {
  return new MockitdownSyntaxError(new Diagnostic("error", msg, loc, "syntax"));
}

/** Python's `str.isdigit()` for one character (decimal digits). */
export function isDigit(c: string | undefined): boolean {
  return c !== undefined && /^\p{Nd}$/u.test(c);
}

/** Python's `str.isalpha()` for one character. */
export function isAlpha(c: string | undefined): boolean {
  return c !== undefined && /^\p{L}$/u.test(c);
}

/** Python's `str.isalnum()` for one character. */
export function isAlnum(c: string | undefined): boolean {
  return c !== undefined && /^[\p{L}\p{N}]$/u.test(c);
}

/** Python's `int(text, 16)` (signs, `0x` and single underscores allowed); null when invalid. */
function parseHex(text: string): number | null {
  const m = /^\s*([+-]?)(?:0[xX]_?)?([0-9a-fA-F]+(?:_[0-9a-fA-F]+)*)\s*$/.exec(text);
  if (!m) return null;
  const n = parseInt(m[2].replace(/_/g, ""), 16);
  return m[1] === "-" ? -n : n;
}

export class Lexer {
  private readonly cps: string[];
  private readonly source: string;
  private i = 0;
  private line: number;
  private col: number;

  constructor(src: string, source = "", line = 1, col = 1) {
    this.cps = Array.from(src);
    this.source = source;
    this.line = line;
    this.col = col;
  }

  loc(): Location {
    return new Location(this.line, this.col, this.source);
  }

  private advance(n = 1): void {
    for (let k = 0; k < n; k++) {
      if (this.i < this.cps.length && this.cps[this.i] === "\n") {
        this.line += 1;
        this.col = 1;
      } else {
        this.col += 1;
      }
      this.i += 1;
    }
  }

  /** `src.startswith(text, at)`. */
  private startsWith(text: string, at: number): boolean {
    const t = Array.from(text);
    for (let k = 0; k < t.length; k++) if (this.cps[at + k] !== t[k]) return false;
    return true;
  }

  private slice(a: number, b: number): string {
    return this.cps.slice(a, b).join("");
  }

  tokens(): Token[] {
    const out: Token[] = [];
    const src = this.cps;
    while (this.i < src.length) {
      const c = src[this.i];
      if (c === "\n") {
        out.push(new Token("NEWLINE", "\n", this.loc()));
        this.advance();
        continue;
      }
      if (c === " " || c === "\t" || c === "\r" || c === "﻿") {
        this.advance();
        continue;
      }
      if (this.startsWith("//", this.i)) {
        while (this.i < src.length && src[this.i] !== "\n") this.advance();
        continue;
      }
      if (this.startsWith("/*", this.i)) {
        const start = this.loc();
        let depth = 0;
        while (this.i < src.length) {
          if (this.startsWith("/*", this.i)) {
            depth += 1;
            this.advance(2);
          } else if (this.startsWith("*/", this.i)) {
            depth -= 1;
            this.advance(2);
            if (depth === 0) break;
          } else {
            this.advance();
          }
        }
        if (depth) throw err("unterminated block comment", start);
        continue;
      }
      if (c === '"') {
        out.push(this.string());
        continue;
      }
      if (isDigit(c)) {
        out.push(this.number());
        continue;
      }
      if (isAlpha(c) || c === "_") {
        const start = this.loc();
        let j = this.i;
        while (j < src.length && (isAlnum(src[j]) || src[j] === "_")) j += 1;
        const word = this.slice(this.i, j);
        this.advance(j - this.i);
        out.push(new Token(KEYWORDS.has(word) ? "KEYWORD" : "IDENT", word, start));
        continue;
      }
      if (c === "`") { // Swift escaped identifier: `default`
        const start = this.loc();
        let j = this.i + 1;
        while (j < src.length && src[j] !== "`") j += 1;
        if (j >= src.length) throw err("unterminated escaped identifier", start);
        const word = this.slice(this.i + 1, j);
        this.advance(j + 1 - this.i);
        out.push(new Token("IDENT", word, start));
        continue;
      }
      let matched = false;
      for (const [text, kind] of PUNCT) {
        if (this.startsWith(text, this.i)) {
          out.push(new Token(kind, text, this.loc()));
          this.advance(text.length);
          matched = true;
          break;
        }
      }
      if (!matched) throw err(`unexpected character ${strRepr(c)}`, this.loc());
    }
    out.push(new Token("EOF", "", this.loc()));
    return out;
  }

  private number(): Token {
    const start = this.loc();
    const src = this.cps;
    let j = this.i;
    while (j < src.length && (isDigit(src[j]) || src[j] === "_")) j += 1;
    let isFloat = false;
    // A '.' followed by a digit is a fraction; '...' / '..<' are range operators.
    if (j + 1 < src.length && src[j] === "." && isDigit(src[j + 1])) {
      isFloat = true;
      j += 1;
      while (j < src.length && (isDigit(src[j]) || src[j] === "_")) j += 1;
    }
    const text = this.slice(this.i, j).split("_").join("");
    this.advance(j - this.i);
    const ascii = Array.from(text, (ch) => (ch === "." ? "." : String(digitOf(ch)))).join("");
    return new Token("NUMBER", isFloat ? new PyFloat(Number(ascii)) : Number(ascii), start);
  }

  private string(): Token {
    const start = this.loc();
    const src = this.cps;
    const multiline = this.startsWith('"""', this.i);
    this.advance(multiline ? 3 : 1);
    let parts: StringPart[] = [];
    let buf: string[] = [];
    for (;;) {
      if (this.i >= src.length) throw err("unterminated string literal", start);
      const c = src[this.i];
      if (multiline && this.startsWith('"""', this.i)) {
        this.advance(3);
        break;
      }
      if (!multiline && c === '"') {
        this.advance();
        break;
      }
      if (!multiline && c === "\n") throw err("unterminated string literal", start);
      if (c === "\\") {
        const nxt = this.i + 1 < src.length ? src[this.i + 1] : "";
        if (nxt === "(") {
          if (buf.length) {
            parts.push(buf.join(""));
            buf = [];
          }
          this.advance(2);
          const exprLoc = this.loc();
          let depth = 1;
          let j = this.i;
          while (j < src.length) {
            if (src[j] === "(") depth += 1;
            else if (src[j] === ")") {
              depth -= 1;
              if (depth === 0) break;
            } else if (src[j] === "\n" && !multiline) break;
            j += 1;
          }
          if (depth) throw err("unterminated string interpolation", exprLoc);
          parts.push(new Interpolation(this.slice(this.i, j), exprLoc));
          this.advance(j + 1 - this.i);
          continue;
        }
        if (nxt === "u" && this.startsWith("{", this.i + 2)) {
          let end = this.i + 3;
          while (end < src.length && src[end] !== "}") end += 1;
          if (end >= src.length) throw err("bad unicode escape", this.loc());
          const cp = parseHex(this.slice(this.i + 3, end));
          if (cp === null || cp < 0 || cp > 0x10ffff) throw err("bad unicode escape", this.loc());
          buf.push(String.fromCodePoint(cp));
          this.advance(end + 1 - this.i);
          continue;
        }
        if (nxt !== "" && Object.prototype.hasOwnProperty.call(ESCAPES, nxt)) {
          buf.push(ESCAPES[nxt]);
          this.advance(2);
          continue;
        }
        throw err(`unknown escape \\${nxt}`, this.loc());
      }
      buf.push(c);
      this.advance();
    }
    if (buf.length || !parts.length) parts.push(buf.join(""));
    if (multiline) parts = dedentMultiline(parts);
    return new Token("STRING", Object.freeze(parts), start);
  }
}

function digitOf(ch: string): number {
  const cp = ch.codePointAt(0)!;
  if (cp >= 0x30 && cp <= 0x39) return cp - 0x30;
  let start = cp;
  while (start > 0 && /\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--;
  return (cp - start) % 10;
}

/** Python's `str.strip()` emptiness test: only whitespace. */
function isBlank(s: string): boolean {
  return s.trim() === "" && !/[​]/.test(s);
}

/** Swift multi-line strings drop the first newline and the closing line's indentation. */
function dedentMultiline(parts: StringPart[]): StringPart[] {
  if (parts.length && typeof parts[0] === "string" && parts[0].startsWith("\n")) {
    parts[0] = parts[0].slice(1);
  }
  const last = parts[parts.length - 1];
  if (parts.length && typeof last === "string") {
    const cut = last.lastIndexOf("\n");
    if (cut >= 0 && isPySpace(last.slice(cut + 1))) {
      const indent = last.slice(cut + 1);
      parts[parts.length - 1] = last.slice(0, cut);
      if (indent) {
        parts = parts.map((p) => (typeof p === "string" ? p.split("\n" + indent).join("\n") : p));
        if (typeof parts[0] === "string" && parts[0].startsWith(indent)) {
          parts[0] = parts[0].slice(indent.length);
        }
      }
    }
  }
  return parts;
}

export function tokenize(src: string, source = ""): Token[] {
  return new Lexer(src, source).tokens();
}
