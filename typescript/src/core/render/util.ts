/**
 * Helpers of the HTML renderer (the module-level functions of Python's `mockitdown.render.html`):
 * escaping, inline Markdown, value coercion with Python's semantics, dates, code highlighting and
 * the fixed SVG art.
 */

import { EnumValue, Thunk, ViewList } from "../model.js";
import { parsePyFloat, pyFixed, pyFormatG, pyRound } from "../pyformat.js";
import { codePoints, intStr, isNumberLike, isSeq, PyDict, pyBool, pyEq, PyError, PyFloat, pyStr, pyStrip, pyTypeName } from "../values.js";

/** Python's `\s` (Unicode whitespace) as the body of a character class. */
export const PY_WS = "\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
/** Python's `\w` as the body of a character class. */
export const PY_W = "\\p{L}\\p{N}_";

/** `html.escape(str(s), quote=True)`, None as "". */
export function esc(s: unknown): string {
  const t = s === null || s === undefined ? "" : pyStr(s);
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

const INLINE_MD: [RegExp, string][] = [
  [/\*\*([^\n]+?)\*\*/gu, "<strong>$1</strong>"],
  [new RegExp(`(?<![*${PY_W}])\\*(?![${PY_WS}])([^\\n]+?)(?<![${PY_WS}])\\*(?![*${PY_W}])`, "gu"), "<em>$1</em>"],
  [/`([^\n]+?)`/gu, '<code class="mkd-code">$1</code>'],
  [/~~([^\n]+?)~~/gu, "<s>$1</s>"],
  [new RegExp(`\\[([^\\n]+?)\\]\\((?:[^)${PY_WS}]+)\\)`, "gu"), '<span class="mkd-link" role="link">$1</span>'],
];

/** Escape text and apply the inline Markdown that SwiftUI `Text` supports. */
export function textHtml(s: unknown): string {
  let out = esc(s).split("\\*").join("\x00").split("\\_").join("\x01").split("\\`").join("\x02");
  for (const [pat, rep] of INLINE_MD) out = out.replace(pat, rep);
  return out.split("\x00").join("*").split("\x01").join("_").split("\x02").join("`").split("\n").join("<br>");
}

/** `_fmt`: how a value is written into markup. */
export function fmt(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof PyFloat) return Number.isInteger(v.value) ? intStr(v.value) : pyFormatG(v.value);
  if (v instanceof EnumValue) return v.name;
  return v === null || v === undefined ? "" : pyStr(v);
}

/** `_num`: a number as a float (a JavaScript number), or `fallback`. */
export function num(v: unknown, fallback: number | null = null): number | null {
  if (typeof v === "boolean") return fallback;
  if (typeof v === "number") return v;
  if (v instanceof PyFloat) return v.value;
  if (typeof v === "string") {
    const f = parsePyFloat(v);
    return f === null ? fallback : f;
  }
  return fallback;
}

/** `x or d` for a number that may be null: zero and null give `d`. */
export function or0(x: number | null, d: number): number {
  return x === null || x === 0 ? d : x;
}

/** `_name`: an enum's name, a value's text, "" for None and view values. */
export function name(v: unknown): string {
  if (v instanceof EnumValue) return v.name;
  return v === null || v === undefined || v instanceof ViewList || v instanceof Thunk ? "" : pyStr(v);
}

/** `_bool`: a value read as a flag. */
export function bool(v: unknown, fallback = false): boolean {
  if (v === null || v === undefined) return fallback;
  if (v instanceof EnumValue) return !["false", "off", "no", "hidden"].includes(v.name);
  if (typeof v === "string") return !["", "false", "off", "no", "0"].includes(v.toLowerCase());
  return pyBool(v);
}

/** Python's `x in (a, b, …)` (equality, so `0 in (False,)` holds). */
export function isIn(x: unknown, options: readonly unknown[]): boolean {
  return options.some((o) => pyEq(x, o));
}

/** Python's `a or b`. */
export function or<T, U>(a: T, b: U): T | U {
  return pyBool(a) ? a : b;
}

