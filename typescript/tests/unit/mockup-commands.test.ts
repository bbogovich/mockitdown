// IT-71 (unit part): the active mockup's commands (R-TOOL-013) — `newMockup`, `duplicateMockup` and
// `deleteMockup` in the session and in `session.commands`, and `duplicateMockupName` in
// `mockitdown/design` (design/frames.ts).
// Every expected value was worked out by hand before the code ran:
//
//   duplicateMockupName: "Inbox" among ["Inbox"] → "Inbox-copy"; with "Inbox-copy" taken → "Inbox-copy-2";
//     with "Inbox-copy" and "Inbox-copy-3" → "Inbox-copy-2"; with "Inbox-copy" and "Inbox-copy-2" →
//     "Inbox-copy-3"; "inbox-copy" and "Inbox Copy" do not count (case-sensitive, a space is not a
//     hyphen) → "Inbox-copy"; a copy of "Inbox-copy" → "Inbox-copy-copy".
//   The document: Sign in (0, 0), Inbox (480, 0), Message (0, 1000); measure gives Inbox and its copies
//     300 × 600 and the others 390 × 844; Inbox active.
//   duplicateMockup: "Inbox-copy" placed as a new mockup (R-TOOL-012.C8): the frames overlapping Inbox
//     (y 0..600) vertically are Sign in (right edge 390) and Inbox (780); Message starts at 1000. So
//     (780 + 80, 0) = (860, 0). Then, Inbox active again, "Inbox-copy-2": Inbox copy (860..1160) now
//     overlaps too, so (1160 + 80, 0) = (1240, 0).
//   deleteMockup: deleting the active Inbox from [Sign in, Inbox, Message] makes Message (the next in
//     document order) active; deleting the active Message, the last, makes Inbox (the one before it)
//     active; deleting Sign in while Inbox is active leaves Inbox active and notifies no `active`.
//   session.commands: the thirteen commands of R-EDIT-009 and newMockup ("New Mockup"),
//     duplicateMockup ("Duplicate Mockup") and deleteMockup ("Delete Mockup") before undo, no shortcut;
//     newMockup always enabled, the other two only with an active mockup.
// No expected value changed after the first run.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DesignSession, duplicateMockupName, newDesign, writeDesign, type DesignDocument, type DesignNotification,
} from "mockitdown/design";
import { setup } from "./helpers.js";

setup();

function three(): DesignDocument {
  const d = newDesign("Mail");
  d.defaults = { pack: "base" };
  d.mockups.push({ name: "Sign in", x: 0, y: 0, code: 'Text("Sign in")\n' });
  d.mockups.push({ name: "Inbox", x: 480, y: 0, options: { device: "phone" }, code: 'Text("Inbox")\n', notes: "kept" } as never);
  d.mockups.push({ name: "Message", x: 0, y: 1000, code: 'Text("Message")\n' });
  d.view = { zoom: 1, x: 0, y: 0, active: "Inbox" };
  return d;
}

const measure = (name: string) => (name.startsWith("Inbox") ? { w: 300, h: 600 } : { w: 390, h: 844 });

function session(): DesignSession {
  return new DesignSession(three(), { measure });
}

function recorder(s: DesignSession): DesignNotification[] {
  const seen: DesignNotification[] = [];
  s.subscribe((n) => seen.push(n));
  return seen;
}

const names = (s: DesignSession): string[] => s.document.mockups.map((m) => m.name);
const at = (s: DesignSession, name: string): [number, number] => {
  const m = s.mockup(name)!;
  return [m.x, m.y];
};
/** The notifications as short strings: `change:mockups:<mockup>`, `active:<mockup>`, `select`, …. */
const brief = (seen: DesignNotification[]): string[] => seen.map((n) => {
  if (n.kind === "change") return `change:${n.detail.kind}:${n.detail.mockup}`;
  if (n.kind === "active") return `active:${n.detail.mockup}`;
  return n.kind;
}).filter((s) => s !== "diagnostics");

