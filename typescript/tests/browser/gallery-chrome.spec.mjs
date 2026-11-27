// IT-15: the pack gallery (R-WEB-004) in a browser. pages/packs.html renders lazily; the tests use
// the page's `window.packGallery` hooks to select a pack and to render every mockup of it at once.
// SwiftUI chrome per form and the macOS menu bar (R-DEV-010, R-DEV-009).
import { expect, test } from "@playwright/test";
import { inspectMockups, mountMockups } from "./geometry.mjs";
import { open, REFERENCES } from "./gallery-helpers.mjs";

// R-DEV-010 TC-1 (C1–C3, C5, C6) and TC-2 (C4): the same NavigationSplitView source at phone, tablet (also
// windowed) and desktop; the floating sidebars, the lights over the macOS sidebar, the window inset over the
// wallpaper and the collapsed stack on a phone, measured in the shadow roots.
test("R-DEV-010 TC-1/TC-2: SwiftUI chrome per form, floating sidebars and the windowed iPad app", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page, "#pack=swiftui");
  const split = REFERENCES.swiftui.elements.find((e) => e.name === "NavigationSplitView").sample;
  const mockups = [
    { code: split, label: "phone", attrs: { pack: "swiftui", device: "phone", caption: "false" } },
    { code: split, label: "tablet", attrs: { pack: "swiftui", device: "tablet", caption: "false" } },
    { code: split, label: "windowed", attrs: { pack: "swiftui", device: "tablet", windowed: "true", caption: "false" } },
    { code: split, label: "desktop", attrs: { pack: "swiftui", device: "desktop", caption: "false" } },
    { code: 'Form { Section("Account") { TextField("Name", text: "Ana") } }', label: "form", attrs: { pack: "swiftui", device: "desktop", caption: "false" } },
  ];
  await page.evaluate(mountMockups, { id: "platforms", width: 1400, mockups });
  expect(await page.evaluate(inspectMockups, { selector: "#platforms mockitdown-mockup", presentations: false })).toEqual([]);
  const m = await page.evaluate(() => {
    const out = {};
    for (const el of document.querySelectorAll("#platforms mockitdown-mockup")) {
      const r = el.shadowRoot;
      const b = (s) => {
        const e = r.querySelector(s);
        if (!e || getComputedStyle(e).display === "none") return null;
        const x = e.getBoundingClientRect();
        return { l: x.left, r: x.right, t: x.top, b: x.bottom, w: x.width, h: x.height };
      };
      const frame = r.querySelector(".mkd-frame");
      out[el.dataset.label] = {
        frame: b(".mkd-frame"), screen: b(".mkd-screen"), sidebar: b('[data-col="sidebar"]'), detail: b('[data-col="detail"]'),
        toggle: b(".mkd-split__toggle"), lights: b(".mkd-chrome__lights"), home: b(".mkd-chrome--home"),
        title: b('[data-col="sidebar"] .mkd-split__title'), control: b(".mkd-form .mkd-field__control"),
        unit: frame.getBoundingClientRect().width / Number(getComputedStyle(frame).getPropertyValue("--mkd-w")),
        radius: getComputedStyle(frame).borderTopLeftRadius,
      };
    }
    return out;
  });
  // C5: on a phone the split view collapses to its sidebar, as wide as the screen; the detail is not shown
  expect(m.phone.detail).toBeNull();
  expect(m.phone.sidebar.w).toBeGreaterThanOrEqual(m.phone.screen.w - 1);
  expect(m.phone.home).not.toBeNull();
  // C6: on a tablet the sidebar floats inset in the screen, holding the toggle and the title; a home indicator
  for (const k of ["tablet", "desktop"]) {
    const { sidebar, screen, detail, toggle } = m[k];
    expect(sidebar.l).toBeGreaterThan(screen.l + 4 * m[k].unit);
    expect(sidebar.t).toBeGreaterThan(screen.t + 4 * m[k].unit);
    expect(sidebar.b).toBeLessThan(screen.b - 4 * m[k].unit);
    expect(detail.l).toBeGreaterThanOrEqual(sidebar.r - 1);
    expect(toggle.l).toBeGreaterThanOrEqual(sidebar.l);
    expect(toggle.r).toBeLessThanOrEqual(sidebar.r);
    expect(toggle.t).toBeGreaterThanOrEqual(sidebar.t - 1);
  }
  expect(m.tablet.title.t).toBeGreaterThan(m.tablet.sidebar.t);
  expect(m.tablet.home).not.toBeNull();
  // C2, C3: a 16-point window; the lights over the sidebar's top leading corner, the toggle beside them
  expect(parseFloat(m.desktop.radius) / m.desktop.unit).toBeCloseTo(16, 0);
  expect(m.desktop.lights.l).toBeGreaterThan(m.desktop.sidebar.l);
  expect(m.desktop.lights.t).toBeGreaterThan(m.desktop.sidebar.t);
  expect(m.desktop.lights.r).toBeLessThan(m.desktop.toggle.l);
  // the detail has no title: the sidebar's (the window's) title stands in the toolbar row beside the sidebar
  expect(m.desktop.title.l).toBeGreaterThan(m.desktop.sidebar.r);
  expect(m.desktop.title.b).toBeLessThan(m.desktop.screen.t + 52 * m.desktop.unit);
  // C4: the window inset from the frame over the wallpaper, its lights at its top leading corner
  const w = m.windowed;
  expect(w.screen.l).toBeGreaterThan(w.frame.l + 20 * w.unit);
  expect(w.screen.r).toBeLessThan(w.frame.r - 20 * w.unit);
  expect(w.lights.l).toBeGreaterThan(w.screen.l);
  expect(w.lights.t).toBeGreaterThan(w.screen.t);
  expect(w.lights.r).toBeLessThan(w.toggle.l);
  // C5: Form (automatic) on a Mac is the columns style: the field stands right of a centred label column
  expect(m.form.control.l).toBeGreaterThan(m.form.frame.l + 300 * m.form.unit);
  expect(errors).toEqual([]);
});

