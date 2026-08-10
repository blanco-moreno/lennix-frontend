import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedOrganizationDTO, seedUserDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import { OrganizationSettingsView } from './organization-settings-view'

/** Role ids: 1 owner, 5 user. */
function renderSettings(roleId = 1) {
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
      roleId,
      organizationId: SEED_ORGANIZATION.id,
    }),
  )
  return renderWithProviders(<OrganizationSettingsView />, {
    store,
    route: PATHS.SETTINGS,
  })
}

describe('OrganizationSettingsView', () => {
  it('renders the seeded organization and its plan for the owner, transfer card included', async () => {
    // Default handlers: /auth/me answers Carlos, the org owner.
    renderSettings()

    expect(await screen.findByText(SEED_ORGANIZATION.name)).toBeInTheDocument()
    // Plan 2 in the seed is Pro; its limits resolve from the plan.
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Maximum team size')).toBeInTheDocument()
    // The owner sees the transfer-ownership card.
    expect(screen.getByText('Current owner')).toBeInTheDocument()
  })

  it('hides the transfer-ownership card from a member who is not the owner', async () => {
    server.use(
      http.get('*/v1/auth/me', () =>
        HttpResponse.json(seedUserDTO(SEED_IDS.USER_ANA_ID)),
      ),
    )

    renderSettings(2)

    expect(await screen.findByText(SEED_ORGANIZATION.name)).toBeInTheDocument()
    expect(screen.queryByText('Transfer ownership')).not.toBeInTheDocument()
  })

  it('shows the creation form to a user without an organization and sends the trimmed name and slug', async () => {
    const bodies: Record<string, unknown>[] = []
    server.use(
      http.get('*/v1/auth/me', () =>
        HttpResponse.json({
          ...seedUserDTO(SEED_IDS.USER_PEDRO_ID),
          plan_id: null,
          organization_id: null,
        }),
      ),
      http.post('*/v1/organizations', async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>)
        return HttpResponse.json(seedOrganizationDTO(), { status: 201 })
      }),
    )

    renderSettings(5)

    expect(await screen.findByText('New Organization')).toBeInTheDocument()
    const submit = screen.getByRole('button', { name: 'Create Organization' })
    // One representative invalid case: nothing typed, the submit stays closed.
    expect(submit).toBeDisabled()

    await userEvent.type(
      screen.getByLabelText('Name'),
      ` ${SEED_ORGANIZATION.name} `,
    )
    await userEvent.type(screen.getByLabelText('Slug'), SEED_ORGANIZATION.slug)
    await userEvent.click(submit)

    await waitFor(() => {
      expect(bodies).toEqual([
        { name: SEED_ORGANIZATION.name, slug: SEED_ORGANIZATION.slug },
      ])
    })
  })
})
