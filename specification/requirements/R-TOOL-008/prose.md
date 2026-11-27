A light editor built for this project (SRC-12#s9): a `<textarea>` over a coloured copy of its text,
with line numbers, diagnostics in the gutter, bracket matching and auto-indent. It has no third-party
editor (SRC-12#s14 "Dependencies", ADR-20) and, by the developer's choice, no find and replace, folding
or multi-cursor; find and replace can be a later issue. It is usable on its own, for example to show code
beside a `mockitdown-mockup`.
