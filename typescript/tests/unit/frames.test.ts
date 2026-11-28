// IT-70 (unit part): mockup frames (R-TOOL-012) — naming, renaming, placing and snapping in
// `mockitdown/design` (design/frames.ts) and the session's `renameMockup`, `newMockup` and moves.
// Every expected value was worked out by hand before the code ran:
//
//   newMockupName: none → "Mockup 1"; "Mockup 1", "Mockup 3" → "Mockup 2"; "mockup 1" does not count
//     (case-sensitive) → "Mockup 1"; "Mockup 1", "Mockup 2" → "Mockup 3".
//   snapMove, 8-unit grid, 6 px edges: {13, 21} alone → (round(13/8)·8, round(21/8)·8) = (16, 24); with
//     Alt (free) it stays (13, 21). A 100 × 50 box at (95, 37) beside a frame at x 200..300, y 0..300:
//     its right edge 195 is 5 from 200, within 6 at 100 % → x 100; y has no edge within 6 (37 and 87
//     against 0 and 300) → round(37/8)·8 = 40. At 200 % the 6 px are 3 units, so 5 is too far:
//     x round(95/8)·8 = 96. At (203, 37) its left edge 203 is 3 from 200 → x 200.
//   newMockupPlace: the active frame {0, 0, 390 × 844}; B {480, 100, 300 × 400} overlaps it vertically,
//     C {2000, 900} lies below it, D {900, -500, 200 × 500} ends at 0 where it starts (no overlap): the
//     rightmost overlapping edge is B's 780, so (780 + 80, 0) = (860, 0). No active frame → (0, 0).
//   session.newMockup over Sign in {0, 0} (390 × 844) and Inbox {480, 0} (300 × 600), Inbox active:
//     "Mockup 1" at (480 + 300 + 80, 0) = (860, 0).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_NAME_WARNING, DesignSession, EDGE_SNAP, GRID, isDefaultName, NEW_MOCKUP_CODE, NEW_MOCKUP_GAP, newDesign, newMockupName,
  newMockupPlace, renameRefusal, snapMove, type DesignDocument, type DesignNotification,
} from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

function three(): DesignDocument {
  const d = newDesign("Mail");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Sign in", x: 0, y: 0, code: 'Text("Sign in")\n' });
  d.mockups.push({ name: "Inbox", x: 480, y: 0, code: 'Text("Inbox")\n' });
  d.mockups.push({ name: "Message", x: 0, y: 1000, code: 'Text("Message")\n' });
  d.view = { zoom: 1, x: 0, y: 0, active: "Message" };
  return d;
}

function recorder(session: DesignSession): DesignNotification[] {
  const seen: DesignNotification[] = [];
  session.subscribe((n) => seen.push(n));
  return seen;
}

const names = (s: DesignSession): string[] => s.document.mockups.map((m) => m.name);

test("C8: a new mockup's name is Mockup <n>, the smallest free n from 1", () => {
  assert.equal(newMockupName([]), "Mockup 1");
  assert.equal(newMockupName(["Mockup 1", "Mockup 3"]), "Mockup 2");
  assert.equal(newMockupName(["mockup 1"]), "Mockup 1");
  assert.equal(newMockupName(["Mockup 1", "Mockup 2"]), "Mockup 3");
});

test("C9: default names and their warning", () => {
  assert.equal(isDefaultName("Mockup 1"), true);
  assert.equal(isDefaultName("Mockup 12"), true);
  assert.equal(isDefaultName("Mockup"), false);
  assert.equal(isDefaultName("mockup 1"), false);
  assert.equal(isDefaultName("Mockup 1 copy"), false);
  assert.equal(isDefaultName("Mockup 1a"), false);
  assert.match(DEFAULT_NAME_WARNING, /SpecItOut tools import mockups by name/);
});

test("C4, C5: a rename's refusal", () => {
  const taken = ["Sign in", "Inbox", "Message"];
  assert.equal(renameRefusal(taken, "Message", "Inbox"), "A mockup named “Inbox” already exists");
  assert.equal(renameRefusal(taken, "Message", "inbox"), null);
  assert.equal(renameRefusal(taken, "Message", "Message"), null);
  assert.equal(renameRefusal(taken, "Message", "New message"), null);
  assert.equal(renameRefusal(taken, "Message", ""), "A mockup's name must not be empty");
});

test("C2: snapping to the 8-unit grid and to other frames' edges within 6 px; Alt is free", () => {
  assert.equal(GRID, 8);
  assert.equal(EDGE_SNAP, 6);
  assert.deepEqual(snapMove({ x: 13, y: 21, w: 100, h: 50 }, [], 1), { x: 16, y: 24 });
  assert.deepEqual(snapMove({ x: 13, y: 21, w: 100, h: 50 }, [], 1, true), { x: 13, y: 21 });
  const other = { x: 200, y: 0, w: 100, h: 300 };
  assert.deepEqual(snapMove({ x: 95, y: 37, w: 100, h: 50 }, [other], 1), { x: 100, y: 40 });
  assert.deepEqual(snapMove({ x: 95, y: 37, w: 100, h: 50 }, [other], 2), { x: 96, y: 40 });
  assert.deepEqual(snapMove({ x: 203, y: 37, w: 100, h: 50 }, [other], 1), { x: 200, y: 40 });
});

test("C8: a new mockup goes 80 units right of the rightmost frame overlapping the active one vertically", () => {
  assert.equal(NEW_MOCKUP_GAP, 80);
  const active = { x: 0, y: 0, w: 390, h: 844 };
  const frames = [active, { x: 480, y: 100, w: 300, h: 400 }, { x: 2000, y: 900, w: 300, h: 400 }, { x: 900, y: -500, w: 200, h: 500 }];
  assert.deepEqual(newMockupPlace(active, frames), { x: 860, y: 0 });
  assert.deepEqual(newMockupPlace(null, []), { x: 0, y: 0 });
});

