import { FormattedMessage } from 'react-intl'

import { ListHeader, type ListHeaderColumn } from '@/components'
import { budgetApprovalsMessages as m } from '@/utils'

import { BUDGET_APPROVAL_GRID_COLUMNS } from '../../../../approval-grids'

const request: ListHeaderColumn = {
  label: <FormattedMessage {...m.columnRequest} />,
}
const previous: ListHeaderColumn = {
  label: <FormattedMessage {...m.rowPreviousAmount} />,
}
const requested: ListHeaderColumn = {
  label: <FormattedMessage {...m.rowRequestedAmount} />,
}
const delta: ListHeaderColumn = { label: <FormattedMessage {...m.rowDelta} /> }
const requestedAt: ListHeaderColumn = {
  label: <FormattedMessage {...m.rowRequestedAt} />,
}
const actions: ListHeaderColumn = {
  label: <FormattedMessage {...m.columnActions} />,
  srOnly: true,
}

/**
 * The header of the budget-approvals listing. Hidden below `md`, where the row
 * is a single column and carries the amounts inline. One header per step of the
 * template: a label must exist only where its track does, or the columns walk.
 */
export function BudgetApprovalListHeader({
  readOnly = false,
}: {
  /** A requester's view has no decision column to announce. */
  readOnly?: boolean
}) {
  const trailing = readOnly ? [] : [actions]
  return (
    <>
      <ListHeader
        hideFrom="lg"
        templateColumns={BUDGET_APPROVAL_GRID_COLUMNS}
        columns={[request, requested, delta, ...trailing]}
      />
      <ListHeader
        hideBelow="lg"
        templateColumns={BUDGET_APPROVAL_GRID_COLUMNS}
        columns={[
          request,
          previous,
          requested,
          delta,
          requestedAt,
          ...trailing,
        ]}
      />
    </>
  )
}
