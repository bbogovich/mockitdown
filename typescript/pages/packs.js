// The pack gallery (pages/packs.html, R-WEB-004): a side panel of the packs grouped as the example
// site's Reference menu (shared/reference/index.json) and, for the selected pack, its facts above two
// tabs: Elements (a card per element of shared/reference/<pack>.json, with the name filter; the
// default) and Examples (the design patterns of shared/patterns/ in index order, with an index linking
// to each). Exactly one tab's content is shown; the other panel is `hidden`.
//
// The fragment holds both choices, `#pack=<id>&tab=elements|examples` (C5, C17): selecting a pack keeps
// the tab, reloading restores both, and an unknown tab selects Elements. A pack change is a history
// entry; a tab change replaces the current one.
//
// Mockups are created lazily: each card holds an empty slot, and a <mockitdown-mockup> replaces it
// when the slot comes near the viewport (IntersectionObserver). `window.packGallery` exposes the
// state and two hooks for the browser tests (tests/browser/gallery.spec.mjs):
//   state           "loading" | "ready" (the side panel and the first pack are built) | "failed"
//   pack            the selected pack id
//   selectedTab     the selected tab, "elements" | "examples"
//   select(id)      select a pack (updates #pack=<id>&tab=…); resolves when its cards are built
//   tab(name)       select a tab (an unknown name selects "elements"); resolves when it is shown
//   renderAll()     create every mockup of the selected pack, in both tabs, wait for all `rendered`,
//                   and resolve with {pack, elements, patterns, mockups, empty, errors}
//   source(id)      the snippet reproducing example `id` in the selected pack (snippet.js), or null
//                   when the pack does not show that example (C26)
//
// A pattern entry of shared/patterns/index.json without `packs` is a core pattern, shown for every pack;
// one with `packs` is shown only for those packs. Any entry's `device`, `chrome`, `menubar`, `app` and
// `windowed` become the mockup's attributes of the same name (R-WEB-004.C14); without them a pattern
// takes the pack's default device and chrome (C9). The complex layouts name `device: "desktop"`, so
// the phone packs show them in their desktop form.
//
// Each example has a Show source toggle (C21-C25): a block below its mockup, hidden until the toggle
// opens it, holding the snippet of snippet.js with a Copy button and a polite live region. The block is
// built with the card and only its `hidden` changes, so the mockup is never touched.

import "../dist/mockitdown.js";
import { patternAttributes, snippet } from "./snippet.js";

const REFERENCE = "../shared/reference/";
const PATTERNS = "../shared/patterns/";
const APPEARANCE_KEY = "mockitdown.gallery.appearance";
/** How long the Copy button's "Copied" announcement stays (ms). */
const COPIED_MS = 2000;
/** The main area's tabs (C16), the first the default. */
const TABS = [["elements", "Elements"], ["examples", "Examples"]];

const $ = (id) => document.getElementById(id);

/** Element with attributes and children (strings become text nodes). */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children.flat(Infinity)) if (c !== null && c !== undefined) el.append(c);
  return el;
}

const jsonCache = new Map();
function fetchJson(url) {
  if (!jsonCache.has(url)) {
    jsonCache.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
      return r.json();
    }));
  }
  return jsonCache.get(url);
}

async function loadPatterns() {
  const index = await fetchJson(PATTERNS + "index.json");
  return Promise.all(index.patterns.map(async (p) => {
    const r = await fetch(PATTERNS + p.file);
    if (!r.ok) throw new Error(`${p.file}: HTTP ${r.status}`);
    return { ...p, source: await r.text() };
  }));
}

/** A Python-style literal for a default value, as the Reference pages show it. */
function literal(v) {
  if (typeof v === "string") return JSON.stringify(v);
  if (v === true || v === false) return String(v);
  if (v === null) return "nil";
  return JSON.stringify(v);
}

// ---------------------------------------------------------------------------------------------

const gallery = {
  state: "loading",
  pack: null,
  appearance: "light",
  filter: "",
  groups: [],
  patterns: [],
  /** Selection in progress or done: {id, promise}. */
  current: null,
  observer: null,
  select,
  renderAll,
  source,
};
// The tab hook is `tab(name)` (C18); the selected tab is read as `selectedTab`.
gallery.tab = showTab;
Object.defineProperty(gallery, "selectedTab", { get: () => selectedTab, enumerable: true });
window.packGallery = gallery;

