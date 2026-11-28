// IT-63 (model part): the inspector's model in mockitdown/design (R-TOOL-007, R-EDIT-007.C5). The
// expected fields, controls and codes were written by hand, before the model ran, from the code below,
// the base pack's Button (params ["label"], no declared variants), Breadcrumb (params ["items"]) and
// the typed data of shared/language/roles.json and vocabulary.json (R-PACK-017): Button's systemImage
// is an icon, color a colour, role an enum of cancel and destructive, loading a bool, elevation a
// number; .frame's width a number of at least 0, .padding an enum of edges then a number.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addArgument, addModifier, DesignSession, inspect, NOT_UNDERSTOOD, newDesign, removeField, setField, setOption,
  type DesignNotification, type Inspection, type InspectorField,
} from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

const BUTTON = 'Button("Save", systemImage: "star", color: .red, role: "cancel", loading: true, elevation: 2, bogus: 1)';
const CODE = `${BUTTON}\n  .frame(width: 80)\n  .padding(.horizontal, 8)\n  .id("save")\nBreadcrumb(items: ["Home", "Docs"])\nText("Other").id("taken")\n`;

function session(code = CODE, clock?: () => number): DesignSession {
  const d = newDesign("Inspector");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Controls", x: 0, y: 0, code });
  return new DesignSession(d, clock ? { now: clock } : {});
}

const codeOf = (s: DesignSession): string => s.code("Controls") ?? "";

function selectNode(s: DesignSession, ordinal: string): void {
  const r = s.select([s.nodeFor("Controls", ordinal)!]);
  assert.ok(!("error" in r), JSON.stringify(r));
}

function field(view: Inspection, key: string): InspectorField {
  const all = [...view.arguments, ...view.state, ...view.modifiers.flatMap((g) => g.modifiers.flatMap((m) => m.fields)), ...view.identity, ...view.options];
  const f = all.find((x) => x.key === key);
  assert.ok(f, `no field ${key} in ${all.map((x) => x.key).join(", ")}`);
  return f as InspectorField;
}

const brief = (f: InspectorField) => [f.key, f.control, f.value, f.present];

test("TC-2: each type gets its control; Arguments lists the parameters, then the labelled arguments (C1, C2, C3, C7)", () => {
  const s = session();
  selectNode(s, "n1");
  const v = inspect(s);
  assert.equal(v.view, "node");
  assert.deepEqual(v.node, { id: s.selection[0], name: "Button", ordinal: "n1", kind: "call" });
  assert.deepEqual(v.arguments.map(brief), [
    ["position:0", "text", "Save", true],
    ["argument:systemImage", "icon", "star", true],
    ["argument:color", "color", "red", true],
    ["argument:role", "choice", "cancel", true],
    ["argument:loading", "switch", true, true],
    ["argument:elevation", "number", 2, true],
    ["argument:bogus", "code", "1", true],
  ]);
  const bogus = field(v, "argument:bogus");
  assert.equal(bogus.understood, false);
  assert.equal(bogus.note, NOT_UNDERSTOOD);
  assert.equal(bogus.removable, true);
  assert.deepEqual(field(v, "argument:role").choices, ["", "cancel", "destructive"]);
  assert.ok(field(v, "argument:systemImage").choices!.includes("star"), "an icon field suggests icon names");
  // C4: base Button declares no variants; its types name selected, disabled and checked, not value.
  assert.deepEqual(v.state.map(brief), [
    ["state:selected", "switch", null, false], ["state:disabled", "switch", null, false], ["state:checked", "switch", null, false],
  ]);
  // C5: the chain without .id, grouped; .padding's positional arguments matched by type.
  assert.deepEqual(v.modifiers.map((g) => [g.group, g.modifiers.map((m) => m.name)]), [["layout", ["frame", "padding"]]]);
  const frame = v.modifiers[0]!.modifiers[0]!;
  assert.deepEqual(frame.fields.map((f) => f.key.split(":").pop()), [
    "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "idealWidth", "idealHeight", "alignment",
  ]);
  assert.deepEqual(brief(frame.fields[0]!), ["modifier:frame:0:width", "number", 80, true]);
  assert.deepEqual(v.modifiers[0]!.modifiers[1]!.fields.map(brief), [
    ["modifier:padding:0:#0", "choice", "horizontal", true], ["modifier:padding:0:#1", "number", 8, true],
  ]);
  assert.deepEqual(v.identity.map(brief), [["id", "text", "save", true], ["refs", "list", [], false], ["comment", "comment", null, false]]);
  // C2: Add argument offers the unused labels of the types, not the parameters, the used or the state ones.
  for (const l of ["badge", "icon", "variant"]) assert.ok(v.addArguments.includes(l), l);
  for (const l of ["label", "systemImage", "color", "bogus", "selected", "disabled", "checked"]) assert.ok(!v.addArguments.includes(l), l);
  assert.deepEqual([...v.addArguments], [...v.addArguments].sort());
  // C5: Add modifier offers rendered modifiers not in the chain.
  for (const m of ["bold", "font", "opacity"]) assert.ok(v.addModifiers.includes(m), m);
  for (const m of ["frame", "padding", "id", "ref"]) assert.ok(!v.addModifiers.includes(m), m);

  // A parameter written with its label is listed once, as the labelled argument.
  selectNode(s, "n2");
  assert.deepEqual(inspect(s).arguments.map(brief), [["argument:items", "list", ["Home", "Docs"], true]]);
});

