/**
 * "N to review" — the band inside the schedule card, one item per open
 * question: a reading with a viable alternative, a row that never landed, a
 * predecessor that matched nothing, the relationships the file did not carry.
 * Renders nothing for a clean import.
 */

import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Button, Heading, Text } from '@/components'
import { usePermission } from '@/hooks'
import type { ScheduleReviewState } from '@/types'

import { useTrustCopy } from '../../hooks/use-trust-copy'
import { LoudCause } from '../assumption-ledger'

import { TrayCard } from './components/tray-card'
import { UnclassifiedBinCard } from './components/unclassified-bin-card'
import {
  allReviewRows,
  countBlocking,
  type ReviewException,
} from './review-exceptions'
import { reviewTrayMessages as m } from './review-tray-messages'

export interface ReviewTrayProps {
  projectId: string
  state: ScheduleReviewState
  exceptions: ReviewException[]
  onDiscardRow: (rowId: string) => void
  /** Opens the row's drawer, where its predecessor question is answered. */
  onOpenRow: (rowId: string) => void
}

export function ReviewTray({
  projectId,
  state,
  exceptions,
  onDiscardRow,
  onOpenRow,
}: ReviewTrayProps) {
  const intl = useIntl()
  const copy = useTrustCopy()
  const canLink = usePermission('project.dependencies.manage')

  if (exceptions.length === 0) return null

  const blocking = countBlocking(exceptions)
  const titles = new Map(
    allReviewRows(state.tasks).map((row) => [row.id, row.title]),
  )

  return (
    <Stack gap="tight" data-testid="review-tray">
      <Stack gap={0.5}>
        <Heading size="h5" color="primary">
          {intl.formatMessage(m.title, { count: exceptions.length })}
        </Heading>
        {blocking > 0 && (
          <Text size="sm" color="warning" weight="medium">
            {intl.formatMessage(m.blocking, { count: blocking })}
          </Text>
        )}
      </Stack>

      {exceptions.map((exception) => {
        switch (exception.kind) {
          case 'assumption':
            return (
              <LoudCause
                key={exception.id}
                projectId={projectId}
                cause={exception.cause}
                tasks={state.tasks}
              />
            )
          case 'unclassified_row':
            return (
              <UnclassifiedBinCard
                key={exception.id}
                projectId={projectId}
                exception={exception}
                phases={state.tasks}
                onDiscard={onDiscardRow}
              />
            )
          case 'unresolved_edge':
            return (
              <TrayCard
                key={exception.id}
                kind={exception.kind}
                blocking={false}
                title={intl.formatMessage(m.edgeTitle, {
                  text:
                    exception.edge.sourceText ?? exception.edge.successorRef,
                  successor:
                    titles.get(exception.successorTaskId) ??
                    exception.edge.successorRef,
                })}
              >
                {canLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    alignSelf="flex-start"
                    onClick={() => onOpenRow(exception.successorTaskId)}
                  >
                    {intl.formatMessage(m.edgeOpen)}
                  </Button>
                )}
              </TrayCard>
            )
          case 'skipped_edges':
            return (
              <TrayCard
                key={exception.id}
                kind={exception.kind}
                blocking={false}
                title={intl.formatMessage(m.skippedTitle, {
                  count: exception.total,
                })}
              >
                <Stack gap={1} data-testid="skipped-edges">
                  {exception.edges.map((edge, index) => (
                    // One cell can state the same relationship twice — a
                    // `duplicate` skip — so the position is part of the key.
                    <Text
                      key={`${edge.sheet}:${edge.row}:${index}`}
                      size="xs"
                      color="muted"
                    >
                      {intl.formatMessage(m.skippedItem, {
                        text: edge.text,
                        sheet: edge.sheet,
                        row: edge.row,
                        reason: copy.skippedEdgeReason(edge.reason),
                      })}
                    </Text>
                  ))}
                  {exception.edges.length < exception.total && (
                    <Text size="xs" color="muted">
                      {intl.formatMessage(m.skippedCapped, {
                        shown: exception.edges.length,
                        total: exception.total,
                      })}
                    </Text>
                  )}
                </Stack>
              </TrayCard>
            )
        }
      })}
    </Stack>
  )
}
