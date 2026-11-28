"""The labels each render role reads (R-EVAL-004.C7, C8).

The table is data, written once in the repository's ``shared/language/roles.json`` and copied into
this package at build time as ``roles.json`` (R-REPO-002.C8); the TypeScript core reads the same
file. ``reads`` at the top lists the labels every role reads through the common element markup
(state, variant, size, …); each rule's ``reads`` lists the ones its role reads besides. The evaluator
uses them to warn about labelled arguments nothing reads; the rest of the table (the role rules of
R-PACK-016) is the design tools' business.
"""

from __future__ import annotations

import json
from pathlib import Path

_DATA = json.loads((Path(__file__).resolve().parent / "roles.json").read_text(encoding="utf-8"))

#: The labels every role reads.
COMMON_READS = frozenset(_DATA.get("reads", ()))

#: Render role → every label it reads (the common ones included). A role missing here reads unknown labels.
ROLE_READS: dict[str, frozenset[str]] = {
    role: COMMON_READS | frozenset(rule["reads"])
    for role, rule in _DATA.get("roles", {}).items() if "reads" in rule
}


def reads(role: str) -> frozenset[str] | None:
    """The labels `role` reads, or None when the table does not say (no warning is then possible)."""
    return ROLE_READS.get(role)
