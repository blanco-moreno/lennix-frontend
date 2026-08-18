import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { RiskSuggestion } from '@/types'

import { RiskSuggestions } from './risk-suggestions'

/** Shaped like the `/v1/risks/suggestions` payload: delayed critical activities. */
const suggestions: RiskSuggestion[] = [
  {
    taskId: SEED_IDS.P1_TASK_STRUCTURE,
    taskTitle: 'Estructura y obra gruesa',
    delayDays: 5,
    code: 'critical_path_delay',
  },
  {
    taskId: SEED_IDS.P1_TASK_INSTALLATIONS,
    taskTitle: 'Instalaciones',
    delayDays: 1,
    code: 'critical_path_delay',
  },
]

describe('RiskSuggestions', () => {
  it('lists each suggested activity with how late it is', () => {
    renderWithProviders(
      <RiskSuggestions suggestions={suggestions} onRegister={vi.fn()} />,
    )

    expect(screen.getByText('Estructura y obra gruesa')).toBeInTheDocument()
    expect(screen.getByText('5 days late')).toBeInTheDocument()
    // The plural rule holds at one — "1 days late" would read as a bug.
    expect(screen.getByText('Instalaciones')).toBeInTheDocument()
    expect(screen.getByText('1 day late')).toBeInTheDocument()
    // The cause is the backend's closed code, translated here (RSK-3).
    expect(screen.getAllByText('On the critical path')).toHaveLength(2)
  })

  it('renders a code it does not know with a generic cause, not a crash', () => {
    const unknown = {
      ...suggestions[0],
      code: 'burn_rate_divergence' as RiskSuggestion['code'],
    }
    renderWithProviders(
      <RiskSuggestions suggestions={[unknown]} onRegister={vi.fn()} />,
    )

    expect(screen.getByText('Suggested by the schedule')).toBeInTheDocument()
  })

  it('registers nothing on its own — each suggestion waits for its button', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()
    renderWithProviders(
      <RiskSuggestions suggestions={suggestions} onRegister={onRegister} />,
    )

    // System proposes, human decides: one explicit action per suggestion.
    const buttons = screen.getAllByRole('button', { name: 'Register as risk' })
    expect(buttons).toHaveLength(2)
    expect(onRegister).not.toHaveBeenCalled()

    await user.click(buttons[1])
    // The handler gets the title — it prefills the risk form, whose text
    // field is what the register actually stores.
    expect(onRegister).toHaveBeenCalledTimes(1)
    expect(onRegister).toHaveBeenCalledWith('Instalaciones')
  })
})
