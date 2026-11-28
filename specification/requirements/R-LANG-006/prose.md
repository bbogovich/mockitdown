Expressions cover what mockups need to compute labels and choose branches. The grammar is Swift's
precedence ladder without assignment, casts or custom operators.

A chained tuple index such as `t.1.1` lexes `1.1` as a number and is a syntax error; bind the inner
tuple first (`let u = t.1`, then `u.1`).
