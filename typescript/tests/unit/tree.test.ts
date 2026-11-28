// R-EDIT-001 TC-1 (C1, C2, C3, C4, C5, C7, C8, C11) and TC-2 (C6, C9, C10): the editor's syntax tree.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, test } from "node:test";
import { CONF, setup } from "./helpers.js";

const core = setup();
core.registerComponentFiles(join(CONF, "components"), "components");
const { parseTree, reparse, tokenize } = core;
type Tree = InstanceType<typeof core.SyntaxTree>;
type Node = InstanceType<typeof core.ViewNode>;

function tree(source: string): Tree {
  const r = parseTree(source);
  assert.deepEqual(r.diagnostics, []);
  assert.ok(r.tree);
  return r.tree!;
}

/** Whether `text` is only comments and blanks (the leading part of a span, C11). */
function onlyComments(text: string): boolean {
  return /^(?:[ \t\r\n]*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/))*[ \t\r\n]*$/.test(text);
}

/** The structural checks of TC-1 on one tree. */
function checkTree(t: Tree, label: string): void {
  const src = t.source;
  const tokens = tokenize(src).filter((k) => k.kind !== "NEWLINE" && k.kind !== "EOF");
  const ends = new Set(tokens.map((k) => k.end));
  const starts = new Set(tokens.map((k) => k.start));
  t.nodes.forEach((n, i) => {
    const at = `${label} ${n.ordinal} ${n.name}`;
    assert.equal(n.ordinal, `n${i + 1}`, at);
    assert.equal(t.byOrdinal(n.ordinal), n, at);
    assert.equal(t.byOrdinal(i + 1), n, at);
    assert.equal(t.byId(n.id), n, at);
    if (i) assert.ok(t.nodes[i - 1].first < n.first, `${at}: ordinals follow source order`);
    // The name span reads back as the name; the span runs from leading comments to a token's end.
    assert.equal(src.slice(n.nameSpan.start, n.nameSpan.end), n.name, at);
    assert.ok(starts.has(n.first) && n.first === n.nameSpan.start, `${at}: first token`);
    assert.ok(ends.has(n.span.end), `${at}: span ends at a token`);
    assert.ok(n.span.start <= n.first && n.nameSpan.end <= n.span.end, at);
    assert.ok(onlyComments(src.slice(n.span.start, n.first)), `${at}: only comments lead the node`);
    if (n.span.start < n.first) assert.ok(src.startsWith("/", n.span.start), at);
    // Brackets balance inside a span: it is a whole expression.
    let depth = 0;
    for (const k of tokens) {
      if (k.start < n.first || k.end > n.span.end) continue;
      if (["LPAREN", "LBRACE", "LBRACKET"].includes(k.kind)) depth++;
      if (["RPAREN", "RBRACE", "RBRACKET"].includes(k.kind)) depth--;
      assert.ok(depth >= 0, `${at}: balanced`);
    }
    assert.equal(depth, 0, `${at}: balanced`);
    // Children lie in the span, in source order; the lookup by offset finds the innermost node.
    let last = -1;
    for (const c of n.children) {
      assert.equal(c.parent, n, at);
      assert.ok(n.span.start <= c.span.start && c.span.end <= n.span.end, `${at}: child ${c.ordinal} inside`);
      assert.ok(c.first > last, `${at}: children in order`);
      last = c.first;
    }
    assert.equal(t.atOffset(n.first), n, `${at}: atOffset`);
  });
  assert.deepEqual(t.roots, t.nodes.filter((n) => n.parent === null));
}

