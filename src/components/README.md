# src/components/

Reusable web components built with [Lit](https://lit.dev).  Importing the
barrel (`src/components/index.ts`) registers every custom element with the
`CustomElementRegistry`, so the tags can be used in HTML, Storybook stories,
and any framework that interops with web components (React, Vue, Svelte, …).

| Element                  | Purpose |
|--------------------------|---------|
| `<bubble-tree>`          | Declarative wrapper around the core `BubbleTree` library |
| `<bubble-tooltip>`       | Floating tooltip card driven by `bubble-tooltip` events |
| `<bubble-legend>`        | Colour-key legend that adapts to its container width |
| `<bubble-breadcrumbs>`   | Click-trail navigation driven by `node-click` events |

## Events

| Event                    | Source                  | Detail |
|--------------------------|-------------------------|--------|
| `bubble-tooltip`         | `<bubble-tree>`         | `TooltipEvent` |
| `node-click`             | `<bubble-tree>`         | `BubbleNode` |
| `breadcrumb-navigate`    | `<bubble-breadcrumbs>`  | `BubbleNode` |

Events bubble, so siblings can listen on the document or on a wrapping
container.

## Why Lit?

- BubbleTree is intentionally framework-agnostic; wrapping with Lit keeps
  that property while still giving us reactive properties, scoped CSS, and
  small bundle size (~5 kB gzipped).
- Storybook's `@storybook/web-components-vite` renderer integrates cleanly.
- Each component is testable with Vitest + happy-dom without a framework
  runtime.

## Testing

See `src/__tests__/components/` for unit tests covering rendering, event
dispatch, and reactive updates.
