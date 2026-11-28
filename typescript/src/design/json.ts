/**
 * JSON text for design documents (R-EDIT-005.C5, C6): a parser that gives plain JavaScript values and
 * remembers the order in which each object's keys were read, and a writer with the layout of
 * `JSON.stringify(value, null, 2)` that writes keys in that order.
 *
 * `JSON.parse` cannot keep the order: a JavaScript object enumerates index-like keys (`"0"`, `"42"`)
 * first, in ascending order, whatever their place in the text. The read order is kept beside each
 * object, in a WeakMap, so the values stay plain objects a host can use as it likes; a key a host adds
 * goes after the keys that were read, a key it deletes is dropped.
 */

/** The order in which each parsed object's keys were read. */
const ORDER = new WeakMap<object, string[]>();

/** A syntax error in JSON text, with its 1-based line and column (UTF-16 code units). */
export class JsonSyntaxError extends Error {
  readonly line: number;
  readonly column: number;
  constructor(reason: string, line: number, column: number) {
    super(`${reason} at line ${line}, column ${column}`);
    this.line = line;
    this.column = column;
  }
}

const NUMBER = /-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/y;

/** Parse JSON text (RFC 8259) into plain values, recording the key order of every object. */
export function parseOrdered(text: string): unknown {
  let i = 0;
  const n = text.length;

  const fail = (reason: string, at = i): never => {
    let line = 1;
    let col = 1;
    for (let k = 0; k < at && k < n; k++) {
      if (text.charCodeAt(k) === 10) {
        line++;
        col = 1;
      } else col++;
    }
    throw new JsonSyntaxError(reason, line, col);
  };

  const ws = (): void => {
    while (i < n) {
      const c = text.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13) i++;
      else break;
    }
  };

  const string = (): string => {
    const start = i;
    i++; // the opening quote
    while (i < n) {
      const c = text.charCodeAt(i);
      if (c === 34) {
        i++;
        try {
          return JSON.parse(text.slice(start, i)) as string;
        } catch {
          return fail("invalid string", start);
        }
      }
      if (c === 92) i += 2;
      else if (c < 32) return fail("control character in a string");
      else i++;
    }
    return fail("unterminated string", start);
  };

  const value = (): unknown => {
    ws();
    if (i >= n) return fail("expected a value");
    const c = text[i];
    if (c === "{") return object();
    if (c === "[") return array();
    if (c === '"') return string();
    for (const [word, v] of [["true", true], ["false", false], ["null", null]] as const) {
      if (text.startsWith(word, i)) {
        i += word.length;
        return v;
      }
    }
    NUMBER.lastIndex = i;
    const m = NUMBER.exec(text);
    if (m) {
      i += m[0].length;
      return Number(m[0]);
    }
    return fail("expected a value");
  };

  const object = (): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    const keys: string[] = [];
    i++;
    ws();
    if (text[i] === "}") {
      i++;
      ORDER.set(out, keys);
      return out;
    }
    for (;;) {
      ws();
      if (text[i] !== '"') return fail("expected a string key");
      const key = string();
      ws();
      if (text[i] !== ":") return fail("expected ':'");
      i++;
      const v = value();
      // As JSON.parse: a repeated key keeps its first place and takes the last value; `__proto__` is
      // an ordinary own key.
      if (!Object.hasOwn(out, key)) keys.push(key);
      Object.defineProperty(out, key, { value: v, enumerable: true, writable: true, configurable: true });
      ws();
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "}") {
        i++;
        ORDER.set(out, keys);
        return out;
      }
      return fail("expected ',' or '}'");
    }
  };

  const array = (): unknown[] => {
    const out: unknown[] = [];
    i++;
    ws();
    if (text[i] === "]") {
      i++;
      return out;
    }
    for (;;) {
      out.push(value());
      ws();
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "]") {
        i++;
        return out;
      }
      return fail("expected ',' or ']'");
    }
  };

  const result = value();
  ws();
  if (i < n) fail("unexpected text after the document");
  return result;
}

/** An object's keys: those read by {@link parseOrdered} in their order, then any others. */
export function keysOf(obj: object): string[] {
  const own = Object.keys(obj);
  const read = ORDER.get(obj);
  if (!read) return own;
  const present = new Set(own);
  const keys = read.filter((k) => present.has(k));
  const seen = new Set(keys);
  for (const k of own) if (!seen.has(k)) keys.push(k);
  return keys;
}

/** The writer of one value at a known key, given the indentation of the line the value starts on. */
export type ValueWriter = (value: unknown, indent: string) => string;

const STEP = "  ";

/** A plain JSON object (not a list, not null). */
export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Write `value` with the layout of `JSON.stringify(value, null, 2)`, the keys of each object in
 * {@link keysOf} order.
 */
export function stringify(value: unknown, indent = ""): string {
  const v = toJson(value);
  if (v === null || v === undefined || typeof v === "function" || typeof v === "symbol") return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "bigint") throw new TypeError("a BigInt cannot be written as JSON");
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const inner = indent + STEP;
    return "[\n" + v.map((x) => inner + stringify(x, inner)).join(",\n") + "\n" + indent + "]";
  }
  return writeObject(v as Record<string, unknown>, indent);
}

/**
 * Write an object: first the `known` keys it has, in that order, each with its writer from `writers`
 * when there is one, then its other keys in {@link keysOf} order. Keys whose value is `undefined` or a
 * function are left out, as `JSON.stringify` leaves them out.
 */
export function writeObject(obj: Record<string, unknown>, indent: string, known: readonly string[] = [],
  writers: Readonly<Record<string, ValueWriter>> = {}): string {
  const knownSet = new Set(known);
  const keys = [...known.filter((k) => Object.hasOwn(obj, k)), ...keysOf(obj).filter((k) => !knownSet.has(k))];
  const inner = indent + STEP;
  const lines: string[] = [];
  for (const k of keys) {
    const raw = toJson(obj[k]);
    if (raw === undefined || typeof raw === "function" || typeof raw === "symbol") continue;
    const writer = Object.hasOwn(writers, k) ? writers[k] : stringify;
    lines.push(inner + JSON.stringify(k) + ": " + writer(raw, inner));
  }
  if (lines.length === 0) return "{}";
  return "{\n" + lines.join(",\n") + "\n" + indent + "}";
}

/** A value's `toJSON()` result when it has one (a Date, for example), as `JSON.stringify` calls it. */
function toJson(v: unknown): unknown {
  if (typeof v === "object" && v !== null && typeof (v as { toJSON?: unknown }).toJSON === "function") {
    return (v as { toJSON: () => unknown }).toJSON();
  }
  return v;
}
