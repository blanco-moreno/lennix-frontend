import { Box, Flex, Stack } from '@chakra-ui/react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge, Button, ListRow, StatusBadge, Text } from '@/components'
import { useFormatDate } from '@/i18n'
import type { BudgetApproval } from '@/types'
import { budgetApprovalsMessages as m } from '@/utils'

import { BUDGET_APPROVAL_GRID_COLUMNS } from '../../../../approval-grids'
import {
  deltaLabel,
  formatAmount,
  snapshotCurrency,
  snapshotName,
} from '../../approval-format'

interface BudgetApprovalRowProps {
  row: BudgetApproval
  /** A requester's own row: state only, no decision buttons. */
  readOnly?: boolean
  onDecide: (mode: 'approve' | 'reject') => void
}

/**
 * One budget request, one row — the same base shell as every other listing.
 * The amounts are columns under the shared header; the justification and the
 * decision comment ride under the name, clamped, with the full text on
 * `title`: what an approver scans is the delta, not the paragraph.
 */
export function BudgetApprovalRow({
  row,
  readOnly = false,
  onDecide,
}: BudgetApprovalRowProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()

  const isPending = row.state === 'pending' && !readOnly
  const currency = snapshotCurrency(row.stateSnapshot)
  const previous = formatAmount(
    row.previousAmount,
    intl.formatMessage(m.noPreviousAmount),
    currency,
  )
  const requested = formatAmount(row.requestedAmount, '', currency)
  const delta = deltaLabel(row.previousAmount, row.requestedAmount, currency)
  const deltaColor = delta.startsWith('+')
    ? 'overBudget'
    : delta.startsWith('-')
      ? 'success'
      : 'muted'

  const stateLabel = intl.formatMessage(
    row.state === 'approved'
      ? m.filterStateApproved
      : row.state === 'rejected'
        ? m.filterStateRejected
        : m.filterStatePending,
  )

  return (
    <ListRow templateColumns={BUDGET_APPROVAL_GRID_COLUMNS} py={3}>
      <Stack role="cell" gap={1} minW={0}>
        <Flex align="center" gap={2} wrap="wrap">
          <Badge variant={row.targetType === 'project' ? 'info' : 'secondary'}>
            <FormattedMessage
              {...(row.targetType === 'project'
                ? m.rowTargetProject
                : m.rowTargetTask)}
            />
          </Badge>
          <Text as="span" size="sm" weight="medium" maxW="full">
            {snapshotName(row.stateSnapshot)}
          </Text>
          <StatusBadge domain="approval" value={row.state} label={stateLabel} />
        </Flex>

        <Text as="span" size="xs" color="muted" title={row.reason}>
          {row.reason}
        </Text>

        {row.decisionComment && (
          <Text as="span" size="xs" color="muted" title={row.decisionComment}>
            <FormattedMessage {...m.decisionCommentLabel} />:{' '}
            {row.decisionComment}
          </Text>
        )}

        {/* Each step drops columns the row then says inline: below `lg` the
            previous amount and the date, below `md` also requested and delta. */}
        <Flex hideFrom="lg" gap={2} wrap="wrap">
          <Text as="span" size="sm">
            {previous}
          </Text>
          <Text as="span" size="sm" hideFrom="lg">
            {`→ ${requested}`}
          </Text>
          {delta && (
            <Text as="span" size="sm" color={deltaColor} hideFrom="lg">
              {delta}
            </Text>
          )}
          <Text as="span" size="sm" color="muted">
            {formatDate(row.createdAt)}
          </Text>
        </Flex>
      </Stack>

      <Box role="cell" hideBelow="lg" minW={0}>
        <Text as="span" size="sm">
          {previous}
        </Text>
      </Box>

      <Box role="cell" hideBelow="lg" minW={0}>
        <Text as="span" size="sm" weight="medium">
          {requested}
        </Text>
      </Box>

      <Box role="cell" hideBelow="lg" minW={0}>
        <Text as="span" size="sm" color={deltaColor}>
          {delta || '—'}
        </Text>
      </Box>

      <Box role="cell" hideBelow="lg" minW={0}>
        <Text as="span" size="sm" color="muted">
          {formatDate(row.createdAt)}
        </Text>
      </Box>

      {isPending ? (
        // At `base` the template is one column, so the actions fall into their
        // own full-width row under the request and split it in half — the two
        // most consequential buttons of the app never share a track with text.
        <Flex
          role="cell"
          gap={2}
          wrap="wrap"
          mt={{ base: 2, md: 0 }}
          justify={{ md: 'end' }}
        >
          <Button
            size="sm"
            flex={{ base: 1, md: 'none' }}
            onClick={() => onDecide('approve')}
          >
            <Box as={CheckCircle2} boxSize={4} mr={1} />
            <FormattedMessage {...m.approveButton} />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            flex={{ base: 1, md: 'none' }}
            onClick={() => onDecide('reject')}
          >
            <Box as={XCircle} boxSize={4} mr={1} />
            <FormattedMessage {...m.rejectButton} />
          </Button>
        </Flex>
      ) : (
        // Decided rows keep the empty track where it exists, or they would be
        // one column short of the header.
        <Box role="cell" hideBelow="lg" />
      )}
    </ListRow>
  )
}
