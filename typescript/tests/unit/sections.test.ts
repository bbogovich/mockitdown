// IT-72 (unit part): sections and the view (R-TOOL-014) — the rules in `mockitdown/design`
// (design/sections.ts) and the session's `newSection`, `moveSection`, `resizeSection`, `renameSection`
// and `saveView`. Every expected value was worked out by hand before the code ran:
//
//   sectionAround({0, 0, 100 × 50}) with 40 → {-40, -40, 180 × 130}.
//   framesInside, edges included: a frame {0, 0, 100 × 100} in {0, 0, 100 × 100} is inside; one
//     {50, 50, 100 × 100} is not.
//   snapSectionMove from (-40, -40) by (13, 21): (-27, -19) → (round(-3.375)·8, round(-2.375)·8) =
//     (-24, -16); free: (-27, -19).
//   resizeSectionBox of {0, 0, 200 × 100}: "se" by (13, 21) → right 213 → 216, bottom 121 → 120:
//     {0, 0, 216 × 120}; "nw" by (300, -5) → left min(304, 200 - 40) = 160, top -8: {160, -8, 40 × 108};
//     "w" by 10.5, free → {10.5, 0, 189.5 × 100}.
//   documentView: none → {1, 0, 0}; {zoom 10, x 5} → {4, 5, 0}.
//   The session's document (no measure: a frame is as big as its options' width and height):
//     Sign in {0, 0, 390 × 844}, Inbox {480, 0, 300 × 600}, Message {0, 1000, 390 × 844}, Inbox active.
//   newSection("Onboarding") → {440, -40, 380 × 680}, the document's first `sections`; undo removes the
//     key, redo puts it back.
//   A section Top {-40, -40, 900 × 1100} holds Sign in (0..390 × 0..844) and Inbox (480..780 × 0..600)
//     wholly; Message (1000..1844) only partly. moveSection(0, 60, -40), by (100, 0): Sign in → (100, 0),
//     Inbox → (580, 0), Message stays at (0, 1000); undo gives back the text the document was written as.
//   saveView: unchanged view, nothing written; {0.5, -20, 10} → view {zoom 0.5, x -20, y 10,
//     active "Inbox", grid true} (an unknown key kept after the known ones); after setActive("Message")
//     the active name follows. A document without a view gains none until the view or the active
//     mockup differs from what it opens with.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DesignSession, documentView, EMPTY_SECTION_NAME, framesInside, newDesign, newSectionName, readDesign, resizeSectionBox, SECTION_MARGIN, SECTION_MIN,
  sectionAround, snapSectionMove, writeDesign, type DesignDocument, type DesignNotification,
} from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

function three(view = true): DesignDocument {
  const d = newDesign("Mail");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Sign in", x: 0, y: 0, options: { width: 390, height: 844 }, code: 'Text("Sign in")\n' });
  d.mockups.push({ name: "Inbox", x: 480, y: 0, options: { width: 300, height: 600 }, code: 'Text("Inbox")\n' });
  d.mockups.push({ name: "Message", x: 0, y: 1000, options: { width: 390, height: 844 }, code: 'Text("Message")\n' });
  if (view) d.view = { zoom: 1, x: 0, y: 0, active: "Inbox" };
  return d;
}

function recorder(session: DesignSession): DesignNotification[] {
  const seen: DesignNotification[] = [];
  session.subscribe((n) => seen.push(n));
  return seen;
}

const positions = (s: DesignSession): [string, number, number][] => s.document.mockups.map((m) => [m.name, m.x, m.y]);

test("C2: a new section's box is the frame grown by 40 units", () => {
  assert.equal(SECTION_MARGIN, 40);
  assert.deepEqual(sectionAround({ x: 0, y: 0, w: 100, h: 50 }), { x: -40, y: -40, w: 180, h: 130 });
});

test("C3: the frames lying wholly inside a section, edges included", () => {
  const frames: [string, { x: number; y: number; w: number; h: number }][] = [
    ["a", { x: 0, y: 0, w: 100, h: 100 }],
    ["b", { x: 50, y: 50, w: 100, h: 100 }],
  ];
  assert.deepEqual(framesInside({ x: 0, y: 0, w: 100, h: 100 }, frames), ["a"]);
});

