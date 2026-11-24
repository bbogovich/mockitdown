The lexical layer is Swift's, reduced to what a declarative view description needs. Newlines are
tokens because, as in Swift, they separate statements; the parser decides where they are
insignificant (inside argument lists, before a leading-dot modifier). Keywords that only matter in
pasted Swift (`private`, `static`, `some`, `return`) are recognised so that such code parses.
