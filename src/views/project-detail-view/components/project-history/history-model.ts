/** The pure grouping behind the Historial timeline. */

import type { ProjectActivity } from '@/types'
import { toISODay } from '@/utils'

export interface HistoryDay {
  day: string
  entries: ProjectActivity[]
}

/** Newest day first, and newest entry first inside each day. */
export function groupByDay(entries: ProjectActivity[]): HistoryDay[] {
  const days = new Map<string, ProjectActivity[]>()
  for (const entry of entries) {
    const day = toISODay(entry.occurredAt)
    const bucket = days.get(day)
    if (bucket) bucket.push(entry)
    else days.set(day, [entry])
  }
  return [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, dayEntries]) => ({
      day,
      entries: [...dayEntries].sort((a, b) =>
        b.occurredAt.localeCompare(a.occurredAt),
      ),
    }))
}
