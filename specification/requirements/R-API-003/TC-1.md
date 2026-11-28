---
id: TC-1
title: Render options and their mapping
verifies: [C1, C2]
---

Python unit tests `python/tests/test_api.py` `RenderOptionsTests`: `RenderOptions` has every field of
M-OPT-1 with its default and no other — a field a queued issue adds or retires is listed in the test
with that issue (`imports` #75, `edit` #23, `libraries` #78; `import_paths`, retired by #75); assigning a
field raises `FrozenInstanceError`; `RenderOptions(pack="fluent").with_overrides(device="phone", nope=1)`
is a new value with pack `fluent` and device `phone`, the original unchanged (C1, V1). Every key of
`FENCE_OPTIONS` is a field, and a fence with every attribute reaches `render` with each value, typed, on
the field of the same name; `mockitdown render` with every rendering flag (`--pack`, `--default-pack`,
`--device`, `--appearance`, `--width`, `--height`, `--chrome`, `--title`, `--windowed`, `--menubar`,
`--app`, `--elements`, `-A`, `-P`, `--no-embed`) reaches `render` with the corresponding option, and the
file sets `source_path` (C2). `-I` is covered with R-IMP-002 (#75).
