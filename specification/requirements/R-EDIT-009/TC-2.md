---
id: TC-2
title: Commands for a host menu
verifies: [C8, C9]
---

`node:test`: `session.commands` lists the thirteen commands with labels and shortcuts, `enabled`
false for unwrap on a leaf; `session.run("wrap", {name: "VStack"})` equals `session.wrap("VStack")`.
Browser test: Cmd/Ctrl+G wraps the selection in a `VStack`.
