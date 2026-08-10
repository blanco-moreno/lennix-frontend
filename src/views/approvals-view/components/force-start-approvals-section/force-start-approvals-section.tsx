import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Alert } from '@/components'
import { useListForceStartRequestsQuery } from '@/services/force-start'
import type { ForceStartState } from '@/types'

import { FORCE_START_GRID_COLUMNS } from '../../approval-grids'
import { approvalsMessages as m } from '../../approvals-view-messages'
import { ApprovalSection } from '../approval-section'
import { ForceStartApprovalRow } from '../force-start-approval-row'
import { ForceStartDecideDialog } from '../force-start-decide-dialog'
import { ForceStartListHeader } from '../force-start-list-header'

type StateFilter = ForceStartState | 'all'

/**
 * The force-start half of the approvals bandeja.
 *
 * Approving here is not a formality: it force-starts the target activity and
 * stamps its permanent at-risk mark, so the row shows the requester's
 * justification and what the task looked like when they asked — the two things
 * an approver actually needs to decide.
 */
interface ForceStartApprovalsSectionProps {
  /** A requester's view: their own rows, no decision. */
  readOnly?: boolean
}

export function ForceStartApprovalsSection({
  readOnly = false,
}: ForceStartApprovalsSectionProps) {
  const intl = useIntl()
  const [stateFilter, setStateFilter] = useState<StateFilter>('pending')
  const [decideTarget, setDecideTarget] = useState<{
    id: string
    mode: 'approve' | 'reject'
  } | null>(null)

  const { data, isLoading, error } = useListForceStartRequestsQuery(
    stateFilter === 'all' ? {} : { state: stateFilter },
  )
  const rows = data?.items ?? []

  return (
    <ApprovalSection
      stateFilter={stateFilter}
      onStateFilterChange={(value) => setStateFilter(value as StateFilter)}
      filterMessages={{
        all: m.filterAllStates,
        pending: m.filterStatePending,
        approved: m.filterStateApproved,
        rejected: m.filterStateRejected,
      }}
      emptyTitle={m.forceStartEmptyTitle}
      emptyBody={m.forceStartEmptyBody}
      isLoading={isLoading}
      rows={rows}
      listLabel={m.tabForceStart}
      gridColumns={FORCE_START_GRID_COLUMNS}
      header={<ForceStartListHeader readOnly={readOnly} />}
      error={
        error ? (
          <Alert variant="error" icon={AlertCircle}>
            {intl.formatMessage(m.forceStartLoadError)}
          </Alert>
        ) : undefined
      }
      renderRow={(row) => (
        <ForceStartApprovalRow
          key={row.id}
          row={row}
          readOnly={readOnly}
          onDecide={(mode) => setDecideTarget({ id: row.id, mode })}
        />
      )}
    >
      {!readOnly && (
        <ForceStartDecideDialog
          requestId={decideTarget?.id ?? null}
          mode={decideTarget?.mode ?? null}
          onClose={() => setDecideTarget(null)}
        />
      )}
    </ApprovalSection>
  )
}
