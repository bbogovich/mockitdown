// IT-14: the `mockitdown-mockup` element (R-WEB-002) in a browser. The tests run on
// pages/mockup.html (which loads dist/mockitdown.js) and mount their own elements in #fixture.
//
// The shadow root's HTML is compared after both sides went through the browser's HTML serializer
// (a <template> round trip), so attribute quoting and entity spelling do not matter — the markup does.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const PYTHON_MARKUP = readFileSync(new URL("./fixtures/markup-characters.html", import.meta.url), "utf8").replace(/\n$/, "");
const MARKUP_SOURCE = 'import SwiftUI\nVStack {\n  Text("a < b && c > d")\n  Button("<Save & Close>") {}\n}';

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/pages/mockup.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  return errors;
}

/** Mount `<mockitdown-mockup>` elements from HTML in #fixture and wait for their first render. */
async function mount(page, html) {
  await page.evaluate(async (markup) => {
    const fixture = document.getElementById("fixture");
    fixture.innerHTML = markup;
    await Promise.all([...fixture.querySelectorAll("mockitdown-mockup")].map((el) => el.rendered));
  }, html);
}

/** The shadow HTML of the n-th fixture element, normalised through the HTML serializer. */
function shadowHtml(page, n = 0) {
  return page.evaluate((i) => {
    const el = document.querySelectorAll("#fixture mockitdown-mockup")[i];
    const t = document.createElement("template");
    t.innerHTML = el.shadowRoot.innerHTML;
    return t.innerHTML;
  }, n);
}

function normalised(page, html) {
  return page.evaluate((h) => {
    const t = document.createElement("template");
    t.innerHTML = h;
    return t.innerHTML;
  }, html);
}

test("the package entry defines mockitdown-mockup, and every element tag starts with mockitdown- (C1)", async ({ page }) => {
  const errors = await open(page);
  const defined = await page.evaluate(async () => {
    const mod = await import("../dist/mockitdown.js");
    return { mockup: customElements.get("mockitdown-mockup") === mod.MockupElement, tags: mod.ELEMENT_TAGS };
  });
  expect(defined.mockup).toBe(true);
  expect(defined.tags.length).toBeGreaterThan(0);
  for (const tag of defined.tags) expect(tag.startsWith("mockitdown-")).toBe(true);
  expect(errors).toEqual([]);
});

test("TC-1: a script child with < > & renders verbatim, equal to the Python output (C2, C4, V1)", async ({ page }) => {
  await open(page);
  await mount(page, `<mockitdown-mockup>
      <p>ignored</p>
      <script type="text/mockitdown">
        import SwiftUI
        VStack {
          Text("a < b && c > d")
          Button("<Save & Close>") {}
        }
      </script>
      <script type="text/other">Text("ignored")</script>
    </mockitdown-mockup>`);
  const code = await page.evaluate(() => document.querySelector("#fixture mockitdown-mockup").code);
  expect(code).toBe(MARKUP_SOURCE);
  // the Python variant's HTML for this source, and the core's render() in the page, agree with the shadow root
  expect(await shadowHtml(page)).toBe(await normalised(page, PYTHON_MARKUP));
  const viaCore = await page.evaluate(async (src) => (await import("../dist/mockitdown.js")).render(src, {}).html, MARKUP_SOURCE);
  expect(await shadowHtml(page)).toBe(await normalised(page, viaCore));
  const text = page.locator("#fixture mockitdown-mockup .mkd-text");
  await expect(text).toHaveText("a < b && c > d");
  await expect(page.locator("#fixture mockitdown-mockup .mkd-button__label")).toHaveText("<Save & Close>");
  // the light-DOM children are not rendered (no slot), the pack stylesheet is in the shadow root
  await expect(page.locator("#fixture mockitdown-mockup > p")).toBeHidden();
  const styled = await page.evaluate(() => {
    const el = document.querySelector("#fixture mockitdown-mockup");
    const sheets = [...el.shadowRoot.adoptedStyleSheets, ...[...el.shadowRoot.querySelectorAll("style")].map((s) => s.sheet)];
    const frame = el.shadowRoot.querySelector(".mkd-frame");
    return { rules: sheets.reduce((n, s) => n + s.cssRules.length, 0), width: frame.getBoundingClientRect().width,
      display: getComputedStyle(el.shadowRoot.querySelector(".mkd-figure")).display };
  });
  expect(styled.rules).toBeGreaterThan(100);
  expect(styled.width).toBeGreaterThan(100);
  expect(styled.display).toBe("block");
});

