/**
 * The Python value model the evaluator and renderer compute with (ADR-18: the Python variant is the
 * reference, so values behave as Python's do).
 *
 * | Python      | TypeScript                                   |
 * |-------------|----------------------------------------------|
 * | `None`      | `null`                                       |
 * | `bool`      | `boolean`                                    |
 * | `int`       | `number` (always integral)                   |
 * | `float`     | {@link PyFloat}                              |
 * | `str`       | `string` (indexed by code point, see {@link codePoints}) |
 * | `list`      | `Value[]`                                    |
 * | `tuple`     | a frozen `Value[]` marked by {@link tuple}   |
 * | `dict`      | {@link PyDict}                               |
 *
 * `int` and `float` are kept apart because Python's are: `7 / 2` is `3`, `7.0 / 2` is `3.5`,
 * `0...3` is a list of four integers and `0.0...1.0` a pair of bounds, and `str(1.0)` is `"1.0"`.
 */

/** A Python `float`. */
export class PyFloat {
  readonly value: number;
  constructor(value: number) {
    this.value = value;
  }
  toString(): string {
    return floatRepr(this.value);
  }
}

/** A Python exception raised while computing with values (`TypeError`, `KeyError` …). */
export class PyError extends Error {
  readonly kind: string;
  constructor(kind: string, message = "") {
    super(`${kind}: ${message}`);
    this.kind = kind;
  }
}

const TUPLE = Symbol("tuple");

/** Python's `tuple(items)`: a frozen array marked as a tuple. */
export function tuple<T>(items: Iterable<T>): readonly T[] {
  const a = Array.from(items);
  Object.defineProperty(a, TUPLE, { value: true });
  return Object.freeze(a);
}

export function isTuple(v: unknown): v is readonly unknown[] {
  return Array.isArray(v) && (v as unknown as Record<symbol, unknown>)[TUPLE] === true;
}

export function isList(v: unknown): v is unknown[] {
  return Array.isArray(v) && !isTuple(v);
}

/** `isinstance(v, (list, tuple))`. */
export function isSeq(v: unknown): v is readonly unknown[] {
  return Array.isArray(v);
}

/** `isinstance(v, int) and not isinstance(v, bool)`. */
export function isInt(v: unknown): v is number {
  return typeof v === "number";
}

/** `isinstance(v, int)`, booleans included, as Python counts them. */
export function isIntLike(v: unknown): v is number | boolean {
  return typeof v === "number" || typeof v === "boolean";
}

export function isFloat(v: unknown): v is PyFloat {
  return v instanceof PyFloat;
}

/** `isinstance(v, (int, float)) and not isinstance(v, bool)`. */
export function isNumber(v: unknown): v is number | PyFloat {
  return typeof v === "number" || v instanceof PyFloat;
}

/** `isinstance(v, (int, float))`, booleans included. */
export function isNumberLike(v: unknown): v is number | PyFloat | boolean {
  return typeof v === "number" || typeof v === "boolean" || v instanceof PyFloat;
}

/** The numeric value of an int, float or bool. */
export function num(v: number | PyFloat | boolean): number {
  if (typeof v === "boolean") return v ? 1 : 0;
  return typeof v === "number" ? v : v.value;
}

// --- strings -------------------------------------------------------------------------------------

/** The code points of a string: Python indexes, slices and counts strings by code point. */
export function codePoints(s: string): string[] {
  return Array.from(s);
}

/** `len(s)` for a string. */
export function strLen(s: string): number {
  let n = 0;
  for (const _ of s) n++;
  return n;
}

/** Python string ordering: by code point (JavaScript's `<` compares UTF-16 code units). */
export function compareStr(a: string, b: string): number {
  if (a === b) return 0;
  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();
  for (;;) {
    const x = ia.next();
    const y = ib.next();
    if (x.done) return y.done ? 0 : -1;
    if (y.done) return 1;
    const cx = x.value.codePointAt(0)!;
    const cy = y.value.codePointAt(0)!;
    if (cx !== cy) return cx < cy ? -1 : 1;
  }
}

