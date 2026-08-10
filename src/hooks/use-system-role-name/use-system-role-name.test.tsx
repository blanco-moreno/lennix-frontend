import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import { useSystemRoleName } from '@/hooks'
import { ROLE_SLUGS } from '@/utils/permissions/roles'

import enMessages from '../../../lang/en.json'
import esMessages from '../../../lang/es.json'

/**
 * `role.name` from `/v1/roles` is English reference data for the permission
 * matrix, never a label: printed as one, every user reads their own role in
 * English under their own name.
 */

const CATALOGS = { en: enMessages, es: esMessages } as const

function nameIn(locale: keyof typeof CATALOGS) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider
      locale={locale}
      defaultLocale="en"
      messages={CATALOGS[locale]}
    >
      {children}
    </IntlProvider>
  )
  return renderHook(() => useSystemRoleName(), { wrapper }).result.current
}

describe('useSystemRoleName', () => {
  it('names every role in Spanish, which is the launch locale', () => {
    const name = nameIn('es')

    expect(name('owner')).toBe('Propietario')
    expect(name('admin')).toBe('Admin')
    // "Gerente", not "Jefe de Obra": the system role is organization
    // vocabulary, and the obra's own lead is a separate field with its own
    // name — one word must not stand for both.
    expect(name('manager')).toBe('Gerente')
    expect(name('user')).toBe('Usuario')
  })

  it('has a translation for all four, not just the ones on screen today', () => {
    const es = nameIn('es')
    const en = nameIn('en')

    for (const slug of ROLE_SLUGS) {
      expect(es(slug), `no es label for ${slug}`).toBeTruthy()
      expect(en(slug), `no en label for ${slug}`).toBeTruthy()
      // A missing message renders as the message id — never as a label.
      expect(es(slug)).not.toContain('systemRole.')
    }
  })

  it('resolves the numeric roleId the auth user carries', () => {
    // The sidebar and the profile only have `user.roleId`, so the hook takes it
    // directly rather than making each caller resolve the slug first.
    const name = nameIn('es')

    expect(name(1)).toBe('Propietario')
    expect(name(3)).toBe('Gerente')
  })

  it('says nothing rather than guessing for an unknown or absent role', () => {
    const name = nameIn('es')

    expect(name(null)).toBeNull()
    expect(name(undefined)).toBeNull()
    expect(name(99)).toBeNull()
    // 4 and 6 are the retired ids — a stale backend must not print a label.
    expect(name(4)).toBeNull()
  })
})
