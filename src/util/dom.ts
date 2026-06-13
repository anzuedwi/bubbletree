/**
 * dom.ts
 *
 * Lightweight DOM helpers that replace jQuery's element creation and
 * selection utilities used throughout the original codebase.
 *
 *  - resolveContainer()   → validates + clears the host element
 *  - createSvgElement()   → typed SVG element factory (SVG namespace)
 *  - createDiv()          → creates a <div> with a given class string
 */
export function resolveContainer(target: string | Element): HTMLElement {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) {
    throw new Error(`BubbleTree: container not found for selector "${String(target)}"`);
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error('BubbleTree: container must be an HTMLElement');
  }
  while (element.firstChild) element.removeChild(element.firstChild);
  return element;
}

export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  name: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

export function createDiv(className: string): HTMLDivElement {
  const div = document.createElement('div');
  div.className = className;
  return div;
}
