# mockitdown — a VibeItOut prototype

Code is on this branch (`main`). The definition, the specification and the implementation site are on
`docs`, checked out at `../mockitdown.docs`. Never edit them here, and never put code there.

- A request to build or change something: the `vibe-change` skill. It defines, specifies and queues;
  the queue builds (`vibe-run`), one issue per clean session.
- A question the documents and the vault cannot answer: comment it on the issue, label it
  `needs-clarification`, move on. Answers: `vibe-answer`.
- Every issue ends with `sio commit <issue> --summary …`: docs first, then code.
- Build: `python3 -m pip install -e .` · Test: `python3 -m unittest discover -s tests`. Policies load on demand (`sio-policy need <topic>`).
