# Primer

The `primer` pack imitates **GitHub Primer** — the Primer React components on the current Primer
Primitives, with the **light default** and **dark default** themes. Its tokens carry the Primer
functional variables (`bgColor-default` `#ffffff` / `#0d1117`, `bgColor-muted` `#f6f8fa` /
`#151b23`, `fgColor-muted` `#59636e` / `#9198a1`, `borderColor-default` `#d1d9e0` / `#3d444d`,
`fgColor-accent` `#0969da` / `#4493f8`, the success / attention / severe / danger / done scales,
the green primary button `#1f883d` / `#238636` and the coral UnderlineNav marker), the system
font stack at 14 px / 20 px, `ui-monospace` for code, 32 px medium controls (28 small, 40 large),
6 px control radius and 12 px overlay radius. Select it with `import Primer` (or `import
PrimerReact`, `import GitHub`).

Elements use the Primer React component names, with sub-components spelled without the dot
(`ActionList.Item` → `ActionListItem`): `Button` (`variant: .default | .primary | .danger |
.invisible | .link`, `size: .small | .medium | .large`, `leadingVisual:`, `trailingAction:`,
`count:`), `IconButton`, `ButtonGroup`, `Counter`, `Label` (`.accent`, `.success`, `.attention`,
`.severe`, `.danger`, `.done`, `.sponsors` …), `StateLabel` (`status: .issueOpened | .issueClosed |
.pullOpened | .pullMerged | .pullClosed | .draft`), `IssueLabel`, `Token` / `AvatarToken`,
`Avatar` / `AvatarStack`, `Header`, `PageHeader` (`PageHeaderTitleArea`, `PageHeaderTitle`,
`PageHeaderActions`, `PageHeaderDescription`, `PageHeaderNavigation`), `UnderlineNav` /
`UnderlineNavItem`, `TabNav`, `SubNav`, `SegmentedControl` / `SegmentedControlButton`, `NavList`
(`NavListItem`, `NavListGroup`), `ActionList` (`ActionListItem`, `ActionListGroup`,
`ActionListDivider`), `ActionMenu` / `ActionMenuItem`, `SelectPanel`, `TreeView` /
`TreeViewItem`, `Timeline` / `TimelineItem`, `Flash`, `Banner`, `InlineMessage`, `Blankslate`,
`BorderBox` / `BoxRow`, `Dialog`, `ConfirmationDialog`, `Tooltip`, `BranchName`, `RelativeTime`,
`TextInput`, `Textarea`, `Select`, `Autocomplete`, `TextInputWithTokens`, `FormControl`,
`Checkbox`, `Radio`, `ToggleSwitch`, `Pagination`, `Breadcrumbs`, `SplitPageLayout`,
`PageLayout`, `DataTable`, `ProgressBar`, `Spinner`, `Heading`, `Text`, `Octicon` and `Kbd`. Code
and diff views reuse the `code` role (`CodeView`, `Snippet`) plus diff rows (`DiffFile`,
`DiffHunk`, `DiffLine`, `DiffNumber`, `DiffCode`). Octicon names (`git-branch`, `issue-opened`,
`git-pull-request`, `kebab-horizontal`, `file-directory-fill`, `repo` …) map onto the built-in
icon set.

The custom components (`RepoHeader`, `IssueRow`, `FileRow`, `Line`, `Hunk`, `CommentBlock`,
`SettingsSection`) live in `mockups/primer/github.mockitdown` and are imported with
`import "primer/github"`. All repositories and people are invented; the header mark is a neutral
glyph.

## Sign in

A narrow centred form: the mark, a heading, a muted box with two `TextInput`s, a full-width
primary `Button`, and a second box with a link.

```mockitdown source="true" appearance="both" device="fit" title="Sign in"
import Primer

VStack(spacing: 16) {
  Octicon("cube", size: 48)
  Heading("Sign in to Forgehub", variant: .medium).fontWeight(.light)
  VStack(alignment: .stretch, spacing: 16) {
    TextInput("", label: "Username or email address", value: "mona-lin")
    VStack(alignment: .stretch, spacing: 8) {
      HStack {
        Text("Password").fontWeight(.semibold)
        Spacer()
        Link("Forgot password?", size: .small)
      }
      TextInput("Password", type: .password, value: "correct-horse").state(.focused)
    }
    Button("Sign in", variant: .primary).frame(maxWidth: .infinity)
  }
  .padding(16)
  .background(.secondary.opacity(0.06))
  .cornerRadius(6)
  .border(.secondary.opacity(0.25))
  HStack(spacing: 4) {
    Text("New to Forgehub?")
    Link("Create an account")
  }
  .padding(16)
  .frame(maxWidth: .infinity)
  .cornerRadius(6)
  .border(.secondary.opacity(0.25))
}
.frame(width: 308)
```

