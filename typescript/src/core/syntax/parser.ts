/**
 * Recursive-descent parser: tokens → {@link Module} (port of `mockitdown.syntax.parser`).
 *
 * Grammar (informal; see the specification's language reference for the normative form):
 *
 *     module     := { import | attribute | struct | preview | statement }
 *     import     := 'import' ( STRING | IDENT { '.' IDENT } )
 *     attribute  := '@' IDENT [ '(' args ')' ]            -- top level: a directive such as @Screen
 *     struct     := 'struct' IDENT [ ':' IDENT { ',' IDENT } ] '{' { property } '}'
 *     property   := { '@' IDENT | modifier-kw } ('var'|'let') IDENT [ ':' type ] [ '=' expr ] [ block ]
 *     preview    := '#' 'Preview' [ '(' args ')' ] block   -- its statements become top-level ones
 *     statement  := 'if' expr block [ 'else' ( if | block ) ] | 'let' IDENT '=' expr | expr
 *     expr       := ternary over || && comparison range additive multiplicative unary postfix
 *     postfix    := primary { '.' IDENT | '(' args ')' | '[' expr ']' | trailing-closures }
 *     primary    := NUMBER | STRING | true | false | nil | IDENT | '.' IDENT | array | dict
 *                 | tuple | closure | '\' '.' path | '$' IDENT
 *
 * Newlines separate statements. A newline before `.name` continues a modifier chain, as in Swift.
 * A call's `(` and a trailing closure's `{` must be on the same line as what they follow.
 */

import { Diagnostic, Location, MockitdownSyntaxError } from "../diagnostics.js";
import { pyRepr, pyStr, strRepr, tuple } from "../values.js";
import type * as A from "./ast.js";
import { Interpolation, Lexer, Token, tokenize, isAlnum } from "./lexer.js";

const DECL_MODIFIERS: ReadonlySet<string> = new Set(["private", "public", "fileprivate", "internal", "static"]);
/** Top-level attributes that are directives rather than declaration attributes. */
export const DIRECTIVES: ReadonlySet<string> = new Set(["Screen"]);

const LEVELS: readonly (readonly string[])[] = [
  ["OR"],
  ["AND"],
  ["EQ", "NE", "LT", "GT", "LE", "GE"],
  ["RANGE_CLOSED", "RANGE_HALF"],
  ["PLUS", "MINUS"],
  ["STAR", "SLASH"],
];

function isDeclModifier(t: Token): boolean {
  return typeof t.value === "string" && DECL_MODIFIERS.has(t.value);
}

/** Python's `repr(t.value if isinstance(t.value, str) else t.kind)`. */
function found(t: Token): string {
  return t.kind === "EOF" ? "end of input" : strRepr(typeof t.value === "string" ? t.value : t.kind);
}

/** Python's `str(t.value)` for a token value. */
function tokenText(t: Token): string {
  if (typeof t.value === "string") return t.value;
  if (Array.isArray(t.value)) return pyRepr(tuple(t.value));
  return pyStr(t.value);
}

export class Parser {
  private readonly toks: Token[];
  private pos = 0;
  private readonly source: string;

  constructor(tokens: Token[], source = "") {
    this.toks = tokens;
    this.source = source;
  }

  // --- token helpers ---------------------------------------------------------------------------

  peek(k = 0): Token {
    return this.toks[Math.min(this.pos + k, this.toks.length - 1)];
  }

  at(kind: string, value: string | null = null, k = 0): boolean {
    const t = this.peek(k);
    return t.kind === kind && (value === null || t.value === value);
  }

  atKw(word: string): boolean {
    return this.at("KEYWORD", word);
  }

  next(): Token {
    const t = this.toks[this.pos];
    if (t.kind !== "EOF") this.pos += 1;
    return t;
  }

  error(msg: string, tok?: Token): MockitdownSyntaxError {
    const t = tok ?? this.peek();
    return new MockitdownSyntaxError(new Diagnostic("error", msg, t.location, "syntax"));
  }

