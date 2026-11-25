/**
 * JSON → Python values, as `json.loads` gives them: `1` is an `int`, `1.0` and `1e3` are `float`s
 * ({@link PyFloat}), objects are {@link PyDict}s keeping their key order. `JSON.parse` cannot keep
 * the int/float distinction, which the packs' data carry (`"opacity": 1.0`).
 */

import { PyDict, PyFloat } from "./values.js";

export class JsonError extends Error {}

/** Parse JSON text into Python values. */
export function parseJson(text: string): unknown {
  let i = 0;
  const n = text.length;

  const fail = (msg: string): never => {
    let line = 1;
    let col = 1;
    for (let k = 0; k < i && k < n; k++) {
      if (text[k] === "\n") {
        line++;
        col = 1;
      } else col++;
    }
    throw new JsonError(`${msg}: line ${line} column ${col} (char ${i})`);
  };

  const ws = (): void => {
    while (i < n) {
      const c = text[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") i++;
      else break;
    }
  };

  const value = (): unknown => {
    ws();
    if (i >= n) return fail("Expecting value");
    const c = text[i];
    if (c === "{") return object();
    if (c === "[") return array();
    if (c === '"') return string();
    if (c === "-" || (c >= "0" && c <= "9")) return number();
    if (text.startsWith("true", i)) {
      i += 4;
      return true;
    }
    if (text.startsWith("false", i)) {
      i += 5;
      return false;
    }
    if (text.startsWith("null", i)) {
      i += 4;
      return null;
    }
    if (text.startsWith("NaN", i)) {
      i += 3;
      return new PyFloat(NaN);
    }
    if (text.startsWith("Infinity", i)) {
      i += 8;
      return new PyFloat(Infinity);
    }
    return fail("Expecting value");
  };

  const object = (): PyDict => {
    i++;
    const d = new PyDict();
    ws();
    if (text[i] === "}") {
      i++;
      return d;
    }
    for (;;) {
      ws();
      if (text[i] !== '"') fail("Expecting property name enclosed in double quotes");
      const k = string();
      ws();
      if (text[i] !== ":") fail("Expecting ':' delimiter");
      i++;
      d.set(k, value());
      ws();
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "}") {
        i++;
        return d;
      }
      fail("Expecting ',' delimiter");
    }
  };

  const array = (): unknown[] => {
    i++;
    const a: unknown[] = [];
    ws();
    if (text[i] === "]") {
      i++;
      return a;
    }
    for (;;) {
      a.push(value());
      ws();
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "]") {
        i++;
        return a;
      }
      fail("Expecting ',' delimiter");
    }
  };

  const string = (): string => {
    i++;
    let out = "";
    for (;;) {
      if (i >= n) fail("Unterminated string starting at");
      const c = text[i];
      if (c === '"') {
        i++;
        return out;
      }
      if (c === "\\") {
        const e = text[i + 1];
        const map: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
        if (e === "u") {
          const hex = text.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("Invalid \\uXXXX escape");
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
        if (!(e in map)) fail("Invalid \\escape");
        out += map[e];
        i += 2;
        continue;
      }
      if (c < " ") fail("Invalid control character at");
      out += c;
      i++;
    }
  };

  const number = (): number | PyFloat => {
    const m = /^-?(?:0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i, i + 400));
    if (!m) {
      if (text.startsWith("-Infinity", i)) {
        i += 9;
        return new PyFloat(-Infinity);
      }
      return fail("Expecting value");
    }
    i += m[0].length;
    return m[1] !== undefined || m[2] !== undefined ? new PyFloat(Number(m[0])) : Number(m[0]);
  };

  const v = value();
  ws();
  if (i < n) fail("Extra data");
  return v;
}

/** A JSON object as a {@link PyDict}, or an empty one when the value is not an object. */
export function asDict(v: unknown): PyDict {
  return v instanceof PyDict ? v : new PyDict();
}
