# Glossary (agent form)

One line per term: `Term — definition`. The narrative glossary page is written for readers.

Appearance — colour mode of a mockup: light | dark | auto (follows host page) | both (side by side).
Block — one fenced code block tagged `mockitdown`; the source of one mockup.
Chrome — device/window decoration around a screen (status bar, title bar, browser bar, home indicator).
Component — user-declared `struct … : View`, used like an element (custom control).
Component library — a `.mockitdown` file of component declarations, loaded by `import "path"`.
Core vocabulary — element names defined by the `base` pack, inherited by every pack.
Device — named frame size in logical points (phone, tablet, desktop, …) or `fit`.
Diagnostic — located error or warning from parsing, evaluation or rendering.
Directive — top-level `@Screen(…)` attribute carrying mockup metadata.
Element — a name a pack defines, mapped to a render role with default attributes.
Elements table — optional table of `.id()`-tagged elements with `.ref()` citations, under a figure.
Fence attributes — `key="value"` options on the fence line overriding one mockup's rendering.
Figure — the rendered HTML of one mockup (frames, caption, optional Elements table).
Frame — the device-sized box the screen is drawn and scaled in.
Frame unit — `--u` = min(1px, 100cqw / device width): one logical point inside a frame.
Modifier — `.name(…)` call chained on a view.
Pack — design pack: element vocabulary, tokens, chrome, stylesheet of one framework (pack.json + pack.css).
Render role — fixed markup shape every element renders through; packs restyle roles.
Site pack — a pack supplied by a site from a directory in `pack_paths`.
Strict mode — site option: any mockitdown error fails the build.
Token — named design value with light/dark values, emitted as `--mkd-<name>`.
