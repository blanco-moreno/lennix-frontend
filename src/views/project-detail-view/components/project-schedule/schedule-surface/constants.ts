import type { ScheduleFilter } from '@/features'

import type { scheduleSurfaceMessages as m } from './schedule-surface-messages'

export const FILTER_LABEL: Record<ScheduleFilter, keyof typeof m> = {
  all: 'filterAll',
  critical: 'filterCritical',
  delayed: 'filterDelayed',
  'at-risk': 'filterAtRisk',
}
