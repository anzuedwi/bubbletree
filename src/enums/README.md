# src/enums/

TypeScript enums — one file per concept.  String enums are preferred over
numeric enums so that serialised values are human-readable in URLs and JSON.

| File                  | Values |
|-----------------------|--------|
| `bubbleType.ts`       | `Plain`, `Donut`, `Icon` |
| `displayKind.ts`      | `Bubble`, `Ring` |
| `sortBy.ts`           | `Amount`, `Label` |
| `tooltipEventType.ts` | `Show`, `Hide` |

## Usage

```ts
import { BubbleType } from 'bubbletree';

new BubbleTree({
  data,
  container: '#chart',
  bubbleType: [BubbleType.Plain, BubbleType.Donut],
});
```

The `bubbleType` array is indexed by node level: index 0 → root, index 1 →
first level, and so on.  The last entry is repeated for deeper levels.
