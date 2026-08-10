import type { ListQueryState } from '@/router'
import type { TaskSortBy, TaskStatus } from '@/types'

/**
 * The URL's list state as the task endpoints take it.
 *
 * Both tabs read the same address, so the translation lives once: the list tab
 * uses every field, the assigned queue takes the subset its endpoint answers
 * and ignores the rest (there is no way to spell somebody else's queue, so it
 * never carries an assignee).
 */
export function toTaskQueryArgs(state: ListQueryState) {
  return {
    page: state.page,
    pageSize: state.pageSize,
    search: state.search,
    // Parsing already refused anything this surface cannot mean; the
    // narrowing restates what `parseListQuery` guaranteed.
    status: (state.status as TaskStatus | null) ?? undefined,
    projectId: state.project ?? undefined,
    priority: state.priority ?? undefined,
    assigneeId: state.assignee ?? undefined,
    risk: state.risk ?? undefined,
    isBlocked: state.blocked ?? undefined,
    isOverBudget: state.overBudget ?? undefined,
    isCriticalPath: state.critical ?? undefined,
    dueBefore: state.dueBefore ?? undefined,
    dueAfter: state.dueAfter ?? undefined,
    sortBy: (state.sort as TaskSortBy | null) ?? undefined,
  }
}
