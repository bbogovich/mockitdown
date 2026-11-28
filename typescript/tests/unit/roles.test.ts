// IT-56 · R-PACK-016 TC-1 (C1 to C4, C9) and TC-2 (C5 to C8, C16): the role rule table shared/language/roles.json,
// loaded with the shared assets, and canContain / allowedChildren. python/tests/test_roles.py checks the
// same table against the Python renderer. Expected answers and reasons are written by hand from the
// rules of SRC-12#s6.3 (R-PACK-016.C4) and the reason sentence of C6.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PKG, REPO, setup } from "./helpers.js";

const core = setup();
const CATEGORIES = ["frame", "bar", "layout", "collection", "content", "overlay", "annotation"];
const ATTACH: Record<string, string> = {
  frame: "child", bar: "child", layout: "child", collection: "child", content: "child", overlay: "presentation", annotation: "modifier",
};

interface Rule { title: string; category: string; accepts: string[]; attach: string }
const table = JSON.parse(readFileSync(join(REPO, "shared/language/roles.json"), "utf8")) as { root: { accepts: string[] }; roles: Record<string, Rule> };

function expand(accepts: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const e of accepts) {
    if (e.startsWith("@")) for (const [r, rule] of Object.entries(table.roles)) { if (rule.category === e.slice(1)) out.add(r); }
    else out.add(e);
  }
  return out;
}

test("TC-1: every render role of the TypeScript renderer has exactly one rule (C1, C9)", () => {
  assert.deepEqual([...core.RENDER_ROLES].sort(), Object.keys(table.roles).sort());
  assert.deepEqual(Object.keys(table).sort(), ["roles", "root"]);
  assert.equal(core.rolesLoaded(), true);
  for (const role of core.RENDER_ROLES) assert.ok(core.roleRule(role), role);
});

test("TC-1: rules name known roles, categories and attach modes (C1, C2, C3, C9)", () => {
  for (const [role, rule] of [["(root)", table.root] as const, ...Object.entries(table.roles)]) {
    if (role !== "(root)") {
      const r = rule as Rule;
      assert.deepEqual(Object.keys(r).sort(), ["accepts", "attach", "category", "title"], role);
      assert.ok(CATEGORIES.includes(r.category), `${role}: category ${r.category}`);
      assert.equal(r.attach, ATTACH[r.category], `${role}: attach`);
    }
    assert.equal(new Set(rule.accepts).size, rule.accepts.length, `${role}: duplicates`);
    for (const e of rule.accepts) {
      if (e.startsWith("@")) assert.ok(CATEGORIES.includes(e.slice(1)), `${role}: ${e}`);
      else assert.ok(e in table.roles, `${role}: ${e}`);
    }
  }
});

test("TC-1: the examples of SRC-12#s6.3 hold (C4)", () => {
  for (const frame of ["NavigationStack", "NavigationSplitView", "TabView"]) {
    assert.deepEqual(core.canContain("base", null, frame), { ok: true }, `${frame} at the root`);
    for (const parent of ["VStack", "HStack", "Card", "List"]) assert.equal(core.canContain("base", parent, frame).ok, false, `${frame} in ${parent}`);
  }
  assert.deepEqual(core.canContain("base", "NavigationSplitView", "NavigationStack"), { ok: true });
  assert.deepEqual(core.canContain("base", "Tab", "NavigationStack"), { ok: true });
  assert.deepEqual(core.canContain("base", "Grid", "GridRow"), { ok: true });
  assert.deepEqual(core.canContain("base", "Grid", "Text"), { ok: false, reason: "A content element cannot be placed inside a grid" });
  assert.deepEqual(core.canContain("base", "Grid", "VStack"), { ok: false, reason: "A vertical stack cannot be placed inside a grid" });
  for (const c of ["ToolbarItem", "Button", "Picker", "SearchField"]) assert.deepEqual(core.canContain("base", "Toolbar", c), { ok: true }, c);
  assert.deepEqual(core.canContain("base", "Toolbar", "Text"), { ok: false, reason: "A text cannot be placed inside a toolbar" });
  assert.deepEqual(core.canContain("base", "NavigationStack", "AppBar"), { ok: true });
  assert.deepEqual(core.canContain("base", "Card", "AppBar"), { ok: false, reason: "A bar cannot be placed inside a card" });
  assert.deepEqual(core.canContain("base", "List", "Row"), { ok: true });
  assert.deepEqual(core.canContain("base", "List", "Text"), { ok: false, reason: "A content element cannot be placed inside a list" });
  assert.deepEqual(core.canContain("base", "Board", "BoardColumn"), { ok: true });
  assert.deepEqual(core.canContain("base", "BoardColumn", "KanbanCard"), { ok: true });
  assert.deepEqual(core.canContain("base", "VStack", "TreeItem"), { ok: false, reason: "A tree item cannot be placed inside a vertical stack" });
  assert.deepEqual(core.canContain("base", "Text", "Image"), { ok: false, reason: "A text cannot hold other elements" });
  assert.deepEqual(core.canContain("base", "Button", "Label"), { ok: true });
  assert.deepEqual(core.canContain("base", "VStack", "Sheet"),
    { ok: false, reason: "A dialog is attached through a presentation modifier (.sheet, .alert, .overlay), not placed inside a vertical stack" });
  assert.deepEqual(core.canContain("base", "Card", "Callout"), { ok: false, reason: "A callout is attached as a modifier, not placed inside a card" });
  assert.deepEqual(core.canContain("base", null, "TreeItem"), { ok: false, reason: "A tree item cannot be placed at the root of a mockup" });
});

