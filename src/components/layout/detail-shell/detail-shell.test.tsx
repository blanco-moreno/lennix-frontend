import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { DetailShell } from './detail-shell'

describe('DetailShell', () => {
  it('renders the identity card and content in one scaffold', () => {
    renderWithProviders(
      <DetailShell
        description="A tall one"
        meta={<span>Manager: Miguel</span>}
        badges={<span>On track</span>}
        actions={<button type="button">Act</button>}
        headerExtra={<span>75%</span>}
      >
        <div data-testid="page-content" />
      </DetailShell>,
      { route: '/projects/1' },
    )

    expect(screen.getByText('A tall one')).toBeInTheDocument()
    expect(screen.getByText('Manager: Miguel')).toBeInTheDocument()
    expect(screen.getByText('On track')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })
})
