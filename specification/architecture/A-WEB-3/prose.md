Development and test only; none of it is part of the published package.

The gallery pages load `chrome.css` before their own stylesheet (`index.css`, `packs.css`), which keeps only
what differs: the body's font size, the pack gallery's `--stage` and `--side`, and each page's layout.
