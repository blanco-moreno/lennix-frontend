import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import {
  useListTrashedTasksQuery,
  useRestoreTrashedMutation,
} from '@/services/trash'

import type { TrashTabProps } from '../../trash-tab-props'
import { trashMessages as m } from '../../trash-view-messages'
import { TrashList, type TrashRow } from '../trash-list'

export function TasksTab({
  onPurge,
  canPurge,
  page,
  onPageChange,
}: TrashTabProps) {
  const intl = useIntl()
  const { data, isLoading } = useListTrashedTasksQuery({ page })
  const rowsData = data?.items ?? []
  const [restore] = useRestoreTrashedMutation()
  const rows: TrashRow[] = rowsData.map((t) => ({
    id: t.id,
    primary: t.title,
    // Product vocabulary: a top-level task is a *phase*, its children are
    // *subactivities*.
    secondary: intl.formatMessage(t.parentId ? m.levelSubtask : m.levelTask),
    deletedAt: t.deletedAt,
  }))
  return (
    <TrashList
      kind="task"
      rows={rows}
      isLoading={isLoading}
      onRestore={async (id) => {
        try {
          await restore({ kind: 'task', id }).unwrap()
          toast.success(intl.formatMessage(m.restoreSuccess), {
            id: m.restoreSuccess.id,
          })
        } catch {
          toast.error(intl.formatMessage(m.restoreError), {
            id: m.restoreError.id,
          })
        }
      }}
      onPurge={onPurge}
      canPurge={canPurge}
      pageInfo={data}
      onPageChange={onPageChange}
    />
  )
}
