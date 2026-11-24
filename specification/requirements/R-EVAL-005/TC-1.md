---
id: TC-1
title: Component with slot and defaults
verifies: [C1, C2, C4, C9]
---

**Given** a struct with a `@ViewBuilder var content: Content` property and a defaulted property,
**when** it is called with a labelled argument and a trailing closure, **then** the closure's views
appear where the body names `content`, the default applies, and the root view carries
`data-component="<struct name>"`.

Automated by `tests/test_render.py::EvaluateRenderTests::test_struct_component_with_slot_and_defaults`.