  expect(kind: string, what: string | null = null): Token {
    if (!this.at(kind)) {
      throw this.error(`expected ${what ?? kind.toLowerCase()}, found ${found(this.peek())}`);
    }
    return this.next();
  }

  private name(kind: string, what: string): string {
    return this.expect(kind, what).value as string;
  }

  skipNewlines(): void {
    while (this.peek().kind === "NEWLINE" || this.peek().kind === "SEMI") this.pos += 1;
  }

  skipNlOnly(): void {
    while (this.peek().kind === "NEWLINE") this.pos += 1;
  }

  endStatement(): void {
    if (this.peek().kind === "NEWLINE" || this.peek().kind === "SEMI") this.skipNewlines();
    else if (!this.at("RBRACE") && !this.at("EOF")) {
      throw this.error("expected a new line or ';' between statements");
    }
  }

  // --- module ----------------------------------------------------------------------------------

  parseModule(): A.Module {
    const mod: A.Module = { imports: [], attributes: [], structs: [], statements: [], source: this.source };
    this.skipNewlines();
    while (!this.at("EOF")) {
      if (this.atKw("import")) mod.imports.push(this.parseImport());
      else if (this.at("HASH") && this.at("IDENT", "Preview", 1)) mod.statements.push(...this.parsePreview());
      else if (this.at("AT") || this.atKw("struct") || isDeclModifier(this.peek())) {
        const decl = this.parseDeclOrAttribute();
        if ("kind" in decl && decl.kind === "StructDecl") mod.structs.push(decl);
        else mod.attributes.push(decl as A.Attribute);
      } else mod.statements.push(this.parseStatement());
      this.endStatement();
    }
    return mod;
  }

  parseImport(): A.Import {
    const tok = this.next(); // import
    if (this.at("STRING")) {
      const s = this.next();
      const parts = s.value as readonly unknown[];
      if (parts.length !== 1 || typeof parts[0] !== "string") {
        throw this.error("an import path cannot contain interpolation", s);
      }
      return { module: null, path: parts[0], loc: tok.location };
    }
    let name = this.name("IDENT", "a module name or a quoted path");
    while (this.at("DOT")) {
      this.next();
      name += "." + this.name("IDENT", "a module name");
    }
    return { module: name, path: null, loc: tok.location };
  }

  parsePreview(): A.Node[] {
    this.next(); // '#'
    this.next(); // Preview
    if (this.at("LPAREN")) this.parseArgs();
    return this.parseBlock();
  }

  parseDeclOrAttribute(): A.StructDecl | A.Attribute {
    const attrs: A.Attribute[] = [];
    for (;;) {
      if (this.at("AT")) {
        const at = this.next();
        const name = this.name("IDENT", "an attribute name");
        const args = this.at("LPAREN") ? this.parseArgs() : [];
        attrs.push({ name, args, loc: at.location });
        if (DIRECTIVES.has(name)) return attrs[attrs.length - 1];
        // Continue across newlines only when more of a declaration follows.
        let k = 0;
        while (this.peek(k).kind === "NEWLINE") k += 1;
        const nxt = this.peek(k);
        if (nxt.kind === "AT" || (nxt.kind === "KEYWORD" && (nxt.value === "struct" || isDeclModifier(nxt)))) {
          this.pos += k;
        }
      } else if (isDeclModifier(this.peek()) && this.peek().kind === "KEYWORD") {
        this.next();
      } else break;
    }
    if (this.atKw("struct")) return this.parseStruct();
    if (attrs.length === 1) return attrs[0]; // a bare top-level attribute is a directive (@Screen)
    throw this.error("expected 'struct' after attributes");
  }