const PY_SPACE = /^[\t\n\v\f\r\x1c-\x20\x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*$/;

/** Whether a string is empty or only Python whitespace (`not s.strip()`). */
export function isPySpace(s: string): boolean {
  return PY_SPACE.test(s);
}

/** Python's `str.strip()`. */
export function pyStrip(s: string): string {
  const cps = Array.from(s);
  let a = 0;
  let b = cps.length;
  while (a < b && isPySpace(cps[a])) a++;
  while (b > a && isPySpace(cps[b - 1])) b--;
  return cps.slice(a, b).join("");
}

const CASED_UPPER = /\p{Lu}|\p{Lt}/u;
const CASED_LOWER = /\p{Ll}/u;

function isCased(ch: string): boolean {
  return CASED_UPPER.test(ch) || CASED_LOWER.test(ch) || ch.toLowerCase() !== ch.toUpperCase();
}

/** Python's `str.title()`: a cased character after an uncased one is upper-cased, the rest lower. */
export function strTitle(s: string): string {
  let out = "";
  let prevCased = false;
  for (const ch of s) {
    if (isCased(ch)) {
      out += prevCased ? ch.toLowerCase() : titleCaseChar(ch);
      prevCased = true;
    } else {
      out += ch;
      prevCased = false;
    }
  }
  return out;
}

function titleCaseChar(ch: string): string {
  // Title-case digraphs (ǆ → ǅ) are the only characters whose title case is not their upper case.
  const special: Record<string, string> = {
    "Ǆ": "ǅ", "ǅ": "ǅ", "ǆ": "ǅ",
    "Ǉ": "ǈ", "ǈ": "ǈ", "ǉ": "ǈ",
    "Ǌ": "ǋ", "ǋ": "ǋ", "ǌ": "ǋ",
    "Ǳ": "ǲ", "ǲ": "ǲ", "ǳ": "ǲ",
  };
  return special[ch] ?? ch.toUpperCase();
}

/** `s.isdigit()` for an ASCII-or-not string (decimal digits; at least one character). */
export function isDigits(s: string): boolean {
  return /^\p{Nd}+$/u.test(s);
}

/** `int(s)` for a string of decimal digits (any script, as Python accepts). */
export function parseDigits(s: string): number {
  let n = 0;
  for (const ch of s) n = n * 10 + digitValue(ch);
  return n;
}

function digitValue(ch: string): number {
  const cp = ch.codePointAt(0)!;
  if (cp >= 0x30 && cp <= 0x39) return cp - 0x30;
  // Decimal digits come in contiguous runs of tens, each run starting with a zero.
  let start = cp;
  while (start > 0 && /\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--;
  return (cp - start) % 10;
}

const NON_PRINTABLE = /[\p{C}\p{Zl}\p{Zp}\p{Zs}]/u;

/** Python's `repr(str)`. */
export function strRepr(s: string): string {
  const quote = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = quote;
  for (const ch of s) {
    if (ch === quote || ch === "\\") out += "\\" + ch;
    else if (ch === "\t") out += "\\t";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch !== " " && NON_PRINTABLE.test(ch)) {
      const cp = ch.codePointAt(0)!;
      if (cp < 0x100) out += "\\x" + cp.toString(16).padStart(2, "0");
      else if (cp < 0x10000) out += "\\u" + cp.toString(16).padStart(4, "0");
      else out += "\\U" + cp.toString(16).padStart(8, "0");
    } else out += ch;
  }
  return out + quote;
}

// --- numbers -------------------------------------------------------------------------------------

function digitsAndPoint(x: number): { neg: boolean; digits: string; point: number } {
  // toExponential() without an argument gives the shortest digits that round-trip, as Python's repr.
  const neg = x < 0 || Object.is(x, -0);
  const [mant, exp] = Math.abs(x).toExponential().split("e");
  const digits = mant.replace(".", "");
  return { neg, digits, point: Number(exp) + 1 };
}

/** Python's `repr(float)` (= `str(float)`): `1.0`, `0.1`, `1e+16`, `1e-05`. */
export function floatRepr(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const { neg, digits, point } = digitsAndPoint(x);
  let body: string;
  if (point > 16 || point < -3) {
    const exp = point - 1;
    body = digits[0] + (digits.length > 1 ? "." + digits.slice(1) : "") + "e" + (exp < 0 ? "-" : "+")
      + String(Math.abs(exp)).padStart(2, "0");
  } else if (point <= 0) {
    body = "0." + "0".repeat(-point) + digits;
  } else if (point >= digits.length) {
    body = digits + "0".repeat(point - digits.length) + ".0";
  } else {
    body = digits.slice(0, point) + "." + digits.slice(point);
  }
  return (neg ? "-" : "") + body;
}

/** Python's `format(x, "g")` (six significant digits, trailing zeros removed). */
export function formatG(x: number, precision = 6): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0" : "0";
  const p = precision === 0 ? 1 : precision;
  const [mant, expText] = x.toExponential(p - 1).split("e");
  const exp = Number(expText);
  if (exp < -4 || exp >= p) {
    let m = mant;
    if (m.includes(".")) m = m.replace(/0+$/, "").replace(/\.$/, "");
    return m + "e" + (exp < 0 ? "-" : "+") + String(Math.abs(exp)).padStart(2, "0");
  }
  let fixed = x.toFixed(Math.max(0, p - 1 - exp));
  if (fixed.includes(".")) fixed = fixed.replace(/0+$/, "").replace(/\.$/, "");
  return fixed;
}

