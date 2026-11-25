/**
 * Python's number formatting, reproduced exactly (ADR-18: the renderer's output must equal the
 * Python renderer's byte for byte).
 *
 * Python rounds the exact binary value of a float, half to even: `f"{0.125:.2f}"` is `0.12`,
 * `round(2.675, 2)` is `2.67`. JavaScript's `toFixed` and `toExponential` round exact ties away from
 * zero, so they are not used for rounding here; every rounding goes through the exact decimal
 * expansion of the double ({@link exactDecimal}).
 */

const F64 = new Float64Array(1);
const U32 = new Uint32Array(F64.buffer);
const LITTLE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

/**
 * The exact decimal value of a finite, non-negative double: `digits` with no leading zeros (empty
 * for zero), and `point`, the position of the decimal point counted from the left of `digits`
 * (value = 0.<digits> × 10^point).
 */
export function exactDecimal(x: number): { digits: string; point: number } {
  if (x === 0) return { digits: "", point: 0 };
  F64[0] = x;
  const hi = U32[LITTLE ? 1 : 0];
  const lo = U32[LITTLE ? 0 : 1];
  const bexp = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let e: number;
  if (bexp === 0) e = -1074;
  else {
    mant |= 1n << 52n;
    e = bexp - 1075;
  }
  let digits: string;
  let fracDigits: number;
  if (e >= 0) {
    digits = (mant << BigInt(e)).toString();
    fracDigits = 0;
  } else {
    digits = (mant * 5n ** BigInt(-e)).toString();
    fracDigits = -e;
  }
  // value = digits × 10^-fracDigits
  let point = digits.length - fracDigits;
  const stripped = digits.replace(/^0+/, "");
  point -= digits.length - stripped.length;
  return { digits: stripped.replace(/0+$/, ""), point };
}

/**
 * Round the digit string to `keep` digits, half to even. Returns the kept digits (possibly one
 * longer after a carry, e.g. "999" → "1000") and whether a carry lengthened them.
 */
function roundDigits(digits: string, keep: number): { kept: string; carry: boolean } {
  if (keep < 0) return { kept: "", carry: false };
  if (digits.length <= keep) return { kept: digits.padEnd(keep, "0"), carry: false };
  const kept = digits.slice(0, keep);
  const rest = digits.slice(keep);
  let up: boolean;
  if (rest[0] > "5") up = true;
  else if (rest[0] < "5") up = false;
  else if (/[1-9]/.test(rest.slice(1))) up = true;
  else up = keep > 0 && Number(kept[keep - 1]) % 2 === 1; // exact tie: to even
  if (!up) return { kept, carry: false };
  if (keep === 0) return { kept: "1", carry: true };
  const bumped = (BigInt(kept) + 1n).toString().padStart(keep, "0");
  return { kept: bumped, carry: bumped.length > keep };
}

function special(x: number): string | null {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  return null;
}

/** Python's `f"{x:.{d}f}"`. */
export function pyFixed(x: number, d: number): string {
  const s = special(x);
  if (s !== null) return s;
  const neg = x < 0 || Object.is(x, -0);
  const { digits, point } = exactDecimal(Math.abs(x));
  // Pad the digits so they start at 10^0's position or above.
  let all = digits;
  let p = point;
  if (p < 1) {
    all = "0".repeat(1 - p) + all;
    p = 1;
  }
  const { kept, carry } = roundDigits(all, p + d);
  const intLen = p + (carry ? 1 : 0);
  let intPart = kept.slice(0, intLen).replace(/^0+(?=\d)/, "");
  if (intPart === "") intPart = "0";
  const frac = kept.slice(intLen);
  return (neg ? "-" : "") + intPart + (d > 0 ? "." + frac : "");
}

/** Python's `round(x, n)` for a float: the float nearest the exactly rounded decimal. */
export function pyRoundTo(x: number, n: number): number {
  if (!Number.isFinite(x)) return x;
  return Number(pyFixed(x, n));
}

/** Python's `round(x)`: an integer, ties to even. */
export function pyRound(x: number): number {
  const f = Math.floor(x);
  const diff = x - f;
  let r: number;
  if (diff > 0.5) r = f + 1;
  else if (diff < 0.5) r = f;
  else r = f % 2 === 0 ? f : f + 1;
  return r === 0 ? 0 : r;
}

/** Python's `format(x, "g")` / `f"{x:.{p}g}"`. */
export function pyFormatG(x: number, precision = 6): string {
  const s = special(x);
  if (s !== null) return s;
  if (x === 0) return Object.is(x, -0) ? "-0" : "0";
  const p = precision === 0 ? 1 : precision;
  const neg = x < 0;
  const { digits, point } = exactDecimal(Math.abs(x));
  const { kept, carry } = roundDigits(digits, p);
  const sig = carry ? kept.slice(0, p) : kept;
  const exp = point - 1 + (carry ? 1 : 0);
  let body: string;
  if (exp < -4 || exp >= p) {
    let m = sig[0] + (p > 1 ? "." + sig.slice(1) : "");
    if (m.includes(".")) m = m.replace(/0+$/, "").replace(/\.$/, "");
    body = m + "e" + (exp < 0 ? "-" : "+") + String(Math.abs(exp)).padStart(2, "0");
  } else if (exp < 0) {
    body = ("0." + "0".repeat(-exp - 1) + sig).replace(/0+$/, "").replace(/\.$/, "");
  } else {
    const intPart = sig.slice(0, exp + 1);
    const frac = sig.slice(exp + 1).replace(/0+$/, "");
    body = intPart + (frac ? "." + frac : "");
  }
  return (neg ? "-" : "") + body;
}

/** Python's `a % b` for numbers (the result takes the divisor's sign). */
export function pyMod(a: number, b: number): number {
  const r = a % b;
  return r !== 0 && (r < 0) !== (b < 0) ? r + b : r === 0 ? 0 : r;
}

/** Python's `min(a, b)`: the first of equal values. */
export function pyMin(...xs: number[]): number {
  let m = xs[0];
  for (const x of xs.slice(1)) if (x < m) m = x;
  return m;
}

/** Python's `max(a, b)`: the first of equal values. */
export function pyMax(...xs: number[]): number {
  let m = xs[0];
  for (const x of xs.slice(1)) if (x > m) m = x;
  return m;
}

const FLOAT_TEXT = /^[+-]?(?:(?:\d(?:_?\d)*)?\.?\d(?:_?\d)*(?:[eE][+-]?\d(?:_?\d)*)?|\d(?:_?\d)*\.(?:[eE][+-]?\d(?:_?\d)*)?|inf|infinity|nan)$/i;

/** Python's `float(s)` for a string; null where Python raises `ValueError`. */
export function parsePyFloat(text: string): number | null {
  const s = text.replace(/^[\s\x1c-\x1f\x85]+|[\s\x1c-\x1f\x85]+$/gu, "")
    .replace(/\p{Nd}/gu, (d) => {
      const cp = d.codePointAt(0)!;
      if (cp <= 0x39) return d;
      let start = cp;
      while (start > 0 && /\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--;
      return String((cp - start) % 10);
    });
  if (!FLOAT_TEXT.test(s)) return null;
  const low = s.toLowerCase().replace(/_/g, "");
  const sign = low.startsWith("-") ? -1 : 1;
  const bare = low.replace(/^[+-]/, "");
  if (bare === "inf" || bare === "infinity") return sign * Infinity;
  if (bare === "nan") return NaN;
  return Number(low);
}
