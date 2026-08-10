import { screen } from '@testing-library/react'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { PublicRouteLayout } from './public-route-layout'

describe('PublicRouteLayout', () => {
  it('renders the routed page with the language switcher on top', async () => {
    renderWithProviders(<PublicRouteLayout />, {
      store: makeStore(),
      route: '/login',
      path: '/login',
    })

    expect(
      await screen.findByRole('button', { name: 'Change language' }),
    ).toBeInTheDocument()
  })
})
