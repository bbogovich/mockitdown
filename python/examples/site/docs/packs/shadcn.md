# shadcn/ui

The `shadcn` pack imitates **shadcn/ui** in its default **new-york** style with the **neutral** base
colour — the React components built on Radix primitives and styled with **Tailwind CSS v4**. It
uses the library's CSS variables as tokens (`--background` `#ffffff` / `#0a0a0a`, `--primary`
`#171717` / `#e5e5e5`, `--muted` `#f5f5f5` / `#262626`, `--border` `#e5e5e5` / white 10 %,
`--radius` 0.625rem, `--chart-1…5`), the Geist / system sans stack at 14 px, `h-9` controls with
`shadow-xs`, `rounded-xl` cards with `shadow-sm`, and a ring focus style. Dark mode is the `.dark`
class palette. Select it with `import Shadcn` (or `import ShadcnUI`, `import Radix`).

Elements use the component names of the library: `Button` (`variant: .default | .secondary |
.destructive | .outline | .ghost | .link`, `size: .sm | .lg | .icon`), `Badge`, `Card` (with
`description:`, an `action:` slot and a `footer:` slot, or `CardHeader` / `CardTitle` /
`CardDescription` / `CardContent` / `CardFooter`), `Input`, `Label`, `Textarea`, `Select` /
`SelectItem`, `Combobox`, `Command` / `CommandInput` / `CommandGroup` / `CommandItem`,
`CommandDialog`, `Checkbox`, `RadioGroup` / `RadioGroupItem`, `Switch`, `Slider`, `Toggle`,
`ToggleGroup`, `InputOTP`, `DatePicker`, `Calendar`, `Avatar`, `Alert`, `AlertDialog`, `Dialog`,
`Sheet`, `Drawer`, `DropdownMenu` (+ `Label`, `Item`, `CheckboxItem`, `Separator`, shortcuts),
`ContextMenu`, `Menubar`, `NavigationMenu`, `Popover`, `HoverCard`, `Tooltip`, `Tabs` /
`TabsContent`, `Accordion` / `AccordionItem`, `Collapsible`, `Table`, `DataTable`, `Pagination`,
`Breadcrumb`, `Progress`, `Skeleton`, `Separator`, `ScrollArea`, the `Sidebar` family
(`SidebarProvider`, `SidebarGroup`, `SidebarMenuButton`, `SidebarInset`, `SidebarTrigger`),
`Sonner`, `Chart`, `Carousel`, `Kbd`, `AspectRatio`, `ResizablePanelGroup` / `ResizablePanel` /
`ResizableHandle` and the `Typography*` styles. Lucide icon names (`settings`, `circle-user`,
`chevrons-up-down`, `log-out`, `credit-card`, `trending-up` …) map onto the built-in icon set.

The custom components below (`TeamSwitcher`, `NavUser`, `SiteHeader`, `SectionCard`, `SwitchRow`,
`MailItem`, `PlanCard`) live in `mockups/shadcn/blocks.mockitdown` and are imported with
`import "shadcn/blocks"`.

## Login

The `login-03` block: a card with an action link, two fields, a primary button, a labelled
separator and an outline "Login with Google" button.

```mockitdown source="true" appearance="both" device="fit" title="Login"
import Shadcn

Card("Login to your account", description: "Enter your email below to login to your account") {
  VStack(alignment: .stretch, spacing: 24) {
    Input("m@example.com", label: "Email", text: "m@example.com")
    VStack(alignment: .stretch, spacing: 8) {
      HStack {
        Label("Password")
        Spacer()
        Link("Forgot your password?")
      }
      Input("Password", type: .password, text: "hunter2hunter2").state(.focused)
    }
  }
} action: {
  Button("Sign Up", variant: .link)
} footer: {
  VStack(alignment: .stretch, spacing: 16) {
    Button("Login").frame(maxWidth: .infinity)
    Separator(label: "Or continue with")
    Button("Login with Google", systemImage: "globe", variant: .outline).frame(maxWidth: .infinity)
  }
}
.frame(width: 384)
```

