// Dotted element names (R-LANG-007 TC-2, C8; R-EVAL-003 TC-2, C9, C10; F-2.C7, AC4): port of
// python/tests/test_dotted_names.py and its parser cases. Expected fragments written by hand.
import assert from "node:assert/strict";
import { test } from "node:test";
import { setup } from "./helpers.js";

const core = setup();

const RIBBON = '<span class="mkd-badge" data-el="Badge.Ribbon" data-variant="ribbon">'
  + '<span class="mkd-badge__label">New</span></span>';

function diags(r: { diagnostics: { severity: string; code: string; message: string }[] }): string[][] {
  return r.diagnostics.map((d) => [d.severity, d.code, d.message]);
}

test("parser: a capitalised member with arguments is a call on a member callee (C8)", () => {
  const call = (core.parse('Badge.Ribbon("New")').statements[0] as any).expr;
  assert.equal(call.kind, "Call");
  assert.equal(call.callee.kind, "Member");
  assert.deepEqual([call.callee.base.name, call.callee.name], ["Badge", "Ribbon"]);
  assert.equal(call.args[0].value.value, "New");
});

test("parser: a capitalised member with a trailing closure is a call (C8)", () => {
  const call = (core.parse('Card.Meta { Text("x") }').statements[0] as any).expr;
  assert.equal(call.kind, "Call");
  assert.deepEqual([call.callee.base.name, call.callee.name], ["Card", "Meta"]);
  assert.deepEqual(call.args, []);
  assert.equal(call.trailing.length, 1);
  assert.equal(call.trailing[0][1].body[0].expr.callee.name, "Text");
});

test("parser: a modifier chain is unchanged (C8)", () => {
  const call = (core.parse('Text("a").font(.title)').statements[0] as any).expr;
  assert.equal(call.callee.name, "font");
  assert.equal(call.callee.base.callee.name, "Text");
});

test("a dotted call renders the pack's joined element with the dotted name (C9, C10, AC4)", () => {
  const dotted = core.render('Badge.Ribbon("New")', { pack: "antd" });
  const joined = core.render('BadgeRibbon("New")', { pack: "antd" });
  assert.ok(dotted.html.includes(RIBBON), dotted.html);
  assert.deepEqual(diags(dotted), []);
  assert.equal(dotted.html.replace('data-el="Badge.Ribbon"', 'data-el="BadgeRibbon"'), joined.html);
});

test("a dotted call with modifiers and as a value (C9)", () => {
  const r = core.render('let r = Badge.Ribbon("New")\nVStack { r\n  Badge.Ribbon("New").padding() }', { pack: "antd" });
  assert.equal(r.html.split('data-el="Badge.Ribbon"').length - 1, 2);
  assert.deepEqual(diags(r), []);
});

test("Color.red is still a colour (C9)", () => {
  const r = core.render("Color.red", { pack: "antd" });
  assert.ok(r.html.includes('data-el="Color" data-color="red"'));
  assert.deepEqual(diags(r), []);
});

test("an unresolved dotted call is unknown under its dotted name (C10)", () => {
  const r = core.render('Nope.Thing { Text("in") }', { pack: "antd" });
  assert.deepEqual(diags(r), [["error", "unknown",
    "'Nope.Thing' is not an element of pack 'antd' and no struct of that name is declared or imported"]]);
  assert.ok(r.html.includes('<div class="mkd-unknown" data-el="Nope.Thing"><span class="mkd-unknown__name">Nope.Thing</span>'));
  assert.ok(r.html.includes('data-el="Text"'));
});

test("a variable base makes it a member access (C9)", () => {
  const r = core.render('let Badge = "x"\nBadge.Ribbon("New")', { pack: "antd" });
  assert.ok(!r.html.includes("Badge.Ribbon"));
  assert.ok(r.html.includes('data-el="Text"'));
  assert.deepEqual(diags(r), [["warning", "modifier", "unknown modifier .Ribbon() is ignored"]]);
});

test("a dotted call resolves a struct of the joined name (C9)", () => {
  const r = core.render('struct CardMeta: View {\n  var body: some View { Text("meta") }\n}\nCard.Meta()', {});
  assert.ok(r.html.includes(">meta<"));
  assert.deepEqual(diags(r), []);
});

test("a three-part name (C9)", () => {
  const r = core.render("A.B.C()", { pack: "antd" });
  assert.equal(diags(r)[0][2].split(" is ")[0], "'A.B.C'");
});

test("edit mode marks the dotted node (C10)", () => {
  const r = core.render('Badge.Ribbon("New")', { pack: "antd", edit: true });
  assert.ok(r.html.includes('data-el="Badge.Ribbon" data-mkd-node="n1"'));
});
