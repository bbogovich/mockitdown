// IT-62: the undo history of the design session (R-EDIT-007). TC-1 (C1, C2, C3, C6, C7, C8, C9): a
// seeded random sequence of 50 operations, commands and code changes; undoing them all gives back the
// document text and the selection the session started with, redoing them all the final ones, and each
// undo and redo notifies exactly one `change` whose edits turn the code before it into the code after
// it. TC-2 (C4), node part: coalescing with a fake clock. The expected values are written by hand: the
// original document text (captured before any change), the selection and active mockup at fixed
// points, and the step counts that C4, C6 and C9 imply.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DesignSession, newDesign, writeDesign, type DesignDocument, type DesignNotification, type TextEdit } from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

const SIGN_IN = 'VStack {\n  Text("Welcome back")\n  Button("Sign in")\n}\n';
const INBOX = '// The inbox\nNavigationStack {\n  List {\n    Text("Ada")\n    Text("Grace")\n  }\n}\n';

function twoMockups(): DesignDocument {
  const d = newDesign("Mail");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Sign in", x: 0, y: 0, code: SIGN_IN });
  d.mockups.push({ name: "Inbox", x: 600, y: 0, options: { device: "phone" }, code: INBOX });
  return d;
}

function recorder(session: DesignSession): DesignNotification[] {
  const seen: DesignNotification[] = [];
  session.subscribe((n) => seen.push(n));
  return seen;
}

/** Apply text edits (M-EDIT-3: offsets into the code before them, in any order) to a code. */
function applyEdits(code: string, edits: readonly TextEdit[]): string {
  let out = code;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

/** A small deterministic generator (mulberry32), so that the "random" sequence is the same on every run. */
function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const where = (s: DesignSession) => ({ active: s.active, selection: [...s.selection] });

/** One random change through the session, preceded by a random selection; true when it changed something. */
function randomChange(s: DesignSession, rnd: () => number, k: number): boolean {
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]!;
  if (rnd() < 0.15) s.setActive(pick(s.document.mockups).name);
  const name = s.active!;
  const tree = s.tree(name)!;
  if (tree.nodes.length && rnd() < 0.7) s.select([pick(tree.nodes).id]);
  else s.select([]);
  const before = s.code(name);
  const doc = writeDesign(s.document);
  switch (Math.floor(rnd() * 7)) {
    case 0: s.insert(`Text("t${k}")`); break;
    case 1: s.delete(); break;
    case 2: {
      const texts = tree.nodes.filter((n) => s.firstText(n.id) !== null);
      if (texts.length) s.setText(pick(texts).id, `edited ${k}`);
      break;
    }
    case 3: s.setCode(name, `${before}// note ${k}\n`); break;
    case 4: s.setOptions(name, { device: pick(["phone", "tablet", "fit"]), caption: k % 2 === 0 }); break;
    case 5: s.moveMockup(name, k * 10, k * 5); break;
    case 6: {
      const sel = s.selection[0];
      const node = sel ? tree.byId(sel) : null;
      if (node?.parent) s.move([node.id], node.parent.parent?.id ?? null, 0);
      break;
    }
  }
  return writeDesign(s.document) !== doc;
}