## Pricing

A marketing page: `NavigationMenu` with an open item, a hero with `Badge` and typography, a
`Tabs` billing switch, three `PlanCard`s and an `Accordion` FAQ.

```mockitdown title="Pricing" url="https://acme.dev/pricing" height="1060"
import Shadcn
import "shadcn/blocks"

VStack(alignment: .stretch, spacing: 0) {
  HStack(spacing: 24) {
    Label("Acme", systemImage: "gallery-vertical-end").fontWeight(.semibold)
    NavigationMenu {
      NavigationMenuItem("Getting started")
      NavigationMenuItem("Components", open: true) {
        Grid(columns: 2, spacing: 4) {
          ListItem("Alert Dialog", subtitle: "A modal dialog that interrupts the user with important content.")
          ListItem("Hover Card", subtitle: "For sighted users to preview content behind a link.")
          ListItem("Progress", subtitle: "Shows the completion progress of a task.")
          ListItem("Tabs", subtitle: "Layered sections of content, displayed one at a time.")
        }
      }
      NavigationMenuLink("Docs")
      NavigationMenuLink("Pricing").state(.hover)
    }
    Spacer()
    Button("Sign in", variant: .ghost)
    Button("Get started")
  }
  .padding(.horizontal, 32)
  .frame(height: 64)
  .zIndex(5)
  Separator()
  VStack(spacing: 40) {
    VStack(spacing: 16) {
      Badge("Pricing", variant: .secondary)
      TypographyH1("Simple, transparent pricing")
      TypographyLead("Start for free. Upgrade when your team grows — no hidden fees.")
      Tabs(items: ["Monthly", "Yearly · save 20%"], selection: "Monthly")
    }
    HStack(alignment: .top, spacing: 24) {
      PlanCard(plan: "Hobby", price: "$0", blurb: "For side projects and trying things out.",
               features: ["1 project", "Community support", "1 GB storage"])
      PlanCard(plan: "Pro", price: "$29", blurb: "For professionals shipping every week.",
               features: ["Unlimited projects", "Email support", "50 GB storage", "Custom domains"], popular: true)
      PlanCard(plan: "Team", price: "$99", blurb: "For growing teams that need control.",
               features: ["Everything in Pro", "SSO and audit log", "Priority support", "1 TB storage"])
    }
    .frame(width: 960)
    VStack(alignment: .stretch, spacing: 8) {
      TypographyH4("Frequently asked questions")
      Accordion {
        AccordionItem("Can I change plans later?", expanded: true) {
          Text("Yes. Upgrades apply immediately and downgrades take effect at the end of the billing period.")
        }
        AccordionItem("Is there a discount for non-profits?")
        AccordionItem("Do you offer refunds?")
      }
    }
    .frame(width: 640)
  }
  .padding(.vertical, 48)
}
```

## Settings form

Inputs with descriptions, a `Select`, a `DatePicker`, a `RadioGroup`, `Switch` rows in bordered
boxes and a `Checkbox`, inside `Tabs` and two cards.

