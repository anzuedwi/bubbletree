/**
 * css.ts
 *
 * Helpers for turning arbitrary data values into safe CSS identifiers.
 *
 * Node ids come from caller-supplied data and may contain spaces, leading
 * digits, or punctuation. Used verbatim they break in two ways:
 *  - `classList.add(id)` throws if the id contains whitespace.
 *  - `querySelector('.' + id)` is invalid if the id starts with a digit or
 *    contains characters that aren't valid in a class selector.
 *
 * cssToken() normalises an id into a single valid class token. Both the
 * element-tagging side and the selector side must use it so they always
 * agree on the same token.
 */

/**
 * Convert an arbitrary id into a CSS class token, or '' when there is no id.
 * Runs of non-word characters collapse to a single hyphen, and a leading
 * digit or hyphen is prefixed so the result is a valid selector start.
 */
export function cssToken(id: string | undefined | null): string {
  if (!id) return '';
  const token = id.trim().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!token) return '';
  return /^[0-9]/.test(token) ? `id-${token}` : token;
}
