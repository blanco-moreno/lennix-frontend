/**
 * Route smoke: `/settings/organization` renders the org settings feature with
 * the seeded organization.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_ORGANIZATION } from '@/tests/seed'

import { OrganizationSettingsView } from './organization-settings-view'

describe('OrganizationSettingsView', () => {
  it('renders the seeded organization on its route', async () => {
    renderWithProviders(<OrganizationSettingsView />, {
      store: makeStore(),
      route: PATHS.SETTINGS,
    })

    expect(await screen.findByText(SEED_ORGANIZATION.name)).toBeInTheDocument()
  })
})
