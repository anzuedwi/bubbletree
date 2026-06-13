# src/bubbles/

Concrete bubble renderers.  Each class extends `BaseBubble` and implements
three lifecycle methods:

| Method   | When called |
|----------|-------------|
| `show()` | Before the enter transition; creates SVG + HTML elements |
| `draw()` | Every animation frame; repositions and resizes elements |
| `hide()` | After the exit transition; removes all elements from the DOM |

## Renderers

### `plainBubble.ts`
Solid filled circle with an optional dashed inner ring.  Labels switch
between three detail levels based on the computed radius (full / amount-only /
hidden).  This is the default when no `bubbleType` is specified.

### `donutBubble.ts`
Extends PlainBubble with SVG `<path>` arc segments overlaid on the circle,
forming a proportional donut chart from `node.breakdowns`.  Arc colours and
opacities can be configured via `BubbleStyles.name`.

### `iconBubble.ts`
Fetches an external SVG icon via `fetch()`, extracts its `<path>` data, and
renders it inside the bubble scaled to fit.  Icons are cached at module scope
so the same URL is never requested twice.

## `baseBubble.ts`
Abstract class with shared logic:
- Polar → Cartesian position computation
- CSS custom property label positioning (`--bt-label-x`, `--bt-label-y`, …)
  allowing CSS transitions to drive label movement without forced layout
- `MouseEventGroup` wiring for click / hover / unhover
- Tooltip event forwarding
