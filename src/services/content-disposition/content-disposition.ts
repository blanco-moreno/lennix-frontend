/**
 * The filename an attachment response names itself with.
 *
 * Reads the quoted or bare `filename=` token of a `Content-Disposition`
 * header; the backend writes the quoted form. Falls back to a fixed name so
 * a missing header still yields a saveable file rather than a broken
 * download — the fallback is the only name the frontend ever invents.
 */

const FILENAME_RE = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i

export const FALLBACK_EXPORT_FILENAME = 'schedule.xlsx'

export function filenameFromContentDisposition(
  header: string | null | undefined,
): string {
  const match = header?.match(FILENAME_RE)
  const name = match?.[1]?.trim()
  return name ? decodeURIComponent(name) : FALLBACK_EXPORT_FILENAME
}
