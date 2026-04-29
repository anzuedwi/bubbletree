# src/styles/

CSS source for the BubbleTree library.  Emitted as `dist/bubbletree.css`
by the Vite build.

## Architecture — `bubbletree.css`

```
@layer base       → CSS custom properties (design tokens + @property types),
                    container + wrapper geometry
@layer canvas     → SVG surface, bubble / ring / arc / icon styles
@layer labels     → HTML overlay labels positioned via CSS custom properties
@layer tooltip    → Floating tooltip card with entrance animation
@layer animation  → @keyframes declarations
@layer a11y       → prefers-reduced-motion overrides (always last)
```

Layers are declared at the top of the file so cascade order is explicit and
not affected by source order.

## Label positioning

Labels are `position: absolute; left: 0; top: 0;` with **`translate`** driven
by CSS custom properties:

```css
translate: var(--bt-label-x) var(--bt-label-y);
width:   var(--bt-label-width);
opacity: var(--bt-label-opacity);
```

JavaScript sets these via `element.style.setProperty('--bt-label-x', '…')`.
Because `translate` is a composited property the browser skips layout and
paint, giving smooth 60 fps label movement.

The `@property` declarations in `@layer base` give the browser typed
information so CSS transitions animate the custom-property values smoothly.

## Native CSS equivalents for original JS behaviour

| Original (JS)                          | CSS equivalent |
|----------------------------------------|----------------|
| `$(el).css({ cursor: 'pointer' })`     | `.bubbletree-bubble:hover { cursor: pointer }` |
| `tween fill-opacity to 0`              | `transition: fill-opacity 300ms ease` |
| `tween r / cx / cy`                    | `transition: r 300ms, cx 300ms, cy 300ms` |
| `tween opacity to 0`                   | `transition: opacity 300ms ease` |
| jQuery `.show()` / `.hide()`           | `[hidden]` attribute + `display:none` |
| Raphael `toBack()`                     | SVG paint order (rings inserted as firstChild) |
