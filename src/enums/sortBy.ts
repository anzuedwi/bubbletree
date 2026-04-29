/**
 * sortBy.ts
 *
 * Controls the sort order applied to sibling nodes before they are
 * placed on the ring.  Amount (default) interleaves largest and smallest
 * for visual balance; Label sorts alphabetically without interleaving.
 */
export enum SortBy {
  Amount = 'amount',
  Label = 'label',
}
