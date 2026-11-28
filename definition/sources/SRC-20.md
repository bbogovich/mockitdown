---
id: SRC-20
title: "Request: components may not embed themselves"
recorded: 2026-11-27
---

The developer's request of 2026-11-27, verbatim, given after #21 found that a struct using itself twice in its own body runs the evaluator out of memory.

<a id="request"></a>

> We should not allow a component to embed itself, the recursive case is not valid for UI components.
