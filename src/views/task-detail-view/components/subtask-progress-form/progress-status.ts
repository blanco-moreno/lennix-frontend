import type { SubtaskStatus } from '@/types'

/**
 * Mirrors the backend's `update_subtask_progress` rule to preview the outcome:
 * 100 completes, 0 → pending, anything between starts it (`in_progress` is what
 * satisfies an SS/SF dependency). The backend remains the one that decides.
 */
export function deriveStatusFromProgress(
  progress: number,
  currentStatus: SubtaskStatus,
): SubtaskStatus {
  // `cancelled` is left alone: stopping is a decision, not a point on the axis,
  // and only the explicit reopen undoes it.
  if (currentStatus === 'cancelled') return currentStatus
  if (progress >= 100) return 'done'
  if (progress <= 0) return 'todo'
  return 'in_progress'
}
