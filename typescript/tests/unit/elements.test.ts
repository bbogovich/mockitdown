// IT-14 (unit part): the pure pieces of the mockup element (R-WEB-002, A-WEB-2) in Node — the code
// taken from a script child, the stylesheet adapted to a shadow root, and the package entry being
// importable where there is no DOM (it then defines no element).
import assert from "node:assert/strict";
import { test } from "node:test";

const entry = await import("../../dist/mockitdown.js");

test("the entry imports in Node without defining elements; tags begin with mockitdown- (R-WEB-002.C1)", () => {
  assert.equal(typeof entry.defineElements, "function");
  entry.defineElements();
  assert.deepEqual([...entry.ELEMENT_TAGS], ["mockitdown-mockup", "mockitdown-designer", "mockitdown-editor", "mockitdown-outline", "mockitdown-gallery", "mockitdown-inspector", "mockitdown-code"]);
  for (const tag of entry.ELEMENT_TAGS) assert.ok(tag.startsWith("mockitdown-"), tag);
  assert.equal(entry.MOCKUP_TAG, "mockitdown-mockup");
  assert.equal(entry.SCRIPT_TYPE, "text/mockitdown");
  assert.deepEqual([...entry.MOCKUP_ATTRIBUTES], [
    "pack", "device", "appearance", "width", "height", "chrome", "title", "id", "caption", "elements",
    "url", "source", "window", "windowed", "menubar", "app", "import-base", "asset-base", "edit",
  ]);
});

test("scriptCode drops the script's first and last blank lines and the common indentation (R-WEB-002.C2)", () => {
  const { scriptCode } = entry;
  assert.equal(scriptCode('\n      VStack {\n        Text("a < b")\n      }\n    '), 'VStack {\n  Text("a < b")\n}');
  assert.equal(scriptCode('Text("x")'), 'Text("x")');
  assert.equal(scriptCode('Text("x")\n'), 'Text("x")');
  assert.equal(scriptCode("\n  A\n\n    B\n  \n"), "A\n\n  B\n", "only the last blank line goes");
  assert.equal(scriptCode("\n\n  A\n"), "\nA", "only the first blank line goes");
  assert.equal(scriptCode("\r\n\tA\r\n\t\tB\r\n"), "A\n\tB");
  assert.equal(scriptCode("   "), "");
  assert.equal(scriptCode(""), "");
  assert.equal(scriptCode("  \t A\n  B"), "\t A\nB", "a common prefix, character by character");
});

test("shadowCss rewrites the page-scoped appearance selectors for a shadow root (A-WEB-2)", () => {
  const { shadowCss } = entry;
  const css = '[data-md-color-scheme="slate"] .mkd-pack-mui .mkd-frame[data-appearance="auto"]{x:1}\n'
    + "@media (prefers-color-scheme: dark){body:not([data-md-color-scheme]) .mkd-pack-mui .mkd-frame[data-appearance=\"auto\"]{x:1}}";
  assert.equal(shadowCss(css),
    ':host-context([data-md-color-scheme="slate"]) .mkd-pack-mui .mkd-frame[data-appearance="auto"]{x:1}\n'
    + "@media (prefers-color-scheme: dark){:host .mkd-pack-mui .mkd-frame[data-appearance=\"auto\"]{x:1}}");
  assert.equal(shadowCss(".mkd-card__body{x:1}"), ".mkd-card__body{x:1}");
});