```mockitdown source="true" title="Settings" url="https://acme.dev/settings" height="900"
import Shadcn
import "shadcn/blocks"

VStack(alignment: .stretch, spacing: 24) {
  VStack(alignment: .leading, spacing: 4) {
    TypographyH3("Settings")
    TypographyMuted("Manage your account settings and set e-mail preferences.")
  }
  Separator()
  Tabs(selection: "Account") {
    TabsContent("Account") {
      HStack(alignment: .top, spacing: 24) {
        Card("Profile", description: "This is how others will see you on the site.") {
          Input("shadcn", label: "Username", text: "shadcn",
                description: "This is your public display name. It can be your real name or a pseudonym.")
          Select("Select a verified email to display", label: "Email",
                 description: "You can manage verified email addresses in your email settings.") {
            SelectItem("m@example.com")
            SelectItem("m@google.com")
          }
          Textarea("Tell us a little bit about yourself", label: "Bio", text: "I own a computer.", rows: 3)
          DatePicker("Date of birth", selection: "1994-05-14", format: .long,
                     description: "Your date of birth is used to calculate your age.")
          Slider(value: 40, in: 0...100, label: "Profile visibility")
        } footer: {
          Button("Update profile")
        }
        Card("Notifications", description: "Choose what we email you about.") {
          RadioGroup("Notify me about…", selection: "Direct messages and mentions") {
            RadioGroupItem("All new messages")
            RadioGroupItem("Direct messages and mentions")
            RadioGroupItem("Nothing")
          }
          VStack(alignment: .stretch, spacing: 12) {
            Text("Email Notifications").font(.headline)
            SwitchRow("Communication emails", "Receive emails about your account activity.")
            SwitchRow("Marketing emails", "Receive emails about new products, features, and more.", on: true)
            SwitchRow("Security emails", "Receive emails about your account security.", on: true)
          }
          Checkbox("Use different settings for my mobile devices", checked: true)
        } footer: {
          Button("Save preferences")
          Button("Cancel", variant: .ghost)
        }
      }
    }
    TabsContent("Password")
    TabsContent("Notifications")
    TabsContent("Billing")
  }
}
.padding(40)
```

## Booking on a phone

A responsive flow at phone width: `Carousel`, `Calendar`, an outline `ToggleGroup`, a `Slider`,
and an open `Drawer` holding an `InputOTP`.

```mockitdown device="phone" appearance="both" title="Book a table"
import Shadcn

VStack(alignment: .stretch, spacing: 16) {
  HStack {
    Button(systemImage: "arrow-left", variant: .ghost, size: .icon)
    Text("Book a table").font(.headline)
    Spacer()
    Avatar("Olivia Martin", image: "assets/images/avatar-2.svg")
  }
  Carousel {
    CarouselItem(image: "assets/images/photo-2.svg") {
      Text("Terrace · seats 40").fontWeight(.medium)
    }
    CarouselItem(image: "assets/images/photo-3.svg") {
      Text("Garden room").fontWeight(.medium)
    }
  }
  .frame(height: 200)
  Calendar(selection: "2026-11-27", showToday: true).frame(maxWidth: .infinity)
  ToggleGroup(items: ["18:00", "18:30", "19:00", "19:30", "20:00"], selection: "19:00", variant: .outline)
  Slider(value: 4, in: 1...12, label: "Guests", showValue: true)
  Button("Continue").frame(maxWidth: .infinity)
}
.padding(16)

Drawer("Verify your phone", description: "Enter the 6-digit code we sent to +1 (555) 012-3456.") {
  InputOTP(items: ["4", "8", "1", "", "", ""], selection: 3)
} footer: {
  Button("Verify")
  Button("Cancel", variant: .outline)
}
```

## Command palette

`CommandDialog` open over a documentation page whose search button shows a `Kbd` shortcut.