/** Python's `int(x)` for a float-valued number (truncation). */
export function int(x: number): number {
  if (!Number.isFinite(x)) throw new PyError(Number.isNaN(x) ? "ValueError" : "OverflowError", "cannot convert float to integer");
  return Math.trunc(x) || 0;
}

/** Iterating a value as Python does: a string by character, a dict by key. */
export function iter(v: unknown): unknown[] {
  if (typeof v === "string") return codePoints(v);
  if (isSeq(v)) return [...v];
  if (v instanceof PyDict) return v.keys();
  throw new PyError("TypeError", `'${pyTypeName(v)}' object is not iterable`);
}

/** `len(x)` for a string or a sequence. */
export function len(v: unknown): number {
  if (typeof v === "string") return codePoints(v).length;
  if (isSeq(v)) return v.length;
  if (v instanceof PyDict) return v.size;
  throw new PyError("TypeError", `object of type '${pyTypeName(v)}' has no len()`);
}

/** `sum(ord(c) for c in s)`. */
export function ordSum(s: string): number {
  let n = 0;
  for (const ch of s) n += ch.codePointAt(0)!;
  return n;
}

/** `isinstance(v, (int, float)) and not isinstance(v, bool)`. */
export function isNum(v: unknown): v is number | PyFloat {
  return typeof v === "number" || v instanceof PyFloat;
}

/** `isinstance(v, (int, float))` (booleans included). */
export function isNumOrBool(v: unknown): v is number | PyFloat | boolean {
  return isNumberLike(v);
}

/** The numeric value of an int, float or bool. */
export function numValue(v: number | PyFloat | boolean): number {
  return typeof v === "boolean" ? (v ? 1 : 0) : typeof v === "number" ? v : v.value;
}

export function initials(nameText: string): string {
  const parts = pyStrip(nameText).split(new RegExp(`[${PY_WS}._-]+`, "u")).filter((p) => p);
  if (parts.length === 0) return "";
  if (parts.length === 1) return codePoints(parts[0]).slice(0, 2).join("").toUpperCase();
  return (codePoints(parts[0])[0] + codePoints(parts[parts.length - 1])[0]).toUpperCase();
}

/** `f"{x:.{d}f}"`. */
export function fx(x: number, d: number): string {
  return pyFixed(x, d);
}

export { pyRound };

// --- dates (proleptic Gregorian, as Python's datetime.date) --------------------------------------

export interface PyDate {
  year: number;
  month: number;
  day: number;
}

const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September",
  "October", "November", "December"];
const MONTH_ABBR = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthName(m: number): string {
  if (m < 0 || m > 12) throw new PyError("IndexError", "list index out of range");
  return MONTH_NAMES[m];
}

function isLeap(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}

