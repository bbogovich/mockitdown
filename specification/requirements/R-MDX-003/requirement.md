---
id: R-MDX-003
title: Fence attributes
status: active
version: 0.12.10
rev: 2
page: MDX.1
slot: reqs
order: 3
source: [SRC-2, SRC-3]
realizes: [F-1, F-11]
constrained_by: [A-MDX-2, A-OPT-1]
reverse_engineered: true
hash: c8acf9a03b8b
refs: [R-IMP-008]
---

C1: The fence MUST accept these attributes, with these types: `pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `library`, `window`, `menubar`, `app` (text); `width`, `height` (integer); `caption`, `elements`, `source`, `windowed` (boolean).
C2: The fence MUST read a boolean attribute as true when its value is `1`, `true`, `yes` or `on` (case-insensitive) and false otherwise.
C3: The fence validator MUST accept every attribute, so that a misspelt attribute is reported rather than silently turning the block into a code listing.
C4: If an attribute is unknown, has an invalid integer value, or gives an appearance other than the four, then the fence MUST report a fence error (code `fence`) naming it, ignore that attribute, render the block, and place an error box listing the fence errors above the figure.
C5: Fence attributes MUST override the site options and the block's `@Screen` metadata.
C6: If `library` is not an identifier (a letter or `_`, then letters, digits or `_`), then the fence MUST report a fence error naming it and render the block as a mockup (R-IMP-008).
V1: ```` ```mockitdown device="phone" elements="yes" ```` renders a phone with an Elements table; `devise="phone"` renders with an error box "unknown fence option 'devise'".
