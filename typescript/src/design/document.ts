/**
 * The design document (`.mkdesign`, M-EDIT-1, M-EDIT-2): read, validated and written as JSON text
 * (R-EDIT-005). The document is a plain object; keys this module does not know are kept where they are
 * (C6) and written back after the known ones (C5). Nothing here reads or writes files, touches the
 * DOM or the network, or converts a document to Markdown or HTML (C1, C11): that is the host's.
 */

import { isObject, JsonSyntaxError, parseOrdered, stringify, writeObject, type ValueWriter } from "./json.js";

/** The value of `format` (M-EDIT-1.F1). */
export const DESIGN_FORMAT = "mockitdown-design";
/** The format version this module reads and writes (M-EDIT-1.F2). */
export const DESIGN_VERSION = 1;

/** A named rectangle drawn behind a group of mockups (M-EDIT-1.F6). */
export interface DesignSection {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  [key: string]: unknown;
}

/** The canvas view: zoom, position and active mockup (M-EDIT-1.F8). */
export interface DesignView {
  zoom?: number;
  x?: number;
  y?: number;
  active?: string;
  [key: string]: unknown;
}

/** A named mockup of a design (M-EDIT-2). */
export interface DesignMockup {
  /** Unique within the document, case-sensitive, may hold spaces. */
  name: string;
  /** Canvas position of the frame's left and top edges. */
  x: number;
  y: number;
  /** Render options of this mockup (`pack`, `device`, `width`, `height`, `title`, …). */
  options?: Record<string, unknown>;
  /** The mockitdown source, verbatim. */
  code: string;
  [key: string]: unknown;
}

/** A design document (M-EDIT-1). */
export interface DesignDocument {
  format: typeof DESIGN_FORMAT;
  version: typeof DESIGN_VERSION;
  name: string;
  /** Render options applied to every mockup, among them `pack`, the default pack. */
  defaults: Record<string, unknown>;
  /** Component files the mockups may import. */
  imports?: string[];
  sections?: DesignSection[];
  /** The named mockups, in document order. */
  mockups: DesignMockup[];
  view?: DesignView;
  [key: string]: unknown;
}

/** A problem of a design document: the JSON path of the value (`mockups[2].code`, `""` for the whole text) and what is wrong. */
export interface DesignError {
  path: string;
  message: string;
}

/** What {@link readDesign} returns: the document, or the problems that refuse it. */
export type ReadResult = { document: DesignDocument } | { errors: DesignError[] };

/** The key order of each level (C5): M-EDIT-1, M-EDIT-2 and the parts of F6 and F8. */
export const DOCUMENT_KEYS = ["format", "version", "name", "defaults", "imports", "sections", "mockups", "view"] as const;
export const MOCKUP_KEYS = ["name", "x", "y", "options", "code"] as const;
export const SECTION_KEYS = ["name", "x", "y", "w", "h"] as const;
export const VIEW_KEYS = ["zoom", "x", "y", "active"] as const;

/**
 * Parse a design document from JSON text (C2). Every problem found is listed, in document order, each
 * with the JSON path of its value (C2, C3, C4); a text that is not JSON gives one problem at path `""`.
 */
export function readDesign(text: string): ReadResult {
  let root: unknown;
  try {
    root = parseOrdered(text);
  } catch (e) {
    if (e instanceof JsonSyntaxError) return { errors: [{ path: "", message: `not valid JSON: ${e.message}` }] };
    throw e;
  }
  if (!isObject(root)) return { errors: [{ path: "", message: `a design document must be a JSON object, found ${found(root)}` }] };
  const v = new Validator();
  const d = root;
  if (d.format !== DESIGN_FORMAT) v.fail("format", "format", `"${DESIGN_FORMAT}"`, d.format);
  if (d.version !== DESIGN_VERSION) v.fail("version", "version", String(DESIGN_VERSION), d.version);
  v.string(d, "name", "");
  v.object(d, "defaults", "");
  if (d.imports !== undefined && v.list(d, "imports", "")) {
    (d.imports as unknown[]).forEach((x, k) => {
      if (typeof x !== "string") v.fail(`imports[${k}]`, `imports[${k}]`, "a string", x);
    });
  }
  if (d.sections !== undefined && v.list(d, "sections", "")) {
    (d.sections as unknown[]).forEach((s, k) => {
      const at = `sections[${k}]`;
      if (!isObject(s)) return v.fail(at, at, "an object", s);
      v.string(s, "name", at);
      for (const key of ["x", "y", "w", "h"]) v.number(s, key, at);
    });
  }
  if (v.list(d, "mockups", "")) {
    const names = new Map<string, number>();
    (d.mockups as unknown[]).forEach((m, k) => {
      const at = `mockups[${k}]`;
      if (!isObject(m)) return v.fail(at, at, "an object", m);
      if (v.string(m, "name", at)) {
        const name = m.name as string;
        const first = names.get(name);
        if (first !== undefined) v.errors.push({ path: `${at}.name`, message: `the name ${JSON.stringify(name)} is already used by mockups[${first}]` });
        else names.set(name, k);
      }
      v.number(m, "x", at);
      v.number(m, "y", at);
      if (m.options !== undefined) v.object(m, "options", at);
      v.string(m, "code", at);
    });
  }
  if (d.view !== undefined && v.object(d, "view", "")) {
    const view = d.view as Record<string, unknown>;
    for (const key of ["zoom", "x", "y"]) if (view[key] !== undefined) v.number(view, key, "view");
    if (view.active !== undefined) v.string(view, "active", "view");
  }
  if (v.errors.length) return { errors: v.errors };
  return { document: d as DesignDocument };
}

