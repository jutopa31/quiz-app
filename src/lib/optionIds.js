/**
 * Stable option ids, derived from the option text.
 *
 * Plain JS on purpose: the app (TypeScript) and the migration generator under
 * scripts/ both import this file, so there is exactly one implementation and the
 * ids stored in Supabase cannot drift from the ids the client computes.
 */

/** djb2, as unsigned 32-bit, base36. */
export function contentHash(text) {
  let h = 5381
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

/** Ids for a question's options, disambiguating repeated texts. */
export function buildOptionIds(texts) {
  const seen = new Map()
  return texts.map(raw => {
    const base = contentHash(String(raw).trim())
    const occurrence = seen.get(base) ?? 0
    seen.set(base, occurrence + 1)
    return occurrence === 0 ? base : `${base}-${occurrence}`
  })
}
