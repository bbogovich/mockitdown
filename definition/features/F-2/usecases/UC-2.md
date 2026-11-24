---
id: UC-2
title: Generate rows from data
---

**Actor:** specification author.

1. The author declares `let people = [("Ana", "Design"), ("Ben", "Engineering")]`.
2. The author writes `List { ForEach(people) { name, team in Row(name, subtitle: team) } }`.

**Outcome:** the mockup shows one row per person; adding a tuple adds a row.