test("TC-2: values are applied as code, invalid ones refused and not applied (C3, C6, C7, C9)", () => {
  const s = session();
  selectNode(s, "n1");
  const seen: DesignNotification[] = [];
  s.subscribe((n) => seen.push(n));
  const line1 = (code: string) => code.split("\n")[0];
  const at = (key: string) => field(inspect(s), key);

  // C9: a negative width is refused by its number field; nothing changes.
  assert.deepEqual(setField(s, at("modifier:frame:0:width"), "-10"), { ok: false, error: "Must be at least 0", diagnostics: [] });
  assert.deepEqual(setField(s, at("argument:elevation"), "two"), { ok: false, error: '"two" is not a number', diagnostics: [] });
  assert.deepEqual(setField(s, at("argument:color"), "not a colour!"), { ok: false, error: '"not a colour!" is not a colour name or a #hex value', diagnostics: [] });
  assert.equal(codeOf(s), CODE);
  assert.equal(s.canUndo, false);
  assert.equal(seen.length, 0);

  // C9: a value whose code adds a diagnostic at the node is refused with the diagnostic's text.
  const icon = setField(s, at("argument:systemImage"), "nosuchicon");
  assert.equal(icon.ok, false);
  assert.equal((icon as { error: string }).error, "unknown icon 'nosuchicon'");
  assert.equal(codeOf(s), CODE);

  assert.deepEqual(setField(s, at("modifier:frame:0:width"), "120"), { ok: true });
  assert.equal(codeOf(s).split("\n")[1], "  .frame(width: 120)");
  assert.deepEqual(setField(s, at("modifier:padding:0:#1"), "12"), { ok: true });
  assert.equal(codeOf(s).split("\n")[2], "  .padding(.horizontal, 12)");
  assert.deepEqual(setField(s, at("argument:color"), "#ff0000"), { ok: true });
  assert.deepEqual(setField(s, at("argument:role"), "destructive"), { ok: true });
  assert.deepEqual(setField(s, at("argument:loading"), false), { ok: true });
  assert.deepEqual(setField(s, at("position:0"), "Save all"), { ok: true });
  // C7: the argument the pack does not understand is removed.
  assert.deepEqual(removeField(s, at("argument:bogus")), { ok: true });
  assert.equal(line1(codeOf(s)), 'Button("Save all", systemImage: "star", color: "#ff0000", role: "destructive", loading: false, elevation: 2)');
  // C4: a state argument the pack has a modifier for is added as that modifier.
  assert.deepEqual(setField(s, at("state:disabled"), true), { ok: true });
  assert.equal(codeOf(s).split("\n").slice(3, 5).join("\n"), '  .id("save")\n  .disabled(true)');
  assert.deepEqual(brief(at("state:disabled")), ["state:disabled", "switch", true, true]);

  // C6: a duplicate identifier is refused; the comment and the references are edited.
  assert.deepEqual(setField(s, at("id"), "taken"), { ok: false, error: 'The identifier "taken" is already used by n3', diagnostics: [] });
  selectNode(s, "n2");
  assert.deepEqual(setField(s, at("comment"), "Where we are"), { ok: true });
  assert.deepEqual(setField(s, at("argument:items"), ["Home", "Docs", "API"]), { ok: true });
  selectNode(s, "n3");
  assert.deepEqual(setField(s, at("refs"), ["F-1", " "]), { ok: true });
  assert.equal(codeOf(s).split("\n").slice(5).join("\n"),
    '// Where we are\nBreadcrumb(items: ["Home", "Docs", "API"])\nText("Other").id("taken").ref("F-1")\n');

  // C2, C5: Add argument and Add modifier.
  selectNode(s, "n1");
  assert.deepEqual(addArgument(s, "badge"), { ok: true });
  assert.deepEqual(addModifier(s, "bold"), { ok: true });
  assert.equal(line1(codeOf(s)), 'Button("Save all", systemImage: "star", color: "#ff0000", role: "destructive", loading: false, elevation: 2, badge: "")');
  assert.equal(codeOf(s).split("\n")[5], "  .bold()");
  assert.equal(addArgument(s, "nosuchlabel").ok, false);
  // Every applied edit was one step of its own (different fields), each one `change`.
  assert.equal(seen.filter((n) => n.kind === "change").length, 13);
});

