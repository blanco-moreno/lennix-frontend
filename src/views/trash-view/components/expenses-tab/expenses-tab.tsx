import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import {
  useListTrashedExpensesQuery,
  useRestoreTrashedMutation,
} from '@/services/trash'
import { formatMoney } from '@/utils'

import type { TrashTabProps } from '../../trash-tab-props'
import { trashMessages as m } from '../../trash-view-messages'
import { TrashList, type TrashRow } from '../trash-list'

export function ExpensesTab({
  onPurge,
  canPurge,
  page,
  onPageChange,
}: TrashTabProps) {
  const intl = useIntl()
  const { data, isLoading } = useListTrashedExpensesQuery({ page })
  const rowsData = data?.items ?? []
  const [restore] = useRestoreTrashedMutation()
  const rows: TrashRow[] = rowsData.map((e) => ({
    id: e.id,
    primary: e.description,
    secondary: formatMoney(e.amount),
    deletedAt: e.deletedAt,
  }))
  return (
    <TrashList
      kind="expense"
      rows={rows}
      isLoading={isLoading}
      onRestore={async (id) => {
        try {
          await restore({ kind: 'expense', id }).unwrap()
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
