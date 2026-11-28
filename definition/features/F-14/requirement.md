---
id: F-14
title: Example site as user guide and end-to-end test
status: active
version: 0.11.1
rev: 4
page: FEAT.2
slot: features
order: 7
family: rendering
source: [SRC-2, SRC-6]
hash: 14c6ddb3cab1
refs: [F-18, F-3, UC-2]
requires: [F-3, F-18]
---

G1: Users need a working demonstration of every supported framework, and the project needs an end-to-end test that exercises the real documentation toolchain.
C1: The repository contains an example documentation site, built with Zensical, with one page per shipped framework pack.
C2: Each pack page shows user interfaces of varied complexity, from single controls to complete screens, following common UI design patterns of that framework.
C3: The site also demonstrates the language, custom components and imported libraries, images, appearance modes and the Elements table.
C4: Every mockup on the example site renders without errors or warnings, and the site builds; automated tests verify both.
C5: The published documentation has a tab bar in its header with six sections — User guide (the example site), Gallery (the pack gallery, F-18), Definition, Specification, Implementation and Reference — each with its own navigation menu.
C6: The Reference section has one page per shipped pack showing every element the pack offers rendered in its style, with its role, arguments, defaults and variants, generated from the pack definitions.
C7: The retro pages are listed in chronological order of the system they imitate.
C8: The User guide starts with an Installation page covering the Python package and the TypeScript web components: how to install each, and how to build a documentation page with embedded mockups — chiefly a Zensical or MkDocs site with the Python extension, and a plain HTML page with the web components.
C9: Every option, attribute, file or term the User guide uses is defined where it is first used or links to the page that defines it; in particular the guide says where the import map is configured for each integration.
AC1: The test suite converts every example page and fails on any mockitdown error or warning.
AC2: The test suite builds the example site with Zensical when it is installed.
AC3: Each shipped pack has its own page on the example site.
AC4: The test suite fails when a Reference page is out of date with its pack.
AC5: The header tab and the example site's top section are named User guide, and its first page after the home page is Installation. (UC-2)
AC6: Following the Installation page literally in a fresh environment produces a site page and an HTML page that each show a rendered mockup. (UC-2)
AC7: The custom-components page shows the import map configuration, a library block used by a later block, qualified references to two libraries, and a template with slots.
AC8: The retro pages of the example site's navigation and of its Reference section are listed in the order of the years in F-3.C8, and then the packs of F-3.C10 and C13 in the order of AC8 of F-3.