  parseStruct(): A.StructDecl {
    const startTok = this.next(); // struct
    const name = this.name("IDENT", "a struct name");
    const conformances: string[] = [];
    if (this.at("COLON")) {
      this.next();
      conformances.push(this.name("IDENT", "a protocol name"));
      while (this.at("COMMA")) {
        this.next();
        conformances.push(this.name("IDENT", "a protocol name"));
      }
    }
    this.skipNlOnly();
    this.expect("LBRACE", "'{'");
    const props: A.Property[] = [];
    let body: A.Node[] | null = null;
    for (;;) {
      this.skipNewlines();
      if (this.at("RBRACE")) {
        this.next();
        break;
      }
      if (this.at("EOF")) throw this.error(`struct ${name} is missing its closing '}'`);
      const propAttrs: string[] = [];
      while (this.at("AT") || (this.peek().kind === "KEYWORD" && isDeclModifier(this.peek()))) {
        if (this.at("AT")) {
          this.next();
          propAttrs.push(this.name("IDENT", "an attribute name"));
          if (this.at("LPAREN")) this.parseArgs();
        } else this.next();
        this.skipNlOnly();
      }
      if (!(this.atKw("var") || this.atKw("let"))) {
        if (this.at("IDENT", "init") || this.at("IDENT", "func")) {
          throw this.error(`struct ${name}: initializers and functions are not supported; `
            + "declare properties and a `body`");
        }
        throw this.error(`struct ${name}: expected a 'var' or 'let' property`);
      }
      const isLet = this.next().value === "let";
      const ptok = this.expect("IDENT", "a property name");
      const pname = ptok.value as string;
      let ptype = "";
      if (this.at("COLON")) {
        this.next();
        ptype = this.parseTypeText();
      }
      let dflt: A.Node | null = null;
      if (this.at("ASSIGN")) {
        this.next();
        this.skipNlOnly();
        dflt = this.parseExpr();
      }
      if (this.at("LBRACE")) {
        const block = this.parseBlock();
        if (pname === "body") body = block;
        else {
          // other computed properties are views too: store as a closure default
          dflt = { kind: "Closure", params: [], body: block, loc: ptok.location };
          if (!ptype.includes("View")) ptype = ptype || "some View";
        }
        if (pname !== "body") {
          props.push({ name: pname, type: ptype, default: dflt, is_let: isLet,
            attributes: [...propAttrs, "computed"], loc: ptok.location });
        }
        continue;
      }
      props.push({ name: pname, type: ptype, default: dflt, is_let: isLet, attributes: propAttrs, loc: ptok.location });
    }
    return { kind: "StructDecl", name, conformances, properties: props, body, source: this.source, loc: startTok.location };
  }

  parseTypeText(): string {
    let depth = 0;
    const words: string[] = [];
    for (;;) {
      const t = this.peek();
      if (t.kind === "EOF") break;
      if (depth === 0 && ["ASSIGN", "LBRACE", "NEWLINE", "SEMI", "RBRACE"].includes(t.kind)) break;
      if (t.kind === "LT" || t.kind === "LBRACKET" || t.kind === "LPAREN") depth += 1;
      else if (t.kind === "GT" || t.kind === "RBRACKET" || t.kind === "RPAREN") depth -= 1;
      this.next();
      words.push(tokenText(t));
    }
    let text = "";
    for (const w of words) {
      const first = Array.from(w)[0];
      const lastCh = Array.from(text).pop();
      text += (text && isAlnum(first) && isAlnum(lastCh) ? " " : "") + w;
    }
    return text;
  }

  // --- statements ------------------------------------------------------------------------------

  parseBlock(): A.Node[] {
    this.expect("LBRACE", "'{'");
    return this.statementsUntilRbrace();
  }

  private statementsUntilRbrace(): A.Node[] {
    const stmts: A.Node[] = [];
    for (;;) {
      this.skipNewlines();
      if (this.at("RBRACE")) {
        this.next();
        return stmts;
      }
      if (this.at("EOF")) throw this.error("missing '}'");
      stmts.push(this.parseStatement());
      this.endStatement();
    }
  }

  parseStatement(): A.Node {
    const t = this.peek();
    if (this.atKw("if")) return this.parseIf();
    if (this.atKw("let") || this.atKw("var")) {
      this.next();
      const name = this.name("IDENT", "a name");
      if (this.at("COLON")) {
        this.next();
        this.parseTypeText();
      }
      this.expect("ASSIGN", "'='");
      this.skipNlOnly();
      return { kind: "LetStmt", name, value: this.parseExpr(), loc: t.location };
    }
    if (this.atKw("return")) this.next();
    return { kind: "ExprStmt", expr: this.parseExpr(), loc: t.location };
  }