test("TC-1: undoing every step restores the document and the selection, redoing every step the final ones (C1-C3, C7, C8, V1)", () => {
  const s = new DesignSession(twoMockups());
  const original = writeDesign(s.document);
  const start = where(s);
  assert.equal(s.canUndo, false, "a fresh session has nothing to undo");
  assert.equal(s.canRedo, false);
  // The first step is taken from where the session started, so that undoing it gives that selection back.
  s.setCode("Sign in", `${SIGN_IN}// first\n`);
  const rnd = random(34);
  let steps = 1;
  for (let k = 0; steps < 50; k++) {
    assert.ok(k < 1000, "the random sequence makes 50 changes");
    if (randomChange(s, rnd, k)) steps++;
  }
  const final = writeDesign(s.document);
  const end = where(s);
  assert.notEqual(final, original);
  assert.equal(s.canUndo, true);
  assert.equal(s.canRedo, false);

  // C3, C7: each undo reverts one step and notifies exactly one change, whose edits give the code.
  const seen = recorder(s);
  let undone = 0;
  while (s.canUndo) {
    const codes = new Map(s.document.mockups.map((m) => [m.name, m.code]));
    seen.length = 0;
    const r = s.undo();
    assert.ok(!("error" in r), "error" in r ? r.error : "");
    const changes = seen.filter((n) => n.kind === "change");
    assert.equal(changes.length, 1, `undo ${undone + 1} notifies one change`);
    const c = changes[0]!;
    if (c.kind === "change") {
      assert.equal(applyEdits(codes.get(c.detail.mockup)!, c.detail.edits), s.code(c.detail.mockup));
      assert.equal(c.detail.code, s.code(c.detail.mockup));
    }
    undone++;
  }
  assert.equal(undone, 50, "C2: every change formed exactly one step");
  assert.equal(writeDesign(s.document), original, "V1: the document the session started with");
  assert.deepEqual(where(s), start, "V1: the selection the session started with");
  assert.equal(s.canUndo, false);
  assert.equal(s.canRedo, true);
  assert.ok("error" in s.undo(), "nothing left to undo");

  let redone = 0;
  while (s.canRedo) {
    const codes = new Map(s.document.mockups.map((m) => [m.name, m.code]));
    seen.length = 0;
    const r = s.redo();
    assert.ok(!("error" in r), "error" in r ? r.error : "");
    const changes = seen.filter((n) => n.kind === "change");
    assert.equal(changes.length, 1, `redo ${redone + 1} notifies one change`);
    const c = changes[0]!;
    if (c.kind === "change") assert.equal(applyEdits(codes.get(c.detail.mockup)!, c.detail.edits), s.code(c.detail.mockup));
    redone++;
  }
  assert.equal(redone, 50);
  assert.equal(writeDesign(s.document), final, "V1: the final document");
  assert.deepEqual(where(s), end, "V1: the final selection");
  assert.ok("error" in s.redo(), "nothing left to redo");
});

test("TC-1: undo and redo restore the selection from before and after a command, the nodes keeping their ids (C3)", () => {
  const s = new DesignSession(twoMockups());
  const button = s.nodeFor("Sign in", "n3")!;
  s.select([button]);
  s.delete();
  const text = s.nodeFor("Sign in", "n2")!;
  assert.deepEqual([...s.selection], [text], "the delete selects the previous sibling");
  s.undo();
  assert.equal(s.code("Sign in"), SIGN_IN);
  assert.deepEqual([...s.selection], [button], "the button, with the id it had, selected again");
  assert.equal(s.tree("Sign in")!.byId(button)!.name, "Button");
  s.redo();
  assert.deepEqual([...s.selection], [text]);
  assert.equal(s.code("Sign in"), 'VStack {\n  Text("Welcome back")\n}\n');
  // An undo of a step of another mockup makes that mockup active again.
  s.setActive("Inbox");
  s.undo();
  assert.equal(s.active, "Sign in");
  assert.deepEqual([...s.selection], [button]);
});

test("TC-1: a new step after two undos discards the steps that could be redone (C6)", () => {
  const s = new DesignSession(twoMockups());
  for (let k = 0; k < 4; k++) s.setCode("Sign in", `${s.code("Sign in")}// ${k}\n`);
  s.undo();
  s.undo();
  assert.equal(s.canRedo, true);
  s.moveMockup("Inbox", 1, 2);
  assert.equal(s.canRedo, false);
  assert.ok("error" in s.redo());
  s.undo();
  s.undo();
  s.undo();
  assert.equal(s.code("Sign in"), SIGN_IN);
  assert.equal(s.canUndo, false, "two code steps and the move: three steps in all");
});