let selectedTab = "elements";
/** The filter field, moved into each pack's Elements tab. */
let filterField = null;

function packFromHash() {
  const m = /(?:^#|&)pack=([^&]+)/.exec(location.hash);
  return m ? decodeURIComponent(m[1]) : null;
}

/** The tab named in the fragment; a missing or unknown one is Elements (C17). */
function tabFromHash() {
  const m = /(?:^#|&)tab=([^&]*)/.exec(location.hash);
  return knownTab(m ? decodeURIComponent(m[1]) : null);
}

function knownTab(name) {
  return TABS.some(([id]) => id === name) ? name : TABS[0][0];
}

function hashFor(pack, tab = selectedTab) {
  return `#pack=${encodeURIComponent(pack)}&tab=${tab}`;
}

function knownPack(id) {
  return gallery.groups.some((g) => g.packs.includes(id));
}

function buildNav() {
  const nav = $("packs");
  nav.replaceChildren(...gallery.groups.map((g) => h("section", { class: "group" },
    h("h2", {}, g.title),
    h("ul", {}, g.packs.map((id) => h("li", {},
      h("a", { href: hashFor(id), dataset: { pack: id } }, h("span", {}, id), h("span", { class: "id" }, "")))))),
  ));
  // Pack names arrive with the reference files; the ids stand in until then.
  for (const g of gallery.groups) {
    for (const id of g.packs) {
      fetchJson(`${REFERENCE}${id}.json`).then((ref) => {
        const a = nav.querySelector(`a[data-pack="${CSS.escape(id)}"]`);
        if (a) { a.firstChild.textContent = ref.name; a.lastChild.textContent = id === ref.name.toLowerCase() ? "" : id; }
      }, () => {});
    }
  }
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a[data-pack]")) setMenu(false);
  });
}

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  $("menu").setAttribute("aria-expanded", String(open));
}

/** Select a pack; resolves when its cards are in the page. Re-selecting the same pack is a no-op. */
function select(id) {
  if (!knownPack(id)) id = gallery.groups[0].packs[0];
  const hash = hashFor(id);
  if (location.hash !== hash) {
    const from = packFromHash();
    if (from === null || from === id || !knownPack(from)) history.replaceState(null, "", hash);
    else location.hash = hash; // a history entry, so Back returns to the previous pack
  }
  if (gallery.current?.id === id) return gallery.current.promise;
  const promise = showPack(id);
  gallery.current = { id, promise };
  return promise;
}

async function showPack(id) {
  const ref = await fetchJson(`${REFERENCE}${id}.json`);
  if (gallery.current?.id !== id) return; // overtaken by another selection
  gallery.pack = id;
  for (const a of $("packs").querySelectorAll("a[data-pack]")) {
    if (a.dataset.pack === id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  document.title = `${ref.name} · Pack gallery`;
  gallery.observer?.disconnect();
  gallery.observer = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        obs.unobserve(e.target);
        materialise(e.target);
      }
    }
  }, { rootMargin: "600px 0px" });

  const own = ref.elements.filter((e) => e.own).length;
  const patterns = gallery.patterns.filter((p) => patternShown(p, id));
  const main = $("main");
  main.replaceChildren(
    h("header", { class: "pack-head" },
      h("h1", { id: "pack-title" }, ref.name),
      h("p", { class: "framework" }, ref.framework),
      h("ul", { class: "facts" },
        h("li", {}, "id ", h("code", {}, ref.id)),
        ref.version ? h("li", {}, "version ", h("b", {}, ref.version)) : null,
        h("li", {}, "import ", ref.modules.map((m, i) => [i ? " " : "", h("code", {}, m)])),
        h("li", {}, "device ", h("b", {}, ref.device)),
        h("li", {}, "chrome ", h("b", {}, ref.chrome)),
        h("li", {}, "group ", h("b", {}, ref.group)))),
    h("div", { class: "tabs", role: "tablist", "aria-label": `${ref.name} content` },
      TABS.map(([tab, label]) => h("button", {
        type: "button", role: "tab", id: `tabbtn-${tab}`, "aria-controls": `tab-${tab}`, dataset: { tab },
      }, label, h("small", tab === "elements" ? { id: "element-count" } : {}, tab === "examples" ? String(patterns.length) : "")))),
    h("section", { class: "tabpanel", id: "tab-elements", role: "tabpanel", "aria-labelledby": "tabbtn-elements" },
      h("div", { class: "tab-tools" }, filterField),
      own ? h("div", { class: "subhead" }, `${ref.name} elements`) : null,
      h("div", { class: "elements", id: "own" }, ref.elements.filter((e) => e.own).map((e) => elementCard(e, id))),
      own && own < ref.elements.length ? h("div", { class: "subhead" }, "Core vocabulary") : null,
      h("div", { class: "elements", id: "core" }, ref.elements.filter((e) => !e.own).map((e) => elementCard(e, id))),
      h("p", { class: "empty-filter", id: "no-match", hidden: true }, "No element matches the filter.")),
    h("section", { class: "tabpanel", id: "tab-examples", role: "tabpanel", "aria-labelledby": "tabbtn-examples" },
      h("nav", { id: "example-index", "aria-label": "Examples" },
        h("ol", {}, patterns.map((p) => h("li", {},
          h("a", { href: hashFor(id, "examples"), dataset: { example: p.id } }, p.title))))),
      h("div", { class: "patterns" }, patterns.map((p) => patternCard(p, id)))),
  );
  for (const slot of main.querySelectorAll(".slot")) gallery.observer.observe(slot);
  applyTab();
  applyFilter();
  main.scrollTop = 0;
  window.scrollTo(0, 0);
}

