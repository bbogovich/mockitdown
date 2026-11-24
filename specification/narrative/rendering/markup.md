---
title: "Rendering: markup"
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: REND.1
---

# Rendering: markup

The HTML a mockup renders to: the figure, role markup, attributes, modifier styles, text, safety, determinism, placeholders, presentations and the Elements table. Each role's parts and attributes are in the [Role catalogue](roles.md); what pack authors may rely on is summarised in the [Markup and CSS contract](css-contract.md).

<!-- slot: reqs -->

## Annotated example

The block

```swift
Button("Save", systemImage: "tray").buttonStyle(.bordered).id("save")
```

rendered with `device="fit" title="Save" id="SCR-1"` produces (indented for reading; icon path
shortened):

```html
<div class="mkd-figure mkd-pack-base" role="figure" aria-label="Save"
     data-pack="base" data-device="fit" data-appearance="light">      <!-- R-REND-001.C1 -->
  <div class="mkd-stage" data-count="1">
    <div class="mkd-cell">
      <div class="mkd-frame" data-appearance="light" data-device="fit"
           data-chrome="none" data-fit="true">                         <!-- R-REND-001.C3 -->
        <div class="mkd-screen">
          <span class="mkd-button" data-el="Button" data-variant="bordered"
                data-mkd-id="save" role="button">                      <!-- R-REND-002, -003 -->
            <span class="mkd-button__icon"><svg class="mkd-icon" viewBox="0 0 24 24"
                  aria-hidden="true" focusable="false">…</svg></span>
            <span class="mkd-button__label">Save</span>
          </span>
        </div>
      </div>
    </div>
  </div>
  <div class="mkd-caption">SCR-1 · Save</div>                         <!-- R-REND-001.C6 -->
</div>
```

`.buttonStyle(.bordered)` became `data-variant="bordered"` through the base pack's modifier map
(R-EVAL-009.C2); the same block in the Fluent pack differs only in `mkd-pack-fluent` and
`data-pack="fluent"` — the Fluent CSS does the rest.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
