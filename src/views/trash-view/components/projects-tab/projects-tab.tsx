import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import {
  useListTrashedProjectsQuery,
  useRestoreTrashedMutation,
} from '@/services/trash'

import type { TrashTabProps } from '../../trash-tab-props'
import { trashMessages as m } from '../../trash-view-messages'
import { TrashList, type TrashRow } from '../trash-list'

export function ProjectsTab({
  onPurge,
  canPurge,
  page,
  onPageChange,
}: TrashTabProps) {
  const intl = useIntl()
  const { data, isLoading } = useListTrashedProjectsQuery({ page })
  const rowsData = data?.items ?? []
  const [restore] = useRestoreTrashedMutation()
  const rows: TrashRow[] = rowsData.map((p) => ({
    id: p.id,
    primary: p.name,
    deletedAt: p.deletedAt,
  }))
  return (
    <TrashList
      kind="project"
      rows={rows}
      isLoading={isLoading}
      onRestore={async (id) => {
        try {
          await restore({ kind: 'project', id }).unwrap()
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