```mockitdown title="Docs" url="https://acme.dev/docs/components/button"
import Shadcn

VStack(alignment: .stretch, spacing: 0) {
  HStack(spacing: 16) {
    Label("acme/ui", systemImage: "gallery-vertical-end").fontWeight(.semibold)
    NavigationMenu {
      NavigationMenuLink("Docs")
      NavigationMenuLink("Components")
      NavigationMenuLink("Blocks")
      NavigationMenuLink("Charts")
    }
    Spacer()
    Button(variant: .outline) {
      Text("Search documentation…").foregroundStyle(.secondary)
      Kbd("⌘K")
    }
    Button(systemImage: "sun", variant: .ghost, size: .icon)
  }
  .padding(.horizontal, 24)
  .frame(height: 56)
  Separator()
  HStack(alignment: .top, spacing: 48) {
    VStack(alignment: .stretch, spacing: 4) {
      SidebarGroupLabel("Getting Started")
      SidebarMenuButton("Introduction")
      SidebarMenuButton("Installation")
      SidebarMenuButton("Theming")
      SidebarGroupLabel("Components")
      SidebarMenuButton("Accordion")
      SidebarMenuButton("Badge")
      SidebarMenuButton("Button", selected: true)
      SidebarMenuButton("Calendar")
    }
    .frame(width: 200)
    VStack(alignment: .stretch, spacing: 16) {
      Breadcrumb(items: ["Docs", "Components", "Button"])
      TypographyH1("Button")
      TypographyLead("Displays a button or a component that looks like a button.")
      Tabs(selection: "Preview") {
        TabsContent("Preview") {
          HStack(spacing: 8) {
            Button("Button")
            Button("Secondary", variant: .secondary)
            Button("Outline", variant: .outline)
            Button("Ghost", variant: .ghost)
            Button("Destructive", variant: .destructive)
            Button("Link", variant: .link)
          }
          .frame(maxWidth: .infinity, height: 280)
          .border(.separator)
          .cornerRadius(10)
        }
        TabsContent("Code")
      }
    }
  }
  .padding(32)
}

CommandDialog {
  Command {
    CommandInput("Type a command or search...")
    CommandList {
      CommandGroup("Suggestions") {
        CommandItem("Calendar", systemImage: "calendar").selected()
        CommandItem("Search Emoji", systemImage: "smile")
        CommandItem("Calculator", systemImage: "calculator").disabled()
      }
      CommandSeparator()
      CommandGroup("Settings") {
        CommandItem("Profile", systemImage: "user", shortcut: "⌘P")
        CommandItem("Billing", systemImage: "credit-card", shortcut: "⌘B")
        CommandItem("Settings", systemImage: "settings", shortcut: "⌘S")
      }
    }
  }
}
```

## Data table

The TanStack-based `DataTable` pattern: a filter `Input` and a column-visibility `DropdownMenu`
in the toolbar, row selection, a sortable column and a "Previous / Next" footer.

```mockitdown source="true" appearance="both" title="Payments" url="https://acme.dev/payments" height="440"
import Shadcn

VStack(alignment: .stretch, spacing: 0) {
  DataTable(columns: ["Status", "Email", TableHead("Amount", alignment: .trailing), ""],
            rows: [
              ["Success", "ken99@example.com", "$316.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)],
              ["Success", "abe45@example.com", "$242.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)],
              ["Processing", "monserrat44@example.com", "$837.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)],
              ["Success", "silas22@example.com", "$874.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)],
              ["Failed", "carmella@example.com", "$721.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)]
            ],
            selectedRows: [1, 2], sortColumn: 1) {
  } toolbar: {
    Input("Filter emails...").frame(width: 384)
    Spacer()
    DropdownMenu("Columns", open: true) {
      DropdownMenuCheckboxItem("Status", checked: true)
      DropdownMenuCheckboxItem("Email", checked: true)
      DropdownMenuCheckboxItem("Amount", checked: false)
    }
  } footer: {
    Text("2 of 5 row(s) selected.")
    Button("Previous", variant: .outline, size: .sm).disabled()
    Button("Next", variant: .outline, size: .sm)
  }
}
.padding(32)
```

## Row actions, confirmation and toast

The states around a destructive action: the row's `DropdownMenu` open, the `AlertDialog` asking
for confirmation and a `Sonner` toast from the previous action, on a page with a `Breadcrumb`, a
destructive `Alert`, a `Table`, `Pagination` and a `Tooltip`.

