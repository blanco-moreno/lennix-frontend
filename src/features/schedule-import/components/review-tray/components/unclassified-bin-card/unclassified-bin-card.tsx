/**
 * A row the parser could not place: put it somewhere, or say it was never work.
 *
 * Two outcomes, one widget — a closed set (the phases that exist) plus the
 * honest escape for a row that is a total, a note or a legend. Placing writes a
 * real activity under the chosen phase, so the answer lives on the server and
 * the question does not come back; discarding is remembered locally, because
 * "this was never part of my schedule" leaves nothing behind to re-read.
 */

import { Flex, NativeSelect } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Text } from '@/components'
import { usePlaceReviewRowMutation } from '@/services/schedule-import'
import type { ReviewTask } from '@/types'

import { useTrustCopy } from '../../../../hooks/use-trust-copy'
import {
  unclassifiedRowId,
  type UnclassifiedRowException,
} from '../../review-exceptions'
import { reviewTrayMessages as m } from '../../review-tray-messages'
import { TrayCard } from '../tray-card'

export interface UnclassifiedBinCardProps {
  projectId: string
  exception: UnclassifiedRowException
  /** The phases the row can land under — main tasks, in canvas order. */
  phases: ReviewTask[]
  onDiscard: (rowId: string) => void
}

export function UnclassifiedBinCard({
  projectId,
  exception,
  phases,
  onDiscard,
}: UnclassifiedBinCardProps) {
  const intl = useIntl()
  const copy = useTrustCopy()
  const selectId = useId()
  const [phaseId, setPhaseId] = useState('')
  const [failed, setFailed] = useState(false)
  const [placeReviewRow, { isLoading }] = usePlaceReviewRowMutation()

  const { row } = exception

  const handlePlace = async () => {
    if (!phaseId) return
    setFailed(false)
    try {
      await placeReviewRow({
        projectId,
        taskId: phaseId,
        // The row keeps the file's own words: renaming it here would break the
        // only thread back to the line it came from.
        body: { title: row.text },
      }).unwrap()
    } catch {
      setFailed(true)
    }
  }

  return (
    <TrayCard
      kind={exception.kind}
      blocking={false}
      title={intl.formatMessage(m.unclassifiedTitle, { text: row.text })}
      body={intl.formatMessage(m.placeLabel)}
      meta={intl.formatMessage(m.unclassifiedSource, {
        sheet: row.sheet,
        row: row.row,
        // ms-ai's own token — translated, never printed raw.
        cause: copy.unclassifiedCause(row.cause),
      })}
    >
      <Flex gap={2} wrap="wrap" align="center">
        <NativeSelect.Root size="sm" width={{ base: 'full', sm: '15rem' }}>
          <NativeSelect.Field
            id={selectId}
            aria-label={intl.formatMessage(m.placeLabel)}
            value={phaseId}
            onChange={(event) => setPhaseId(event.currentTarget.value)}
          >
            <option value="">{intl.formatMessage(m.placePlaceholder)}</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.title}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <Button
          size="sm"
          disabled={!phaseId || isLoading}
          onClick={handlePlace}
        >
          {intl.formatMessage(isLoading ? m.working : m.placeAction)}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDiscard(unclassifiedRowId(row))}
        >
          {intl.formatMessage(m.discardAction)}
        </Button>
      </Flex>

      {failed && (
        <Text size="xs" color="error">
          {intl.formatMessage(m.placeFailed)}
        </Text>
      )}
    </TrayCard>
  )
}
