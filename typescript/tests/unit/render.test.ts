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

// R-REND-014 TC-1: shape framing (the geometry is measured in the browser, gallery.spec.mjs).
describe("shape framing (R-REND-014)", () => {
  const shape = (src: string): string => {
    const r = core.render(src, { device: "fit" });
    assert.deepEqual(r.diagnostics, []);
    const m = /<div class="mkd-shape"[^>]*>/.exec(r.html);
    assert.ok(m, r.html);
    return m![0];
  };

  it("a Circle keeps its frame for layout (C1)", () => {
    const tag = shape("Circle().frame(width: 160, height: 96)");
    assert.match(tag, /data-shape="circle"/);
    assert.match(tag, /width:calc\(160 \* var\(--u\)\)/);
    assert.match(tag, /height:calc\(96 \* var\(--u\)\)/);
  });

  it("a Circle's stroke and shadow follow the circle, not the frame (C1, C4)", () => {
    const tag = shape("Circle().stroke(Color.red, lineWidth: 2).shadow(radius: 4).frame(width: 160, height: 96)");
    assert.match(tag, /--mkd-shape-stroke:calc\(2 \* var\(--u\)\) solid var\(--mkd-color-red\)/);
    assert.match(tag, /filter:drop-shadow\(/);
    assert.doesNotMatch(tag, /;border:|box-shadow/);
  });

  it("an Ellipse background is a true ellipse, a Capsule's a capsule (C2)", () => {
    assert.match(core.render('Text("A").background(Color.blue, in: Ellipse())', { device: "fit" }).html, /border-radius:50%/);
    assert.match(core.render('Text("A").background(Color.blue, in: Capsule())', { device: "fit" }).html, /border-radius:9999px/);
  });
});

// R-REND-012 TC-3: every kind draws marks from values; a chart without data warns.
describe("charts from values (R-REND-012.C6, C7)", () => {
  const KINDS: Record<string, string> = {
    BarChart: "bar", Histogram: "histogram", LineChart: "line", AreaChart: "area", ComboChart: "combo",
    Sparkline: "sparkline", PieChart: "pie", DonutChart: "donut", ScatterChart: "scatter", BubbleChart: "bubble",
    RadarChart: "radar", Heatmap: "heatmap", FunnelChart: "funnel", Treemap: "treemap", GaugeChart: "gauge",
    CandlestickChart: "candlestick",
  };
  const MARK = /<(circle|rect|path|polygon|polyline)\b(?![^>]*class="mkd-chart__(?:grid|axis|track)")[^>]*>/;
  const svg = (html: string): string => /<svg class="mkd-chart__svg".*?<\/svg>/.exec(html)?.[0] ?? "";

  it("every kind draws at least one mark from values: [3, 5, 2, 6, 4] (C6)", () => {
    for (const [element, kind] of Object.entries(KINDS)) {
      const r = core.render(`${element}(values: [3, 5, 2, 6, 4])`, { device: "fit" });
      assert.match(r.html, new RegExp(`data-kind="${kind}"`), element);
      assert.match(svg(r.html), MARK, element);
      assert.deepEqual(r.diagnostics.filter((d) => d.code === "chart"), [], element);
    }
  });

  it("scatter, bubble, heatmap and candlestick derive their marks (C6)", () => {
    const dots = svg(core.render("ScatterChart(values: [3, 5, 2, 6, 4])", { device: "fit" }).html).match(/class="mkd-chart__dot"/g);
    assert.equal(dots?.length, 5);
    const radii = [...svg(core.render("BubbleChart(values: [1, 4])", { device: "fit" }).html)
      .matchAll(/class="mkd-chart__dot"[^>]* r="([\d.]+)"/g)].map((m) => Number(m[1]));
    assert.equal(radii.length, 2);
    assert.ok(Math.abs(radii[1] / radii[0] - 2) < 0.05, `bubble radii ${radii}`);
    const cells = [...svg(core.render("Heatmap(values: [3, 5, 2, 6, 4])", { device: "fit" }).html)
      .matchAll(/<rect x="[\d.]+" y="([\d.]+)"/g)].map((m) => m[1]);
    assert.equal(cells.length, 5);
    assert.equal(new Set(cells).size, 1);
    const candles = svg(core.render("CandlestickChart(values: [3, 5, 2, 6, 4])", { device: "fit" }).html);
    assert.equal(candles.match(/class="mkd-chart__candle"/g)?.length, 4);
  });

  it("a chart without data warns with code chart and draws its axes or outline (C7)", () => {
    for (const element of Object.keys(KINDS)) {
      if (element === "GaugeChart") continue; // a gauge always has a value (its minimum by default)
      const r = core.render(`${element}()`, { device: "fit" });
      assert.ok(r.diagnostics.some((d) => d.code === "chart" && d.message === `${element} has no data`), element);
      assert.match(svg(r.html), /class="mkd-chart__(axis|grid)"/, element);
    }
    assert.deepEqual(core.render("GaugeChart()", { device: "fit" }).diagnostics.filter((d) => d.code === "chart"), []);
  });
});

// R-DEV-010 TC-1/TC-2 (IT-21): chrome per form, the macOS title bar, the sidebar toggle and the windowed iPad
// app in the TypeScript variant (geometry: gallery.spec.mjs).
describe("multi-platform chrome for SwiftUI (R-DEV-010)", () => {
  const V1 = 'NavigationSplitView {\n  List {\n    Label("Inbox", systemImage: "tray")\n  }.navigationTitle("Mail")\n} detail: {\n  Text("Select a message")\n}';
  const sw = (src: string, opts: Record<string, unknown> = {}): string => {
    const r = core.render(src, { pack: "swiftui", ...opts });
    assert.deepEqual(r.diagnostics, [], src);
    return r.html;
  };
  const frame = (html: string): string => /<div class="mkd-frame"[^>]*>/.exec(html)![0];

  it("the same split view at phone, tablet and desktop (C1, V1)", () => {
    const phone = sw(V1, { device: "phone" });
    assert.match(frame(phone), /data-chrome="ios"/);
    assert.match(phone, /mkd-chrome__island/);
    assert.match(phone, /mkd-chrome--home" data-chrome="ios"/);
    const tablet = sw(V1, { device: "tablet" });
    assert.match(frame(tablet), /data-chrome="ipados"/);
    assert.match(tablet, /9:41 Mon Nov 23/);
    assert.match(tablet, /mkd-chrome__pct">100%/);
    assert.match(tablet, /mkd-chrome--home" data-chrome="ipados"/);
    const desktop = sw(V1, { device: "desktop" });
    assert.match(frame(desktop), /data-chrome="macos" data-titlebar="unified"/);
    assert.match(desktop, /<span class="mkd-split__toggle" role="button" aria-label="Toggle Sidebar"><svg class="mkd-icon" data-icon="sidebar.left"/);
  });

  it("the macOS title bar: unified, drawn from the root's title and toolbar, or a centred title (C2)", () => {
    assert.doesNotMatch(frame(sw('VStack { Text("Hello") }', { device: "desktop" })), /data-titlebar/);
    assert.match(frame(sw('NavigationStack { Text("a").navigationTitle("Inbox") }', { device: "desktop" })), /data-titlebar="unified"/);
    assert.doesNotMatch(frame(sw('NavigationStack { Text("a") }', { device: "desktop" })), /data-titlebar/);
    const plain = sw('VStack { Text("Body") }.navigationTitle("Notes").toolbar { Button("New", systemImage: "square.and.pencil") {} }',
      { device: "desktop", title: "App" });
    assert.match(frame(plain), /data-titlebar="toolbar"/);
    assert.match(plain, /mkd-chrome__title">Notes<\/span><span class="mkd-chrome__spacer"><\/span><span class="mkd-chrome__toolbar"><span class="mkd-button"/);
    assert.doesNotMatch(frame(sw('NavigationStack { Text("a").navigationTitle("Inbox") }', { device: "tablet" })), /data-titlebar/);
  });

  it("windowed draws the iPad app window; other chrome ignores it with a warning (C4)", () => {
    const html = sw(V1, { device: "tablet", windowed: true });
    assert.match(frame(html), /data-windowed="true"/);
    assert.match(html, /<div class="mkd-chrome mkd-chrome--lights" data-chrome="ipados"><span class="mkd-chrome__lights">/);
    assert.match(frame(sw(`@Screen(windowed: true)\n${V1}`, { device: "tablet" })), /data-windowed="true"/);
    assert.doesNotMatch(frame(sw(`@Screen(windowed: true)\n${V1}`, { device: "tablet", windowed: false })), /data-windowed/);
    const mac = core.render(V1, { pack: "swiftui", device: "desktop", windowed: true });
    assert.ok(mac.diagnostics.some((d) => d.code === "chrome" && d.message === "windowed needs iPadOS chrome; ignored"));
    assert.doesNotMatch(frame(mac.html), /data-windowed/);
  });

  it("Form defaults to automatic (C5)", () => {
    assert.match(sw('Form { Toggle("On", isOn: true) }', { device: "desktop" }), /class="mkd-form" data-el="Form" data-variant="automatic"/);
  });
});