  parseIf(): A.IfStmt {
    const tok = this.next(); // if
    const cond = this.parseExpr(true);
    const then = this.parseBlock();
    let other: A.Node[] = [];
    const save = this.pos;
    this.skipNlOnly();
    if (this.atKw("else")) {
      this.next();
      other = this.atKw("if") ? [this.parseIf()] : this.parseBlock();
    } else this.pos = save;
    return { kind: "IfStmt", cond, then, other, loc: tok.location };
  }

  // --- expressions -----------------------------------------------------------------------------

  parseExpr(noTrailing = false): A.Node {
    const cond = this.parseBinary(0, noTrailing);
    let k = 0;
    while (this.peek(k).kind === "NEWLINE") k++; // `?` on the next line continues the expression (R-LANG-006.C2)
    if (this.peek(k).kind === "QUESTION") {
      this.pos += k;
      const q = this.next();
      this.skipNlOnly();
      const then = this.parseExpr(noTrailing);
      this.skipNlOnly();
      this.expect("COLON", "':' in a conditional expression");
      this.skipNlOnly();
      const other = this.parseExpr(noTrailing);
      return { kind: "Ternary", cond, then, other, loc: q.location };
    }
    return cond;
  }

  parseBinary(level: number, noTrailing: boolean): A.Node {
    if (level === LEVELS.length) return this.parseUnary(noTrailing);
    let left = this.parseBinary(level + 1, noTrailing);
    while (LEVELS[level].includes(this.peek().kind)) {
      const op = this.next();
      this.skipNlOnly();
      const right = this.parseBinary(level + 1, noTrailing);
      if (op.kind === "RANGE_CLOSED" || op.kind === "RANGE_HALF") {
        left = { kind: "RangeExpr", lo: left, hi: right, inclusive: op.kind === "RANGE_CLOSED", loc: op.location };
      } else {
        left = { kind: "Binary", op: op.value as string, left, right, loc: op.location };
      }
    }
    return left;
  }

  parseUnary(noTrailing: boolean): A.Node {
    if (this.at("BANG") || this.at("MINUS")) {
      const op = this.next();
      return { kind: "Unary", op: op.value as string, operand: this.parseUnary(noTrailing), loc: op.location };
    }
    return this.parsePostfix(this.parsePrimary(noTrailing), noTrailing);
  }

  parsePostfix(expr: A.Node, noTrailing: boolean): A.Node {
    for (;;) {
      const t = this.peek();
      if (t.kind === "DOT" && this.peek(1).kind === "NUMBER" && typeof this.peek(1).value === "number") {
        this.next(); // tuple element: pair.0
        const n = this.next();
        expr = { kind: "Member", base: expr, name: pyStr(n.value), loc: n.location };
        continue;
      }
      if (t.kind === "DOT" && (this.peek(1).kind === "IDENT" || this.peek(1).kind === "KEYWORD")) {
        this.next();
        const name = this.next();
        expr = { kind: "Member", base: expr, name: name.value as string, loc: name.location };
        continue;
      }
      if (t.kind === "NEWLINE") {
        // Leading-dot modifier continuation on a following line.
        let k = 0;
        while (this.peek(k).kind === "NEWLINE") k += 1;
        if (this.peek(k).kind === "DOT" && (this.peek(k + 1).kind === "IDENT" || this.peek(k + 1).kind === "KEYWORD")) {
          this.pos += k;
          continue;
        }
        return expr;
      }
      if (t.kind === "LPAREN") {
        const args = this.parseArgs();
        expr = this.parseTrailing({ kind: "Call", callee: expr, args, trailing: [], loc: t.location }, noTrailing);
        continue;
      }
      if (t.kind === "LBRACE" && !noTrailing && Parser.callable(expr)) {
        expr = this.parseTrailing({ kind: "Call", callee: expr, args: [], trailing: [], loc: t.location }, noTrailing);
        continue;
      }
      if (t.kind === "LBRACKET") {
        this.next();
        this.skipNlOnly();
        const idx = this.parseExpr();
        this.skipNlOnly();
        this.expect("RBRACKET", "']'");
        expr = { kind: "Subscript", base: expr, index: idx, loc: t.location };
        continue;
      }
      if (t.kind === "BANG" && this.peek(1).kind !== "IDENT") { // force unwrap: ignore
        this.next();
        continue;
      }
      return expr;
    }
  }

