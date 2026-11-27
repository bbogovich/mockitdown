/**
 * Design packs: the element vocabulary, tokens, chrome and stylesheet of one UI framework (port of
 * `mockitdown.packs`).
 *
 * A pack is data: the text of its `pack.json` and of its `pack.css`. Packs inherit: every built-in
 * pack `extends` `base`, which defines the portable core vocabulary and the structural CSS of every
 * render role. A pack adds its native element names, maps them onto roles with default attributes,
 * and restyles the roles. The keys of `pack.json` are those of the Python variant (see the pack
 * authoring guide).
 *
 * Where the Python registry finds packs in directories, this one is fed (A-WEB-1.K1): the built-in
 * packs by {@link PackRegistry.setBuiltin} (from the package's shared assets, see `loadAssets`), an
 * application's own packs by {@link registerPack}. A registered pack takes precedence over a
 * built-in one of the same id, as a `pack_paths` directory does over the built-in directory.
 */

import { MockitdownError } from "../diagnostics.js";
import { parseJson } from "../json.js";
import {
  compareStr, fromJs, PyDict, pyBool, pyInt, pyStr, strRepr,
} from "../values.js";

export type Value = unknown;

/** A pack as data: the `pack.json` text (or parsed value) and the `pack.css` text. */
export interface PackData {
  json: string | PyDict | Record<string, unknown>;
  css?: string;
}

export class ElementDef {
  readonly name: string;
  readonly role: string;
  /** Names given, in order, to positional arguments. */
  readonly params: readonly string[];
  /** Attribute values applied before the call's own arguments, sorted by name. */
  readonly defaults: readonly (readonly [string, Value])[];
  /** Documented values of the `variant` attribute (empty: not validated). */
  readonly variants: readonly string[];
  readonly doc: string;
  /** Argument label → attribute name for this element only (e.g. SAP `type:` → `variant`), sorted. */
  readonly attrs: readonly (readonly [string, string])[];

  constructor(name: string, role: string, params: readonly string[] = [], defaults: readonly (readonly [string, Value])[] = [],
    variants: readonly string[] = [], doc = "", attrs: readonly (readonly [string, string])[] = []) {
    this.name = name;
    this.role = role;
    this.params = params;
    this.defaults = defaults;
    this.variants = variants;
    this.doc = doc;
    this.attrs = attrs;
    Object.freeze(this);
  }

  /** A fresh dict of the default attributes. */
  get default_attrs(): PyDict<Value> {
    return new PyDict<Value>(this.defaults);
  }

  /** The element's own attribute name for an argument label, if it has one. */
  attrFor(label: string): string | undefined {
    let found: string | undefined;
    for (const [k, v] of this.attrs) if (k === label) found = v;
    return found;
  }
}

