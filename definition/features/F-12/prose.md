**Problem.** A mockup that silently renders wrongly is worse than none.

**Change.** One bad element never hides the rest: every stage collects located diagnostics. The
page shows the errors; the log lists everything; strict mode turns errors into a failed build.
