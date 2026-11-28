// IT-67 (unit part): two-way editing between a code view and the design session (R-TOOL-009 TC-1 for
// C1-C3, TC-2 for C4-C6), driven through `CodeSync` with a stand-in code view and fake timers, and the
// inspector model's Edit in code (R-TOOL-007.C11). Every expected value was written by hand from the
// sources below before the code ran: the offsets of the nodes, the edits of each change, the code after
// each step.
//
//   SIGN_IN offsets: "VStack {" 0-7, "\n" 8; Text 11-31 (`Text("Welcome back")`, `back` 25-29),
//   "\n" 31; Button 34-51, "\n" 51; "}" 52, "\n" 53; 54 characters. The VStack's span is 0-53.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CARET_EVENT, CODE_COALESCE, CODE_SYNC_MS, CodeSync, DesignSession, inspect, newDesign,
  type CodeSpan, type DesignDocument, type DesignNotification, type TextEdit,
} from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

const SIGN_IN = 'VStack {\n  Text("Welcome back")\n  Button("Sign in")\n}\n';
const INBOX = 'let names = ["A"]\nList {\n  ForEach(names) { n in\n    Text(n)\n  }\n}\n';

function doc(): DesignDocument {
  const d = newDesign("Mail");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Sign in", x: 0, y: 0, code: SIGN_IN });
  d.mockups.push({ name: "Inbox", x: 600, y: 0, code: INBOX });
  return d;
}

