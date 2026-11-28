---
id: TC-1
title: The component roles
verifies: [C1, C2, C3, C4, C5, C6]
---

Python unit tests `python/tests/test_component_roles.py` `ComponentRoleTests`: each role of C1 exists, `base` defines
its elements on it and every pack inherits them (C1); a spreadsheet draws column letters and row numbers, its values
with numbers marked for right alignment, the `A1:B1` selection with its border and its headers marked, the active cell,
the formula bar, a fill and sheet tabs, and no formula bar without `formula:` (C2, V1); a code block numbers its lines,
marks a highlighted line, and draws keyword, string, number, comment, function and type spans for swift, js, ts,
python, go, rust, json, sql, shell and html, and a terminal draws a window with prompts and commands apart from output
(C3); a gantt chart places bars on its scale, a zero-length task as a milestone, progress and today, and a schedule
places events in their day columns between its hours and draws now (C4, V2); a canvas places positioned children
absolutely (C5); the components' markup is the same in base, Fluent, Material UI, Carbon and Windows 95, and the base
stylesheet gives them colours only through tokens except the fixed colours C6 allows, and type only through tokens
except the formula bar's fx glyph (C6).
