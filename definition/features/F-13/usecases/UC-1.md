---
id: UC-1
title: Check mockups in continuous integration
---

**Actor:** developer.

1. CI runs `mockitdown check docs/mockups/*.mockitdown --json`.

**Outcome:** the job fails on any error, and the JSON lists each diagnostic with file, line and
column.