test("TC-1: options and moves are steps of their own kind, with no edits (C1, C7)", () => {
  const s = new DesignSession(twoMockups());
  const seen = recorder(s);
  s.setOptions("Inbox", { device: "tablet" });
  s.moveMockup("Inbox", 10, 20);
  seen.length = 0;
  s.undo();
  assert.deepEqual(seen.filter((n) => n.kind === "change").map((n) => n.detail), [{ kind: "move", mockup: "Inbox", edits: [], code: INBOX }]);
  assert.deepEqual([s.mockup("Inbox")!.x, s.mockup("Inbox")!.y], [600, 0]);
  seen.length = 0;
  s.undo();
  assert.deepEqual(seen.filter((n) => n.kind === "change").map((n) => n.detail), [{ kind: "options", mockup: "Inbox", edits: [], code: INBOX }]);
  assert.deepEqual(s.mockup("Inbox")!.options, { device: "phone" });
  s.setOptions("Sign in", { device: "phone" });
  s.undo();
  assert.equal("options" in s.mockup("Sign in")!, false, "a mockup without options has none again");
});

test("TC-1: 250 steps keep at least the latest 200 (C9)", () => {
  const s = new DesignSession(twoMockups());
  const codes = [s.code("Sign in")!];
  for (let k = 0; k < 250; k++) {
    s.setCode("Sign in", `${s.code("Sign in")}// ${k}\n`);
    codes.push(s.code("Sign in")!);
  }
  let n = 0;
  while (s.canUndo) {
    s.undo();
    n++;
  }
  assert.ok(n >= 200, `${n} steps kept`);
  assert.equal(s.code("Sign in"), codes[250 - n], "the oldest kept step undone gives the code before it");
});

test("TC-2: changes with one coalescing key within 1000 ms of the latest form one step (C4)", () => {
  let now = 0;
  const s = new DesignSession(twoMockups(), { now: () => now });
  const seen = recorder(s);
  const typed = "Welcome back!!!!!!!!!!!!";
  // Ten changes 100 ms apart, then one 950 ms after the tenth: 1850 ms after the first, still one step.
  for (let k = 1; k <= 11; k++) {
    now += k === 11 ? 950 : 100;
    s.setCode("Sign in", SIGN_IN.replace("Welcome back", typed.slice(0, 12 + k)), { coalesce: "field" });
  }
  assert.equal(seen.filter((n) => n.kind === "change").length, 11, "every change is applied and notified");
  const merged = s.code("Sign in")!;
  // 1500 ms later with the same key: a new step.
  now += 1500;
  s.setCode("Sign in", merged.replace("Sign in", "Log in"), { coalesce: "field" });
  // At once, another key: a new step.
  now += 10;
  s.setCode("Sign in", s.code("Sign in")!.replace("VStack", "HStack"), { coalesce: "other" });
  // No key never merges.
  now += 10;
  s.moveMockup("Sign in", 5, 5);
  now += 10;
  s.moveMockup("Sign in", 6, 6);

  const undos: string[] = [];
  while (s.canUndo) {
    s.undo();
    undos.push(s.code("Sign in")!);
  }
  assert.equal(undos.length, 5, "the burst, the late change, the other key and two moves");
  assert.equal(undos[3], merged, "the late change undone: the burst's last text");
  assert.equal(undos[4], SIGN_IN, "the burst undone in one step");
  // An undo breaks the burst: the same key right after an undo and a redo starts a step of its own.
  const t = new DesignSession(twoMockups(), { now: () => now });
  t.setCode("Sign in", `${SIGN_IN}// a\n`, { coalesce: "field" });
  t.undo();
  t.redo();
  now += 10;
  t.setCode("Sign in", `${SIGN_IN}// a\n// b\n`, { coalesce: "field" });
  t.undo();
  assert.equal(t.code("Sign in"), `${SIGN_IN}// a\n`);
});

test("TC-2: coalesced changes that come back to the start leave no step; operations take a key too (C4)", () => {
  let now = 0;
  const s = new DesignSession(twoMockups(), { now: () => now });
  s.setCode("Sign in", `${SIGN_IN}x`, { coalesce: "code" });
  now += 50;
  s.setCode("Sign in", SIGN_IN, { coalesce: "code" });
  assert.equal(s.canUndo, false, "a burst that changed nothing is no step");
  const text = s.nodeFor("Sign in", "n2")!;
  for (const t of ["W", "We", "Wel"]) {
    now += 200;
    s.setText(text, t, { coalesce: `${text}:text` });
  }
  assert.equal(s.firstText(text), "Wel");
  s.undo();
  assert.equal(s.code("Sign in"), SIGN_IN);
  assert.equal(s.canUndo, false);
});
