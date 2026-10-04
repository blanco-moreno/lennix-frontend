/**
 * The schedule card's header: the file, the sheet, the draft's facts line, the
 * section names quoted verbatim, and — folded away — how the file was
 * interpreted where no other reading was viable. Every claim is checkable
 * against the listing under it.
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { ChevronDown, ChevronRight, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Badge, Button, Heading, Text } from '@/components'
import type { ScheduleReviewState } from '@/types'

import { useTrustCopy } from '../../hooks/use-trust-copy'
import {
  assumptionLedgerMessages,
  buildLedgerView,
  leftOutSummary,
} from '../assumption-ledger'
import { ScheduleFacts } from '../schedule-facts'

import { buildNarration } from './narration'
import { narrationReceiptMessages as m } from './narration-receipt-messages'

export interface NarrationReceiptProps {
  state: ScheduleReviewState
}

export function NarrationReceipt({ state }: NarrationReceiptProps) {
  const intl = useIntl()
  const copy = useTrustCopy()
  const [open, setOpen] = useState(false)
  const narration = buildNarration(state)

  const leftOut = leftOutSummary(state)
  const interpretation = [
    copy.sheetReason(narration.sheetEvidence),
    ...buildLedgerView(state).quiet.map((cause) =>
      intl.formatMessage(assumptionLedgerMessages.entry, {
        assumption: copy.ledgerAssumption(cause.entry),
        rows: cause.entry.affectedRows,
      }),
    ),
    leftOut.dropped > 0
      ? intl.formatMessage(assumptionLedgerMessages.leftOut, {
          count: leftOut.dropped,
          // The reasons are ms-ai's own closed vocabulary — translated here,
          // never printed as the `header` / `total` tokens they are.
          reasons: copy.dropReasons(leftOut.reasons),
        })
      : null,
  ].filter((line): line is string => Boolean(line))

  return (
    <Stack gap="tight" data-testid="narration-receipt">
      <Flex align="center" gap={2.5} wrap="wrap" minW={0}>
        <Box as={FileSpreadsheet} boxSize={5} color="primary" flexShrink={0} />
        <Heading size="h5" color="primary" wordBreak="break-word" minW={0}>
          {narration.fileName ?? '—'}
        </Heading>
        {narration.sheet && (
          <Badge variant="gray" flexShrink={0}>
            {intl.formatMessage(m.sheetUsed, { sheet: narration.sheet })}
          </Badge>
        )}
      </Flex>

      <ScheduleFacts
        tasks={state.tasks}
        dependencyCount={state.dependencies.length}
      />

      {narration.phaseNames.length > 0 && (
        <Text size="sm" color="muted">
          {intl.formatMessage(m.phaseNamesLabel)}{' '}
          {/* Quoted, never re-titled: the user has to recognize their own
              file here for the header to be worth anything. */}
          <Box as="span" color="primary">
            {narration.phaseNames.map((name) => `“${name}”`).join(' · ')}
          </Box>
        </Text>
      )}

      {(narration.collapsedRows > 0 || narration.editedCount > 0) && (
        <Text size="xs" color="muted">
          {narration.collapsedRows > 0 && (
            <span data-testid="collapsed-rows-notice">
              {intl.formatMessage(m.collapsedRows, {
                count: narration.collapsedRows,
                depth: narration.maxSourceDepth,
              })}
            </span>
          )}
          {narration.collapsedRows > 0 && narration.editedCount > 0 && ' · '}
          {narration.editedCount > 0 &&
            intl.formatMessage(m.editedRows, { count: narration.editedCount })}
        </Text>
      )}

      {interpretation.length > 0 && (
        <Stack gap={1}>
          <Button
            size="sm"
            variant="ghost"
            alignSelf="flex-start"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <Box as={open ? ChevronDown : ChevronRight} boxSize={4} />
            {intl.formatMessage(m.interpretation)}
          </Button>
          {open && (
            <Stack gap={1} pl={6} data-testid="receipt-interpretation">
              {interpretation.map((line) => (
                <Text key={line} size="sm" color="muted">
                  {line}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  )
}
