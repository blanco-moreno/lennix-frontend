import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { GanttZoom } from './gantt-zoom'

describe('GanttZoom', () => {
  it('offers week and month, and nothing else', () => {
    renderWithProviders(<GanttZoom value="week" onChange={() => {}} />)

    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Week',
      'Month',
    ])
  })

  it('reports the step the reader picks', async () => {
    const onChange = vi.fn()
    renderWithProviders(<GanttZoom value="week" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Month' }))

    expect(onChange).toHaveBeenCalledWith('month')
  })
})
