---
id: UC-4
title: Build screens from a layout template
---

**Actor:** designer documenting several screens of one application.

1. The designer declares `struct AppShell: View` with a `title` property, a `sidebar` slot with
   default navigation, an optional `toolbar` slot and a `content` slot.
2. Each screen's block calls `AppShell(title: "Orders") { … }`, filling `content` with the screen
   and, where needed, `toolbar:` with its own buttons.

**Outcome:** every screen shares the shell's layout; each shows its own title and content, the
default sidebar unless it supplies one, and a toolbar only where it gave one.
