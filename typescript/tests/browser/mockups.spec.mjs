// IT-71 (browser part): the active mockup and inactive previews (R-TOOL-013) on pages/designer.html with
// its sample document: Sign in (pack mui, device phone; VStack > Text "Welcome back", Button "Sign in")
// and Inbox (device fit; the walking-skeleton tree), Inbox active.
//
// The expected values were written by hand before the code ran, from the sample:
//   - TC-1: a click on Sign in's frame makes it active: the outline's first rows are VStack, Text
//     "Welcome back", Button "Sign in"; the inspector shows its Mockup tab with device "phone"; Sign in's
//     frame holds the editor (a slot) and Inbox's a mockitdown-mockup. A click on Inbox's frame turns it
//     back: the outline's rows begin VStack, Text "Inbox", List; the inspector's device is "fit"; only
//     Inbox holds the editor. Choosing "Sign in" in the outline's Mockups list activates it again
//     (aria-current moves to its row); Enter on the Inbox row activates Inbox.
//   - TC-2 in the browser: session.run("duplicateMockup") adds "Inbox copy" as a frame holding the
//     editor and a Mockups row; run("deleteMockup") removes both and Inbox is active again (the copy was
//     last, so the one before it); each one Cmd/Ctrl+Z away.
// No expected value changed after the first run; the inspector's device field was first looked up by the
// key "device" and is keyed "option:device".
import { expect, test } from "@playwright/test";

const D = "#designer";

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/designer.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

/** Which frames show what: [name, active, "editor" | "mockup" | null]. */
const frames = (page) => page.evaluate(() => {
  const c = document.querySelector("#designer").canvas;
  return [...c.shadowRoot.querySelectorAll("[part=frame]")].map((f) => [
    f.dataset.mockup, f.hasAttribute("data-active"),
    f.querySelector("slot") ? "editor" : f.querySelector("mockitdown-mockup") ? "mockup" : null,
  ]);
});

/** The first outline rows as "Name label" and the inspector's tab and device once both are rendered. */
const tools = (page) => page.evaluate(async () => {
  const d = document.querySelector("#designer");
  const outline = d.shadowRoot.querySelector("mockitdown-outline");
  const inspector = d.shadowRoot.querySelector("mockitdown-inspector");
  await outline.rendered;
  await inspector.rendered;
  const root = inspector.shadowRoot;
  const device = root.querySelector('[part=field][data-key="option:device"] select');
  return {
    active: d.session.active,
    rows: outline.rows.slice(0, 3).map((r) => (r.label ? `${r.name} ${r.label}` : r.name)),
    tab: root.querySelector("[part=tab]")?.textContent ?? null,
    device: device?.value ?? null,
  };
});

const frameBody = (page, name) => page.locator(`${D} mockitdown-canvas [part="frame"][data-mockup="${name}"] > [part="body"]`);

test("TC-1: a click on a frame or a Mockups row activates its mockup; the tools follow; one editor (C1-C3, V1)", async ({ page }) => {
  const errors = await open(page);
  expect(await frames(page)).toEqual([["Sign in", false, "mockup"], ["Inbox", true, "editor"]]);

  await frameBody(page, "Sign in").click();
  await expect.poll(() => frames(page)).toEqual([["Sign in", true, "editor"], ["Inbox", false, "mockup"]]);
  expect(await tools(page)).toEqual({ active: "Sign in", rows: ["VStack", "Text Welcome back", "Button Sign in"], tab: "Mockup", device: "phone" });

  await frameBody(page, "Inbox").click();
  await expect.poll(() => frames(page)).toEqual([["Sign in", false, "mockup"], ["Inbox", true, "editor"]]);
  expect(await tools(page)).toEqual({ active: "Inbox", rows: ["VStack", "Text Inbox", "List"], tab: "Mockup", device: "fit" });

  // C1: the Mockups list.
  await page.locator(`${D} mockitdown-outline [role="tab"]`, { hasText: "Mockups" }).click();
  const rows = page.locator(`${D} mockitdown-outline [part="mockup"]`);
  await expect(rows).toHaveText(["Sign in", "Inbox"]);
  await rows.nth(0).click();
  await expect(rows.nth(0)).toHaveAttribute("aria-current", "true");
  await expect.poll(() => frames(page)).toEqual([["Sign in", true, "editor"], ["Inbox", false, "mockup"]]);
  expect((await tools(page)).rows).toEqual(["VStack", "Text Welcome back", "Button Sign in"]);
  await rows.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(rows.nth(1)).toHaveAttribute("aria-current", "true");
  expect((await tools(page)).active).toBe("Inbox");
  expect(errors).toEqual([]);
});

test("TC-2: duplicateMockup and deleteMockup on the canvas and in the Mockups list, each one undo step (C4, C5)", async ({ page }) => {
  const errors = await open(page);
  await page.locator(`${D} mockitdown-outline [role="tab"]`, { hasText: "Mockups" }).click();
  const rows = page.locator(`${D} mockitdown-outline [part="mockup"]`);

  expect(await page.evaluate(() => document.querySelector("#designer").session.run("duplicateMockup"))).toEqual({ mockup: "Inbox copy" });
  await expect(rows).toHaveText(["Sign in", "Inbox", "Inbox copy"]);
  await expect.poll(() => frames(page)).toEqual([["Sign in", false, "mockup"], ["Inbox", false, "mockup"], ["Inbox copy", true, "editor"]]);

  expect(await page.evaluate(() => document.querySelector("#designer").session.run("deleteMockup"))).toEqual({ mockup: "Inbox copy" });
  await expect(rows).toHaveText(["Sign in", "Inbox"]);
  await expect.poll(() => frames(page)).toEqual([["Sign in", false, "mockup"], ["Inbox", true, "editor"]]);

  await page.locator(`${D} mockitdown-canvas`).focus();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(rows).toHaveText(["Sign in", "Inbox", "Inbox copy"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(rows).toHaveText(["Sign in", "Inbox"]);
  await expect.poll(() => frames(page)).toEqual([["Sign in", false, "mockup"], ["Inbox", true, "editor"]]);
  expect(errors).toEqual([]);
});