// R-DEV-009 TC-2 (C2, C3, C7, C9) and TC-1 in the browser: the menu bar 24 points tall across the frame, the
// window filling the frame below it with its 16-point corners, the open menu under its title over the window.
test("R-DEV-009 TC-1/TC-2: the macOS menu bar, the window under it and an open menu", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page, "#pack=swiftui");
  const split = REFERENCES.swiftui.elements.find((e) => e.name === "NavigationSplitView").sample;
  const commands = `${split}\n.commands {\n  CommandMenu("Shapes") {\n    Button("Circle").keyboardShortcut("c", modifiers: [.shift, .command])\n`
    + '    Divider()\n    Toggle("Snap to Grid", isOn: true)\n    Menu("Arrange") { Button("Bring Forward") {} }\n  }\n}';
  const mockups = [
    { code: commands, label: "file", attrs: { pack: "swiftui", device: "desktop", menubar: "File", caption: "false" } },
    { code: commands, label: "shapes", attrs: { pack: "swiftui", device: "desktop", menubar: "Shapes", app: "Draw", caption: "false" } },
    { code: split, label: "phone", attrs: { pack: "swiftui", device: "phone", menubar: "", caption: "false" } },
  ];
  await page.evaluate(mountMockups, { id: "menubar", width: 1400, mockups });
  const m = await page.evaluate(() => {
    const out = {};
    for (const el of document.querySelectorAll("#menubar mockitdown-mockup")) {
      const r = el.shadowRoot;
      const b = (s) => {
        const e = r.querySelector(s);
        if (!e || getComputedStyle(e).display === "none") return null;
        const x = e.getBoundingClientRect();
        return { l: x.left, r: x.right, t: x.top, b: x.bottom, w: x.width, h: x.height };
      };
      const frame = r.querySelector(".mkd-frame");
      const win = r.querySelector(".mkd-window");
      out[el.dataset.label] = {
        frame: b(".mkd-frame"), bar: b(".mkd-menubar"), window: b(".mkd-window"), lights: b(".mkd-chrome__lights"),
        title: b('.mkd-menubar__menu[data-open="true"] > .mkd-menubar__title'), menu: b(".mkd-menubar__dropdown"),
        key: b(".mkd-menubar__dropdown .mkd-menubar__key"), label: b(".mkd-menubar__dropdown .mkd-menubar__label"),
        clock: b(".mkd-menubar__clock"),
        unit: frame.getBoundingClientRect().width / Number(getComputedStyle(frame).getPropertyValue("--mkd-w")),
        radius: win ? getComputedStyle(win).borderTopLeftRadius : null,
        overflowing: r.querySelector(".mkd-menubar") ? r.querySelector(".mkd-menubar").scrollWidth > r.querySelector(".mkd-menubar").clientWidth + 1 : false,
      };
    }
    return out;
  });
  for (const k of ["file", "shapes"]) {
    const x = m[k];
    // C3, C9: the bar spans the frame, 24 points tall; the window fills the frame below it
    expect(x.bar.w).toBeGreaterThanOrEqual(x.frame.w - 3);
    expect(x.bar.h / x.unit).toBeCloseTo(24, 0);
    expect((x.window.t - x.frame.t) / x.unit).toBeCloseTo(24, 0);
    expect(x.window.b).toBeGreaterThanOrEqual(x.frame.b - 2);
    expect(parseFloat(x.radius) / x.unit).toBeCloseTo(16, 0);
    expect(x.lights.t).toBeGreaterThan(x.window.t);
    expect(x.clock.r).toBeLessThanOrEqual(x.frame.r);
    expect(x.overflowing).toBe(false);
    // C7: the dropdown under its title, over the window, the shortcut right of the label
    expect(x.menu.t).toBeGreaterThanOrEqual(x.title.b);
    expect(x.menu.l).toBeLessThanOrEqual(x.title.l);
    expect(x.menu.b).toBeGreaterThan(x.window.t);
    expect(x.key.l).toBeGreaterThan(x.label.r);
  }
  // C2: no bar with a phone's chrome
  expect(m.phone.bar).toBeNull();
  expect(errors).toEqual([]);
});
