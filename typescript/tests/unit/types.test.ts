// IT-61 · R-PACK-017 TC-1 (C1, C2, C3, C5, C8) and TC-2 (C4, C6, C7): the typed parameters of roles.json, the
// typed modifiers of vocabulary.json, a pack element's `types`, and parameterTypes / modifierTypes.
// python/tests/test_types.py holds the same data checks. Expected types are written by hand from the shared
// files and C4; the conformance suites (conformance.test.ts, test_conformance.py) run with the types loaded
// and pass unchanged (C7).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PKG, REPO, setup } from "./helpers.js";

const core = setup();
const TYPES = ["text", "number", "bool", "color", "icon", "enum", "array"];
const GROUPS = ["layout", "typography", "colour", "presentation", "annotations", "other"];

const read = (rel: string) => JSON.parse(readFileSync(join(REPO, rel), "utf8"));
const table = read("shared/language/roles.json") as { params: Record<string, unknown>; roles: Record<string, { params?: Record<string, unknown> }> };
const vocab = read("shared/language/vocabulary.json") as { rendered: string[]; modifiers: Record<string, { group: string; args: { label: string | null; type: unknown }[] }> };

function typeErrors(t: unknown, where: string): string[] {
  if (typeof t === "string") return TYPES.includes(t) ? [] : [`${where}: unknown type ${t}`];
  if (!t || typeof t !== "object" || !TYPES.includes(String((t as { type?: unknown }).type))) return [`${where}: not a type`];
  const o = t as Record<string, unknown>;
  const allowed = o.type === "enum" ? ["type", "values"] : o.type === "array" ? ["type", "items"] : o.type === "number" ? ["type", "min", "max"] : ["type"];
  const errors = Object.keys(o).filter((k) => !allowed.includes(k)).map((k) => `${where}: ${k} is not a key of a ${String(o.type)} type`);
  if (o.type === "enum" && !(Array.isArray(o.values) && o.values.length && o.values.every((x) => typeof x === "string"))) errors.push(`${where}: an enum names its values`);
  if (o.type === "array") errors.push(...("items" in o ? typeErrors(o.items, `${where}[]`) : [`${where}: an array names its items`]));
  for (const k of ["min", "max"]) if (k in o && typeof o[k] !== "number") errors.push(`${where}: ${k} is a number`);
  return errors;
}

