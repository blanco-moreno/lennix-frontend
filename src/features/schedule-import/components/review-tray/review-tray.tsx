/** "Review this (N)" — one card per unresolved parser exception; renders nothing for a clean import. */

import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Card, Heading, Text } from '@/components'
import type { ScheduleReviewState } from '@/types'

import { PredecessorPickerCard } from './components/predecessor-picker-card'
import { UnclassifiedBinCard } from './components/unclassified-bin-card'
import { countBlocking, type ReviewException } from './review-exceptions'
import { reviewTrayMessages as m } from './review-tray-messages'

export interface ReviewTrayProps {
  projectId: string
  state: ScheduleReviewState
  exceptions: ReviewException[]
  onDiscardRow: (rowId: string) => void
  /** Highlighted when the receipt's "things to check" number is active. */
  highlighted?: boolean
}

export function ReviewTray({
  projectId,
  state,
  exceptions,
  onDiscardRow,
  highlighted = false,
}: ReviewTrayProps) {
  const intl = useIntl()

  if (exceptions.length === 0) return null

  const blocking = countBlocking(exceptions)

  return (
    <Card
      borderColor={highlighted ? 'complementary' : 'border'}
      data-testid="review-tray"
      data-highlighted={highlighted ? 'true' : 'false'}
    >
      <Stack gap="section">
        <Stack gap={1}>
          <Heading size="h4" color="primary">
            {intl.formatMessage(m.title, { count: exceptions.length })}
          </Heading>
          <Text
            size="sm"
            color={blocking > 0 ? 'warning' : 'muted'}
            weight={blocking > 0 ? 'medium' : 'normal'}
          >
            {blocking > 0
              ? intl.formatMessage(m.blocking, { count: blocking })
              : intl.formatMessage(m.optionalNote)}
          </Text>
        </Stack>

        <Stack gap={4}>
          {exceptions.map((exception) => {
            if (exception.kind === 'unclassified_row') {
              return (
                <UnclassifiedBinCard
                  key={exception.id}
                  projectId={projectId}
                  exception={exception}
                  phases={state.tasks}
                  onDiscard={onDiscardRow}
                />
              )
            }
            return (
              <PredecessorPickerCard
                key={exception.id}
                projectId={projectId}
                exception={exception}
                tasks={state.tasks}
              />
            )
          })}
        </Stack>

        <Text size="sm" color="muted">
          {intl.formatMessage(m.floorNote)}
        </Text>
      </Stack>
    </Card>
  )
}
