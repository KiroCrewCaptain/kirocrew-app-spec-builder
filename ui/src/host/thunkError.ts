/** The readable message of a thrown value, or '' (from the dashboard's `utils/thunkError`). */
export function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    const { message } = e as { message?: unknown }
    return typeof message === 'string' ? message : ''
  }
  return e == null ? '' : String(e)
}
