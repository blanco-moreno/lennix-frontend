import { useState } from 'react'

import { useListBudgetApprovalsQuery } from '@/services/budget-approval'
import type { BudgetApprovalState } from '@/types'
import { budgetApprovalsMessages as m } from '@/utils'

import { BUDGET_APPROVAL_GRID_COLUMNS } from '../../approval-grids'
import { ApprovalSection } from '../approval-section'

import { BudgetApprovalDecideDialog } from './components/budget-approval-decide-dialog'
import { BudgetApprovalListHeader } from './components/budget-approval-list-header'
import { BudgetApprovalRow } from './components/budget-approval-row'

type StateFilter = BudgetApprovalState | 'all'

/**
 * The budget half of the approvals bandeja.
 *
 * A section, not a screen: budget and force-start decisions are the same kind
 * of work — someone is blocked waiting on a yes or no — so both live under one
 * Aprobaciones home.
 */
interface BudgetApprovalsProps {
  /** A requester's view: their own rows, no decision. */
  readOnly?: boolean
}

export function BudgetApprovals({ readOnly = false }: BudgetApprovalsProps) {
  const [stateFilter, setStateFilter] = useState<StateFilter>('pending')
  const [decideTarget, setDecideTarget] = useState<{
    id: string
    mode: 'approve' | 'reject'
  } | null>(null)

  const { data, isLoading } = useListBudgetApprovalsQuery(
    stateFilter === 'all' ? undefined : { state: stateFilter },
  )
  const rows = data?.items ?? []

  return (
    <ApprovalSection
      stateFilter={stateFilter}
      onStateFilterChange={(v) => setStateFilter(v as StateFilter)}
      filterMessages={{
        all: m.filterAllStates,
        pending: m.filterStatePending,
        approved: m.filterStateApproved,
        rejected: m.filterStateRejected,
      }}
      emptyTitle={m.emptyTitle}
      emptyBody={m.emptyBody}
      isLoading={isLoading}
      rows={rows}
      listLabel={m.bandejaTitle}
      gridColumns={BUDGET_APPROVAL_GRID_COLUMNS}
      header={<BudgetApprovalListHeader readOnly={readOnly} />}
      renderRow={(row) => (
        <BudgetApprovalRow
          key={row.id}
          row={row}
          readOnly={readOnly}
          onDecide={(mode) => setDecideTarget({ id: row.id, mode })}
        />
      )}
    >
      {!readOnly && (
        <BudgetApprovalDecideDialog
          requestId={decideTarget?.id ?? null}
          mode={decideTarget?.mode ?? null}
          onClose={() => setDecideTarget(null)}
        />
      )}
    </ApprovalSection>
  )
}
