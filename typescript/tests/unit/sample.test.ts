// R-TOOL-006 TC-2 (C1, C2, C3): the code a new element is inserted as (`sampleCall`), the text its
// first argument holds (`firstText`), and the session's `firstText` and `setText`. Every expected
// string below was written by hand from the samples quoted here and from shared/reference/base.json,
// before the functions existed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DesignSession, newDesign, type DesignNotification } from "mockitdown/design";
import { REPO, setup } from "./helpers.js";

const core = setup();

test("sampleCall: the sample's top-level call with its arguments and modifiers, without trailing closures (C1)", () => {
  const cases: [string, string | null, string][] = [
    ["Button", 'Button("Label")', 'Button("Label")'],
    ["Toggle", 'Toggle("Wi-Fi", isOn: true)', 'Toggle("Wi-Fi", isOn: true)'],
    ["List", 'List() { Text("First item"); Text("Second item") }', "List()"],
    ["Card", 'Card("Title") { Text("Content"); Button("Action") }', 'Card("Title")'],
    ["NavigationSplitView", 'NavigationSplitView {\n  List { Text("a") }\n} detail: {\n  Text("b")\n}', "NavigationSplitView()"],
    ["Image", "Image().frame(width: 160, height: 96)", "Image().frame(width: 160, height: 96)"],
    ["List", 'List(selection: "Inbox") {\n  Text("a")\n}.listStyle(.sidebar)', 'List(selection: "Inbox").listStyle(.sidebar)'],
    ["Alert", 'Alert("Delete?", actions: { Button("Cancel") })', 'Alert("Delete?", actions: { Button("Cancel") })'],
  ];
  for (const [name, sample, expected] of cases) assert.equal(core.sampleCall(name, sample), expected, `${name}: ${sample}`);
});

test("sampleCall: <Name>() when the sample is not one call of the element (C1)", () => {
  assert.equal(core.sampleCall("Tab", 'TabView { Tab("Inbox") { Text("x") } }'), "Tab()", "shown inside another element");
  assert.equal(core.sampleCall("Text", 'Text("a")\nText("b")'), "Text()", "two statements");
  assert.equal(core.sampleCall("Text", 'let t = "a"\nText(t)'), "Text()", "a let before it");
  assert.equal(core.sampleCall("Divider", "Divider"), "Divider()", "a bare identifier is not a call");
  assert.equal(core.sampleCall("Text", 'Text("a'), "Text()", "does not parse");
  assert.equal(core.sampleCall("Badge", null), "Badge()", "no sample (a struct)");
  assert.equal(core.sampleCall("Badge", ""), "Badge()");
});

test("sampleCall over the base pack's reference data: Button, Toggle, List, VStack (C1, V1)", () => {
  const ref = JSON.parse(readFileSync(join(REPO, "shared", "reference", "base.json"), "utf8")) as { elements: { name: string; sample: string }[] };
  const sample = (n: string): string => ref.elements.find((e) => e.name === n)!.sample;
  assert.equal(core.sampleCall("Button", sample("Button")), 'Button("Label")');
  assert.equal(core.sampleCall("Toggle", sample("Toggle")), 'Toggle("Label")');
  assert.equal(core.sampleCall("List", sample("List")), "List()");
  assert.equal(core.sampleCall("VStack", sample("VStack")), "VStack()");
});

test("firstText: the first positional string literal without interpolation, else null (C2)", () => {
  const tree = core.parseTree('VStack {\n  Button("Label")\n  Toggle(isOn: true)\n  Text("Hi \\(name)")\n  Label(title, systemImage: "a")\n  Divider()\n  Text("a\\"b")\n}\n').tree!;
  const texts = tree.nodes.map((n) => [n.name, core.firstText(n)]);
  assert.deepEqual(texts, [["VStack", null], ["Button", "Label"], ["Toggle", null], ["Text", null], ["Label", null], ["Divider", null], ["Text", 'a"b']]);
});

test("session.setText sets the first argument as one change; the same text changes nothing; no text is refused (C3)", () => {
  const d = newDesign("Text");
  d.mockups.push({ name: "M", x: 0, y: 0, code: 'VStack {\n  Button("Label")\n  Divider()\n}\n' });
  const s = new DesignSession(d);
  const button = s.nodeFor("M", "n2")!;
  const divider = s.nodeFor("M", "n3")!;
  const seen: DesignNotification[] = [];
  s.subscribe((n) => seen.push(n));
  assert.equal(s.firstText(button), "Label");
  assert.equal(s.firstText(divider), null);

  const same = s.setText(button, "Label");
  assert.ok(!("error" in same) && same.edits.length === 0);
  assert.deepEqual(seen, [], "the same text notifies nothing");

  const r = s.setText(button, 'Save "now"');
  assert.ok(!("error" in r));
  assert.equal(s.code("M"), 'VStack {\n  Button("Save \\"now\\"")\n  Divider()\n}\n');
  assert.deepEqual(seen.filter((n) => n.kind !== "diagnostics").map((n) => n.kind), ["change"], "one change");
  assert.equal(s.firstText(button), 'Save "now"', "the node keeps its id");

  const refused = s.setText(divider, "x");
  assert.ok("error" in refused);
  assert.match(String((refused as { error: string }).error), /n3 has no text as its first argument/);
  assert.ok("error" in s.setText("nope", "x"));
});