  private static callable(expr: A.Node): boolean {
    return expr.kind === "Ident" || expr.kind === "Member" || expr.kind === "EnumCase" || expr.kind === "Call";
  }

  parseTrailing(call: A.Call, noTrailing: boolean): A.Call {
    if (noTrailing) return call;
    if (this.at("LBRACE")) call.trailing.push([null, this.parseClosure()]);
    else if ((this.peek().kind === "IDENT" || this.peek().kind === "KEYWORD") && this.at("COLON", null, 1)
      && this.at("LBRACE", null, 2)) {
      // Only labelled closures, on the same line: `Banner("x") actions: { … }`
      const label = this.next().value as string;
      this.next();
      call.trailing.push([label, this.parseClosure()]);
    }
    // Labeled trailing closures: `} label: { ... }`, possibly on following lines.
    while (call.trailing.length) {
      let k = 0;
      while (this.peek(k).kind === "NEWLINE") k += 1;
      if ((this.peek(k).kind === "IDENT" || this.peek(k).kind === "KEYWORD") && this.peek(k + 1).kind === "COLON"
        && this.peek(k + 2).kind === "LBRACE") {
        this.pos += k;
        const label = this.next().value as string;
        this.next(); // ':'
        call.trailing.push([label, this.parseClosure()]);
      } else break;
    }
    return call;
  }

  parseClosure(): A.Closure {
    const tok = this.expect("LBRACE", "'{'");
    this.skipNlOnly();
    let params: string[] = [];
    // Lookahead for `a, b in` or `(a, b) in` or `_ in`.
    let k = 0;
    const paren = this.peek().kind === "LPAREN";
    if (paren) k = 1;
    const names: string[] = [];
    let ok = false;
    for (;;) {
      const t = this.peek(k);
      if (t.kind === "IDENT") {
        names.push(t.value as string);
        k += 1;
        if (this.peek(k).kind === "COLON") k += 2; // typed param `x: Int`
        if (this.peek(k).kind === "COMMA") {
          k += 1;
          continue;
        }
        if (paren && this.peek(k).kind === "RPAREN") k += 1;
        if (this.peek(k).kind === "KEYWORD" && this.peek(k).value === "in") {
          ok = true;
          k += 1;
        }
      }
      break;
    }
    if (ok) {
      params = names;
      this.pos += k;
    }
    const body = this.statementsUntilRbrace();
    return { kind: "Closure", params, body, loc: tok.location };
  }

  parseArgs(): A.Arg[] {
    this.expect("LPAREN", "'('");
    const args: A.Arg[] = [];
    for (;;) {
      this.skipNlOnly();
      if (this.at("RPAREN")) {
        this.next();
        return args;
      }
      let label: string | null = null;
      if ((this.peek().kind === "IDENT" || this.peek().kind === "KEYWORD") && this.at("COLON", null, 1)) {
        label = this.next().value as string;
        this.next();
        this.skipNlOnly();
      }
      args.push({ label, value: this.parseExpr() });
      this.skipNlOnly();
      if (this.at("COMMA")) this.next();
      else if (!this.at("RPAREN")) throw this.error("expected ',' or ')' in an argument list");
    }
  }

