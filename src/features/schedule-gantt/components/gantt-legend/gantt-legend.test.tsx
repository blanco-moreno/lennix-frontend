import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'
import { RELATIONSHIP_ORDER } from '@/utils'

import { GanttLegend } from './gantt-legend'

describe('GanttLegend', () => {
  it('explains every PDM relationship type the chart can draw', () => {
    renderWithProviders(<GanttLegend />)

    // The dependency legend keys off RELATIONSHIP_ORDER — a new type added
    // to the rule set must show up here or the notation goes unexplained.
    for (const type of RELATIONSHIP_ORDER) {
      expect(
        screen.getByTestId(`dependency-legend-${type}`),
      ).toBeInTheDocument()
    }
    expect(screen.getByTestId('gantt-dependency-legend')).toBeInTheDocument()
  })

  it('pairs each notation badge with its plain-language meaning', () => {
    renderWithProviders(<GanttLegend />)

    // FS is precise and says nothing to a reader who has not met it — the
    // badge alone is not a legend.
    const fs = screen.getByTestId('dependency-legend-FS')
    expect(fs).toHaveTextContent('FS')
    expect(fs).toHaveTextContent('starts when the other finishes')
  })

  it('explains only the open-question mark on a draft', () => {
    renderWithProviders(<GanttLegend scope="draft" />)

    const marks = screen.getByTestId('gantt-marks-legend')
    expect(marks).toHaveTextContent('Open question')
    expect(marks).not.toHaveTextContent('Critical')
  })

  it('never explains the open-question mark on a live chart', () => {
    renderWithProviders(<GanttLegend />)

    expect(screen.getByTestId('gantt-marks-legend')).not.toHaveTextContent(
      'Open question',
    )
  })
})
