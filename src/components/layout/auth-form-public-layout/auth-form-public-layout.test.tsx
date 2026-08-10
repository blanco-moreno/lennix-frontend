import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { AuthFormPublicLayout } from './auth-form-public-layout'

describe('AuthFormPublicLayout', () => {
  it('frames the form with the title, description and branding', () => {
    renderWithProviders(
      <AuthFormPublicLayout title="Sign in" description="Welcome back">
        <button type="button">the form</button>
      </AuthFormPublicLayout>,
    )

    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'the form' })).toBeInTheDocument()
    // One line under the logo — the value-point column is gone.
    expect(
      screen.getByText(
        'Schedule, progress and costs for every project, in one place.',
      ),
    ).toBeInTheDocument()
    // Branding: the logo carries the translated tagline as its alt text.
    expect(
      screen.getByAltText('Lennix — Construction control and tracking'),
    ).toBeInTheDocument()
  })

  // The navy ground is the same in both color modes, so the card has to be
  // scoped to dark — otherwise an OS light preference paints navy ink on it.
  it('pins the screen to the dark appearance', () => {
    renderWithProviders(
      <AuthFormPublicLayout title="Sign in" description="Welcome back">
        <button type="button">the form</button>
      </AuthFormPublicLayout>,
    )

    expect(screen.getByText('Sign in').closest('.dark')).not.toBeNull()
  })
})
