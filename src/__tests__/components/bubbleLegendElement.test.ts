/**
 * bubbleLegendElement.test.ts — verifies entries render and adapt to props.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { BubbleLegendElement, LegendEntry } from '../../components/bubbleLegendElement.js';

async function mount(props: Partial<BubbleLegendElement>): Promise<BubbleLegendElement> {
  const el = document.createElement('bubble-legend') as BubbleLegendElement;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('<bubble-legend>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders one entry per item in props', async () => {
    const entries: LegendEntry[] = [
      { label: 'A', color: '#ff0000' },
      { label: 'B', color: '#00ff00' },
      { label: 'C', color: '#0000ff' },
    ];
    const el = await mount({ entries, title: 'Test' });
    const items = el.shadowRoot!.querySelectorAll('.entry');
    expect(items.length).toBe(3);
  });

  it('shows the title', async () => {
    const el = await mount({ entries: [], title: 'Departments' });
    expect(el.shadowRoot!.querySelector('.title')!.textContent).toBe('Departments');
  });

  it('updates when entries change', async () => {
    const el = await mount({ entries: [{ label: 'one', color: '#000' }] });
    el.entries = [
      { label: 'one', color: '#000' },
      { label: 'two', color: '#111' },
    ];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.entry').length).toBe(2);
  });

  it('uses the swatch color', async () => {
    const el = await mount({ entries: [{ label: 'Red', color: '#ff0000' }] });
    const swatch = el.shadowRoot!.querySelector('.swatch') as HTMLElement;
    // Different DOM implementations normalise colours differently (a real
    // browser yields rgb(...), happy-dom preserves the hex), so assert the
    // colour is applied rather than a specific serialisation.
    const applied = swatch.style.background.toLowerCase();
    expect(applied === '#ff0000' || applied === 'rgb(255, 0, 0)').toBe(true);
  });
});
