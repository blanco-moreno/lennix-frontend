import { Stack } from '@chakra-ui/react'
import { ListChecks } from 'lucide-react'
import { useIntl } from 'react-intl'

import {
  EmptyState,
  ListPanel,
  ListToolbar,
  LoadingOverlay,
  Pagination,
} from '@/components'
import { ListFilterBar } from '@/features'
import { useListQueryState } from '@/hooks'

import { useAllTasks } from '../../hooks/use-all-tasks'
import { toTaskQueryArgs } from '../../task-query'
import { tasksViewMessages as m } from '../../tasks-view-messages'
import { TaskOverviewContent } from '../task-overview-content'

/**
 * The portfolio-wide list — every activity of every project, narrowed by the
 * URL. The at-risk lens the hero KPI links to (`?risk=at_risk`) is one of those
 * filters and goes to the server, which answers it over the whole
 * organization. Narrowing the fetched page here instead shows one row while
 * the paginator underneath counts every unfiltered match.
 */
export function ListTabContent() {
  const intl = useIntl()
  const query = useListQueryState('tasks')

  const { tasks, total, totalPages, isLoading, isFetching } = useAllTasks(
    toTaskQueryArgs(query.state),
  )

  // One piece: toolbar (filters + paginator) and the listing share a single
  // card — the same grammar as /projects.
  return (
    <Stack gap="block" pt="section">
      <ListPanel>
        <ListToolbar>
          <ListFilterBar
            surface="tasks"
            query={query}
            searchPlaceholder={intl.formatMessage(m.filterSearchPlaceholder)}
          />
          <Pagination
            page={query.state.page}
            pageSize={query.state.pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={query.setPage}
            onPageSizeChange={query.setPageSize}
          />
        </ListToolbar>

        {/* The rows are rendered as they arrived: no second pass, because
            every filter was answered by the query that fetched them. The
            first load draws the skeleton; a filter only dims what is up. */}
        {/* The listing owns both states: `isLoading` draws its rows, and a
            filter settling over rows already on screen only dims them. */}
        <LoadingOverlay busy={isFetching}>
          {!isLoading && tasks.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title={intl.formatMessage(m.listEmptyTitle)}
              description={intl.formatMessage(m.listEmptyDescription)}
            />
          ) : (
            <TaskOverviewContent tasks={tasks} isLoading={isLoading} />
          )}
        </LoadingOverlay>
      </ListPanel>
    </Stack>
  )
}
