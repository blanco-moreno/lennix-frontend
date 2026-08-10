import { generateTempPassword } from './generate-temp-password'

describe('generateTempPassword', () => {
  it('is 14 chars with the guaranteed !1 suffix', () => {
    const password = generateTempPassword()
    expect(password).toHaveLength(14)
    expect(password.endsWith('!1')).toBe(true)
  })

  it('draws only from the unambiguous alphabet before the suffix', () => {
    // No 0/O, 1/l/I — the admin reads this aloud or types it from a screen.
    expect(generateTempPassword().slice(0, 12)).toMatch(
      /^[A-HJ-NP-Za-km-z2-9]{12}$/,
    )
  })

  it('never repeats', () => {
    expect(generateTempPassword()).not.toBe(generateTempPassword())
  })
})
