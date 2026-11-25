---
title: Pack authoring guide
impl_version: 0.3.11
status: draft
updated: 2026-11-25
page_id: IMPL.PACKAUTH
---

# Pack authoring guide

How to write a design pack — a new framework for mockitdown, or a site's own design system. The
rules are in the specification ([Pack format](../specification/packs/format.md),
[Markup and CSS contract](../specification/rendering/css-contract.md)); this page is the workflow.

## 1. Create the directory

```text
packs/acme/
  pack.json
  pack.css
```

Built-in packs live in `shared/packs/<id>/` (copied into the Python package at build time); a site pack lives in any directory listed in
the extension's `pack_paths` (or `-P` on the CLI).

## 2. Describe the framework in `pack.json`

Start from identity, inheritance and platform:

```json
{
  "id": "acme", "name": "Acme", "framework": "Acme Design System", "version": "3.2",
  "extends": "base", "modules": ["AcmeUI"],
  "device": "desktop", "chrome": {"desktop": "browser", "phone": "ios"}
}
```

Then, in this order:

1. **Tokens.** Copy the base token names and set the framework's light and dark values — colours,
   radii, shadows, font stack, base size, control height, and the `fs-*`/`fw-*` type ramp. Most of
   a pack's look comes from tokens.
2. **Modifier maps.** Map the framework's style vocabulary onto attributes, for example
   `"appearance": {"attr": "variant"}` so `.appearance(.accent)` becomes `data-variant="accent"`.
3. **Elements.** For each framework component, pick the [render role](../specification/rendering/roles.md)
   whose markup fits, the positional parameters, defaults and documented variants:

    ```json
    "InfoBar": {"role": "alert", "params": ["title", "message"], "defaults": {"variant": "infobar"},
                "variants": ["informational", "success", "warning", "error"],
                "doc": "InfoBar(\"Saved\", message: \"…\", severity: .success)"}
    ```

    Use the framework's own component names; keep the core names working (they are inherited).

    Where the Reference gallery's generic sample cannot show what an element is for (a picker with no
    options, a chart with no data, a tab alone), add `"sample"`: one call in the pack's vocabulary
    (R-PACK-013). The generator uses it verbatim and stops, naming the pack and the element, if it renders
    with a diagnostic; for an element with variants it must be a call of that element, because each
    variant is shown as the sample with `.variant("…")` appended:

    ```json
    "Picker": {"role": "select", "params": ["label"], "variants": ["menu", "segmented", "inline"],
               "sample": "Picker(\"Flavor\", selection: \"Vanilla\") { Text(\"Chocolate\"); Text(\"Vanilla\"); Text(\"Strawberry\") }"}
    ```

    Then run `tools/gen_reference.py` and look at the card.
4. **Fonts, sizes, icons** when the framework's type names, device sizes or icon names differ.

## 3. Style the roles in `pack.css`

- Scope every selector with `.mkd-pack-acme` (the contract test fails otherwise).
- Select role classes, part classes and `data-*` attributes only; use `data-el` for
  framework-native elements that share a role.
- Use tokens for every colour, radius, shadow and font; never branch on appearance.
- Write lengths in px as the framework specifies them; they are scaled automatically.

Inspect the markup a role emits with `mockitdown render`:

```sh
echo 'import AcmeUI
InfoBar("Saved", severity: .success)' | mockitdown render - -P packs --device fit
```

At `fit`, set the screen's padding with the token `--mkd-fit-padding` (not `padding`), so that sheets
bleed to the frame's edges (R-DEV-008.C9). Never give a row child `min-width: 0` to make it fit, and
never position a popup, drawer or label absolutely without leaving it room at `fit`: the gallery's
geometry tests (IT-16) fail on a squeezed control or a frame narrower than its content. A tooltip
arrow drawn as `::after` hides the base `.mkd-tooltip__arrow`.

## 4. Check it

```sh
mockitdown elements acme -P packs --markdown     # the catalogue
mockitdown check examples/*.mockitdown -P packs   # your examples
python -m unittest tests.test_packs               # built-in packs: the contract
```

For a built-in pack, add a page to `python/examples/site/docs/packs/` with simple controls, forms, lists,
navigation and at least one complete screen following the framework's common patterns, in light and
dark (`appearance="both"`), and add it to the example site's navigation. Then generate the pack's
element catalogue into the specification's [Pack catalogue](../specification/packs/catalogue.md).

## Fidelity checklist

- Typography: font stack, base size, the type ramp, weights.
- Density: control heights, paddings, list row heights.
- Shape: radii per component, borders vs. elevation.
- Colour: accent and its on-colour, surfaces, status colours — in light and dark.
- States: hover is not shown; selected, disabled, error, on/off, progress must be.
- Chrome: the platform's window or device frame.


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.3.2 | 2026-11-25 | Built-in packs in shared/packs (#1) |
| 0.3.9 | 2026-11-25 | Fit padding token, rows and popups at fit, tooltip arrows (#8) |
| 0.3.11 | 2026-11-25 | Declared element samples (`sample`) (#10) |