export class Pack {
  id: string;
  name: string;
  framework = "";
  version = "";
  parent: Pack | null = null;
  modules: readonly string[] = [];
  device = "desktop";
  chrome: PyDict<Value> = new PyDict();
  tokens: Map<string, PyDict<Value>> = new Map([["light", new PyDict()], ["dark", new PyDict()]]);
  elements: Map<string, ElementDef> = new Map();
  modifiers: PyDict<Value> = new PyDict();
  fonts: PyDict<Value> = new PyDict();
  /** Device form → [width, height] overriding the default sizes. */
  sizes: Map<string, readonly [number, number]> = new Map();
  /** Icon name → built-in glyph name, consulted before the global aliases. */
  icons: PyDict<Value> = new PyDict();
  /** Argument label → canonical attribute name, applied to every element's labelled arguments. */
  attrs: PyDict<Value> = new PyDict();
  /** This pack's own stylesheet text (not its ancestors'). */
  css = "";
  /** Hidden packs (easter eggs) work everywhere but are left out of listings. */
  hidden = false;
  /** Element names defined by this pack itself (not inherited), for documentation. */
  own_elements: readonly string[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  element(name: string): ElementDef | null {
    return this.elements.get(name) ?? null;
  }

  /** This pack and its ancestors, root first. */
  lineage(): Pack[] {
    const chain: Pack[] = [];
    let p: Pack | null = this;
    while (p !== null) {
      chain.push(p);
      p = p.parent;
    }
    return chain.reverse();
  }

  /** This pack's own stylesheet (not its ancestors'). */
  cssText(): string {
    return this.css;
  }

  chromeFor(device: string): Value {
    return this.chrome.get(device, "none");
  }

  font(name: string): Value {
    const chain = this.lineage().reverse();
    for (const p of chain) if (p.fonts.has(name)) return p.fonts.get(name);
    return name;
  }
}

function sortedItems<V>(d: PyDict<V>): [string, V][] {
  return (d.items() as [string, V][]).sort((a, b) => compareStr(String(a[0]), String(b[0])));
}

function list(v: unknown): unknown[] {
  if (Array.isArray(v)) return [...v];
  if (typeof v === "string") return Array.from(v);
  if (v instanceof PyDict) return v.keys();
  return [];
}

function dict(v: unknown): PyDict<Value> {
  return v instanceof PyDict ? v : new PyDict();
}

function makeElement(name: string, raw: unknown, where: string): ElementDef {
  const d = dict(raw);
  if (!d.has("role")) throw new MockitdownError(`${where}: element ${strRepr(name)} has no 'role'`);
  return new ElementDef(
    name,
    d.get("role") as string,
    list(d.get("params", [])) as string[],
    sortedItems(dict(d.get("defaults", new PyDict()))),
    list(d.get("variants", [])) as string[],
    d.get("doc", "") as string,
    sortedItems(dict(d.get("attrs", new PyDict()))) as [string, string][],
  );
}

function toDict(json: PackData["json"], where: string): PyDict<Value> {
  if (json instanceof PyDict) return json;
  if (typeof json === "string") {
    let raw: unknown;
    try {
      raw = parseJson(json);
    } catch (e) {
      throw new MockitdownError(`${where}: invalid JSON: ${(e as Error).message}`);
    }
    if (!(raw instanceof PyDict)) throw new MockitdownError(`${where}: a pack is a JSON object`);
    return raw;
  }
  return dict(fromJs(json));
}

/** Finds and loads packs from the built-in data and the packs an application registered. */
export class PackRegistry {
  private builtin = new Map<string, PackData>();
  private readonly app = new Map<string, PackData>();
  private readonly cache = new Map<string, Pack>();
  private loading = new Set<string>();
  private moduleIndex: Map<string, string> | null = null;

  /** Install the built-in packs (id → data), replacing any installed before. */
  setBuiltin(packs: ReadonlyMap<string, PackData> | Record<string, PackData>): void {
    this.builtin = new Map(packs instanceof Map ? packs : Object.entries(packs));
    this.invalidate();
  }

  /** Register an application's pack; returns its id (the `id` of its `pack.json`). */
  register(json: PackData["json"], css = ""): string {
    const raw = toDict(json, "registered pack");
    const id = raw.get("id");
    if (typeof id !== "string" || !id) throw new MockitdownError("registered pack: pack.json has no string 'id'");
    // A built-in pack's partials are resolved when the package is built; an application pack's never are (R-PACK-018.C8).
    if (css.replace(/\/\*[\s\S]*?(\*\/|$)/g, "").includes("@import")) {
      throw new MockitdownError(`pack ${strRepr(id)}: @import is resolved only in built-in packs`);
    }
    this.app.set(id, { json: raw, css });
    this.invalidate();
    return id;
  }

  /** Forget the registered application packs (the built-in ones stay). */
  clearRegistered(): void {
    this.app.clear();
    this.invalidate();
  }

  private invalidate(): void {
    this.cache.clear();
    this.moduleIndex = null;
  }

  private find(packId: string): [PackData, string] | null {
    const a = this.app.get(packId);
    if (a) return [a, `registered pack ${packId}`];
    const b = this.builtin.get(packId);
    if (b) return [b, `packs/${packId}/pack.json`];
    return null;
  }

  /** Every known pack id: the registered ones, then the built-in ones, each sorted. */
  ids(): string[] {
    const seen: string[] = [];
    for (const source of [this.app, this.builtin]) {
      for (const id of [...source.keys()].sort(compareStr)) if (!seen.includes(id)) seen.push(id);
    }
    return seen;
  }

