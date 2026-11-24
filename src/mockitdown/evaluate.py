"""Evaluator: syntax tree → resolved :class:`~mockitdown.model.Screen`.

It selects the pack, loads imported component files, instantiates user ``struct`` views, expands
``ForEach``/``if``/``let``, interpolates strings and maps call arguments onto element attributes.
Problems are reported to a :class:`~mockitdown.diagnostics.Diagnostics`; evaluation always
completes, substituting an ``unknown`` view for anything it cannot resolve.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from . import vocabulary
from .diagnostics import Diagnostics, Location, MockitdownError, MockitdownSyntaxError
from .model import CallValue, EnumValue, Modifier, Screen, Thunk, View, ViewList
from .packs import Pack, PackRegistry
from .syntax import ast as A
from .syntax import parse

MAX_DEPTH = 48
MAX_ITERATIONS = 500


class Env:
    __slots__ = ("vars", "parent")

    def __init__(self, parent: Env | None = None, values: dict | None = None) -> None:
        self.vars: dict[str, object] = dict(values or {})
        self.parent = parent

    def lookup(self, name: str) -> tuple[bool, object]:
        e: Env | None = self
        while e is not None:
            if name in e.vars:
                return True, e.vars[name]
            e = e.parent
        return False, None

    def child(self, values: dict | None = None) -> Env:
        return Env(self, values)


@dataclass
class ImportContext:
    """Where ``import "path"`` statements are resolved."""

    search_paths: list[Path] = field(default_factory=list)
    #: Directory of the file holding the block (for relative imports), if known.
    base_dir: Path | None = None


class ImportCache:
    """Parsed component files keyed by resolved path and modification time."""

    def __init__(self) -> None:
        self._entries: dict[Path, tuple[float, A.Module]] = {}

    def load(self, path: Path) -> A.Module:
        mtime = path.stat().st_mtime
        hit = self._entries.get(path)
        if hit and hit[0] == mtime:
            return hit[1]
        mod = parse(path.read_text(encoding="utf-8"), source=str(path))
        self._entries[path] = (mtime, mod)
        return mod


_IMPORT_CACHE = ImportCache()


def format_value(v: object) -> str:
    if v is None:
        return "nil"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, float):
        return str(int(v)) if v.is_integer() else f"{v:g}"
    if isinstance(v, (EnumValue,)):
        return v.name
    if isinstance(v, list):
        return "[" + ", ".join(format_value(x) for x in v) + "]"
    if isinstance(v, ViewList):
        return ""
    return str(v)


def truthy(v: object) -> bool:
    if isinstance(v, (list, dict, str, tuple)):
        return len(v) > 0
    return bool(v)


class Evaluator:
    def __init__(self, registry: PackRegistry, diagnostics: Diagnostics, *, default_pack: str = "base",
                 pack_override: str | None = None, imports: ImportContext | None = None) -> None:
        self.registry = registry
        self.diags = diagnostics
        self.default_pack = default_pack
        self.pack_override = pack_override
        self.imports = imports or ImportContext()
        self.structs: dict[str, A.StructDecl] = {}
        self.pack: Pack | None = None
        self.depth = 0
        self.used_components: list[str] = []
        #: True while rendering the implicit preview of a declarations-only block.
        self.preview = False

    # --- entry -----------------------------------------------------------------------------------

    def evaluate(self, module: A.Module) -> Screen:
        meta = self._directives(module)
        self.pack = self._select_pack(module, meta)
        self._load_imports(module.imports, self.imports.base_dir, set())
        for s in module.structs:
            self.structs[s.name] = s
        env = Env()
        statements = module.statements
        if not statements and module.structs:
            # A block holding only declarations renders its last struct, as an Xcode preview would.
            last = module.structs[-1]
            statements = [A.ExprStmt(A.Call(A.Ident(last.name, last.loc), [], [], last.loc), last.loc)]
            self.preview = True
        views = self.block(statements, env)
        if not views:
            self.diags.warning("the mockup has no views", Location(1, 1, module.source), "empty")
        return Screen(views=views, pack=self.pack, meta=meta, components=self.used_components)

    def _directives(self, module: A.Module) -> dict[str, object]:
        meta: dict[str, object] = {}
        env = Env()
        for attr in module.attributes:
            if attr.name != "Screen":
                self.diags.warning(f"unknown directive @{attr.name}", attr.loc, "directive")
                continue
            for i, arg in enumerate(attr.args):
                key = arg.label or ("title" if i == 0 else f"_{i}")
                val = self.value(arg.value, env)
                meta[key] = val.name if isinstance(val, EnumValue) else val
        return meta

    def _select_pack(self, module: A.Module, meta: dict) -> Pack:
        chosen: str | None = None
        for imp in module.imports:
            if imp.module is None:
                continue
            pid = self.registry.for_module(imp.module)
            if pid:
                if chosen and chosen != pid:
                    self.diags.warning(f"import {imp.module} selects pack {pid!r}, but {chosen!r} is already "
                                       "selected; the first import wins", imp.loc, "pack")
                    continue
                chosen = chosen or pid
            elif imp.module not in vocabulary.NEUTRAL_MODULES:
                self.diags.warning(f"import {imp.module} names no known pack", imp.loc, "pack")
        if not chosen and isinstance(meta.get("pack"), str):
            chosen = str(meta["pack"])
        pid = self.pack_override or chosen or self.default_pack
        try:
            return self.registry.get(pid)
        except MockitdownError as e:
            self.diags.error(str(e.diagnostic.message), Location(1, 1, module.source), "pack")
            return self.registry.get("base")

    def _resolve_import(self, path: str, base_dir: Path | None) -> Path | None:
        candidates: list[Path] = []
        p = Path(path)
        if p.is_absolute():
            candidates.append(p)
        else:
            if base_dir is not None:
                candidates.append(base_dir / p)
            candidates.extend(d / p for d in self.imports.search_paths)
        for c in candidates:
            for cand in (c, c.with_name(c.name + ".mockitdown")):
                if cand.is_file():
                    return cand.resolve()
        return None

    def _load_imports(self, imports: list[A.Import], base_dir: Path | None, seen: set[Path]) -> None:
        for imp in imports:
            if imp.path is None:
                continue
            resolved = self._resolve_import(imp.path, base_dir)
            if resolved is None:
                searched = ", ".join(str(d) for d in self.imports.search_paths) or "(no import paths)"
                self.diags.error(f"cannot find import {imp.path!r} (searched {searched})", imp.loc, "import")
                continue
            if resolved in seen:
                continue
            seen.add(resolved)
            try:
                mod = _IMPORT_CACHE.load(resolved)
            except MockitdownSyntaxError as e:
                self.diags.extend([e.diagnostic])
                continue
            except OSError as e:
                self.diags.error(f"cannot read import {imp.path!r}: {e}", imp.loc, "import")
                continue
            self._load_imports(mod.imports, resolved.parent, seen)
            for s in mod.structs:
                if s.name in self.structs and self.structs[s.name].source != s.source:
                    self.diags.warning(f"struct {s.name} from {resolved.name} replaces an earlier definition",
                                       s.loc, "import")
                self.structs[s.name] = s
            if mod.statements:
                self.diags.warning(f"{resolved.name}: top-level views in an imported file are ignored",
                                   mod.statements[0].loc, "import")

    # --- statements → views ----------------------------------------------------------------------

    def block(self, stmts: list[A.Node], env: Env) -> list[View]:
        out: list[View] = []
        local = env.child()
        for st in stmts:
            if isinstance(st, A.LetStmt):
                local.vars[st.name] = self.value(st.value, local)
            elif isinstance(st, A.IfStmt):
                branch = st.then if truthy(self.value(st.cond, local)) else st.other
                out.extend(self.block(branch, local))
            elif isinstance(st, A.ExprStmt):
                out.extend(self.views(st.expr, local))
            else:  # pragma: no cover - parser produces only the above
                self.diags.error("unsupported statement", st.loc)
        return out

    def run_thunk(self, thunk: Thunk, args: list | None = None) -> list[View]:
        closure: A.Closure = thunk.closure  # type: ignore[assignment]
        values = {}
        if closure.params:
            args = args or []
            if len(closure.params) > 1 and len(args) == 1 and isinstance(args[0], (tuple, list)):
                args = list(args[0])
            for i, name in enumerate(closure.params):
                if name != "_":
                    values[name] = args[i] if i < len(args) else None
        return self.block(closure.body, thunk.env.child(values))  # type: ignore[union-attr]

    def views(self, expr: A.Node, env: Env) -> list[View]:
        if isinstance(expr, A.Call):
            callee = expr.callee
            if isinstance(callee, A.Member):
                return self._apply_modifier(callee, expr, env)
            if isinstance(callee, A.Ident):
                return self._call_view(callee.name, expr, env)
            self.diags.error("this expression does not produce a view", expr.loc, "view")
            return []
        if isinstance(expr, A.Member):
            if isinstance(expr.base, A.Ident) and expr.base.name == "Color" and self.pack.element("Color"):
                return [self._element_view("Color", A.Call(A.Ident("Color", expr.loc),
                                                            [A.Arg(None, A.EnumCase(expr.name, expr.loc))],
                                                            [], expr.loc), env)]
            # `view.modifier` without parentheses: Swift requires them; accept leniently.
            return self._apply_modifier(expr, A.Call(expr, [], [], expr.loc), env)
        if isinstance(expr, A.Ident):
            found, val = env.lookup(expr.name)
            if found:
                return self._views_from_value(val, expr.loc)
            if expr.name in self.structs or self.pack.element(expr.name):
                return self._call_view(expr.name, A.Call(expr, [], [], expr.loc), env)
            self.diags.error(f"unknown view or variable {expr.name!r}", expr.loc, "unknown")
            return [View(expr.name, "unknown", loc=expr.loc)]
        if isinstance(expr, (A.Literal, A.StringLit)) and self.pack.element("Text"):
            text = self.value(expr, env)
            return [self._element_view("Text", A.Call(A.Ident("Text", expr.loc), [A.Arg(None, A.Literal(text))],
                                                      [], expr.loc), env)]
        if isinstance(expr, A.Ternary):
            return self.views(expr.then if truthy(self.value(expr.cond, env)) else expr.other, env)
        self.diags.error("this expression does not produce a view", expr.loc, "view")
        return []

    def _views_from_value(self, val: object, loc: Location) -> list[View]:
        if isinstance(val, Thunk):
            return self.run_thunk(val)
        if isinstance(val, ViewList):
            return val.views
        if isinstance(val, (str, int, float)) and self.pack.element("Text"):
            return [self._element_view("Text", A.Call(A.Ident("Text", loc), [A.Arg(None, A.Literal(val))], [], loc),
                                       Env())]
        if val is None:
            return []
        self.diags.error(f"a {type(val).__name__} value is not a view", loc, "view")
        return []

    def _call_view(self, name: str, call: A.Call, env: Env) -> list[View]:
        if name == "ForEach":
            return self._for_each(call, env)
        if name in self.structs:
            return self._instantiate(self.structs[name], call, env)
        found, val = env.lookup(name)
        if found:  # calling a view-typed property: `content()`
            return self._views_from_value(val, call.loc)
        if self.pack.element(name):
            return [self._element_view(name, call, env)]
        self.diags.error(f"{name!r} is not an element of pack {self.pack.id!r} and no struct of that name "
                         "is declared or imported", call.loc, "unknown")
        v = View(name, "unknown", loc=call.loc)
        v.children = self._trailing_children(call, env)
        return [v]

    def _trailing_children(self, call: A.Call, env: Env) -> list[View]:
        out: list[View] = []
        for label, closure in call.trailing:
            if label is None:
                out.extend(self.block(closure.body, env))
        return out

    def _for_each(self, call: A.Call, env: Env) -> list[View]:
        data: object = []
        body: Thunk | None = None
        for i, arg in enumerate(call.args):
            if arg.label in (None, "data") and i == 0:
                data = self.value(arg.value, env)
            elif arg.label == "content":
                v = self.value(arg.value, env)
                body = v if isinstance(v, Thunk) else None
        for label, closure in call.trailing:
            if label in (None, "content"):
                body = Thunk(closure, env)
        if body is None:
            self.diags.error("ForEach needs a content closure", call.loc, "foreach")
            return []
        if isinstance(data, int):
            data = list(range(data))
        elif isinstance(data, dict):
            data = list(data.items())
        elif isinstance(data, str):
            data = [data]
        if not isinstance(data, (list, tuple)):
            self.diags.error("ForEach needs an array, a range or a count", call.loc, "foreach")
            return []
        if len(data) > MAX_ITERATIONS:
            self.diags.warning(f"ForEach truncated to {MAX_ITERATIONS} items", call.loc, "foreach")
            data = list(data)[:MAX_ITERATIONS]
        out: list[View] = []
        for item in data:
            out.extend(self.run_thunk(body, [item]))
        return out

    def _instantiate(self, decl: A.StructDecl, call: A.Call, env: Env) -> list[View]:
        if self.depth >= MAX_DEPTH:
            self.diags.error(f"struct {decl.name} nests too deeply (recursive?)", call.loc, "recursion")
            return []
        if decl.name not in self.used_components:
            self.used_components.append(decl.name)
        props = [p for p in decl.properties]
        by_name = {p.name: p for p in props}
        bound: dict[str, object] = {}
        positional: list[object] = []
        for arg in call.args:
            if arg.label is None:
                positional.append(self.value(arg.value, env))
            elif arg.label in by_name:
                bound[arg.label] = self.value(arg.value, env)
            else:
                self.diags.warning(f"struct {decl.name} has no property {arg.label!r}", call.loc, "argument")
        for label, closure in call.trailing:
            thunk = Thunk(closure, env)
            if label is None:
                target = next((p.name for p in props if p.is_view and p.name not in bound
                               and "computed" not in p.attributes), None)
                if target is None:
                    self.diags.warning(f"struct {decl.name} has no view property for a trailing closure",
                                       call.loc, "argument")
                else:
                    bound[target] = thunk
            elif label in by_name:
                bound[label] = thunk
            else:
                self.diags.warning(f"struct {decl.name} has no property {label!r}", call.loc, "argument")
        senv = Env()
        pos_iter = iter(positional)
        for p in props:
            if "computed" in p.attributes:
                senv.vars[p.name] = Thunk(p.default, senv)
                continue
            if p.name in bound:
                senv.vars[p.name] = bound[p.name]
                continue
            nxt = next(pos_iter, _MISSING)
            if nxt is not _MISSING:
                senv.vars[p.name] = nxt
            elif p.default is not None:
                senv.vars[p.name] = self.value(p.default, senv)
            elif self.preview and self.depth == 0:
                senv.vars[p.name] = None if p.is_view else p.name  # placeholder text in a preview
            else:
                if not p.type.endswith("?"):
                    self.diags.error(f"missing argument {p.name!r} for struct {decl.name}", call.loc, "argument")
                senv.vars[p.name] = None
        if next(pos_iter, _MISSING) is not _MISSING:
            self.diags.warning(f"too many arguments for struct {decl.name}", call.loc, "argument")
        if decl.body is None:
            self.diags.error(f"struct {decl.name} has no `var body: some View {{ … }}`", decl.loc, "struct")
            return []
        self.depth += 1
        try:
            views = self.block(decl.body, senv)
        finally:
            self.depth -= 1
        for v in views:
            v.component = v.component or decl.name
        return views

    def _element_view(self, name: str, call: A.Call, env: Env) -> View:
        el = self.pack.element(name)
        assert el is not None
        attrs: dict[str, object] = el.default_attrs
        extra: list[object] = []
        positional: list[object] = []
        for arg in call.args:
            val = self.value(arg.value, env)
            if arg.label is None:
                positional.append(val)
            else:
                label = dict(el.attrs).get(arg.label) or self.pack.attrs.get(arg.label, arg.label)
                attrs[label] = val
        for i, val in enumerate(positional):
            if i < len(el.params):
                attrs[el.params[i]] = val
            else:
                extra.append(val)
        view = View(name, el.role, el, attrs, extra, loc=call.loc)
        for label, closure in call.trailing:
            views = self.block(closure.body, env)
            if label is None:
                view.children = views
            else:
                view.slots[label] = views
        # A closure passed as a labelled argument (`content: { … }`) is a slot too.
        for key, val in list(attrs.items()):
            if isinstance(val, Thunk):
                if key in ("action", "onCommit", "onEditingChanged", "perform"):
                    del attrs[key]
                    continue
                views = self.run_thunk(val)
                del attrs[key]
                if key == "content" and not view.children:
                    view.children = views
                else:
                    view.slots[key] = views
            elif isinstance(val, ViewList):
                view.slots.setdefault(key, val.views)
        return view

    def _apply_modifier(self, member: A.Member, call: A.Call, env: Env) -> list[View]:
        targets = self.views(member.base, env)
        name = member.name
        if name in vocabulary.IGNORED and name not in self.pack.modifiers:
            return targets  # behaviour only (.onTapGesture { … }): its closures are never evaluated
        args: list[object] = []
        kwargs: dict[str, object] = {}
        for arg in call.args:
            val = self.value(arg.value, env)
            if arg.label is None:
                args.append(val)
            else:
                kwargs[arg.label] = val
        content: list[View] | None = None
        slots: dict[str, list[View]] = {}
        for label, closure in call.trailing:
            views = self.block(closure.body, env)
            if label is None:
                content = views
            else:
                slots[label] = views
        for key in list(kwargs):
            val = kwargs[key]
            if isinstance(val, Thunk):
                del kwargs[key]
                if key not in ("action", "perform"):
                    slots[key] = self.run_thunk(val)
            elif isinstance(val, ViewList) and content is None and key == "content":
                content = val.views
        if content is None:
            for i, a in enumerate(args):
                if isinstance(a, ViewList):
                    content = a.views
                    args.pop(i)
                    break
        spec = self.pack.modifiers.get(name)
        if spec is None and name not in vocabulary.RENDERED and name not in vocabulary.IGNORED:
            self.diags.warning(f"unknown modifier .{name}() is ignored", member.loc, "modifier")
            return targets
        if name in vocabulary.IGNORED and spec is None:
            return targets
        for v in targets:
            if spec is not None:
                attr = spec.get("attr", name)
                if "value" in spec:
                    value = spec["value"]
                elif args:
                    value = args[0]
                elif kwargs:
                    value = next(iter(kwargs.values()))
                else:
                    value = True
                if isinstance(value, EnumValue):
                    value = value.name
                v.attrs[attr] = value
            else:
                v.modifiers.append(Modifier(name, list(args), dict(kwargs), content, slots, member.loc))
        return targets

    # --- values ----------------------------------------------------------------------------------

    def value(self, expr: A.Node, env: Env) -> object:
        if isinstance(expr, A.Literal):
            return expr.value
        if isinstance(expr, A.StringLit):
            return "".join(p if isinstance(p, str) else format_value(self.value(p, env)) for p in expr.parts)
        if isinstance(expr, A.Ident):
            found, val = env.lookup(expr.name)
            if found:
                return val
            if expr.name in self.structs or (self.pack and self.pack.element(expr.name)):
                return ViewList(self.views(expr, env))
            self.diags.error(f"unknown name {expr.name!r}", expr.loc, "unknown")
            return None
        if isinstance(expr, A.EnumCase):
            return EnumValue(expr.name)
        if isinstance(expr, A.Member):
            return self._member_value(expr, env)
        if isinstance(expr, A.Call):
            return self._call_value(expr, env)
        if isinstance(expr, A.ArrayLit):
            return [self.value(i, env) for i in expr.items]
        if isinstance(expr, A.DictLit):
            return {format_value(self.value(k, env)) if not isinstance(k, A.Literal) else k.value:
                    self.value(v, env) for k, v in expr.items}
        if isinstance(expr, A.TupleLit):
            if any(a.label for a in expr.items):
                return {a.label or str(i): self.value(a.value, env) for i, a in enumerate(expr.items)}
            return tuple(self.value(a.value, env) for a in expr.items)
        if isinstance(expr, A.RangeExpr):
            lo, hi = self.value(expr.lo, env), self.value(expr.hi, env)
            if not isinstance(lo, int) or not isinstance(hi, int):
                self.diags.error("a range needs integer bounds", expr.loc, "value")
                return []
            return list(range(lo, hi + 1 if expr.inclusive else hi))
        if isinstance(expr, A.Unary):
            v = self.value(expr.operand, env)
            if expr.op == "!":
                return not truthy(v)
            if isinstance(v, (int, float)):
                return -v
            self.diags.error("'-' needs a number", expr.loc, "value")
            return None
        if isinstance(expr, A.Binary):
            return self._binary(expr, env)
        if isinstance(expr, A.Ternary):
            return self.value(expr.then if truthy(self.value(expr.cond, env)) else expr.other, env)
        if isinstance(expr, A.Subscript):
            base, idx = self.value(expr.base, env), self.value(expr.index, env)
            try:
                return base[idx]  # type: ignore[index]
            except (KeyError, IndexError, TypeError):
                self.diags.error("subscript out of range", expr.loc, "value")
                return None
        if isinstance(expr, A.KeyPath):
            return None
        if isinstance(expr, A.Closure):
            return Thunk(expr, env)
        self.diags.error("unsupported expression", expr.loc, "value")
        return None

    def _binary(self, expr: A.Binary, env: Env) -> object:
        op = expr.op
        if op == "&&":
            return truthy(self.value(expr.left, env)) and truthy(self.value(expr.right, env))
        if op == "||":
            return truthy(self.value(expr.left, env)) or truthy(self.value(expr.right, env))
        a, b = self.value(expr.left, env), self.value(expr.right, env)
        try:
            if op == "==":
                return a == b
            if op == "!=":
                return a != b
            if op == "+":
                if isinstance(a, str) or isinstance(b, str):
                    return format_value(a) + format_value(b)
                return a + b  # type: ignore[operator]
            if op == "-":
                return a - b  # type: ignore[operator]
            if op == "*":
                return a * b  # type: ignore[operator]
            if op == "/":
                return a / b if isinstance(a, float) or isinstance(b, float) else a // b  # type: ignore[operator]
            if op == "<":
                return a < b  # type: ignore[operator]
            if op == ">":
                return a > b  # type: ignore[operator]
            if op == "<=":
                return a <= b  # type: ignore[operator]
            if op == ">=":
                return a >= b  # type: ignore[operator]
        except (TypeError, ZeroDivisionError):
            self.diags.error(f"cannot apply {op!r} to these values", expr.loc, "value")
            return None
        return None

    def _is_view_expr(self, expr: A.Node, env: Env) -> bool:
        """Whether an expression's root is a view call (so a member call on it is a modifier)."""
        while isinstance(expr, (A.Call, A.Member)):
            expr = expr.callee if isinstance(expr, A.Call) else expr.base
        if isinstance(expr, A.Ident):
            if env.lookup(expr.name)[0]:
                found = env.lookup(expr.name)[1]
                return isinstance(found, (Thunk, ViewList))
            return expr.name in self.structs or bool(self.pack and self.pack.element(expr.name))
        return False

    def _member_value(self, expr: A.Member, env: Env) -> object:
        base = expr.base
        if isinstance(base, A.Ident):
            found, _ = env.lookup(base.name)
            if not found and base.name not in self.structs:
                return EnumValue(expr.name, namespace=base.name)
        val = self.value(base, env)
        name = expr.name
        if isinstance(val, dict):
            if name in val:
                return val[name]
        if isinstance(val, (list, tuple, str, dict)):
            if name == "count":
                return len(val)
            if name == "isEmpty":
                return len(val) == 0
            if isinstance(val, (list, tuple)) and name in ("first", "last"):
                return (val[0] if name == "first" else val[-1]) if val else None
        if isinstance(val, tuple) and name.isdigit() and int(name) < len(val):
            return val[int(name)]
        if isinstance(val, EnumValue):
            return EnumValue(name, namespace=val.name)
        if isinstance(val, str) and name in ("self",):
            return val
        self.diags.error(f"value has no member {name!r}", expr.loc, "value")
        return None

    def _call_value(self, expr: A.Call, env: Env) -> object:
        callee = expr.callee
        args = [self.value(a.value, env) for a in expr.args if a.label is None]
        kwargs = tuple((a.label, self.value(a.value, env)) for a in expr.args if a.label is not None)
        if isinstance(callee, A.EnumCase):
            if callee.name == "constant" and len(args) == 1:  # Binding.constant(x)
                return args[0]
            return EnumValue(callee.name, args=tuple(args), kwargs=kwargs)
        if isinstance(callee, A.Ident):
            n = callee.name
            if n in self.structs or n == "ForEach" or (self.pack and self.pack.element(n)):
                return ViewList(self.views(expr, env))
            found, val = env.lookup(n)
            if found and isinstance(val, Thunk):
                return ViewList(self.run_thunk(val))
            return CallValue(n, tuple(args), kwargs)
        if isinstance(callee, A.Member):
            # String / collection methods; otherwise a view with modifiers used as a value.
            if callee.name in ("uppercased", "lowercased", "capitalized"):
                s = self.value(callee.base, env)
                if isinstance(s, str):
                    return s.upper() if callee.name == "uppercased" else (
                        s.lower() if callee.name == "lowercased" else s.title())
            if callee.name == "joined":
                seq = self.value(callee.base, env)
                if isinstance(seq, (list, tuple)):
                    sep = dict(kwargs).get("separator", "")
                    return str(sep).join(format_value(x) for x in seq)
            if isinstance(callee.base, (A.EnumCase, A.Member, A.Call)) and not self._is_view_expr(callee.base, env):
                base_val = self.value(callee.base, env)
                if isinstance(base_val, EnumValue):  # .red.opacity(0.3), .title.bold()
                    return EnumValue(callee.name, namespace=base_val.name, args=tuple(args), kwargs=kwargs)
            if isinstance(callee.base, A.Ident) and not env.lookup(callee.base.name)[0] \
                    and not self.pack.element(callee.base.name) and callee.base.name not in self.structs:
                return EnumValue(callee.name, namespace=callee.base.name, args=tuple(args), kwargs=kwargs)
            return ViewList(self.views(expr, env))
        return CallValue("", tuple(args), kwargs)


_MISSING = object()