/** `str(int)`. */
export function intStr(n: number): string {
  if (Object.is(n, -0)) return "0";
  if (Number.isSafeInteger(n)) return String(n);
  return Number.isFinite(n) ? BigInt(n).toString() : String(n);
}

// --- dict ----------------------------------------------------------------------------------------

/** A hashable value's key: equal Python values (`1`, `1.0`, `True`) share one. */
export function hashKey(v: unknown): string {
  if (v === null) return "N";
  if (typeof v === "string") return "s" + v;
  if (typeof v === "boolean") return "n" + (v ? 1 : 0);
  if (typeof v === "number") return "n" + intStr(v);
  if (v instanceof PyFloat) {
    return Number.isInteger(v.value) ? "n" + intStr(v.value) : "f" + floatRepr(v.value);
  }
  if (isTuple(v)) return "t(" + v.map(hashKey).join(",") + ")";
  if (isList(v) || v instanceof PyDict) throw new PyError("TypeError", `unhashable type: '${pyTypeName(v)}'`);
  if (v && typeof v === "object" && "hashKey" in v && typeof (v as { hashKey: unknown }).hashKey === "function") {
    return (v as { hashKey(): string }).hashKey();
  }
  return "o" + pyRepr(v);
}

/** A Python `dict`: insertion-ordered, keyed by value equality. */
export class PyDict<V = unknown> {
  private readonly map = new Map<string, [unknown, V]>();

  constructor(entries?: Iterable<readonly [unknown, V]>) {
    if (entries) for (const [k, v] of entries) this.set(k, v);
  }

  get size(): number {
    return this.map.size;
  }

  has(key: unknown): boolean {
    return this.map.has(hashKey(key));
  }

  /** `d[key]`: raises `KeyError` when absent. */
  item(key: unknown): V {
    const e = this.map.get(hashKey(key));
    if (!e) throw new PyError("KeyError", pyRepr(key));
    return e[1];
  }

  /** `d.get(key, fallback)`. */
  get<F = undefined>(key: unknown, fallback?: F): V | F {
    const e = this.map.get(hashKey(key));
    return e ? e[1] : (fallback as F);
  }

  set(key: unknown, value: V): void {
    const h = hashKey(key);
    const e = this.map.get(h);
    if (e) e[1] = value;
    else this.map.set(h, [key, value]);
  }

  delete(key: unknown): boolean {
    return this.map.delete(hashKey(key));
  }

  keys(): unknown[] {
    return Array.from(this.map.values(), (e) => e[0]);
  }

  values(): V[] {
    return Array.from(this.map.values(), (e) => e[1]);
  }

  items(): [unknown, V][] {
    return Array.from(this.map.values(), (e) => [e[0], e[1]]);
  }

  /** `dict(d)`: a shallow copy. */
  copy(): PyDict<V> {
    return new PyDict<V>(this.items());
  }
}

// --- repr / str ----------------------------------------------------------------------------------

