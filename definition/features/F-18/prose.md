**Problem.** The Python variant has the example site and its Reference section to show every pack; the web components need an equivalent that also serves as their end-to-end test (SRC-8).

**Change.** A test page in `typescript/` lists the packs on the left and shows the selected pack's elements and complete design patterns on the right, all as `mockitdown-mockup` components. The browser test suite (Playwright, SRC-8#clar-deps) drives the same page.

**Meaningful samples (SRC-9).** Generic samples (`Picker("Label")` without options, a lone `Tab`)
said nothing about the element. Packs can name a sample per element; the gallery lays out variants
so each is seen whole; multi-platform packs show an example application per platform.

**Tabs and complex examples (SRC-10).** A pack has around a hundred element cards; the examples sat below all of them. Elements and examples now have their own tabs, and the examples grow to complex application layouts.

**Show source (SRC-11).** Each design example can reveal the source that builds it — the pattern
file wrapped in the `mockitdown-mockup` tag with the attributes the gallery passes for the selected
pack — so a reader learns the vocabulary from working layouts and can copy one as a starting point.

**Published (SRC-17).** The gallery was reachable only through the development server, so a reader of
the published documentation could not find it. It is now published beside the documentation and the
demo site, with a Gallery header tab on both sites.

**Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.