```mockitdown title="Invoices" url="https://acme.dev/billing/invoices" height="760"
import Shadcn

VStack(alignment: .stretch, spacing: 24) {
  Breadcrumb(items: ["Home", "Billing", "Invoices"])
  HStack(alignment: .bottom) {
    VStack(alignment: .leading, spacing: 4) {
      TypographyH3("Invoices")
      TypographyMuted("A list of your recent invoices.")
    }
    Spacer()
    Tooltip("Download all as CSV") {
      Button("Export", systemImage: "download", variant: .outline)
    }
    Button("New invoice", systemImage: "plus")
  }
  Alert("Payment failed", description: "Your card ending in 4242 was declined. Update your billing details to avoid interruption.",
        systemImage: "circle-alert", variant: .destructive)
  Table(columns: ["Invoice", "Status", "Method", TableHead("Amount", alignment: .trailing), TableHead(" ", alignment: .trailing)], rows: [
    ["INV001", Badge("Paid", variant: .secondary), "Credit Card", "$250.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)],
    ["INV002", Badge("Pending", variant: .outline), "PayPal", "$150.00",
     HStack { Spacer(); DropdownMenu(systemImage: "ellipsis", variant: .ghost, open: true) {
       DropdownMenuLabel("Actions")
       DropdownMenuItem("Copy invoice ID", systemImage: "copy")
       DropdownMenuSeparator()
       DropdownMenuItem("View customer", systemImage: "user")
       DropdownMenuItem("View payment details", systemImage: "credit-card", shortcut: "⌘D")
       DropdownMenuSeparator()
       DropdownMenuItem("Delete", systemImage: "trash-2", shortcut: "⌘⌫", destructive: true)
     } }],
    ["INV003", Badge("Unpaid", variant: .destructive), "Bank Transfer", "$350.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)],
    ["INV004", Badge("Paid", variant: .secondary), "Credit Card", "$450.00", Button(systemImage: "ellipsis", variant: .ghost, size: .icon)]
  ])
  Pagination(count: 10, page: 2)
}
.padding(32)

AlertDialog("Are you absolutely sure?",
            description: "This action cannot be undone. This will permanently delete invoice INV002 and remove its data from our servers.") {
} actions: {
  AlertDialogCancel()
  AlertDialogAction("Delete", variant: .destructive)
}

Sonner(action: "Undo") {
} message: {
  VStack(alignment: .leading) {
    Text("Invoice ID copied")
    Text("INV002 is on your clipboard.")
  }
}
```

## Mail

The `mail` example: three `ResizablePanel`s with handles — navigation with counts, a filtered
message list of `MailItem`s, and the open message with a reply box.