for (const name of ["role-text-text", "appearance-both-swiftui", "chrome-android", "import-component", "diag-unknown-element"]) {
  test(`conformance case ${name}: the element's shadow HTML equals <name>.html (V1)`, async ({ page }) => {
    await open(page);
    const [source, options, expected] = await page.evaluate(async (n) => {
      const get = async (ext) => (await fetch(`../shared/conformance/${n}${ext}`)).text();
      return [await get(".mockitdown"), JSON.parse(await get(".json")), await get(".html")];
    }, name);
    const attrs = Object.entries(options).map(([k, v]) => ` ${k}="${String(v)}"`).join("");
    await page.evaluate(async ([src, a]) => {
      const fixture = document.getElementById("fixture");
      fixture.innerHTML = `<mockitdown-mockup import-base="../shared/conformance/"${a}><script type="text/mockitdown"></script></mockitdown-mockup>`;
      const el = fixture.firstElementChild;
      el.querySelector("script").textContent = src;
      await el.rendered;
    }, [source, attrs]);
    expect(await shadowHtml(page)).toBe(await normalised(page, expected.replace(/\n$/, "")));
  });
}

test("TC-2: changing pack, then the script text, re-renders; rendered resolves after each (C5, C8)", async ({ page }) => {
  await open(page);
  await mount(page, `<mockitdown-mockup device="fit"><script type="text/mockitdown">Button("One") {}</script></mockitdown-mockup>`);
  const el = page.locator("#fixture mockitdown-mockup");
  await expect(el.locator(".mkd-figure")).toHaveAttribute("data-pack", "base");

  const afterPack = await page.evaluate(async () => {
    const m = document.querySelector("#fixture mockitdown-mockup");
    m.setAttribute("pack", "mui");
    await m.rendered;
    return m.shadowRoot.querySelector(".mkd-figure").dataset.pack;
  });
  expect(afterPack).toBe("mui");

  const afterText = await page.evaluate(async () => {
    const m = document.querySelector("#fixture mockitdown-mockup");
    m.querySelector("script").textContent = 'Button("Two") {}';
    await m.rendered;
    return m.shadowRoot.querySelector(".mkd-button__label").textContent;
  });
  expect(afterText).toBe("Two");

  const afterCode = await page.evaluate(async () => {
    const m = document.querySelector("#fixture mockitdown-mockup");
    m.code = 'Text("</script> by script")';
    await m.rendered;
    return [m.code, m.shadowRoot.querySelector(".mkd-text").textContent, m.diagnostics.length];
  });
  expect(afterCode).toEqual(['Text("</script> by script")', "</script> by script", 0]);

  // an element without a script child gets one when code is set
  const created = await page.evaluate(async () => {
    const m = document.createElement("mockitdown-mockup");
    document.getElementById("fixture").append(m);
    m.code = 'Text("made")';
    await m.rendered;
    return [m.querySelectorAll('script[type="text/mockitdown"]').length, m.shadowRoot.querySelector(".mkd-text").textContent];
  });
  expect(created).toEqual([1, "made"]);
});

test("TC-3: one invalid and one valid element — error box in the first, the second renders, one event (C6, C7)", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(async () => {
    const events = [];
    document.addEventListener("mockitdown-diagnostics", (e) => events.push({ id: e.target.id, detail: e.detail.diagnostics.map((d) => d.toJSON()), composed: e.composed }));
    const fixture = document.getElementById("fixture");
    fixture.innerHTML = `
      <mockitdown-mockup id="bad" width="wide"><script type="text/mockitdown">VStack { Text("open"</script></mockitdown-mockup>
      <mockitdown-mockup id="good" caption="false"><script type="text/mockitdown">Text("fine")</script></mockitdown-mockup>`;
    const [bad, good] = fixture.querySelectorAll("mockitdown-mockup");
    await Promise.all([bad.rendered, good.rendered]);
    return {
      events,
      badBox: bad.shadowRoot.querySelectorAll(".mkd-error").length,
      badItems: [...bad.shadowRoot.querySelectorAll(".mkd-error li")].map((li) => li.textContent),
      badDiagnostics: bad.diagnostics.map((d) => d.code),
      goodText: good.shadowRoot.querySelector(".mkd-text")?.textContent,
      goodDiagnostics: good.diagnostics.length,
      boxColor: getComputedStyle(bad.shadowRoot.querySelector(".mkd-error")).borderLeftStyle,
    };
  });
  expect(result.events.length).toBe(1);
  expect(result.events[0].id).toBe("bad");
  expect(result.events[0].composed).toBe(true);
  expect(result.badDiagnostics).toEqual(["syntax", "fence"]);
  expect(result.events[0].detail.map((d) => d.code)).toEqual(["syntax", "fence"]);
  // as the Python fence: the fence errors' box above the render's own error box
  expect(result.badBox).toBe(2);
  expect(result.badItems.some((t) => t.includes("width='wide' is not a valid int"))).toBe(true);
  expect(result.goodText).toBe("fine");
  expect(result.goodDiagnostics).toBe(0);
  expect(result.boxColor).not.toBe("");
});

