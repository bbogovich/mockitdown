# mockitdown — a VibeItOut prototype

Code is on this branch (`main`). The definition, the specification and the implementation site are on
`docs`, checked out at `../mockitdown.docs`. Never edit them here, and never put code there.

- A request to build or change something: the `vibe-change` skill. It defines, specifies and queues;
  the queue builds (`vibe-run`), one issue per clean session.
- A question the documents and the vault cannot answer: comment it on the issue, label it
  `needs-clarification`, move on. Answers: `vibe-answer`.
- Every issue ends with `sio commit <issue> --summary …`: docs first, then code.
- Build: `python3 -m pip install -e .` · Test: `python3 -m unittest discover -s tests`. Policies load on demand (`sio-policy need <topic>`).

## "Publish python module" (or "release", "publish to PyPI")

The request itself is the go-ahead: run these steps without asking again, except to settle the version.
PyPI never accepts a version number twice, so stop at the first failure and report it.

1. Preconditions: on `main`, working tree clean, `git pull --ff-only` done, and the tests pass
   with the real Zensical build: `ZENSICAL=$PWD/.venv/bin/zensical .venv/bin/python -m unittest discover -s tests -t .`
2. Version: use the one the user named. Otherwise pick it by semver from `git log $(git describe --tags --abbrev=0)..HEAD`
   (new packs, elements or options → minor; fixes only → patch), state it, and go on. Nothing new since the
   last tag → say so and stop.
3. Set `version` in `pyproject.toml`; commit `Release X.Y.Z` (with the attribution trailer); `git push`.
4. `git tag -a vX.Y.Z -m "mockitdown X.Y.Z" && git push origin vX.Y.Z`. This starts
   `.github/workflows/release.yml`, which checks tag = version, tests, builds and publishes through
   PyPI Trusted Publishing (environment `pypi`, no token).
5. `gh run watch <id> -R bbogovich/mockitdown --exit-status` on the `release` run for that tag.
6. Verify: `https://pypi.org/pypi/mockitdown/json` shows X.Y.Z with a wheel and an sdist; in a fresh
   venv in the scratchpad, `pip install "mockitdown[markdown]==X.Y.Z" mkdocs` and build a one-page MkDocs
   site with a `mockitdown` fence (`--strict`).
7. Report the version, the PyPI link and what changed since the previous release.

If the publish job fails after the tag is pushed: fix the cause, then release the next patch version
(never move or reuse a pushed tag that reached PyPI). If it failed before upload (tests, build), delete
the tag (`git push origin :refs/tags/vX.Y.Z && git tag -d vX.Y.Z`), fix, and tag again.
