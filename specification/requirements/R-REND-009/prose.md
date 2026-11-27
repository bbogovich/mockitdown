SwiftUI attaches navigation chrome and presentations to the content, not to the container; the
renderer reassembles them the way SwiftUI would draw them, so idiomatic code yields the expected
screen.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.
