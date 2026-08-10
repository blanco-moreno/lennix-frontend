/** Generate a strong temporary password the admin can share with the new
 *  user. 14 chars, mixed case + digits + a guaranteed symbol/number suffix. */
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const buf = new Uint8Array(12)
  crypto.getRandomValues(buf)
  const random = Array.from(buf, (n) => chars[n % chars.length]).join('')
  return `${random}!1`
}
