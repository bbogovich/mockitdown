// The pack gallery (pages/packs.html, R-WEB-004): a side panel of the packs grouped as the example
// site's Reference menu (shared/reference/index.json) and, for the selected pack, a card per element
// (shared/reference/<pack>.json) and the design patterns of shared/patterns/.
//
// Mockups are created lazily: each card holds an empty slot, and a <mockitdown-mockup> replaces it
// when the slot comes near the viewport (IntersectionObserver). `window.packGallery` exposes the
// state and two hooks for the browser tests (tests/browser/gallery.spec.mjs):
//   state           "loading" | "ready" (the side panel and the first pack are built) | "failed"
//   pack            the selected pack id
//   select(id)      select a pack (updates #pack=<id>); resolves when its cards are built
//   renderAll()     create every mockup of the selected pack, wait for all `rendered`, and resolve
//                   with {pack, elements, patterns, mockups, empty, errors}
//
// A pattern entry of shared/patterns/index.json without `packs` is a core pattern, shown for every pack;
// one with `packs` is shown only for those packs, and its `device`, `chrome`, `menubar`, `app` and
// `windowed` become the mockup's attributes of the same name (R-WEB-004.C14).

import "../dist/mockitdown.js";

const REFERENCE = "../shared/reference/";
const PATTERNS = "../shared/patterns/";
const APPEARANCE_KEY = "mockitdown.gallery.appearance";
/** Pattern entry keys passed to the mockup element as attributes of the same name (R-WEB-004.C14). */
const PATTERN_ATTRIBUTES = ["device", "chrome", "menubar", "app", "windowed"];

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
};
window.packGallery = gallery;

function packFromHash() {
  const m = /(?:^#|&)pack=([^&]+)/.exec(location.hash);
  return m ? decodeURIComponent(m[1]) : null;
}

function knownPack(id) {
  return gallery.groups.some((g) => g.packs.includes(id));
}

function buildNav() {
  const nav = $("packs");
  nav.replaceChildren(...gallery.groups.map((g) => h("section", { class: "group" },
    h("h2", {}, g.title),
    h("ul", {}, g.packs.map((id) => h("li", {},
      h("a", { href: `#pack=${encodeURIComponent(id)}`, dataset: { pack: id } }, h("span", {}, id), h("span", { class: "id" }, "")))))),
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
  const hash = `#pack=${encodeURIComponent(id)}`;
  if (location.hash !== hash) {
    if (packFromHash() === null) history.replaceState(null, "", hash);
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
    h("h2", {}, "Elements", h("small", { id: "element-count" }, "")),
    own ? h("div", { class: "subhead" }, `${ref.name} elements`) : null,
    h("div", { class: "elements", id: "own" }, ref.elements.filter((e) => e.own).map((e) => elementCard(e, id))),
    own && own < ref.elements.length ? h("div", { class: "subhead" }, "Core vocabulary") : null,
    h("div", { class: "elements", id: "core" }, ref.elements.filter((e) => !e.own).map((e) => elementCard(e, id))),
    h("p", { class: "empty-filter", id: "no-match", hidden: true }, "No element matches the filter."),
    h("h2", {}, "Design patterns", h("small", {}, `in ${ref.name}`)),
    h("div", { class: "patterns" }, gallery.patterns.filter((p) => patternShown(p, id)).map((p) => patternCard(p, id))),
  );
  for (const slot of main.querySelectorAll(".slot")) gallery.observer.observe(slot);
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
  const attrs = { pack, caption: "false", label: `pattern ${p.id}` };
  for (const k of PATTERN_ATTRIBUTES) if (p[k] !== undefined && p[k] !== null) attrs[k] = String(p[k]);
  const specific = Array.isArray(p.packs);
  return h("section", { class: "pattern", dataset: specific ? { pattern: p.id, specific: "true" } : { pattern: p.id } },
    h("h3", {}, p.title, specific ? h("span", { class: "own" }, p.device ?? "example") : null),
    h("div", { class: "stage" }, slot(p.source, attrs)));
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
  $("filter").addEventListener("input", (e) => { gallery.filter = e.target.value; applyFilter(); });
  $("menu").addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  matchMedia("(min-width: 720px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  const [index, patterns] = await Promise.all([fetchJson(REFERENCE + "index.json"), loadPatterns()]);
  gallery.groups = index.groups;
  gallery.patterns = patterns;
  buildNav();
  window.addEventListener("hashchange", () => { select(packFromHash()); });
  await select(packFromHash());
  gallery.state = "ready";
}

init().catch((e) => {
  gallery.state = "failed";
  $("main").replaceChildren(h("p", { class: "loading" }, `The gallery cannot load: ${e.message}`));
  throw e;
});
