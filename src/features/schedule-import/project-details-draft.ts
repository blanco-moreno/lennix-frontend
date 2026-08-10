/**
 * Form state for the optional project fields. An untouched field is never sent:
 * `ExecuteImportRequest` (ms-bk `app/projects/views.py`) applies each optional
 * field only when it arrives non-null, so absence means "keep the import's value".
 */

import type {
  ProjectActivationDetails,
  ReviewProject,
  ReviewTask,
  TaskBudgetAllocation,
} from '@/types'

/** The fields as the form holds them — money included, as typed. */
export interface ProjectDetailsDraft {
  name: string
  description: string
  location: string
  budget: string
  /** The split across main tasks, keyed by task id and held as typed. */
  taskBudgets: Record<string, string>
}

/** Defaults are the draft's own values: the file's name, and no invention. */
export function draftFromProject(
  project: ReviewProject,
  tasks: ReviewTask[] = [],
): ProjectDetailsDraft {
  return {
    name: project.name,
    description: project.description ?? '',
    location: project.location ?? '',
    budget: project.budget === null ? '' : String(project.budget),
    taskBudgets: Object.fromEntries(
      tasks.map((task) => [
        task.id,
        task.budget === null ? '' : String(task.budget),
      ]),
    ),
  }
}

function parseBudget(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/**
 * The subset go-live should carry — empty for anyone who never opened the panel.
 *
 * Clearing a text field is a real intent (the user emptied something the import
 * wrote), so `''` travels for `description` and `location`. The name never does:
 * a project without a name is not an edit, it is a broken record. An emptied
 * budget also stays home — the contract has no way to express "unset it", and
 * silently sending `0` would read as "this obra costs nothing".
 */
export function buildProjectDetails(
  project: ReviewProject,
  draft: ProjectDetailsDraft,
): ProjectActivationDetails {
  const details: ProjectActivationDetails = {}

  const name = draft.name.trim()
  if (name !== '' && name !== project.name) {
    details.name = name
  }

  const description = draft.description.trim()
  if (description !== (project.description ?? '')) {
    details.description = description
  }

  const location = draft.location.trim()
  if (location !== (project.location ?? '')) {
    details.location = location
  }

  const budget = parseBudget(draft.budget)
  if (budget !== null && budget !== project.budget) {
    details.budget = budget
  }

  return details
}

/**
 * The split, reduced to what actually moved.
 *
 * Same rule as every other field: an untouched amount stays home. A *cleared*
 * one does too — the contract has no way to say "unset this", and sending `0`
 * would tell the obra the activity costs nothing.
 *
 * This no longer rides along with go-live: the budget step writes it through
 * `PATCH /task-budgets`, which is all-or-nothing and rejects an id the draft
 * does not own. Splitting the budget is a save, not a side effect of Activate.
 */
export function buildTaskBudgets(
  draft: ProjectDetailsDraft,
  tasks: ReviewTask[],
): TaskBudgetAllocation[] {
  const allocations: TaskBudgetAllocation[] = []
  for (const task of tasks) {
    const budget = parseBudget(draft.taskBudgets[task.id] ?? '')
    if (budget !== null && budget !== task.budget) {
      allocations.push({ task_id: task.id, budget })
    }
  }
  return allocations
}

/**
 * What the split adds up to, and what the project has left for it.
 *
 * Read from the draft rather than from the saved project, so the totals answer
 * the question the user is actually asking while typing: what will go live if I
 * click Activate now. A task the user has not touched still counts — its
 * imported amount is going live too.
 */
export interface AllocationSummary {
  /** The sum every main task carries at go-live. */
  assigned: number
  /** Budget minus assigned. `null` when the project has no budget to split. */
  unassigned: number | null
  /** The split exceeds the budget — stated, never blocking. */
  overrun: boolean
}

export function summarizeAllocation(
  project: ReviewProject,
  draft: ProjectDetailsDraft,
  tasks: ReviewTask[],
): AllocationSummary {
  const assigned = tasks.reduce((total, task) => {
    const typed = parseBudget(draft.taskBudgets[task.id] ?? '')
    return total + (typed ?? task.budget ?? 0)
  }, 0)

  const budget = parseBudget(draft.budget) ?? project.budget
  if (budget === null) {
    return { assigned, unassigned: null, overrun: false }
  }
  return { assigned, unassigned: budget - assigned, overrun: assigned > budget }
}

/** How many fields go-live would change — the panel's "you edited this" count. */
export function countProjectDetailChanges(
  project: ReviewProject,
  draft: ProjectDetailsDraft,
  tasks: ReviewTask[] = [],
): number {
  return (
    Object.keys(buildProjectDetails(project, draft)).length +
    // Each re-budgeted activity is its own change: collapsing them into one
    // key would report a five-activity split as a single edit.
    buildTaskBudgets(draft, tasks).length
  )
}
