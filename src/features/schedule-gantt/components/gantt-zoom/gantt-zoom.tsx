import { Box, Flex } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { ToggleButton } from '@/components'

import { scheduleGanttMessages as m } from '../../schedule-gantt-messages'

/**
 * Horizontal pixels per calendar day, per zoom step. Week is the old default;
 * Month fits a two-year build on one screen; Day is for reading one week's
 * work.
 *
 * `fit` is not a width: the chart measures itself and answers. It exists
 * because the three fixed steps were chosen against a desktop window, and a
 * tablet has two widths depending on how it is being held.
 */
export const ZOOM_DAY_WIDTH = {
  fit: 'fit',
  day: 24,
  week: 8,
  month: 3,
} as const
export type ZoomLevel = keyof typeof ZOOM_DAY_WIDTH

/**
 * The fixed scales, and only those. `fit` sat in this list as a fourth step,
 * which read as a fourth width — it is not one. It answers "show me all of
 * it", a different question from "how wide is a day", so it is its own control
 * next to them rather than one more of them.
 */
const ZOOM_SCALES = ['day', 'week', 'month'] as const

const ZOOM_LABEL = {
  fit: m.zoomFit,
  day: m.zoomDay,
  week: m.zoomWeek,
  month: m.zoomMonth,
} as const

export interface GanttZoomProps {
  value: ZoomLevel
  onChange: (zoom: ZoomLevel) => void
}

/** The chart's zoom control — one look wherever a Gantt is drawn. */
export function GanttZoom({ value, onChange }: GanttZoomProps) {
  const intl = useIntl()

  const zoomButton = (zoom: ZoomLevel) => (
    <ToggleButton
      key={zoom}
      size="sm"
      pressed={value === zoom}
      onClick={() => onChange(zoom)}
    >
      {intl.formatMessage(ZOOM_LABEL[zoom])}
    </ToggleButton>
  )

  return (
    <Flex gap={2} align="center" data-testid="schedule-zoom">
      {zoomButton('fit')}
      <Box w="1px" alignSelf="stretch" bg="border" mx={1} />
      {ZOOM_SCALES.map(zoomButton)}
    </Flex>
  )
}
