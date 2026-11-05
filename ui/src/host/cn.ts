/** The class names that are set, joined with a space.
 *
 *  The dashboard's `cn` also runs tailwind-merge to resolve two conflicting
 *  utilities; no caller in this page passes a conflicting pair, so a plain join
 *  renders the same and the bundle carries no third-party code. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