export function monthLen(y: number, m: number): number {
  return [0, 31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
}

/** `datetime.date(y, m, d)`, or null where Python raises. */
export function makeDate(y: number, m: number, d: number): PyDate | null {
  if (y < 1 || y > 9999 || m < 1 || m > 12 || d < 1 || d > monthLen(y, m)) return null;
  return { year: y, month: m, day: d };
}

export function dateKey(d: PyDate): number {
  return d.year * 10000 + d.month * 100 + d.day;
}

export const DATE_MIN: PyDate = { year: 1, month: 1, day: 1 };

/** Days since 1970-01-01 (H. Hinnant's days_from_civil). */
function daysFromCivil(y: number, m: number, d: number): number {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** `calendar.weekday(y, m, d)`: Monday is 0. */
export function weekday(y: number, m: number, d: number): number {
  if (y < 1 || y > 9999) y = 2000 + (((y % 400) + 400) % 400);
  return (((daysFromCivil(y, m, d) + 3) % 7) + 7) % 7;
}

/** `calendar.Calendar(firstweekday).itermonthdates(year, month)`. */
export function monthDates(year: number, month: number, firstweekday: number): PyDate[] {
  if (month < 1 || month > 12) throw new PyError("IllegalMonthError", `bad month number ${month}; must be 1-12`);
  const day1 = weekday(year, month, 1);
  const ndays = monthLen(year, month);
  const before = (((day1 - firstweekday) % 7) + 7) % 7;
  const after = (((firstweekday - day1 - ndays) % 7) + 7) % 7;
  const [py, pm] = month === 1 ? [year - 1, 12] : [year, month - 1];
  const [ny, nm] = month === 12 ? [year + 1, 1] : [year, month + 1];
  const out: PyDate[] = [];
  const push = (y: number, m: number, d: number): void => {
    if (makeDate(y, m, d) === null) throw new PyError("ValueError", "year is out of range");
    out.push({ year: y, month: m, day: d });
  };
  const end = monthLen(py, pm) + 1;
  for (let d = end - before; d < end; d++) push(py, pm, d);
  for (let d = 1; d <= ndays; d++) push(year, month, d);
  for (let d = 1; d <= after; d++) push(ny, nm, d);
  return out;
}

function digitsInt(s: string): number {
  let n = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    let start = cp;
    while (start > 0 && /\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--;
    n = n * 10 + ((cp - start) % 10);
  }
  return n;
}

export function parseDate(value: unknown): PyDate | null {
  if (typeof value === "string") {
    const m = /^(\p{Nd}{4})-(\p{Nd}{2})-(\p{Nd}{2})/u.exec(value);
    if (m) return makeDate(digitsInt(m[1]), digitsInt(m[2]), digitsInt(m[3]));
  }
  return null;
}

function stripChars(s: string, chars: string): string {
  const cps = codePoints(s);
  let a = 0;
  let b = cps.length;
  while (a < b && chars.includes(cps[a])) a++;
  while (b > a && chars.includes(cps[b - 1])) b--;
  return cps.slice(a, b).join("");
}

export function formatDate(value: unknown, style: string): string {
  const d = parseDate(value);
  if (d === null) return fmt(value);
  const rest = stripChars(codePoints(pyStr(value)).slice(10).join(""), " T");
  let out: string;
  if (style === "numeric") out = `${d.month}/${d.day}/${d.year}`;
  else if (style === "long") out = `${MONTH_NAMES[d.month]} ${d.day}, ${d.year}`;
  else if (style === "iso") {
    out = `${String(d.year).padStart(4, "0")}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
  } else out = `${MONTH_ABBR[d.month]} ${d.day}, ${d.year}`;
  return rest ? `${out} ${rest}` : out;
}

// --- decorations, spreadsheets, schedules ----------------------------------------------------------

/**
 * Make the root element of `out` an anchor and append the fallback layer inside it. The element stays
 * the parent's direct child; only a void root (an `<img>`) is wrapped.
 */
export function decorate(out: string, anchor: string, layer: string): string {
  const m = new RegExp(`^<([a-zA-Z][${PY_W}-]*)([^>]*)>`, "u").exec(out);
  const rstripped = out.replace(new RegExp(`[${PY_WS}]+$`, "u"), "");
  if (!m || m[1].toLowerCase() === "img" || !rstripped.endsWith(`</${m[1]}>`)) {
    return `<div class="mkd-deco" data-deco="true" style="anchor-name:${anchor}">${out}${layer}</div>`;
  }
  const tag = m[1];
  let attrs = m[2];
  if (attrs.includes(' style="')) attrs = attrs.replace(' style="', ` style="anchor-name:${anchor};`);
  else attrs += ` style="anchor-name:${anchor}"`;
  attrs += ' data-deco="true"';
  const close = `</${tag}>`;
  const body = out.slice(m[0].length, rstripped.lastIndexOf(close));
  return `<${tag}${attrs}>${body}${layer}${close}`;
}

export function colName(i: number): string {
  let out = "";
  i += 1;
  while (i) {
    const r = (i - 1) % 26;
    i = Math.floor((i - 1) / 26);
    out = String.fromCharCode(65 + r) + out;
  }
  return out;
}

function colIndex(letters: string): number {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.codePointAt(0)! - 64);
  return n - 1;
}

/** 'B2:D5' → [col0, row0, col1, row1] with 0-based columns and 1-based rows. */
export function parseRange(text: string): [number, number, number, number] | null {
  const m = new RegExp(`^[${PY_WS}]*([A-Za-z]+)(\\p{Nd}+)(?::([A-Za-z]+)(\\p{Nd}+))?[${PY_WS}]*$`, "u").exec(text || "");
  if (!m) return null;
  const c0 = colIndex(m[1]);
  const r0 = digitsInt(m[2]);
  const [c1, r1] = m[3] ? [colIndex(m[3]), digitsInt(m[4])] : [c0, r0];
  return [Math.min(c0, c1), Math.min(r0, r1), Math.max(c0, c1), Math.max(r0, r1)];
}

export function hour(h: unknown): string {
  const x = or0(num(h, 0), 0);
  const hh = int(x);
  const mm = int(pyRound((x - hh) * 60));
  return `${hh}:${mm < 0 ? "-" + String(-mm) : String(mm).padStart(2, "0")}`;
}

// --- code highlighting -----------------------------------------------------------------------------

const KEYWORDS: Record<string, string> = {
  swift: "import struct class enum protocol extension func var let if else guard return for in while switch case "
    + "default some any self Self true false nil private public static async await throws try init",
  js: "import export from const let var function return if else for of in while class extends new this true "
    + "false null undefined async await try catch switch case default typeof interface type",
  python: "import from def class return if elif else for in while with as try except finally True False None "
    + "lambda yield async await pass raise and or not is",
  go: "package import func var const type struct interface return if else for range go defer map chan nil true false",
  rust: "use fn let mut pub struct enum impl trait match if else for in while loop return Some None Ok Err self",
  css: "",
  html: "",
  json: "true false null",
  sql: "SELECT FROM WHERE JOIN LEFT RIGHT INNER ON GROUP BY ORDER LIMIT INSERT INTO VALUES UPDATE SET DELETE "
    + "CREATE TABLE AND OR NOT AS COUNT SUM",
  shell: "cd ls export echo sudo git npm pip python cargo make",
};
const LANG_ALIASES: Record<string, string> = {
  javascript: "js", ts: "js", typescript: "js", tsx: "js", jsx: "js", py: "python",
  sh: "shell", bash: "shell", zsh: "shell", rs: "rust", kt: "swift", kotlin: "swift",
  java: "js", csharp: "js", cs: "js", c: "js", cpp: "js",
};
const PY_D = "\\p{Nd}";
const TOKEN_SRC = `(?<comment>//[^\\n]*$|#(?![${PY_W}]*\\{)[^\\n]*$|--[^\\n]*$)`
  + `|(?<string>"(?:[^"\\\\]|\\\\[^\\n])*"|'(?:[^'\\\\]|\\\\[^\\n])*'|\`[^\`]*\`)`
  + `|(?<number>(?<![${PY_W}])${PY_D}+(?:\\.${PY_D}+)?(?![${PY_W}]))`
  + `|(?<word>[A-Za-z_@][A-Za-z0-9_]*)|(?<tag></?[a-zA-Z][${PY_W}-]*)`;

function own(o: Record<string, string>, k: string): boolean {
  return Object.prototype.hasOwnProperty.call(o, k);
}

export function highlight(line: string, langIn: string): string {
  const lang = own(LANG_ALIASES, langIn) ? LANG_ALIASES[langIn] : langIn;
  if (!own(KEYWORDS, lang)) return esc(line);
  const kws = new Set(KEYWORDS[lang].split(/\s+/).filter((x) => x));
  const out: string[] = [];
  let pos = 0;
  const re = new RegExp(TOKEN_SRC, "gu");
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    const g = m.groups!;
    let kind: string | null = g.comment !== undefined ? "comment" : g.string !== undefined ? "string"
      : g.number !== undefined ? "number" : g.word !== undefined ? "word" : "tag";
    const text = m[0];
    if (kind === "comment" && (lang === "python" || lang === "shell") && !text.startsWith("#")) kind = null;
    if (kind === "comment" && text.startsWith("#") && !(lang === "python" || lang === "shell")) kind = null;
    if (kind === "comment" && text.startsWith("--") && lang !== "sql") kind = null;
    out.push(esc(line.slice(pos, m.index)));
    const end = m.index + text.length;
    if (kind === "word") {
      if (kws.has(text) || (lang === "sql" && kws.has(text.toUpperCase()))) out.push(`<span class="mkd-code__kw">${esc(text)}</span>`);
      else if (/^\p{Uppercase}/u.test(text) || text.startsWith("@")) out.push(`<span class="mkd-code__type">${esc(text)}</span>`);
      else if (line.slice(end, end + 1) === "(") out.push(`<span class="mkd-code__fn">${esc(text)}</span>`);
      else out.push(esc(text));
    } else if (kind === "tag" && lang === "html") {
      out.push(`<span class="mkd-code__kw">${esc(text)}</span>`);
    } else if (kind === "comment" || kind === "string" || kind === "number") {
      const cls = kind === "string" ? "str" : kind === "number" ? "num" : "comment";
      out.push(`<span class="mkd-code__${cls}">${esc(text)}</span>`);
    } else out.push(esc(text));
    pos = end;
    if (kind === "comment") break;
  }
  out.push(esc(line.slice(pos)));
  return out.join("");
}

export function terminalLine(line: string): string {
  const m = new RegExp(`^([^${PY_WS}]*[$%#>]) ([^\\n]*)$`, "u").exec(line);
  if (m) return `<span class="mkd-code__prompt">${esc(m[1])}</span> <span class="mkd-code__cmd">${esc(m[2])}</span>`;
  return `<span class="mkd-code__out">${esc(line)}</span>`;
}

const CURSORS: Record<string, string> = {
  arrow: '<path d="M5 3v16l4.2-4 2.9 6.6 2.6-1.1-2.8-6.5H18z"/>',
  hand: '<path d="M9.5 21c-2-1.6-3.6-3.6-4.6-5.6-.5-1 .3-2 1.3-1.6l1.8.8V5.2a1.4 1.4 0 0 1 2.8 0v5.3V9.2a1.4 1.4 0 0 1'
    + ' 2.8 0v1.6-.9a1.4 1.4 0 0 1 2.8 0v1.3-.5a1.4 1.4 0 0 1 2.8 0v4.6c0 2.6-1.1 4.5-2.6 5.7z"/>',
  ibeam: '<path d="M9 4h6M9 20h6M12 4v16"/>',
  crosshair: '<path d="M12 3v18M3 12h18"/>',
  grab: '<path d="M7 12V9.5a1.4 1.4 0 0 1 2.8 0V11V8.2a1.4 1.4 0 0 1 2.8 0V11V8.7a1.4 1.4 0 0 1 2.8 0V11.5V10a1.4 '
    + '1.4 0 0 1 2.8 0v4.5c0 3.5-2.4 6.5-6 6.5-2.6 0-4.3-1.3-5.6-3.4L5 14.8c-.6-1 .6-2 1.5-1.3z"/>',
  touch: '<circle cx="12" cy="12" r="7"/>',
};

export function cursorSvg(kind: string): string {
  const body = own(CURSORS, kind) ? CURSORS[kind] : CURSORS.arrow;
  return `<svg class="mkd-pointer__svg" viewBox="0 0 24 24" aria-hidden="true" data-kind="${esc(kind)}">${body}</svg>`;
}

export const MAP_SVG = '<svg class="mkd-map__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
  + '<rect class="mkd-map__land" width="400" height="300"/>'
  + '<path class="mkd-map__park" d="M40 40h90v70H40zM260 190h80v70h-80z"/>'
  + '<path class="mkd-map__water" d="M0 220c60-30 110 20 180-10s120-50 220-20v110H0z"/>'
  + '<g class="mkd-map__roads"><path d="M0 130h400M150 0v300M0 30l400 230M300 0v220"/></g>'
  + '<g class="mkd-map__minor"><path d="M0 80h400M0 180h400M60 0v300M230 0v300M360 0v300"/></g></svg>';
