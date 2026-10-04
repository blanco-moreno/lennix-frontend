import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ImportStepper } from './import-stepper'

describe('ImportStepper', () => {
  it('names the four stations exactly once', () => {
    renderWithProviders(<ImportStepper current="schedule" />)

    for (const step of ['upload', 'schedule', 'budget', 'confirm']) {
      expect(screen.getByTestId(`import-step-${step}`)).toBeInTheDocument()
    }
    expect(screen.getAllByTestId('import-stepper')).toHaveLength(1)
  })

  it('keeps every station named, so the phone row only hides them in CSS', () => {
    renderWithProviders(<ImportStepper current="schedule" />)

    for (const name of ['Upload file', 'Schedule', 'Budget', 'Confirm']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('marks what is behind, where you are, and what is ahead', () => {
    renderWithProviders(
      <ImportStepper current="budget" furthest="confirm" onSelect={vi.fn()} />,
    )

    expect(screen.getByTestId('import-step-upload')).toHaveAttribute(
      'data-state',
      'done',
    )
    expect(screen.getByTestId('import-step-budget')).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByTestId('import-step-confirm')).toHaveAttribute(
      'data-state',
      'todo',
    )
  })

  it('refuses a station the draft cannot be at — the nav says why', () => {
    renderWithProviders(
      <ImportStepper
        current="schedule"
        furthest="schedule"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByTestId('import-step-confirm')).toBeDisabled()
  })

  it('navigates to a reachable station', async () => {
    const onSelect = vi.fn()
    renderWithProviders(
      <ImportStepper
        current="confirm"
        furthest="confirm"
        onSelect={onSelect}
      />,
    )

    await userEvent.click(screen.getByTestId('import-step-budget'))
    expect(onSelect).toHaveBeenCalledWith('budget')
  })

  it('navigates nowhere on the upload surface, where there is nowhere to go', () => {
    renderWithProviders(<ImportStepper current="upload" />)

    expect(screen.getByTestId('import-step-upload')).toBeDisabled()
    expect(screen.getByTestId('import-step-schedule')).toBeDisabled()
  })
})
