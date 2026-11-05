/**
 * The bundle's entry: AppHost lazy-imports this module and renders its default
 * export as the app's page.
 *
 * Two things happen here once, for the whole page. The host's permission-scoped
 * API client becomes the transport every Spec Builder call goes through
 * (`setTransport`); the embedded chat reads the same client from the host's
 * provider, along with the slot-change signal for this app's own slots. And the
 * host's language generation is subscribed to, which repaints the page on a
 * language switch: `t` reads the active locale at call time, and this
 * component's re-render reaches every child.
 */

import { useAppApi, useLanguageGeneration } from '@kirocrew/app-sdk'
import { setTransport } from './api'
import SpecBuilderPage from './SpecBuilderPage'

export default function SpecBuilderApp() {
  useLanguageGeneration()
  // Set during render, before any child's query runs: the client is stable for
  // the app's lifetime, and a child's first fetch must already use it.
  setTransport(useAppApi())
  return <SpecBuilderPage />
}
