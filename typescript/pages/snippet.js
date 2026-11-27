// The snippet that reproduces a gallery example (R-WEB-004.C22): what a reader pastes into a page to get
// the same example in the same pack. Pure functions, no DOM: the gallery (packs.js) uses them for the
// mockup's attributes and for the Show source block, and the unit test (tests/unit/snippet.test.ts)
// checks them without a browser.
//
//   <mockitdown-mockup pack="<id>" device="…" chrome="…" menubar="…" app="…" windowed="…">
//   <script type="text/mockitdown">
//   <the pattern file's text, unchanged, without its trailing newline>
//   </script>
//   </mockitdown-mockup>
//
// The pattern text starts on the line after the script tag: the element drops a first line holding only
// whitespace (R-WEB-002.C2), and the pattern files start at column 0, so the text arrives unchanged.
// The gallery-only attributes `caption`, `label` and `appearance` are never part of the snippet.

/** Index-entry keys passed to the mockup element as attributes of the same name, in snippet order (C14, C22). */
export const PATTERN_ATTRIBUTES = ["device", "chrome", "menubar", "app", "windowed"];

/**
 * The mockup attributes the gallery passes for pattern entry `entry` in `pack`, in snippet order:
 * `pack`, then each attribute of PATTERN_ATTRIBUTES the entry names.
 * @param {Record<string, unknown>} entry an entry of shared/patterns/index.json
 * @param {string} pack the selected pack id
 * @returns {[string, string][]}
 */
export function patternAttributes(entry, pack) {
  const attrs = [["pack", pack]];
  for (const k of PATTERN_ATTRIBUTES) {
    if (entry[k] !== undefined && entry[k] !== null) attrs.push([k, String(entry[k])]);
  }
  return attrs;
}

/** An attribute value escaped for a double-quoted HTML attribute. */
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** The pattern file's text without its trailing newline (one `\n` or `\r\n`); otherwise unchanged. */
export function patternText(source) {
  return source.replace(/\r?\n$/, "");
}

/**
 * The snippet of R-WEB-004.C22 for pattern entry `entry`, whose file holds `source`, in `pack`.
 * @param {Record<string, unknown>} entry an entry of shared/patterns/index.json
 * @param {string} source the pattern file's text
 * @param {string} pack the selected pack id
 * @returns {string}
 */
export function snippet(entry, source, pack) {
  const attrs = patternAttributes(entry, pack).map(([k, v]) => ` ${k}="${escapeAttribute(v)}"`).join("");
  return `<mockitdown-mockup${attrs}>\n<script type="text/mockitdown">\n${patternText(source)}\n</script>\n</mockitdown-mockup>`;
}
