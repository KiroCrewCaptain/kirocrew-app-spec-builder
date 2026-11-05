/**
 * A light stand-in for the host's `@kirocrew/app-sdk/ui`, at App Kit level 1:
 * plain elements with the roles and labels the host components render, so a
 * test can find them the way a user would.
 */

import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import type { SelectProps, Segment } from '@kirocrew/app-sdk/ui'
import { micromark } from 'micromark'

type Loose = { className?: string; children?: ReactNode; [prop: string]: unknown }

export const Btn = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; primary?: boolean }
>(function Btn({ danger: _danger, primary: _primary, type = 'button', ...rest }, ref) {
  return <button ref={ref} type={type} {...rest} />
})

export const SendBtn = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function SendBtn({ type = 'button', ...rest }, ref) {
    return <button ref={ref} type={type} {...rest} />
  },
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return <input ref={ref} {...props} />
  },
)

/** The host's search field: an input inside a positioned wrapper that takes the className. */
export function SearchInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <input {...props} />
    </div>
  )
}

export function Card({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...rest}>{children}</div>
}

export function CardTitle({ children }: Loose) {
  return <h2>{children}</h2>
}

export function ContentSkeleton() {
  return <div role="status" aria-busy="true" />
}

export function StatCard({ label, value }: Loose) {
  return (
    <div>
      <span>{label as ReactNode}</span>
      <span>{value as ReactNode}</span>
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div>
      {icon}
      <div>{title}</div>
      {subtitle ? <div>{subtitle}</div> : null}
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: string; actions?: ReactNode }) {
  return (
    <header>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {actions}
    </header>
  )
}

/** The host's Clickable: a div with role=button that activates on Enter and Space. */
export const Clickable = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { onClick?: (e?: unknown) => void; disabled?: boolean }>(
  function Clickable({ children, onClick, disabled, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onClick={(e) => { if (!disabled) onClick?.(e) }}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.(e)
          }
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

export function InfoTip({ text }: { text: string }) {
  return <span title={text}>ⓘ</span>
}

/** The host's ErrorNotice: nothing without a message; otherwise an alert with
 *  its optional title, the message, and a named dismiss control. */
export function ErrorNotice({
  message,
  title,
  onDismiss,
  dismissLabel,
  testId,
  className,
}: {
  message?: string | null
  title?: string
  onDismiss?: () => void
  dismissLabel?: string
  testId?: string
  className?: string
}) {
  if (!message) return null
  const name = dismissLabel ?? 'Dismiss'
  return (
    <div role="alert" data-testid={testId} className={className}>
      {title ? <strong>{title}</strong> : null}
      <span>{message}</span>
      {onDismiss ? (
        <button type="button" aria-label={name} title={name} onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  )
}

/** The host's Modal: a named dialog with a Close button; Escape and Close are
 *  refused while `dismissDisabled`. */
export function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  footer,
  children,
  dismissDisabled = false,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  ariaLabel?: string
  footer?: ReactNode
  children?: ReactNode
  dismissDisabled?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && !dismissDisabled) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, dismissDisabled])
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}>
      <div>
        <span>{title}</span>
        <button type="button" aria-label="Close" disabled={dismissDisabled} onClick={() => { if (!dismissDisabled) onClose() }}>
          ×
        </button>
      </div>
      {children}
      {footer}
    </div>
  )
}

/** The host's SegmentedControl: a radiogroup of radio buttons. */
export function SegmentedControl<T extends string = string>({
  segments,
  value,
  onChange,
  ariaLabel,
}: {
  segments: Segment<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
  [prop: string]: unknown
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel}>
      {segments.map((s) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={s.key === value}
          aria-disabled={s.disabled || undefined}
          title={s.tooltip || s.label}
          onClick={() => { if (!s.disabled) onChange(s.key) }}
        >
          {s.icon}
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}

/** Stands in for the host's themed dropdown; marked so a test can tell it from the fallback. */
export function Select({ options, optionLabels, value, onChange, clearLabel, disabled, 'aria-label': ariaLabel }: SelectProps) {
  return (
    <select data-host-select="" aria-label={ariaLabel} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {clearLabel !== undefined || !options.includes(value) ? <option value="">{clearLabel ?? ''}</option> : null}
      {options.map((o, i) => (
        <option key={o} value={o}>
          {optionLabels?.[i] ?? o}
        </option>
      ))}
    </select>
  )
}

export const guideCaution = { 'data-guide-caution': '' } as const

/** Stands in for the host's Markdown view: CommonMark through micromark. */
export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  return <div data-markdown="" className={className} dangerouslySetInnerHTML={{ __html: micromark(content || '') }} />
}
