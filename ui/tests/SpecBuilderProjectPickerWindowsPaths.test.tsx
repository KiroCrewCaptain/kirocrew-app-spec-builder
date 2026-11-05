/**
 * The project picker names a project by its folder, keeping the full path for
 * its tooltip. A Windows gateway reports native paths (`C:\Users\u\work\myrepo`),
 * which hold no `/`, so a `/`-only split showed the whole path where the folder
 * name belongs. The picker derives the name through `pathBasename`
 * (src/host/pathBasename.ts), and a POSIX path names the same folder as before.
 *
 * Ported from the Spec Builder cases of the dashboard's
 * `windowsProjectNameSites.test.tsx` and `windowsBasenameSites.test.tsx`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import ProjectPicker from '../src/components/ProjectPicker'

const browse = vi.hoisted(() => vi.fn())
vi.mock('../src/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/api')>()
  return { ...actual, specApi: { ...actual.specApi, browse } }
})

const WIN = 'C:\\Users\\u\\work\\myrepo'

// Path -> the folder name the picker shows for it.
const CASES: [string, string][] = [
  [WIN, 'myrepo'],
  [`${WIN}\\`, 'myrepo'],
  ['C:/Users/u/work/myrepo', 'myrepo'],
  ['\\\\host\\share\\myrepo', 'myrepo'],
  ['/home/u/work/myrepo', 'myrepo'],
  ['/home/u/work/myrepo/', 'myrepo'],
  ['/tmp/we\\ird', 'we\\ird'],
  ['/', '/'],
]

function renderPicker(value: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ProjectPicker value={value} onChange={vi.fn()} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  browse.mockReset()
})

describe('the Spec Builder project picker names a project by its folder', () => {
  it.each(CASES)('the selected project %s shows %s beside its path', (project, name) => {
    browse.mockResolvedValue({ path: '', parent: '', dirs: [], recents: [] })
    renderPicker(project)
    const field = screen.getByRole('button', { name: `Project folder: ${project} — change` })
    expect(field.querySelector('.font-semibold')?.textContent).toBe(name)
  })

  it.each(CASES)('the recent project %s shows %s', async (project, name) => {
    browse.mockResolvedValue({ path: '', parent: '', dirs: [], recents: [project] })
    renderPicker('')
    fireEvent.click(screen.getByRole('button', { name: 'Choose a project folder' }))
    const recent = await screen.findByRole('button', { name: `Use recent project ${project}` })
    expect(recent.querySelector('.font-semibold')?.textContent).toBe(name)
  })
})

describe('the picker never brings the `/`-only split back', () => {
  const src = readFileSync(resolve(__dirname, '..', 'src/components/ProjectPicker.tsx'), 'utf8')

  it('derives file names through pathBasename only', () => {
    expect(src).toMatch(/import \{[^}]*\bpathBasename\b[^}]*\} from '[./]+\/host\/pathBasename'/)
    expect(src).not.toMatch(/\.split\('\/'\)\.pop\(\)/)
    expect(src).not.toMatch(/\.lastIndexOf\('\/'\) \+ 1\)/)
  })

  it('has no `/`-only folder-name split', () => {
    expect(src).not.toMatch(/\.split\('\/'\)\.filter\(Boolean\)\.pop\(\)/)
  })
})
