import { useGetMeQuery } from '@/services/auth'
import { useListAssignedSubtasksQuery } from '@/services/task'

import type { toTaskQueryArgs } from '../../task-query'

type AssignedSubtasksQuery = ReturnType<typeof toTaskQueryArgs>

/**
 * One page of the caller's own activities across every project. The forwarded
 * filters are listed one by one rather than spread: the endpoint answers a
 * subset of what the list tab does, and no assignee at all — it reads the
 * caller from the token, so there is no way to spell somebody else's queue.
 * Rows carry `projectName`, and `parentTitle` when there is a phase above them
 * — a first-level activity is assignable too, and answers here with none.
 */
export function useAssignedSubtasks({
  page,
  pageSize,
  search,
  status,
  projectId,
  priority,
  risk,
  isBlocked,
  dueBefore,
  dueAfter,
  sortBy,
}: AssignedSubtasksQuery) {
  // `me` is part of the load, not a precondition to it: the queue is skipped
  // until the organization is known, so reporting "not loading" in that window
  // renders the empty state for a beat before the rows arrive.
  const { data: me, isLoading: meLoading } = useGetMeQuery()
  const orgId = me?.organizationId ?? ''

  const { data, isLoading, isFetching, isError } = useListAssignedSubtasksQuery(
    {
      organizationId: orgId,
      page,
      pageSize,
      search,
      status,
      projectId,
      priority,
      risk,
      isBlocked,
      dueBefore,
      dueAfter,
      sortBy,
    },
    { skip: !orgId },
  )

  return {
    subtasks: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? 0,
    isLoading: meLoading || isLoading,
    // The first load is a skeleton; a refetch behind a filter only dims the
    // rows already on screen.
    isFetching,
    isError,
  }
}
