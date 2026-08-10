import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { HealthyState } from './healthy-state'

describe('HealthyState', () => {
  it('says plainly that nothing is slipping, and where the full picture is', () => {
    renderWithProviders(<HealthyState />)

    expect(screen.getByText('Nothing is slipping')).toBeInTheDocument()
    expect(
      screen.getByText(
        'No project is delayed or past its target date. Open the project list when you want the full picture.',
      ),
    ).toBeInTheDocument()
  })
})