  parsePrimary(_noTrailing: boolean): A.Node {
    const t = this.peek();
    const k = t.kind;
    if (k === "NUMBER") {
      this.next();
      return { kind: "Literal", value: t.value as A.LiteralValue, loc: t.location };
    }
    if (k === "STRING") {
      this.next();
      return this.stringNode(t);
    }
    if (k === "KEYWORD" && (t.value === "true" || t.value === "false")) {
      this.next();
      return { kind: "Literal", value: t.value === "true", loc: t.location };
    }
    if (k === "KEYWORD" && t.value === "nil") {
      this.next();
      return { kind: "Literal", value: null, loc: t.location };
    }
    if (k === "IDENT") {
      this.next();
      return { kind: "Ident", name: t.value as string, loc: t.location };
    }
    if (k === "DOLLAR") { // $binding → the bound value
      this.next();
      const name = this.expect("IDENT", "a name after '$'");
      return { kind: "Ident", name: name.value as string, loc: name.location };
    }
    if (k === "DOT") {
      this.next();
      const name = this.peek();
      if (name.kind !== "IDENT" && name.kind !== "KEYWORD") throw this.error("expected a name after '.'");
      this.next();
      return { kind: "EnumCase", name: name.value as string, loc: name.location };
    }
    if (k === "BACKSLASH") {
      this.next();
      let path = "";
      if (this.at("IDENT")) path = this.next().value as string;
      while (this.at("DOT")) {
        this.next();
        path += "." + tokenText(this.next());
      }
      return { kind: "KeyPath", path, loc: t.location };
    }
    if (k === "LBRACKET") return this.parseCollection();
    if (k === "LPAREN") {
      this.next();
      const items: A.Arg[] = [];
      for (;;) {
        this.skipNlOnly();
        if (this.at("RPAREN")) {
          this.next();
          break;
        }
        let label: string | null = null;
        if (this.at("IDENT") && this.at("COLON", null, 1)) {
          label = this.next().value as string;
          this.next();
        }
        items.push({ label, value: this.parseExpr() });
        this.skipNlOnly();
        if (this.at("COMMA")) this.next();
        else if (!this.at("RPAREN")) throw this.error("expected ',' or ')'");
      }
      if (items.length === 1 && items[0].label === null) return items[0].value;
      return { kind: "TupleLit", items, loc: t.location };
    }
    if (k === "LBRACE") return this.parseClosure();
    throw this.error(`expected an expression, found ${found(t)}`);
  }

  parseCollection(): A.Node {
    const tok = this.next(); // [
    this.skipNlOnly();
    if (this.at("COLON") && this.at("RBRACKET", null, 1)) { // [:]
      this.next();
      this.next();
      return { kind: "DictLit", items: [], loc: tok.location };
    }
    const items: A.Node[] = [];
    const pairs: [A.Node, A.Node][] = [];
    for (;;) {
      this.skipNlOnly();
      if (this.at("RBRACKET")) {
        this.next();
        break;
      }
      const first = this.parseExpr();
      this.skipNlOnly();
      if (this.at("COLON")) {
        this.next();
        this.skipNlOnly();
        pairs.push([first, this.parseExpr()]);
      } else items.push(first);
      this.skipNlOnly();
      if (this.at("COMMA")) this.next();
      else if (!this.at("RBRACKET")) throw this.error("expected ',' or ']'");
    }
    if (pairs.length && items.length) throw this.error("a collection literal mixes array and dictionary entries", tok);
    return pairs.length ? { kind: "DictLit", items: pairs, loc: tok.location } : { kind: "ArrayLit", items, loc: tok.location };
  }

  private stringNode(tok: Token): A.Node {
    const parts: (string | A.Node)[] = [];
    for (const p of tok.value as readonly (string | Interpolation)[]) {
      if (p instanceof Interpolation) {
        const sub = new Lexer(p.source, p.location.source, p.location.line, p.location.col).tokens();
        const sp = new Parser(sub, this.source);
        const expr = sp.parseExpr();
        if (!sp.at("EOF")) throw sp.error("unexpected text in string interpolation");
        parts.push(expr);
      } else parts.push(p);
    }
    if (parts.length === 1 && typeof parts[0] === "string") {
      return { kind: "Literal", value: parts[0], loc: tok.location };
    }
    return { kind: "StringLit", parts, loc: tok.location };
  }
}

/** Parse mockitdown source. Throws {@link MockitdownSyntaxError} on the first syntax error. */
export function parse(src: string, source = ""): A.Module {
  return new Parser(tokenize(src, source), source).parseModule();
}

export { Location };