/** A stand-in for `mockitdown-code`: the members CodeSync uses, recording what it is told. */
class FakeView {
  #listeners = new Map<string, Set<() => void>>();
  value = "";
  diagnostics: unknown = [];
  selection: CodeSpan = { start: 0, end: 0 };
  applied: TextEdit[][] = [];
  marks: (CodeSpan | null)[] = [];
  applyEdits(edits: readonly TextEdit[]): void {
    this.applied.push([...edits]);
    let out = this.value;
    for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    this.value = out;
  }
  mark(range: CodeSpan | null): void {
    this.marks.push(range ? { ...range } : null);
  }
  addEventListener(type: string, listener: () => void): void {
    const set = this.#listeners.get(type) ?? new Set();
    set.add(listener);
    this.#listeners.set(type, set);
  }
  removeEventListener(type: string, listener: () => void): void {
    this.#listeners.get(type)?.delete(listener);
  }
  dispatch(type: string): void {
    for (const l of [...(this.#listeners.get(type) ?? [])]) l();
  }
  /** The user changes the text: one `input` event. */
  type(text: string): void {
    this.value = text;
    this.dispatch("input");
  }
  caret(at: number): void {
    this.selection = { start: at, end: at };
    this.dispatch(CARET_EVENT);
  }
}

function changes(session: DesignSession): Extract<DesignNotification, { kind: "change" }>["detail"][] {
  const seen: Extract<DesignNotification, { kind: "change" }>["detail"][] = [];
  session.subscribe((n) => {
    if (n.kind === "change") seen.push(n.detail);
  });
  return seen;
}

/** The session over the sample with "Sign in" active, a fake clock for coalescing, and a joined view. */
function joined() {
  let now = 0;
  const session = new DesignSession(doc(), { now: () => now });
  session.setActive("Sign in");
  const view = new FakeView();
  const sync = new CodeSync(session, view);
  const node = (name: string): string => session.tree("Sign in")!.nodes.find((n) => n.name === name)!.id;
  return { session, view, sync, node, clock: (ms: number) => { now += ms; } };
}

test("the constants: 300 ms, the coalescing key `code`, the caret event", () => {
  assert.equal(CODE_SYNC_MS, 300);
  assert.equal(CODE_COALESCE, "code");
  assert.equal(CARET_EVENT, "mockitdown-caret");
});

test("TC-1 (C1, C2): a burst of typing is applied 300 ms after the last keystroke as one prefix/suffix change, selection kept by id", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view, node, clock } = joined();
  assert.equal(view.value, SIGN_IN);
  const button = node("Button");
  session.select([button]);
  const seen = changes(session);
  // Backspace four times over "back", then type "home", 50 ms apart.
  const steps = ["bac", "ba", "b", "", "h", "ho", "hom", "home"];
  for (const s of steps) {
    view.type(SIGN_IN.slice(0, 25) + s + SIGN_IN.slice(29));
    t.mock.timers.tick(50);
    clock(50);
  }
  t.mock.timers.tick(CODE_SYNC_MS - 51);
  assert.equal(seen.length, 0, "nothing before 300 ms have passed since the last keystroke");
  t.mock.timers.tick(1);
  const HOME = 'VStack {\n  Text("Welcome home")\n  Button("Sign in")\n}\n';
  assert.deepEqual(seen, [{ kind: "code", mockup: "Sign in", edits: [{ start: 25, end: 29, text: "home" }], code: HOME }]);
  assert.equal(session.code("Sign in"), HOME);
  // C2: re-parsed from the last valid tree: the button keeps its id and stays selected.
  assert.deepEqual(session.selection, [button]);
  assert.equal(session.tree("Sign in")!.byId(button)!.name, "Button");
  // One undo step, which the view follows by text edits.
  session.undo();
  assert.equal(session.canUndo, false);
  assert.equal(view.value, SIGN_IN);
  assert.deepEqual(view.applied.at(-1), [{ start: 25, end: 29, text: "back" }]);
});

test("TC-1 (C3): code that does not parse keeps the last valid tree, read-only, until it parses again", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view, node } = joined();
  const text = node("Text");
  session.select([text]);
  const seen = changes(session);
  const BROKEN = SIGN_IN.slice(0, 52) + SIGN_IN.slice(53);
  view.type(BROKEN);
  t.mock.timers.tick(CODE_SYNC_MS);
  assert.deepEqual(seen.map((c) => c.edits), [[{ start: 52, end: 53, text: "" }]]);
  assert.equal(session.code("Sign in"), BROKEN);
  assert.equal(session.parses("Sign in"), false);
  assert.equal(session.validCode("Sign in"), SIGN_IN);
  assert.equal(session.tree("Sign in")!.source, SIGN_IN);
  // The view shows the syntax diagnostics.
  const diags = view.diagnostics as { severity: string }[];
  assert.ok(diags.length >= 1 && diags.some((d) => d.severity === "error"));
  // Read-only: edits, commands and drops are refused, changing nothing; the selection stays.
  assert.ok("error" in session.delete());
  assert.ok("error" in session.insert('Text("x")', null));
  const drop = session.checkDrop({ kind: "element", name: "Text", code: 'Text("x")' }, { parent: null, index: "end" }, "base");
  assert.deepEqual(drop, { ok: false, reason: "The code does not parse: fix it in the code view first" });
  assert.equal(session.code("Sign in"), BROKEN);
  assert.deepEqual(session.selection, [text]);
  // No caret selection while it does not parse.
  view.caret(40);
  assert.deepEqual(session.selection, [text]);
  // Retype the brace: it parses again, the same Text node selected.
  view.type(SIGN_IN);
  t.mock.timers.tick(CODE_SYNC_MS);
  assert.deepEqual(seen.map((c) => c.edits), [[{ start: 52, end: 53, text: "" }], [{ start: 52, end: 52, text: "}" }]]);
  assert.equal(session.parses("Sign in"), true);
  assert.deepEqual(session.selection, [text]);
  assert.equal(session.tree("Sign in")!.byId(text)!.name, "Text");
});

test("TC-1 (C1): leaving the view applies the typed text at once; typing back to the code applies nothing", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view, sync } = joined();
  const seen = changes(session);
  view.type(SIGN_IN.replace("back", "back!"));
  assert.equal(sync.pending, true);
  view.dispatch("focusout");
  assert.equal(sync.pending, false);
  assert.deepEqual(seen.map((c) => c.edits), [[{ start: 29, end: 29, text: "!" }]]);
  view.type(SIGN_IN.replace("back", "back!?"));
  view.type(SIGN_IN.replace("back", "back!"));
  t.mock.timers.tick(CODE_SYNC_MS);
  assert.equal(seen.length, 1);
});

