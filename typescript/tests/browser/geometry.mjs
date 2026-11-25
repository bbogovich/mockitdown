// Geometry checks run inside the page (passed to page.evaluate, so each function is self-contained).
// They read the mockups' shadow roots and return human-readable problems; the tests expect none.

/**
 * R-WEB-004.C13/C15, R-DEV-008.C1–C5, R-REND-013.C1–C3 over the `mockitdown-mockup` elements matching
 * `selector`. `presentations` also checks presentation surfaces, sheets and tooltips (element samples
 * alone); `fit` checks that fit frames are not squeezed and that wide mockups scroll.
 */
export function inspectMockups({ selector, presentations = true, fit = true }) {
  const TOL = 1.5;
  const problems = [];
  const box = (el) => el.getBoundingClientRect();
  const laidOut = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "absolute" || cs.position === "fixed") return false;
    const r = box(el);
    return r.width > 0 && r.height > 0;
  };
  const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > TOL
    && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > TOL;
  const inside = (a, b) => a.left >= b.left - TOL && a.right <= b.right + TOL && a.top >= b.top - TOL && a.bottom <= b.bottom + TOL;
  const size = (r) => `${Math.round(r.width)}×${Math.round(r.height)}`;
  const name = (el) => el.dataset.el || [...el.classList].find((c) => c.startsWith("mkd-")) || el.tagName.toLowerCase();
  // Rows (R-REND-013.C1–C3): stacks, toolbars and control groups, form rows, and labelled controls.
  const ROWS = ".mkd-hstack, .mkd-toolbar, .mkd-labeled, .mkd-toggle, .mkd-checkbox, .mkd-radio, .mkd-label";
  const SKIP = ".mkd-deco__layer, .mkd-anchored, .mkd-spacer";

  for (const m of document.querySelectorAll(selector)) {
    if (m.closest("[hidden]")) continue;
    const label = m.dataset.label || m.getAttribute("pack");
    const root = m.shadowRoot;
    const frame = root?.querySelector(".mkd-frame");
    if (!frame) { problems.push(`${label}: no frame`); continue; }
    const fr = box(frame);

    if (fit && frame.dataset.fit === "true") {
      // R-WEB-004.C15 / R-DEV-008.C1: the frame is as wide as its content.
      if (frame.scrollWidth > frame.clientWidth + 1) {
        problems.push(`${label}: fit frame ${frame.clientWidth} px narrower than its content (${frame.scrollWidth} px)`);
      }
      // R-WEB-004.C13: a mockup wider than its card scrolls within the card.
      const cell = frame.closest(".mkd-cell");
      const stage = m.closest(".stage");
      if (stage && fr.width > stage.clientWidth + 1) {
        const scrolls = (cell && cell.scrollWidth > cell.clientWidth) || stage.scrollWidth > stage.clientWidth;
        if (!scrolls) problems.push(`${label}: wider than its card (${Math.round(fr.width)} px) but nothing scrolls`);
      }
    }

    // R-WEB-004.C15: captioned variant cells (the children of the variants row) never intersect, and
    // R-REND-013.C1–C3: the children of every row never intersect.
    for (const row of root.querySelectorAll(ROWS)) {
      if (!laidOut(row)) continue;
      const kids = [...row.children].filter((k) => !k.matches(SKIP) && laidOut(k));
      // A child with a negative leading margin overlaps its predecessor by design (joined segments of a
      // group sharing a border, stacked avatars); that is not a layout overlap.
      const joined = (k) => parseFloat(getComputedStyle(k).marginLeft) < 0 || parseFloat(getComputedStyle(k).marginInlineStart) < 0;
      for (let i = 0; i < kids.length; i++) {
        for (let j = i + 1; j < kids.length; j++) {
          if (!(j === i + 1 && joined(kids[j])) && overlap(box(kids[i]), box(kids[j]))) {
            problems.push(`${label}: in ${name(row)}, ${name(kids[i])} (${size(box(kids[i]))}) and ${name(kids[j])} (${size(box(kids[j]))}) intersect`);
          }
        }
        // R-REND-013.C2: text wraps or truncates in its own box instead of painting over a sibling.
        const k = kids[i];
        if (k.matches(".mkd-text") && getComputedStyle(k).overflowX === "visible" && k.scrollWidth > k.clientWidth + 1) {
          problems.push(`${label}: text "${k.textContent.slice(0, 30)}" in ${name(row)} overflows its box`);
        }
      }
    }

    if (!presentations) continue;
    // R-DEV-008.C2–C4, R-WEB-004.C15: presentation surfaces drawn whole.
    for (const layer of root.querySelectorAll(".mkd-layer")) {
      const kind = layer.dataset.kind;
      if (kind === "fab") continue;
      if (kind === "toast") {
        const toast = layer.querySelector(".mkd-toast");
        const msg = toast?.querySelector(".mkd-toast__message");
        if (!toast || !msg) { problems.push(`${label}: toast layer without a toast`); continue; }
        const t = box(toast);
        const range = document.createRange();
        range.selectNodeContents(msg);
        const text = range.getBoundingClientRect();
        if (t.height < 16 || !inside(text, t) || !inside(t, fr)) {
          problems.push(`${label}: toast ${size(t)} does not hold its text ${size(text)} inside the frame`);
        }
        continue;
      }
      const surface = layer.querySelector(":scope > .mkd-dialog, :scope > .mkd-presented");
      if (!surface) { problems.push(`${label}: ${kind} layer without a surface`); continue; }
      const s = box(surface);
      if (s.width < 200 - TOL || s.height < 80 - TOL) problems.push(`${label}: ${kind} surface is ${size(s)}, under 200×80`);
      if (!inside(s, fr)) problems.push(`${label}: ${kind} surface ${size(s)} is clipped by the frame ${size(fr)}`);
      const scrim = layer.querySelector(":scope > .mkd-scrim");
      if (scrim && getComputedStyle(scrim).display !== "none" && frame.dataset.fit === "true") {
        const screen = box(frame.querySelector(".mkd-screen"));
        if (!inside(screen, box(scrim))) problems.push(`${label}: the ${kind} scrim does not cover the frame`);
      }
      if (kind === "sheet" && frame.dataset.fit === "true") {
        const top = box(frame.querySelector(".mkd-screen")).top;
        const grabber = surface.querySelector(".mkd-presented__grabber");
        const before = getComputedStyle(surface, "::before");
        const hasGrabber = (grabber && laidOut(grabber)) || (before.content !== "none" && before.display !== "none" && parseFloat(before.width) > 0);
        if (s.height < 240 - TOL) problems.push(`${label}: sheet is ${Math.round(s.height)} px tall, under 240`);
        if (s.top - top < 48 - TOL) problems.push(`${label}: only ${Math.round(s.top - top)} px of backdrop above the sheet`);
        if (!hasGrabber) problems.push(`${label}: sheet without a grabber`);
      }
    }
    // R-DEV-008.C5: a tooltip shows its anchor and its bubble, neither clipped, the arrow towards the anchor.
    for (const tip of root.querySelectorAll(".mkd-tooltip")) {
      const bubble = tip.querySelector(":scope > .mkd-tooltip__bubble");
      const anchor = tip.querySelector(":scope > .mkd-tooltip__anchor");
      if (!bubble || !laidOut(tip)) continue;
      const b = box(bubble);
      const a = anchor && box(anchor);
      if (!a || a.width === 0 || a.height === 0) { problems.push(`${label}: tooltip without an anchor`); continue; }
      if (!inside(b, fr) || !inside(a, fr)) problems.push(`${label}: tooltip bubble ${size(b)} or anchor clipped by the frame`);
      if (overlap(a, b)) problems.push(`${label}: tooltip bubble covers its anchor`);
      const arrow = bubble.querySelector(":scope > .mkd-tooltip__arrow");
      if (arrow && getComputedStyle(arrow).display !== "none") {
        const c = (r) => [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
        const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (d(c(box(arrow)), c(a)) >= d(c(b), c(a))) problems.push(`${label}: the tooltip arrow does not point at the anchor`);
      }
    }
  }
  return problems;
}

/**
 * Mount one `mockitdown-mockup` per entry of `mockups` ({code, label, attrs}) in a container `width`
 * CSS pixels wide, wait until all are rendered, and return how many there are.
 */
export async function mountMockups({ id, width, mockups }) {
  document.getElementById(id)?.remove();
  const host = document.createElement("div");
  host.id = id;
  host.style.cssText = `width:${width}px;position:absolute;left:0;top:0;background:#fff`;
  for (const { code, label, attrs } of mockups) {
    const el = document.createElement("mockitdown-mockup");
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.dataset.label = label;
    el.code = code;
    host.append(el);
  }
  document.body.append(host);
  await Promise.all([...host.querySelectorAll("mockitdown-mockup")].map((m) => m.rendered));
  return host.children.length;
}
