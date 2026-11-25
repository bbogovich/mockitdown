"""Diagnostics: located errors and warnings produced while parsing, expanding and rendering.

Every stage reports problems through a :class:`Diagnostics` collector instead of printing or
raising, so one bad element never hides the others. Only a syntax error stops processing; it is
raised as :class:`MockitdownSyntaxError` and carries the same :class:`Diagnostic`.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Severity(str, Enum):
    ERROR = "error"
    WARNING = "warning"


@dataclass(frozen=True)
class Location:
    """A 1-based position in a mockup source. ``source`` names the file for imported code."""

    line: int = 0
    col: int = 0
    source: str = ""

    def __str__(self) -> str:
        where = f"{self.source}:" if self.source else "line "
        return f"{where}{self.line}:{self.col}" if self.line else (self.source or "?")


@dataclass(frozen=True)
class Diagnostic:
    severity: Severity
    message: str
    location: Location = field(default_factory=Location)
    code: str = ""

    def __str__(self) -> str:
        code = f" [{self.code}]" if self.code else ""
        return f"{self.severity.value}{code} at {self.location}: {self.message}"


class MockitdownError(Exception):
    """Base class for errors raised by mockitdown."""

    def __init__(self, diagnostic: Diagnostic | str):
        if isinstance(diagnostic, str):
            diagnostic = Diagnostic(Severity.ERROR, diagnostic)
        self.diagnostic = diagnostic
        super().__init__(str(diagnostic))


class MockitdownSyntaxError(MockitdownError):
    """The source could not be tokenized or parsed."""


class Diagnostics:
    """An ordered collector of diagnostics, de-duplicated by (severity, message, location)."""

    def __init__(self) -> None:
        self._items: list[Diagnostic] = []
        self._seen: set[tuple] = set()

    def add(self, severity: Severity, message: str, location: Location | None = None, code: str = "") -> None:
        d = Diagnostic(severity, message, location or Location(), code)
        key = (d.severity, d.message, d.location)
        if key not in self._seen:
            self._seen.add(key)
            self._items.append(d)

    def error(self, message: str, location: Location | None = None, code: str = "") -> None:
        self.add(Severity.ERROR, message, location, code)

    def warning(self, message: str, location: Location | None = None, code: str = "") -> None:
        self.add(Severity.WARNING, message, location, code)

    def extend(self, items: list[Diagnostic]) -> None:
        for d in items:
            self.add(d.severity, d.message, d.location, d.code)

    @property
    def items(self) -> list[Diagnostic]:
        return list(self._items)

    @property
    def errors(self) -> list[Diagnostic]:
        return [d for d in self._items if d.severity is Severity.ERROR]

    @property
    def warnings(self) -> list[Diagnostic]:
        return [d for d in self._items if d.severity is Severity.WARNING]

    def __len__(self) -> int:
        return len(self._items)
