import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { resetStubSdk } from './stubs/app-sdk'

afterEach(() => {
  cleanup()
  resetStubSdk()
})

// jsdom has no PointerEvent, so `fireEvent.pointerMove(el, { clientX })` would
// dispatch a plain Event with no coordinates. The dashboard's test setup stubs it
// the same way; the splitter tests read `clientX` off the event.
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class Polyfill extends MouseEvent {
    readonly pointerId: number
    readonly pointerType: string
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
      this.pointerId = params.pointerId ?? 0
      this.pointerType = params.pointerType ?? ''
    }
  }
  ;(window as unknown as { PointerEvent: unknown }).PointerEvent = Polyfill
  ;(globalThis as unknown as { PointerEvent: unknown }).PointerEvent = Polyfill
}
