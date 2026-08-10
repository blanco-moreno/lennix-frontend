/** The assumption ledger — what the parser decided, by cause, graded by consequence. */

import { Box, Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Card, Heading, Text } from '@/components'
import type { ScheduleReviewState } from '@/types'

import { useTrustCopy } from '../../hooks/use-trust-copy'

import { assumptionLedgerMessages as m } from './assumption-ledger-messages'
import { LoudCause } from './components/loud-cause'
import { buildLedgerView, leftOutSummary } from './ledger-model'

export interface AssumptionLedgerProps {
  projectId: string
  state: ScheduleReviewState
  /** Highlighted when the receipt's "things to check" number is active. */
  highlighted?: boolean
}

export function AssumptionLedger({
  projectId,
  state,
  highlighted = false,
}: AssumptionLedgerProps) {
  const intl = useIntl()
  const copy = useTrustCopy()
  const { loud, quiet } = buildLedgerView(state)
  const leftOut = leftOutSummary(state)

  if (loud.length === 0 && quiet.length === 0 && leftOut.dropped === 0) {
    return null
  }

  return (
    <Card
      borderColor={highlighted ? 'complementary' : 'border'}
      data-testid="assumption-ledger"
      data-highlighted={highlighted ? 'true' : 'false'}
    >
      <Stack gap="section">
        <Stack gap={1}>
          <Heading size="h4" color="primary">
            {intl.formatMessage(m.title)}
          </Heading>
          <Text size="sm" color="muted">
            {intl.formatMessage(m.subtitle)}
          </Text>
        </Stack>

        {loud.length > 0 && (
          <Stack gap={4}>
            {loud.map((cause) => (
              <LoudCause
                key={`${cause.entry.cause}:${cause.entry.scope}`}
                projectId={projectId}
                cause={cause}
                tasks={state.tasks}
              />
            ))}
          </Stack>
        )}

        {quiet.length > 0 && (
          <Stack gap={2} data-testid="ledger-quiet">
            <Text
              size="xs"
              color="muted"
              weight="semibold"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {intl.formatMessage(m.quietTitle)}
            </Text>
            {quiet.map((cause) => (
              <Text
                key={`${cause.entry.cause}:${cause.entry.scope}`}
                size="sm"
                color="muted"
                data-consequence="cosmetic"
              >
                <Box
                  as="span"
                  display="inline-block"
                  boxSize={1.5}
                  mr={2}
                  rounded="full"
                  bg="fg.subtle"
                />
                {intl.formatMessage(m.entry, {
                  assumption: copy.ledgerAssumption(cause.entry),
                  rows: cause.entry.affectedRows,
                })}
              </Text>
            ))}
          </Stack>
        )}

        {leftOut.dropped > 0 && (
          <Text size="sm" color="muted" data-testid="ledger-left-out">
            {intl.formatMessage(m.leftOut, {
              count: leftOut.dropped,
              // The reasons are ms-ai's own closed vocabulary — translated
              // here, never printed as the `header` / `total` tokens they are.
              reasons: copy.dropReasons(leftOut.reasons),
            })}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
