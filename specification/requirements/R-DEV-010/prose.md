SwiftUI runs on iPhone, iPad and Mac, and one source often serves all three (SRC-9). Each form gets
its platform's chrome, and the shared containers adapt as SwiftUI adapts them.

On a Mac the window's title bar becomes the root view's toolbar row, as in macOS 26: a navigation stack's bar, a
split view's columns or a sidebar-adaptable tab view run up to the top edge with the traffic lights floating over
their leading end; a plain view's `.navigationTitle` and `.toolbar` are drawn in the title bar itself. A view without
either keeps the classic centred window title. The sidebar's own title is the window's: macOS shows it in the
toolbar, not in the sidebar.

`windowed` shows how an iPad app looks in iPadOS 26's windowing: the app's window, with its traffic lights, over
the wallpaper. It means nothing for other chrome, so the renderer warns rather than guessing.


**Re-checked at specification 0.12.10.** Re-read against R-DEV-001 (changed at 0.12.9: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
