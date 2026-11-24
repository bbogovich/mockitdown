---
id: R-REND-011
title: Non-standard component roles
status: active
version: 0.3.0
rev: 0
page: REND.2
slot: reqs
order: 999
source: [SRC-4]
realizes: [F-8]
reverse_engineered: true
hash: 5f3cd88c2198
---

C1: The renderer MUST provide the roles spreadsheet, stickynote, board, boardcolumn, kanbancard, code, message, tree, treeitem, timeline, timelineitem, gantt, schedule, kbd, skeleton, swatches, canvas, media, emptystate, stat and map, and the base pack MUST name them Spreadsheet, StickyNote, Board, BoardColumn, KanbanCard, CodeEditor, CodeBlock, Terminal, MessageBubble, Comment, Tree, TreeItem, Timeline, TimelineItem, Gantt, Schedule, Kbd, Skeleton, ColorSwatches, Canvas, Whiteboard, VideoPlayer, EmptyState, Stat and Map, so every pack inherits them.
C2: The spreadsheet role MUST draw column letters and row numbers, cell values from `rows:` (numbers right-aligned), the range named by `selection:` (A1 notation) with a border and tint and its row and column headers marked, the cell named by `active:`, a formula bar when `formula:` is given, cell fills from `highlight:` and sheet tabs from `sheets:`.
C3: The code role MUST draw one line per source line with optional line numbers, the lines listed in `highlight:` marked, and keyword, string, number, comment, function and type spans for the languages swift, js/ts, python, go, rust, json, sql, shell and html; with `variant: terminal` it MUST draw a terminal window in which lines starting with a prompt are shown as commands.
C4: The gantt role MUST place each task `(name, start, length[, progress])` on a scale of `scale:` columns, draw a zero-length task as a milestone and draw `today:` as a vertical line; the schedule role MUST place each event `(title, day, start hour, end hour[, colour])` in its day column between `startHour` and `endHour` and draw `now:` as a horizontal line.
C5: The canvas role MUST be a positioned container in which children placed with `.position(x:y:)` (R-ANN-003) are laid out absolutely.
C6: Component roles MUST take their colours, radii and type from pack tokens so that every pack restyles them without new markup.
V1: `Spreadsheet(rows: [[1, 2]], selection: "A1:B1")` renders column headers A and B, row header 1, and both cells inside the selection.
V2: `Gantt(scale: ["W1","W2"], tasks: [("A", 0, 1), ("M", 1, 0)])` renders one bar and one milestone.
