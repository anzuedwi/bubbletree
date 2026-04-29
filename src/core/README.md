# src/core/

Core classes that make up the BubbleTree engine.

| File                  | Replaces (original)        | Responsibility |
|-----------------------|----------------------------|----------------|
| `bubbleTree.ts`       | `bubbletree.js`            | Main orchestrator: data init, layout, navigation |
| `vector.ts`           | `vector.js`                | Mutable 2-D point, animated by Transitioner |
| `layout.ts`           | `layout.js`                | Captures desired end-state for a transition |
| `transitioner.ts`     | `transitioner.js` + Tween.js | rAF-based animation, d3-ease exponential-out |
| `ring.ts`             | `ring.js`                  | Dashed SVG circle around a parent's children |
| `mouseEventGroup.ts`  | `mouseeventgroup.js`       | Unified click/hover across SVG + HTML members |
| `historyManager.ts`   | `jquery.history.js`        | Hash-based URL routing via native hashchange |
| `loader.ts`           | `loader.js`                | fetch()-based data loader |
| `utils.ts`            | `utils.js`                 | amount→radius formula and global base state |

## Key design decisions

**No global animation loop** — each `Transitioner` instance drives its own
`requestAnimationFrame` chain and cancels it on completion, so multiple
concurrent transitions are isolated.

**Angle arithmetic** — all angles are in radians, increasing counter-clockwise
(matching SVG coordinates).  `shortestAngleTo` always picks the arc direction
that requires less rotation, preventing 360° spin artefacts.

**bubbleScale** — a single scalar that is tweened by the `Layout` so every
bubble's rendered radius scales uniformly when zooming into a sub-tree.
