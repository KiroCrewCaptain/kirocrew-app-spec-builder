/**
 * What the page takes from the host instead of the dashboard's own modules, and
 * what it does on a host that lacks a level-1 name.
 *
 * - The catalogs: every key the page reads exists in English, every locale has
 *   the same keys (plural forms aside), and a missing locale falls back.
 * - The transport: every call goes through the host's scoped client once the
 *   root has handed it over, and a refusal reads back as the backend's sentence
 *   and code.
 * - The model list: the app's own GET /models, "auto" alone until it answers.
 * - The feature-detected names (`Select`, `guideCaution`) and the local stand-ins
 *   for the dashboard's framer-motion pulse and Radix overflow menu.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ReactNode } from 'react'

import { CATALOGS, t } from '../src/i18n'
import { setTransport, specApi, SpecApiError } from '../src/api'
import { useAvailableModels } from '../src/models'
import { stubLocale } from './stubs/app-sdk'
import { PulseSpan } from '../src/host/Pulse'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../src/host/Menu'

type Catalog = { [key: string]: string | Catalog }

function leaves(node: Catalog, prefix = ''): string[] {
  return Object.entries(node).flatMap(([k, v]) =>
    typeof v === 'string' ? [prefix + k] : leaves(v, `${prefix}${k}.`),
  )
}

const PLURAL = /_(zero|one|two|few|many|other)$/
const base = (key: string) => key.replace(PLURAL, '')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = resolve(dir, e.name)
    if (e.isDirectory()) return sourceFiles(p)
    return /\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts') ? [p] : []
  })
}

afterEach(() => {
  setTransport(null)
  vi.unstubAllGlobals()
})

describe('the catalogs', () => {
  const english = new Set(leaves(CATALOGS.en as Catalog).map(base))

  it('carry every key the page reads', () => {
    const src = resolve(__dirname, '..', 'src')
    const used = new Set<string>()
    for (const file of sourceFiles(src)) {
      const text = readFileSync(file, 'utf8')
      for (const m of text.matchAll(/'((?:apps|components)\.[A-Za-z0-9_.]+)'/g)) used.add(m[1])
    }
    expect(used.size).toBeGreaterThan(100)
    const missing = [...used].filter((k) => !english.has(k))
    expect(missing).toEqual([])
  })

  it('give every locale the same keys', () => {
    for (const [locale, catalog] of Object.entries(CATALOGS)) {
      const keys = new Set(leaves(catalog as Catalog).map(base))
      expect([...english].filter((k) => !keys.has(k)), locale).toEqual([])
      expect([...keys].filter((k) => !english.has(k)), locale).toEqual([])
    }
  })

  it('cover the twelve dashboard languages', () => {
    expect(Object.keys(CATALOGS).sort()).toEqual(
      ['bn', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'pt', 'ru', 'zh-CN'].sort(),
    )
  })

  it('look a key up in the active language, its base language, then English', () => {
    stubLocale('de')
    expect(t('apps.specBuilder.components.settingsModal.cancel')).not.toBe('Cancel')
    stubLocale('pt')
    const portuguese = t('apps.specBuilder.components.settingsModal.cancel')
    expect(portuguese).not.toBe('Cancel')
    stubLocale('pt-BR')
    expect(t('apps.specBuilder.components.settingsModal.cancel')).toBe(portuguese)
    stubLocale('xx')
    expect(t('apps.specBuilder.components.settingsModal.cancel')).toBe('Cancel')
    expect(t('apps.specBuilder.no.such.key')).toBe('apps.specBuilder.no.such.key')
  })

  it('pick the plural form the locale names', () => {
    expect(t('apps.specBuilder.components.taskList.done_of_total', { count: 1, done: 1, total: 1 })).toMatch(/1/)
    stubLocale('ru')
    expect(t('apps.specBuilder.components.taskList.done_of_total', { count: 5, done: 2, total: 5 })).toMatch(/5/)
  })
})

describe('the transport', () => {
  it('goes through the scoped client the root hands over', async () => {
    const raw = vi.fn(async () => new Response(JSON.stringify({ specs: [] }), { status: 200 }))
    setTransport({ raw })
    await expect(specApi.list()).resolves.toEqual({ specs: [] })
    expect(raw).toHaveBeenCalledWith('/api/apps/spec-builder/specs', expect.objectContaining({ signal: undefined }))
  })

  it('reads a refusal back as the backend sentence and code', async () => {
    const raw = vi.fn(async () => {
      throw Object.assign(new Error('API 409'), {
        status: 409,
        body: JSON.stringify({ error: 'spec was deleted or recreated; reload and retry', code: 'stale_client' }),
      })
    })
    setTransport({ raw })
    const err = await specApi.execute('demo', { spec_dir: '/x', slot_key: 'spec-builder-demo-0123abcd' }).catch((e) => e)
    expect(err).toBeInstanceOf(SpecApiError)
    expect(err.message).toBe('spec was deleted or recreated; reload and retry')
    expect(err.code).toBe('stale_client')
  })

  it('keeps the generic message for a body that is not JSON', async () => {
    setTransport({
      raw: async () => {
        throw Object.assign(new Error('API 502'), { status: 502, body: '<html>' })
      },
    })
    const err = await specApi.list().catch((e) => e)
    expect(err).toBeInstanceOf(SpecApiError)
    expect(err.code).toBe('')
    expect(err.message).toMatch(/502/)
  })

  it('passes a non-HTTP failure through unchanged', async () => {
    const boom = new TypeError('network down')
    setTransport({ raw: async () => { throw boom } })
    await expect(specApi.list()).rejects.toBe(boom)
  })
})

describe('the model list', () => {
  function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }

  it('offers auto alone until the app route answers, then the host list', async () => {
    let answer: (r: Response) => void = () => {}
    const raw = vi.fn(() => new Promise<Response>((r) => { answer = r }))
    setTransport({ raw })
    const { result } = renderHook(() => useAvailableModels(), { wrapper })
    expect(result.current.map((m) => m.name)).toEqual(['auto'])
    await act(async () => {
      answer(new Response(JSON.stringify([{ name: 'auto' }, { name: 'model-a' }, { bad: 1 }]), { status: 200 }))
    })
    await waitFor(() => expect(result.current.map((m) => m.name)).toEqual(['auto', 'model-a']))
    expect(raw).toHaveBeenCalledWith('/api/apps/spec-builder/models', expect.anything())
  })

  it('keeps auto alone when the answer is not a list', async () => {
    setTransport({ raw: async () => new Response(JSON.stringify({ error: 'x' }), { status: 200 }) })
    const { result } = renderHook(() => useAvailableModels(), { wrapper })
    await waitFor(() => expect(result.current.map((m) => m.name)).toEqual(['auto']))
  })
})

describe('feature-detected host names', () => {
  it('uses the host Select and caution marker where the host has them', async () => {
    const mod = await import('../src/hostSdk')
    render(<mod.Select options={['a']} value="a" onChange={() => {}} aria-label="pick" />)
    expect(screen.getByRole('combobox', { name: 'pick' })).toHaveAttribute('data-host-select')
    expect(mod.guideCaution).toEqual({ 'data-guide-caution': '' })
  })

  it('falls back to a native select and no marker on an older host', async () => {
    vi.resetModules()
    vi.doMock('@kirocrew/app-sdk/ui', () => ({}))
    const mod = await import('../src/hostSdk')
    render(<mod.Select options={['a', 'b']} value="b" onChange={() => {}} aria-label="pick" />)
    const select = screen.getByRole('combobox', { name: 'pick' })
    expect(select).not.toHaveAttribute('data-host-select')
    expect((select as HTMLSelectElement).value).toBe('b')
    expect(mod.guideCaution).toEqual({})
    vi.doUnmock('@kirocrew/app-sdk/ui')
    vi.resetModules()
  })
})

describe('local stand-ins for dashboard-only modules', () => {
  it('pulses a running dot through Element.animate and cancels on unmount', () => {
    const cancel = vi.fn()
    const animate = vi.fn(() => ({ cancel }))
    ;(HTMLElement.prototype as unknown as { animate: unknown }).animate = animate
    const { unmount } = render(<PulseSpan aria-label="working" />)
    expect(animate).toHaveBeenCalledTimes(1)
    unmount()
    expect(cancel).toHaveBeenCalledTimes(1)
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate
  })

  it('keeps the dot still when reduced motion is asked for', () => {
    const animate = vi.fn(() => ({ cancel: vi.fn() }))
    ;(HTMLElement.prototype as unknown as { animate: unknown }).animate = animate
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
    render(<PulseSpan aria-label="working" />)
    expect(animate).not.toHaveBeenCalled()
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate
  })

  function menu(onPick = vi.fn()) {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="More actions">…</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onPick}>First</DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={onPick}>Off</DropdownMenuItem>
          <DropdownMenuItem onSelect={onPick}>Last</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    return onPick
  }

  it('opens from its trigger, runs an item and closes', () => {
    const onPick = menu()
    const trigger = screen.getByRole('button', { name: 'More actions' })
    expect(screen.queryByRole('menu')).toBeNull()
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'First' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last' }))
    expect(onPick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('skips a disabled item, moves with the arrows and closes on Escape', () => {
    const onPick = menu()
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Off' }))
    expect(onPick).not.toHaveBeenCalled()
    const list = screen.getByRole('menu')
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Last' }))
    fireEvent.keyDown(list, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'First' }))
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' })
    expect(onPick).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'More actions' }))
  })

  it('closes on a press outside', () => {
    menu()
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
