/**
 * mouseEventGroup.ts
 *
 * Treats a set of heterogeneous DOM elements (SVG nodes + HTML divs) as a
 * single interactive target — hover and click fire once for the group, not
 * once per member.
 *
 * Replaces the jQuery .hover() / .click() approach from the original:
 *  - Uses native addEventListener / removeEventListener.
 *  - Hover debouncing is done with queueMicrotask (enter) and setTimeout
 *    (leave, 40 ms) to handle rapid transitions between group members.
 *  - WeakMap stores per-element handler references for clean removal.
 */
type ClickHandler = (detail: { target: unknown; origEvent: MouseEvent; group: MouseEventGroup }) => void;
type HoverHandler = (detail: { target: unknown; origEvent: MouseEvent; group: MouseEventGroup }) => void;

export class MouseEventGroup {
  private clickCallback: ClickHandler | null = null;
  private hoverCallback: HoverHandler | null = null;
  private unhoverCallback: HoverHandler | null = null;
  private wasHovering = false;
  private mouseIsOver = false;
  private readonly listeners = new WeakMap<Element, {
    click?: (e: Event) => void;
    enter?: (e: Event) => void;
    leave?: (e: Event) => void;
  }>();

  constructor(public target: unknown, public members: Element[]) {}

  click(callback: ClickHandler): void {
    this.clickCallback = callback;
    for (const member of this.members) this.bindClick(member);
  }

  hover(callback: HoverHandler): void {
    this.hoverCallback = callback;
    for (const member of this.members) this.bindHover(member);
  }

  unhover(callback: HoverHandler): void {
    this.unhoverCallback = callback;
  }

  addMember(member: Element): void {
    if (this.hoverCallback) this.bindHover(member);
    if (this.clickCallback) this.bindClick(member);
    this.members.push(member);
  }

  removeMember(member: Element): void {
    const handlers = this.listeners.get(member);
    if (handlers) {
      if (handlers.click) member.removeEventListener('click', handlers.click);
      if (handlers.enter) member.removeEventListener('mouseenter', handlers.enter);
      if (handlers.leave) member.removeEventListener('mouseleave', handlers.leave);
      this.listeners.delete(member);
    }
    this.members = this.members.filter((m) => m !== member);
  }

  private bindClick(member: Element): void {
    const handler = (event: Event) => {
      this.clickCallback?.({
        target: this.target,
        origEvent: event as MouseEvent,
        group: this,
      });
    };
    member.addEventListener('click', handler);
    const entry = this.listeners.get(member) ?? {};
    entry.click = handler;
    this.listeners.set(member, entry);
  }

  private bindHover(member: Element): void {
    const enter = (event: Event) => {
      queueMicrotask(() => {
        this.mouseIsOver = true;
        if (!this.wasHovering) {
          this.wasHovering = true;
          this.hoverCallback?.({
            target: this.target,
            origEvent: event as MouseEvent,
            group: this,
          });
        }
      });
    };
    const leave = (event: Event) => {
      this.mouseIsOver = false;
      setTimeout(() => {
        if (!this.mouseIsOver && this.wasHovering) {
          this.wasHovering = false;
          this.unhoverCallback?.({
            target: this.target,
            origEvent: event as MouseEvent,
            group: this,
          });
        }
      }, 40);
    };
    member.addEventListener('mouseenter', enter);
    member.addEventListener('mouseleave', leave);
    const entry = this.listeners.get(member) ?? {};
    entry.enter = enter;
    entry.leave = leave;
    this.listeners.set(member, entry);
  }
}