describe("R-EDIT-001 TC-1: spans, ordinals and ids", () => {
  const cases = (JSON.parse(readFileSync(join(CONF, "index.json"), "utf8")) as { cases: { name: string }[] }).cases;
  it("every conformance case: spans read back, ordinals in order, lookups agree (C1, C3, C4, C7, C8, C11)", () => {
    let parsed = 0;
    let failed = 0;
    for (const c of cases) {
      const source = readFileSync(join(CONF, c.name + ".mockitdown"), "utf8");
      const expected = JSON.parse(readFileSync(join(CONF, c.name + ".diag.json"), "utf8")) as { diagnostics: { code: string }[] };
      const r = parseTree(source);
      if (expected.diagnostics.some((d) => d.code === "syntax")) {
        // C5: no tree, and the same diagnostics as check.
        assert.equal(r.tree, null, c.name);
        const options = { ...(JSON.parse(readFileSync(join(CONF, c.name + ".json"), "utf8")) as object), import_paths: ["."] };
        assert.deepEqual(r.diagnostics.map((d) => d.toJSON()), core.check(source, options).map((d) => d.toJSON()), c.name);
        failed++;
        continue;
      }
      assert.ok(r.tree, c.name);
      assert.deepEqual(r.diagnostics, []);
      checkTree(r.tree!, c.name);
      parsed++;
    }
    assert.ok(parsed > 500 && failed > 0, `${parsed} parsed, ${failed} syntax errors`);
  });

  const SRC = [
    "// Sign-in form",
    "VStack(spacing: 12) {",
    "  Text(\"Welcome\")",
    "    .font(.title)",
    "  if showHint {",
    "    Text(\"Forgot it?\")",
    "  }",
    "  Spacer.frame(height: 8)",
    "  Badge.Ribbon(\"New\") { Divider }",
    "}",
    "",
  ].join("\n");

  it("the view nodes of the narrative example, with names, kinds and parents (C3, C4, C7)", () => {
    const t = tree(SRC);
    assert.deepEqual(t.nodes.map((n) => [n.ordinal, n.name, n.kind, n.parent?.ordinal ?? null]), [
      ["n1", "VStack", "call", null],
      ["n2", "Text", "call", "n1"],
      ["n3", "if", "if", "n1"],
      ["n4", "Text", "call", "n3"],
      ["n5", "Spacer", "ident", "n1"],
      ["n6", "Badge.Ribbon", "call", "n1"],
      ["n7", "Divider", "ident", "n6"],
    ]);
    const [vstack, text, , , spacer] = t.nodes;
    assert.equal(t.text(vstack.span), SRC.trimEnd(), "the comment above belongs to VStack (C11)");
    assert.equal(t.text(text.span), "Text(\"Welcome\")\n    .font(.title)", "the modifier chain is in the span");
    assert.equal(t.text(spacer.span), "Spacer.frame(height: 8)");
    assert.equal(text.modifiers.length, 1);
    assert.deepEqual(vstack.children.map((n) => n.ordinal), ["n2", "n3", "n5", "n6"]);
  });

  it("a modifier call is no node; a call inside a modifier's argument is (C3)", () => {
    const t = tree("Circle()\n  .overlay(Text(\"x\").bold())\n  .foregroundColor(.red)\n");
    assert.deepEqual(t.nodes.map((n) => [n.name, n.parent?.name ?? null]), [["Circle", null], ["Text", "Circle"]]);
    assert.ok(!t.nodes.some((n) => ["overlay", "bold", "foregroundColor"].includes(n.name)));
  });

  it("struct bodies are numbered with the rest, in source order (C4)", () => {
    const t = tree("struct Card: View {\n  var title: String\n  var body: some View {\n    Text(title)\n  }\n}\nCard(title: \"a\")\n");
    assert.deepEqual(t.nodes.map((n) => `${n.ordinal}:${n.name}`), ["n1:Text", "n2:Card"]);
    assert.equal(t.roots.length, 2);
  });

  it("offsets are UTF-16 code units, end exclusive (C1)", () => {
    const toks = tokenize("Text(\"🚀\")\nImage(\"x\")");
    assert.equal(toks.find((k) => k.value === "Image")!.start, 11);
    const t = parseTree("VStack {\n  Text(\"🚀 \\(name)\")\n  Image(\"x\")\n}\n").tree!;
    const image = t.nodes.find((n) => n.name === "Image")!;
    assert.equal(t.source.slice(image.span.start, image.span.end), "Image(\"x\")");
    const text = t.nodes.find((n) => n.name === "Text")!;
    const interp = (text.syntax as { args: { value: { parts: unknown[] } }[] }).args[0].value.parts[1] as { start: number; end: number };
    assert.equal(t.source.slice(interp.start, interp.end), "name", "an interpolation's offsets are in the whole source");
  });

  it("the lexer records every comment, so the text between tokens reads back (C2)", () => {
    const src = "VStack { // a\n  /* b /* nested */ */ Text(\"x\") // c\n}\n";
    const t = tree(src);
    assert.deepEqual(t.comments.map((c) => src.slice(c.start, c.end)), ["// a", "/* b /* nested */ */", "// c"]);
    assert.deepEqual(t.comments.map((c) => [c.line, c.col, c.block]), [[1, 10], [2, 3], [2, 34]].map(([l, c], i) => [l, c, i === 1]));
    // A trailing comment, or one on the line of code, leads no node.
    assert.equal(t.text(t.nodes[1].span), "Text(\"x\")");
  });

  it("leading comment lines: contiguous, not across a blank line, block comments too (C11)", () => {
    const src = "VStack {\n  // far\n\n  /* one */ // two\n  // three\n  Text(\"a\")\n  Text(\"b\") // trails\n  Text(\"c\")\n}\n";
    const t = tree(src);
    const [, a, b, c] = t.nodes;
    assert.equal(t.text(a.span), "/* one */ // two\n  // three\n  Text(\"a\")");
    assert.equal(t.text(b.span), "Text(\"b\")");
    assert.equal(t.text(c.span), "Text(\"c\")", "a comment after code on the line above trails that code");
  });

  it("lookup by offset gives the innermost node; by id and ordinal (C8)", () => {
    const t = tree(SRC);
    const at = (needle: string): number => SRC.indexOf(needle);
    assert.equal(t.atOffset(at("Forgot"))!.ordinal, "n4");
    assert.equal(t.atOffset(at(".font"))!.ordinal, "n2");
    assert.equal(t.atOffset(at("showHint"))!.ordinal, "n3");
    assert.equal(t.atOffset(at("Sign-in"))!.ordinal, "n1");
    assert.equal(t.atOffset(SRC.length), null);
    assert.equal(t.byOrdinal("n99"), null);
    assert.equal(t.byOrdinal("x1"), null);
    assert.equal(t.byId("nope"), null);
  });

  it("a source that does not parse: tree null, the syntax diagnostics (C5)", () => {
    const r = parseTree("VStack {\n  Text(\"a\"\n}\n");
    assert.equal(r.tree, null);
    assert.equal(r.diagnostics.length, 1);
    assert.equal(r.diagnostics[0].code, "syntax");
    assert.deepEqual(r.diagnostics.map((d) => d.toJSON()), core.check("VStack {\n  Text(\"a\"\n}\n").map((d) => d.toJSON()));
    assert.equal(parseTree("/* open").tree, null);
  });
});