/**
 * The JSON text of a design document (C5): indented by two spaces, ending with one line feed, the
 * keys of the document, its sections, mockups and view in the order of M-EDIT-1 and M-EDIT-2, each
 * followed by the keys this module does not know in the order they were read (C6). Text it wrote
 * reads and writes back unchanged (C7).
 */
export function writeDesign(document: DesignDocument): string {
  return writeObject(document, "", DOCUMENT_KEYS, DOCUMENT_WRITERS) + "\n";
}

/** A new, empty design document (C10). */
export function newDesign(name: string): DesignDocument {
  return { format: DESIGN_FORMAT, version: DESIGN_VERSION, name, defaults: {}, mockups: [] };
}

/** The mockup of this name, or null. */
export function findMockup(document: DesignDocument, name: string): DesignMockup | null {
  return document.mockups.find((m) => m.name === name) ?? null;
}

/**
 * The pack of a mockup (C8, M-EDIT-2.I1): its `options.pack`, else the document's `defaults.pack`, else
 * `base`; null when the document has no mockup of this name.
 */
export function mockupPack(document: DesignDocument, name: string): string | null {
  const m = findMockup(document, name);
  if (!m) return null;
  const own = m.options?.pack;
  if (typeof own === "string") return own;
  const dflt = document.defaults?.pack;
  return typeof dflt === "string" ? dflt : "base";
}

/**
 * The render options of a mockup (C9): a new object holding the document's `defaults`, overridden by
 * the mockup's `options`, with the pack of {@link mockupPack}; null when there is no such mockup.
 */
export function mockupOptions(document: DesignDocument, name: string): Record<string, unknown> | null {
  const m = findMockup(document, name);
  if (!m) return null;
  return { ...(document.defaults ?? {}), ...(m.options ?? {}), pack: mockupPack(document, name) };
}

// --- internals ------------------------------------------------------------------------------------

const listOf = (item: ValueWriter): ValueWriter => (value, indent) => {
  if (!Array.isArray(value) || value.length === 0) return stringify(value, indent);
  const inner = indent + "  ";
  return "[\n" + value.map((x) => inner + item(x, inner)).join(",\n") + "\n" + indent + "]";
};

const objectWith = (known: readonly string[]): ValueWriter => (value, indent) =>
  isObject(value) ? writeObject(value, indent, known) : stringify(value, indent);

const DOCUMENT_WRITERS: Record<string, ValueWriter> = {
  sections: listOf(objectWith(SECTION_KEYS)),
  mockups: listOf(objectWith(MOCKUP_KEYS)),
  view: objectWith(VIEW_KEYS),
};

/** What a value is, for a message: `"text"`, `12`, `null`, `a list`, `an object`. */
function found(value: unknown): string {
  if (Array.isArray(value)) return "a list";
  if (isObject(value)) return "an object";
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 60 ? text.slice(0, 57) + "…" : text;
}

class Validator {
  readonly errors: DesignError[] = [];

  /** `label must be <expected>, found <value>` (or `but it is missing`) at `path`. */
  fail(path: string, label: string, expected: string, value: unknown): void {
    const what = value === undefined ? "but it is missing" : `found ${found(value)}`;
    this.errors.push({ path, message: `${label} must be ${expected}, ${what}` });
  }

  private at(parent: string, key: string): string {
    return parent ? `${parent}.${key}` : key;
  }

  string(obj: Record<string, unknown>, key: string, parent: string): boolean {
    if (typeof obj[key] === "string") return true;
    this.fail(this.at(parent, key), key, "a string", obj[key]);
    return false;
  }

  number(obj: Record<string, unknown>, key: string, parent: string): boolean {
    const v = obj[key];
    if (typeof v === "number" && Number.isFinite(v)) return true;
    this.fail(this.at(parent, key), key, "a number", v);
    return false;
  }

  object(obj: Record<string, unknown>, key: string, parent: string): boolean {
    if (isObject(obj[key])) return true;
    this.fail(this.at(parent, key), key, "an object", obj[key]);
    return false;
  }

  list(obj: Record<string, unknown>, key: string, parent: string): boolean {
    if (Array.isArray(obj[key])) return true;
    this.fail(this.at(parent, key), key, "a list", obj[key]);
    return false;
  }
}
