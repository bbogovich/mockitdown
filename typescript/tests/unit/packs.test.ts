// R-WEB-001 TC-3 (C5): packs from data, an application pack by registerPack, inheritance.
import assert from "node:assert/strict";
import { test } from "node:test";
import { setup } from "./helpers.js";

const core = setup();

test("the built-in packs come from the shared assets, base first in every lineage", () => {
  const ids = core.registry.ids();
  assert.ok(ids.length >= 38 && ids.includes("base") && ids.includes("fluent"));
  assert.deepEqual(core.registry.get("mui").lineage().map((p) => p.id), ["base", "mui"]);
  const mui = core.registry.get("mui");
  assert.ok(mui.element("VStack"), "inherits base elements");
  assert.equal(core.registry.forModule("materialui"), "mui");
});

test("an application pack extending mui is selected by its module name and styled (TC-3)", () => {
  const json = JSON.stringify({
    id: "acme", name: "Acme", extends: "mui", modules: ["AcmeUI"],
    tokens: { light: { "acme-brand": "#ff0066" }, dark: { "acme-brand": "#ff66aa" } },
    elements: { AcmeButton: { role: "button", params: ["label"], defaults: { variant: "filled" } } },
  });
  const id = core.registerPack(json, ".mkd-pack-acme .mkd-button { border-radius: 12px; }");
  try {
    assert.equal(id, "acme");
    const { screen, diagnostics } = core.evaluate('import AcmeUI\nAcmeButton("Go")');
    assert.deepEqual(diagnostics.items, []);
    assert.deepEqual(screen!.pack.lineage().map((p) => p.id), ["base", "mui", "acme"]);
    const v = screen!.views[0];
    assert.equal(v.role, "button");
    assert.equal(v.attrs.get("label"), "Go");
    assert.equal(v.attrs.get("variant"), "filled");
    assert.ok(screen!.pack.element("TextField"), "inherits mui and base elements");
    const css = core.stylesheet(["acme"]);
    assert.match(css, /--mkd-acme-brand:#ff0066/);
    assert.match(css, /\[data-appearance="dark"\]\{color-scheme:dark;[^}]*--mkd-acme-brand:#ff66aa/);
    assert.match(css, /\.mkd-pack-acme \.mkd-button\{border-radius: calc\(12 \* var\(--u\)\)\}/);
    assert.ok(css.indexOf("mkd-pack-mui") < css.indexOf("mkd-pack-acme"), "ancestors first");
  } finally {
    core.registry.clearRegistered();
  }
});

test("pack errors: missing role, self-extension, unknown parent", () => {
  assert.throws(() => core.registerPack("{\"name\": \"x\"}"), /no string 'id'/);
  core.registerPack('{"id": "bad", "elements": {"X": {}}}');
  core.registerPack('{"id": "self", "extends": "self"}');
  try {
    assert.throws(() => core.registry.get("bad"), /element 'X' has no 'role'/);
    assert.throws(() => core.registry.get("self"), /cannot extend itself/);
    assert.equal(core.registry.forModule("SwiftUI"), "swiftui", "a broken pack does not break module lookup");
  } finally {
    core.registry.clearRegistered();
  }
});
