/**
 * An untouched field is not sent: a PUT of `null` is a change, not a no-op.
 *
 * A phase's dates are never sent at all — they derive from its subactivities,
 * and the task endpoint accepts no dates, so offering them here would render
 * an edit the server drops.
 */

import type { ReviewSubtaskPatch, ReviewTaskPatch } from '@/types'

export interface ReviewRow {
  title: string
  startDate: string | null
  dueDate: string | null
}

export interface ReviewRowDraft {
  title: string
  startDate: string
  dueDate: string
}

export function buildTaskPatch(
  row: ReviewRow,
  draft: ReviewRowDraft,
): ReviewTaskPatch {
  const patch: ReviewTaskPatch = {}
  if (draft.title.trim() && draft.title !== row.title) {
    patch.title = draft.title.trim()
  }
  return patch
}

export function buildSubtaskPatch(
  row: ReviewRow,
  draft: ReviewRowDraft,
): ReviewSubtaskPatch {
  const patch: ReviewSubtaskPatch = buildTaskPatch(row, draft)
  if (draft.startDate !== (row.startDate ?? '')) {
    patch.start_date = draft.startDate || null
  }
  if (draft.dueDate !== (row.dueDate ?? '')) {
    patch.due_date = draft.dueDate || null
  }
  return patch
}