function elementCard(e, pack) {
  const params = e.params.length ? e.params.map((p, i) => [i ? ", " : "", h("code", {}, p)]) : "—";
  const defaults = Object.keys(e.defaults).length
    ? Object.entries(e.defaults).map(([k, v], i) => [i ? " " : "", h("code", {}, `${k}: ${literal(v)}`)]) : "—";
  const variants = e.variants.length ? e.variants.map((v, i) => [i ? " " : "", h("code", {}, `.${v}`)]) : "—";
  return h("article", { class: "element", dataset: { name: e.name } },
    h("header", {},
      h("h3", {}, e.name), h("span", { class: "role" }, e.role), e.own ? h("span", { class: "own" }, "own") : null,
      h("dl", {},
        h("dt", {}, "arguments"), h("dd", { class: "params" }, params),
        h("dt", {}, "defaults"), h("dd", { class: "defaults" }, defaults),
        h("dt", {}, "variants"), h("dd", { class: "variants" }, variants)),
      e.doc ? h("p", { class: "doc" }, e.doc) : null),
    h("div", { class: "stage" }, slot(e.sample, { pack, device: "fit", caption: "false", label: e.name })),
    e.variants_sample ? h("div", { class: "stage" }, h("div", { class: "label" }, "variants"),
      slot(e.variants_sample, { pack, device: "fit", caption: "false", label: `${e.name} variants` })) : null,
  );
}

/** A core pattern (no `packs`) is shown for every pack; a pack-specific one only for its packs. */
function patternShown(p, pack) {
  return !Array.isArray(p.packs) || p.packs.includes(pack);
}

function patternCard(p, pack) {
  // The attributes of the snippet (C22), plus the gallery-only caption and label.
  const attrs = { ...Object.fromEntries(patternAttributes(p, pack)), caption: "false", label: `pattern ${p.id}` };
  const specific = Array.isArray(p.packs);
  const block = `source-${p.id}`;
  return h("section", { class: "pattern", id: `example-${p.id}`, dataset: specific ? { pattern: p.id, specific: "true" } : { pattern: p.id } },
    h("div", { class: "pattern-head" },
      h("h3", { tabindex: "-1" }, p.title, specific ? h("span", { class: "own" }, p.device ?? "example") : null),
      h("button", { type: "button", class: "show-source", "aria-expanded": "false", "aria-controls": block }, "Show source")),
    h("div", { class: "stage" }, slot(p.source, attrs)),
    h("div", { class: "source", id: block, hidden: true },
      h("div", { class: "source-tools" },
        h("span", { class: "source-label" }, "Source"),
        h("span", { class: "copy-status", role: "status", "aria-live": "polite" }),
        h("button", { type: "button", class: "copy" }, "Copy")),
      h("pre", { tabindex: "0", "aria-label": `Source of ${p.title}` }, h("code", {}, snippet(p, p.source, pack)))));
}

