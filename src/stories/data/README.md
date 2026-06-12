# src/stories/data/

Sample hierarchical datasets used by Storybook stories and unit tests.

| Dataset             | Shape                                  | Notable feature |
|---------------------|----------------------------------------|------------------|
| `governmentBudget`  | 5 top-level departments, 3 deep        | Coloured per branch — good for the plain renderer |
| `companyOrgChart`   | 6 top-level depts, 2–3 deep            | Uses `name` keys instead of `id` |
| `fileSystem`        | 4 top-level dirs, asymmetric depth     | Deep + narrow ; tests recursion |
| `donutBreakdown`    | 3 categories with breakdown segments   | Designed for the donut renderer |
| `randomTree`        | Procedural ; configurable seed / depth | Deterministic via Mulberry32 PRNG |

## Random data

`generateRandomTree({ seed, depth, fanout, maxLeafAmount })` produces a
deterministic tree.  Pass the same options to get pixel-identical results
across CI runs, which is what makes snapshot testing viable.

```ts
import { generateRandomTree } from './randomTree.js';
const data = generateRandomTree({ seed: 7, depth: 4, fanout: 4 });
```
