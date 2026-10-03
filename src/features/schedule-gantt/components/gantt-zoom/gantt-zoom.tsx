import { Flex } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { ToggleButton } from '@/components'

import { scheduleGanttMessages as m } from '../../schedule-gantt-messages'

/**
 * Horizontal pixels per calendar day, per zoom step. Week is the default: it
 * reads a site's working weeks and scrolls through the rest. Month fits a
 * two-year build on one screen.
 *
 * There is no fit-to-width step: a fitted chart crushes a long build on a
 * phone and runs its labels together on a wide screen. Fixed steps keep a
 * readable scale and the chart scrolls horizontally at every width.
 */
export const ZOOM_DAY_WIDTH = {
  week: 8,
  month: 3,
} as const
export type ZoomLevel = keyof typeof ZOOM_DAY_WIDTH

const ZOOM_LABEL = {
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

  return (
    <Flex gap={2} align="center" data-testid="schedule-zoom">
      {(Object.keys(ZOOM_DAY_WIDTH) as ZoomLevel[]).map((zoom) => (
        <ToggleButton
          key={zoom}
          size="sm"
          pressed={value === zoom}
          onClick={() => onChange(zoom)}
        >
          {intl.formatMessage(ZOOM_LABEL[zoom])}
        </ToggleButton>
      ))}
    </Flex>
  )
}
