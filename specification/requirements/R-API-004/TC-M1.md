---
id: TC-M1
title: The suite on every platform
verifies: [C3]
---

Before a release: run the Python suite (`python -m unittest discover -s tests -t .` in `python/`) under
Python 3.11 and the newest supported Python, on macOS, Windows and Linux, each in a fresh virtual
environment with `pip install -e "python[markdown]"`. Record the platforms, versions and results on the
release issue; a failure fails the release. CI runs Linux with Python 3.12 only.
