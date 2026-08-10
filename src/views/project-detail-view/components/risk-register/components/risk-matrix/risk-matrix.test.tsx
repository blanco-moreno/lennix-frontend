/**
 * The 3×3 matrix's cell counts and the nine-cells invariant are pinned through
 * the register (`risk-register.test.tsx`); these cover the selection contract
 * only the component itself owns — which cell a click reports, and that
 * clicking the selected cell clears the filter.
 */

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { RiskMatrix, type RiskMatrixCell } from './risk-matrix'

describe('RiskMatrix', () => {
  it('reports the coordinates of the cell you click', async () => {
    const selected: (RiskMatrixCell | null)[] = []
    renderWithProviders(
      <RiskMatrix
        risks={[]}
        selected={null}
        onSelect={(c) => selected.push(c)}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: '0 risks — probability High, impact Low',
      }),
    )

    expect(selected).toEqual([{ probability: 'high', impact: 'low' }])
  })

  it('marks the selected cell pressed and clears it on a second click', async () => {
    const selected: (RiskMatrixCell | null)[] = []
    renderWithProviders(
      <RiskMatrix
        risks={[]}
        selected={{ probability: 'medium', impact: 'high' }}
        onSelect={(c) => selected.push(c)}
      />,
    )

    const cell = screen.getByRole('button', {
      name: '0 risks — probability Medium, impact High',
    })
    expect(cell).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(cell)

    expect(selected).toEqual([null])
  })
})
