---
title: Role catalogue
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: REF.2
---

# Role catalogue

Every element renders through one of these **90 render roles** (R-REND-002). The role fixes the
markup; packs map their element names onto roles (R-PACK-004) and restyle them with CSS. This
catalogue is normative for the set of roles, their part classes and the attributes and slots each
reads (R-REND-002.C5): adding a role, a part or an attribute is a specification change.

## Common to every role

Every role's root element carries:

| Markup | From |
|---|---|
| `class="mkd-<role> …"` | the role, plus classes from `.class(…)` |
| `data-el="<Element>"` | the element name as written |
| `data-mkd-node`, `data-mkd-derived` | edit mode only, directly after `data-el`: the ordinal of the view node the view came from and of the `ForEach`, `if` or struct call that produced it (R-EDIT-004) |
| `data-component="<Struct>"` | the struct whose body the view is the root of |
| `data-variant`, `data-size`, `data-color`, `data-shape`, `data-density`, `data-elevation`, `data-placement`, `data-orientation`, `data-emphasis`, `data-design`, `data-severity`, `data-kind`, `data-labelStyle`, `data-position`, `data-level`, `data-side`, `data-withHandle`, `data-direction`, `data-labelPlacement`, `data-rowsPerPage` | the attribute of that name, when a safe simple value (R-REND-003.C1) |
| `data-state` | `state`; `disabled` → `disabled`; `error` → `error` |
| `data-selected="true"` | `selected` |
| `data-mkd-id`, `data-ref` | `.id(…)`, `.ref(…)` |
| `data-font`, `data-fill`, `data-frame-align`, `data-labels-hidden`, `data-positioned`, `data-material`, `data-scale`, `data-resizable`, `data-content-mode` | modifiers `.font`, `.frame(maxWidth: .infinity)`, `.frame(alignment:)`, `.labelsHidden()`, `.position(x:y:)`, `.background(.material)`, `.imageScale`, `.resizable()`, `.aspectRatio(contentMode:)` / `.scaledToFit()` / `.scaledToFill()` |
| `style="…"` | rendered layout, typography and colour modifiers (R-REND-004) |
| `title="…"` | `.help(…)` |

**Leading visuals.** Roles that show an icon, image or avatar before their text read the common
attributes `systemImage`, `icon`, `systemName`, `leadingIcon`, `startIcon` (an icon, tinted by
`iconColor`), `image`, `thumbnail` (an image asset) and `avatar` (initials).

**Lenient names.** A role accepts the argument names of several frameworks for the same thing
(`title`/`label`/`text`, `systemImage`/`icon`/`startIcon`, `isOn`/`checked`/`selected`,
`value`/`selection`), so that a pack can expose framework-native argument names without code. When
several are given, the first in the role's order wins.

