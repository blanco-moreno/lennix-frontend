import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { RoleScopeLegend } from './role-scope-legend'

/**
 * The legend exists so the role column means something. What is pinned is that
 * all four roles are named — a legend missing one is worse than none, because
 * the reader concludes the missing role is the same as its neighbour.
 */
describe('<RoleScopeLegend />', () => {
  it('names every role and says what it reaches', () => {
    renderWithProviders(<RoleScopeLegend />)

    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()

    // The contrast the legend is for: two roles reach the organization, two
    // reach only the obras they are on.
    expect(screen.getAllByText(/the whole organization/i)).toHaveLength(2)
    expect(screen.getAllByText(/only the obras they belong to/i)).toHaveLength(
      2,
    )
  })

  it('says the user asks for approval rather than acting outright', () => {
    renderWithProviders(<RoleScopeLegend />)

    expect(
      screen.getByText(/goes through an approval request/i),
    ).toBeInTheDocument()
  })
})
