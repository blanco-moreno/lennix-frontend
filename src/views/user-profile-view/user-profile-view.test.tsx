import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedCurrentUserDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import { UserProfileView } from './user-profile-view'

/** Not a seed fact: the seed manifest carries no passwords. */
const FIXTURE_NEW_PASSWORD = 'new-secret-9'

function renderProfile() {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos.rodriguez@lennix-test.com',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId: 1,
      organizationId: SEED_ORGANIZATION.id,
    }),
  )
  return renderWithProviders(<UserProfileView />, { store, route: '/profile' })
}

describe('UserProfileView', () => {
  it('renders the seeded current user: name, email, role, organization and status', async () => {
    const me = seedCurrentUserDTO()

    renderProfile()

    expect(await screen.findByText(me.first_name)).toBeInTheDocument()
    expect(screen.getByText(me.last_name)).toBeInTheDocument()
    expect(screen.getByText(me.email)).toBeInTheDocument()
    // Carlos holds role 1, rendered through the intl role names.
    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    // The seed carries no phone.
    expect(screen.getByText('Not registered')).toBeInTheDocument()
  })

  it('sends the new password to the reset endpoint and clears the field', async () => {
    const bodies: Record<string, unknown>[] = []
    server.use(
      http.post('*/v1/auth/reset-password', async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderProfile()

    const field = await screen.findByLabelText('New password')
    await userEvent.type(field, FIXTURE_NEW_PASSWORD)
    await userEvent.click(
      screen.getByRole('button', { name: 'Update Password' }),
    )

    await waitFor(() => {
      expect(bodies).toEqual([{ password: FIXTURE_NEW_PASSWORD }])
    })
    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toHaveValue('')
    })
  })

  it('refuses an empty password with the required-field copy', async () => {
    renderProfile()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Update Password' }),
    )

    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })
})
