# src/types/

TypeScript interfaces — one file per concept.  None of these files contain
runtime code; they exist only for type-checking and IDE tooling.

| File               | Describes |
|--------------------|-----------|
| `point.ts`         | `{ x, y }` coordinate pair |
| `bubbleNode.ts`    | Raw data node + runtime metadata attached by traversal |
| `breakdown.ts`     | Single donut arc segment within a node |
| `bubbleConfig.ts`  | Public config object + resolved internal form |
| `bubbleStyle.ts`   | Declarative colour / icon style map |
| `tooltipEvent.ts`  | Payload delivered to the caller's tooltip callback |
| `displayObject.ts` | Common interface for bubbles and rings (Transitioner target) |

## Convention

Each interface is exported as a named `interface` (not `type`) so that
declaration merging remains possible for library consumers who want to extend
the shape of `BubbleNode` or `BubbleConfig`.
