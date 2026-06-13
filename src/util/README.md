# src/util/

Stateless pure-function helpers.  No dependencies on BubbleTree internals.

| File         | Exports | Purpose |
|--------------|---------|---------|
| `color.ts`   | `hslColor`, `adjustLightness`, `adjustSaturation` | d3-color wrappers replacing vis4color |
| `dom.ts`     | `resolveContainer`, `createSvgElement`, `createDiv` | Native DOM helpers replacing jQuery |
| `format.ts`  | `formatNumber` | Human-readable number strings (1.2k, 3.4m …) |

## Native replacements

| Original (jQuery / vis4)               | Replacement |
|----------------------------------------|-------------|
| `$(selector).empty()`                  | `resolveContainer()` |
| `$(element).css({ ... })`              | CSS custom properties (`--bt-*`) set via `style.setProperty` |
| `document.createElementNS(SVG_NS, …)` | `createSvgElement<K>()` (typed) |
| `vis4color.fromHSL()`                  | `hslColor()` via d3-color |
| `vis4color.fromHex().lightness('*…')`  | `adjustLightness()` |
| `vis4color.fromHex().saturation('*…')` | `adjustSaturation()` |