test("C5: a copy is named <name>-copy, else <name>-copy-<n> with the smallest free n from 2", () => {
  assert.equal(duplicateMockupName(["Inbox"], "Inbox"), "Inbox-copy");
  assert.equal(duplicateMockupName(["Inbox", "Inbox-copy"], "Inbox"), "Inbox-copy-2");
  assert.equal(duplicateMockupName(["Inbox", "Inbox-copy", "Inbox-copy-3"], "Inbox"), "Inbox-copy-2");
  assert.equal(duplicateMockupName(["Inbox", "Inbox-copy", "Inbox-copy-2"], "Inbox"), "Inbox-copy-3");
  assert.equal(duplicateMockupName(["Inbox", "inbox-copy"], "Inbox"), "Inbox-copy");
  assert.equal(duplicateMockupName(["Inbox", "Inbox Copy"], "Inbox"), "Inbox-copy");
  assert.equal(duplicateMockupName(["Inbox", "Inbox-copy"], "Inbox-copy"), "Inbox-copy-copy");
});

test("TC-2: duplicateMockup names and places the copy, makes it active, one step of kind mockups (C4, C5)", () => {
  const s = session();
  const before = writeDesign(s.document);
  const seen = recorder(s);
  const r = s.duplicateMockup();
  assert.deepEqual(r, { mockup: "Inbox-copy" });
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message", "Inbox-copy"]);
  assert.deepEqual(at(s, "Inbox-copy"), [860, 0]);
  assert.equal(s.active, "Inbox-copy");
  const copy = s.mockup("Inbox-copy")! as unknown as Record<string, unknown>;
  const inbox = s.mockup("Inbox")! as unknown as Record<string, unknown>;
  assert.equal(copy.code, 'Text("Inbox")\n');
  assert.deepEqual(copy.options, { device: "phone" });
  assert.notEqual(copy.options, inbox.options, "the copy's options are its own");
  assert.equal(copy.notes, "kept", "keys the tools do not know are copied");
  assert.deepEqual(brief(seen), ["change:mockups:Inbox-copy", "active:Inbox-copy"]);
  const afterFirst = writeDesign(s.document);

  s.setActive("Inbox");
  assert.deepEqual(s.duplicateMockup(), { mockup: "Inbox-copy-2" });
  assert.deepEqual(at(s, "Inbox-copy-2"), [1240, 0]);

  // Each is one step: one undo gives back the document before it.
  seen.length = 0;
  s.undo();
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message", "Inbox-copy"]);
  assert.equal(s.active, "Inbox");
  assert.deepEqual(brief(seen).filter((b) => b.startsWith("change")), ["change:mockups:Inbox-copy-2"]);
  assert.equal(writeDesign(s.document), afterFirst);
  s.undo();
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message"]);
  assert.equal(s.active, "Inbox");
  assert.equal(writeDesign(s.document), before);
  s.redo();
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message", "Inbox-copy"]);
  assert.equal(s.active, "Inbox-copy");
});

test("TC-2: duplicateMockup of a named mockup; refusals change nothing (C4, C5)", () => {
  const s = session();
  assert.deepEqual(s.duplicateMockup("Sign in"), { mockup: "Sign in-copy" });
  // Placed beside the mockup it copies: Sign in {0, 0, 390 × 844}, overlapped by Inbox (780): (860, 0).
  assert.deepEqual(at(s, "Sign in-copy"), [860, 0]);
  assert.equal(s.active, "Sign in-copy");
  const seen = recorder(s);
  const doc = writeDesign(s.document);
  assert.match((s.duplicateMockup("Nope") as { error: string }).error, /^there is no mockup named "Nope"$/);
  assert.equal(writeDesign(s.document), doc);
  assert.deepEqual(seen, []);
  const empty = new DesignSession(newDesign("Empty"));
  assert.match((empty.duplicateMockup() as { error: string }).error, /^there is no active mockup$/);
  assert.equal(empty.canUndo, false);
});