  get(packId: string): Pack {
    const hit = this.cache.get(packId);
    if (hit) return hit;
    const found = this.find(packId);
    if (found === null) {
      throw new MockitdownError(`unknown pack ${strRepr(packId)}; known packs: ${this.ids().join(", ")}`);
    }
    const [data, where] = found;
    const raw = toDict(data.json, where);
    const parentId = raw.get("extends", packId === "base" ? null : "base") as Value;
    if (parentId === packId) throw new MockitdownError(`${where}: a pack cannot extend itself`);
    if (this.loading.has(packId)) throw new MockitdownError(`${where}: packs extend each other in a cycle`);
    this.loading.add(packId);
    let parent: Pack | null;
    try {
      parent = pyBool(parentId) ? this.get(pyStr(parentId)) : null;
    } finally {
      this.loading.delete(packId);
    }
    const own = new Map<string, ElementDef>();
    for (const [n, e] of dict(raw.get("elements", new PyDict())).items()) own.set(String(n), makeElement(String(n), e, where));
    const tokens = new Map<string, PyDict<Value>>([["light", new PyDict()], ["dark", new PyDict()]]);
    if (parent) {
      tokens.clear();
      for (const [k, v] of parent.tokens) tokens.set(k, v.copy());
    }
    const rawTokens = dict(raw.get("tokens", new PyDict()));
    for (const mode of ["light", "dark"]) {
      const target = tokens.get(mode)!;
      for (const [k, v] of dict(rawTokens.get(mode, new PyDict())).items()) target.set(k, v);
    }
    const merge = (mine: PyDict<Value> | undefined, key: string): PyDict<Value> => {
      const out = mine ? mine.copy() : new PyDict<Value>();
      for (const [k, v] of dict(raw.get(key, new PyDict())).items()) out.set(k, v);
      return out;
    };
    const pack = new Pack(raw.get("id", packId) as string, raw.get("name", packId) as string);
    pack.framework = raw.get("framework", "") as string;
    pack.version = raw.get("version", "") as string;
    pack.parent = parent;
    pack.modules = list(raw.get("modules", [])) as string[];
    pack.device = raw.get("device", parent ? parent.device : "desktop") as string;
    pack.chrome = merge(parent?.chrome, "chrome");
    pack.tokens = tokens;
    pack.elements = new Map([...(parent ? parent.elements : []), ...own]);
    pack.modifiers = merge(parent?.modifiers, "modifiers");
    pack.fonts = dict(raw.get("fonts", new PyDict()));
    pack.sizes = new Map(parent ? parent.sizes : []);
    for (const [k, v] of dict(raw.get("sizes", new PyDict())).items()) {
      const pair = list(v);
      pack.sizes.set(String(k), [pyInt(pair[0]), pyInt(pair[1])]);
    }
    pack.icons = merge(parent?.icons, "icons");
    pack.attrs = merge(parent?.attrs, "attrs");
    pack.css = data.css ?? "";
    pack.hidden = pyBool(raw.get("hidden", false));
    pack.own_elements = [...own.keys()];
    this.cache.set(packId, pack);
    return pack;
  }

  /** The pack id that `import <module>` selects, if any (case-insensitive). */
  forModule(module: string): string | null {
    if (this.moduleIndex === null) {
      const idx = new Map<string, string>();
      for (const pid of this.ids()) {
        let pack: Pack;
        try {
          pack = this.get(pid);
        } catch {
          continue; // a broken pack must not break blocks that use other packs
        }
        for (const m of pack.modules) {
          const key = pyStr(m).toLowerCase();
          if (!idx.has(key)) idx.set(key, pid);
        }
      }
      this.moduleIndex = idx;
    }
    return this.moduleIndex.get(module.toLowerCase()) ?? null;
  }
}

/** The registry `render`, `check`, `evaluate` and `stylesheet` use. */
export const registry = new PackRegistry();

/**
 * Register an application's pack from the text of its `pack.json` and `pack.css` (R-WEB-001.C5).
 * It may extend any known pack and is selected by its id or a module name like a built-in one.
 */
export function registerPack(json: PackData["json"], css = ""): string {
  return registry.register(json, css);
}