/** Show or hide an example's source block (C21); only the block and the button change (C25). */
function toggleSource(button) {
  const block = document.getElementById(button.getAttribute("aria-controls"));
  if (!block) return;
  const open = block.hidden;
  block.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
  button.textContent = open ? "Hide source" : "Show source";
}

/**
 * Copy a source block's snippet (C24): to the clipboard, announcing Copied; where there is no clipboard,
 * or writing to it is refused, select the snippet's text so the reader can copy it.
 */
async function copySource(button) {
  const block = button.closest(".source");
  const code = block?.querySelector("pre code");
  if (!code) return;
  const status = block.querySelector(".copy-status");
  const text = code.textContent;
  try {
    if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
    await navigator.clipboard.writeText(text);
    status.textContent = "Copied";
    clearTimeout(status.timer);
    status.timer = setTimeout(() => { status.textContent = ""; }, COPIED_MS);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/** The snippet of example `id` in the selected pack, or null when the pack does not show it (C26). */
async function source(id) {
  await gallery.current?.promise;
  const pack = gallery.current?.id ?? gallery.pack;
  const p = gallery.patterns.find((q) => q.id === id);
  return p && pack && patternShown(p, pack) ? snippet(p, p.source, pack) : null;
}

/** A placeholder holding what the mockup will need. */
function slot(code, { label, ...attrs }) {
  const s = h("div", { class: "slot", dataset: { label } });
  s.mockup = { code, attrs };
  return s;
}

/** Replace a slot with its mockup element. */
function materialise(s) {
  if (!s.isConnected || !s.mockup) return s.rendered ?? null;
  const el = document.createElement("mockitdown-mockup");
  for (const [k, v] of Object.entries(s.mockup.attrs)) el.setAttribute(k, v);
  el.setAttribute("appearance", gallery.appearance);
  el.dataset.label = s.dataset.label;
  el.code = s.mockup.code;
  s.mockup = null;
  s.replaceWith(el);
  return el;
}

async function renderAll() {
  await gallery.current?.promise;
  const main = $("main");
  gallery.observer?.disconnect();
  for (const s of [...main.querySelectorAll(".slot")]) materialise(s);
  const mockups = [...main.querySelectorAll("mockitdown-mockup")];
  await Promise.all(mockups.map((m) => m.rendered));
  const empty = [];
  const errors = [];
  for (const m of mockups) {
    const root = m.shadowRoot;
    const box = m.getBoundingClientRect();
    const shown = !m.closest("[hidden]");
    if (!root || !root.querySelector(".mkd-figure *") || (shown && (box.width === 0 || box.height === 0))) {
      empty.push(m.dataset.label);
    }
    for (const d of m.diagnostics) if (d.severity === "error") errors.push(`${m.dataset.label}: ${String(d)}`);
  }
  return {
    pack: gallery.pack,
    elements: [...main.querySelectorAll(".element")].map((e) => e.dataset.name),
    patterns: [...main.querySelectorAll(".pattern")].map((p) => p.dataset.pattern),
    mockups: mockups.length,
    empty,
    errors,
  };
}

/** Show the selected tab's panel and hide the other (C16); the pack links keep the tab (C17). */
function applyTab() {
  for (const [tab] of TABS) {
    const panel = document.getElementById(`tab-${tab}`);
    const button = document.getElementById(`tabbtn-${tab}`);
    if (panel) panel.hidden = tab !== selectedTab;
    if (button) {
      button.setAttribute("aria-selected", String(tab === selectedTab));
      button.tabIndex = tab === selectedTab ? 0 : -1;
    }
  }
  for (const a of $("packs").querySelectorAll("a[data-pack]")) a.setAttribute("href", hashFor(a.dataset.pack));
}

/** Select a tab (an unknown name selects Elements); resolves with its name once it is shown (C18). */
async function showTab(name) {
  setTab(name);
  await gallery.current?.promise;
  applyTab();
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  return selectedTab;
}

/**
 * Select a tab. `write` (a choice made on the page) records it in the fragment, replacing the current
 * history entry; a tab read from the fragment is not written back.
 */
function setTab(name, write = true) {
  const tab = knownTab(name);
  const changed = tab !== selectedTab;
  selectedTab = tab;
  applyTab();
  const pack = gallery.current?.id;
  if (write && pack && location.hash !== hashFor(pack)) history.replaceState(null, "", hashFor(pack));
  // Coming from deep in the other tab, start at the top of this one, just below the sticky tab list.
  const panel = document.getElementById(`tab-${tab}`);
  const tabs = document.querySelector("#main .tabs");
  if (changed && panel && tabs) {
    const top = panel.getBoundingClientRect().top + window.scrollY
      - document.querySelector(".bar").offsetHeight - tabs.offsetHeight;
    if (window.scrollY > top) window.scrollTo(0, top);
  }
}

function applyFilter() {
  const q = gallery.filter.trim().toLowerCase();
  const cards = [...$("main").querySelectorAll(".element")];
  let shown = 0;
  for (const c of cards) {
    const hide = q !== "" && !c.dataset.name.toLowerCase().includes(q);
    c.hidden = hide;
    if (!hide) shown++;
  }
  const count = $("element-count");
  if (count) count.textContent = q ? `${shown} of ${cards.length}` : `${cards.length}`;
  const none = $("no-match");
  if (none) none.hidden = shown !== 0;
}

function setAppearance(value) {
  gallery.appearance = value === "dark" ? "dark" : "light";
  document.documentElement.dataset.appearance = gallery.appearance;
  $("appearance").value = gallery.appearance;
  try { localStorage.setItem(APPEARANCE_KEY, gallery.appearance); } catch { /* private mode */ }
  for (const m of document.querySelectorAll("mockitdown-mockup")) m.setAttribute("appearance", gallery.appearance);
}

async function init() {
  let stored = null;
  try { stored = localStorage.getItem(APPEARANCE_KEY); } catch { /* private mode */ }
  setAppearance(stored ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("appearance").addEventListener("change", (e) => setAppearance(e.target.value));
  filterField = h("label", { class: "field filter" },
    h("span", { class: "sr-only" }, "Filter elements by name"),
    h("input", { id: "filter", type: "search", placeholder: "Filter elements…", autocomplete: "off", spellcheck: "false" }));
  filterField.querySelector("input").addEventListener("input", (e) => { gallery.filter = e.target.value; applyFilter(); });
  const main = $("main");
  main.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) { setTab(tab.dataset.tab); tab.focus(); return; }
    const toggle = e.target.closest(".pattern .show-source");
    if (toggle) { toggleSource(toggle); return; }
    const copy = e.target.closest(".source .copy");
    if (copy) { copySource(copy); return; }
    const link = e.target.closest("#example-index a[data-example]");
    if (link) {
      e.preventDefault();
      const section = document.getElementById(`example-${link.dataset.example}`);
      section?.scrollIntoView({ block: "start" });
      section?.querySelector("h3")?.focus({ preventScroll: true });
    }
  });
  main.addEventListener("keydown", (e) => {
    // The tab list's arrow keys move between the tabs (WAI-ARIA tabs pattern).
    const tab = e.target.closest?.('[role="tab"]');
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const ids = TABS.map(([id]) => id);
    const i = ids.indexOf(tab.dataset.tab);
    const next = e.key === "Home" ? 0 : e.key === "End" ? ids.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length;
    setTab(ids[next]);
    document.getElementById(`tabbtn-${ids[next]}`)?.focus();
  });
  $("menu").addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  matchMedia("(min-width: 720px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  const [index, patterns] = await Promise.all([fetchJson(REFERENCE + "index.json"), loadPatterns()]);
  gallery.groups = index.groups;
  gallery.patterns = patterns;
  buildNav();
  window.addEventListener("hashchange", () => { setTab(tabFromHash(), false); select(packFromHash()); });
  selectedTab = tabFromHash();
  await select(packFromHash());
  gallery.state = "ready";
}

init().catch((e) => {
  gallery.state = "failed";
  $("main").replaceChildren(h("p", { class: "loading" }, `The gallery cannot load: ${e.message}`));
  throw e;
});
