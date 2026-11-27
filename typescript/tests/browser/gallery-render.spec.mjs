// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
// Geometry of presentations, message bubbles, shapes, charts and SwiftUI containers (R-DEV-008, R-REND-013, R-REND-014, R-PACK-013, R-PACK-015).
import { expect, test } from "@playwright/test";
import { inspectMockups, inspectShapes, mountMockups } from "./geometry.mjs";
import { open, PACKS, REFERENCES } from "./gallery-helpers.mjs";

const PRESENTING = ["Alert", "Dialog", "Sheet", "Popover", "Toast", "Tooltip", "ConfirmationDialog"];

// R-DEV-008 TC-1 (C1–C3, C6) and TC-2 (C4, C5): each presenting element alone at fit, in every pack.
test("R-DEV-008 TC-1/TC-2: presentations alone at fit are drawn whole in every pack", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page);
  const mockups = PACKS.flatMap((id) => REFERENCES[id].elements
    .filter((e) => PRESENTING.includes(e.name) && ["dialog", "toast", "tooltip"].includes(e.role))
    .map((e) => ({
      code: e.role === "toast" ? `${e.name}("Message")` : `${e.name}("Title") { Text("Content"); Button("Action") }`,
      label: `${id} ${e.name}`, attrs: { pack: id, device: "fit", caption: "false" },
    })));
  expect(mockups.length).toBeGreaterThan(PACKS.length * 4);
  await page.evaluate(mountMockups, { id: "alone", width: 900, mockups });
  expect(await page.evaluate(inspectMockups, { selector: "#alone mockitdown-mockup" })).toEqual([]);
  // A tooltip without content still shows an anchor (a placeholder button).
  await page.evaluate(mountMockups, { id: "alone", width: 900, mockups: PACKS.map((id) => (
    { code: 'Tooltip("Copied")', label: `${id} Tooltip alone`, attrs: { pack: id, device: "fit", caption: "false" } })) });
  expect(await page.evaluate(inspectMockups, { selector: "#alone mockitdown-mockup" })).toEqual([]);
  expect(errors).toEqual([]);
});

// R-DEV-008.V1: eight captioned toggles at fit in a 300-pixel host keep their natural width; the host scrolls.
test("R-DEV-008 V1: a fit row of eight toggles in a 300 px host keeps its width and scrolls", async ({ page }) => {
  const errors = await open(page);
  const code = `HStack(alignment: .top, spacing: 16) {\n${Array.from({ length: 8 }, (_, i) =>
    `  VStack(alignment: .leading, spacing: 4) { Toggle("Label"); Text("variant ${i + 1}").font(.caption) }`).join("\n")}\n}`;
  await page.evaluate(mountMockups, { id: "narrow", width: 300,
    mockups: PACKS.map((id) => ({ code, label: `${id} toggles`, attrs: { pack: id, device: "fit", caption: "false" } })) });
  const rows = await page.$$eval("#narrow mockitdown-mockup", (els) => els.map((m) => {
    const frame = m.shadowRoot.querySelector(".mkd-frame");
    const cell = frame.closest(".mkd-cell");
    return { label: m.dataset.label, width: frame.getBoundingClientRect().width, scroll: frame.scrollWidth,
      client: frame.clientWidth, cellScrolls: cell.scrollWidth > cell.clientWidth };
  }));
  for (const r of rows) {
    expect(r.scroll, `${r.label}: frame keeps its content width`).toBeLessThanOrEqual(r.client + 1);
    expect(r.width, `${r.label}: frame wider than the host`).toBeGreaterThan(300);
    expect(r.cellScrolls, `${r.label}: the host scrolls`).toBe(true);
  }
  expect(await page.evaluate(inspectMockups, { selector: "#narrow mockitdown-mockup", presentations: false, fit: false })).toEqual([]);
  expect(errors).toEqual([]);
});

