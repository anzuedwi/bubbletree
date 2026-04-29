# src/

Root of all TypeScript source files.  Entry point: **`index.ts`**.

| Directory   | Purpose |
|-------------|---------|
| `core/`     | BubbleTree orchestrator, rendering primitives, animation engine |
| `bubbles/`  | Concrete bubble renderers (plain, donut, icon) |
| `types/`    | TypeScript interfaces — one per concept |
| `enums/`    | TypeScript enums — one per concept |
| `util/`     | Pure helpers (DOM, colour, formatting) |
| `styles/`   | CSS source (`@layer`, nesting, CSS custom properties) |

## Build

```bash
npm run build    # Vite library build → dist/bubbletree.js + dist/bubbletree.css
npm run typecheck  # tsc --noEmit
```

## Naming conventions

- Files: **lowerCamelCase** (`bubbleTree.ts`, `plainBubble.ts`)
- Classes / interfaces: **PascalCase**
- Enums and their members: **PascalCase**
- Functions and variables: **lowerCamelCase**
- One export per file for types, interfaces, and enums
