**Context.** The prototype built both renderers over one AST and compared them (SRC-3, ADR-001):
HTML won on fidelity, accessibility, scaled legibility and size; SVG was kept for static export.
Production widens the scope to seven framework packs with light and dark modes.

**Decision.** Only the HTML renderer survives. The SVG renderer's strength — a self-contained
static picture — is delivered by the HTML output itself: no scripts, embedded images, inline CSS
(ADR-5, ADR-8, ADR-9).

**Consequences.** One renderer to maintain; realism is a matter of CSS per pack. A mockup is
printed or exported by the browser like the rest of the page.
