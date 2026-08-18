/**
 * Hand the browser a file to save.
 *
 * The one place the app touches object URLs: an anchor with `download`,
 * clicked and removed, and the URL revoked once the click has been
 * dispatched. Isolated so every caller's test stubs this and never the DOM.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
