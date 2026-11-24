---
id: TC-1
title: Comments, numbers and ranges
verifies: [C3, C7, C9]
---

**Given** the source `/* a /* nested */ comment */ Text("x") // tail` followed by a line `ForEach(0...5) { i in Text("\(i)") }`,
**when** it is tokenized, **then** the comment produces no tokens, `0...5` produces NUMBER, RANGE_CLOSED,
NUMBER, and no error is raised. **Given** `Text(%)`, **then** a syntax error "unexpected character '%'"
is raised at line 1, column 6.

Automated by `tests/test_syntax.py` (`test_comments_and_semicolons`, `test_errors_are_located`).
