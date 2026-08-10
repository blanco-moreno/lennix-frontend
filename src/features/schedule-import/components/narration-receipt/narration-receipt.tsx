/**
 * The narration receipt — the import's one honest header.
 *
 * No simulated pipeline, no progress that means nothing: a checkable
 * statement of what Lennix read — counts, the span, the section names quoted
 * verbatim from their own file, and how many decisions were made on their
 * behalf. Every number is a button: the receipt is the way into the detail, so
 * a claim can always be opened rather than merely trusted.
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { FileSpreadsheet } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Badge, Heading, Text } from '@/components'
import { parseDay } from '@/utils'

import { useTrustCopy } from '../../hooks/use-trust-copy'

import { ReceiptNumber } from './components/receipt-number'
import type { ImportNarration, NarrationFocus } from './narration'
import { narrationReceiptMessages as m } from './narration-receipt-messages'

export interface NarrationReceiptProps {
  narration: ImportNarration
  activeFocus?: NarrationFocus | null
  onFocus?: (focus: NarrationFocus) => void
}

export function NarrationReceipt({
  narration,
  activeFocus = null,
  onFocus,
}: NarrationReceiptProps) {
  const intl = useIntl()
  const sheetReason = useTrustCopy().sheetReason(narration.sheetEvidence)

  const monthYear = (value: string) =>
    intl.formatDate(parseDay(value), { month: 'short', year: 'numeric' })

  const rangeLabel =
    narration.startDate && narration.endDate
      ? intl.formatMessage(m.dateRange, {
          start: monthYear(narration.startDate),
          end: monthYear(narration.endDate),
        })
      : intl.formatMessage(m.noDates)

  return (
    // A strip, not a card. It is a statement of fact the user reads once and
    // then works below: given the weight of a tinted card it competed with the
    // tray, which is the surface that actually asks them for something.
    <Stack
      gap={4}
      p="card"
      rounded="xl"
      borderWidth="1px"
      borderColor="border"
      bg="bg.panel"
      data-testid="narration-receipt"
    >
      <Flex
        align={{ base: 'flex-start', lg: 'center' }}
        justify="space-between"
        gap={4}
        wrap="wrap"
        direction={{ base: 'column', lg: 'row' }}
      >
        <Flex align="center" gap={2.5} minW={0}>
          <Box
            as={FileSpreadsheet}
            boxSize={5}
            color="primary"
            flexShrink={0}
          />
          <Heading size="h5" color="primary">
            {intl.formatMessage(m.readFrom, {
              fileName: narration.fileName ?? '—',
            })}
          </Heading>
          {narration.sheet && (
            <Badge variant="gray" flexShrink={0}>
              {intl.formatMessage(m.sheetUsed, { sheet: narration.sheet })}
            </Badge>
          )}
        </Flex>

        {/* The numbers ride the same line as the file on a wide screen: they
            are the same sentence, and stacking them made the receipt three
            times taller than what it says. */}
        <Flex gap={2} wrap="wrap">
          <ReceiptNumber
            label={intl.formatMessage(m.tasks, {
              count: narration.activityCount,
            })}
            focus="activities"
            isActive={activeFocus === 'activities'}
            onFocus={onFocus}
          />
          <ReceiptNumber
            label={
              narration.phaseCount > 0
                ? intl.formatMessage(m.phases, { count: narration.phaseCount })
                : intl.formatMessage(m.noPhases)
            }
            focus="phases"
            isActive={activeFocus === 'phases'}
            onFocus={onFocus}
          />
          <ReceiptNumber
            label={rangeLabel}
            focus="dates"
            isActive={activeFocus === 'dates'}
            onFocus={onFocus}
          />
          <ReceiptNumber
            label={
              narration.caveatCount > 0
                ? intl.formatMessage(m.caveats, {
                    count: narration.caveatCount,
                  })
                : intl.formatMessage(m.nothingToCheck)
            }
            focus="caveats"
            isActive={activeFocus === 'caveats'}
            tone={narration.caveatCount > 0 ? 'warning' : 'default'}
            onFocus={onFocus}
          />
        </Flex>
      </Flex>

      {narration.phaseNames.length > 0 && (
        <Flex gap={2} align="baseline" wrap="wrap">
          {/* The label is a sentence, not a chip: uppercased and tracked out
              it is long, and holding its full width beside the names left
              them a sliver. Below `md` it takes its own line instead. */}
          <Text
            size="xs"
            color="muted"
            weight="semibold"
            textTransform="uppercase"
            letterSpacing={{ md: '0.06em' }}
            w={{ base: 'full', md: 'auto' }}
            flexShrink={0}
          >
            {intl.formatMessage(m.phaseNamesLabel)}
          </Text>
          {/* Quoted, never re-titled: the user has to recognize their own
              file in the receipt for it to be worth anything. */}
          <Text size="sm" color="primary">
            {narration.phaseNames.map((name) => `“${name}”`).join(' · ')}
          </Text>
        </Flex>
      )}

      {narration.collapsedRows > 0 && (
        <Text size="xs" color="warning" data-testid="collapsed-rows-notice">
          {intl.formatMessage(m.collapsedRows, {
            count: narration.collapsedRows,
            depth: narration.maxSourceDepth,
          })}
        </Text>
      )}

      {(sheetReason || narration.editedCount > 0) && (
        <Text size="xs" color="muted">
          {[
            sheetReason,
            narration.editedCount > 0
              ? intl.formatMessage(m.editedRows, {
                  count: narration.editedCount,
                })
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      )}
    </Stack>
  )
}
