import type { Task } from '@/types'

/**
 * Group a page of activities under the obra each belongs to.
 *
 * Grouping only — the project filter belongs to the server (`project_id` on
 * `GET /v1/tasks`): filtering the fetched page would narrow twenty rows while
 * the paginator speaks for the whole organization.
 */
export function groupTasksByProject(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (!acc[t.projectId]) acc[t.projectId] = []
    acc[t.projectId].push(t)
    return acc
  }, {})
}
