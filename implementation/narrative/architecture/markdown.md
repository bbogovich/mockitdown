---
title: Markdown integration
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: IMPL.MDX
---

# Markdown integration

Realizes **A-MDX-1** (extension) and **A-MDX-2** (fence); requirements R-MDX-001 – R-MDX-006.

## Extension — `extension.py`

`MockitdownExtension` declares the site options (`self.config`) with their defaults, validates
`default_appearance` and `css`, builds a `RenderOptions` and a `MockitdownSession(options, css,
strict)`, attaches it to the `Markdown` instance as `md.mockitdown`, and registers
`_StylePostprocessor` (priority 5). The postprocessor prepends
`<style data-mockitdown="…">` with `stylesheet(session.used, registry)` when `css` is `inline` and
the page used a pack. `reset()` clears `session.used` between pages.

`mockitdown.makeExtension` (in `__init__.py`) lets `markdown_extensions: [mockitdown]` load it by
name.

## Fence — `fence.py`

- `validate(...)` copies every attribute into the options and returns `True` (R-MDX-003.C3).
- `format(source, language, css_class, options, md, **kwargs)`: takes the session from
  `md.mockitdown` (or a module default with `css="none"`), coerces the attributes
  (`options.coerce_fence_options`), calls `api.render`, logs each diagnostic to
  `mkdocs.extensions.mockitdown`, raises `SuperFencesException` in strict mode, records the packs
  used, and prefixes an error box for fence problems.

## Why no plugin

Zensical does not run MkDocs plugins (ADR-3). Everything the prototype's plugin did is here:
configuration (extension), CSS (postprocessor), strict failure (fence). Asset copying is replaced by
embedding (ADR-9).

## Debugging a site build

- Run the site build with logging visible: `zensical build` prints `mockitdown block '<label>': …`
  lines.
- Convert one page directly:
  ```python
  import markdown
  from mockitdown import fence
  md = markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], extension_configs={
      "pymdownx.superfences": {"custom_fences": [{"name": "mockitdown", "class": "mockitdown",
          "format": fence.format, "validator": fence.validate}]}})
  print(md.convert(open("docs/page.md").read()))
  ```
- Check a block in isolation with `mockitdown check`.

## Known gaps

- Hosts may run nested or repeated `convert()` calls (Zensical converts heading fragments mid-page
  without `reset()`); `_StylePostprocessor` therefore emits only when its input contains a figure.
- The fence has no access to the page's path, so `source_path` is unset for blocks (deviation #4
  on the [overview](index.md#known-debt-and-deviations)).


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.1.1 | 2026-11-24 | Inline CSS delivery under Zensical fixed |
