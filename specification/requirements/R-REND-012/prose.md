Dashboards are among the most common mockup subjects. The chart engine draws the common chart types directly, so a mockup needs neither a chart library nor JavaScript, and charts follow the pack's palette in light and dark.

**Charts never empty (SRC-9).** Scatter, bubble, heatmap and candlestick charts drew nothing when given the one-dimensional `values:` that every other kind accepts; they now derive their marks from it.
