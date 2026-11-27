**Problem.** A mockup that silently renders wrongly is worse than none.

**Change.** One bad element never hides the rest: every stage collects located diagnostics. The
page shows the errors; the log lists everything; strict mode turns errors into a failed build.

**Unknown labelled arguments (SRC-12#s13).** A misspelt or unsupported label used to vanish without a
trace, so an author could not tell why an argument had no effect, and an editor could not show it as
"not understood by this pack". It is now a warning.
