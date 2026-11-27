"""Non-standard component roles: spreadsheet, board, code, message, tree, timeline, gantt, schedule and the rest.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

import re

from ...model import EnumValue, View, ViewList
from .._util import _bool, _fmt, _name, _num, esc, text_html
from ..style import css_color, u


SEL = ' data-sel="true"'
HL = ' data-hl="true"'


class ComponentRoles:
    """Non-standard component roles: spreadsheet, board, code, message, tree, timeline, gantt, schedule and the rest."""

    def r_spreadsheet(self, v: View) -> str:
        rows = [r if isinstance(r, (list, tuple)) else [r] for r in (v.attr("rows", "data", "cells") or [])]
        ncols = int(_num(v.attr("columnCount"), 0) or 0) or max((len(r) for r in rows), default=5)
        cols = v.attr("columns", "headers")
        letters = [_col_name(i) for i in range(ncols)]
        start_row = int(_num(v.attr("startRow", "firstRow"), 1) or 1)
        min_rows = int(_num(v.attr("rowCount", "minRows"), 0) or 0)
        while len(rows) < min_rows:
            rows.append([])
        sel = _parse_range(_fmt(v.attr("selection", "range") or ""))
        active = _parse_range(_fmt(v.attr("active", "activeCell") or "")) or (sel[:2] + sel[:2] if sel else None)
        highlights = v.attr("highlight", "fills") or {}
        widths = v.attr("columnWidths", "widths") or []
        header_row = _bool(v.attr("headerRow"))
        parts = []
        formula = v.attr("formula", "formulaBar")
        if formula is not None or _bool(v.attr("showFormulaBar")):
            ref = _fmt(v.attr("active", "activeCell") or (v.attr("selection") or "A1")).split(":")[0]
            parts.append(f'<div class="mkd-spreadsheet__formula"><span class="mkd-spreadsheet__ref">{esc(ref)}</span>'
                         f'<span class="mkd-spreadsheet__fx">fx</span><span class="mkd-spreadsheet__expr">'
                         f'{esc(_fmt(formula or ""))}</span></div>')
        colgroup = '<col class="mkd-spreadsheet__rowhead-col">' + "".join(
            f'<col style="width:{u(_num(widths[i]))}">' if i < len(widths) and u(_num(widths[i])) else "<col>"
            for i in range(ncols))
        head = '<th class="mkd-spreadsheet__corner"></th>' + "".join(
            f'<th class="mkd-spreadsheet__colhead"{SEL if sel and sel[0] <= i <= sel[2] else ""}>'
            f"{esc(letters[i])}</th>" for i in range(ncols))
        body = []
        if isinstance(cols, list) and cols:
            rows = [[_fmt(c) for c in cols]] + rows
            header_row = True
        for ri, row in enumerate(rows):
            rnum = start_row + ri
            in_rows = sel and sel[1] <= rnum <= sel[3]
            cells = [f'<th class="mkd-spreadsheet__rowhead"{SEL if in_rows else ""}>{rnum}</th>']
            for ci in range(ncols):
                val = row[ci] if ci < len(row) else ""
                attrs = []
                if sel and sel[0] <= ci <= sel[2] and sel[1] <= rnum <= sel[3]:
                    attrs.append('data-in-sel="true"')
                    edges = [e for e, c in (("t", rnum == sel[1]), ("b", rnum == sel[3]), ("l", ci == sel[0]),
                                            ("r", ci == sel[2])) if c]
                    if edges:
                        attrs.append(f'data-edge="{"".join(edges)}"')
                if active and active[0] == ci and active[1] == rnum:
                    attrs.append('data-active="true"')
                fill = highlights.get(f"{letters[ci]}{rnum}") if isinstance(highlights, dict) else None
                if fill is not None and css_color(fill):
                    attrs.append(f'style="background:color-mix(in srgb, {esc(css_color(fill))} 28%, transparent)"')
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    attrs.append('data-num="true"')
                if header_row and ri == 0:
                    attrs.append('data-header="true"')
                content = self.views(val.views) if isinstance(val, ViewList) else text_html(_fmt(val))
                cells.append(f'<td class="mkd-spreadsheet__cell" {" ".join(attrs)}>{content}</td>')
            body.append("<tr>" + "".join(cells) + "</tr>")
        parts.append(f'<div class="mkd-spreadsheet__grid"><table class="mkd-spreadsheet__table"><colgroup>{colgroup}'
                     f'</colgroup><thead><tr>{head}</tr></thead><tbody>{"".join(body)}</tbody></table></div>')
        sheets = v.attr("sheets")
        if isinstance(sheets, list) and sheets:
            cur = _fmt(v.attr("sheet", "selectedSheet") or sheets[0])
            parts.append('<div class="mkd-spreadsheet__sheets"><span class="mkd-spreadsheet__add">'
                         + self.icon("plus") + "</span>" + "".join(
                             f'<span class="mkd-spreadsheet__sheet" aria-selected="{"true" if _fmt(s) == cur else "false"}">'
                             f"{esc(_fmt(s))}</span>" for s in sheets) + "</div>")
        return self.open(v, "spreadsheet") + "".join(parts) + "</div>"

    def r_stickynote(self, v: View) -> str:
        c = css_color(v.attr("color", "fill") or EnumValue("yellow")) or "var(--mkd-color-yellow)"
        rot = _num(v.attr("rotation", "angle"), 0) or 0
        style = {"--mkd-note": c}
        if rot:
            style["transform"] = f"rotate({rot:g}deg)"
        title = self.text_or_slot(v, "title")
        text = self.text_or_slot(v, "text", "content")
        footer = self.text_or_slot(v, "author", "footer", "date")
        return (self.open(v, "stickynote", style=style)
                + (f'<div class="mkd-stickynote__title">{title}</div>' if title else "")
                + (f'<div class="mkd-stickynote__text">{text}</div>' if text else "") + self.views(v.children)
                + (f'<div class="mkd-stickynote__footer">{footer}</div>' if footer else "") + "</div>")

    def r_board(self, v: View) -> str:
        return self.open(v, "board") + self.views(v.children) + "</div>"

    def r_boardcolumn(self, v: View) -> str:
        title = self.text_or_slot(v, "title", "label")
        count = v.attr("count")
        if count is None:
            count = len(v.children)
        dot = css_color(v.attr("color"))
        head = (f'<div class="mkd-boardcolumn__header">'
                + (f'<span class="mkd-boardcolumn__dot" style="background:{esc(dot)}"></span>' if dot else "")
                + f'<span class="mkd-boardcolumn__title">{title}</span><span class="mkd-boardcolumn__count">'
                f'{esc(_fmt(count))}</span><span class="mkd-boardcolumn__more">{self.icon("ellipsis")}</span></div>')
        add = f'<div class="mkd-boardcolumn__add">{self.icon("plus")} Add card</div>' if _bool(v.attr("addButton"), True) else ""
        return self.open(v, "boardcolumn") + head + f'<div class="mkd-boardcolumn__cards">{self.views(v.children)}' \
            f"</div>{add}</div>"

    def r_kanbancard(self, v: View) -> str:
        title = self.text_or_slot(v, "title")
        desc = self.text_or_slot(v, "description", "subtitle")
        tags = v.attr("tags", "labels") or []
        tag_html = "".join(f'<span class="mkd-kanbancard__tag" data-hue="{sum(map(ord, _fmt(t))) % 8 + 1}">'
                           f"{esc(_fmt(t))}</span>" for t in tags)
        meta = []
        if v.attr("due"):
            meta.append(f'<span class="mkd-kanbancard__meta">{self.icon("clock")}{esc(_fmt(v.attr("due")))}</span>')
        if v.attr("comments"):
            meta.append(f'<span class="mkd-kanbancard__meta">{self.icon("message")}{esc(_fmt(v.attr("comments")))}</span>')
        if v.attr("attachments"):
            meta.append(f'<span class="mkd-kanbancard__meta">{self.icon("paperclip")}{esc(_fmt(v.attr("attachments")))}</span>')
        assignees = v.attr("assignees", "assignee") or []
        if isinstance(assignees, str):
            assignees = [assignees]
        avs = "".join(self.avatar_html(_fmt(a), None, v, "small", " mkd-kanbancard__avatar") for a in assignees)
        img = v.attr("image", "cover")
        cover = ""
        if isinstance(img, str) and img:
            src = self.assets.resolve(img, v.loc)
            cover = f'<img class="mkd-kanbancard__cover" src="{esc(src)}" alt="">' if src else ""
        prio = v.attr("priority")
        return (self.open(v, "kanbancard", data={"priority": _name(prio)} if prio else None) + cover
                + (f'<div class="mkd-kanbancard__tags">{tag_html}</div>' if tag_html else "")
                + f'<div class="mkd-kanbancard__title">{title}</div>'
                + (f'<div class="mkd-kanbancard__desc">{desc}</div>' if desc else "") + self.views(v.children)
                + (f'<div class="mkd-kanbancard__footer"><span class="mkd-kanbancard__metas">{"".join(meta)}</span>'
                   f'<span class="mkd-kanbancard__avatars">{avs}</span></div>' if meta or avs else "") + "</div>")

    def r_code(self, v: View) -> str:
        code = _fmt(v.attr("code", "text", "content", "source") or "")
        lang = (_name(v.attr("language", "lang")) or "").lower()
        terminal = _name(v.attr("variant")) == "terminal" or v.role == "terminal"
        numbers = _bool(v.attr("lineNumbers", "showLineNumbers"), not terminal)
        hl = {int(x) for x in (v.attr("highlight", "highlightLines") or []) if isinstance(x, int)}
        start = int(_num(v.attr("startLine"), 1) or 1)
        lines = code.split("\n") if code else [""]
        out = []
        for i, line in enumerate(lines):
            n = start + i
            body = _highlight(line, lang) if not terminal else _terminal_line(line)
            out.append(f'<div class="mkd-code__line"{HL if n in hl else ""}>'
                       + (f'<span class="mkd-code__num">{n}</span>' if numbers else "")
                       + f'<span class="mkd-code__text">{body or "&#8203;"}</span></div>')
        tabs = v.attr("tabs", "files")
        title = self.text_or_slot(v, "title", "filename")
        head = ""
        if terminal:
            head = ('<div class="mkd-code__bar"><span class="mkd-chrome__lights"><i data-light="close"></i><i '
                    'data-light="min"></i><i data-light="max"></i></span>'
                    f'<span class="mkd-code__title">{title or "Terminal"}</span></div>')
        elif isinstance(tabs, list) and tabs:
            cur = _fmt(v.attr("selectedTab") or tabs[0])
            head = '<div class="mkd-code__tabs">' + "".join(
                f'<span class="mkd-code__tab" aria-selected="{"true" if _fmt(t) == cur else "false"}">{esc(_fmt(t))}</span>'
                for t in tabs) + "</div>"
        elif title:
            head = f'<div class="mkd-code__bar"><span class="mkd-code__title">{title}</span></div>'
        return self.open(v, "code", data={"kind": "terminal" if terminal else "editor", "lang": lang or None}) + head \
            + f'<div class="mkd-code__body">{"".join(out)}</div></div>'

    def r_message(self, v: View) -> str:
        sender = _name(v.attr("from", "sender", "direction")) or "them"
        mine = sender in ("me", "outgoing", "self", "sent", "user")
        text = self.text_or_slot(v, "text", "content", "message")
        author = self.text_or_slot(v, "author", "name")
        time = self.text_or_slot(v, "time", "timestamp")
        status = v.attr("status")
        img = v.attr("image")
        media = ""
        if isinstance(img, str) and img:
            src = self.assets.resolve(img, v.loc)
            media = f'<img class="mkd-message__image" src="{esc(src)}" alt="">' if src else ""
        av = ""
        if not mine and (v.attr("avatar") or author):
            av = self.avatar_html(_fmt(v.attr("avatar") or re.sub(r"<[^>]+>", "", author)), v.attr("avatarImage"), v,
                                  "small", " mkd-message__avatar")
        reactions = v.attr("reactions") or []
        react = "".join(f'<span class="mkd-message__reaction">{esc(_fmt(r))}</span>' for r in reactions)
        return (self.open(v, "message", data={"from": "me" if mine else "them",
                                              "kind": _name(v.attr("variant", "kind")) or None}) + av
                + '<div class="mkd-message__stack">'
                + (f'<span class="mkd-message__author">{author}</span>' if author and not mine else "")
                + f'<div class="mkd-message__bubble">{media}{text}{self.views(v.children)}</div>'
                + (f'<div class="mkd-message__reactions">{react}</div>' if react else "")
                + (f'<span class="mkd-message__time">{time}'
                   + (f' · {esc(_fmt(status))}' if status else "") + "</span>" if time or status else "")
                + "</div></div>")

    def r_tree(self, v: View) -> str:
        return self.open(v, "tree", attrs={"role": "tree"}) + self.views(v.children) + "</div>"

    def r_treeitem(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title", "text")
        kids = [c for c in v.children if c.role == "treeitem"]
        others = [c for c in v.children if c.role != "treeitem"]
        expanded = _bool(v.attr("expanded", "isExpanded"), bool(kids))
        icon = v.attr("systemImage", "icon")
        if not icon and _bool(v.attr("folder")):
            icon = "folder"
        chevron = (f'<span class="mkd-treeitem__chevron">{self.icon("chevron.down" if expanded else "chevron.right")}'
                   "</span>") if kids or _bool(v.attr("hasChildren")) else '<span class="mkd-treeitem__chevron"></span>'
        detail = self.text_or_slot(v, "detail", "badge")
        row = (f'<div class="mkd-treeitem__row">{chevron}'
               + (f'<span class="mkd-treeitem__icon">{self.icon(icon, v=v)}</span>' if icon else "")
               + f'<span class="mkd-treeitem__label">{label}</span>{self.views(others)}'
               + (f'<span class="mkd-treeitem__detail">{detail}</span>' if detail else "") + "</div>")
        children = f'<div class="mkd-treeitem__children" role="group">{self.views(kids)}</div>' if kids and expanded else ""
        return self.open(v, "treeitem", data={"expanded": "true" if expanded else "false"} if kids else None,
                         attrs={"role": "treeitem"}) + row + children + "</div>"

    def r_timeline(self, v: View) -> str:
        return self.open(v, "timeline", data={"orientation": _name(v.attr("orientation")) or "vertical"}) \
            + self.views(v.children) + "</div>"

    def r_timelineitem(self, v: View) -> str:
        title = self.text_or_slot(v, "title", "label")
        desc = self.text_or_slot(v, "description", "subtitle", "text")
        time = self.text_or_slot(v, "time", "date", "timestamp")
        icon = v.attr("systemImage", "icon")
        status = _name(v.attr("status", "color", "severity")) or ""
        dot = f'<span class="mkd-timelineitem__dot">{self.icon(icon, v=v) if icon else ""}</span>'
        return (self.open(v, "timelineitem", data={"status": status or None, "icon": "true" if icon else None})
                + f'<div class="mkd-timelineitem__rail">{dot}<span class="mkd-timelineitem__line"></span></div>'
                + '<div class="mkd-timelineitem__content">'
                + (f'<div class="mkd-timelineitem__time">{time}</div>' if time else "")
                + f'<div class="mkd-timelineitem__title">{title}</div>'
                + (f'<div class="mkd-timelineitem__desc">{desc}</div>' if desc else "")
                + self.views(v.children) + "</div></div>")

    def r_gantt(self, v: View) -> str:
        scale = [_fmt(x) for x in (v.attr("scale", "columns", "periods") or [])]
        tasks = v.attr("tasks", "rows") or []
        n = len(scale) or max((int(_num(t[1], 0) + _num(t[2], 1)) for t in tasks if isinstance(t, (list, tuple))
                               and len(t) >= 3), default=6)
        if not scale:
            scale = [str(i + 1) for i in range(n)]
        today = _num(v.attr("today", "now"), None)
        rows = []
        for i, t in enumerate(tasks):
            if isinstance(t, dict):
                name, start, length = t.get("name", ""), t.get("start", 0), t.get("length", t.get("duration", 1))
                prog, grp = t.get("progress"), t.get("milestone")
            elif isinstance(t, (list, tuple)) and len(t) >= 3:
                name, start, length = t[0], t[1], t[2]
                prog = t[3] if len(t) > 3 else None
                grp = False
            else:
                continue
            left = (_num(start, 0) or 0) / n * 100
            width = (_num(length, 1) or 0) / n * 100
            milestone = (_num(length, 1) or 0) == 0 or _bool(grp)
            bar = (f'<span class="mkd-gantt__milestone" style="left:{left:.2f}%"></span>' if milestone else
                   f'<span class="mkd-gantt__bar" style="left:{left:.2f}%;width:{width:.2f}%;--mkd-bar:var(--mkd-chart-'
                   f'{i % 6 + 1})">' + (f'<span class="mkd-gantt__progress" style="width:{max(0, min(100, _num(prog, 0) * (100 if _num(prog, 0) <= 1 else 1))):.0f}%"></span>'
                                        if prog is not None else "") + "</span>")
            rows.append(f'<div class="mkd-gantt__row"><span class="mkd-gantt__name">{esc(_fmt(name))}</span>'
                        f'<span class="mkd-gantt__track">{bar}</span></div>')
        head = "".join(f"<span>{esc(s)}</span>" for s in scale)
        now = f'<span class="mkd-gantt__today" style="left:{today / n * 100:.2f}%"></span>' if today is not None else ""
        return (self.open(v, "gantt", style={"--mkd-gantt-cols": str(n)})
                + f'<div class="mkd-gantt__head"><span class="mkd-gantt__name"></span><span class="mkd-gantt__scale">'
                  f"{head}</span></div>"
                + f'<div class="mkd-gantt__body"><div class="mkd-gantt__grid"><span class="mkd-gantt__name"></span>'
                  f'<span class="mkd-gantt__lines">{"<i></i>" * n}{now}</span></div>{"".join(rows)}</div></div>')

    def r_schedule(self, v: View) -> str:
        days = [_fmt(d) for d in (v.attr("days", "columns") or ["Mon", "Tue", "Wed", "Thu", "Fri"])]
        h0 = int(_num(v.attr("startHour"), 8) or 8)
        h1 = int(_num(v.attr("endHour"), 18) or 18)
        span = max(h1 - h0, 1)
        events = v.attr("events") or []
        cols = []
        for di, d in enumerate(days):
            evs = []
            for i, e in enumerate(events):
                if isinstance(e, dict):
                    title, day, s, en, col = e.get("title", ""), e.get("day"), e.get("start"), e.get("end"), e.get("color")
                elif isinstance(e, (list, tuple)) and len(e) >= 4:
                    title, day, s, en = e[0], e[1], e[2], e[3]
                    col = e[4] if len(e) > 4 else None
                else:
                    continue
                if _fmt(day) != d and day != di:
                    continue
                top = ((_num(s, h0) or h0) - h0) / span * 100
                hgt = ((_num(en, h0 + 1) or h0 + 1) - (_num(s, h0) or h0)) / span * 100
                c = css_color(col) or f"var(--mkd-chart-{i % 6 + 1})"
                evs.append(f'<span class="mkd-schedule__event" style="top:{top:.2f}%;height:{hgt:.2f}%;--mkd-ev:{esc(c)}">'
                           f'<span class="mkd-schedule__event-title">{esc(_fmt(title))}</span>'
                           f'<span class="mkd-schedule__event-time">{_hour(s)}–{_hour(en)}</span></span>')
            sel = ' aria-selected="true"' if _fmt(v.attr("today") or "") == d else ""
            cols.append(f'<div class="mkd-schedule__day"{sel}><div class="mkd-schedule__dayhead">{esc(d)}</div>'
                        f'<div class="mkd-schedule__slots">{"<i></i>" * span}{"".join(evs)}</div></div>')
        hours = "".join(f"<span>{_hour(h)}</span>" for h in range(h0, h1))
        now = _num(v.attr("now"), None)
        now_html = (f'<span class="mkd-schedule__now" style="top:{(now - h0) / span * 100:.2f}%"></span>'
                    if now is not None else "")
        return (self.open(v, "schedule", style={"--mkd-hours": str(span)})
                + f'<div class="mkd-schedule__hours"><div class="mkd-schedule__dayhead"></div>'
                  f'<div class="mkd-schedule__hourlist">{hours}</div></div>'
                + f'<div class="mkd-schedule__days">{"".join(cols)}{now_html}</div></div>')

    def r_kbd(self, v: View) -> str:
        keys = v.attr("keys", "shortcut", "text", "key")
        parts = keys if isinstance(keys, list) else [keys]
        return self.open(v, "kbd", "span") + "".join(f'<kbd class="mkd-kbd__key">{esc(_fmt(k))}</kbd>'
                                                       for k in parts if k is not None) + "</span>"

    def r_skeleton(self, v: View) -> str:
        lines = int(_num(v.attr("lines", "rows"), 3) or 0)
        avatar = _bool(v.attr("avatar"))
        image = _bool(v.attr("image", "media"))
        shape = _name(v.attr("shape"))
        if shape in ("circle", "rectangle", "text"):
            return self.open(v, "skeleton", data={"shape": shape}) + '<span class="mkd-skeleton__block"></span></div>'
        widths = [100, 92, 76, 84, 60]
        bars = "".join(f'<span class="mkd-skeleton__line" style="width:{widths[i % 5]}%"></span>' for i in range(lines))
        return (self.open(v, "skeleton")
                + ('<span class="mkd-skeleton__image"></span>' if image else "")
                + '<div class="mkd-skeleton__row">'
                + ('<span class="mkd-skeleton__avatar"></span>' if avatar else "")
                + f'<div class="mkd-skeleton__lines">{bars}</div></div></div>')

    def r_swatches(self, v: View) -> str:
        colors = v.attr("colors", "palette") or []
        sel = v.attr("selection", "selected")
        out = []
        for i, c in enumerate(colors):
            css = css_color(c) or "transparent"
            on = (isinstance(sel, int) and not isinstance(sel, bool) and sel == i) or _fmt(sel) == _fmt(c)
            out.append(f'<span class="mkd-swatches__swatch" style="--mkd-swatch:{esc(css)}" '
                       f'aria-selected="{"true" if on else "false"}"></span>')
        label = self.content(v.attr("label", "title"))
        return self.open(v, "swatches") + (f'<span class="mkd-swatches__label">{label}</span>' if label else "") \
            + f'<span class="mkd-swatches__items">{"".join(out)}</span></div>'

    def r_canvas(self, v: View) -> str:
        style = {}
        if (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
        grid = _name(v.attr("grid", "background")) or ""
        return self.open(v, "canvas", data={"grid": grid or None}, style=style) + self.views(v.children) + "</div>"

    def r_media(self, v: View) -> str:
        img = v.attr("image", "poster", "thumbnail", "url")
        src = self.assets.resolve(img, v.loc) if isinstance(img, str) and img else None
        prog = _num(v.attr("progress", "value"), None)
        dur = _fmt(v.attr("duration") or "")
        cur = _fmt(v.attr("time", "currentTime") or "")
        playing = _bool(v.attr("playing"))
        poster = f'<img class="mkd-media__poster" src="{esc(src)}" alt="">' if src else \
            f'<span class="mkd-media__poster mkd-media__poster--empty">{self.icon("video")}</span>'
        bar = (f'<div class="mkd-media__controls"><span class="mkd-media__btn">{self.icon("pause" if playing else "play")}'
               f'</span><span class="mkd-media__time">{esc(cur)}</span><span class="mkd-media__scrub"><span '
               f'class="mkd-media__fill" style="width:{(prog if prog is not None and prog <= 1 else (prog or 0) / 100) * 100:.1f}%">'
               f'</span></span><span class="mkd-media__time">{esc(dur)}</span><span class="mkd-media__btn">'
               f'{self.icon("speaker")}</span></div>')
        center = "" if playing else f'<span class="mkd-media__play">{self.icon("play")}</span>'
        return self.open(v, "media") + poster + center + bar + "</div>"

    def r_emptystate(self, v: View) -> str:
        icon = v.attr("systemImage", "icon") or "tray"
        title = self.text_or_slot(v, "title", "label")
        desc = self.text_or_slot(v, "description", "message", "subtitle")
        actions = self.views(v.children) + self.slot(v, "actions")
        return (self.open(v, "emptystate") + f'<span class="mkd-emptystate__icon">{self.icon(icon, v=v)}</span>'
                + f'<span class="mkd-emptystate__title">{title}</span>'
                + (f'<span class="mkd-emptystate__desc">{desc}</span>' if desc else "")
                + (f'<div class="mkd-emptystate__actions">{actions}</div>' if actions else "") + "</div>")

    def r_stat(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title")
        value = self.text_or_slot(v, "value")
        change = v.attr("change", "delta", "trendValue")
        positive = v.attr("positive")
        if positive is None and isinstance(change, str):
            positive = not change.strip().startswith(("-", "−", "–"))
        icon = v.attr("systemImage", "icon")
        trend = v.attr("trend", "sparkline")
        spark = ""
        if isinstance(trend, list) and trend:
            from .. import charts
            spark = charts.render(charts.ChartSpec("sparkline", series=[[_num(x, 0) or 0.0 for x in trend]],
                                                   width=120, height=32))
        return (self.open(v, "stat")
                + '<div class="mkd-stat__head">'
                + f'<span class="mkd-stat__label">{label}</span>'
                + (f'<span class="mkd-stat__icon">{self.icon(icon, v=v)}</span>' if icon else "") + "</div>"
                + f'<div class="mkd-stat__value">{value}</div>'
                + (f'<div class="mkd-stat__foot"><span class="mkd-stat__change" data-positive='
                   f'"{"true" if _bool(positive, True) else "false"}">{esc(_fmt(change))}</span>'
                   + (f'<span class="mkd-stat__caption">{self.content(v.attr("caption"))}</span>' if v.attr("caption") else "")
                   + "</div>" if change is not None else "")
                + (f'<div class="mkd-stat__spark">{spark}</div>' if spark else "") + "</div>")

    def r_map(self, v: View) -> str:
        pins = v.attr("pins", "markers") or []
        style = {}
        if (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
        out = []
        for i, p in enumerate(pins):
            if isinstance(p, (list, tuple)) and len(p) >= 2:
                x, y = _num(p[0], 50), _num(p[1], 50)
                lab = _fmt(p[2]) if len(p) > 2 else ""
            elif isinstance(p, dict):
                x, y, lab = _num(p.get("x"), 50), _num(p.get("y"), 50), _fmt(p.get("label", ""))
            else:
                x, y, lab = 30 + i * 17 % 60, 35 + i * 23 % 40, _fmt(p)
            out.append(f'<span class="mkd-map__pin" style="left:{x:.1f}%;top:{y:.1f}%">{self.icon("mappin")}'
                       + (f'<span class="mkd-map__label">{esc(lab)}</span>' if lab else "") + "</span>")
        route = ""
        if _bool(v.attr("route")) and len(pins) >= 2:
            pts = []
            for p in pins:
                if isinstance(p, (list, tuple)) and len(p) >= 2:
                    pts.append(f"{_num(p[0], 50):.1f},{_num(p[1], 50):.1f}")
            route = (f'<svg class="mkd-map__route" viewBox="0 0 100 100" preserveAspectRatio="none">'
                     f'<polyline points="{" ".join(pts)}"/></svg>')
        return (self.open(v, "map", style=style) + _MAP_SVG + route + "".join(out)
                + (f'<span class="mkd-map__me" style="left:{_num(v.attr("userX"), 50):.1f}%;top:{_num(v.attr("userY"), 55):.1f}%"></span>'
                   if _bool(v.attr("showsUserLocation", "userLocation")) else "") + "</div>")


def _col_name(i: int) -> str:
    name = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        name = chr(65 + r) + name
    return name


def _col_index(letters: str) -> int:
    n = 0
    for ch in letters.upper():
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def _parse_range(text: str) -> tuple[int, int, int, int] | None:
    """'B2:D5' → (col0, row0, col1, row1) with 0-based columns and 1-based rows."""
    m = re.fullmatch(r"\s*([A-Za-z]+)(\d+)(?::([A-Za-z]+)(\d+))?\s*", text or "")
    if not m:
        return None
    c0, r0 = _col_index(m.group(1)), int(m.group(2))
    c1, r1 = (_col_index(m.group(3)), int(m.group(4))) if m.group(3) else (c0, r0)
    return min(c0, c1), min(r0, r1), max(c0, c1), max(r0, r1)


def _hour(h: object) -> str:
    x = _num(h, 0) or 0.0
    hh, mm = int(x), int(round((x - int(x)) * 60))
    return f"{hh}:{mm:02d}"


_KEYWORDS = {
    "swift": "import struct class enum protocol extension func var let if else guard return for in while switch case "
             "default some any self Self true false nil private public static async await throws try init",
    "js": "import export from const let var function return if else for of in while class extends new this true "
          "false null undefined async await try catch switch case default typeof interface type",
    "python": "import from def class return if elif else for in while with as try except finally True False None "
              "lambda yield async await pass raise and or not is",
    "go": "package import func var const type struct interface return if else for range go defer map chan nil true false",
    "rust": "use fn let mut pub struct enum impl trait match if else for in while loop return Some None Ok Err self",
    "css": "",
    "html": "",
    "json": "true false null",
    "sql": "SELECT FROM WHERE JOIN LEFT RIGHT INNER ON GROUP BY ORDER LIMIT INSERT INTO VALUES UPDATE SET DELETE "
           "CREATE TABLE AND OR NOT AS COUNT SUM",
    "shell": "cd ls export echo sudo git npm pip python cargo make",
}


_ALIASES = {"javascript": "js", "ts": "js", "typescript": "js", "tsx": "js", "jsx": "js", "py": "python",
            "sh": "shell", "bash": "shell", "zsh": "shell", "rs": "rust", "kt": "swift", "kotlin": "swift",
            "java": "js", "csharp": "js", "cs": "js", "c": "js", "cpp": "js"}


_TOKEN = re.compile(r'(?P<comment>//.*$|#(?!\w*\{).*$|--.*$)|(?P<string>"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`[^`]*`)'
                    r"|(?P<number>\b\d+(?:\.\d+)?\b)|(?P<word>[A-Za-z_@][A-Za-z0-9_]*)|(?P<tag></?[a-zA-Z][\w-]*)")


def _highlight(line: str, lang: str) -> str:
    lang = _ALIASES.get(lang, lang)
    if lang not in _KEYWORDS:
        return esc(line)
    kws = set(_KEYWORDS[lang].split())
    out, pos = [], 0
    for m in _TOKEN.finditer(line):
        kind = m.lastgroup
        text = m.group(0)
        if kind == "comment" and lang in ("python", "shell") and not text.startswith("#"):
            kind = None
        if kind == "comment" and text.startswith("#") and lang not in ("python", "shell"):
            kind = None
        if kind == "comment" and text.startswith("--") and lang != "sql":
            kind = None
        out.append(esc(line[pos:m.start()]))
        if kind == "word":
            if text in kws or (lang == "sql" and text.upper() in kws):
                out.append(f'<span class="mkd-code__kw">{esc(text)}</span>')
            elif text[:1].isupper() or text.startswith("@"):
                out.append(f'<span class="mkd-code__type">{esc(text)}</span>')
            elif line[m.end():m.end() + 1] == "(":
                out.append(f'<span class="mkd-code__fn">{esc(text)}</span>')
            else:
                out.append(esc(text))
        elif kind == "tag" and lang == "html":
            out.append(f'<span class="mkd-code__kw">{esc(text)}</span>')
        elif kind in ("comment", "string", "number"):
            out.append(f'<span class="mkd-code__{"str" if kind == "string" else ("num" if kind == "number" else "comment")}">'
                       f"{esc(text)}</span>")
        else:
            out.append(esc(text))
        pos = m.end()
        if kind == "comment":
            break
    out.append(esc(line[pos:]))
    return "".join(out)


def _terminal_line(line: str) -> str:
    m = re.match(r"^(\S*[$%#>]) (.*)$", line)
    if m:
        return f'<span class="mkd-code__prompt">{esc(m.group(1))}</span> <span class="mkd-code__cmd">{esc(m.group(2))}</span>'
    return f'<span class="mkd-code__out">{esc(line)}</span>'


_MAP_SVG = (
    '<svg class="mkd-map__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
    '<rect class="mkd-map__land" width="400" height="300"/>'
    '<path class="mkd-map__park" d="M40 40h90v70H40zM260 190h80v70h-80z"/>'
    '<path class="mkd-map__water" d="M0 220c60-30 110 20 180-10s120-50 220-20v110H0z"/>'
    '<g class="mkd-map__roads"><path d="M0 130h400M150 0v300M0 30l400 230M300 0v220"/></g>'
    '<g class="mkd-map__minor"><path d="M0 80h400M0 180h400M60 0v300M230 0v300M360 0v300"/></g></svg>')
