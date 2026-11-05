import { useSyncExternalStore } from 'react'

/** The dashboard's narrow-layout breakpoint (its `useIsMobile`). */
export const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function mql(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_QUERY)
    : null
}

function subscribe(cb: () => void): () => void {
  const list = mql()
  list?.addEventListener('change', cb)
  window.addEventListener('resize', cb)
  return () => {
    list?.removeEventListener('change', cb)
    window.removeEventListener('resize', cb)
  }
}

const snapshot = () => mql()?.matches ?? false

/** Whether the viewport is below the dashboard's narrow-layout breakpoint.
 *
 *  The dashboard's hook also wraps a form switch in a view transition and
 *  reports "not narrow" inside its IDE embed; both are host chrome, so this
 *  copy reads the media query alone. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
