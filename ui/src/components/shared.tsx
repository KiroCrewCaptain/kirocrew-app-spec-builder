// Shared styling constants + small primitives for the Spec Builder builtin.
// Accent is theme-driven (var(--accent)) so light/dark/custom palettes all
// work; translucent tints use color-mix so opacity reads correctly on any bg.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../host/cn'
import { Btn as HostBtn } from '@kirocrew/app-sdk/ui'

// Re-exported from inlineStyles so every importer keeps its `from './shared'`
// path while the CSS text itself lives in the module the i18n lint exempts.
export { ACCENT, SEL_BG, SEL_BORDER } from '../inlineStyles'

export const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '14px',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  outline: 'none',
}

/** Pill-shaped button — the host `Btn` with a rounded-full skin.
 *  Delegates to the shared component so theme tokens, focus ring, disabled
 *  state and active-press feedback stay identical to the rest of the
 *  dashboard; only the pill radius is app-specific. */
export function Btn({
  label, onClick, primary, danger, disabled, title, big, ariaLabel, nowrap,
}: {
  label: ReactNode
  onClick?: () => void
  primary?: boolean
  danger?: boolean
  disabled?: boolean
  title?: string
  big?: boolean
  /** Required when `label` renders an icon with no adjacent text. */
  ariaLabel?: string
  /** Keep the label on one line and refuse to shrink in a crowded header. */
  nowrap?: boolean
}) {
  return (
    <HostBtn
      onClick={onClick}
      disabled={disabled}
      title={title}
      primary={primary}
      danger={danger}
      aria-label={ariaLabel}
      className={cn('rounded-full', big && 'px-6 py-2 text-sm', nowrap && 'whitespace-nowrap shrink-0')}
    >
      {label}
    </HostBtn>
  )
}