```mockitdown title="Mail" url="https://acme.dev/mail" height="760"
import Shadcn
import "shadcn/blocks"

ResizablePanelGroup {
  ResizablePanel {
    Select("Alicia Koch", systemImage: "circle-user", selection: "alicia@example.com").padding(8)
    Separator()
    VStack(alignment: .stretch, spacing: 4) {
      SidebarMenuButton("Inbox", systemImage: "inbox", badge: 128, selected: true)
      SidebarMenuButton("Drafts", systemImage: "file", badge: 9)
      SidebarMenuButton("Sent", systemImage: "send")
      SidebarMenuButton("Junk", systemImage: "archive-x", badge: 23)
      SidebarMenuButton("Trash", systemImage: "trash-2")
      SidebarMenuButton("Archive", systemImage: "archive")
    }
    .padding(8)
    Separator()
    VStack(alignment: .stretch, spacing: 4) {
      SidebarMenuButton("Social", systemImage: "users", badge: 972)
      SidebarMenuButton("Updates", systemImage: "circle-alert", badge: 342)
      SidebarMenuButton("Forums", systemImage: "message-square", badge: 128)
      SidebarMenuButton("Shopping", systemImage: "shopping-cart", badge: 8)
    }
    .padding(8)
    Spacer()
  }
  .frame(width: 230)
  ResizableHandle()
  ResizablePanel {
    HStack {
      Text("Inbox").font(.title3)
      Spacer()
      Tabs(items: ["All mail", "Unread"], selection: "All mail")
    }
    .padding(.horizontal, 16)
    .frame(height: 52)
    Separator()
    Input("Search", systemImage: "search").padding(16)
    ScrollArea {
      MailItem(from: "William Smith", subject: "Meeting Tomorrow",
               preview: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share.",
               date: "about 1 year ago", labels: ["meeting", "work", "important"], unread: true, current: true)
      MailItem(from: "Alice Smith", subject: "Re: Project Update",
               preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive.",
               date: "about 1 year ago", labels: ["work", "important"])
      MailItem(from: "Bob Johnson", subject: "Weekend Plans",
               preview: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains.",
               date: "over 1 year ago", labels: ["personal"])
      MailItem(from: "Emily Davis", subject: "Re: Question about Budget",
               preview: "I have a question about the budget for the upcoming project.",
               date: "over 1 year ago", labels: ["work", "budget"], unread: true)
    }
    .padding(.horizontal, 16)
  }
  .frame(width: 440)
  ResizableHandle()
  ResizablePanel {
    HStack(spacing: 4) {
      Button(systemImage: "archive", variant: .ghost, size: .icon)
      Button(systemImage: "archive-x", variant: .ghost, size: .icon)
      Button(systemImage: "trash-2", variant: .ghost, size: .icon)
      Separator()
      Button(systemImage: "clock", variant: .ghost, size: .icon)
      Spacer()
      Button(systemImage: "reply", variant: .ghost, size: .icon)
      Button(systemImage: "forward", variant: .ghost, size: .icon)
      Separator()
      Button(systemImage: "ellipsis-vertical", variant: .ghost, size: .icon)
    }
    .padding(8)
    .frame(height: 52)
    Separator()
    HStack(alignment: .top, spacing: 16) {
      Avatar("William Smith")
      VStack(alignment: .leading, spacing: 2) {
        Text("William Smith").fontWeight(.semibold)
        Text("Meeting Tomorrow").font(.caption)
        Text("**Reply-To:** williamsmith@example.com").font(.caption)
      }
      Spacer()
      Text("Oct 22, 2023, 9:00:00 AM").font(.caption).foregroundStyle(.secondary)
    }
    .padding(16)
    Separator()
    Text("Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William")
      .padding(16)
    Spacer()
    Separator()
    VStack(alignment: .stretch, spacing: 16) {
      Textarea("Reply William Smith...", rows: 4)
      HStack {
        Switch("Mute this thread")
        Spacer()
        Button("Send", size: .sm)
      }
    }
    .padding(16)
  }
}
```

## Dashboard

The `dashboard-01` block: an inset `Sidebar` with a team header, grouped `SidebarMenuButton`s and a
user footer; a `SiteHeader`; four `SectionCard`s with trend `Badge`s; an area `Chart` card with a
`ToggleGroup`; and a `DataTable` under `Tabs`.

