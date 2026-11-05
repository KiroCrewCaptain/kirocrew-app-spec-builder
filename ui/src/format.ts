import { fmtNumber, type NumberOptions } from '@kirocrew/app-sdk'

/** *ratio* (0..1) as a percentage in the host's active language: the dashboard's
 *  `fmtPercent`, which the App Kit does not export, over the SDK's `fmtNumber`. */
export function fmtPercent(ratio: number, options?: NumberOptions): string {
  if (!Number.isFinite(ratio)) return '—'
  return fmtNumber(ratio, { style: 'percent', maximumFractionDigits: 0, ...options })
}
