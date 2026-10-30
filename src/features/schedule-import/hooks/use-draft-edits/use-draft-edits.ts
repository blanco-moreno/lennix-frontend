/**
 * Every unsaved edit a draft is carrying, in one place.
 *
 * The header edits the project's identity and the budget step edits its money,
 * but they are one draft of one project — so there is one draft object, one
 * count of what is pending, and **one** Save. A second Save owned by the budget
 * step means "Save and continue later" walks away from changes the user just
 * typed into the step above it.
 *
 * What Save writes:
 *   1. `PUT /v1/projects/{id}` — name, location, description, budget. One call,
 *      and the budget lands before the split that is measured against it.
 *   2. `PATCH /v1/schedule/review/{id}/task-budgets` — the split. All-or-nothing:
 *      one id the draft does not own rejects the batch and nothing is applied.
 *
 * `details` still exists because Save is optional: a user who never pressed it
 * has their identity edits carried by go-live instead.
 */

import { useState } from 'react'

import { useUpdateProjectMutation } from '@/services/project'
import {
  readUnknownReviewTasks,
  useUpdateReviewTaskBudgetsMutation,
} from '@/services/schedule-import'
import type { ReviewProject, ReviewTask } from '@/types'
import type { ProjectUpdateRequestDTO } from '@/types/dto/project-dto'

import {
  buildProjectDetails,
  buildTaskBudgets,
  countProjectDetailChanges,
  draftFromProject,
  type ProjectDetailsDraft,
} from '../../project-details-draft'

export type DraftSaveOutcome =
  | { kind: 'saved' }
  | { kind: 'noop' }
  | { kind: 'failed' }
  | { kind: 'unknown-tasks'; count: number }

export interface UseDraftEditsArgs {
  projectId: string
  project: ReviewProject
  tasks: ReviewTask[]
}

/** Field-for-field equality — the draft is flat apart from `taskBudgets`. */
function sameServerValues(a: ProjectDetailsDraft, b: ProjectDetailsDraft) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Re-seed the untouched fields from the new server values, keep the edited
 * ones. "Untouched" is `draft === previous server value`: it is the only test
 * that survives a refetch landing while a form is open.
 */
function followServer(
  draft: ProjectDetailsDraft,
  previous: ProjectDetailsDraft,
  next: ProjectDetailsDraft,
): ProjectDetailsDraft {
  const take = <
    K extends 'name' | 'description' | 'location' | 'budget' | 'currency',
  >(
    key: K,
  ) => (draft[key] === previous[key] ? next[key] : draft[key])

  const taskBudgets: Record<string, string> = {}
  for (const [taskId, amount] of Object.entries(next.taskBudgets)) {
    const current = draft.taskBudgets[taskId]
    taskBudgets[taskId] =
      current === undefined || current === previous.taskBudgets[taskId]
        ? amount
        : current
  }

  return {
    name: take('name'),
    description: take('description'),
    location: take('location'),
    budget: take('budget'),
    currency: take('currency'),
    taskBudgets,
  }
}

export function useDraftEdits({
  projectId,
  project,
  tasks,
}: UseDraftEditsArgs) {
  const server = draftFromProject(project, tasks)
  const [draft, setDraft] = useState<ProjectDetailsDraft>(server)
  // What the server said last time we looked. The form has to follow it — the
  // wizard mounts before the review state arrives, and a save refetches the
  // state underneath a form that is still open — without throwing away what
  // the user is in the middle of typing. So: a field the draft still agrees
  // with the *previous* server value on is untouched and takes the new one; a
  // field the user changed keeps their value.
  const [lastServer, setLastServer] = useState(server)
  if (!sameServerValues(lastServer, server)) {
    setLastServer(server)
    setDraft((current) => followServer(current, lastServer, server))
  }
  const [outcome, setOutcome] = useState<DraftSaveOutcome | null>(null)
  const [updateProject, { isLoading: isSavingProject }] =
    useUpdateProjectMutation()
  const [saveBudgets, { isLoading: isSavingBudgets }] =
    useUpdateReviewTaskBudgetsMutation()

  const edit = (patch: Partial<ProjectDetailsDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setOutcome(null)
  }

  const details = buildProjectDetails(project, draft)
  const pending = countProjectDetailChanges(project, draft, tasks)

  const save = async (): Promise<DraftSaveOutcome> => {
    const taskBudgets = buildTaskBudgets(draft, tasks)
    if (Object.keys(details).length === 0 && taskBudgets.length === 0) {
      const noop: DraftSaveOutcome = { kind: 'noop' }
      setOutcome(noop)
      return noop
    }
    try {
      if (Object.keys(details).length > 0) {
        const body: ProjectUpdateRequestDTO = {}
        if (details.name !== undefined) body.name = details.name
        if (details.description !== undefined) {
          body.description = details.description
        }
        if (details.location !== undefined) body.location = details.location
        // Money is a string on the project contract, a number on go-live's.
        if (details.budget !== undefined) body.budget = String(details.budget)
        if (details.currency !== undefined) body.currency = details.currency
        await updateProject({ id: projectId, body }).unwrap()
      }
      if (taskBudgets.length > 0) {
        await saveBudgets({ projectId, taskBudgets }).unwrap()
      }
      const saved: DraftSaveOutcome = { kind: 'saved' }
      setOutcome(saved)
      return saved
    } catch (error) {
      const unknown = readUnknownReviewTasks(error)
      const failure: DraftSaveOutcome = unknown
        ? { kind: 'unknown-tasks', count: unknown.taskIds.length }
        : { kind: 'failed' }
      setOutcome(failure)
      return failure
    }
  }

  return {
    draft,
    edit,
    /** What go-live carries for anyone who never pressed Save. */
    details,
    pending,
    save,
    outcome,
    isSaving: isSavingProject || isSavingBudgets,
  }
}
