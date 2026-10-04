/**
 * The confirm step's summary: what go-live will record, told with the same
 * pieces the earlier steps used — the schedule's facts line and the budget
 * balance — so nothing here reads differently from where it was decided.
 *
 * It carries no button. Activate lives in the wizard's nav, where every other
 * step's primary action lives.
 */

import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Text } from '@/components'
import type { PlanQuotaFailure, ReviewTask } from '@/types'

import type { AllocationSummary } from '../../project-details-draft'
import { AllocationBalance } from '../allocation-balance'
import { PlanQuotaNotice } from '../plan-quota-notice'
import { ScheduleFacts } from '../schedule-facts'

import { confirmSummaryMessages as m } from './confirm-summary-messages'

export interface ConfirmSummaryProps {
  tasks: ReviewTask[]
  dependencyCount: number
  /** The split as the budget step left it — what go-live writes. */
  allocation: AllocationSummary
  quotaFailure?: PlanQuotaFailure | null
  failed?: boolean
}

export function ConfirmSummary({
  tasks,
  dependencyCount,
  allocation,
  quotaFailure = null,
  failed = false,
}: ConfirmSummaryProps) {
  const intl = useIntl()

  return (
    <Stack gap={5} data-testid="confirm-summary">
      <ScheduleFacts tasks={tasks} dependencyCount={dependencyCount} />
      <AllocationBalance allocation={allocation} />

      {quotaFailure && <PlanQuotaNotice failure={quotaFailure} />}

      {failed && (
        <Text size="sm" color="error">
          {intl.formatMessage(m.activateFailed)}
        </Text>
      )}
    </Stack>
  )
}
