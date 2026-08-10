import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Card, Text } from '@/components'
import type { ScheduleReviewState } from '@/types'

import { useTrustCopy } from '../../../../hooks/use-trust-copy'
import { assumptionLedgerMessages as m } from '../../assumption-ledger-messages'
import { type LedgerCause } from '../../ledger-model'
import { DateOrderToggle } from '../date-order-toggle'
import { Provenance } from '../provenance'

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
  const alternative = copy.ledgerAlternative(cause.entry)

  return (
    <Card
      borderColor="warning/40"
      borderLeftWidth="4px"
      borderLeftColor="warning"
      bg="warning/5"
      data-testid="ledger-cause"
      data-consequence="high"
      data-cause={cause.entry.cause}
    >
      <Stack gap="tight">
        <Text size="base" weight="medium" color="primary">
          {intl.formatMessage(m.entry, {
            assumption: copy.ledgerAssumption(cause.entry),
            rows: cause.entry.affectedRows,
          })}
        </Text>

        {alternative && (
          <Text size="xs" color="muted">
            {alternative}
          </Text>
        )}

        {cause.flip && (
          <DateOrderToggle
            projectId={projectId}
            tasks={tasks}
            column={cause.flip.column}
          />
        )}

        <Provenance cause={cause} />
      </Stack>
    </Card>
  )
}
