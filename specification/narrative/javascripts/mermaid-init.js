// Mermaid loader for the Zensical build. Zensical (0.1.x) does not bundle or initialise Mermaid the
// way Material for MkDocs does, so a ```mermaid fence would stay an empty <pre class="mermaid">.
// This script loads Mermaid (pinned ESM build) and renders every diagram once; it is idempotent
// and also runs after instant navigation when the theme exposes `document$`.
const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
let mermaidModule = null;

async function renderMermaid() {
  const blocks = Array.from(document.querySelectorAll("pre.mermaid, div.mermaid"))
    .filter((el) => !el.dataset.mermaidDone);
  if (blocks.length === 0) return;
  if (!mermaidModule) {
    mermaidModule = (await import(MERMAID_URL)).default;
    const dark = document.body.getAttribute("data-md-color-scheme") === "slate";
    mermaidModule.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", securityLevel: "strict" });
  }
  const nodes = blocks.map((el) => {
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = (el.querySelector("code") || el).textContent;
    div.dataset.mermaidDone = "true";
    el.replaceWith(div);
    return div;
  });
  await mermaidModule.run({ nodes });
}

// Render on load in every case (Zensical's document$ does not always emit for the first page), and
// again after instant navigation when the theme exposes document$. renderMermaid is idempotent.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { renderMermaid(); });
} else {
  renderMermaid();
}
if (typeof window.document$ !== "undefined" && window.document$.subscribe) {
  window.document$.subscribe(() => { renderMermaid(); });
}
