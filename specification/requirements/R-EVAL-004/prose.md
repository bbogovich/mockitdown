Arguments are data: the evaluator does not know what `systemImage` means — the render role does.
That is what lets a pack add framework-native argument names without code: the pack declares the
element's positional `params` and defaults, and the role reads whichever attribute names it
understands (see the role catalogue).