test("TC-1 (session): a taken name is refused and notifies nothing; a case-different one renames and undoes (C4-C7)", () => {
  const s = new DesignSession(three());
  const seen = recorder(s);
  assert.deepEqual(s.renameMockup("Message", "Inbox"), { error: "A mockup named “Inbox” already exists" });
  assert.deepEqual(s.renameMockup("Message", ""), { error: "A mockup's name must not be empty" });
  assert.deepEqual(s.renameMockup("Nothing", "Other"), { error: 'there is no mockup named "Nothing"' });
  assert.deepEqual(s.renameMockup("Message", "Message"), { mockup: "Message" });
  assert.deepEqual(seen, []);
  assert.equal(s.canUndo, false);
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message"]);

  assert.deepEqual(s.renameMockup("Message", "inbox"), { mockup: "inbox" });
  assert.deepEqual(seen, [{ kind: "rename", detail: { from: "Message", to: "inbox" } }]);
  assert.deepEqual(names(s), ["Sign in", "Inbox", "inbox"]);
  assert.equal(s.active, "inbox");
  assert.equal(s.document.view?.active, "inbox");
  assert.equal(s.code("inbox"), 'Text("Message")\n');

  seen.length = 0;
  assert.ok(!("error" in s.undo()));
  assert.deepEqual(seen, [{ kind: "rename", detail: { from: "inbox", to: "Message" } }]);
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message"]);
  assert.equal(s.active, "Message");
  assert.equal(s.document.view?.active, "Message");
  seen.length = 0;
  assert.ok(!("error" in s.redo()));
  assert.deepEqual(seen, [{ kind: "rename", detail: { from: "Message", to: "inbox" } }]);
  assert.deepEqual(names(s), ["Sign in", "Inbox", "inbox"]);
});

test("C7: steps before a rename still undo on the renamed mockup", () => {
  const s = new DesignSession(three());
  s.setCode("Message", 'Text("Hello")\n');
  s.moveMockup("Message", 8, 1008);
  s.renameMockup("Message", "Note");
  s.setCode("Note", 'Text("Bye")\n');
  assert.ok(!("error" in s.undo()));
  assert.equal(s.code("Note"), 'Text("Hello")\n');
  assert.ok(!("error" in s.undo()));
  assert.ok(!("error" in s.undo()));
  assert.deepEqual([s.mockup("Message")?.x, s.mockup("Message")?.y], [0, 1000]);
  assert.ok(!("error" in s.undo()));
  assert.equal(s.code("Message"), 'Text("Message")\n');
  assert.equal(s.canUndo, false);
  for (let k = 0; k < 4; k++) assert.ok(!("error" in s.redo()));
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Note"]);
  assert.equal(s.code("Note"), 'Text("Bye")\n');
});

test("C1, C6, C7: a move is one step notifying change of kind move", () => {
  const s = new DesignSession(three());
  const seen = recorder(s);
  assert.deepEqual(s.moveMockup("Message", 16, 1024), { mockup: "Message" });
  assert.deepEqual(seen.map((n) => [n.kind, n.kind === "change" ? n.detail.kind : null]), [["change", "move"]]);
  s.undo();
  assert.deepEqual([s.mockup("Message")?.x, s.mockup("Message")?.y], [0, 1000]);
  assert.equal(s.canUndo, false);
});

test("C8 (session): newMockup names and places the mockup by the measured frames, makes it active, and undoes", () => {
  const d = newDesign("Mail");
  d.mockups.push({ name: "Sign in", x: 0, y: 0, code: 'Text("Sign in")\n' });
  d.mockups.push({ name: "Inbox", x: 480, y: 0, code: 'Text("Inbox")\n' });
  d.view = { active: "Inbox" };
  const s = new DesignSession(d);
  const sizes: Record<string, { w: number; h: number }> = { "Sign in": { w: 390, h: 844 }, Inbox: { w: 300, h: 600 } };
  s.measure = (name) => sizes[name] ?? null;
  const seen = recorder(s);
  assert.deepEqual(s.newMockup(), { mockup: "Mockup 1" });
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Mockup 1"]);
  const m = s.mockup("Mockup 1")!;
  assert.deepEqual([m.x, m.y, m.code], [860, 0, NEW_MOCKUP_CODE]);
  assert.equal(s.active, "Mockup 1");
  assert.deepEqual(seen.map((n) => n.kind === "change" ? `change:${n.detail.kind}:${n.detail.mockup}` : `${n.kind}`), ["change:mockups:Mockup 1", "active"]);

  seen.length = 0;
  assert.ok(!("error" in s.undo()));
  assert.deepEqual(names(s), ["Sign in", "Inbox"]);
  assert.equal(s.active, "Inbox");
  // Undo restores the active mockup first, then notifies the change and the restored selection
  // (R-EDIT-007.C3, C7). (First written as change then active; corrected after the run to the order
  // every undo has.)
  assert.deepEqual(seen.map((n) => n.kind === "change" ? `change:${n.detail.kind}` : n.kind), ["active", "change:mockups", "select"]);
  assert.ok(!("error" in s.redo()));
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Mockup 1"]);
  assert.equal(s.active, "Mockup 1");
  // Without a measure a frame is its options' width and height, else empty: the next one goes 80 right of Mockup 1.
  s.measure = null;
  assert.deepEqual(s.newMockup('Text("Two")\n'), { mockup: "Mockup 2" });
  assert.deepEqual([s.mockup("Mockup 2")!.x, s.mockup("Mockup 2")!.y], [940, 0]);
});