test("TC-1: every rule has params with known types, the common ones not repeated (C1, C2, C8)", () => {
  assert.deepEqual(Object.keys(table).sort(), ["params", "roles", "root"]);
  const errors = Object.entries(table.params).flatMap(([l, t]) => typeErrors(t, `params.${l}`));
  for (const [role, rule] of Object.entries(table.roles)) {
    if (!rule.params || typeof rule.params !== "object") { errors.push(`${role}: no params`); continue; }
    for (const [l, t] of Object.entries(rule.params)) {
      errors.push(...typeErrors(t, `${role}.${l}`));
      if (l in table.params) errors.push(`${role}.${l}: repeats a common label`);
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(JSON.parse(readFileSync(join(PKG, "dist/shared/roles.json"), "utf8")), table);
});

test("TC-1: every rendered modifier has a group and typed arguments (C5, C8)", () => {
  assert.deepEqual(Object.keys(vocab.modifiers).sort(), [...vocab.rendered].sort());
  const errors: string[] = [];
  for (const [m, spec] of Object.entries(vocab.modifiers)) {
    if (!GROUPS.includes(spec.group)) errors.push(`${m}: group ${spec.group}`);
    spec.args.forEach((a, i) => {
      assert.deepEqual(Object.keys(a).sort(), ["label", "type"], `${m}.args[${i}]`);
      errors.push(...typeErrors(a.type, `${m}.${a.label ?? i}`));
    });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(JSON.parse(readFileSync(join(PKG, "dist/shared/vocabulary.json"), "utf8")), vocab);
});

test("TC-1: every pack's types are known and params stay lists of names (C3, C8)", () => {
  const errors: string[] = [];
  const dir = join(REPO, "shared/packs");
  for (const id of readdirSync(dir).filter((n) => !n.startsWith("_")).sort()) {
    let json: { elements?: Record<string, { params?: unknown; types?: Record<string, unknown> }> };
    try { json = read(`shared/packs/${id}/pack.json`); } catch { continue; }
    for (const [name, el] of Object.entries(json.elements ?? {})) {
      if (el.params !== undefined && !(Array.isArray(el.params) && el.params.every((p) => typeof p === "string"))) errors.push(`${id} ${name}: params`);
      for (const [l, t] of Object.entries(el.types ?? {})) errors.push(...typeErrors(t, `${id} ${name}.${l}`));
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(typeErrors({ type: "array" }, "x"), ["x: an array names its items"]);
  assert.deepEqual(typeErrors({ type: "enum", values: [] }, "x"), ["x: an enum names its values"]);
  assert.deepEqual(typeErrors("txt", "x"), ["x: unknown type txt"]);
});

test("TC-2: parameterTypes gives the role's params with the element's variants (V1, C4, C6)", () => {
  const toggle = core.parameterTypes("base", "Toggle");
  assert.deepEqual(toggle.isOn, { type: "bool" });
  assert.deepEqual(toggle.label, { type: "text" });
  assert.deepEqual(toggle.disabled, { type: "bool" }, "a common label");
  assert.deepEqual(toggle.variant, { type: "text" }, "no declared variants: the common type");
  assert.deepEqual(core.parameterTypes("mui", "Button").variant, { type: "enum", values: ["text", "outlined", "contained"] });
  assert.deepEqual(core.parameterTypes("base", "Button").role, { type: "enum", values: ["cancel", "destructive"] });
  assert.deepEqual(core.parameterTypes("base", "Slider").range, { type: "array", items: { type: "number" } });
  assert.deepEqual(core.parameterTypes(core.registry.get("base"), "Toggle"), toggle, "a loaded pack");
  const unknown = core.parameterTypes("base", "NoSuchElement");
  assert.deepEqual(Object.keys(unknown).sort(), Object.keys(table.params).sort(), "an unknown element: the common labels");
  assert.throws(() => core.parameterTypes("no-such-pack", "Toggle"), core.MockitdownError);
});

test("TC-2: a pack element's types add to and override its role's params (C3, C6)", () => {
  const id = core.registerPack(JSON.stringify({
    id: "typed", name: "Typed", extends: "base", modules: ["TypedUI"],
    elements: {
      Dial: { role: "slider", params: ["value"], variants: ["round", "flat"],
        types: { value: { type: "number", min: 0, max: 10 }, notch: "bool", variant: "text" } },
    },
  }));
  try {
    const dial = core.parameterTypes(id, "Dial");
    assert.deepEqual(dial.value, { type: "number", min: 0, max: 10 }, "overrides the role's");
    assert.deepEqual(dial.notch, { type: "bool" }, "adds one");
    assert.deepEqual(dial.variant, { type: "enum", values: ["round", "flat"] }, "variant follows the declared variants (C4)");
    assert.deepEqual(dial.step, { type: "number" }, "keeps the role's others");
    assert.deepEqual(core.registry.get(id).element("Dial")!.params, ["value"], "params stays a list of names");
    const r = core.render('import TypedUI\nDial(value: 3, notch: true, nub: 1)');
    assert.deepEqual(r.diagnostics.map((d) => d.message), ["'nub' is not understood by Dial in pack 'typed'"], "a typed label is understood");
  } finally {
    core.registry.clearRegistered();
  }
});

test("TC-2: modifierTypes gives the vocabulary's modifiers (C5, C6)", () => {
  const mods = core.modifierTypes();
  assert.equal(mods.padding.group, "layout");
  assert.deepEqual(mods.foregroundStyle, { group: "colour", args: [{ label: null, type: { type: "color" } }] });
  assert.deepEqual(mods.sheet, { group: "presentation", args: [{ label: "isPresented", type: { type: "bool" } }] });
  assert.equal(mods.callout.group, "annotations");
  assert.deepEqual(mods.opacity.args, [{ label: null, type: { type: "number", min: 0, max: 1 } }]);
  assert.deepEqual(Object.keys(mods).sort(), [...core.RENDERED].sort());
});
