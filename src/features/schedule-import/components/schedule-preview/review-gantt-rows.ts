/**
 * Review state → the shape the Gantt paints.
 *
 * `buildScheduleRows` reads `Task[]`, which a *live* project has: statuses,
 * progress the engine computed, propagated delay, critical-path flags. A draft
 * has none of that — the engine has not run, because running it is what
 * Activate is for. So the projection is deliberately flat: every row is `todo`,
 * on time, unblocked and off the critical path. Inventing any of those here
 * would draw a red critical path on a schedule nobody has computed.
 *
 * A phase carries no dates of its own (the domain derives them from its
 * subactivities and `ReviewTask` mirrors that), so a phase bar is the span of
 * its children.
 */

import type {
  DependencyNode,
  DependencyNodeTask,
  RelationshipType,
  ReviewDependency,
  ReviewTask,
} from '@/types'
import { RELATIONSHIP_TYPES } from '@/types'

import type { ScheduleRow } from '../../../schedule-gantt'

/** Undated rows sort last, exactly as the live projection sorts them. */
function sortKey(row: { startDate: string | null; dueDate: string | null }) {
  return row.startDate ?? row.dueDate ?? '9999-12-31'
}

function byStart<
  T extends { startDate: string | null; dueDate: string | null },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
}

/** The span a phase covers: its own dates, or its children's when it has none. */
function phaseDates(task: ReviewTask): {
  startDate: string | null
  dueDate: string | null
} {
  if (task.startDate || task.dueDate) {
    return { startDate: task.startDate, dueDate: task.dueDate }
  }
  const starts = task.subtasks
    .map((subtask) => subtask.startDate)
    .filter((day): day is string => day !== null)
    .sort()
  const ends = task.subtasks
    .map((subtask) => subtask.dueDate ?? subtask.startDate)
    .filter((day): day is string => day !== null)
    .sort()
  return { startDate: starts[0] ?? null, dueDate: ends.at(-1) ?? null }
}

const draftRow = (
  base: Pick<ScheduleRow, 'id' | 'parentId' | 'level' | 'title'> & {
    progress: number
    startDate: string | null
    dueDate: string | null
    /** Source-file provenance — what the review is verifying against. */
    ref: string | null
  },
): ScheduleRow => ({
  ...base,
  // Nothing the engine owns is claimed for a draft.
  status: 'todo',
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  isCriticalPath: false,
  assigneeName: null,
  location: null,
  atRisk: false,
  forceStarted: false,
  isOverBudget: false,
})

export function buildReviewScheduleRows(tasks: ReviewTask[]): ScheduleRow[] {
  return byStart(
    tasks.map((task) => ({ ...task, ...phaseDates(task) })),
  ).flatMap((task) => [
    draftRow({
      id: task.id,
      parentId: null,
      level: 'task',
      title: task.title,
      progress: task.progress,
      startDate: task.startDate,
      dueDate: task.dueDate,
      ref: task.ref,
    }),
    ...byStart(task.subtasks).map((subtask) =>
      draftRow({
        id: subtask.id,
        parentId: task.id,
        level: 'subtask',
        // Same breadcrumb the list draws: without it, rows the 2-level collapse
        // made siblings paint as identical bars.
        title:
          subtask.depth > 1
            ? [...subtask.path, subtask.title].join(' › ')
            : subtask.title,
        progress: subtask.progress,
        startDate: subtask.startDate,
        dueDate: subtask.dueDate,
        ref: subtask.ref,
      }),
    ),
  ])
}

const asRelationshipType = (value: string): RelationshipType =>
  RELATIONSHIP_TYPES.includes(value as RelationshipType)
    ? (value as RelationshipType)
    : 'FS'

function nodeTask(row: ScheduleRow): DependencyNodeTask {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: 'normal',
    progress: row.progress,
    startDate: row.startDate,
    dueDate: row.dueDate,
    delayReason: null,
    delayDays: 0,
    isBlocked: false,
    forceStarted: false,
  }
}

/**
 * The edges, drawn between rows the preview actually holds.
 *
 * An edge whose successor is gone is dropped — there is nothing to draw it to.
 * One whose *predecessor* is gone is kept and marked broken: that is a fact
 * about the draft the preview should show, not hide.
 */
export function buildReviewGanttEdges(
  dependencies: ReviewDependency[],
  rows: ScheduleRow[],
): DependencyNode[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  return dependencies.flatMap((edge) => {
    const successor = byId.get(edge.taskId)
    if (!successor) return []
    const predecessor = byId.get(edge.dependsOnId)
    return [
      {
        id: String(edge.id),
        task: nodeTask(successor),
        dependsOn: predecessor ? nodeTask(predecessor) : null,
        relationshipType: asRelationshipType(edge.relationshipType),
        lagDays: edge.lagDays,
        isBroken: predecessor === undefined,
      },
    ]
  })
}
