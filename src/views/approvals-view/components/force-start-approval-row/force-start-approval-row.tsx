import { Box, Flex, Stack } from '@chakra-ui/react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge, Button, ListRow, StatusBadge, Text } from '@/components'
import { useFormatDate } from '@/i18n'
import { snapshotTitle } from '@/services/force-start'
import type { ForceStartRequest, ForceStartState } from '@/types'

import { FORCE_START_GRID_COLUMNS } from '../../approval-grids'
import { approvalsMessages as m } from '../../approvals-view-messages'

interface ForceStartApprovalRowProps {
  row: ForceStartRequest
  /** A requester's own row: state only, no decision buttons. */
  readOnly?: boolean
  onDecide: (mode: 'approve' | 'reject') => void
}

/**
 * One force-start request, one row — the same base shell as every other
 * listing. The justification rides under the activity's name, clamped, with
 * the full text on `title`; approving from here still stamps the permanent
 * at-risk mark, so the decide dialog stays the one door to a decision.
 */
export function ForceStartApprovalRow({
  row,
  readOnly = false,
  onDecide,
}: ForceStartApprovalRowProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()

  const isPending = row.state === 'pending' && !readOnly
  const wasBlocked = row.stateSnapshot.is_blocked === true

  const stateLabel = (state: ForceStartState) => {
    if (state === 'approved') return intl.formatMessage(m.filterStateApproved)
    if (state === 'rejected') return intl.formatMessage(m.filterStateRejected)
    return intl.formatMessage(m.filterStatePending)
  }

  return (
    <ListRow templateColumns={FORCE_START_GRID_COLUMNS} py={3}>
      <Stack role="cell" gap={1} minW={0}>
        <Flex align="center" gap={2} wrap="wrap">
          <Badge variant="secondary">
            <FormattedMessage {...m.rowTask} />
          </Badge>
          <Text as="span" size="sm" weight="medium" maxW="full">
            {snapshotTitle(row.stateSnapshot)}
          </Text>
          <StatusBadge
            domain="approval"
            value={row.state}
            label={stateLabel(row.state)}
          />
          {wasBlocked && (
            <Badge variant="gray">{intl.formatMessage(m.rowWasBlocked)}</Badge>
          )}
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

        {/* Below `md` the date column is gone, so the row says it here. */}
        <Text as="span" size="sm" hideFrom="lg">
          {formatDate(row.createdAt)}
        </Text>
      </Stack>

      <Box role="cell" hideBelow="lg" minW={0}>
        <Text as="span" size="sm" color="muted">
          {formatDate(row.createdAt)}
        </Text>
      </Box>

      {isPending ? (
        // At `base` the template is one column, so the actions fall into their
        // own full-width row under the request and split it in half.
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
