---
id: TC-1
title: Unknown element renders a placeholder
verifies: [C2]
---

**Given** `VStack { Foo { Text("in") } }` in the base pack, **when** it is rendered, **then** the
result has one error with code `unknown`, and the HTML contains `<div class="mkd-unknown" data-el="Foo">`
holding the name `Foo` and the `Text` child.

Automated by `tests/test_render.py::EvaluateRenderTests::test_unknown_element_is_an_error_but_renders`.
