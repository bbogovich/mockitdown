"""The non-standard component roles (R-REND-011): spreadsheet, code, gantt, schedule, canvas and the rest.

Each test names the test case (TC-n) and the clauses it verifies.
"""

import re
import unittest

from tests.helpers import ROOT, html
from mockitdown.packs import PackRegistry
from mockitdown.render.html import Renderer

BASE_CSS = (ROOT.parent / "shared" / "packs" / "base" / "pack.css").read_text(encoding="utf-8")

#: R-REND-011.C1: role → the base elements that use it.
ROLES = {
    "spreadsheet": ["Spreadsheet"], "stickynote": ["StickyNote"], "board": ["Board"], "boardcolumn": ["BoardColumn"],
    "kanbancard": ["KanbanCard"], "code": ["CodeEditor", "CodeBlock", "Terminal"],
    "message": ["MessageBubble", "Comment"], "tree": ["Tree"], "treeitem": ["TreeItem"], "timeline": ["Timeline"],
    "timelineitem": ["TimelineItem"], "gantt": ["Gantt"], "schedule": ["Schedule"], "kbd": ["Kbd"],
    "skeleton": ["Skeleton"], "swatches": ["ColorSwatches"], "canvas": ["Canvas", "Whiteboard"],
    "media": ["VideoPlayer"], "emptystate": ["EmptyState"], "stat": ["Stat"], "map": ["Map"],
}
#: R-REND-011.C6: the declarations allowed a fixed colour (things whose real colour does not follow the theme).
FIXED_COLOURS = {"stickynote": {"color", "box-shadow"}, "kanbancard": {"--mkd-avatar-bg", "--mkd-avatar-fg"},
                 "code": {"border-color", "background", "color"}, "timelineitem": {"color"},
                 "swatches": {"box-shadow"}, "media": {"background", "color"}, "map": {"stroke"}}


def screen(out):
    return out[out.index('<div class="mkd-screen">') + len('<div class="mkd-screen">'):]


def rules_of(role):
    """(selector, declarations) of every base rule that styles ``role`` or one of its parts."""
    css = re.sub(r"/\*.*?\*/", "", BASE_CSS, flags=re.S)
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        if re.search(rf"\.mkd-{role}(?![\w-])|\.mkd-{role}__", m.group(1)):
            yield m.group(1).strip(), [d.strip() for d in m.group(2).split(";") if d.strip()]


