"""The resolved view tree: what the evaluator produces and the renderer consumes.

Everything here is plain data. Element attributes hold evaluated values:
``str``/``int``/``float``/``bool``/``None``/``list``/``dict``, :class:`EnumValue` for ``.member``
expressions, :class:`ViewList` for view-valued arguments and :class:`Thunk` for unevaluated
closures (actions, which are ignored).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from .diagnostics import Location

if TYPE_CHECKING:
    from .packs import ElementDef, Pack


@dataclass(frozen=True)
class EnumValue:
    """``.red``, ``Color.red`` (namespace "Color"), ``.system(size: 12)`` (with arguments)."""

    name: str
    namespace: str = ""
    args: tuple = ()
    kwargs: tuple[tuple[str, object], ...] = ()

    def kw(self, key: str, default: object = None) -> object:
        return dict(self.kwargs).get(key, default)

    def __str__(self) -> str:
        return self.name


@dataclass(frozen=True)
class CallValue:
    """A call of an unknown, non-view callee used as a value, e.g. ``GridItem(.flexible())``."""

    name: str
    args: tuple = ()
    kwargs: tuple[tuple[str, object], ...] = ()

    def kw(self, key: str, default: object = None) -> object:
        return dict(self.kwargs).get(key, default)


@dataclass
class Thunk:
    """A closure captured with its environment; evaluated only where views are expected."""

    closure: object  # syntax.ast.Closure
    env: object  # evaluate.Env


@dataclass
class ViewList:
    views: list[View]


@dataclass
class Modifier:
    name: str
    args: list = field(default_factory=list)
    kwargs: dict = field(default_factory=dict)
    content: list[View] | None = None
    #: Further labeled closures, e.g. `.alert("T", isPresented: true) { … } message: { … }`.
    slots: dict[str, list[View]] = field(default_factory=dict)
    loc: Location = field(default_factory=Location)

    def arg(self, i: int = 0, default: object = None) -> object:
        return self.args[i] if len(self.args) > i else default


@dataclass
class View:
    name: str
    role: str
    element: ElementDef | None = None
    attrs: dict[str, object] = field(default_factory=dict)
    extra_args: list = field(default_factory=list)
    children: list[View] = field(default_factory=list)
    slots: dict[str, list[View]] = field(default_factory=dict)
    modifiers: list[Modifier] = field(default_factory=list)
    #: Name of the user struct this view is the root of, if any.
    component: str = ""
    loc: Location = field(default_factory=Location)

    def mod(self, name: str) -> Modifier | None:
        for m in reversed(self.modifiers):
            if m.name == name:
                return m
        return None

    def has_mod(self, *names: str) -> bool:
        return any(m.name in names for m in self.modifiers)

    def attr(self, *names: str, default: object = None) -> object:
        for n in names:
            if n in self.attrs and self.attrs[n] is not None:
                return self.attrs[n]
        return default


@dataclass
class Screen:
    """One evaluated mockup: its views, the pack it renders with, and ``@Screen`` metadata."""

    views: list[View]
    pack: Pack
    meta: dict[str, object] = field(default_factory=dict)
    components: list[str] = field(default_factory=list)


def walk(views: list[View]):
    """Yield every view in a tree, depth first, including slot and modifier content."""
    for v in views:
        yield v
        yield from walk(v.children)
        for s in v.slots.values():
            yield from walk(s)
        for m in v.modifiers:
            if m.content:
                yield from walk(m.content)
            for s in m.slots.values():
                yield from walk(s)
        for a in v.attrs.values():
            if isinstance(a, ViewList):
                yield from walk(a.views)
