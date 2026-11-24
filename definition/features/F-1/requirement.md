---
id: F-1
title: Mockups in Markdown fenced blocks
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 1
family: authoring
source: [SRC-1, SRC-2, SRC-3]
hash: 3e845ba6346a
---

G1: Specification authors need user-interface mockups that live in the same Markdown file as the requirements they illustrate, versioned and reviewed with them, instead of screenshots or drawings kept elsewhere.
C1: An author writes a mockup as a fenced code block whose info string is `mockitdown`.
C2: The rendered documentation page shows the mockup in place of the code block, as a figure.
C3: The fence carries optional attributes (pack, device, appearance, size, chrome, title, id, caption, Elements table, address, source disclosure) that adjust one mockup without changing its code.
C4: A page may hold any number of mockups, each rendered independently.
C5: The block's source stays readable as code: a reader of the raw Markdown understands the screen without rendering it.
AC1: A page containing a ```` ```mockitdown ```` block, built by a configured site, contains one rendered figure per block and no code listing of it (unless the source disclosure is asked for).
AC2: Changing a fence attribute (for example `device="phone"`) changes only that mockup.
AC3: The fence identifier is exactly `mockitdown`, the project's name.
A1: F-11 (the site integration that renders the blocks).