## Repository home

The code tab of a repository: the global `Header` with the repository `UnderlineNav` (`RepoHeader`),
the title row with `Avatar`, `Label` and `Button`s with counters, the branch `ActionMenuButton`, a
`TextInput` with a `Kbd` hint, the file table as a `BorderBox` of `FileRow`s and the About side
column with topic `Token`s.

```mockitdown title="Repository" url="https://forgehub.example/acme-labs/rocket" height="900"
import Primer
import "primer/github"

VStack(alignment: .stretch, spacing: 0) {
  RepoHeader(tab: "Code")
  VStack(alignment: .stretch, spacing: 16) {
    HStack(spacing: 8) {
      Avatar("Acme Labs", image: "assets/images/logo.svg", size: 24, square: true)
      Text("rocket").font(.titleMedium)
      Label("Public")
      Spacer()
      Button("Pin", leadingVisual: "pin", size: .small)
      Button("Unwatch", leadingVisual: "eye", count: 18, trailingAction: "triangle-down", size: .small)
      Button("Fork", leadingVisual: "repo-forked", count: 214, trailingAction: "triangle-down", size: .small)
      Button("Starred", leadingVisual: "star-fill", count: "2.4k", trailingAction: "triangle-down", size: .small)
    }
    Divider()
    HStack(alignment: .top, spacing: 24) {
      VStack(alignment: .stretch, spacing: 16) {
        HStack(spacing: 8) {
          ActionMenuButton("main", leadingVisual: "git-branch")
          Button("12 Branches", leadingVisual: "git-branch", variant: .invisible)
          Button("48 Tags", leadingVisual: "tag", variant: .invisible)
          Spacer()
          TextInput("Go to file", leadingVisual: "search", trailingAction: "x").frame(width: 220)
          Button("Add file", trailingAction: "triangle-down")
          Button("Code", leadingVisual: "code", variant: .primary, trailingAction: "triangle-down")
        }
        BorderBox {
          FileRow(name: ".github", message: "ci: cache the toolchain between jobs", when: "3 days ago", folder: true)
          FileRow(name: "docs", message: "docs: launch checklist for 2.0", when: "last week", folder: true)
          FileRow(name: "src", message: "feat(engine): throttle curve presets", when: "2 hours ago", folder: true)
          FileRow(name: "tests", message: "test: cover abort sequence edge cases", when: "yesterday", folder: true)
          FileRow(name: ".gitignore", message: "chore: ignore local telemetry dumps", when: "2 months ago")
          FileRow(name: "LICENSE", message: "Initial commit", when: "3 years ago")
          FileRow(name: "README.md", message: "docs: new quick start", when: "4 days ago")
          FileRow(name: "package.json", message: "release: v2.4.0", when: "2 days ago")
        } header: {
          HStack(spacing: 8) {
            Avatar("Ravi Kumar", image: "assets/images/avatar-3.svg", size: 20)
            Text("**ravi-k** feat(engine): throttle curve presets (#482)")
            Spacer()
            Octicon("check").foregroundStyle(.green)
            Text("a1c9f3e · 2 hours ago").foregroundStyle(.secondary)
            Button("1,204 Commits", leadingVisual: "history", variant: .invisible, size: .small)
          }
        }
        BorderBox {
          VStack(alignment: .leading, spacing: 12) {
            Heading("rocket", variant: .large)
            Text("A tiny, typed flight-controller simulator for model rockets — thrust curves, staging and telemetry in one package.")
            Snippet("npm install @acme-labs/rocket", language: "shell")
          }
          .padding(24)
        } header: {
          UnderlineNav(selection: "README") {
            UnderlineNavItem("README", leadingVisual: "book")
            UnderlineNavItem("MIT license", leadingVisual: "law")
          }
        }
      }
      VStack(alignment: .stretch, spacing: 12) {
        Heading("About", variant: .small)
        Text("Typed flight-controller simulator for model rockets.")
        Link("rocket.acme-labs.dev", systemImage: "link").fontWeight(.semibold)
        HStack(spacing: 4, wrap: true) {
          Token("simulation").selected()
          Token("typescript").selected()
          Token("physics").selected()
          Token("telemetry").selected()
        }
        HStack(spacing: 8) { Octicon("book"); Text("Readme") }.foregroundStyle(.secondary)
        HStack(spacing: 8) { Octicon("star"); Text("2.4k stars") }.foregroundStyle(.secondary)
        HStack(spacing: 8) { Octicon("eye"); Text("18 watching") }.foregroundStyle(.secondary)
        HStack(spacing: 8) { Octicon("repo-forked"); Text("214 forks") }.foregroundStyle(.secondary)
        Divider()
        HStack(spacing: 8) {
          Heading("Releases", variant: .small)
          Counter(31)
        }
        HStack(spacing: 8) {
          Octicon("tag").foregroundStyle(.green)
          Text("v2.4.0").fontWeight(.semibold)
          Label("Latest", variant: .success)
        }
        Divider()
        Heading("Languages", variant: .small)
        ProgressBar(progress: 82)
      }
      .frame(width: 296)
    }
  }
  .padding(.horizontal, 32)
  .padding(.vertical, 16)
}
```

