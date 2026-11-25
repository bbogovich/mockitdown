# NLS (oN-Line System)

The **nls** pack imitates the **oN-Line System** built by Douglas Engelbart's Augmentation Research
Center (ARC) at SRI, as the audience saw it on **9 December 1968** at the Fall Joint Computer
Conference in San Francisco — the session later called "the Mother of All Demos". The system ran on an
SDS 940 timesharing computer at SRI in Menlo Park. Each workstation's text and lines were drawn on a
small CRT, picked up by a television camera, and sent as video to the monitor in front of the user; in
San Francisco that video was projected onto a large screen. What people saw was therefore a
**monochrome television picture**: light, slightly blooming characters on a dark grey field, with scan
lines and a dim rim.

What was on that screen, and what this pack draws:

- **Structured statements.** A file is a hierarchy of statements numbered `1`, `1a`, `1a1`, `1a1a`
  (digits and letters alternate by level). `StatementFile` numbers nested `Statement`s automatically.
- **View specifications** change how the same file is shown, never its contents: how many **levels**
  are visible, whether each statement is **truncated** to its first line, and whether **statement
  numbers** are shown. Here: `StatementFile(levels: 2, lines: 1, numbers: false)`.
- **The command feedback line** at the top shows the command being composed — `INSERT STATEMENT`,
  `JUMP LINK`, `DELETE WORD` — and echoes what is typed on the five-key **chord keyset** (`FeedbackLine`,
  `Echo`, `CommandWord`, `ViewSpec`, `Register`, `SystemMessage`, `Chord`).
- **The bug**, the tracking spot moved by the three-button mouse, drawn as a short upward arrow (`Bug`);
  a second user on a shared screen gets a hollow one (`PartnerBug`).
- **Display areas** side by side or stacked (`SplitScreen`, `DisplayArea`), each with its file address.
- **Links** between statements, in the same file or another, shown as text in parentheses
  (`StatementLink`, `FileLink`).
- **Line drawings**: a route map for errands and diagrams (`RouteMap`, `Drawing`, `Stroke`, `Node`).
- **Video superimposition**: the camera picture of a person mixed into the display (`VideoInset`,
  `.variant(.overlay)`).
- There were no on-screen buttons; `CommandButton` (and the core `Button`) render a command word in
  brackets, `[JUMP]`.

Select it with `import NLS` (also `OnLineSystem`, `ARC`) or `pack="nls"`. The whole screen is a
`Display` (alias `Screen`) whose `header:` slot holds the `FeedbackLine`; `file:` and `viewspec:` show
under it (the view-spec letters in these mockups are illustrative, not a reference). There was no colour and no dark mode: the **light** appearance is the projected picture —
grey field, lower contrast, more bloom — and the **dark** appearance is a deeper, crisper direct-view
tube with near-black field and brighter characters. Use `appearance="both"` to compare.

`NlsScreen`, `ShoppingFile`, `Keyset` and `ThreeButtonMouse` are custom components in
`mockups/nls/console.mockitdown`, imported with `import "nls/console"`. All file names, lists and
people below are invented; nothing is transcribed from the 1968 session.

## A shopping list