test("TC-2: deleteMockup removes a mockup, the next or previous becomes active, one step of kind mockups (C4)", () => {
  const s = session();
  const before = writeDesign(s.document);
  const inboxNode = s.nodeFor("Inbox", "n1")!;
  s.select([inboxNode]);
  const seen = recorder(s);
  assert.deepEqual(s.deleteMockup(), { mockup: "Inbox" });
  assert.deepEqual(names(s), ["Sign in", "Message"]);
  assert.equal(s.active, "Message");
  assert.deepEqual(s.selection, []);
  assert.deepEqual(brief(seen), ["change:mockups:Inbox", "active:Message", "select"]);

  seen.length = 0;
  s.undo();
  assert.deepEqual(names(s), ["Sign in", "Inbox", "Message"]);
  assert.equal(s.active, "Inbox");
  assert.deepEqual(s.selection, [inboxNode], "the selection from before the step");
  assert.equal(writeDesign(s.document), before);
  assert.ok(brief(seen).includes("change:mockups:Inbox"));
  s.redo();
  assert.deepEqual(names(s), ["Sign in", "Message"]);
  assert.equal(s.active, "Message");

  // The last in document order: the one before it becomes active.
  assert.deepEqual(s.deleteMockup(), { mockup: "Message" });
  assert.equal(s.active, "Sign in");
});

test("TC-2: deleteMockup of a named inactive mockup keeps the active one; the last mockup leaves none (C4)", () => {
  const s = session();
  const seen = recorder(s);
  assert.deepEqual(s.deleteMockup("Sign in"), { mockup: "Sign in" });
  assert.deepEqual(names(s), ["Inbox", "Message"]);
  assert.equal(s.active, "Inbox");
  assert.deepEqual(brief(seen), ["change:mockups:Sign in"]);
  assert.match((s.deleteMockup("Sign in") as { error: string }).error, /^there is no mockup named "Sign in"$/);
  s.deleteMockup();
  s.deleteMockup();
  assert.deepEqual(names(s), []);
  assert.equal(s.active, null);
  assert.match((s.deleteMockup() as { error: string }).error, /^there is no active mockup$/);
  s.undo();
  assert.deepEqual(names(s), ["Message"]);
  assert.equal(s.active, "Message");
});

test("TC-2: newMockup through run is one step of kind mockups and undoes to the previous document (C4)", () => {
  const s = session();
  const before = writeDesign(s.document);
  const seen = recorder(s);
  assert.deepEqual(s.run("newMockup"), { mockup: "Mockup 1" });
  assert.deepEqual(at(s, "Mockup 1"), [860, 0]);
  assert.deepEqual(brief(seen), ["change:mockups:Mockup 1", "active:Mockup 1"]);
  s.run("undo");
  assert.equal(writeDesign(s.document), before);
  assert.equal(s.active, "Inbox");
  assert.deepEqual(s.run("duplicateMockup"), { mockup: "Inbox-copy" });
  assert.deepEqual(s.run("deleteMockup", { mockup: "Inbox-copy" }), { mockup: "Inbox-copy" });
  assert.deepEqual(s.run("duplicateMockup", { mockup: "Message" }), { mockup: "Message-copy" });
  s.undo();
  s.undo();
  s.undo();
  assert.equal(writeDesign(s.document), before);
});

test("TC-2: session.commands lists the mockup commands, enabled as there is an active mockup (C4)", () => {
  const s = session();
  const listed = s.commands.filter((c) => c.name.endsWith("Mockup")).map((c) => [c.name, c.label, c.shortcut, c.enabled]);
  assert.deepEqual(listed, [
    ["newMockup", "New Mockup", null, true],
    ["duplicateMockup", "Duplicate Mockup", null, true],
    ["deleteMockup", "Delete Mockup", null, true],
  ]);
  const order = s.commands.map((c) => c.name);
  assert.equal(order.indexOf("deleteMockup") + 1, order.indexOf("undo"));
  const empty = new DesignSession(newDesign("Empty"));
  const enabled = Object.fromEntries(empty.commands.map((c) => [c.name, c.enabled]));
  assert.equal(enabled.newMockup, true);
  assert.equal(enabled.duplicateMockup, false);
  assert.equal(enabled.deleteMockup, false);
});
