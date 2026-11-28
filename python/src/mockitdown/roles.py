"""The labels each render role reads (R-EVAL-004.C7, C8).

The table is data, written once in the repository's ``shared/language/roles.json`` and copied into
this package at build time as ``roles.json`` (R-REPO-002.C8); the TypeScript core reads the same
file. ``params`` at the top maps the labels every role reads through the common element markup
(state, variant, size, …) to their types; each rule's ``params`` maps the ones its role reads besides
(R-PACK-017.C1). The evaluator takes the labels, the keys, to warn about labelled arguments nothing
reads; the types and the rest of the table (the role rules of R-PACK-016) are the design tools' business.
"""

from __future__ import annotations

import json
from pathlib import Path

_DATA = json.loads((Path(__file__).resolve().parent / "roles.json").read_text(encoding="utf-8"))

#: The labels every role reads.
COMMON_READS = frozenset(_DATA.get("params", {}))

#: Render role → every label it reads (the common ones included). A role missing here reads unknown labels.
ROLE_READS: dict[str, frozenset[str]] = {
    role: COMMON_READS | frozenset(rule["params"])
    for role, rule in _DATA.get("roles", {}).items() if isinstance(rule.get("params"), dict)
}


def reads(role: str) -> frozenset[str] | None:
    """The labels `role` reads, or None when the table does not say (no warning is then possible)."""
    return ROLE_READS.get(role)
