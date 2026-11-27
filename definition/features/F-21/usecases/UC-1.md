---
id: UC-1
title: Apply a structural edit and receive the text edits
---

**Actor:** a host application (for example a design-tool component).

**Precondition:** the host holds a mockup's code, formatted by its author, with comments and a `ForEach` loop.

1. The host parses the code and finds the node of a vertical stack.
2. The host asks the core to insert a `Toggle` as the stack's last child.
3. The core returns the text edits and the new tree.
4. The host applies the text edits to its copy of the code and renders it for editing.

**Outcome:** the code differs from the original only by the inserted line; the rendered toggle names its node; every
other call keeps its node identity.
