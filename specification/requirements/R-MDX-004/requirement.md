---
id: R-MDX-004
title: Per-page CSS delivery
status: active
version: 0.12.10
rev: 2
page: MDX.1
slot: reqs
order: 4
source: [SRC-2]
realizes: [F-11, F-8]
constrained_by: [A-MDX-1, A-STYLE-1]
decisions: [ADR-8]
reverse_engineered: true
hash: 54f1e8925005
---

C1: While `css` is `inline`, the Markdown extension MUST prepend to each converted page that rendered at least one mockup exactly one `<style data-mockitdown="<pack ids>">` element holding the stylesheet for the packs the page used.
C2: The stylesheet MUST contain the page stylesheet once, then each used pack's lineage, root first, each pack once, each pack's CSS followed by its token rules, minified.
C3: The Markdown extension MUST NOT add a style element to a page that rendered no mockup.
C4: While `css` is `none`, the Markdown extension MUST NOT add CSS; the site MUST then include the output of `mockitdown css` itself (for example through `extra_css`).
C5: The Markdown extension MUST forget the packs used when Python-Markdown is reset between pages.
V1: A page with a SwiftUI and a Fluent mockup has one style element with `data-mockitdown` listing `base`, `swiftui` and `fluent`, and `base` CSS appears once.
