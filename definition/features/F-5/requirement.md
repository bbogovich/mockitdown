---
id: F-5
title: Embedded external assets
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 5
family: authoring
source: [SRC-2]
hash: 1805962b1059
---

G1: Mockups need real imagery — photos, logos, avatars, maps — referenced from the site's files or the web.
C1: An element that shows an image accepts a reference to a local file or a remote URL.
C2: Local images are found relative to the page's or library's directory and the site's configured asset directories.
C3: Local images are embedded into the rendered page at build time, so the mockup works at any page URL and offline.
C4: Very large files are linked instead of embedded.
C5: References that are not images or that use unsafe schemes are refused.
C6: Framework and SF Symbols-style icon names render as built-in icons without external assets.
AC1: `Image("assets/team.jpg")` with the file under an asset directory shows the photo in the built page without the site copying the image.
AC2: A missing image is reported and drawn as an image placeholder.
AC3: `Image("javascript:…")` is refused with a warning.
