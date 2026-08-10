import { parseDay } from '../format/format'

export function calculateTaskDuration(
  startDate?: string | null,
  endDate?: string | null,
) {
  const start = startDate ? parseDay(startDate) : new Date()
  const end = endDate ? parseDay(endDate) : new Date()
  const today = new Date()

  const totalDuration = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  const elapsedDuration = Math.ceil(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  const remainingDuration = Math.max(0, totalDuration - elapsedDuration)

  return {
    startDate: start,
    endDate: end,
    totalDuration,
    elapsedDuration,
    remainingDuration,
  }
}