test("TC-2 (C4): the caret moved by the user selects the innermost node holding it, nothing outside every node", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view, node } = joined();
  view.caret(40);
  assert.deepEqual(session.selection, [node("Button")]);
  view.caret(9);
  assert.deepEqual(session.selection, [node("VStack")]);
  view.caret(53);
  assert.deepEqual(session.selection, []);
  assert.equal(session.nodeAt("Sign in", 11), node("Text"));
  // While typed text waits, the caret selects nothing.
  view.type(SIGN_IN.replace("back", "bac"));
  view.caret(40);
  assert.deepEqual(session.selection, []);
});

test("TC-2 (C5): another component's change reaches the view as its text edits, typed text kept past them", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view, node } = joined();
  session.select([node("Button")]);
  session.delete();
  const AFTER = 'VStack {\n  Text("Welcome back")\n}\n';
  assert.equal(session.code("Sign in"), AFTER);
  assert.equal(view.value, AFTER);
  assert.equal(view.applied.length, 1, "applied as edits, not by setting the value");

  // Typed text waiting before the deleted range: the edits move past it, the typing stays pending.
  const s2 = joined();
  s2.view.type(SIGN_IN.replace("back", "back!"));
  s2.session.select([s2.node("Button")]);
  s2.session.delete();
  assert.equal(s2.view.value, 'VStack {\n  Text("Welcome back!")\n}\n');
  assert.equal(s2.sync.pending, true);
  t.mock.timers.tick(CODE_SYNC_MS);
  assert.equal(s2.session.code("Sign in"), 'VStack {\n  Text("Welcome back!")\n}\n');

  // Typed text inside the deleted range: the session's code wins.
  const s3 = joined();
  s3.view.type(SIGN_IN.replace("Sign in", "Sign up"));
  s3.session.select([s3.node("Button")]);
  s3.session.delete();
  assert.equal(s3.view.value, AFTER);
  assert.equal(s3.sync.pending, false);
});

test("TC-2 (C6): the selection's span is marked in the view, and nothing while typed text waits", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view, node } = joined();
  session.select([node("Text")]);
  assert.deepEqual(view.marks.at(-1), { start: 11, end: 31 });
  session.select([node("Text"), node("Button")]);
  assert.deepEqual(view.marks.at(-1), { start: 11, end: 51 });
  view.type(SIGN_IN.replace("back", "bac"));
  assert.equal(view.marks.at(-1), null);
});

test("the active mockup: typed text goes to the old one first, then the view shows the new one", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { session, view } = joined();
  view.type(SIGN_IN.replace("back", "home"));
  session.setActive("Inbox");
  assert.equal(session.code("Sign in"), SIGN_IN.replace("back", "home"));
  assert.equal(view.value, INBOX);
});

test("R-TOOL-007.C11: Edit in code is offered with the span of a derived node or one with a code-only value", () => {
  const session = new DesignSession(doc());
  session.setActive("Inbox");
  const tree = session.tree("Inbox")!;
  // INBOX offsets: ForEach 27 to its closure's "}" at 63 (span end 64); Text(n) 53-60.
  session.select([tree.nodes.find((n) => n.name === "ForEach")!.id]);
  assert.deepEqual(inspect(session, "base").editInCode, { start: 27, end: 64 });
  session.select([tree.nodes.find((n) => n.name === "Text")!.id]);
  assert.deepEqual(inspect(session, "base").editInCode, { start: 53, end: 60 });
  session.setActive("Sign in");
  session.select([session.tree("Sign in")!.nodes.find((n) => n.name === "Text")!.id]);
  assert.equal(inspect(session, "base").editInCode, null);
});
