// The Python value model (ADR-18: the Python variant is the reference).
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseJson, values } from "../../dist/node.js";

const { PyDict, PyFloat, floatRepr, formatG, pyRepr, strRepr, pyEq, tuple, strTitle } = values;

test("float repr follows Python", () => {
  const cases: [number, string][] = [
    [1, "1.0"], [0.1, "0.1"], [0.1 + 0.2, "0.30000000000000004"], [1e16, "1e+16"], [1e15, "1000000000000000.0"],
    [0.0001, "0.0001"], [0.00001, "1e-05"], [-2.5, "-2.5"], [-0, "-0.0"], [1.5e300, "1.5e+300"], [Infinity, "inf"],
  ];
  for (const [x, s] of cases) assert.equal(floatRepr(x), s, String(x));
});

test("format g follows Python", () => {
  const cases: [number, string][] = [
    [0.5, "0.5"], [1 / 3, "0.333333"], [123456789, "1.23457e+08"], [0.00001234, "1.234e-05"], [100000, "100000"],
    [1e6, "1e+06"], [2.5, "2.5"],
  ];
  for (const [x, s] of cases) assert.equal(formatG(x), s, String(x));
});

test("string repr picks quotes and escapes as Python", () => {
  assert.equal(strRepr("a"), "'a'");
  assert.equal(strRepr("it's"), `"it's"`);
  assert.equal(strRepr(`'"`), `'\\'"'`);
  assert.equal(strRepr("a\nb\\"), "'a\\nb\\\\'");
  assert.equal(strRepr("\u0001é🚀"), "'\\x01é🚀'");
});

test("repr of collections", () => {
  assert.equal(pyRepr([1, "a", null, true, new PyFloat(2)]), "[1, 'a', None, True, 2.0]");
  assert.equal(pyRepr(tuple([1])), "(1,)");
  assert.equal(pyRepr(new PyDict([["k", tuple([1, 2])]])), "{'k': (1, 2)}");
});

test("equality and dict keys unify 1, 1.0 and True", () => {
  assert.ok(pyEq(1, new PyFloat(1)));
  assert.ok(pyEq(true, 1));
  assert.ok(!pyEq([1], tuple([1])));
  const d = new PyDict<string>([[1, "int"]]);
  assert.equal(d.get(new PyFloat(1)), "int");
  assert.equal(d.get(true), "int");
});

test("str.title()", () => {
  assert.equal(strTitle("hello wORLD's x2y"), "Hello World'S X2Y");
});

test("JSON keeps ints and floats apart, and key order", () => {
  const v = parseJson('{"b": 1, "a": 1.0, "c": [2e3, -0, "x"]}') as InstanceType<typeof PyDict>;
  assert.deepEqual(v.keys(), ["b", "a", "c"]);
  assert.equal(v.get("b"), 1);
  assert.ok(v.get("a") instanceof PyFloat);
  assert.equal(pyRepr(v), "{'b': 1, 'a': 1.0, 'c': [2000.0, 0, 'x']}");
  assert.throws(() => parseJson("{"), /Expecting/);
});
