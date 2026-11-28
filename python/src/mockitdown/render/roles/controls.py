"""Control roles: buttons, toggles, choices, fields, pickers, sliders, steppers, dates, drop zones.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

import calendar
import datetime as _dt
import re

from ...model import View
from .._util import PH, _bool, _fmt, _name, _num, esc, text_html


#: Roles a picker takes its options from (any other child counts when it has a ``.tag``).
OPTION_ROLES = ("text", "label", "button", "listitem", "menuitem", "tab", "radio")
#: SwiftUI picker styles showing one value: without ``selection:`` they show the first option (R-PACK-014.C6).
PICKER_FIRST = ("automatic", "menu", "navigationLink", "palette", "wheel")
#: SwiftUI picker styles drawing their options; without options they fall back to the menu style.
PICKER_OPTIONS = ("segmented", "palette", "inline", "radioGroup", "radio", "wheel")
#: SwiftUI date picker styles (R-PACK-014.C2): they always show a selection, 23 Nov 2026 9:41 AM by default.
DATE_STYLES = ("automatic", "compact", "graphical", "wheel", "field", "stepperField")
DEFAULT_DATE = _dt.date(2026, 11, 23)
DEFAULT_TIME = (9, 41)
WEEKDAY_ABBR = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


class ControlRoles:
    """Control roles: buttons, toggles, choices, fields, pickers, sliders, steppers, dates, drop zones."""

    def r_button(self, v: View) -> str:
        if self.in_menu:
            return self.r_menuitem(v)
        label = self.text_or_slot(v, "label", "title", "text")
        if v.children:
            label = self.views(v.children)
        icon = v.attr("systemImage", "icon", "startIcon", "leadingIcon")
        icon_only = _bool(v.attr("iconOnly")) or _name(v.attr("labelStyle")) == "iconOnly" or (not label and icon)
        data = {}
        role = v.attr("role")
        if role:
            data["role"] = _name(role)
        if icon_only:
            data["icon-only"] = "true"
        parts = []
        if icon:
            parts.append(f'<span class="mkd-button__icon">{self.icon(icon, v=v)}</span>')
        if label and not (icon_only and icon):
            parts.append(f'<span class="mkd-button__label">{label}</span>')
        end = v.attr("trailingIcon", "endIcon")
        if end:
            parts.append(f'<span class="mkd-button__icon mkd-button__icon--end">{self.icon(end, v=v)}</span>')
        if _bool(v.attr("dropdown", "menu", "split")):
            parts.append(f'<span class="mkd-button__caret">{self.icon("chevron.down")}</span>')
        if _bool(v.attr("loading")):
            parts.insert(0, '<span class="mkd-button__spinner"></span>')
        parts.append(self.badge_html(v.attr("badge"), "mkd-badge mkd-button__badge"))
        aria = {"role": "button"}
        if icon_only and label:
            aria["aria-label"] = re.sub(r"<[^>]+>", "", label)
        return self.open(v, "button", "span", data=data, attrs=aria) + "".join(parts) + "</span>"

    def r_fab(self, v: View) -> str:
        icon = v.attr("systemImage", "icon") or "plus"
        label = self.content(v.attr("label", "text", "title"))
        inner = f'<span class="mkd-fab__icon">{self.icon(icon, v=v)}</span>' + (
            f'<span class="mkd-fab__label">{label}</span>' if label else "")
        markup = self.open(v, "fab", "span", data={"extended": "true"} if label else {}, attrs={"role": "button"}) \
            + inner + "</span>"
        if _bool(v.attr("inline")):
            return markup
        pos = _name(v.attr("position", "placement")) or "bottomTrailing"
        self.overlays.append(f'<div class="mkd-layer" data-kind="fab" data-position="{esc(pos)}">{markup}</div>')
        return ""

    def r_toggle(self, v: View) -> str:
        variant = _name(v.attr("variant"))
        if variant in ("checkbox", "check"):
            return self.r_checkbox(v)
        on = _bool(v.attr("isOn", "on", "checked", "value", "selected"))
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        desc = self.content(v.attr("description", "subtitle"))
        if variant == "button":
            return self.open(v, "button", "span", data={"pressed": "true" if on else "false"},
                             attrs={"role": "button"}) + f'<span class="mkd-button__label">{label}</span></span>'
        text = ""
        if label or desc:
            text = (f'<span class="mkd-toggle__text"><span class="mkd-toggle__label">{label}</span>'
                    + (f'<span class="mkd-toggle__description">{desc}</span>' if desc else "") + "</span>")
        state_text = v.attr("onText" if on else "offText")
        st = f'<span class="mkd-toggle__state">{esc(_fmt(state_text))}</span>' if state_text else ""
        return (self.open(v, "toggle", "span", data={"on": "true" if on else "false"},
                          attrs={"role": "switch", "aria-checked": "true" if on else "false"})
                + text + '<span class="mkd-toggle__track"><span class="mkd-toggle__thumb"></span></span>' + st
                + "</span>")

    def r_checkbox(self, v: View) -> str:
        raw = v.attr("checked", "isOn", "on", "value", "selected", "state")
        state = "mixed" if _name(raw) in ("indeterminate", "mixed") else ("true" if _bool(raw) else "false")
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        mark = self.icon("minus" if state == "mixed" else "checkmark") if state != "false" else ""
        return (self.open(v, "checkbox", "span", data={"checked": state},
                          attrs={"role": "checkbox", "aria-checked": state})
                + f'<span class="mkd-checkbox__box">{mark}</span>'
                + (f'<span class="mkd-checkbox__label">{label}</span>' if label else "") + "</span>")

    def r_radio(self, v: View) -> str:
        on = _bool(v.attr("checked", "selected", "isOn", "value"))
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        return (self.open(v, "radio", "span", data={"checked": "true" if on else "false"},
                          attrs={"role": "radio", "aria-checked": "true" if on else "false"})
                + '<span class="mkd-radio__dot"></span>'
                + (f'<span class="mkd-radio__label">{label}</span>' if label else "") + "</span>")

    def _options(self, v: View) -> list[tuple[str, str]]:
        """(plain label, markup) pairs from `options`/`items` or children."""
        opts = v.attr("options", "items", "choices", "segments")
        out: list[tuple[str, str]] = []
        if isinstance(opts, (list, tuple)):
            for o in opts:
                if isinstance(o, dict):
                    lab = _fmt(o.get("label", o.get("title", "")))
                    icon = o.get("icon", o.get("systemImage"))
                    out.append((lab, (f'<span class="mkd-option__icon">{self.icon(icon, v=v)}</span>' if icon else "")
                                + text_html(lab)))
                else:
                    out.append((_fmt(o), text_html(_fmt(o))))
        else:
            for c in v.children:
                if c.role in OPTION_ROLES or c.attr("tag") is not None:
                    lab = _fmt(c.attr("content", "title", "label", "text"))
                    saved = self.in_menu
                    self.in_menu = False
                    markup = text_html(lab) if c.role in OPTION_ROLES and c.role != "label" else self.view(c)
                    self.in_menu = saved
                    out.append((lab, markup))
        return out

    def _option_tags(self, v: View) -> list[str | None]:
        """The ``.tag`` of each option taken from the children (parallel to `_options`)."""
        if isinstance(v.attr("options", "items", "choices", "segments"), (list, tuple)):
            return []
        return [None if c.attr("tag") is None else _fmt(c.attr("tag"))
                for c in v.children if c.role in OPTION_ROLES or c.attr("tag") is not None]

    def _selected_index(self, v: View, options: list[tuple[str, str]]) -> int:
        sel = v.attr("selection", "selected", "value", "current", "active")
        if isinstance(sel, bool):
            return -1
        if isinstance(sel, (int, float)):
            return int(sel)
        name = _fmt(sel)
        for i, (lab, _) in enumerate(options):
            if lab == name:
                return i
        if sel is not None and name in (tags := self._option_tags(v)):
            return tags.index(name)
        return -1 if sel is not None else 0

    def r_segmented(self, v: View) -> str:
        options = self._options(v)
        sel = self._selected_index(v, options)
        chosen = {i for i, c in enumerate(c for c in v.children if c.role in OPTION_ROLES or c.attr("tag") is not None)
                  if _bool(c.attr("selected"))}
        if chosen and v.attr("selection", "selected", "value") is None:
            sel = -1
        label = self.content(v.attr("label", "title"))
        items = "".join(
            f'<span class="mkd-segmented__item" role="tab" aria-selected="{"true" if i == sel or i in chosen else "false"}">'
            f"{markup}</span>" for i, (_, markup) in enumerate(options))
        return self.open(v, "segmented", attrs={"role": "tablist"}) + (
            f'<span class="mkd-segmented__label">{label}</span>' if label and not v.has_mod("labelsHidden") else "") \
            + f'<span class="mkd-segmented__items">{items}</span></div>'

    def _field(self, v: View, role: str, value_html: str, *, placeholder: bool, kind: str = "",
               end_icon: str = "", popup: str = "", control_extra: str = "",
               style: dict | None = None, attrs: dict | None = None) -> str:
        label = self.text_or_slot(v, "label", "title", "header")
        helper = self.text_or_slot(v, "helper", "helperText", "supportingText", "description", "hint", "footer")
        err = v.attr("error", "errorMessage")
        if isinstance(err, str) and err:
            helper = text_html(err)
        data = {"filled": "false" if placeholder else "true"}
        if kind:
            data["kind"] = kind
        if label:
            data["labeled"] = "true"
        icon = v.attr("systemImage", "icon", "leadingIcon", "startIcon")
        if not icon and kind == "search":
            icon = "magnifyingglass"
        parts = []
        if label:
            req = '<span class="mkd-field__required">*</span>' if _bool(v.attr("required")) else ""
            parts.append(f'<label class="mkd-field__label">{label}{req}</label>')
        ctrl = []
        if icon:
            ctrl.append(f'<span class="mkd-field__icon">{self.icon(icon, v=v)}</span>')
        prefix = v.attr("prefix")
        if prefix:
            ctrl.append(f'<span class="mkd-field__prefix">{esc(_fmt(prefix))}</span>')
        ctrl.append(f'<span class="mkd-field__input"{PH if placeholder else ""}>'
                    f"{value_html}</span>")
        suffix = v.attr("suffix", "unit")
        if suffix:
            ctrl.append(f'<span class="mkd-field__suffix">{esc(_fmt(suffix))}</span>')
        ctrl.append(control_extra)
        if _bool(v.attr("clearButton", "clearable")) and not placeholder:
            ctrl.append(f'<span class="mkd-field__icon mkd-field__icon--end">{self.icon("xmark.circle")}</span>')
        trailing = v.attr("trailingIcon", "endIcon")
        if trailing:
            ctrl.append(f'<span class="mkd-field__icon mkd-field__icon--end">{self.icon(trailing, v=v)}</span>')
        if end_icon:
            ctrl.append(f'<span class="mkd-field__icon mkd-field__icon--end">{self.icon(end_icon)}</span>')
        parts.append(f'<div class="mkd-field__control">{"".join(ctrl)}</div>')
        if helper:
            parts.append(f'<div class="mkd-field__helper">{helper}</div>')
        count = v.attr("counter", "maxLength")
        if count:
            parts.append(f'<div class="mkd-field__counter">{esc(_fmt(count))}</div>')
        return self.open(v, role, cls="mkd-field", data=data, style=style, attrs=attrs) + "".join(parts) + popup + "</div>"

    def r_textfield(self, v: View) -> str:
        kind = _name(v.attr("kind", "type", "axis")) or ""
        if kind == "vertical":
            kind = "multiline"
        value = v.attr("text", "value")
        placeholder_text = v.attr("placeholder", "prompt")
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            value = _fmt(value)
        if isinstance(value, str) and value:
            shown = "•" * min(len(value), 12) if kind == "password" else value
            inner, is_ph = text_html(shown), False
        else:
            inner, is_ph = self.content(placeholder_text), True
        style = {}
        if kind == "multiline":
            style["--mkd-rows"] = str(int(_num(v.attr("rows", "lineLimit"), 3) or 3))
        end = "eye.slash" if kind == "password" and _bool(v.attr("reveal"), False) else ""
        # A filled field still has a title: its placeholder names it (a Form's columns style shows it).
        named = not is_ph and isinstance(placeholder_text, str) and placeholder_text \
            and not self.has(v, "label", "title", "header")
        # A static text box, named like a control (R-REND-007.C1).
        attrs = {"role": "textbox", **({"aria-label": placeholder_text} if named else {})}
        return self._field(v, "textfield", inner, placeholder=is_ph, kind=kind, end_icon=end, style=style, attrs=attrs)

    def r_select(self, v: View) -> str:
        variant = _name(v.attr("variant"))
        options = self._options(v)
        if variant in PICKER_OPTIONS and not options and not v.children:
            pass  # nothing to draw the options of: the label and an empty value (R-PACK-014.C6)
        elif variant in ("segmented", "palette"):
            return self.r_segmented(v)
        elif variant in ("radioGroup", "inline", "radio"):
            return self.r_radiogroup(v)
        elif variant == "wheel":
            sel = self._selected_index(v, options)
            return self.open(v, "wheel", attrs={"role": "listbox"}) + self._wheel([([m for _, m in options], sel)]) \
                + "</div>"
        sel = self._selected_index(v, options)
        value = v.attr("selection", "value", "selected")
        tags = self._option_tags(v)
        if isinstance(value, (int, float)) and not isinstance(value, bool) and 0 <= int(value) < len(options):
            shown = options[int(value)][1]
        elif isinstance(value, str) and value and value in tags:
            shown = options[tags.index(value)][1]
        elif isinstance(value, str) and value:
            shown = text_html(value)
        elif isinstance(value, list):
            shown = "".join(f'<span class="mkd-chip" data-el="Chip" data-size="small"><span class="mkd-chip__label">'
                            f"{esc(_fmt(x))}</span></span>" for x in value)
        elif value is None and options and variant in PICKER_FIRST:
            shown = options[0][1]
        else:
            shown = ""
        placeholder = not shown
        if placeholder:
            shown = self.content(v.attr("placeholder", "prompt"))
        popup = ""
        if _bool(v.attr("open", "expanded")) and options:
            popup = '<div class="mkd-select__popup" role="listbox">' + "".join(
                f'<div class="mkd-select__option" role="option" aria-selected="{"true" if i == sel else "false"}">'
                f"{markup}</div>" for i, (_, markup) in enumerate(options)) + "</div>"
        menu_like = variant in ("menu", "automatic") or (variant in PICKER_OPTIONS and not options)
        chevron = "chevron.up.down" if menu_like and self.pack.id == "swiftui" else "chevron.down"
        return self._field(v, "select", shown, placeholder=placeholder, end_icon=chevron, popup=popup)

    def r_radiogroup(self, v: View) -> str:
        options = self._options(v)
        sel = self._selected_index(v, options)
        label = self.text_or_slot(v, "label", "title")
        if options:
            radios = "".join(
                f'<span class="mkd-radio" data-el="RadioButton" data-checked="{"true" if i == sel else "false"}" '
                f'role="radio"><span class="mkd-radio__dot"></span><span class="mkd-radio__label">{markup}</span></span>'
                for i, (_, markup) in enumerate(options))
        else:
            radios = self.views(v.children)
        return self.open(v, "radiogroup", attrs={"role": "radiogroup"}) + (
            f'<div class="mkd-radiogroup__label">{label}</div>' if label else "") + \
            f'<div class="mkd-radiogroup__items">{radios}</div></div>'

    def _wheel(self, columns: list[tuple[list[str], int]]) -> str:
        """Wheel columns (markup items, selected index), two neighbours each side, under a selection band."""
        out = ['<span class="mkd-wheel__band"></span>']
        for items, sel in columns:
            cells = "".join(
                f'<span class="mkd-wheel__item" data-offset="{i - sel}"'
                + (' aria-selected="true"' if i == sel else "") + f">{item}</span>"
                for i, item in enumerate(items) if abs(i - sel) <= 2)
            out.append(f'<span class="mkd-wheel__column">{cells}</span>')
        return "".join(out)

    def r_slider(self, v: View) -> str:
        rng = v.attr("in", "range", "bounds")
        lo = _num(v.attr("min", "minimumValue"), None)
        hi = _num(v.attr("max", "maximumValue"), None)
        if isinstance(rng, list) and rng:
            lo, hi = (_num(rng[0], 0), _num(rng[-1], 1)) if lo is None else (lo, hi)
        lo = 0.0 if lo is None else lo
        hi = (1.0 if (_num(v.attr("value"), 0) or 0) <= 1 else 100.0) if hi is None else hi
        val = v.attr("value")
        if isinstance(val, list) and len(val) == 2:  # range slider
            a, b = (_num(val[0], lo) or 0, _num(val[1], hi) or 0)
        else:
            a, b = lo, _num(val, lo) or lo
        span = (hi - lo) or 1
        fa, fb = (a - lo) / span * 100, (b - lo) / span * 100
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        parts = [f'<div class="mkd-slider__label">{label}</div>'] if label else []
        track = (f'<span class="mkd-slider__track"><span class="mkd-slider__fill" style="left:{fa:.1f}%;'
                 f'width:{fb - fa:.1f}%"></span>')
        steps = v.attr("ticks", "steps", "step")
        if _bool(v.attr("ticks")) or isinstance(v.attr("ticks"), int):
            n = int(_num(steps, 0) or 0) if isinstance(steps, (int, float)) and not isinstance(steps, bool) else 0
            n = n or 5
            track += '<span class="mkd-slider__ticks">' + "<i></i>" * (n + 1) + "</span>"
        if isinstance(val, list) and len(val) == 2:
            track += f'<span class="mkd-slider__thumb" style="left:{fa:.1f}%"></span>'
        track += f'<span class="mkd-slider__thumb" style="left:{fb:.1f}%"></span></span>'
        mn = self.slot(v, "minimumValueLabel") or (self.content(v.attr("minLabel")) if v.attr("minLabel") else "")
        mx = self.slot(v, "maximumValueLabel") or (self.content(v.attr("maxLabel")) if v.attr("maxLabel") else "")
        ctrl = (f'<span class="mkd-slider__min">{mn}</span>' if mn else "") + track + (
            f'<span class="mkd-slider__max">{mx}</span>' if mx else "")
        if _bool(v.attr("showValue")):
            ctrl += f'<span class="mkd-slider__value">{esc(_fmt(round(b, 2)))}</span>'
        parts.append(f'<div class="mkd-slider__control">{ctrl}</div>')
        return self.open(v, "slider", attrs={"role": "slider"}) + "".join(parts) + "</div>"

    def r_stepper(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        value = v.attr("value")
        val_html = f'<span class="mkd-stepper__value">{esc(_fmt(value))}</span>' if value is not None else ""
        btns = (f'<span class="mkd-stepper__buttons"><span class="mkd-stepper__button" data-step="down">'
                f'{self.icon("minus")}</span><span class="mkd-stepper__divider"></span>'
                f'<span class="mkd-stepper__button" data-step="up">{self.icon("plus")}</span></span>')
        return self.open(v, "stepper") + (f'<span class="mkd-stepper__label">{label}</span>' if label else "") \
            + val_html + btns + "</div>"

    def r_datepicker(self, v: View) -> str:
        variant = _name(v.attr("variant", "style"))
        if variant in DATE_STYLES:
            return self._date_style(v, variant)
        value = v.attr("selection", "date", "value", "text")
        shown = _format_date(value, _name(v.attr("format")) or "medium") if value else ""
        kind = _name(v.attr("kind")) or "date"
        end = {"time": "clock", "datetime": "calendar"}.get(kind, "calendar")
        return self._field(v, "datepicker", text_html(shown) if shown else self.content(v.attr("placeholder")),
                           placeholder=not shown, kind=kind, end_icon=end)

    def _date_style(self, v: View, variant: str) -> str:
        """A SwiftUI date picker style (R-PACK-014.C2); without a selection, 23 Nov 2026 9:41 AM."""
        value = v.attr("selection", "date", "value", "text")
        d = _parse_date(value) or DEFAULT_DATE
        hh, mm = _parse_time(value) or DEFAULT_TIME
        if variant == "graphical":
            return self._calendar(v, d.isoformat())
        comps = v.attr("displayedComponents", "components")
        names = [_name(c) for c in comps] if isinstance(comps, (list, tuple)) else [_name(comps)] if comps else []
        show_date = not names or "date" in names or "hourAndMinute" not in names
        show_time = not names or "hourAndMinute" in names
        h12, ampm = (hh % 12 or 12), ("AM" if hh < 12 else "PM")
        time = f"{h12}:{mm:02d} {ampm}"
        if variant == "wheel":
            cols: list[tuple[list[str], int]] = []
            if show_date and show_time:
                days = [d + _dt.timedelta(days=k) for k in range(-2, 3)]
                cols.append(([f"{WEEKDAY_ABBR[x.weekday()]} {calendar.month_abbr[x.month]} {x.day}" for x in days], 2))
            elif show_date:
                last = calendar.monthrange(d.year, d.month)[1]
                cols.append(([calendar.month_name[(d.month - 1 + k) % 12 + 1] for k in range(-2, 3)], 2))
                cols.append(([str((d.day - 1 + k) % last + 1) for k in range(-2, 3)], 2))
                cols.append(([str(d.year + k) for k in range(-2, 3)], 2))
            if show_time:
                cols.append(([str((h12 - 1 + k) % 12 + 1) for k in range(-2, 3)], 2))
                cols.append(([f"{(mm + k) % 60:02d}" for k in range(-2, 3)], 2))
                cols.append((["AM", "PM"], 0 if ampm == "AM" else 1))
            return self.open(v, "wheel", attrs={"role": "group"}) + self._wheel(cols) + "</div>"
        if variant in ("field", "stepperField"):
            text = f"{d.month}/{d.day}/{d.year}" if show_date else ""
            text = ", ".join(t for t in (text, time if show_time else "") if t)
            stepper = (f'<span class="mkd-datepicker__stepper">{self.icon("chevron.up")}{self.icon("chevron.down")}'
                       "</span>") if variant == "stepperField" else ""
            return self._field(v, "datepicker", text_html(text), placeholder=False, kind="field", control_extra=stepper)
        inner = (f'<span class="mkd-datepicker__date">{esc(_format_date(d.isoformat(), "medium"))}</span>'
                 if show_date else "") \
            + (f'<span class="mkd-datepicker__time">{esc(time)}</span>' if show_time else "")
        return self._field(v, "datepicker", inner, placeholder=False, kind="compact")

    def r_calendar(self, v: View) -> str:
        return self._calendar(v, v.attr("selection", "date", "value"))

    def _calendar(self, v: View, sel: object) -> str:
        d = _parse_date(sel) or _dt.date(2026, 11, 23)
        year = int(_num(v.attr("year"), d.year) or d.year)
        month = int(_num(v.attr("month"), d.month) or d.month)
        first = int(_num(v.attr("firstWeekday"), 0) or 0)  # 0 = Sunday
        cal = calendar.Calendar(firstweekday=(first - 1) % 7)
        marked = {(_parse_date(x) or _dt.date.min) for x in (v.attr("events", "marked") or [])}
        rng = v.attr("range")
        r0 = _parse_date(rng[0]) if isinstance(rng, list) and len(rng) == 2 else None
        r1 = _parse_date(rng[1]) if isinstance(rng, list) and len(rng) == 2 else None
        days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        order = [days[(first + i) % 7] for i in range(7)]
        head = "".join(f'<span class="mkd-calendar__weekday">{w[:1] if self.pack.id == "swiftui" else w[:2]}</span>'
                       for w in order)
        cells = []
        for day in cal.itermonthdates(year, month):
            attrs = []
            if day.month != month:
                attrs.append('data-outside="true"')
            if sel and day == d:
                attrs.append('aria-selected="true"')
            if r0 and r1 and r0 <= day <= r1:
                attrs.append('data-in-range="true"')
            if day in marked:
                attrs.append('data-marked="true"')
            if day == _dt.date(2026, 11, 23) and _bool(v.attr("showToday"), False):
                attrs.append('data-today="true"')
            cells.append(f'<span class="mkd-calendar__day" {" ".join(attrs)}>{day.day}</span>')
        title = f"{calendar.month_name[month]} {year}"
        label = self.content(v.attr("label", "title"))
        return (self.open(v, "calendar")
                + (f'<div class="mkd-calendar__label">{label}</div>' if label else "")
                + f'<div class="mkd-calendar__header"><span class="mkd-calendar__title">{esc(title)}'
                f'<span class="mkd-calendar__title-chevron">{self.icon("chevron.right")}</span></span>'
                f'<span class="mkd-calendar__nav">{self.icon("chevron.left")}{self.icon("chevron.right")}</span></div>'
                f'<div class="mkd-calendar__grid">{head}{"".join(cells)}</div></div>')

    def r_dropzone(self, v: View) -> str:
        label = self.content(v.attr("label", "title", "text")) or "Drop files here"
        hint = self.content(v.attr("hint", "description"))
        icon = v.attr("systemImage", "icon") or "arrow.up.to.line"
        return self.open(v, "dropzone") + f'<span class="mkd-dropzone__icon">{self.icon(icon, v=v)}</span>' \
            + f'<span class="mkd-dropzone__label">{label}</span>' \
            + (f'<span class="mkd-dropzone__hint">{hint}</span>' if hint else "") + self.views(v.children) + "</div>"


def _parse_date(value: object) -> _dt.date | None:
    if isinstance(value, str):
        m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", value)
        if m:
            try:
                return _dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            except ValueError:
                return None
    return None


def _parse_time(value: object) -> tuple[int, int] | None:
    """The ``HH:MM`` after the date of an ISO date-time string (``2026-11-23T14:05``), or None."""
    if isinstance(value, str):
        m = re.match(r"^\d{4}-\d{2}-\d{2}[T ](\d{1,2}):(\d{2})", value)
        if m and int(m.group(1)) < 24 and int(m.group(2)) < 60:
            return int(m.group(1)), int(m.group(2))
    return None


def _format_date(value: object, style: str) -> str:
    d = _parse_date(value)
    if d is None:
        return _fmt(value)
    rest = str(value)[10:].strip(" T")
    if style == "numeric":
        out = f"{d.month}/{d.day}/{d.year}"
    elif style == "long":
        out = f"{calendar.month_name[d.month]} {d.day}, {d.year}"
    elif style == "iso":
        out = d.isoformat()
    else:
        out = f"{calendar.month_abbr[d.month]} {d.day}, {d.year}"
    return f"{out} {rest}" if rest else out
