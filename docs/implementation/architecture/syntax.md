---
title: Syntax
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: IMPL.SYN
---

# Syntax: lexer, parser, syntax tree

Realizes **A-SYN-1** (lexer) and **A-SYN-2** (parser and syntax tree); requirements R-LANG-001 –
R-LANG-009.

## Lexer — `syntax/lexer.py`

`Lexer(src, source, line, col).tokens()` walks the text once and returns `Token(kind, value,
location)` objects ending with `EOF`. Kinds: `NEWLINE`, `KEYWORD`, `IDENT`, `NUMBER`, `STRING` and
one kind per punctuation (`LBRACE`, `RANGE_HALF`, `DOT`, …), matched longest first from `_PUNCT`.

- **Strings** keep interpolation unparsed: a `STRING` token's value is a tuple of parts, each a
  `str` or an `Interpolation(source, location)`. The lexer finds the matching `)` by counting
  parentheses. Multi-line strings are dedented by `_dedent_multiline` (Swift rules).
- **Numbers**: `_number` stops at `.` unless a digit follows, so `0...5` is a range.
- **Positions** are 1-based; `_advance` updates line and column.

## Parser — `syntax/parser.py`

A hand-written recursive-descent parser (`Parser`) with one method per grammar rule. The grammar is
in the module docstring and, normatively, in the [Language reference](../../specification/language/reference.md).

| Method | Rule |
|---|---|
| `parse_module` | top level: dispatches to `parse_import`, `parse_preview`, `parse_decl_or_attribute`, `parse_statement` |
| `parse_decl_or_attribute`, `parse_struct`, `parse_type_text` | attributes, directives (`DIRECTIVES = {"Screen"}`), structs, properties |
| `parse_statement`, `parse_if`, `parse_block` | statements |
| `parse_expr`, `parse_binary` (table `_LEVELS`), `parse_unary`, `parse_postfix`, `parse_primary` | expressions |
| `parse_trailing`, `parse_closure`, `parse_args`, `parse_collection` | calls, closures, literals |
| `_string_node` | re-lexes and parses each interpolation at its original location |

**Newline handling** is the subtle part. `end_statement` requires a `NEWLINE` or `;` between
statements. `parse_postfix` looks past newlines for a leading `.name` (modifier continuation);
`parse_trailing` looks past newlines for `label: {`. `skip_nl_only` is used inside brackets and
after operators. `no_trailing=True` is passed when parsing an `if` condition so its `{` opens the
branch.

## Syntax tree — `syntax/ast.py`

Dataclasses: expressions (`Literal`, `StringLit`, `Ident`, `EnumCase`, `Member`, `Call` with
`args` and `trailing`, `ArrayLit`, `DictLit`, `TupleLit`, `RangeExpr`, `Unary`, `Binary`,
`Ternary`, `Subscript`, `KeyPath`, `Closure`), statements (`ExprStmt`, `IfStmt`, `LetStmt`) and
declarations (`Import`, `Attribute`, `Property` with `is_view`, `StructDecl`, `Module`). Views and
values share the expression grammar, as in Swift; the evaluator decides which is which (M-SYN-1).

## Errors

Both stages raise `MockitdownSyntaxError` carrying a `Diagnostic` with code `syntax` at the
offending token (R-LANG-009). `parse(src, source)` is the public entry; `source` names the file
for imported components.

## Debugging

```sh
python - <<'PY'
from mockitdown.syntax import parse, tokenize
print(tokenize('Text("a \\(b)").bold()'))
print(parse('VStack { Text("a") }\n.padding()'))
PY
```

Tests: `tests/test_syntax.py`.


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
