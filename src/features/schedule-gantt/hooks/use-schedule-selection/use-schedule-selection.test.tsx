import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  renderWithProviders,
  SEARCH_TEST_ID,
} from '@/tests/render-with-providers'

import { useScheduleSelection } from './use-schedule-selection'

const rows = [{ id: 'a' }, { id: 'b' }]

function Probe() {
  const { selectedRowId, selectRow } = useScheduleSelection(rows)
  return (
    <>
      <output>{selectedRowId ?? 'none'}</output>
      <button type="button" onClick={() => selectRow('b')}>
        pick b
      </button>
      <button type="button" onClick={() => selectRow(null)}>
        clear
      </button>
    </>
  )
}

const search = () => screen.getByTestId(SEARCH_TEST_ID).textContent

describe('useScheduleSelection', () => {
  it('reads the selected row from the URL, keeping the other params', async () => {
    renderWithProviders(<Probe />, { route: '/review?step=schedule&task=a' })

    expect(screen.getByRole('status')).toHaveTextContent('a')

    await userEvent.click(screen.getByRole('button', { name: 'pick b' }))
    expect(screen.getByRole('status')).toHaveTextContent('b')
    expect(search()).toBe('?step=schedule&task=b')

    await userEvent.click(screen.getByRole('button', { name: 'clear' }))
    expect(screen.getByRole('status')).toHaveTextContent('none')
    expect(search()).toBe('?step=schedule')
  })

  it('selects nothing for an id no loaded row carries', () => {
    renderWithProviders(<Probe />, { route: '/review?task=gone' })

    expect(screen.getByRole('status')).toHaveTextContent('none')
  })
})
