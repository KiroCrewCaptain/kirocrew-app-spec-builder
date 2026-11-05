/** Best-effort `localStorage` write: a full quota or private mode is swallowed.
 *
 *  The dashboard's `safeSetItem` also reclaims its own disposable caches under
 *  quota pressure; those caches are the host's, not this page's, so the page only
 *  makes the write non-fatal. */
export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* quota or private mode: persistence is best-effort */
  }
}