test("C3: a moved section snaps to the grid, freely with Alt; a resized one keeps its opposite edges", () => {
  assert.deepEqual(snapSectionMove({ x: -40, y: -40, w: 10, h: 10 }, 13, 21), { x: -24, y: -16 });
  assert.deepEqual(snapSectionMove({ x: -40, y: -40, w: 10, h: 10 }, 13, 21, true), { x: -27, y: -19 });
  const box = { x: 0, y: 0, w: 200, h: 100 };
  assert.deepEqual(resizeSectionBox(box, "se", 13, 21), { x: 0, y: 0, w: 216, h: 120 });
  assert.equal(SECTION_MIN, 40);
  assert.deepEqual(resizeSectionBox(box, "nw", 300, -5), { x: 160, y: -8, w: 40, h: 108 });
  assert.deepEqual(resizeSectionBox(box, "w", 10.5, 0, true), { x: 10.5, y: 0, w: 189.5, h: 100 });
});

test("C4: the view a canvas opens a document with", () => {
  assert.deepEqual(documentView(undefined), { zoom: 1, x: 0, y: 0 });
  assert.deepEqual(documentView({ zoom: 10, x: 5 }), { zoom: 4, x: 5, y: 0 });
});

test("TC-2: newSection encloses the active frame with 40 units, one undo step (C2)", () => {
  const s = new DesignSession(three());
  const seen = recorder(s);
  assert.equal("sections" in s.document, false);
  assert.deepEqual(s.newSection("Onboarding"), { section: 0 });
  assert.deepEqual(s.document.sections, [{ name: "Onboarding", x: 440, y: -40, w: 380, h: 680 }]);
  assert.deepEqual(seen, [{ kind: "change", detail: { kind: "sections", mockup: "", edits: [], code: "" } }]);
  assert.equal(s.canUndo, true);
  s.undo();
  assert.equal("sections" in s.document, false);
  assert.equal(seen.length, 2);
  s.redo();
  assert.deepEqual(s.document.sections, [{ name: "Onboarding", x: 440, y: -40, w: 380, h: 680 }]);
});

test("C2: newSection refuses an empty name and a session with no active mockup, changing nothing", () => {
  const s = new DesignSession(three());
  const seen = recorder(s);
  assert.deepEqual(s.newSection(""), { error: EMPTY_SECTION_NAME });
  const empty = new DesignSession(newDesign("Empty"));
  assert.deepEqual(empty.newSection("A"), { error: "there is no active mockup" });
  assert.equal(seen.length, 0);
  assert.equal(s.canUndo, false);
  assert.equal("sections" in s.document, false);
});

test("TC-2: moving a section carries the frames wholly inside it, not one partly outside; one undo step (C3)", () => {
  const d = three();
  d.sections = [{ name: "Top", x: -40, y: -40, w: 900, h: 1100, color: "blue" }];
  const text = writeDesign(d);
  const read = readDesign(text);
  if (!("document" in read)) throw new Error("not read");
  const s = new DesignSession(read.document);
  const seen = recorder(s);
  assert.deepEqual(s.moveSection(0, 60, -40), { section: 0 });
  assert.deepEqual(positions(s), [["Sign in", 100, 0], ["Inbox", 580, 0], ["Message", 0, 1000]]);
  assert.equal(s.document.sections![0]!.x, 60);
  assert.equal(s.document.sections![0]!.color, "blue");
  assert.deepEqual(seen.map((n) => n.kind === "change" && n.detail.kind), ["sections"]);
  s.undo();
  assert.equal(writeDesign(s.document), text);
  s.redo();
  assert.deepEqual(positions(s), [["Sign in", 100, 0], ["Inbox", 580, 0], ["Message", 0, 1000]]);
  // A move to where it is changes nothing.
  assert.deepEqual(s.moveSection(0, 60, -40), { section: 0 });
  assert.equal(seen.length, 3);
});

test("TC-2: resizing and renaming a section are one undo step each; refusals change nothing (C3)", () => {
  const d = three();
  d.sections = [{ name: "Top", x: -40, y: -40, w: 900, h: 1100 }];
  const s = new DesignSession(d);
  const seen = recorder(s);
  assert.deepEqual(s.resizeSection(0, { x: -40, y: -40, w: 1000, h: 1100 }), { section: 0 });
  assert.equal(d.sections[0]!.w, 1000);
  assert.deepEqual(s.renameSection(0, "Main"), { section: 0 });
  assert.equal(d.sections[0]!.name, "Main");
  assert.equal(seen.length, 2);
  assert.deepEqual(s.renameSection(0, ""), { error: EMPTY_SECTION_NAME });
  assert.deepEqual(s.renameSection(5, "X"), { error: "there is no section 5" });
  assert.deepEqual(s.resizeSection(0, { x: 0, y: 0, w: 0, h: 10 }), { error: "a section's box needs finite x and y and a positive w and h" });
  assert.deepEqual(s.moveSection(1, 0, 0), { error: "there is no section 1" });
  assert.equal(seen.length, 2);
  s.undo();
  assert.equal(d.sections[0]!.name, "Top");
  s.undo();
  assert.equal(d.sections[0]!.w, 900);
  assert.equal(s.canUndo, false);
});

