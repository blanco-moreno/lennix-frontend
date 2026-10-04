import { useIntl } from 'react-intl'

import type { ScheduleReviewState } from '@/types'

import { useTrustCopy } from '../../../../hooks/use-trust-copy'
import { TrayCard } from '../../../review-tray/components/tray-card'
import { assumptionLedgerMessages as m } from '../../assumption-ledger-messages'
import { type LedgerCause } from '../../ledger-model'
import { DateOrderToggle } from '../date-order-toggle'
import { Provenance } from '../provenance'

/** A loud ledger cause: what was decided, the other reading, the one flip back. */
export function LoudCause({
  projectId,
  cause,
  tasks,
}: {
  projectId: string
  cause: LedgerCause
  tasks: ScheduleReviewState['tasks']
}) {
  const intl = useIntl()
  const copy = useTrustCopy()

  return (
    <TrayCard
      kind="assumption"
      blocking={false}
      title={intl.formatMessage(m.entry, {
        assumption: copy.ledgerAssumption(cause.entry),
        rows: cause.entry.affectedRows,
      })}
      body={copy.ledgerAlternative(cause.entry)}
    >
      {cause.flip && (
        <DateOrderToggle
          projectId={projectId}
          tasks={tasks}
          column={cause.flip.column}
        />
      )}
      <Provenance cause={cause} />
    </TrayCard>
  )
}