describe("R-EDIT-001 TC-2: ids survive edits", () => {
  const SRC = [
    "// Settings",
    "let items = [\"Wi-Fi\", \"Bluetooth\"]",
    "List {",
    "  // the rows",
    "  ForEach(items, id: \\.self) { item in",
    "    Toggle(item, isOn: true)",
    "  }",
    "  if items.count > 1 {",
    "    Text(\"Many\")",
    "  }",
    "  Label(\"Help\", systemImage: \"questionmark\")",
    "  Divider",
    "}",
    "",
  ].join("\n");

  function named(t: Tree, name: string): Node {
    return t.nodes.find((n) => n.name === name)!;
  }

  it("insertion, replacement inside a sibling's arguments and removal (C6, C9, C10)", () => {
    const t0 = tree(SRC);
    checkTree(t0, "t0");
    const ids0 = new Map(t0.nodes.map((n) => [n.name, n.id]));
    assert.equal(new Set(ids0.values()).size, t0.nodes.length, "ids unique within the tree (C6)");

    // 1. Insert a node before ForEach.
    const at = SRC.indexOf("  // the rows");
    const r1 = reparse(t0, [{ start: at, end: at, text: "  Text(\"Header\")\n" }]);
    assert.deepEqual(r1.diagnostics, []);
    const t1 = r1.tree!;
    checkTree(t1, "t1");
    const header = t1.nodes.find((n) => n.name === "Text" && t1.text(n.span).includes("Header"))!;
    assert.ok(![...ids0.values()].includes(header.id), "the inserted node has a new id");
    for (const n of t0.nodes) {
      const same = t1.nodes.find((m) => m.name === n.name && m.id === n.id);
      assert.ok(same, `${n.name} keeps its id`);
    }

    // 2. Replace text inside Label's arguments, and remove Divider in the same change.
    const s1 = t1.source;
    const help = s1.indexOf("\"Help\"");
    const div = s1.indexOf("  Divider\n");
    const r2 = reparse(t1, [
      { start: help, end: help + 6, text: "\"Support\"" },
      { start: div, end: div + "  Divider\n".length, text: "" },
    ]);
    const t2 = r2.tree!;
    checkTree(t2, "t2");
    assert.ok(t2.source.includes("Label(\"Support\""));
    assert.equal(t2.nodes.find((n) => n.name === "Divider"), undefined);
    for (const n of t1.nodes.filter((x) => x.name !== "Divider")) {
      assert.equal(t2.nodes.find((m) => m.id === n.id)?.name, n.name, `${n.name} keeps its id`);
    }
    assert.equal(named(t2, "Label").id, named(t1, "Label").id, "an edit inside the arguments keeps the node's id");

    // 3. Re-insert a Divider where it was: a new id, never the removed one (C6).
    const s2 = t2.source;
    const end = s2.lastIndexOf("}");
    const t3 = reparse(t2, [{ start: end, end, text: "  Divider\n" }]).tree!;
    checkTree(t3, "t3");
    const seen = new Set([...t0.nodes, ...t1.nodes, ...t2.nodes].map((n) => n.id));
    assert.ok(!seen.has(named(t3, "Divider").id), "a removed node's id does not reappear");
    assert.equal(named(t3, "List").id, ids0.get("List"));
  });

  it("a node whose name lies in a replaced range gets a new id (C10)", () => {
    const t0 = tree(SRC);
    const label = named(t0, "Label");
    const t1 = reparse(t0, [{ start: label.nameSpan.start, end: label.nameSpan.end, text: "Button" }]).tree!;
    const button = named(t1, "Button");
    assert.notEqual(button.id, label.id);
    assert.equal(t1.byId(label.id), null);
    assert.equal(named(t1, "Toggle").id, named(t0, "Toggle").id);
  });

  it("an edit that breaks the source returns null and the diagnostics; the old tree stays usable (C9)", () => {
    const t0 = tree(SRC);
    const r = reparse(t0, [{ start: 0, end: 0, text: "VStack {\n" }]);
    assert.equal(r.tree, null);
    assert.equal(r.diagnostics[0].code, "syntax");
    const ok = reparse(t0, [{ start: SRC.length, end: SRC.length, text: "Spacer\n" }]).tree!;
    assert.equal(named(ok, "List").id, named(t0, "List").id);
  });

  it("edits out of order, overlapping or out of range are refused (M-EDIT-3.I1)", () => {
    const t0 = tree(SRC);
    assert.throws(() => reparse(t0, [{ start: 5, end: 6, text: "" }, { start: 2, end: 3, text: "" }]), RangeError);
    assert.throws(() => reparse(t0, [{ start: 2, end: 6, text: "" }, { start: 5, end: 7, text: "" }]), RangeError);
    assert.throws(() => reparse(t0, [{ start: 0, end: SRC.length + 1, text: "" }]), RangeError);
    assert.equal(core.applyEdits("abcdef", [{ start: 1, end: 2, text: "XY" }, { start: 4, end: 4, text: "-" }]), "aXYcd-ef");
  });
});

test("parse is unchanged by the offsets: the renderer's diagnostics keep line and column", () => {
  const d = core.check("Text(\"a\"\n");
  assert.equal(d[0].location.line, 2);
});