test("TC-1: saveView writes the view and the active mockup only when they differ from the document's (C4, C5)", () => {
  const d = three();
  d.view!.grid = true;
  const text = writeDesign(d);
  const read = readDesign(text);
  if (!("document" in read)) throw new Error("not read");
  const s = new DesignSession(read.document);
  s.saveView({ zoom: 1, x: 0, y: 0 });
  assert.equal(writeDesign(s.document), text);
  s.saveView({ zoom: 0.5, x: -20, y: 10 });
  assert.deepEqual(s.document.view, { zoom: 0.5, x: -20, y: 10, active: "Inbox", grid: true });
  assert.match(writeDesign(s.document), /"zoom": 0\.5,\n    "x": -20,\n    "y": 10,\n    "active": "Inbox",\n    "grid": true\n/);
  s.setActive("Message");
  s.saveView({ zoom: 0.5, x: -20, y: 10 });
  assert.equal(s.document.view!.active, "Message");
  assert.equal(s.canUndo, false);

  const bare = new DesignSession(three(false));
  bare.saveView({ zoom: 1, x: 0, y: 0 });
  assert.equal("view" in bare.document, false);
  bare.setActive("Message");
  bare.saveView({ zoom: 1, x: 0, y: 0 });
  assert.deepEqual(bare.document.view, { zoom: 1, x: 0, y: 0, active: "Message" });
});

// TC-3 (C11-C14, F-20.AC8), every expected value written by hand before the code ran:
//   The document is three() with one section Top {-40, -40, 900 × 1100}; Inbox active.
//   setCurrentSection(0) notifies section { section: 0 }, once; again, nothing.
//   Flow made current again, undoing newSection leaves no section current.
//   newSection("Flow") → { section: 1 }, Flow {440, -40, 380 × 680}, the current section 1; notified:
//     one change (sections), which stands for the new current section too.
//   deleteSection() → { section: 1 }: sections [Top], the frames at (0, 0), (480, 0), (0, 1000); notified:
//     one change (sections); no section current. Undo puts Flow back (current
//     stays none), redo removes it again.
//   deleteSection(5) → "there is no section 5"; deleteSection() with none current → "no section is
//     current"; neither records a step or notifies.
//   newSectionName: [] → "Section 1"; two sections → "Section 3".
//   commands: … "deleteMockup", "newSection", "deleteSection", "undo", "redo"; New Section and Delete
//     Section with no shortcut; newSection enabled with an active mockup, deleteSection only with a
//     current section. run("newSection", {name: "Run"}) → { section: 2 }; run("deleteSection",
//     {section: 0}) → { section: 0 }, leaving [Flow, Run].
//   AC8: three() without sections, newSection("Flow") then deleteSection() writes the text it was read from.

function withTop(): DesignDocument {
  const d = three();
  d.sections = [{ name: "Top", x: -40, y: -40, w: 900, h: 1100 }];
  return d;
}

test("TC-3: a section's label makes it current; newSection makes its section current (C11)", () => {
  const s = new DesignSession(withTop());
  const seen = recorder(s);
  assert.equal(s.currentSection, null);
  assert.deepEqual(s.setCurrentSection(0), { section: 0 });
  assert.equal(s.currentSection, 0);
  assert.deepEqual(seen, [{ kind: "section", detail: { section: 0 } }]);
  assert.deepEqual(s.setCurrentSection(0), { section: 0 });
  assert.equal(seen.length, 1, "making the current section current notifies nothing");
  assert.deepEqual(s.setCurrentSection(3), { error: "there is no section 3" });
  assert.equal(s.currentSection, 0);
  assert.deepEqual(s.newSection("Flow"), { section: 1 });
  assert.equal(s.currentSection, 1);
  assert.deepEqual(seen.slice(1), [{ kind: "change", detail: { kind: "sections", mockup: "", edits: [], code: "" } }]);
  assert.deepEqual(s.setCurrentSection(null), { section: null });
  assert.equal(s.currentSection, null);
  s.setCurrentSection(1);
  assert.equal(s.canUndo, true);
  s.undo();
  assert.equal(s.canUndo, false, "making a section current is no step of the history");
  assert.equal(s.currentSection, null, "undoing newSection removes the current section");
});

