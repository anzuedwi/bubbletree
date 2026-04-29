/**
 * displayKind.ts
 *
 * Discriminant tag on every {@link DisplayObject} so the main
 * BubbleTree class can filter bubbles vs. rings without instanceof checks.
 */
export enum DisplayKind {
  Bubble = 'bubble',
  Ring = 'ring',
}