// R-REND-013 TC-2 (C4): a long message wraps inside its bubble, the bubble at most 75% of its container.
test("R-REND-013 TC-2: MessageBubble with a 40-word text wraps inside the bubble in every pack", async ({ page }) => {
  const errors = await open(page);
  const words = Array.from({ length: 40 }, (_, i) => ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur"][i % 6]).join(" ");
  const mockups = PACKS.flatMap((id) => [
    { code: `MessageBubble("${words}")`, label: `${id} fit`, attrs: { pack: id, device: "fit", caption: "false" } },
    { code: 'MessageBubble("Text")', label: `${id} fit, one word`, attrs: { pack: id, device: "fit", caption: "false" } },
    { code: `MessageBubble("${words}")`, label: `${id} phone`, attrs: { pack: id, device: "phone", width: "320", height: "400", caption: "false" } },
  ]);
  await page.evaluate(mountMockups, { id: "bubbles", width: 900, mockups });
  const problems = await page.$$eval("#bubbles mockitdown-mockup", (els) => els.flatMap((m) => {
    const out = [];
    const message = m.shadowRoot.querySelector(".mkd-message");
    const bubble = message?.querySelector(".mkd-message__bubble");
    if (!bubble) return [`${m.dataset.label}: no bubble`];
    const b = bubble.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(bubble);
    for (const line of range.getClientRects()) {
      if (line.left < b.left - 1 || line.right > b.right + 1 || line.top < b.top - 1 || line.bottom > b.bottom + 1) {
        out.push(`${m.dataset.label}: a line of text (${Math.round(line.left)}–${Math.round(line.right)}) leaves the bubble (${Math.round(b.left)}–${Math.round(b.right)})`);
        break;
      }
    }
    const container = message.getBoundingClientRect().width;
    if (b.width > container * 0.75 + 1) out.push(`${m.dataset.label}: bubble ${Math.round(b.width)} px is wider than 75% of ${Math.round(container)} px`);
    return out;
  }));
  expect(problems).toEqual([]);
  expect(errors).toEqual([]);
});

// R-REND-014 TC-1 (C1–C4, V1): circle, ellipse, capsule and rounded rectangle in a 160 × 96 frame, and a
// frameless circle in a 200 × 80 row, in every shipped pack.
test("R-REND-014 TC-1: shapes keep their frame; a circle is a centred circle, an ellipse never a capsule", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page);
  const SHAPES = [
    ["circle", "Circle().frame(width: 160, height: 96)", "160×96"],
    ["ellipse", "Ellipse().frame(width: 160, height: 96)", "160×96"],
    ["capsule", "Capsule().frame(width: 160, height: 96)", "160×96"],
    ["rounded", "RoundedRectangle(cornerRadius: 12).frame(width: 160, height: 96)", "160×96"],
    ["stroked circle", "Circle().stroke(Color.red, lineWidth: 2).frame(width: 160, height: 96)", "160×96"],
  ];
  const mockups = PACKS.flatMap((id) => SHAPES.map(([what, code]) => ({ code, label: `${id} ${what}`, attrs: { pack: id, device: "fit", caption: "false" } })));
  await page.evaluate(mountMockups, { id: "shapes", width: 900, mockups });
  await page.$$eval("#shapes mockitdown-mockup", (els, frames) => els.forEach((m, i) => { m.dataset.frame = frames[i % frames.length]; }),
    SHAPES.map((s) => s[2]));
  expect(await page.evaluate(inspectShapes, { selector: "#shapes mockitdown-mockup" })).toEqual([]);
  // C3: a circle without a frame fills the shorter side of the space offered.
  const free = await page.evaluate(async (packs) => {
    const host = document.createElement("div");
    host.id = "free-circle";
    document.body.append(host);
    const out = [];
    for (const pack of packs) {
      const el = document.createElement("mockitdown-mockup");
      el.setAttribute("pack", pack);
      el.setAttribute("device", "fit");
      el.setAttribute("caption", "false");
      el.code = "HStack { Circle() }.frame(width: 200, height: 80)";
      host.append(el);
      await el.rendered;
      const shape = el.shadowRoot.querySelector(".mkd-shape");
      const stack = el.shadowRoot.querySelector(".mkd-hstack").getBoundingClientRect();
      const before = getComputedStyle(shape, "::before");
      const d = Math.min(stack.width, stack.height);
      if (Math.abs(parseFloat(before.width) - d) > 1.5 || Math.abs(parseFloat(before.height) - d) > 1.5) {
        out.push(`${pack}: frameless circle ${before.width}×${before.height} in a ${stack.width}×${stack.height} row`);
      }
    }
    host.remove();
    return out;
  }, PACKS);
  expect(free).toEqual([]);
  expect(errors).toEqual([]);
});

// R-PACK-013 TC-2 (C3): every chart card of the base gallery draws at least one mark from its declared data.
test("R-PACK-013 TC-2: every base chart sample draws at least one mark", async ({ page }) => {
  const errors = await open(page, "#pack=base");
  await page.evaluate(() => window.packGallery.renderAll());
  const charts = REFERENCES.base.elements.filter((e) => e.role === "chart").map((e) => e.name);
  expect(charts.length).toBeGreaterThan(10);
  const marks = await page.evaluate((names) => names.map((name) => {
    const m = document.querySelector(`.element[data-name="${name}"] mockitdown-mockup`);
    const svg = m?.shadowRoot.querySelector("svg.mkd-chart__svg");
    const drawn = svg ? [...svg.querySelectorAll("circle, rect, path, polygon, polyline")]
      .filter((el) => !/mkd-chart__(grid|axis|track)/.test(el.getAttribute("class") || "")) : [];
    return [name, drawn.length];
  }), charts);
  expect(marks.filter(([, n]) => n < 1).map(([name]) => name)).toEqual([]);
  expect(errors).toEqual([]);
});