test("TC-1: a pack's rules only narrow its role's (C5, C9)", () => {
  let narrowed = 0;
  for (const id of core.registry.ids()) {
    for (const el of core.registry.get(id).elements.values()) {
      if (el.rules === null) continue;
      narrowed++;
      const role = expand(table.roles[el.role].accepts);
      for (const r of expand(el.rules.accepts)) assert.ok(role.has(r), `${id}:${el.name} widens ${el.role} with ${r}`);
    }
  }
  assert.ok(narrowed > 0);
});

test("TC-2: the cases of V1 (C5, C6)", () => {
  assert.deepEqual(core.canContain("base", "HStack", "NavigationSplitView"), { ok: false, reason: "A frame cannot be placed inside a horizontal stack" });
  assert.deepEqual(core.canContain("vuetify", "VCard", "VBtn"), { ok: true });
  assert.deepEqual(core.canContain("vuetify", "VCard", "VBtn"), core.canContain("base", "Card", "Button"));
  // A Fiori object page narrows its role (vstack) to sections.
  assert.deepEqual(core.canContain("sapui5", "ObjectPageLayout", "ObjectPageSection"), { ok: true });
  assert.deepEqual(core.canContain("sapui5", "ObjectPageLayout", "Text"),
    { ok: false, reason: "A text cannot be placed inside ObjectPageLayout, which its pack limits to section" });
  assert.deepEqual(core.canContain("sapui5", "VStack", "Text"), { ok: true }, "elements without rules follow their role");
  const allowed = core.allowedChildren("sapui5", "ObjectPageLayout").allowed;
  assert.ok(allowed.length > 0);
  for (const name of allowed) assert.equal(core.registry.get("sapui5").element(name)!.role, "section", name);
  // a pack given as a Pack object
  assert.deepEqual(core.canContain(core.registry.get("base"), "HStack", "Text"), { ok: true });
});

test("TC-2: allowedChildren lists the allowed elements and groups the others by reason (C7)", () => {
  const { allowed, refused } = core.allowedChildren("base", "HStack");
  assert.ok(allowed.includes("Toggle") && allowed.includes("VStack") && allowed.includes("AppBar"));
  assert.ok(!allowed.includes("TabView"));
  const frame = refused.find((g) => g.reason === "A frame cannot be placed inside a horizontal stack");
  assert.ok(frame && frame.elements.includes("TabView") && frame.elements.includes("NavigationStack"));
  const names = [...core.registry.get("base").elements.keys()];
  assert.equal(allowed.length + refused.reduce((n, g) => n + g.elements.length, 0), names.length, "every element once");
  assert.equal(new Set(refused.map((g) => g.reason)).size, refused.length, "one group per reason");
  assert.deepEqual(core.allowedChildren("base", "Text"), { allowed: [], refused: [{ reason: "A text cannot hold other elements", elements: names }] });
});

test("TC-2: unknown roles (C8)", () => {
  // A name the pack does not define is a view of role unknown (R-PACK-004.C4).
  const all = [...core.registry.get("base").elements.keys()];
  assert.deepEqual(core.allowedChildren("base", "NoSuchElement"), { allowed: all, refused: [] });
  assert.deepEqual(core.canContain("base", "NoSuchElement", "Sheet"), { ok: true });
  for (const parent of [null, "VStack", "List", "Grid", "Toolbar", "Button"]) {
    assert.deepEqual(core.canContain("base", parent, "MyStruct"), { ok: true }, String(parent));
  }
  assert.deepEqual(core.canContain("base", "Text", "MyStruct"), { ok: false, reason: "A text cannot hold other elements" });
});

test("TC-2: the package copy beside vocabulary.json (R-REPO-002.C8), and an unknown pack refused (C6)", () => {
  assert.equal(readFileSync(join(PKG, "dist/shared/roles.json"), "utf8"), readFileSync(join(REPO, "shared/language/roles.json"), "utf8"));
  const manifest = JSON.parse(readFileSync(join(PKG, "dist/shared/manifest.json"), "utf8")) as { files: string[] };
  assert.ok(manifest.files.includes("roles.json"));
  assert.throws(() => core.canContain("nosuchpack", "VStack", "Text"), /unknown pack/);
});

test("TC-2: holdsChildren — whether an element holds any child, the pack's narrowing and unknown names included (C16)", () => {
  // Expected answers written by hand from SRC-12#s6.3: stacks and lists hold children, text is a leaf,
  // a name the pack does not define (a struct) holds children as C8 accepts it everywhere.
  assert.equal(core.holdsChildren("base", "VStack"), true);
  assert.equal(core.holdsChildren("base", "HStack"), true);
  assert.equal(core.holdsChildren("base", "List"), true);
  assert.equal(core.holdsChildren("base", "Text"), false);
  assert.equal(core.holdsChildren("base", "Divider"), false);
  assert.equal(core.holdsChildren("base", "ProfileCard"), true);
  assert.equal(core.holdsChildren("sapui5", "ObjectPageLayout"), true, "narrowed to sections, still a container");
});