A small structured file: four top-level statements with sub-statements, automatically numbered. The
bug rests on statement `2b`, which is intensified (#1). Statement `1c` carries a link (#2, at the end of its line) to
statement `3b`, shown in parentheses. The feedback line (#3) is empty, waiting for a command, and
the view specifications (#4) are shown at the right.

```mockitdown pack="nls" appearance="both" height="470" title="Shopping list" source="true"
import NLS

Display(file: "<ARC>ERRANDS, 1") {
  StatementFile {
    Statement("produce") {
      Statement("apples, the tart green kind") {
        Statement("six if small")
        Statement("four if large")
      }
      Statement("carrots")
      Statement("lettuce") { StatementLink("3b") }.callout(2, alignment: .trailing, inset: true)
    }
    Statement("bakery") {
      Statement("rye loaf, sliced")
      Statement("rolls for Sunday", selected: true) { Bug() }
        .callout(1, alignment: .trailing, inset: true)
    }
    Statement("market") {
      Statement("milk, two quarts")
      Statement("cheese for the salad")
    }
    Statement("drugstore")
  }
} header: {
  FeedbackLine("") {
    Echo("").callout(3, alignment: .trailing)
    Spacer()
    ViewSpec("abm").padding(.leading, 24).callout(4, alignment: .leading)
    Register("ARC 940")
  }
}
```

## One file, three views

The same file under three view specifications, in three display areas. Left: every level, all lines,
numbers on. Middle: first level only. Right: two levels, truncated to one line each, numbers off. The
file does not change — only the view does.

```mockitdown pack="nls" width="1040" height="600" title="View specifications"
import "nls/console"

NlsScreen(command: "SET VIEWSPECS", echo: "c w m", file: "<ARC>ERRANDS, 1", viewspec: "cwm") {
  SplitScreen {
    DisplayArea("ERRANDS · all", viewspec: "cwm") { ShoppingFile() }
    DisplayArea("ERRANDS · 1 level", viewspec: "awm") { ShoppingFile(levels: 1) }
    DisplayArea("ERRANDS · 2 levels", viewspec: "btn") {
      ShoppingFile(levels: 2, lines: 1, numbers: false)
    }
  }
}
```

## Following a link

`JUMP LINK` in mid-flight: the bug is on the link `(PANTRY, 1c)` in the upper area, and the lower area
already shows the target file with statement `1c` intensified. Statement numbers are links too —
`3b` here is a statement in the same file.

```mockitdown pack="nls" height="520" title="Jump to link"
import NLS

Display(file: "<ARC>ERRANDS, 3c", viewspec: "bm") {
  SplitScreen(orientation: .vertical) {
    DisplayArea("<ARC>ERRANDS, 3", viewspec: "bm") {
      StatementFile(levels: 2) {
        Statement("market", number: "3") {
          Statement("milk, two quarts", number: "3a")
          Statement("cheese for the salad", number: "3b") { StatementLink("1c") }
          Statement("coffee", number: "3c") { FileLink("PANTRY, 1c", selected: true); Bug() }
        }
      }
    }
    DisplayArea("<ARC>PANTRY, 1c", viewspec: "bm") {
      StatementFile(levels: 2) {
        Statement("shelf by the window", number: "1") {
          Statement("flour and sugar — check before the pie", number: "1a")
          Statement("tea", number: "1b")
          Statement("coffee: half a tin left, enough until Thursday", number: "1c", selected: true)
        }
        Statement("cold box", number: "2") {
          Statement("butter", number: "2a")
        }
      }
    }
  }
} header: {
  FeedbackLine("JUMP LINK") {
    Echo("PANTRY, 1c")
    SystemMessage("OK")
    Spacer()
    Chord("j")
    Register("ARC 940")
  }
}
```

## Mid-command

The feedback line while a command is being composed: `DELETE WORD` has been chosen with two keyset
chords, the bug has selected the word "stale" in `2a`, and the system waits for the mouse button that
confirms. A help area at the right shows the chord being held on the keyset and the mouse button that
confirms — drawn with the `Keyset` and `ThreeButtonMouse` custom components.

```mockitdown pack="nls" width="1040" height="440" title="Mid-command" source="true"
import "nls/console"

NlsScreen(command: "DELETE WORD", echo: "at 2a", file: "<ARC>MEMO, 2a", viewspec: "bm") {
  HStack(alignment: .top, spacing: 18) {
    StatementFile(levels: 2) {
      Statement("Meeting on Thursday") {
        Statement("room by the library, two o'clock")
        Statement("bring the revised list")
      }
      Statement("Notes from Monday") {
        Statement("the") { Text("**stale**"); Bug(); Text("draft of the plan is replaced by the outline") }
        Statement("each of us edits a branch, not the whole file")
      }
      Statement("Open questions") {
        Statement("who keeps the master copy (3b)")
      }
    }
    .frame(maxWidth: .infinity)
    DisplayArea("<ARC>HELP, keyset") {
      HStack(alignment: .bottom, spacing: 18) {
        Keyset(down: [false, true, false, false, true], caption: "chord: w")
        ThreeButtonMouse(pressed: 1, caption: "confirm")
      }
      Caption("d = delete · w = word")
      HStack(spacing: 8) { Chord("d"); Chord("w"); CommandButton("CA", variant: .primary) }
    }
    .frame(width: 250)
  }
}
```

## Shared screen

Two people working on one file over the link between sites, each display showing both bugs. The person
in control has the solid bug, at the end of line (#1); the partner's hollow bug (#2) points at what
they are talking about.
The feedback line (#3) names the command and who is in control. Each area keeps its own view
specification (#4): the right one shows one level, truncated to first lines.

```mockitdown pack="nls" appearance="both" width="1040" height="460" title="Shared screen"
import "nls/console"

NlsScreen(command: "SHARE SCREEN", echo: "control: you", file: "<ARC>PLAN, 1", viewspec: "bm") {
  SplitScreen {
    DisplayArea("<ARC>PLAN, 1", viewspec: "bm") {
      StatementFile(levels: 2) {
        Statement("Saturday: fair for the school") {
          Statement("tables — six borrowed, two missing") { Bug() }.callout(1, alignment: .trailing, inset: true)
          Statement("signs to paint (2b)")
        }
        Statement("people") {
          Statement("Ada takes the cake stall")
          Statement("Ben takes the raffle") { PartnerBug() }.callout(2, alignment: .trailing, inset: true)
        }
      }
    }
    DisplayArea("<ARC>PLAN, 2b", viewspec: "atm") {
      StatementFile(levels: 1, lines: 1) {
        Statement("signs: three for the gate, one for the hall, one by the road, all on card")
        Statement("paint: borrow from the art room")
        Statement("deadline Friday noon")
      }
    }
    .callout(4, alignment: .trailing, inset: true)
  }
}
.callout(3, alignment: .top, inset: true)
```

## Route map

The errands as a line drawing: the stops of the shopping list on a simple street map, the route
between them, and the list beside it with links into `<ARC>ERRANDS`.

```mockitdown pack="nls" width="1040" height="520" title="Route map"
import NLS

Display(file: "<ARC>ROUTE, 1", viewspec: "bm") {
  HStack(alignment: .top, spacing: 18) {
    RouteMap(pins: [(12, 78, "home"), (30, 30, "library"), (55, 22, "bakery"), (80, 42, "market"), (62, 76, "drugstore")],
             route: true)
      .frame(width: 600, height: 380)
    VStack(alignment: .leading, spacing: 10) {
      Heading("stops")
      StatementFile {
        Statement("library") { FileLink("ERRANDS, 1") }
        Statement("bakery") { FileLink("ERRANDS, 2") }
        Statement("market") { FileLink("ERRANDS, 3") }
        Statement("drugstore") { FileLink("ERRANDS, 4") }
      }
      Rule()
      Caption("about 2.4 miles, on foot")
    }
    .frame(width: 330)
  }
} header: {
  FeedbackLine("SHOW DRAWING") { Echo("ROUTE"); Spacer(); Register("ARC 940") }
}
```

## Structure as a diagram

A file's hierarchy drawn as a tree of nodes and vector lines — a `Drawing` of `Node`s and rotated
`Stroke`s placed with `.position(x:y:)`. The bug sits on one node.

```mockitdown pack="nls" width="1040" height="440" title="Diagram"
import NLS

Display(file: "<ARC>PLAN, diagram", viewspec: "bm") {
  Drawing {
    Node("PLAN").position(x: 450, y: 30)
    Stroke().frame(width: 244, height: 2).rotationEffect(.degrees(160.4)).position(x: 335, y: 85)
    Stroke().frame(width: 82, height: 2).rotationEffect(.degrees(90)).position(x: 450, y: 85)
    Stroke().frame(width: 244, height: 2).rotationEffect(.degrees(19.6)).position(x: 565, y: 85)
    Node("1 fair").position(x: 220, y: 140)
    Node("2 people").position(x: 450, y: 140)
    Node("3 money").position(x: 680, y: 140)
    Stroke().frame(width: 94, height: 2).rotationEffect(.degrees(129.8)).position(x: 190, y: 195)
    Stroke().frame(width: 94, height: 2).rotationEffect(.degrees(50.2)).position(x: 250, y: 195)
    Stroke(variant: .dashed).frame(width: 72, height: 2).rotationEffect(.degrees(90)).position(x: 450, y: 195)
    Stroke().frame(width: 94, height: 2).rotationEffect(.degrees(129.8)).position(x: 650, y: 195)
    Stroke().frame(width: 94, height: 2).rotationEffect(.degrees(50.2)).position(x: 710, y: 195)
    Node("1a tables").position(x: 160, y: 250)
    Node("1b signs").position(x: 280, y: 250)
    Node("2a stalls").position(x: 450, y: 250)
    Node("3a float").position(x: 620, y: 250)
    Node("3b takings").position(x: 740, y: 250)
    Bug().position(x: 290, y: 280)
  }
  Caption("dashed: a link, not a branch")
} header: {
  FeedbackLine("SHOW STRUCTURE") { Echo("levels 2"); Spacer(); Register("ARC 940") }
}
```

## Video session

A session with a remote colleague: the television picture of the partner is mixed into the display,
once as a framed inset at the right and once superimposed, translucent, over the text — the way the
camera picture and the display could be combined on one monitor.

```mockitdown pack="nls" width="1040" height="460" title="Video session"
import "nls/console"

NlsScreen(command: "TALK", echo: "with site 2", file: "<ARC>PLAN, 3", viewspec: "bm") {
  HStack(alignment: .top, spacing: 18) {
    ZStack(alignment: .bottomTrailing) {
      StatementFile(levels: 2) {
        Statement("money") {
          Statement("float for the cake stall: small change only")
          Statement("takings counted twice, by two people") { PartnerBug() }
          Statement("receipts to the treasurer on Monday")
        }
        Statement("after the fair") {
          Statement("return the tables (1a)")
          Statement("thank-you notes") { Bug() }
        }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      VideoInset("superimposed: camera 1").variant(.overlay).frame(width: 240, height: 200)
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 8) {
      VideoInset("camera 2 — site 2").frame(height: 220)
      Caption("picture mixed into the display")
      HStack(spacing: 10) { CommandButton("TALK", selected: true); CommandButton("QUIT") }
    }
    .frame(width: 280)
  }
}
```