/** Objects of the model define their own Python representation. */
export interface PyReprable {
  pyRepr(): string;
  pyStr?(): string;
}

function hasRepr(v: unknown): v is PyReprable {
  return !!v && typeof v === "object" && typeof (v as PyReprable).pyRepr === "function";
}

/** Python's `type(v).__name__`. */
export function pyTypeName(v: unknown): string {
  if (v === null || v === undefined) return "NoneType";
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "int";
  if (typeof v === "string") return "str";
  if (v instanceof PyFloat) return "float";
  if (isTuple(v)) return "tuple";
  if (Array.isArray(v)) return "list";
  if (v instanceof PyDict) return "dict";
  const name = (v as { pyTypeName?: string }).pyTypeName;
  if (typeof name === "string") return name;
  return (v as object).constructor?.name ?? "object";
}

/** Python's `repr(v)`. */
export function pyRepr(v: unknown): string {
  if (v === null || v === undefined) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return intStr(v);
  if (typeof v === "string") return strRepr(v);
  if (v instanceof PyFloat) return floatRepr(v.value);
  if (isTuple(v)) {
    if (v.length === 1) return "(" + pyRepr(v[0]) + ",)";
    return "(" + v.map(pyRepr).join(", ") + ")";
  }
  if (Array.isArray(v)) return "[" + v.map(pyRepr).join(", ") + "]";
  if (v instanceof PyDict) return "{" + v.items().map(([k, x]) => pyRepr(k) + ": " + pyRepr(x)).join(", ") + "}";
  if (hasRepr(v)) return v.pyRepr();
  return String(v);
}

/** Python's `str(v)`. */
export function pyStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (hasRepr(v) && v.pyStr) return v.pyStr();
  return pyRepr(v);
}

// --- equality, ordering, truth --------------------------------------------------------------------

/** Python's `a == b`. */
export function pyEq(a: unknown, b: unknown): boolean {
  if (isNumberLike(a) && isNumberLike(b)) return num(a) === num(b);
  if (a === null || a === undefined) return b === null || b === undefined;
  if (typeof a === "string") return a === b;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || isTuple(a) !== isTuple(b) || a.length !== b.length) return false;
    return a.every((x, i) => pyEq(x, b[i]));
  }
  if (a instanceof PyDict) {
    if (!(b instanceof PyDict) || a.size !== b.size) return false;
    return a.items().every(([k, x]) => b.has(k) && pyEq(x, b.get(k)));
  }
  if (a && typeof a === "object" && typeof (a as { pyEq?: unknown }).pyEq === "function") {
    return (a as { pyEq(o: unknown): boolean }).pyEq(b);
  }
  return a === b;
}

/** Python's ordering `a < b` as -1/0/1; raises `TypeError` for values Python does not order. */
export function pyCompare(a: unknown, b: unknown, op: string): number {
  if (isNumberLike(a) && isNumberLike(b)) {
    const x = num(a);
    const y = num(b);
    return x < y ? -1 : x > y ? 1 : x === y ? 0 : NaN;
  }
  if (typeof a === "string" && typeof b === "string") return compareStr(a, b);
  if (Array.isArray(a) && Array.isArray(b) && isTuple(a) === isTuple(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (!pyEq(a[i], b[i])) return pyCompare(a[i], b[i], op);
    }
    return a.length - b.length < 0 ? -1 : a.length > b.length ? 1 : 0;
  }
  throw new PyError("TypeError",
    `'${op}' not supported between instances of '${pyTypeName(a)}' and '${pyTypeName(b)}'`);
}

/** The `len()` of a string, list, tuple or dict. */
export function pyLen(v: string | readonly unknown[] | PyDict): number {
  if (typeof v === "string") return strLen(v);
  if (v instanceof PyDict) return v.size;
  return v.length;
}

// --- arithmetic ----------------------------------------------------------------------------------

function typeError(op: string, a: unknown, b: unknown): PyError {
  return new PyError("TypeError",
    `unsupported operand type(s) for ${op}: '${pyTypeName(a)}' and '${pyTypeName(b)}'`);
}

function numResult(a: unknown, b: unknown, x: number): number | PyFloat {
  return a instanceof PyFloat || b instanceof PyFloat ? new PyFloat(x) : x;
}

