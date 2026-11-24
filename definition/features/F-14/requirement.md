---
id: F-14
title: Example site as demo and end-to-end test
status: active
version: 0.4.0
rev: 1
page: FEAT.2
slot: features
order: 7
family: rendering
source: [SRC-2, SRC-6]
hash: a870d4ed8861
---

G1: Users need a working demonstration of every supported framework, and the project needs an end-to-end test that exercises the real documentation toolchain.
C1: The repository contains an example documentation site, built with Zensical, with one page per shipped framework pack.
C2: Each pack page shows user interfaces of varied complexity, from single controls to complete screens, following common UI design patterns of that framework.
C3: The site also demonstrates the language, custom components and imported libraries, images, appearance modes and the Elements table.
C4: Every mockup on the example site renders without errors or warnings, and the site builds; automated tests verify both.
C5: The published documentation has a tab bar in its header with five sections — Demo (the example site), Definition, Specification, Implementation and Reference — each with its own navigation menu.
C6: The Reference section has one page per shipped pack showing every element the pack offers rendered in its style, with its role, arguments, defaults and variants, generated from the pack definitions.
C7: The retro pages are listed in chronological order of the system they imitate.
AC1: The test suite converts every example page and fails on any mockitdown error or warning.
AC2: The test suite builds the example site with Zensical when it is installed.
AC3: Each shipped pack has its own page on the example site.
AC4: The test suite fails when a Reference page is out of date with its pack.
