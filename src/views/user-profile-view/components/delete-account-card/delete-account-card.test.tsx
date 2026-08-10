import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { DEFAULT_LOCALE } from '@/i18n'
import { server } from '@/mocks/server'
import { mapOrganizationResponseDTOToOrganization } from '@/services/organization'
import { makeStore } from '@/stores'
import { seedOrganizationDTO } from '@/tests/fixtures'
import { SEED_ORGANIZATION, SEED_USERS } from '@/tests/seed'
import { ThemeProvider } from '@/theme/provider'
import type { User } from '@/types'

import enMessages from '../../../../../lang/en.json'

import { DeleteAccountCard } from './delete-account-card'

const ORGANIZATION = mapOrganizationResponseDTOToOrganization(
  seedOrganizationDTO(),
)

/** The card is role-gated, so every render has to say who is looking. */
function authUserFor(roleId: number): User {
  const seed = SEED_USERS.find((user) => user.roleId === roleId)
  if (!seed) throw new Error(`no seeded user carries roleId ${roleId}`)
  return {
    userId: seed.userId,
    email: seed.email,
    firstName: seed.firstName,
    lastName: seed.lastName,
    phone: null,
    isActive: true,
    planId: SEED_ORGANIZATION.planId,
    roleId: seed.roleId,
    organizationId: SEED_ORGANIZATION.id,
  }
}

/** Tokenless on purpose: `getMe` stays skipped, so the MSW `/v1/auth/me`
 *  handler (always Carlos, owner) cannot shadow the role under test. */
function renderCard(ui: ReactElement, roleId = 1) {
  return render(
    <Provider
      store={makeStore({
        auth: {
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          user: authUserFor(roleId),
        },
      })}
    >
      <ThemeProvider>
        <IntlProvider
          locale={DEFAULT_LOCALE}
          defaultLocale={DEFAULT_LOCALE}
          messages={enMessages}
        >
          <MemoryRouter>{ui}</MemoryRouter>
        </IntlProvider>
      </ThemeProvider>
    </Provider>,
  )
}

describe('DeleteAccountCard', () => {
  // Toasts render through the app-level <Toaster/>, which isn't mounted here.
  const errorToast = vi.spyOn(toast, 'error')

  afterEach(() => errorToast.mockClear())

  it('deletes straight away when the user owns no organization', async () => {
    let deleteMeCalls = 0
    server.use(
      http.delete('*/v1/auth/me', () => {
        deleteMeCalls++
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderCard(<DeleteAccountCard ownedOrganization={null} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Delete my account/ }),
    )
    expect(await screen.findByText('Delete your account?')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete account' }),
    )

    await waitFor(() => expect(deleteMeCalls).toBe(1))
  })

  it('asks the owner to choose instead of firing a request that 409s', async () => {
    let deleteMeCalls = 0
    server.use(
      http.delete('*/v1/auth/me', () => {
        deleteMeCalls++
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderCard(<DeleteAccountCard ownedOrganization={ORGANIZATION} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Delete my account/ }),
    )

    expect(
      await screen.findByText('You own Constructora Lennix S.A.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Go to transfer ownership/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Delete organization and account/ }),
    ).toBeInTheDocument()
    // The plain confirmation must not be what an owner sees.
    expect(screen.queryByText('Delete your account?')).not.toBeInTheDocument()
    expect(deleteMeCalls).toBe(0)
  })

  it('deletes the organization before the account when the owner picks that', async () => {
    const calls: string[] = []
    server.use(
      http.delete('*/v1/organizations/:id', () => {
        calls.push('org')
        return new HttpResponse(null, { status: 204 })
      }),
      http.delete('*/v1/auth/me', () => {
        calls.push('account')
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderCard(<DeleteAccountCard ownedOrganization={ORGANIZATION} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Delete my account/ }),
    )
    await userEvent.click(
      await screen.findByRole('button', {
        name: /Delete organization and account/,
      }),
    )
    // Final confirmation before anything is destroyed.
    expect(
      await screen.findByText(
        'Delete Constructora Lennix S.A. and your account?',
      ),
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', {
        name: /Delete organization and account/,
      }),
    )

    await waitFor(() => expect(calls).toEqual(['org', 'account']))
  })

  it('says the organization is gone when only the account delete fails', async () => {
    server.use(
      http.delete(
        '*/v1/organizations/:id',
        () => new HttpResponse(null, { status: 204 }),
      ),
      http.delete(
        '*/v1/auth/me',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )

    renderCard(<DeleteAccountCard ownedOrganization={ORGANIZATION} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Delete my account/ }),
    )
    await userEvent.click(
      await screen.findByRole('button', {
        name: /Delete organization and account/,
      }),
    )
    await screen.findByText('Delete Constructora Lennix S.A. and your account?')
    await userEvent.click(
      screen.getByRole('button', { name: /Delete organization and account/ }),
    )

    // The generic "could not delete your account" would hide the fact that the
    // organization is already destroyed and there is no way back.
    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Constructora Lennix S.A. was deleted, but your account could not be. Try deleting your account again.',
        expect.anything(),
      ),
    )
    expect(errorToast).not.toHaveBeenCalledWith(
      'Could not delete your account. Please try again.',
      expect.anything(),
    )
  })

  it.each([
    ['manager', 3],
    ['user', 5],
  ])(
    'shows nothing to a %s — the organization is not theirs to end',
    (_slug, roleId) => {
      renderCard(<DeleteAccountCard ownedOrganization={null} />, roleId)

      expect(
        screen.queryByRole('button', { name: /Delete my account/ }),
      ).not.toBeInTheDocument()
    },
  )

  it('shows the card to an admin, who is the one it is actionable for', () => {
    // The owner sees it too, but the backend 409s them until they hand the
    // organization over — so in practice the admin is who deletes from here.
    renderCard(<DeleteAccountCard ownedOrganization={null} />, 2)

    expect(
      screen.getByRole('button', { name: /Delete my account/ }),
    ).toBeInTheDocument()
  })
})
