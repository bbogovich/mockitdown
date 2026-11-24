**Problem.** Mockups drawn in design tools drift from the requirements: they live in another file
format, are reviewed separately and are rarely updated when a requirement changes.

**Change.** A mockup becomes text inside the Markdown page — a fenced block tagged `mockitdown` —
and the documentation build renders it as a figure. Fence attributes tune one rendering (device,
light or dark, size, caption) without touching the code.

````markdown
```mockitdown device="phone" title="Inbox"
NavigationStack { List { Text("Hello") }.navigationTitle("Inbox") }
```
````