## Issue list

The issues tab: a filter `TextInput` (#1) next to `Labels` / `Milestones` as a `SubNav` and the
green **New issue** button, then a `BorderBox` whose header carries the open / closed toggle and
the filter `ActionMenu`s (#2) — the **Sort** menu is open. Each row is an `IssueRow` with
`IssueLabel`s, an `AvatarStack` of assignees and a comment count (#3); `Pagination` (#4) closes
the page.

```mockitdown source="true" title="Issues" url="https://forgehub.example/acme-labs/rocket/issues" height="860"
import Primer
import "primer/github"

VStack(alignment: .stretch, spacing: 0) {
  RepoHeader(tab: "Issues")
  VStack(alignment: .stretch, spacing: 16) {
    HStack(spacing: 8) {
      TextInput("Search issues", leadingVisual: "search", value: "is:issue state:open label:bug")
        .callout(1, "Filter query", alignment: .trailing, labelSide: .leading)
      SubNav {
        SubNavLink("Labels", leadingVisual: "tag")
        SubNavLink("Milestones", leadingVisual: "milestone")
      }
      Button("New issue", variant: .primary)
    }
    BorderBox {
      IssueRow(title: "Telemetry graph freezes after stage separation", number: 512, author: "ana-r",
               when: "2 hours ago", labels: [("bug", "red"), ("telemetry", "blue")],
               assignees: ["Ana Ruiz", "Ben Ito"], comments: 4)
      IssueRow(title: "Support custom thrust curves from CSV", number: 509, author: "kai-w",
               when: "yesterday", labels: [("enhancement", "teal"), ("good first issue", "purple")], comments: 12)
      IssueRow(title: "Abort sequence ignores the second igniter", number: 503, author: "mona-lin",
               when: "3 days ago", labels: [("bug", "red"), ("priority: high", "orange")],
               assignees: ["Mona Lin"], comments: 7, selected: true)
      IssueRow(title: "Docs: explain the staging timeline", number: 497, author: "sol-p",
               when: "last week", labels: [("documentation", "blue")], assignees: ["Sol Park", "Ravi Kumar", "Kai West"])
      IssueRow(title: "Wind model drifts at high altitude", number: 488, author: "ben-i",
               when: "2 weeks ago", labels: [("physics", "yellow"), ("needs triage", "gray")], comments: 2)
      IssueRow(title: "Flaky test: parachute deploy timing", number: 476, author: "ravi-k",
               when: "3 weeks ago", labels: [("tests", "green")], assignees: ["Ravi Kumar"], comments: 1)
        .callout(3, "Assignees and comments", alignment: .bottomTrailing, labelSide: .leading)
    } header: {
      HStack(spacing: 16) {
        Checkbox()
        Button("**24 Open**", leadingVisual: "issue-opened", variant: .invisible, size: .small)
        Button("163 Closed", leadingVisual: "check", variant: .invisible, size: .small)
          .foregroundStyle(.secondary)
        Spacer()
        HStack(spacing: 0) {
          ActionMenu("Author", variant: .invisible, size: .small)
            .callout(2, "Filter menus", alignment: .bottom)
          ActionMenu("Label", variant: .invisible, size: .small)
          ActionMenu("Assignee", variant: .invisible, size: .small)
          ActionMenu("Sort", variant: .invisible, size: .small, open: true) {
            Text("Sort by")
            ActionMenuItem("Newest", checked: true)
            ActionMenuItem("Oldest", checked: false)
            ActionMenuItem("Most commented", checked: false)
            ActionMenuItem("Recently updated", checked: false)
            ActionMenuDivider()
            ActionMenuItem("Best match", leadingVisual: "sparkle-fill")
          }
        }
      }
    }
    HStack {
      Spacer()
      Pagination(pageCount: 5, currentPage: 1).callout(4, "Pages")
      Spacer()
    }
  }
  .padding(.horizontal, 32)
  .padding(.vertical, 24)
}
```

## Pull request conversation

A `PageHeader` with the title, number, `StateLabel` and `BranchName`s, `UnderlineNav` tabs with
counters, then the conversation `Timeline`: `CommentBlock`s (an `Avatar` beside a
`TimelineComment`), commit and review events, and the merge box. The side column lists
reviewers, assignees and labels.

```mockitdown title="Pull request" url="https://forgehub.example/acme-labs/rocket/pull/482" height="1000"
import Primer
import "primer/github"

VStack(alignment: .stretch, spacing: 0) {
  RepoHeader(tab: "Pull requests")
  VStack(alignment: .stretch, spacing: 16) {
    PageHeader {
      PageHeaderTitleArea {
        PageHeaderTitle("Throttle curve presets for the engine model", variant: .large)
        Text("#482").font(.titleLarge).fontWeight(.light).foregroundStyle(.secondary)
        PageHeaderActions {
          Button("Edit", size: .small)
          Button("Code", leadingVisual: "code", variant: .primary, size: .small, trailingAction: "triangle-down")
        }
      }
      PageHeaderDescription {
        StateLabel("Open", status: .pullOpened, systemImage: "git-pull-request")
        Text("**ravi-k** wants to merge 3 commits into")
        BranchName("main")
        Text("from")
        BranchName("ravi-k/throttle-presets")
      }
    }
    UnderlineNav(selection: "Conversation") {
      UnderlineNavItem("Conversation", leadingVisual: "comment-discussion", counter: 4)
      UnderlineNavItem("Commits", leadingVisual: "git-commit", counter: 3)
      UnderlineNavItem("Checks", leadingVisual: "checklist", counter: 6)
      UnderlineNavItem("Files changed", leadingVisual: "file-diff", counter: 5)
    }
    HStack(alignment: .top, spacing: 24) {
      Timeline {
        CommentBlock(author: "ravi-k", when: "2 days ago", role: "Author", photo: "assets/images/avatar-3.svg") {
          Text("Adds three throttle presets (**gentle**, **standard**, **sport**) and a `curve(preset:)` helper. The presets are plain data, so the docs can render them.")
          Text("Closes #470.")
        }
        TimelineItem("**ravi-k** added 3 commits", systemImage: "git-commit", time: "2 days ago", variant: .condensed)
        TimelineItem("**ravi-k** added the **enhancement** label", systemImage: "tag", time: "2 days ago", variant: .condensed)
        CommentBlock(author: "mona-lin", when: "yesterday", role: "Maintainer", photo: "assets/images/avatar-1.svg") {
          Text("Looks good! Could the sport preset cap the burn at 90 % so the sim does not saturate?")
        }
        TimelineItem("**mona-lin** approved these changes", systemImage: "check", time: "yesterday", status: .open)
        TimelineItem("**ci-bot** All checks have passed — 6 successful checks", systemImage: "check-circle", time: "1 hour ago", status: .open)
        HStack(alignment: .top, spacing: 12) {
          Octicon("git-merge", size: 20).foregroundStyle(.white).frame(width: 40, height: 40).background(.green).cornerRadius(6)
          BorderBox {
            BoxRow {
              Octicon("check-circle-fill").foregroundStyle(.green)
              VStack(alignment: .leading, spacing: 0) {
                Text("All checks have passed").fontWeight(.semibold)
                Text("6 successful checks", size: .small).foregroundStyle(.secondary)
              }
              Spacer()
              Link("Show all checks")
            }
            BoxRow {
              Octicon("check-circle-fill").foregroundStyle(.green)
              VStack(alignment: .leading, spacing: 0) {
                Text("This branch has no conflicts with the base branch").fontWeight(.semibold)
                Text("Merging can be performed automatically.", size: .small).foregroundStyle(.secondary)
              }
            }
            BoxRow {
              ButtonGroup {
                Button("Merge pull request", variant: .primary)
                IconButton("triangle-down", variant: .primary)
              }
              Text("You can also merge this with the command line.", size: .small).foregroundStyle(.secondary)
            }
          }
        }
      }
      VStack(alignment: .stretch, spacing: 12) {
        HStack { Text("Reviewers", size: .small).fontWeight(.semibold).foregroundStyle(.secondary); Spacer(); Octicon("gear").foregroundStyle(.secondary) }
        HStack(spacing: 8) { Avatar("Mona Lin", image: "assets/images/avatar-1.svg"); Text("mona-lin").fontWeight(.semibold); Spacer(); Octicon("check").foregroundStyle(.green) }
        HStack(spacing: 8) { Avatar("Sol Park", image: "assets/images/avatar-2.svg"); Text("sol-p").fontWeight(.semibold); Spacer(); Octicon("dot-fill").foregroundStyle(.yellow) }
        Divider()
        Text("Assignees", size: .small).fontWeight(.semibold).foregroundStyle(.secondary)
        HStack(spacing: 8) { Avatar("Ravi Kumar", image: "assets/images/avatar-3.svg"); Text("ravi-k").fontWeight(.semibold) }
        Divider()
        Text("Labels", size: .small).fontWeight(.semibold).foregroundStyle(.secondary)
        HStack(spacing: 4, wrap: true) {
          IssueLabel("enhancement", color: .teal)
          IssueLabel("engine", color: .indigo)
        }
        Divider()
        Text("Milestone", size: .small).fontWeight(.semibold).foregroundStyle(.secondary)
        Text("v2.5").fontWeight(.semibold)
        ProgressBar(progress: 64)
      }
      .frame(width: 256)
    }
  }
  .padding(.horizontal, 32)
  .padding(.vertical, 24)
}
```

## Files changed

The diff tab of a pull request: a `TreeView` of the changed files with the current file marked, a
`SegmentedControl` for unified / split, and `DiffFile`s whose rows are the custom `Hunk` and `Line`
components built on `DiffHunk` / `DiffLine` / `DiffNumber` / `DiffCode`. A pending file shows a
`SkeletonText` while it loads.

```mockitdown source="true" title="Files changed" url="https://forgehub.example/acme-labs/rocket/pull/482/files" height="760" appearance="both"
import Primer
import "primer/github"

HStack(alignment: .top, spacing: 0) {
  VStack(alignment: .stretch, spacing: 12) {
    TextInput("Filter files…", leadingVisual: "filter", size: .small)
    TreeView {
      TreeViewItem("src", folder: true, expanded: true) {
        TreeViewItem("engine", folder: true, expanded: true) {
          TreeViewItem("presets.ts", leadingVisual: "file", detail: "+42").selected()
          TreeViewItem("throttle.ts", leadingVisual: "file", detail: "+9 −3")
        }
        TreeViewItem("index.ts", leadingVisual: "file", detail: "+1")
      }
      TreeViewItem("docs", folder: true, expanded: true) {
        TreeViewItem("presets.md", leadingVisual: "file", detail: "+28")
      }
      TreeViewItem("tests", folder: true, hasChildren: true, expanded: false)
    }
  }
  .padding(16)
  .frame(width: 280)
  Divider()
  VStack(alignment: .stretch, spacing: 16) {
    HStack(spacing: 8) {
      ActionMenuButton("All commits", size: .small)
      Text("**5 files** changed · ").foregroundStyle(.secondary)
      Text("+80").foregroundStyle(.green).fontWeight(.semibold)
      Text("−3").foregroundStyle(.red).fontWeight(.semibold)
      Spacer()
      SegmentedControl {
        SegmentedControlButton("Unified").selected()
        SegmentedControlButton("Split")
      }
      .size(.small)
      Button("Review changes", variant: .primary, size: .small, trailingAction: "triangle-down")
    }
    DiffFile("src/engine/throttle.ts", subtitle: "+9 −3") {
      Hunk(text: "@@ -12,9 +12,15 @@ export function throttle(level: number) {")
      Line(old: "12", new: "12", code: "  const clamped = Math.min(Math.max(level, 0), 1);")
      Line(kind: "deletion", old: "13", code: "  return curve(clamped);")
      Line(kind: "addition", new: "13", code: "  const preset = presets[options.preset ?? \"standard\"];")
      Line(kind: "addition", new: "14", code: "  const capped = Math.min(clamped, preset.maxBurn);")
      Line(kind: "addition", new: "15", code: "  return curve(capped, preset.shape);")
      Line(old: "14", new: "16", code: "}")
      Line(old: "15", new: "17", code: "")
      Line(kind: "deletion", old: "16", code: "export const DEFAULT_CURVE = \"linear\";")
      Line(kind: "addition", new: "18", code: "export const DEFAULT_PRESET = \"standard\";")
    } action: {
      Checkbox("Viewed")
      IconButton("kebab-horizontal", variant: .invisible, size: .small)
    }
    DiffFile("src/engine/presets.ts", subtitle: "+42") {
      Hunk(text: "@@ -0,0 +1,42 @@")
      Line(kind: "addition", new: "1", code: "export const presets = {")
      Line(kind: "addition", new: "2", code: "  gentle:   { maxBurn: 0.6, shape: \"ease-in\" },")
      Line(kind: "addition", new: "3", code: "  standard: { maxBurn: 0.8, shape: \"linear\" },")
      Line(kind: "addition", new: "4", code: "  sport:    { maxBurn: 0.9, shape: \"ease-out\" },")
    } action: {
      Checkbox("Viewed", checked: true)
      IconButton("kebab-horizontal", variant: .invisible, size: .small)
    }
    DiffFile("docs/presets.md", subtitle: "+28") {
      SkeletonText(lines: 3).padding(16)
    }
  }
  .padding(16)
  .frame(maxWidth: .infinity)
}
```

## File browser

A blob view: the repository file `TreeView` beside the file, `Breadcrumbs` over the code, the
branch picker `SelectPanel` open with its filter field and branch list, the latest commit in a
`BorderBox` and the file itself as a `CodeView` with a `SegmentedControl` (Code / Blame) and the
highlighted lines in the attention colour.

```mockitdown title="File browser" url="https://forgehub.example/acme-labs/rocket/blob/main/src/engine/throttle.ts" height="760"
import Primer
import "primer/github"

HStack(alignment: .top, spacing: 0) {
  VStack(alignment: .stretch, spacing: 12) {
    HStack(spacing: 8) {
      IconButton("sidebar-expand", variant: .invisible)
      Text("Files").fontWeight(.semibold)
      Spacer()
      IconButton("plus", size: .small)
      IconButton("search", size: .small)
    }
    SelectPanel("main", systemImage: "git-branch", open: true) {
      Text("Switch branches/tags")
      TextInput("Find or create a branch…", leadingVisual: "search", size: .small)
      ActionMenuItem("main", checked: true)
      ActionMenuItem("ravi-k/throttle-presets", checked: false)
      ActionMenuItem("release/2.4", checked: false)
      ActionMenuItem("gh-pages", checked: false)
      ActionMenuDivider()
      ActionMenuItem("View all branches")
    }
    TreeView {
      TreeViewItem(".github", folder: true, hasChildren: true, expanded: false)
      TreeViewItem("docs", folder: true, hasChildren: true, expanded: false)
      TreeViewItem("src", folder: true, expanded: true) {
        TreeViewItem("engine", folder: true, expanded: true) {
          TreeViewItem("presets.ts", leadingVisual: "file")
          TreeViewItem("throttle.ts", leadingVisual: "file").selected()
          TreeViewItem("staging.ts", leadingVisual: "file")
        }
        TreeViewItem("telemetry", folder: true, hasChildren: true, expanded: false)
        TreeViewItem("index.ts", leadingVisual: "file")
      }
      TreeViewItem("README.md", leadingVisual: "file")
    }
  }
  .padding(16)
  .frame(width: 300)
  Divider()
  VStack(alignment: .stretch, spacing: 16) {
    HStack {
      Breadcrumbs(items: ["rocket", "src", "engine", "throttle.ts"])
      IconButton("copy", variant: .invisible, size: .small)
      Spacer()
      Button("Go to file", leadingVisual: "search", size: .small)
      IconButton("kebab-horizontal", size: .small)
    }
    BorderBox {
    } header: {
      HStack(spacing: 8) {
        Avatar("Ravi Kumar", image: "assets/images/avatar-3.svg")
        Text("**ravi-k** feat(engine): throttle curve presets").lineLimit(1)
        Spacer()
        Text("a1c9f3e · 2 hours ago", size: .small).foregroundStyle(.secondary)
        Button("History", leadingVisual: "history", variant: .invisible, size: .small)
      }
    }
    CodeView("""
import { curve } from "./curve";
import { presets } from "./presets";

/** Map a stick position to engine thrust. */
export function throttle(level: number, options = {}) {
  const clamped = Math.min(Math.max(level, 0), 1);
  const preset = presets[options.preset ?? "standard"];
  const capped = Math.min(clamped, preset.maxBurn);
  return curve(capped, preset.shape);
}

export const DEFAULT_PRESET = "standard";
""", language: "ts", highlight: [7, 8], tabs: ["Code", "Blame"], selectedTab: "Code")
  }
  .padding(16)
  .frame(maxWidth: .infinity)
}
```

## Repository settings

A `SplitPageLayout`: a `NavList` with groups, a leading visual on every item and the current page
marked, beside the General settings — `FormControl`s with captions, a `Select`, `Checkbox`es with
descriptions, `ToggleSwitch`es, a `RadioGroup`, an `InlineMessage` and the Danger Zone as a
`BorderBox` with danger `Button`s.

```mockitdown source="true" appearance="both" title="Settings" url="https://forgehub.example/acme-labs/rocket/settings" height="1120"
import Primer
import "primer/github"

SplitPageLayout {
  SplitPageLayoutPane {
    NavList {
      NavListItem("General", leadingVisual: "gear").selected()
      NavListGroup("Access") {
        NavListItem("Collaborators and teams", leadingVisual: "people")
        NavListItem("Moderation options", leadingVisual: "report")
      }
      NavListGroup("Code and automation") {
        NavListItem("Branches", leadingVisual: "git-branch")
        NavListItem("Rules", leadingVisual: "law", trailingVisual: "3")
        NavListItem("Actions", leadingVisual: "play") {
          NavListItem("General")
          NavListItem("Runners")
        }
        NavListItem("Webhooks", leadingVisual: "webhook")
        NavListItem("Pages", leadingVisual: "browser")
      }
      NavListGroup("Security") {
        NavListItem("Secrets and variables", leadingVisual: "key")
        NavListItem("Deploy keys", leadingVisual: "key")
      }
    }
  }
  SplitPageLayoutContent {
    Heading("General", variant: .medium).fontWeight(.regular)
    FormControl {
      FormControlLabel("Repository name")
      HStack(spacing: 8) {
        TextInput("", value: "rocket").frame(width: 260)
        Button("Rename")
      }
    }
    VStack(alignment: .leading, spacing: 0) {
      Checkbox("Template repository", checked: false)
      FormControlCaption("Template repositories let users generate new repositories with the same directory structure and files.")
        .padding(.leading, 24)
    }
    FormControl {
      FormControlLabel("Default branch")
      HStack(spacing: 8) {
        BranchName("main")
        IconButton("pencil", size: .small)
        IconButton("arrow-switch", size: .small)
      }
      FormControlCaption("The default branch is considered the base branch in your repository.")
    }
    SettingsSection(title: "Features") {
      ToggleSwitch("Wikis", checked: true, description: "Wikis host documentation for your repository.")
      ToggleSwitch("Issues", checked: true, description: "Issues integrate lightweight task tracking into your repository.")
      ToggleSwitch("Discussions", checked: false, description: "Discussions is the space for your community to have conversations.")
    }
    SettingsSection(title: "Pull Requests") {
      RadioGroup(label: "When merging pull requests", selection: "Allow squash merging") {
        Radio("Allow merge commits")
        Radio("Allow squash merging")
        Radio("Allow rebase merging")
      }
      Select(label: "Default commit message", selection: "Pull request title and description")
      InlineMessage("Squash merging is the only method enabled for 2 protected branches.", variant: .warning)
    }
    SettingsSection(title: "Danger Zone") {
      BorderBox {
        BoxRow {
          VStack(alignment: .leading, spacing: 0) {
            Text("Change repository visibility").fontWeight(.semibold)
            Text("This repository is currently public.")
          }
          Spacer()
          Button("Change visibility", variant: .danger, size: .small)
        }
        BoxRow {
          VStack(alignment: .leading, spacing: 0) {
            Text("Archive this repository").fontWeight(.semibold)
            Text("Mark this repository archived and read-only.")
          }
          Spacer()
          Button("Archive this repository", variant: .danger, size: .small)
        }
        BoxRow {
          VStack(alignment: .leading, spacing: 0) {
            Text("Delete this repository").fontWeight(.semibold)
            Text("Once you delete a repository, there is no going back.")
          }
          Spacer()
          Button("Delete this repository", variant: .danger, size: .small)
        }
      }
      .variant(.danger)
    }
  }
}
```

## Labels and a dialog

The labels page — `SubNav` with **Labels** selected, a search field, a `BorderBox` of label rows
with an open row `ActionMenu` — and an open `Dialog` creating a label: `TextInput`s, a colour
`TextInput` with a leading swatch, a `Tooltip` on the refresh button, and the footer buttons. A
`ConfirmationDialog` would use the same layout with `buttons:`.

```mockitdown title="Labels" url="https://forgehub.example/acme-labs/rocket/labels" height="720"
import Primer
import "primer/github"

VStack(alignment: .stretch, spacing: 16) {
  HStack(spacing: 8) {
    SubNav {
      SubNavLink("Labels", leadingVisual: "tag").selected()
      SubNavLink("Milestones", leadingVisual: "milestone")
    }
    TextInput("Search all labels", leadingVisual: "search").frame(width: 300)
    Spacer()
    Button("New label", variant: .primary)
  }
  BorderBox {
    ForEach([("bug", "red", "Something isn't working", 14), ("documentation", "blue", "Improvements or additions to documentation", 6), ("enhancement", "teal", "New feature or request", 22), ("good first issue", "purple", "Good for newcomers", 9), ("needs triage", "gray", "Waiting for a maintainer", 3), ("physics", "yellow", "Simulation models and maths", 5)]) { name, color, desc, open in
      BoxRow {
        HStack { IssueLabel(name, color: color) }.frame(width: 200, alignment: .leading)
        Text(desc).foregroundStyle(.secondary).frame(width: 340, alignment: .leading)
        HStack(spacing: 4) { Octicon("issue-opened"); Text("\(open) open issues") }.foregroundStyle(.secondary)
        Spacer()
        Button("Edit", variant: .invisible, size: .small)
        ActionMenu(systemImage: "kebab-horizontal", variant: .invisible, size: .small)
      }
    }
  } header: {
    HStack {
      Text("**31 labels**")
      Spacer()
      ActionMenu("Sort", variant: .invisible, size: .small)
    }
  }
  Dialog("New label", subtitle: "Labels are shared by issues and pull requests.") {
    VStack(alignment: .stretch, spacing: 16) {
      HStack {
        Text("Preview", size: .small).foregroundStyle(.secondary)
        IssueLabel("flight-test", color: .orange)
      }
      TextInput("Label name", label: "Label name", value: "flight-test").state(.focused)
      TextInput("Description (optional)", label: "Description", value: "Needs a real launch to verify")
      HStack(alignment: .bottom, spacing: 8) {
        TextInput("#bc4c00", label: "Color", value: "#bc4c00").frame(width: 160)
        Tooltip("Get a new color") {
          IconButton("sync")
        }
      }
    }
  } footer: {
    Button("Cancel")
    Button("Create label", variant: .primary)
  }
}
.padding(32)
```

## Insights

A `PageLayout` with a `NavList` pane and the Pulse page: `Stat` tiles, a bar chart of commits per
week and a line chart of traffic in the Primer data-visualisation colours, `Label`s, and a
`Blankslate` with a `Banner` for a feature that is not set up yet.

```mockitdown title="Insights" url="https://forgehub.example/acme-labs/rocket/pulse" height="780"
import Primer
import "primer/github"

HStack(alignment: .top, spacing: 24) {
  NavList {
    NavListItem("Pulse").selected()
    NavListItem("Contributors")
    NavListItem("Community")
    NavListItem("Traffic")
    NavListItem("Commits")
    NavListItem("Code frequency")
    NavListItem("Dependency graph")
    NavListItem("Network")
    NavListItem("Forks")
  }
  .frame(width: 220)
  VStack(alignment: .stretch, spacing: 16) {
    HStack {
      Heading("Pulse", variant: .medium).fontWeight(.regular)
      Spacer()
      ActionMenu("Period: 1 week", size: .small)
    }
    HStack(spacing: 16) {
      Stat("Merged PRs", "14", systemImage: "git-merge")
      Stat("Open PRs", "6", systemImage: "git-pull-request")
      Stat("Closed issues", "21", systemImage: "issue-closed")
      Stat("New issues", "9", systemImage: "issue-opened")
    }
    HStack(alignment: .top, spacing: 16) {
      BorderBox {
        BarChart(values: [12, 18, 9, 22, 30, 16, 25, 34], labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"], height: 180)
          .padding(16)
      } header: {
        Text("**Commits** to main, excluding merges")
      }
      BorderBox {
        LineChart(series: [[320, 410, 380, 520, 610, 580, 720], [90, 120, 100, 150, 170, 160, 210]], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], seriesNames: ["Views", "Unique visitors"], height: 180)
          .padding(16)
      } header: {
        Text("**Traffic** · last 7 days")
      }
    }
    Banner("Dependency graph is off", description: "Turn it on to see the packages this repository depends on and get security alerts.", variant: .info) {
    } actions: {
      Button("Enable", size: .small)
    }
    Blankslate("No dependency graph yet", systemImage: "package", description: "The dependency graph is built from the manifest files in the default branch.", border: true) {
      Button("Enable dependency graph", variant: .primary)
      Link("Learn more about the dependency graph")
    }
  }
  .frame(maxWidth: .infinity)
}
.padding(24)
```
