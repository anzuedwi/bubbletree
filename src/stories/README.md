# src/stories/

Storybook stories and the sample datasets that drive them.

| File                              | Purpose |
|-----------------------------------|---------|
| `BubbleTree.stories.ts`           | All bubble-type variants and dataset combinations |
| `BubbleTooltip.stories.ts`        | `<bubble-tree>` + `<bubble-tooltip>` integration |
| `BubbleLegend.stories.ts`         | Standalone `<bubble-legend>` showcase |
| `BubbleBreadcrumbs.stories.ts`    | `<bubble-tree>` + `<bubble-breadcrumbs>` integration |
| `data/`                           | Sample datasets shared by stories and tests |

## Running

```bash
npm run storybook         # dev server on :6006
npm run build-storybook   # static build into storybook-static/
```

## Story conventions

- One story per visual variant; argTypes expose every interesting
  configuration knob as a Storybook control.
- Stories that exercise behaviour use the `play` function with
  `@storybook/test` assertions, so they run as smoke tests in addition to
  rendering visually.
- Every dataset is imported from `./data/index.ts` — never inline raw data
  inside a story file.

## Adding a new dataset

1. Create `src/stories/data/<name>.ts` with one default export of type
   `BubbleNode`.
2. Re-export it from `src/stories/data/index.ts`.
3. Add a story to `BubbleTree.stories.ts` (or a new `*.stories.ts` if the
   dataset needs custom controls).
