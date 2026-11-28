// IT-45 (R-WEB-006 TC-1): the gallery home page, pages/index.html, against the development server.
// Step 1's assembled-gallery half is in tests/unit/gallery.test.ts and published.spec.mjs (R-WEB-004 TC-9).
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const INDEX = JSON.parse(readFileSync(new URL("../../../shared/reference/index.json", import.meta.url), "utf8"));
const HIDDEN = INDEX.hidden ?? [];
const NAMES = Object.fromEntries(HIDDEN.map((id) => [id,
  JSON.parse(readFileSync(new URL(`../../../shared/reference/${id}.json`, import.meta.url), "utf8")).name]));
const APPEARANCE_KEY = "mockitdown.gallery.appearance";

/** Record failed requests, console errors, page errors and every request URL of `page`. */
function watch(page) {
  const seen = { failed: [], errors: [], urls: [] };
  page.on("request", (r) => seen.urls.push(r.url()));
  page.on("requestfailed", (r) => seen.failed.push(`${r.failure()?.errorText ?? "failed"} ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) seen.failed.push(`${r.status()} ${r.url()}`); });
  page.on("console", (m) => { if (m.type() === "error") seen.errors.push(m.text()); });
  page.on("pageerror", (e) => seen.errors.push(String(e)));
  return seen;
}

async function openHome(page) {
  await page.goto("/pages/index.html");
  await page.waitForFunction(() => document.documentElement.dataset.state === "ready");
}

test("TC-1 steps 1-4: text, usage code block, release and README links, gallery links (C1-C6)", async ({ page }) => {
  const seen = watch(page);
  await openHome(page);
  expect(seen.failed, "failed requests").toEqual([]);
  expect(seen.errors, "console errors").toEqual([]);

  const text = await page.locator("main").innerText();
  for (const phrase of ["pack gallery", "TypeScript renderer", "mockitdown-mockup", "pip install mockitdown"]) {
    expect(text, phrase).toContain(phrase);
  }

  const blocks = await page.locator("pre code").allInnerTexts();
  const usage = blocks.find((b) => b.includes("loadAssetsFromUrl"));
  expect(usage, "usage code block").toBeTruthy();
  expect(usage).toContain("<mockitdown-mockup pack=");
  expect(usage).toContain('<script type="text/mockitdown">');
  expect(usage.replace(/\n$/, "").split("\n").length, "usage block lines").toBeLessThanOrEqual(15);

  const hrefs = await page.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs).toContain("https://github.com/bbogovich/mockitdown/releases");
  expect(hrefs.some((h) => h?.endsWith("typescript/README.md")), "README link").toBe(true);
  for (const h of ["packs.html", "../../definition/", "../../demos/"]) expect(hrefs, h).toContain(h);

  await page.locator('main a[href="packs.html"]').first().click();
  await page.waitForFunction(() => window.packGallery?.state === "ready");
});

test("TC-1 step 5: the last section links each hidden pack by name, opening it in the gallery (C7)", async ({ page }) => {
  expect(HIDDEN.length, "hidden packs in index.json").toBeGreaterThan(0);
  await openHome(page);
  const last = page.locator("main > section").last();
  await expect(last).toHaveId("easter-eggs");
  const links = last.locator("a");
  await expect(links).toHaveCount(HIDDEN.length);
  const got = await links.evaluateAll((as) => as.map((a) => [a.getAttribute("href"), a.textContent.trim()]));
  expect(got).toEqual(HIDDEN.map((id) => [`packs.html#pack=${id}`, NAMES[id]]));

  for (const id of HIDDEN) {
    await openHome(page);
    await page.locator(`#easter-eggs a[href="packs.html#pack=${id}"]`).click();
    await page.waitForFunction(() => window.packGallery?.state === "ready");
    expect(await page.evaluate(() => window.packGallery.pack), id).toBe(id);
    await expect(page.locator("#tab-elements article").first(), `${id}: elements`).toBeVisible();
  }
});

test("TC-1 step 6: the gallery's dark choice and a dark system scheme make the page dark; requests stay local (C8)", async ({ page, baseURL }) => {
  const seen = watch(page);
  await page.goto("/pages/packs.html");
  await page.evaluate((k) => localStorage.setItem(k, "dark"), APPEARANCE_KEY);
  await openHome(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("dark");

  await page.evaluate((k) => localStorage.removeItem(k), APPEARANCE_KEY);
  await page.emulateMedia({ colorScheme: "dark" });
  await openHome(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await openHome(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");

  const outside = seen.urls.filter((u) => !u.startsWith("data:") && !u.startsWith(baseURL));
  expect(outside, "requests outside the served root").toEqual([]);
});

test("TC-1 step 7: without index.json the text and gallery link stay and a sentence replaces the eggs (C9)", async ({ page }) => {
  await page.route("**/shared/reference/index.json", (route) => route.fulfill({ status: 404, body: "not found" }));
  await openHome(page);
  await expect(page.locator('main a[href="packs.html"]').first()).toBeVisible();
  await expect(page.locator("main")).toContainText("TypeScript renderer");
  await expect(page.locator("#easter-eggs a")).toHaveCount(0);
  await expect(page.locator("#easter-eggs")).toContainText("could not be loaded");
});

test("TC-1 step 8: a hidden pack whose reference file fails is labelled with its id; no hidden pack, a sentence (C10, C11)", async ({ page }) => {
  const [first, ...rest] = HIDDEN;
  await page.route(`**/shared/reference/${first}.json`, (route) => route.fulfill({ status: 404, body: "not found" }));
  await openHome(page);
  const got = await page.locator("#easter-eggs a").evaluateAll((as) => as.map((a) => a.textContent.trim()));
  expect(got).toEqual([first, ...rest.map((id) => NAMES[id])]);

  await page.unroute(`**/shared/reference/${first}.json`);
  await page.route("**/shared/reference/index.json", (route) => route.fulfill({ json: { groups: INDEX.groups, hidden: [] } }));
  await openHome(page);
  await expect(page.locator("#easter-eggs a")).toHaveCount(0);
  await expect(page.locator("#easter-eggs")).toContainText("None at the moment.");
});
