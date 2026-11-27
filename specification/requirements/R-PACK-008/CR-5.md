---
id: R-PACK-008.CR-5
target: R-PACK-008
kind: revision
version: 0.11.0
date: 2026-11-27
summary: "SRC-18: further retro and handheld packs by their own requirements (C8), Retro and Mobile group order (C9); TC-1 covers every clause"
from: e30f6fcf1d71
to: 05ec55436cf9
---

## Clauses

@ meta.source
- [SRC-2, SRC-6, SRC-7]
+ [SRC-2, SRC-4, SRC-5, SRC-6, SRC-7, SRC-18]
@ C8 insert after C6
+ mockitdown MUST also ship the retro packs `gem` (R-PACK-022), `geos` (R-PACK-023), `amiga` (R-PACK-019), `riscos` (R-PACK-024) and `beos` (R-PACK-025) and the handheld packs `newton` (R-PACK-026), `palm` (R-PACK-027), `wince` (R-PACK-028) and `blackberry` (R-PACK-029), each as its own requirement says.
@ C9 insert after C8
+ The Retro group MUST list its packs in this order: `nls`, `xerox-star`, `lisa`, `mac-classic`, `gem`, `win1`, `geos`, `win2`, `amiga`, `gsos`, `nextstep`, `riscos`, `win31`, `win95`, `beos`, `macos9`, `cde`, `aqua`, `winxp`, `vista` (by the year each system first appeared); the Mobile group MUST list `swiftui`, `android`, `newton`, `palm`, `wince`, `blackberry`.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,24 @@
+---
+id: TC-1
+title: The shipped packs
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
+---
+
+Automated. Steps 2 to 5 are existing tests; steps 1 and 6 are new, written by the specification backfill
+issue for the pack area, and step 6 grows with each pack issue of C8.
+
+1. `python/tests/test_packs.py::test_shipped_packs` (new): `mockitdown packs` lists exactly the ids of C1,
+   C7 (without `lcars`, `phosphor`, `hologram`) and of C8 that are built, and `mockitdown packs --all`
+   adds the three easter eggs; every listed pack's `framework` and `version` keys are non-empty (C1, C6,
+   C7, C8).
+2. `test_packs_load_and_roles_exist`, `test_tokens_have_light_and_dark` and `test_module_names_are_unique`:
+   every pack loads, declares import modules, light and dark tokens, and its elements map to real roles;
+   the registry makes each extend `base` (R-PACK-003.C1) (C2).
+3. `python/tests/test_syntax.py` and the conformance cases of the `swiftui` area: `import SwiftUI`
+   selects `swiftui` (C3).
+4. `test_every_element_renders` and the Reference pages (R-PACK-012, `gen_reference.py --check`):
+   every element a pack defines renders, with its `doc` line and variants listed (C4).
+5. The conformance corpus (R-REPO-004.C2, every shipped pack at least once) and the SwiftUI and Material
+   control tests: style modifiers map to `variant` and render the framework's variants (C5).
+6. `python/tests/test_site_nav.py::test_group_order` (new): the Reference nav and `shared/reference/index.json`
+   list the Retro and Mobile groups in the order of C9, leaving out packs not yet built (C9).
--- a/prose.md
+++ b/prose.md
@@ -9 +9,5 @@
 Release 0.4 adds four web kits from the recommended-next list (Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer), the cross-platform .NET toolkit Avalonia UI and five retro systems (NLS, Windows 1.0, NeXTSTEP, Windows 95, Mac OS X Aqua); the retro pages are ordered by year so the section reads as a history of the GUI.
+**At 0.11.0 (SRC-18).** Four further retro systems, the Amiga and four handhelds join, each specified on
+the [Retro and handheld packs](retro-handheld.md) page. The Retro group is ordered by the year each
+system first appeared; the handhelds follow the current mobile frameworks in the Mobile group, which the
+generator assigns by their default device (`phone`).
```
