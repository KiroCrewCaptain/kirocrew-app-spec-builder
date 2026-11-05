/**
 * A small overflow menu: a trigger button and a `role="menu"` list of items.
 *
 * The built-in used the dashboard's Radix `DropdownMenu`, which the App Kit does
 * not export. This keeps the behaviour the page relies on: the trigger toggles
 * the list, an item runs its `onSelect` and closes it, Escape closes it and
 * hands focus back to the trigger, a press outside closes it, and the arrow keys
 * move between the enabled items.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'

interface MenuState {
  open: boolean
  setOpen: (next: boolean) => void
  triggerRef: RefObject<HTMLButtonElement>
}

const Ctx = createContext<MenuState | null>(null)

function useMenu(): MenuState {
  const state = useContext(Ctx)
  if (!state) throw new Error('Menu parts must be rendered inside <DropdownMenu>')
  return state
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return (
    <Ctx.Provider value={{ open, setOpen, triggerRef }}>
      <span className="relative inline-flex">{children}</span>
    </Ctx.Provider>
  )
}

export function DropdownMenuTrigger({ children, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useMenu()
  return (
    <button
      type="button"
      ref={triggerRef}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        onClick?.(e)
        setOpen(!open)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  align = 'start',
  className,
}: {
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  const { open, setOpen, triggerRef } = useMenu()
  const listRef = useRef<HTMLDivElement | null>(null)

  const close = useCallback(
    (refocus: boolean) => {
      setOpen(false)
      if (refocus) triggerRef.current?.focus()
    },
    [setOpen, triggerRef],
  )

  useEffect(() => {
    if (!open) return
    const first = listRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
    first?.focus()
    const onDown = (e: PointerEvent | MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (listRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, close, triggerRef])

  if (!open) return null

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
      return
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
    )
    if (!items.length) return
    const at = items.indexOf(document.activeElement as HTMLElement)
    const next = e.key === 'ArrowDown' ? (at + 1) % items.length : (at - 1 + items.length) % items.length
    items[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={
        'absolute top-full mt-1 z-50 flex flex-col py-1 rounded-lg border border-border bg-bg-elevated shadow-lg '
        + (align === 'end' ? 'right-0 ' : 'left-0 ')
        + (className ?? '')
      }
    >
      <MenuClose.Provider value={close}>{children}</MenuClose.Provider>
    </div>
  )
}

const MenuClose = createContext<((refocus: boolean) => void) | null>(null)

export function DropdownMenuItem({
  children,
  onSelect,
  disabled,
  ...rest
}: {
  children: ReactNode
  onSelect?: () => void
  disabled?: boolean
  [attr: string]: unknown
}) {
  const close = useContext(MenuClose)
  const run = () => {
    if (disabled) return
    close?.(true)
    onSelect?.()
  }
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? undefined : -1}
      aria-disabled={disabled || undefined}
      onClick={run}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          run()
        }
      }}
      className={
        'flex items-center gap-2 px-3 py-1.5 text-[13px] text-text cursor-pointer outline-none '
        + 'hover:bg-bg-hover focus:bg-bg-hover '
        + (disabled ? 'opacity-50 cursor-not-allowed' : '')
      }
      {...rest}
    >
      {children}
    </div>
  )
}