**Other roots.** A few roles draw their root with another class: `icon` as `span.mkd-symbol` (the class
`mkd-icon` is the glyph's `svg`), `table` as `div.mkd-table-wrap` holding `table.mkd-table`, `tab` outside a
`TabView` as a one-item `div.mkd-tabs` (R-PACK-015.C5), `tablerow` as an `hstack` and `toolbaritem` as a
`group`; `tablecolumn` draws nothing of its own (the table reads its columns). Presented roles (`dialog`,
`toast`, `fab`) sit inside the presentation layer (`div.mkd-layer`) that places them.

## Roles

"Attributes and slots" lists every name the role reads, either as a view attribute (labelled
argument, positional parameter, pack-mapped modifier) or as a named slot (labelled trailing closure
or view-valued argument). Children (the unlabelled trailing closure) are used by container roles.
"Parts" are the BEM child classes the role emits; some roles embed parts of others (for example a
search field in an app bar). The table is generated from the renderer.

| Role | Core elements (base pack) | Attributes and slots it reads | Parts (`mkd-<role>__…`) | Data attributes in its markup |
|---|---|---|---|---|
| `accordion` | `Accordion`, `DisclosureGroup` | `actions`, `description`, `expanded`, `header`, `icon`, `isExpanded`, `label`, `open`, `subtitle`, `systemImage`, `title`, `trailing` | `body`, `chevron`, `header`, `icon`, `subtitle`, `title`, `titles` | `expanded` |
| `alert` | `Banner` | `action`, `actions`, `closable`, `content`, `description`, `dismissible`, `icon`, `intent`, `isClosable`, `message`, `severity`, `showIcon`, `status`, `systemImage`, `text`, `title`, `type` | `actions`, `close`, `content`, `icon`, `message`, `title` | `severity` |
| `appbar` | `AppBar` | `actions`, `avatar`, `avatarImage`, `back`, `brand`, `center`, `content`, `end`, `hamburger`, `leading`, `logo`, `menu`, `menuButton`, `middle`, `navigation`, `navigationIcon`, `notifications`, `notificationsCount`, `primaryTitle`, `profile`, `search`, `searchPrompt`, `secondaryTitle`, `start`, `subtitle`, `title`, `trailing`, `user` | `action`, `actions`, `avatar`, `badge`, `center`, `control`, `icon`, `input`, `leading`, `logo`, `logo--icon`, `nav`, `search`, `subtitle`, `title`, `titles` | `el`, `filled`, `kind`, `placeholder` |
| `avatar` | `Avatar` | `badge`, `icon`, `image`, `initials`, `label`, `name`, `presence`, `src`, `status`, `systemImage`, `title`, `url` | `status` | `hue`, `status` |
| `badge` | `Badge` | `content`, `count`, `icon`, `label`, `max`, `systemImage`, `text`, `value` | `icon`, `label` | `dot` |
| `board` | `Board` | — | — | — |
| `boardcolumn` | `BoardColumn` | `addButton`, `color`, `count`, `label`, `title` | `add`, `cards`, `count`, `dot`, `header`, `more`, `title` | — |
| `breadcrumb` | `Breadcrumb` | `items`, `path` | `item`, `sep` | — |
| `button` | `Button`, `IconButton` | `badge`, `dropdown`, `endIcon`, `icon`, `iconOnly`, `label`, `labelStyle`, `leadingIcon`, `loading`, `menu`, `role`, `split`, `startIcon`, `systemImage`, `text`, `title`, `trailingIcon` | `badge`, `caret`, `icon`, `icon--end`, `label`, `spinner` | `deco`, `icon-only`, `placeholder`, `pressed`, `role` |
| `calendar` | `Calendar` | `date`, `events`, `firstWeekday`, `label`, `marked`, `month`, `range`, `selection`, `showToday`, `title`, `value`, `year` | `day`, `grid`, `header`, `label`, `nav`, `title`, `title-chevron`, `weekday` | `in-range`, `marked`, `outside`, `today` |
| `callout` | `Callout` | `color`, `index`, `label`, `message`, `number`, `text`, `title` | `badge`, `text` | — |
| `canvas` | `Canvas`, `Whiteboard` | `background`, `grid`, `height` | — | `grid` |
| `card` | `Card`, `GroupBox` | `action`, `actions`, `avatar`, `avatarImage`, `cover`, `description`, `extra`, `footer`, `header`, `headerAction`, `icon`, `image`, `media`, `mediaHeight`, `menu`, `status`, `subheader`, `subtitle`, `systemImage`, `title`, `value` | `actions`, `band`, `body`, `header`, `header-actions`, `icon`, `media`, `media--missing`, `status`, `subtitle`, `title`, `titles` | — |
| `chart` | `AreaChart`, `BarChart`, `BubbleChart`, `CandlestickChart`, `Chart`, `ComboChart`, `DonutChart`, `FunnelChart`, `GaugeChart`, `Heatmap`, `Histogram`, `LineChart`, `PieChart`, `RadarChart`, `ScatterChart`, `Sparkline`, `Treemap` | `categories`, `data`, `fromZero`, `height`, `kind`, `labels`, `series`, `title`, `type`, `values`, `variant` | `area`, `axis`, `bar`, `bars`, `candle`, `center`, `dot`, `grid`, `group`, `head`, `key`, `label`, `label--on`, `legend`, `line`, `pie`, `plot`, `plot--bars`, `slice`, `subtitle`, `svg`, `swatch`, `tick`, `title`, `track` | `donut`, `kind` |
| `checkbox` | `Checkbox` | `checked`, `isOn`, `label`, `on`, `selected`, `state`, `title`, `value` | `box`, `label` | `checked` |
| `chip` | `Chip`, `Tag` | `avatar`, `avatarImage`, `checkmark`, `closable`, `deletable`, `icon`, `label`, `onDelete`, `removable`, `selected`, `systemImage`, `text`, `title`, `variant` | `avatar`, `check`, `icon`, `label`, `remove` | — |
| `code` | `CodeBlock`, `CodeEditor`, `Terminal` | `code`, `content`, `filename`, `files`, `highlight`, `highlightLines`, `lang`, `language`, `lineNumbers`, `selectedTab`, `showLineNumbers`, `source`, `startLine`, `tabs`, `text`, `title`, `variant` | `bar`, `body`, `cmd`, `comment`, `fn`, `kw`, `line`, `num`, `out`, `prompt`, `str`, `tab`, `tabs`, `text`, `title`, `type` | `hl`, `lang` |
| `color` | `Color` | `color` | — | — |
| `datepicker` | `DatePicker` | `clearButton`, `clearable`, `counter`, `date`, `description`, `endIcon`, `error`, `errorMessage`, `footer`, `format`, `header`, `helper`, `helperText`, `hint`, `icon`, `kind`, `label`, `leadingIcon`, `maxLength`, `placeholder`, `prefix`, `required`, `selection`, `startIcon`, `style`, `suffix`, `supportingText`, `systemImage`, `text`, `title`, `trailingIcon`, `unit`, `value`, `variant` | `date`, `stepper`, `time` | `filled`, `labeled` |
| `dialog` | `Alert`, `Dialog`, `Sheet` | `actions`, `buttons`, `closable`, `closeButton`, `description`, `destructive`, `dismissible`, `footer`, `icon`, `inline`, `message`, `modal`, `open`, `presented`, `primary`, `subtitle`, `systemImage`, `title`, `variant` | `actions`, `arrow`, `body`, `close`, `header`, `icon`, `label`, `message`, `title` | `deco`, `el`, `kind`, `role`, `variant` |
| `divider` | `Divider` | `label`, `text` | `label` | — |
| `dropzone` | `Dropzone` | `description`, `hint`, `icon`, `label`, `systemImage`, `text`, `title` | `hint`, `icon`, `label` | — |
| `emptystate` | `EmptyState` | `actions`, `description`, `icon`, `label`, `message`, `subtitle`, `systemImage`, `title` | `actions`, `desc`, `icon`, `title` | — |
| `fab` | `FloatingActionButton` | `icon`, `inline`, `label`, `placement`, `position`, `systemImage`, `text`, `title` | `icon`, `label` | `deco`, `extended`, `kind`, `position` |
| `form` | `Form` | `actions`, `footer`, `title` | `actions`, `row`, `title` | `child` |
| `gantt` | `Gantt` | `columns`, `now`, `periods`, `rows`, `scale`, `tasks`, `today` | `bar`, `body`, `grid`, `head`, `lines`, `milestone`, `name`, `progress`, `row`, `scale`, `today`, `track` | — |
| `grid` | `Grid`, `LazyHGrid`, `LazyVGrid` | `cols`, `columns`, `count`, `gap`, `horizontalSpacing`, `spacing` | — | — |
| `gridrow` | `GridRow` | — | — | — |
| `group` | `Group` | `align`, `alignment`, `gap`, `spacing`, `wrap` | — | — |
| `hstack` | `HStack`, `LazyHStack` | `align`, `alignment`, `gap`, `spacing`, `wrap` | — | `align`, `wrap` |
| `icon` | `Icon` | `fontSize`, `icon`, `name`, `size`, `systemName` | — | `icon` |
| `image` | `AsyncImage`, `Image` | `accessibilityLabel`, `alt`, `decorative`, `icon`, `label`, `name`, `source`, `src`, `symbol`, `systemName`, `url` | `label` | — |
| `kanbancard` | `KanbanCard` | `assignee`, `assignees`, `attachments`, `comments`, `cover`, `description`, `due`, `image`, `labels`, `priority`, `subtitle`, `tags`, `title` | `avatar`, `avatars`, `cover`, `desc`, `footer`, `meta`, `metas`, `tag`, `tags`, `title` | `hue`, `priority` |
| `kbd` | `Kbd` | `key`, `keys`, `shortcut`, `text` | `key` | — |
| `label` | `Label` | `icon`, `image`, `labelStyle`, `systemImage`, `title` | `icon`, `title` | — |
| `labeled` | `LabeledContent` | `content`, `key`, `label`, `text`, `title`, `value` | `label`, `value` | — |
| `link` | `Link` | `icon`, `label`, `systemImage`, `text`, `title` | `icon` | — |
| `list` | `List` | `header`, `title` | `header` | `sections` |
| `listitem` | `ListItem`, `NavigationLink`, `Row` | `accessory`, `actions`, `avatar`, `badge`, `checkbox`, `checked`, `chevron`, `count`, `description`, `detail`, `disclosure`, `highlight`, `icon`, `iconColor`, `image`, `info`, `label`, `leading`, `leadingIcon`, `meta`, `navigation`, `overline`, `primary`, `secondary`, `secondaryText`, `startIcon`, `status`, `subtitle`, `systemImage`, `systemName`, `text`, `thumbnail`, `title`, `trailing`, `trailingText`, `value` | `badge`, `box`, `chevron`, `detail`, `leading`, `overline`, `subtitle`, `text`, `title`, `trailing` | `checked`, `child`, `el`, `lines` |
| `map` | `Map` | `height`, `markers`, `pins`, `route`, `showsUserLocation`, `userLocation`, `userX`, `userY` | `art`, `label`, `land`, `me`, `minor`, `park`, `pin`, `roads`, `route`, `water` | — |
| `marquee` | `SelectionRect` | — | — | — |
| `media` | `VideoPlayer` | `currentTime`, `duration`, `image`, `playing`, `poster`, `progress`, `thumbnail`, `time`, `url`, `value` | `btn`, `controls`, `fill`, `play`, `poster`, `poster--empty`, `scrub`, `time` | — |
| `menu` | `Menu` | `caret`, `expanded`, `icon`, `isOpen`, `label`, `open`, `systemImage`, `title`, `trigger`, `variant` | `caret`, `icon`, `label`, `popup`, `trigger` | `el`, `icon-only`, `open`, `standalone`, `variant` |
| `menuitem` | `MenuItem` | `accelerator`, `checked`, `destructive`, `icon`, `isOn`, `keyboardShortcut`, `label`, `role`, `shortcut`, `systemImage`, `text`, `title` | `check`, `chevron`, `icon`, `label`, `shortcut` | — |
| `message` | `Comment`, `MessageBubble` | `author`, `avatar`, `avatarImage`, `content`, `direction`, `from`, `image`, `kind`, `message`, `name`, `reactions`, `sender`, `status`, `text`, `time`, `timestamp`, `variant` | `author`, `avatar`, `bubble`, `image`, `reaction`, `reactions`, `stack`, `time` | `from` |
| `navitem` | `NavItem` | `badge`, `count`, `expanded`, `icon`, `label`, `selected`, `systemImage`, `text`, `title` | `badge`, `chevron`, `children`, `icon`, `label`, `row` | `expanded` |
| `navstack` | `NavigationStack`, `NavigationView` | `back`, `backTitle`, `hideNavigationBar`, `subtitle`, `title`, `titleDisplayMode` | `back`, `back-label`, `bar`, `content`, `control`, `icon`, `icon--end`, `input`, `large`, `leading`, `search`, `subtitle`, `title`, `title-text`, `trailing` | `el`, `filled`, `kind`, `mic`, `title-mode` |
| `pagination` | `Pagination` | `count`, `current`, `label`, `page`, `pages`, `selection`, `summary`, `total` | `gap`, `item`, `summary` | `nav` |
| `placeholder` | `Placeholder` | `height`, `icon`, `label`, `systemImage`, `text`, `title` | `icon`, `label` | — |
| `pointer` | `Pointer` | `cursor`, `kind`, `style` | `svg` | `kind` |
| `progress` | `Gauge`, `ProgressView` | `currentValueLabel`, `kind`, `label`, `max`, `percent`, `progress`, `showValue`, `style`, `title`, `total`, `value`, `valueLabel`, `variant` | `bar`, `label`, `marker`, `max`, `min`, `ring`, `track`, `value` | `indeterminate`, `open` |
| `radio` | `RadioButton` | `checked`, `isOn`, `label`, `selected`, `title`, `value` | `dot`, `label` | `checked` |
| `radiogroup` | `RadioGroup` | `active`, `choices`, `content`, `current`, `items`, `label`, `options`, `segments`, `selected`, `selection`, `text`, `title`, `value` | `dot`, `items`, `label` | `checked`, `el` |
| `rating` | `Rating` | `count`, `label`, `max`, `maxValue`, `rating`, `value` | `label`, `star` | `fill` |
| `schedule` | `Schedule` | `columns`, `days`, `endHour`, `events`, `now`, `startHour`, `today` | `day`, `dayhead`, `days`, `event`, `event-time`, `event-title`, `hourlist`, `hours`, `now`, `slots` | — |
| `scroll` | `ScrollView` | `axes`, `axis` | — | `axis` |
| `section` | `Section` | `actions`, `description`, `footer`, `header`, `label`, `title`, `trailing` | `actions`, `body`, `footer`, `header`, `title` | `context` |
| `segmented` | `SegmentedControl` | `active`, `choices`, `content`, `current`, `items`, `label`, `options`, `segments`, `selected`, `selection`, `text`, `title`, `value` | `item`, `items`, `label` | — |
| `select` | `Picker` | `active`, `choices`, `clearButton`, `clearable`, `content`, `counter`, `current`, `description`, `endIcon`, `error`, `errorMessage`, `expanded`, `footer`, `header`, `helper`, `helperText`, `hint`, `icon`, `items`, `label`, `leadingIcon`, `maxLength`, `open`, `options`, `placeholder`, `prefix`, `prompt`, `required`, `segments`, `selected`, `selection`, `startIcon`, `suffix`, `supportingText`, `systemImage`, `text`, `title`, `trailingIcon`, `unit`, `value`, `variant` | `label`, `option`, `popup` | `el`, `filled`, `labeled`, `size` |
| `shape` | `Capsule`, `Circle`, `Ellipse`, `Rectangle`, `RoundedRectangle` | `cornerRadius`, `shape` | — | `shape` |
| `sidebar` | `Sidebar` | `footer`, `header`, `label`, `selected`, `selection`, `title`, `width` | `footer`, `header`, `items`, `title` | — |
| `skeleton` | `Skeleton` | `avatar`, `image`, `lines`, `media`, `rows`, `shape` | `avatar`, `block`, `image`, `line`, `lines`, `row` | — |
| `slider` | `Slider` | `bounds`, `in`, `label`, `max`, `maxLabel`, `maximumValue`, `maximumValueLabel`, `min`, `minLabel`, `minimumValue`, `minimumValueLabel`, `range`, `showValue`, `step`, `steps`, `ticks`, `title`, `value` | `control`, `fill`, `label`, `max`, `min`, `thumb`, `ticks`, `track`, `value` | — |
| `spacer` | `Spacer` | `minLength` | — | — |
| `split` | `NavigationSplitView` | `columnWidths`, `widths` | `col`, `header`, `title`, `toggle`, `toolbar` | `col`, `columns` |
| `spreadsheet` | `Spreadsheet` | `active`, `activeCell`, `cells`, `columnCount`, `columnWidths`, `columns`, `data`, `fills`, `firstRow`, `formula`, `formulaBar`, `headerRow`, `headers`, `highlight`, `minRows`, `range`, `rowCount`, `rows`, `selectedSheet`, `selection`, `sheet`, `sheets`, `showFormulaBar`, `startRow`, `widths` | `add`, `cell`, `colhead`, `corner`, `expr`, `formula`, `fx`, `grid`, `ref`, `rowhead`, `rowhead-col`, `sheet`, `sheets`, `table` | `active`, `edge`, `header`, `in-sel`, `num`, `sel` |
| `stat` | `Stat` | `caption`, `change`, `delta`, `icon`, `label`, `positive`, `sparkline`, `systemImage`, `title`, `trend`, `trendValue`, `value` | `caption`, `change`, `foot`, `head`, `icon`, `label`, `spark`, `value` | `positive` |
| `stepper` | `Stepper` | `clearButton`, `clearable`, `counter`, `description`, `endIcon`, `error`, `errorMessage`, `footer`, `header`, `helper`, `helperText`, `hint`, `icon`, `label`, `leadingIcon`, `maxLength`, `prefix`, `required`, `startIcon`, `suffix`, `supportingText`, `systemImage`, `title`, `trailingIcon`, `unit`, `value` | `button`, `buttons`, `divider`, `label`, `value` | `step` |
| `steps` | `Steps` | `active`, `activeStep`, `content`, `current`, `description`, `errors`, `items`, `label`, `orientation`, `selection`, `steps`, `subtitle`, `title` | `connector`, `description`, `marker`, `step`, `text`, `title` | `done`, `orientation`, `status` |
| `stickynote` | `StickyNote` | `angle`, `author`, `color`, `content`, `date`, `fill`, `footer`, `rotation`, `text`, `title` | `footer`, `text`, `title` | — |
| `swatches` | `ColorSwatches` | `colors`, `label`, `palette`, `selected`, `selection`, `title` | `items`, `label`, `swatch` | — |
| `tab` | `Tab` | — | — | — |
| `table` | `Table` | `alignment`, `checkboxSelection`, `columns`, `content`, `data`, `footer`, `header`, `headers`, `items`, `label`, `multiSelect`, `pagination`, `rows`, `selectable`, `selected`, `selectedRows`, `selection`, `sortColumn`, `status`, `title`, `toolbar` | `box`, `cell`, `footer`, `head`, `pagination`, `row`, `select`, `sort`, `title`, `toolbar` | `align`, `checked` |
| `tablecolumn` | `TableColumn` | — | — | — |
| `tablerow` | `TableRow` | — | — | — |
| `tabs` | `TabView`, `Tabs` | `actions`, `active`, `badge`, `choices`, `content`, `current`, `disabled`, `icon`, `image`, `items`, `label`, `name`, `options`, `placement`, `segments`, `selected`, `selection`, `systemImage`, `systemName`, `tabs`, `text`, `title`, `trailing`, `value` | `actions`, `badge`, `bar`, `icon`, `label`, `panel`, `tab` | `placement`, `standalone`, `state` |
| `text` | `Text` | `content`, `font`, `style`, `text`, `textStyle`, `typography`, `verbatim` | — | `deco` |
| `textfield` | `SearchField`, `SecureField`, `TextEditor`, `TextField` | `axis`, `clearButton`, `clearable`, `counter`, `description`, `endIcon`, `error`, `errorMessage`, `footer`, `header`, `helper`, `helperText`, `hint`, `icon`, `kind`, `label`, `leadingIcon`, `lineLimit`, `maxLength`, `placeholder`, `prefix`, `prompt`, `required`, `reveal`, `rows`, `startIcon`, `suffix`, `supportingText`, `systemImage`, `text`, `title`, `trailingIcon`, `type`, `unit`, `value` | — | `deco`, `filled`, `labeled` |
| `timeline` | `Timeline` | `orientation` | — | — |
| `timelineitem` | `TimelineItem` | `color`, `date`, `description`, `icon`, `label`, `severity`, `status`, `subtitle`, `systemImage`, `text`, `time`, `timestamp`, `title` | `content`, `desc`, `dot`, `line`, `rail`, `time`, `title` | `icon`, `status` |
| `toast` | `Toast` | `action`, `actionLabel`, `actions`, `closable`, `icon`, `inline`, `message`, `placement`, `position`, `systemImage`, `text`, `title` | `action`, `close`, `description`, `icon`, `message`, `text` | `deco`, `kind`, `position` |
| `toggle` | `Toggle` | `checked`, `description`, `isOn`, `label`, `on`, `onText`, `selected`, `subtitle`, `title`, `value`, `variant` | `description`, `label`, `state`, `text`, `thumb`, `track` | `on`, `pressed` |
| `toolbar` | `ControlGroup`, `Toolbar` | `title` | `menu`, `menu-chevron`, `menu-icon`, `menu-label`, `title` | — |
| `toolbaritem` | `ToolbarItem`, `ToolbarItemGroup` | — | — | — |
| `tooltip` | `Tooltip` | `actions`, `content`, `isOpen`, `label`, `message`, `open`, `placement`, `subtitle`, `text`, `title` | `anchor`, `arrow`, `bubble`, `message`, `title` | `placement` |
| `tree` | `Tree` | — | — | — |
| `treeitem` | `TreeItem` | `badge`, `detail`, `expanded`, `folder`, `hasChildren`, `icon`, `isExpanded`, `label`, `systemImage`, `text`, `title` | `chevron`, `children`, `detail`, `icon`, `label`, `row` | `expanded` |
| `unknown` | — | — | `name` | `el` |
| `vstack` | `LazyVStack`, `VStack` | `align`, `alignment`, `gap`, `spacing`, `wrap` | — | `align` |
| `zstack` | `ZStack` | `align`, `alignment`, `gap`, `spacing`, `wrap` | — | `align` |

## Presentation and chrome markup

Not roles, but part of the contract:

| Markup | Emitted for |
|---|---|
| `div.mkd-layer[data-kind]` (`alert`, `action-sheet`, `sheet`, `cover`, `popover`, `inspector`) | presentation modifiers (R-REND-009) |
| `div.mkd-scrim`, `div.mkd-presented[data-kind]`, `div.mkd-presented__grabber` | sheets and other presentations |
| `div.mkd-overlay-host` with `__base`, `__layer[data-align]`, `__under` | `.overlay { … }` and `.background { … }` content |
| `div.mkd-navbar` (`__bar`, `__leading`, `__title`, `__title-text`, `__trailing`, `__large`, `__subtitle`, `__back`, `__search`), `div.mkd-bottombar` | navigation bars built by `navstack` |
| `div.mkd-chrome.mkd-chrome--<status, titlebar, browser, home>[data-chrome]` | device chrome (R-DEV-005) |
| `div.mkd-unknown`, `span.mkd-unknown__name` | unknown elements (R-REND-008) |
| `svg.mkd-icon` | icons (R-ASSET-005) |

## Roles added in 0.3

spreadsheet, stickynote, board, boardcolumn, kanbancard, code, message, tree, treeitem, timeline,
timelineitem, gantt, schedule, kbd, skeleton, swatches, canvas, media, emptystate, stat, map
(R-REND-011); callout, pointer, marquee (R-ANN-001, R-ANN-002). The chart role gained fifteen kinds
(R-REND-012). They are listed in the table above with the others.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.3.0 | 2026-11-24 | Roles for non-standard components and annotations |
| 0.12.10 | 2026-11-27 | As built (#59): the 24 roles added in 0.3 get their rows; the parts and data attributes the renderer emits completed (chart, datepicker, dialog, form, progress, split, table, toast, toolbar, tooltip and others); `data-appearance` is not copied, `side`, `withHandle`, `direction`, `labelPlacement`, `rowsPerPage` are, and the modifier-driven data attributes are listed |
| 0.13.2 | 2026-11-28 | As built (#23): the edit-mode attributes `data-mkd-node` and `data-mkd-derived` (R-EDIT-004) in the common table; the card's `band` part (its `header` slot) and `data-deco` on a marked `text` root, both first exercised by the edit-mode corpus |
| 0.13.25 | 2026-11-28 | As built (#46): `data-deco` on a marked `dialog`, `fab` and `toast` root — an overlay keeps its marks (R-ANN-001.C6), first exercised by the conformance case annotate-overlay-callouts |