test("TC-2: two selected nodes show their number; nothing selected shows the Mockup tab (C10, C12)", () => {
  const s = session();
  s.select([s.nodeFor("Controls", "n2")!, s.nodeFor("Controls", "n3")!]);
  const v = inspect(s);
  assert.equal(v.view, "multiple");
  assert.equal(v.count, 2);
  assert.deepEqual([v.arguments.length, v.state.length, v.modifiers.length, v.identity.length], [0, 0, 0, 0]);

  s.select([]);
  const m = inspect(s);
  assert.equal(m.view, "mockup");
  assert.deepEqual(m.options.map((f) => [f.key, f.control, f.value]), [
    ["option:name", "readonly", "Controls"], ["option:pack", "choice", "base"], ["option:device", "choice", null],
    ["option:width", "number", null], ["option:height", "number", null], ["option:appearance", "choice", null],
    ["option:title", "text", null], ["option:caption", "switch", true], ["option:elements", "switch", false],
  ]);
  const kinds: string[] = [];
  s.subscribe((n) => {
    if (n.kind === "change") kinds.push(n.detail.kind);
  });
  assert.deepEqual(setOption(s, "width", "-5"), { ok: false, error: "Must be at least 1", diagnostics: [] });
  assert.deepEqual(setOption(s, "device", "watch"), { ok: false, error: '"watch" is not one of phone, phone-landscape, tablet, tablet-portrait, desktop, wide, fit', diagnostics: [] });
  assert.deepEqual(setOption(s, "device", "tablet"), { ok: true });
  assert.deepEqual(s.mockup("Controls")!.options, { device: "tablet" });
  assert.deepEqual(setField(s, field(inspect(s), "option:width"), "640"), { ok: true });
  assert.deepEqual(s.mockup("Controls")!.options, { device: "tablet", width: 640 });
  assert.deepEqual(kinds, ["options", "options"]);
  // Each option is one undo step.
  s.undo();
  assert.deepEqual(s.mockup("Controls")!.options, { device: "tablet" });
  s.undo();
  assert.equal(s.mockup("Controls")!.options, undefined);
  assert.equal(s.canUndo, false);
});

test("R-EDIT-007.C5, R-TOOL-007.C8: a burst of typing in one field is one undo step, keyed by node and field", () => {
  let now = 1000;
  const s = session(CODE, () => now);
  selectNode(s, "n3");
  for (const text of ["Other ", "Other t", "Other te", "Other tex", "Other text"]) {
    now += 150;
    assert.deepEqual(setField(s, field(inspect(s), "position:0"), text), { ok: true });
  }
  assert.equal(codeOf(s).split("\n")[5], 'Text("Other text").id("taken")');
  // Another field of the same node is a step of its own.
  now += 150;
  assert.deepEqual(setField(s, field(inspect(s), "id"), "other"), { ok: true });
  s.undo();
  assert.equal(codeOf(s).split("\n")[5], 'Text("Other text").id("taken")');
  s.undo();
  assert.equal(codeOf(s), CODE);
  assert.equal(s.canUndo, false);
  assert.deepEqual(s.selection, [s.nodeFor("Controls", "n3")]);
});
