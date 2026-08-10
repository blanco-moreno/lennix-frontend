import { useGetMeQuery } from '@/services/auth'
import { useListOrganizationTasksQuery } from '@/services/task'

import type { toTaskQueryArgs } from '../../task-query'

type AllTasksQuery = ReturnType<typeof toTaskQueryArgs>

/**
 * One page of parent tasks across the user's organization (`GET /v1/tasks`).
 * Every filter, the sort and the page go to the server with the request, so
 * `total` counts the matches and the order is the whole set's order. Rows carry
 * `projectName`, so there is no side lookup.
 */
export function useAllTasks(args: AllTasksQuery) {
  // `me` counts as loading: the query below is skipped until it resolves the
  // organization, so a hook that reported "not loading" in that window made the
  // surface render an empty list for a beat and then replace it.
  const { data: me, isLoading: meLoading } = useGetMeQuery()
  const orgId = me?.organizationId ?? ''

  const {
    data,
    isLoading: tasksLoading,
    isFetching,
  } = useListOrganizationTasksQuery(
    { organizationId: orgId, ...args },
    { skip: !orgId },
  )

  return {
    tasks: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? args.page,
    pageSize: data?.pageSize ?? args.pageSize,
    totalPages: data?.totalPages ?? 0,
    isLoading: meLoading || tasksLoading,
    // The first load is a skeleton; a refetch behind a filter only dims the
    // rows already on screen.
    isFetching,
  }
}
