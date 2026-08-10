import { Stack } from '@chakra-ui/react'
import { ClipboardCheck } from 'lucide-react'
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

import { useAssignedSubtasks } from '../../hooks/use-assigned-subtasks'
import { toTaskQueryArgs } from '../../task-query'
import { tasksViewMessages as m } from '../../tasks-view-messages'

import { AssignedSubtaskTable } from './components/assigned-subtask-table'

/**
 * "Assigned to me" — the caller's own activities across every project. Reads
 * the same URL state as the portfolio list, through the same vocabulary, so a
 * filter survives a tab switch and a shared link opens on the same rows.
 */
export function AssignedTabContent() {
  const intl = useIntl()
  const query = useListQueryState('assigned')

  const { subtasks, total, totalPages, isLoading, isFetching } =
    useAssignedSubtasks(toTaskQueryArgs(query.state))

  // One piece: toolbar (filters + paginator) and the listing share a single
  // card — the same grammar as /projects.
  return (
    <Stack gap="block" pt="section">
      <ListPanel>
        <ListToolbar>
          <ListFilterBar
            surface="assigned"
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

        {/* The listing owns both states: `isLoading` draws its rows, and a
            filter settling over rows already on screen only dims them. */}
        <LoadingOverlay busy={isFetching}>
          {!isLoading && subtasks.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title={intl.formatMessage(m.assignedEmptyTitle)}
              description={intl.formatMessage(m.assignedEmptyDescription)}
            />
          ) : (
            <AssignedSubtaskTable subtasks={subtasks} isLoading={isLoading} />
          )}
        </LoadingOverlay>
      </ListPanel>
    </Stack>
  )
}
