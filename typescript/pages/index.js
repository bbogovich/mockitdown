// The gallery home page (R-WEB-006). Plain module, no framework, no request outside the gallery.
//
// - Appearance (C8): the pack gallery's choice, from the same localStorage key, else the system's
//   (followed live while no choice is stored).
// - Easter eggs (C7): one link per id under `hidden` in ../shared/reference/index.json, to
//   packs.html#pack=<id>, labelled with the pack's `name` from ../shared/reference/<id>.json (its id
//   when that file cannot be read). When index.json cannot be loaded, a sentence replaces the links (C9).
// - `data-state` on <html> becomes `ready` once the links (or the sentence) are in place, for the tests.

const REFERENCE = "../shared/reference/";
const APPEARANCE_KEY = "mockitdown.gallery.appearance";
const root = document.documentElement;

function storedAppearance() {
  try {
    const v = localStorage.getItem(APPEARANCE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null; // private mode
  }
}

const systemDark = matchMedia("(prefers-color-scheme: dark)");
function applyAppearance() {
  root.dataset.appearance = storedAppearance() ?? (systemDark.matches ? "dark" : "light");
}
applyAppearance();
systemDark.addEventListener("change", applyAppearance);
window.addEventListener("storage", (e) => { if (e.key === APPEARANCE_KEY) applyAppearance(); });

async function json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

async function packName(id) {
  try {
    return (await json(`${REFERENCE}${encodeURIComponent(id)}.json`)).name || id;
  } catch {
    return id;
  }
}

async function eggs() {
  const list = document.getElementById("egg-links");
  let hidden;
  try {
    hidden = (await json(REFERENCE + "index.json")).hidden ?? [];
  } catch {
    list.replaceWith(Object.assign(document.createElement("p"), {
      className: "eggs-failed",
      textContent: "The easter-egg packs could not be loaded.",
    }));
    return;
  }
  const names = await Promise.all(hidden.map(packName));
  list.replaceChildren(...hidden.map((id, i) => {
    const a = Object.assign(document.createElement("a"), { href: `packs.html#pack=${encodeURIComponent(id)}`, textContent: names[i] });
    const li = document.createElement("li");
    li.append(a);
    return li;
  }));
  if (!hidden.length) list.replaceWith(Object.assign(document.createElement("p"), { textContent: "None at the moment." }));
}

eggs().finally(() => { root.dataset.state = "ready"; });
