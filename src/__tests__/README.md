# src/__tests__/

Tests live next to the code where reasonable (`*.test.ts` files alongside
the source).  This directory holds tests that need a richer setup or cross
multiple modules.

| Path                        | What it covers |
|-----------------------------|----------------|
| `setup.ts`                  | Global setup file loaded before every Vitest run |
| `components/`               | Custom-element integration tests |

## Running

```bash
npm test               # one-shot
npm run test:watch     # watch mode
npm run test:coverage  # v8 coverage → coverage/index.html
```

## Environment

- **happy-dom** is preferred over jsdom for speed.  All component tests
  work inside happy-dom; Lit's reactive updates run normally.
- The global `setup.ts` imports `src/components/index.ts`, which registers
  every custom element with the `CustomElementRegistry`.  Without this,
  `document.createElement('bubble-tree')` would produce a `HTMLUnknownElement`.

## Convention

Component tests follow a pattern:
1. Create the element via `document.createElement`.
2. Set reactive properties directly (not via attributes).
3. Append to `document.body` and await `element.updateComplete`.
4. Drive interactions by dispatching real DOM events.
5. Assert against the shadow DOM.
