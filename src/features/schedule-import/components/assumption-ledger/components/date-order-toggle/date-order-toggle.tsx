/** One-flip day/month reversal for a whole date column; pinned rows survive and are reported. */

import { Stack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Text } from '@/components'
import { useUpdateReviewRowMutation } from '@/services/schedule-import'
import type { ReviewTask } from '@/types'

import { useReviewJournal } from '../../../review-tray'
import { assumptionLedgerMessages as m } from '../../assumption-ledger-messages'
import {
  flipKey,
  planDateOrderFlip,
  type DateColumn,
} from '../../date-order-flip'

/** Small enough to keep the API honest, large enough to finish a big column. */
const BATCH_SIZE = 5

export interface DateOrderToggleProps {
  projectId: string
  tasks: ReviewTask[]
  column: DateColumn
}

interface FlipOutcome {
  applied: number
  failed: number
}

export function DateOrderToggle({
  projectId,
  tasks,
  column,
}: DateOrderToggleProps) {
  const intl = useIntl()
  const [progress, setProgress] = useState<{ done: number; total: number }>()
  const [outcome, setOutcome] = useState<FlipOutcome>()
  const [updateReviewRow] = useUpdateReviewRowMutation()
  const [journal, { toggleFlipped }] = useReviewJournal(projectId)

  const flipOwned = useMemo(
    () => new Set(journal.flippedRows),
    [journal.flippedRows],
  )
  const plan = useMemo(
    () => planDateOrderFlip(tasks, column, flipOwned),
    [tasks, column, flipOwned],
  )

  const running = progress !== undefined

  const applyFlip = async () => {
    setOutcome(undefined)
    setProgress({ done: 0, total: plan.edits.length })

    let applied = 0
    let failed = 0
    const written: string[] = []

    for (let index = 0; index < plan.edits.length; index += BATCH_SIZE) {
      const batch = plan.edits.slice(index, index + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(async (edit) =>
          updateReviewRow({
            projectId,
            level: edit.level,
            id: edit.id,
            body: { [edit.field]: edit.to },
          }).unwrap(),
        ),
      )
      results.forEach((result, offset) => {
        if (result.status === 'fulfilled') {
          applied += 1
          written.push(flipKey(column, batch[offset].id))
        } else {
          failed += 1
        }
      })
      setProgress({ done: applied + failed, total: plan.edits.length })
    }

    // Only the rows that actually landed change hands: a failed write is still
    // the parser's reading, and must stay flippable.
    if (written.length > 0) toggleFlipped(written)

    setProgress(undefined)
    setOutcome({ applied, failed })
  }

  return (
    <Stack gap={2} data-testid="date-order-toggle">
      {plan.edits.length === 0 ? (
        <Text size="xs" color="muted">
          {intl.formatMessage(m.flipNothing)}
        </Text>
      ) : (
        <Button
          size="sm"
          variant="outline"
          alignSelf="flex-start"
          disabled={running}
          onClick={applyFlip}
        >
          {running
            ? intl.formatMessage(m.flipping, {
                done: progress.done,
                total: progress.total,
              })
            : intl.formatMessage(m.flipAction)}
        </Button>
      )}

      {plan.settled > 0 && (
        <Text size="xs" color="muted">
          {intl.formatMessage(m.settled, { count: plan.settled })}
        </Text>
      )}

      {outcome && outcome.applied > 0 && (
        <Text size="xs" color="muted">
          {intl.formatMessage(m.flipDone, { count: outcome.applied })}
        </Text>
      )}

      {outcome && outcome.failed > 0 && (
        <Text size="xs" color="error">
          {intl.formatMessage(m.flipFailed, { count: outcome.failed })}
        </Text>
      )}

      {outcome && plan.conflicts.length > 0 && (
        <Stack gap={1} data-testid="flip-conflicts">
          <Text size="xs" color="warning">
            {intl.formatMessage(m.conflicts, {
              count: plan.conflicts.length,
            })}
          </Text>
          {plan.conflicts.map((conflict) => (
            <Text key={conflict.id} size="xs" color="muted">
              {intl.formatMessage(m.conflictRow, {
                title: conflict.title,
                current: conflict.current,
                wouldBecome: conflict.wouldBecome,
              })}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
