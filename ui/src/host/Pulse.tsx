import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react'

/** The opacity keyframes of the dashboard's running-dot pulse (`PULSE_MOTION`). */
const KEYFRAMES: Keyframe[] = [{ opacity: 0.25 }, { opacity: 1 }, { opacity: 0.25 }]
const TIMING: KeyframeAnimationOptions = { duration: 1200, iterations: Infinity, easing: 'ease-in-out' }

function reducedMotion(): boolean {
  try {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** A `<span>` whose opacity pulses while it is mounted: the running dots.
 *
 *  The built-in drove this with framer-motion, which the dashboard does not
 *  share with app bundles; the same keyframe loop runs through
 *  `Element.animate`. With reduced motion asked for, the dot stays still. */
export function PulseSpan({ style, ...rest }: HTMLAttributes<HTMLSpanElement> & { style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof el.animate !== 'function' || reducedMotion()) return
    const animation = el.animate(KEYFRAMES, TIMING)
    return () => animation.cancel()
  }, [])
  return <span ref={ref} style={style} data-pulse="" {...rest} />
}