// R-PACK-015 TC-1 (C1–C5) and TC-2 (C6–C8): SwiftUI presentations and navigation containers at fit, from the
// declared samples; boxes measured in the shadow roots.
test("R-PACK-015 TC-1/TC-2: SwiftUI presentations and navigation containers at fit", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page, "#pack=swiftui");
  const sample = (n) => REFERENCES.swiftui.elements.find((e) => e.name === n).sample;
  const fit = { pack: "swiftui", device: "fit", caption: "false" };
  const cases = {
    alert2: sample("Alert"),
    alert3: 'Alert("Save changes?") { Text("Unsaved edits."); Button("Save"); Button("Don\'t Save", role: .destructive); Button("Cancel", role: .cancel) }',
    confirm: sample("ConfirmationDialog"),
    popover: sample("Popover"),
    sheet: sample("Sheet"),
    tab: 'Tab("Search", systemImage: "magnifyingglass") { Text("Find") }',
    tabview: sample("TabView"),
    page: `${sample("TabView")}.tabViewStyle(.page)`,
    split: sample("NavigationSplitView"),
    prominent: `${sample("NavigationSplitView")}.navigationSplitViewStyle(.prominentDetail)`,
  };
  const mockups = [...Object.entries(cases).map(([label, code]) => ({ code, label, attrs: fit })),
    { code: `${sample("TabView")}.tabViewStyle(.sidebarAdaptable)`, label: "sidebarAdaptable", attrs: { ...fit, device: "tablet" } }];
  await page.evaluate(mountMockups, { id: "present", width: 1400, mockups });
  expect(await page.evaluate(inspectMockups, { selector: "#present mockitdown-mockup" })).toEqual([]);
  const m = await page.evaluate(() => {
    const out = {};
    for (const el of document.querySelectorAll("#present mockitdown-mockup")) {
      const r = el.shadowRoot;
      const q = (s) => r.querySelector(s);
      const b = (s) => { const e = q(s); if (!e) return null; const x = e.getBoundingClientRect(); return { l: x.left, r: x.right, t: x.top, b: x.bottom, w: x.width, h: x.height }; };
      const all = (s) => [...r.querySelectorAll(s)].map((e) => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, w: x.width }; });
      out[el.dataset.label] = {
        dialog: b(".mkd-dialog"), actions: all(".mkd-dialog__actions > .mkd-button"),
        radius: q(".mkd-dialog") ? getComputedStyle(q(".mkd-dialog")).borderTopLeftRadius : null,
        cancel: b('.mkd-dialog__actions > [data-role="cancel"]'), rows: b('.mkd-dialog__actions > :not([data-role="cancel"])'),
        arrow: b(".mkd-dialog__arrow"), anchor: b(".mkd-popover__anchor"),
        frame: b(".mkd-frame"), panel: b(".mkd-tabs__panel"), bar: b(".mkd-tabs__bar"), tabs: all(".mkd-tabs__tab"),
        pill: q('.mkd-tabs__tab[aria-selected="true"]') ? getComputedStyle(q('.mkd-tabs__tab[aria-selected="true"]')).backgroundColor : null,
        split: b(".mkd-split"), sidebar: b('[data-col="sidebar"]'), detail: b('[data-col="detail"]'),
        title: q(".mkd-split__title")?.textContent ?? null,
      };
    }
    return out;
  });
  // C1: about 300 wide, 34-point corners, two capsules side by side, three stacked
  expect(m.alert2.dialog.w).toBeGreaterThan(280);
  expect(m.alert2.radius).toBe("34px");
  expect(m.alert2.actions[0].t).toBe(m.alert2.actions[1].t);
  expect(new Set(m.alert3.actions.map((a) => a.t)).size).toBe(3);
  // C2: the cancel action set apart below the rows
  expect(m.confirm.cancel.t).toBeGreaterThan(m.confirm.rows.b);
  // C3: the arrow between the anchor and the bubble, pointing up
  expect(m.popover.arrow.t).toBeGreaterThanOrEqual(m.popover.anchor.b - 1);
  expect(m.popover.arrow.b).toBeLessThanOrEqual(m.popover.dialog.t + 1);
  // C5: one tab item in the bar
  expect(m.tab.tabs.length).toBe(1);
  // C6: the content above the bar at fit; the selected item's pill; page dots below the content
  expect(m.tabview.panel.b).toBeLessThanOrEqual(m.tabview.bar.t + 1);
  expect(m.tabview.pill).not.toBe("rgba(0, 0, 0, 0)");
  expect(m.page.bar.t).toBeGreaterThanOrEqual(m.page.panel.b - 1);
  expect(m.page.bar.h).toBeLessThan(30);
  // C6: .sidebarAdaptable on a tablet: the tabs as a column beside the content
  expect(m.sidebarAdaptable.tabs[1].t).toBeGreaterThan(m.sidebarAdaptable.tabs[0].t);
  expect(m.sidebarAdaptable.panel.l).toBeGreaterThanOrEqual(m.sidebarAdaptable.bar.r - 1);
  // C7, C8, V1: at least 640 × 360, sidebar titled Mail beside the detail; .prominentDetail spans the frame
  expect(m.split.split.w).toBeGreaterThanOrEqual(640);
  expect(m.split.split.h).toBeGreaterThanOrEqual(360);
  expect(m.split.title).toBe("Mail");
  expect(m.split.detail.l).toBeGreaterThanOrEqual(m.split.sidebar.r - 1);
  expect(m.prominent.detail.w).toBeGreaterThanOrEqual(m.prominent.split.w - 1);
  expect(errors).toEqual([]);
});
