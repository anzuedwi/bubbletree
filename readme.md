# BubbleTree

> Interactive radial visualisation of hierarchical data.

[![CI](https://github.com/anzuedwi/bubbletree/actions/workflows/ci.yml/badge.svg)](https://github.com/anzuedwi/bubbletree/actions/workflows/ci.yml)

BubbleTree is a small TypeScript library that renders nested data as a tree
of concentric rings of bubbles.  Originally built for OpenSpending; the
3.x rewrite drops jQuery / RaphaelJS / Tween.js entirely in favour of
TypeScript, native SVG, the Web Animations API, and modern CSS
(`@layer`, nesting, custom properties).

```ts
import { BubbleTree } from 'bubbletree';
import 'bubbletree/style.css';

new BubbleTree({
  container: '#chart',
  data: {
    label: 'Total',
    amount: 100,
    children: [
      { label: 'A', amount: 30 },
      { label: 'B', amount: 70 },
    ],
  },
});
```

## Web components

For declarative use, import the component bundle and use the custom
elements directly:

```html
<bubble-breadcrumbs target="#tree"></bubble-breadcrumbs>
<bubble-tree id="tree" auto-colors></bubble-tree>
<bubble-tooltip target="#tree"></bubble-tooltip>
<bubble-legend></bubble-legend>
```

```ts
import 'bubbletree/components';
```

## Repository layout

```
src/
  core/        BubbleTree engine + animation + history
  bubbles/     Plain / Donut / Icon renderers
  components/  Web-component wrappers (Lit)
  types/       Interfaces — one per concept
  enums/       Enums — one per concept
  util/        Pure helpers (color, dom, format)
  styles/      CSS source (@layer + nesting)
  stories/     Storybook stories + sample datasets
  __tests__/   Cross-cutting tests
```

Each directory contains its own README explaining its conventions.

## Scripts

```bash
npm run build            # build dist/bubbletree.js + bubbletree.css + components.js
npm run dev              # Vite dev server
npm run typecheck        # tsc --noEmit
npm test                 # one-shot Vitest run
npm run test:watch       # watch mode
npm run test:coverage    # v8 coverage report
npm run storybook        # Storybook on :6006
npm run build-storybook  # static Storybook into storybook-static/
```

## Continuous integration

Every push and pull request runs `.github/workflows/ci.yml`, which fans out
into four independent jobs so a failure pinpoints the exact stage:

| Job          | Command                          | Artifact uploaded     |
|--------------|----------------------------------|-----------------------|
| `typecheck`  | `npx tsc --noEmit`               | —                     |
| `test`       | `npx vitest run --coverage`      | `coverage-report`     |
| `build`      | `npm run build`                  | `dist`                |
| `storybook`  | `npm run build-storybook`        | `storybook-static`    |

Runs are cancellable: a newer commit on the same ref cancels any
in-flight run via a `concurrency` group.

## What changed in 3.0

| Concern         | Before                     | Now                                          |
|-----------------|----------------------------|----------------------------------------------|
| Language        | ES5 + JSDoc                | TypeScript strict                            |
| DOM             | jQuery                     | Native + Lit (for components)                |
| SVG rendering   | RaphaelJS                  | Native SVG elements                          |
| Animation       | Tween.js                   | `requestAnimationFrame` + d3-ease            |
| Routing         | jquery.history             | Native `hashchange`                          |
| Build           | Gulp                       | Vite                                         |
| Style           | Flat CSS                   | `@layer` + nesting + `@property` + animation |
| Testing         | jscs (style only)          | Vitest + happy-dom + Storybook play tests    |
| File layout     | One file per group         | One file per class / type / interface / enum |

## Attribution

[Gregor Aisch](http://vis4.net/blog/) with contributions from Rufus Pollock
and Levko Kravets.  Originally funded by Publish What You Fund and the
Shuttleworth Foundation.

## License

MIT.  See file header.
