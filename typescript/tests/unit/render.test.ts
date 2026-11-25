// R-WEB-001 C3 (render, check, stylesheet with the Python API's semantics), C7 (assets by base URL,
// never embedded), R-ANN-003.C5 (portable anchor prefix) and the Python formatting the renderer
// reproduces. The conformance corpus (conformance.test.ts) holds the renderer to the Python output.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setup } from "./helpers.js";

const core = setup();

describe("render (R-WEB-001.C3)", () => {
  it("returns html, diagnostics, packs and the screen", () => {
    const r = core.render('import Android\nText("Hi")', { device: "fit" });
    assert.ok(r instanceof core.RenderResult);
    assert.match(r.html, /^<div class="mkd-figure mkd-pack-android" role="figure"/);
    assert.deepEqual(r.packs, ["base", "android"]);
    assert.deepEqual(r.diagnostics, []);
    assert.equal(r.ok, true);
    assert.ok(r.screen);
  });

  it("puts an error box in front of the figure when there are errors", () => {
    const r = core.render('Frobnicate("x")', { device: "fit" });
    assert.equal(r.ok, false);
    assert.match(r.html, /^<div class="mkd-error" role="alert"><div class="mkd-error__title">mockitdown: 1 error<\/div>/);
  });

  it("renders only the error box after a syntax error", () => {
    const r = core.render('Text("open', {});
    assert.deepEqual(r.packs, []);
    assert.equal(r.screen, null);
    assert.match(r.html, /^<div class="mkd-error"[^]*<\/ul><\/div>$/);
  });

  it("shows warnings only with show_warnings", () => {
    const src = 'Icon("no-such-glyph-anywhere")';
    assert.doesNotMatch(core.render(src, { device: "fit" }).html, /mkd-error/);
    assert.match(core.render(src, { device: "fit", show_warnings: true }).html, /mockitdown: warnings/);
  });

  it("appends the source on request", () => {
    const r = core.render('Text("a < b")\n', { device: "fit", source: true });
    assert.match(r.html, /<details class="mkd-source"><summary>Source<\/summary><pre><code class="language-swift">Text\(&quot;a &lt; b&quot;\)<\/code><\/pre><\/details>$/);
  });

  it("check() returns the diagnostics of rendering too", () => {
    const diags = core.check('Image("javascript:alert(1)")', { device: "fit" });
    assert.deepEqual(diags.map((d) => d.code), ["asset"]);
  });
});

describe("images (R-WEB-001.C7, R-ASSET-001)", () => {
  it("resolves a local path against the asset base URL and embeds nothing", () => {
    const r = core.render('Image("img/team.jpg")', { device: "fit", asset_base: "https://cdn.example.com/assets" });
    assert.match(r.html, /<img class="mkd-image" data-el="Image" src="https:\/\/cdn\.example\.com\/assets\/img\/team\.jpg" alt="">/);
    assert.deepEqual(r.diagnostics, []);
  });

  it("reports a local path as not found without an asset base URL", () => {
    const r = core.render('Image("team.jpg")', { device: "fit" });
    assert.equal(r.diagnostics[0].message, "asset 'team.jpg' not found (searched (no asset paths))");
  });

  it("passes remote and data:image references through", () => {
    for (const ref of ["https://x.test/a.png", "//x.test/a.png", "data:image/png;base64,AAAA"]) {
      assert.ok(core.render(`Image("${ref}")`, { device: "fit" }).html.includes(`src="${ref}"`), ref);
    }
  });
});

describe("stylesheet", () => {
  it("includes each pack's ancestors once", () => {
    const css = core.stylesheet(["android"], { minify: false });
    assert.ok(css.includes("/* mockitdown pack: base */"));
    assert.ok(css.includes("/* mockitdown pack: android */"));
    assert.equal(css.split("/* mockitdown pack: base */").length, 2);
  });
});

describe("anchor prefix (R-ANN-003.C5)", () => {
  it("is the SHA-1 of pack id, LF and source, as UTF-8", () => {
    assert.equal(core.sha1Hex(""), "da39a3ee5e6b4b0d3255bfef95601890afd80709");
    assert.equal(core.sha1Hex("abc"), "a9993e364706816aba3e25717850c26c9cd0d89d");
    assert.equal(core.sha1Hex("a".repeat(1000)), "291e9a6c66994949b57ba5e650361e98fc36b1ba");
    assert.equal(core.anchorPrefix("base", 'Text("é😀")'), "a20633");
  });
});

describe("icons", () => {
  it("resolves framework names as the Python table does", () => {
    assert.equal(core.resolveIcon("ChevronRight24Regular"), "chevron.right");
    assert.equal(core.resolveIcon("more_vert"), "ellipsis.vertical");
    assert.equal(core.resolveIcon("sap-icon://add"), "plus");
    assert.equal(core.resolveIcon("nothing-here-x"), null);
    assert.equal(core.normalizeIconName("nothing-here-x"), "nothing.here.x");
  });
});

describe("Python number formatting", () => {
  const { pyFixed, pyFormatG, pyRound, pyRoundTo } = core.pyformat;
  it("rounds exact ties to even on the binary value", () => {
    assert.equal(pyFixed(0.125, 2), "0.12");
    assert.equal(pyFixed(0.375, 2), "0.38");
    assert.equal(pyFixed(2.675, 2), "2.67");
    assert.equal(pyFixed(-0.04, 1), "-0.0");
    assert.equal(pyFixed(9.96, 1), "10.0");
    assert.equal(pyRound(2.5), 2);
    assert.equal(pyRound(3.5), 4);
    assert.equal(pyRoundTo(2.675, 2), 2.67);
  });
  it("formats %g as Python does", () => {
    assert.equal(pyFormatG(1234565), "1.23456e+06");
    assert.equal(pyFormatG(999999.5), "1e+06");
    assert.equal(pyFormatG(0.0001), "0.0001");
    assert.equal(pyFormatG(0.00001), "1e-05");
    assert.equal(pyFormatG(2.5), "2.5");
  });
});

describe("positional arguments and presentations alone (R-PACK-011.C3, R-DEV-008.C5)", () => {
  it("a positional argument takes its parameter's alias (R-PACK-011 TC-1)", () => {
    const positional = core.render('Dialog("Edit") { Text("x") }', { pack: "prime", device: "fit" }).html;
    const labelled = core.render('Dialog(header: "Edit") { Text("x") }', { pack: "prime", device: "fit" }).html;
    assert.equal(positional, labelled);
    assert.match(positional, /<span class="mkd-dialog__title">Edit<\/span>/);
  });

  it("a tooltip without content anchors a placeholder button, with an arrow in its bubble", () => {
    const html = core.render('Tooltip("Copied")', { pack: "base", device: "fit" }).html;
    assert.match(html, /<span class="mkd-tooltip__anchor"><span class="mkd-button" data-placeholder="true" role="button">/);
    assert.match(html, /<span class="mkd-tooltip__bubble" data-placement="top" role="tooltip"><span class="mkd-tooltip__arrow"><\/span>/);
  });
});
