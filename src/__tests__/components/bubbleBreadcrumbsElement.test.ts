/**
 * bubbleBreadcrumbsElement.test.ts — trail update on node-click and the
 * navigate event dispatch.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { BubbleBreadcrumbsElement } from '../../components/bubbleBreadcrumbsElement.js';
import type { BubbleNode } from '../../types/bubbleNode.js';

async function mountWithTarget(): Promise<{
  crumbs: BubbleBreadcrumbsElement;
  target: HTMLElement;
}> {
  document.body.innerHTML = '';
  const target = document.createElement('div');
  target.id = 'tree';
  const crumbs = document.createElement('bubble-breadcrumbs') as BubbleBreadcrumbsElement;
  crumbs.target = '#tree';
  document.body.append(target, crumbs);
  await crumbs.updateComplete;
  // Wait one microtask for connectedCallback's queueMicrotask to flush.
  await Promise.resolve();
  return { crumbs, target };
}

describe('<bubble-breadcrumbs>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the root label when no trail has been set', async () => {
    const { crumbs } = await mountWithTarget();
    crumbs.rootLabel = 'Home';
    await crumbs.updateComplete;
    expect(crumbs.shadowRoot!.textContent).toContain('Home');
  });

  it('builds a trail in response to node-click events', async () => {
    const { crumbs, target } = await mountWithTarget();
    const root: BubbleNode = { label: 'Root', amount: 100 };
    const child: BubbleNode = { label: 'Child', amount: 50, parent: root };
    const grandchild: BubbleNode = { label: 'Grand', amount: 20, parent: child };

    target.dispatchEvent(new CustomEvent('node-click', { detail: grandchild }));
    await crumbs.updateComplete;

    const buttons = crumbs.shadowRoot!.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent?.trim()).toBe('Root');
    expect(buttons[1].textContent?.trim()).toBe('Child');
    expect(buttons[2].textContent?.trim()).toBe('Grand');
  });

  it('dispatches breadcrumb-navigate when a non-leaf crumb is clicked', async () => {
    const { crumbs, target } = await mountWithTarget();
    const root: BubbleNode = { label: 'Root', amount: 100 };
    const child: BubbleNode = { label: 'Child', amount: 50, parent: root };
    target.dispatchEvent(new CustomEvent('node-click', { detail: child }));
    await crumbs.updateComplete;

    let received: BubbleNode | null = null;
    crumbs.addEventListener('breadcrumb-navigate', (e) => {
      received = (e as CustomEvent<BubbleNode>).detail;
    });

    const rootButton = crumbs.shadowRoot!.querySelectorAll('button')[0] as HTMLButtonElement;
    rootButton.click();
    expect(received).toBe(root);
  });
});