class ComponentRoleTests(unittest.TestCase):
    """R-REND-011 TC-1."""

    def test_roles_and_base_names(self):  # TC-1 (C1)
        renderer_roles = {n[2:] for n in dir(Renderer) if n.startswith("r_")}
        base = PackRegistry().get("base")
        for role, names in ROLES.items():
            self.assertIn(role, renderer_roles)
            for name in names:
                self.assertIn(name, base.own_elements, name)
                self.assertEqual(base.element(name).role, role, name)
                for pid in PackRegistry().ids():
                    self.assertIn(name, PackRegistry().get(pid).elements, f"{pid} does not inherit {name}")
                self.assertRegex(html(f"{name}()"), rf'class="mkd-{role}[ "][^>]*data-el="{name}"')

    def test_spreadsheet(self):  # TC-1 (C2, V1)
        out = screen(html('Spreadsheet(rows: [[1, "a"], [3, 4.5]], selection: "A1:B1", active: "B2", '
                          'formula: "=SUM(A1:A2)", highlight: ["A2": "yellow"], sheets: ["Q1", "Q2"])'))
        self.assertEqual(re.findall(r'class="mkd-spreadsheet__colhead"[^>]*>(\w+)<', out), ["A", "B"])
        self.assertEqual(re.findall(r'class="mkd-spreadsheet__rowhead"[^>]*>(\d+)<', out), ["1", "2"])
        cells = re.findall(r'<td class="mkd-spreadsheet__cell"([^>]*)>([^<]*)<', out)
        self.assertEqual([c[1] for c in cells], ["1", "a", "3", "4.5"])
        self.assertEqual(['data-num="true"' in a for a, _ in cells], [True, False, True, True])   # numbers right-aligned
        self.assertEqual(['data-in-sel="true"' in a for a, _ in cells], [True, True, False, False])
        self.assertIn('data-edge="tbl"', cells[0][0])                                            # the selection border
        self.assertEqual(len(re.findall(r'class="mkd-spreadsheet__colhead" data-sel="true"', out)), 2)
        self.assertEqual(len(re.findall(r'class="mkd-spreadsheet__rowhead" data-sel="true"', out)), 1)
        self.assertIn('data-active="true"', cells[3][0])
        self.assertIn("background:color-mix(in srgb, var(--mkd-color-yellow)", cells[2][0])
        self.assertIn('<span class="mkd-spreadsheet__expr">=SUM(A1:A2)</span>', out)
        self.assertEqual(re.findall(r'class="mkd-spreadsheet__sheet"[^>]*>(\w+)<', out), ["Q1", "Q2"])
        self.assertNotIn("mkd-spreadsheet__formula", html("Spreadsheet(rows: [[1]])"))

    def test_code(self):  # TC-1 (C3)
        out = screen(html('CodeBlock("let x = 1 // note\\nfunc f() {}", language: "swift", highlight: [2], '
                          'lineNumbers: true)'))
        lines = re.findall(r'<div class="mkd-code__line"([^>]*)>', out)
        self.assertEqual(lines, ["", ' data-hl="true"'])
        self.assertEqual(re.findall(r'<span class="mkd-code__num">(\d+)</span><span class="mkd-code__text">', out),
                         ["1", "2"])
        for kind, text in (("kw", "let"), ("comment", "// note"), ("fn", "f")):
            self.assertIn(f'<span class="mkd-code__{kind}">{text}</span>', out)
        self.assertNotIn("mkd-code__num", screen(html('CodeBlock("x", language: "swift")')))
        samples = {"swift": ('struct A: View {}', "type", "View"), "js": ('const s = "q"', "str", "&quot;q&quot;"),
                   "ts": ("let n: number = 4", "num", "4"), "python": ("def f(): pass", "kw", "def"),
                   "go": ("func main() {}", "kw", "func"), "rust": ("fn main() {}", "kw", "fn"),
                   "json": ('{"a": 1}', "str", "&quot;a&quot;"), "sql": ("SELECT * FROM t", "kw", "SELECT"),
                   "shell": ("# a comment", "comment", "# a comment"), "html": ('<p class="a">', "kw", "&lt;p")}
        for lang, (src, kind, text) in samples.items():
            with self.subTest(language=lang):
                escaped = src.replace("\\", "\\\\").replace('"', '\\"')
                out = screen(html(f'CodeBlock("{escaped}", language: "{lang}")'))
                self.assertIn(f'<span class="mkd-code__{kind}">{text}</span>', out)
        term = screen(html('Terminal("$ ls -l\\nfile.txt")'))
        self.assertIn('data-variant="terminal"', term)
        self.assertIn('<span class="mkd-code__prompt">$</span> <span class="mkd-code__cmd">ls -l</span>', term)
        self.assertIn('<span class="mkd-code__out">file.txt</span>', term)
        self.assertIn("mkd-code__bar", term)                       # a terminal window
        self.assertIn('data-variant="terminal"', html('CodeBlock("$ x", variant: "terminal")'))

    def test_gantt_and_schedule(self):  # TC-1 (C4, V2)
        out = screen(html('Gantt(scale: ["W1","W2"], tasks: [("A", 0, 1), ("M", 1, 0), ("B", 0, 2, 0.5)], today: 1)'))
        self.assertEqual(re.findall(r'<span class="mkd-gantt__scale">(.*?)</span></div>', out)[0],
                         "<span>W1</span><span>W2</span>")
        self.assertEqual(re.findall(r'class="mkd-gantt__bar" style="left:([\d.]+)%;width:([\d.]+)%', out),
                         [("0.00", "50.00"), ("0.00", "100.00")])
        self.assertEqual(re.findall(r'class="mkd-gantt__milestone" style="left:([\d.]+)%"', out), ["50.00"])
        self.assertIn('class="mkd-gantt__progress" style="width:50%"', out)
        self.assertIn('class="mkd-gantt__today" style="left:50.00%"', out)
        v2 = screen(html('Gantt(scale: ["W1","W2"], tasks: [("A", 0, 1), ("M", 1, 0)])'))
        self.assertEqual((v2.count("mkd-gantt__bar"), v2.count("mkd-gantt__milestone")), (1, 1))
        sched = screen(html('Schedule(events: [("Standup", 0, 9, 10), ("Review", 2, 10, 12, "green")], '
                            'startHour: 8, endHour: 12, now: 9.5)'))
        self.assertEqual(re.findall(r"<span>(\d+:00)</span>", sched), ["8:00", "9:00", "10:00", "11:00"])
        days = re.findall(r'<div class="mkd-schedule__day">(.*?)</div></div>', sched)
        self.assertIn("Standup", days[0])
        self.assertIn("Review", days[2])
        self.assertIn('style="top:25.00%;height:25.00%', days[0])                # 9–10 of 8–12
        self.assertIn('style="top:50.00%;height:50.00%', days[2])                # 10–12 of 8–12
        self.assertIn("var(--mkd-color-green)", days[2])
        self.assertIn('class="mkd-schedule__now" style="top:37.50%"', sched)

    def test_canvas(self):  # TC-1 (C5)
        out = screen(html('Canvas { Text("a").position(x: 10, y: 20); StickyNote("n").position(x: 200, y: 80) }'))
        self.assertTrue(out.startswith('<div class="mkd-canvas" data-el="Canvas">'))
        self.assertIn('data-positioned="true" style="position:absolute;left:calc(10 * var(--u));'
                      'top:calc(20 * var(--u))', out)
        self.assertEqual(out.count('data-positioned="true"'), 2)
        rule = dict(rules_of("canvas"))
        self.assertTrue(any("position: relative" in d for d in sum(rule.values(), [])))

    def test_restyled_through_tokens(self):  # TC-1 (C6)
        sources = ['Spreadsheet(rows: [[1, 2]], selection: "A1")', 'KanbanCard(title: "T", tags: ["a"])',
                   'Gantt(scale: ["W1"], tasks: [("A", 0, 1)])', 'Stat(label: "Users", value: "12", change: "+3%")',
                   'MessageBubble("hi", from: "me")', 'TreeItem("Docs", expanded: true) { TreeItem("a") }']
        for src in sources:   # the same markup in every pack: packs restyle, they add none
            with self.subTest(src=src):
                want = re.sub(r' class="mkd-pack-\w+"', "", screen(html(src, chrome="none")))
                for pid in ("fluent", "mui", "carbon", "win95"):
                    self.assertEqual(screen(html(src, pack=pid, chrome="none")), want, pid)
        colour = re.compile(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(")
        for role in ROLES:
            for selector, decls in rules_of(role):
                for d in decls:
                    prop, _, value = d.partition(":")
                    if colour.search(value) and "var(" not in value:
                        self.assertIn(prop.strip(), FIXED_COLOURS.get(role, set()), f"{selector} {{ {d} }}")
                    if prop.strip() == "font-family" and "var(" not in value:
                        self.assertIn("mkd-spreadsheet__fx", selector, f"{selector} {{ {d} }}")


if __name__ == "__main__":
    unittest.main()