/** `a + b` (strings are handled by the caller). */
export function pyAdd(a: unknown, b: unknown): unknown {
  if (isNumberLike(a) && isNumberLike(b)) return numResult(a, b, num(a) + num(b));
  if (typeof a === "string" && typeof b === "string") return a + b;
  if (isList(a) && isList(b)) return [...a, ...b];
  if (isTuple(a) && isTuple(b)) return tuple([...a, ...b]);
  throw typeError("+", a, b);
}

export function pySub(a: unknown, b: unknown): unknown {
  if (isNumberLike(a) && isNumberLike(b)) return numResult(a, b, num(a) - num(b));
  throw typeError("-", a, b);
}

function repeat<T>(items: readonly T[], n: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(...items);
  return out;
}

export function pyMul(a: unknown, b: unknown): unknown {
  if (isNumberLike(a) && isNumberLike(b)) return numResult(a, b, num(a) * num(b));
  const seq = isIntLike(b) ? a : isIntLike(a) ? b : undefined;
  const n = isIntLike(b) ? num(b) : isIntLike(a) ? num(a) : 0;
  if (typeof seq === "string") return n > 0 ? seq.repeat(n) : "";
  if (isList(seq)) return repeat(seq, n);
  if (isTuple(seq)) return tuple(repeat(seq, n));
  throw typeError("*", a, b);
}

/** `a / b` when either is a float, else `a // b` — the evaluator's division. */
export function pyDiv(a: unknown, b: unknown): unknown {
  if (!isNumberLike(a) || !isNumberLike(b)) throw typeError(a instanceof PyFloat || b instanceof PyFloat ? "/" : "//", a, b);
  const y = num(b);
  if (a instanceof PyFloat || b instanceof PyFloat) {
    if (y === 0) throw new PyError("ZeroDivisionError", "float division by zero");
    return new PyFloat(num(a) / y);
  }
  if (y === 0) throw new PyError("ZeroDivisionError", "integer division or modulo by zero");
  return Math.floor(num(a) / y);
}

/** `-v` for a number (booleans count as integers). */
export function pyNeg(v: number | PyFloat | boolean): number | PyFloat {
  if (v instanceof PyFloat) return new PyFloat(-v.value);
  const n = -num(v);
  return Object.is(n, -0) ? 0 : n;
}

/** `float(v)` for a number. */
export function toFloat(v: number | PyFloat | boolean): PyFloat {
  return v instanceof PyFloat ? v : new PyFloat(num(v));
}

/** Python's `bool(v)` (`truthy` in the evaluator): empty strings and collections are false. */
export function pyBool(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.length > 0;
  if (v instanceof PyFloat) return v.value !== 0;
  if (Array.isArray(v)) return v.length > 0;
  if (v instanceof PyDict) return v.size > 0;
  return true;
}

/** Python's `int(v)` for a number, a boolean or a decimal string; raises `ValueError` otherwise. */
export function pyInt(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof PyFloat) {
    if (!Number.isFinite(v.value)) throw new PyError(Number.isNaN(v.value) ? "ValueError" : "OverflowError", "cannot convert float");
    return Math.trunc(v.value) || 0;
  }
  if (typeof v === "string") {
    const m = /^\s*([+-]?)(\d+(?:_\d+)*)\s*$/.exec(v);
    if (m) return (m[1] === "-" ? -1 : 1) * Number(m[2].replace(/_/g, "")) || 0;
    throw new PyError("ValueError", `invalid literal for int() with base 10: ${strRepr(v)}`);
  }
  throw new PyError("TypeError", `int() argument must be a string, a bytes-like object or a real number, not '${pyTypeName(v)}'`);
}

/** Convert a value made by `JSON.parse` (or written by hand) into Python values. */
export function fromJs(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isInteger(v) ? v : new PyFloat(v);
  if (typeof v === "string" || typeof v === "boolean") return v;
  if (v instanceof PyFloat || v instanceof PyDict || isTuple(v)) return v;
  if (Array.isArray(v)) return v.map(fromJs);
  if (typeof v === "object") return new PyDict(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, fromJs(x)] as const));
  return v;
}