```mockitdown source="true" device="wide" height="1240" title="Dashboard" url="https://acme.dev/dashboard"
import Shadcn
import "shadcn/blocks"

SidebarProvider {
  Sidebar(variant: .inset) {
    SidebarGroup {
      HStack(spacing: 8) {
        Button("Quick Create", systemImage: "circle-plus").frame(maxWidth: .infinity)
        Button(systemImage: "mail", variant: .outline, size: .icon)
      }
      SidebarMenuButton("Dashboard", systemImage: "layout-dashboard", selected: true)
      SidebarMenuButton("Lifecycle", systemImage: "list-checks")
      SidebarMenuButton("Analytics", systemImage: "chart-bar")
      SidebarMenuButton("Projects", systemImage: "folder")
      SidebarMenuButton("Team", systemImage: "users")
    }
    SidebarGroup("Documents") {
      SidebarMenuButton("Data Library", systemImage: "database")
      SidebarMenuButton("Reports", systemImage: "file-text")
      SidebarMenuButton("Word Assistant", systemImage: "file")
    }
    Spacer()
    SidebarGroup {
      SidebarMenuButton("Settings", systemImage: "settings")
      SidebarMenuButton("Get Help", systemImage: "circle-help")
      SidebarMenuButton("Search", systemImage: "search")
    }
  } header: {
    TeamSwitcher(name: "Acme Inc.", plan: "Enterprise")
  } footer: {
    NavUser(name: "shadcn", email: "m@example.com", photo: "assets/images/avatar-1.svg")
  }
  SidebarInset {
    SiteHeader(title: "Documents") {
      Button("GitHub", variant: .ghost, size: .sm)
    }
    ScrollArea {
      VStack(alignment: .stretch, spacing: 24) {
        Grid(columns: 4, spacing: 16) {
          SectionCard(label: "Total Revenue", value: "$1,250.00", trend: "+12.5%",
                      note: "Trending up this month", detail: "Visitors for the last 6 months")
          SectionCard(label: "New Customers", value: "1,234", trend: "-20%", up: false,
                      note: "Down 20% this period", detail: "Acquisition needs attention")
          SectionCard(label: "Active Accounts", value: "45,678", trend: "+12.5%",
                      note: "Strong user retention", detail: "Engagement exceed targets")
          SectionCard(label: "Growth Rate", value: "4.5%", trend: "+4.5%",
                      note: "Steady performance increase", detail: "Meets growth projections")
        }
        Card("Total Visitors", description: "Total for the last 3 months") {
          Chart(kind: .area,
                series: [[186, 305, 237, 273, 209, 314, 280, 350, 302, 390, 360, 420],
                         [80, 200, 120, 190, 130, 140, 160, 210, 180, 230, 250, 270]],
                labels: ["Apr 1", "Apr 15", "May 1", "May 15", "Jun 1", "Jun 15", "Jun 30"], height: 250)
        } action: {
          ToggleGroup(items: ["Last 3 months", "Last 30 days", "Last 7 days"], selection: "Last 3 months", variant: .outline)
        }
        Tabs(selection: "Outline") {
          TabsContent("Outline") {
            DataTable(columns: ["Header", "Section Type", "Status", TableHead("Target", alignment: .trailing),
                                TableHead("Limit", alignment: .trailing), "Reviewer", TableHead(" ", alignment: .trailing)],
                      rows: [
                        ["Cover page", Badge("Cover page", variant: .outline), Badge("In Process", systemImage: "loader-circle", variant: .outline), 18, 5, "Eddie Lake", Button(systemImage: "ellipsis-vertical", variant: .ghost, size: .icon)],
                        ["Table of contents", Badge("Table of contents", variant: .outline), Badge("Done", systemImage: "circle-check", variant: .outline), 29, 24, "Eddie Lake", Button(systemImage: "ellipsis-vertical", variant: .ghost, size: .icon)],
                        ["Executive summary", Badge("Narrative", variant: .outline), Badge("Done", systemImage: "circle-check", variant: .outline), 10, 13, "Jamik Tashpulatov", Button(systemImage: "ellipsis-vertical", variant: .ghost, size: .icon)],
                        ["Technical approach", Badge("Narrative", variant: .outline), Badge("In Process", systemImage: "loader-circle", variant: .outline), 27, 23, Select("Assign reviewer"), Button(systemImage: "ellipsis-vertical", variant: .ghost, size: .icon)]
                      ],
                      selectedRows: [1]) {
            } footer: {
              Text("1 of 68 row(s) selected.")
              Pagination(count: 7, page: 1)
            }
          }
          TabsContent("Past Performance", badge: 3)
          TabsContent("Key Personnel", badge: 2)
          TabsContent("Focus Documents")
        } trailing: {
          Button("Customize Columns", systemImage: "columns", variant: .outline, size: .sm)
          Button("Add Section", systemImage: "plus", variant: .outline, size: .sm)
        }
      }
      .padding(24)
    }
  }
}
```
