// The lexer and parser (port of python/tests/test_syntax.py, plus code-point columns).
import assert from "node:assert/strict";
import { test } from "node:test";
import { MockitdownSyntaxError, parse, tokenize, values } from "../../dist/node.js";

function syntaxError(src: string): { message: string; line: number; col: number } {
  try {
    parse(src);
  } catch (e) {
    assert.ok(e instanceof MockitdownSyntaxError);
    const d = (e as InstanceType<typeof MockitdownSyntaxError>).diagnostic;
    assert.equal(d.code, "syntax");
    return { message: d.message, line: d.location.line, col: d.location.col };
  }
  return assert.fail(`no syntax error in ${src}`);
}

test("tokens: numbers keep int and float apart, keywords, punctuation", () => {
  const toks = tokenize("let x = 1_000 + 2.5 ..< 3");
  assert.deepEqual(toks.map((t) => t.kind),
    ["KEYWORD", "IDENT", "ASSIGN", "NUMBER", "PLUS", "NUMBER", "RANGE_HALF", "NUMBER", "EOF"]);
  assert.equal(toks[3].value, 1000);
  assert.ok(toks[5].value instanceof values.PyFloat);
});

test("columns count code points, as Python does", () => {
  const toks = tokenize('Text("🚀") x');
  const x = toks.find((t) => t.value === "x")!;
  assert.equal(x.location.col, 11);
});

test("modules: imports, directives, structs, statements and #Preview", () => {
  const mod = parse('import SwiftUI\nimport "components/pill"\n@Screen("T", device: .phone)\n'
    + "struct Row: View {\n  var title: String\n  @ViewBuilder var content: Content\n  var body: some View { Text(title) }\n}\n"
    + '#Preview { Row(title: "x") { Text("y") } }');
  assert.deepEqual(mod.imports.map((i) => [i.module, i.path]), [["SwiftUI", null], [null, "components/pill"]]);
  assert.equal(mod.attributes[0].name, "Screen");
  assert.equal(mod.structs[0].name, "Row");
  assert.deepEqual(mod.structs[0].properties.map((p) => [p.name, p.type]), [["title", "String"], ["content", "Content"]]);
  assert.equal(mod.statements.length, 1);
});

test("modifier chains continue on following lines; trailing and labelled closures", () => {
  const mod = parse('Text("a")\n  .bold()\n  .padding(8)\nAlert("t") { Text("m") } actions: { Button("OK") }');
  assert.equal(mod.statements.length, 2);
  const call = (mod.statements[1] as { expr: { trailing: [string | null, unknown][] } }).expr;
  assert.deepEqual(call.trailing.map(([l]) => l), [null, "actions"]);
});

test("multi-line strings drop the closing indentation; interpolation and unicode escapes", () => {
  const mod = parse('Text("""\n    a\n      b\n    """)\nText("\\u{1F680} \\(1 + 2)")');
  const lit = (mod.statements[0] as any).expr.args[0].value;
  assert.equal(lit.value, "a\n  b");
  const s = (mod.statements[1] as any).expr.args[0].value;
  assert.equal(s.kind, "StringLit");
  assert.equal(s.parts[0], "🚀 ");
});

test("syntax errors are located and worded as in the Python variant", () => {
  assert.deepEqual(syntaxError('VStack { Text("open"\n'), { message: "expected ',' or ')' in an argument list", line: 2, col: 1 });
  assert.deepEqual(syntaxError('Text("abc'), { message: "unterminated string literal", line: 1, col: 6 });
  assert.deepEqual(syntaxError('Text("a") Text("b")'), { message: "expected a new line or ';' between statements", line: 1, col: 11 });
  assert.deepEqual(syntaxError("Text(1 ~ 2)"), { message: "unexpected character '~'", line: 1, col: 8 });
  assert.deepEqual(syntaxError("struct X { func f() }"),
    { message: "struct X: initializers and functions are not supported; declare properties and a `body`", line: 1, col: 12 });
  assert.deepEqual(syntaxError("struct X { 5 }"), { message: "struct X: expected a 'var' or 'let' property", line: 1, col: 12 });
  assert.deepEqual(syntaxError('Text("\\q")'), { message: "unknown escape \\q", line: 1, col: 7 });
  assert.deepEqual(syntaxError("/* open"), { message: "unterminated block comment", line: 1, col: 1 });
});