test("TC-3: deleteSection removes the current section, leaving the frames where they are, one undo step (C12)", () => {
  const s = new DesignSession(withTop());
  s.newSection("Flow");
  const seen = recorder(s);
  assert.deepEqual(s.deleteSection(), { section: 1 });
  assert.deepEqual(s.document.sections, [{ name: "Top", x: -40, y: -40, w: 900, h: 1100 }]);
  assert.deepEqual(positions(s), [["Sign in", 0, 0], ["Inbox", 480, 0], ["Message", 0, 1000]]);
  assert.deepEqual(seen, [{ kind: "change", detail: { kind: "sections", mockup: "", edits: [], code: "" } }]);
  assert.equal(s.currentSection, null);
  s.undo();
  assert.deepEqual(s.document.sections, [
    { name: "Top", x: -40, y: -40, w: 900, h: 1100 },
    { name: "Flow", x: 440, y: -40, w: 380, h: 680 },
  ]);
  assert.equal(s.currentSection, null);
  s.redo();
  assert.deepEqual(s.document.sections, [{ name: "Top", x: -40, y: -40, w: 900, h: 1100 }]);
  assert.deepEqual(positions(s), [["Sign in", 0, 0], ["Inbox", 480, 0], ["Message", 0, 1000]]);
});

test("TC-3: deleteSection refuses an index no section has and, without one, no current section (C12)", () => {
  const s = new DesignSession(withTop());
  const seen = recorder(s);
  assert.deepEqual(s.deleteSection(5), { error: "there is no section 5" });
  assert.deepEqual(s.deleteSection(), { error: "no section is current" });
  assert.equal(seen.length, 0);
  assert.equal(s.canUndo, false);
  assert.equal(s.document.sections!.length, 1);
});

test("TC-3: a new section's default name is Section <n>, n one more than the sections before it (C14)", () => {
  assert.equal(newSectionName([]), "Section 1");
  assert.equal(newSectionName([{ name: "A", x: 0, y: 0, w: 40, h: 40 }, { name: "A", x: 0, y: 0, w: 40, h: 40 }]), "Section 3");
});

test("TC-3: session.commands lists New Section and Delete Section before Undo; session.run runs them (C13)", () => {
  const s = new DesignSession(withTop());
  const order = s.commands.map((c) => c.name);
  assert.deepEqual(order.slice(order.indexOf("deleteMockup")), ["deleteMockup", "newSection", "deleteSection", "undo", "redo"]);
  const listed = () => s.commands.filter((c) => c.name.endsWith("Section")).map((c) => [c.name, c.label, c.shortcut, c.enabled]);
  assert.deepEqual(listed(), [["newSection", "New Section", null, true], ["deleteSection", "Delete Section", null, false]]);
  s.setCurrentSection(0);
  assert.deepEqual(listed(), [["newSection", "New Section", null, true], ["deleteSection", "Delete Section", null, true]]);
  const empty = new DesignSession(newDesign("Empty"));
  assert.equal(empty.commands.find((c) => c.name === "newSection")!.enabled, false);
  assert.deepEqual(s.run("newSection", { name: "Flow" }), { section: 1 });
  assert.deepEqual(s.run("newSection", { name: "Run" }), { section: 2 });
  assert.deepEqual(s.run("deleteSection", { section: 0 }), { section: 0 });
  assert.deepEqual(s.document.sections!.map((x) => x.name), ["Flow", "Run"]);
});

test("TC-3: a section added and then deleted leaves the document as it was (F-20.AC8)", () => {
  const text = writeDesign(three());
  const read = readDesign(text);
  if (!("document" in read)) throw new Error("not read");
  const s = new DesignSession(read.document);
  s.newSection("Flow");
  s.deleteSection();
  assert.equal(writeDesign(s.document), text);
  s.undo();
  assert.equal(s.document.sections!.length, 1);
  s.undo();
  assert.equal(writeDesign(s.document), text);
});