test("an exception in one element does not stop the others (C7)", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(async () => {
    const fixture = document.getElementById("fixture");
    fixture.innerHTML = `
      <mockitdown-mockup id="a"><script type="text/mockitdown">Text("a")</script></mockitdown-mockup>
      <mockitdown-mockup id="b"><script type="text/mockitdown">Text("b")</script></mockitdown-mockup>`;
    const [a, b] = fixture.querySelectorAll("mockitdown-mockup");
    // a listener that throws on a's event must not affect b
    a.addEventListener("mockitdown-diagnostics", () => { throw new Error("listener"); });
    a.code = 'Text("a")\nFoo()';
    await Promise.all([a.rendered, b.rendered]);
    return [a.diagnostics.length > 0, b.shadowRoot.querySelector(".mkd-text").textContent];
  });
  expect(result).toEqual([true, "b"]);
});

test("boolean attributes: present without a value means true; unknown attributes are ignored (C3)", async ({ page }) => {
  await open(page);
  await mount(page, `<mockitdown-mockup elements source class="x" data-k="1" title="Shown"><script type="text/mockitdown">Text("t").id("t1")</script></mockitdown-mockup>`);
  const got = await page.evaluate(() => {
    const m = document.querySelector("#fixture mockitdown-mockup");
    return { table: !!m.shadowRoot.querySelector(".mkd-elements"), source: !!m.shadowRoot.querySelector("details.mkd-source"),
      caption: m.shadowRoot.querySelector(".mkd-caption")?.textContent, diagnostics: m.diagnostics.length };
  });
  expect(got).toEqual({ table: true, source: true, caption: "Shown", diagnostics: 0 });
});

test("asset-base resolves local images against a URL (C3)", async ({ page }) => {
  await open(page);
  await mount(page, `<mockitdown-mockup asset-base="../shared/img"><script type="text/mockitdown">Image("team.jpg")</script></mockitdown-mockup>`);
  const src = await page.evaluate(() => document.querySelector("#fixture mockitdown-mockup").shadowRoot.querySelector("img")?.getAttribute("src"));
  expect(src).toBe(new URL("/shared/img/team.jpg", page.url()).href);
});

test("when the shared assets cannot load, each element shows an error box of code element (C12)", async ({ page }) => {
  await page.route("**/dist/shared/manifest.json", (route) => route.fulfill({ status: 500, body: "no" }));
  await page.goto("/pages/mockup.html");
  await page.waitForFunction(() => window.mockitdownDemo === "rendered");
  const got = await page.evaluate(() => [...document.querySelectorAll("main mockitdown-mockup")].map((m) => [
    m.diagnostics.map((d) => d.code).join(","), m.shadowRoot.querySelector(".mkd-error li")?.textContent ?? ""]));
  expect(got.length).toBeGreaterThan(2);
  for (const [codes, text] of got) {
    expect(codes).toBe("element");
    expect(text).toMatch(/manifest\.json \(HTTP 500\)/);
  }
});

test("the demo page renders its mockups without page errors", async ({ page }) => {
  const errors = await open(page);
  const count = await page.locator("main mockitdown-mockup").count();
  expect(count).toBeGreaterThan(2);
  const empty = await page.evaluate(() => [...document.querySelectorAll("main mockitdown-mockup")].filter((m) => !m.shadowRoot.querySelector(".mkd-figure, .mkd-error")).length);
  expect(empty).toBe(0);
  expect(errors).toEqual([]);
  await page.goto("/");
  await expect(page.locator('a[href="pages/mockup.html"]')).toHaveText("Mockup element");
});
