import { useMediaQuery } from '@chakra-ui/react'

import { ganttMetrics, type GanttMetrics } from '../../gantt-geometry'

/**
 * The chart's row scale, chosen by the pointer rather than by the screen.
 *
 * `(pointer: coarse)` and not a breakpoint on purpose: what decides whether a
 * 14px bar is reachable is the finger, not the width. A tablet in landscape is
 * as wide as a laptop and is still operated by hand, and a touchscreen laptop
 * lands on the same answer for the same reason.
 */
export function useGanttMetrics(): GanttMetrics {
  const [coarsePointer] = useMediaQuery(['(pointer: coarse)'], {
    fallback: [false],
  })
  return ganttMetrics(coarsePointer)
}
