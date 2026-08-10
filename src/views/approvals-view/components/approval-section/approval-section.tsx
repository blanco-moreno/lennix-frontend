import { Box, Flex, Stack, type GridProps } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'
import { FormattedMessage, useIntl, type MessageDescriptor } from 'react-intl'

import {
  EmptyState,
  Label,
  ListPanel,
  ListToolbar,
  ListRowSkeleton,
  Select,
} from '@/components'

export interface ApprovalSectionFilterMessages {
  all: MessageDescriptor
  pending: MessageDescriptor
  approved: MessageDescriptor
  rejected: MessageDescriptor
}

export interface ApprovalSectionProps<Row> {
  stateFilter: string
  onStateFilterChange: (value: string) => void
  /** Labels for the state filter; `pending` doubles as the filter's label. */
  filterMessages: ApprovalSectionFilterMessages
  emptyTitle: MessageDescriptor
  emptyBody: MessageDescriptor
  isLoading: boolean
  rows: Row[]
  /** The listing's accessible name — its `role="table"` aria-label. */
  listLabel: MessageDescriptor
  /** The listing's column header row, on the section's own template. */
  header: ReactNode
  /** That same template, so the loading rows are this section's rows. */
  gridColumns: GridProps['templateColumns']
  /** Renders one row; the element must carry its own `key`. */
  renderRow: (row: Row) => ReactElement
  /**
   * When set, rendered in place of the loading/empty/rows triad — the
   * force-start section's load-error alert branch.
   */
  error?: ReactNode
  /** Extra content after the list (the decide dialog). */
  children?: ReactNode
}

/**
 * The shared shell of the approvals bandeja sections: one toolbar card with
 * the state filter, then the loading/empty/rows triad as a table — the same
 * listing grammar as `/projects` and `/tasks`. Each section supplies its own
 * header and row renderer on its own column template.
 */
export function ApprovalSection<Row>({
  stateFilter,
  onStateFilterChange,
  filterMessages,
  emptyTitle,
  emptyBody,
  isLoading,
  rows,
  listLabel,
  header,
  gridColumns,
  renderRow,
  error,
  children,
}: ApprovalSectionProps<Row>) {
  const intl = useIntl()

  return (
    // One piece: the state filter and the listing share a single card — the
    // same grammar as /projects.
    <ListPanel>
      <ListToolbar>
        <Flex align="end" gap="tight">
          <Stack gap={1}>
            <Label fontSize="xs" color="fg.muted">
              <FormattedMessage {...filterMessages.pending} />
            </Label>
            <Select
              value={stateFilter}
              onChange={onStateFilterChange}
              options={[
                {
                  value: 'all',
                  label: intl.formatMessage(filterMessages.all),
                },
                {
                  value: 'pending',
                  label: intl.formatMessage(filterMessages.pending),
                },
                {
                  value: 'approved',
                  label: intl.formatMessage(filterMessages.approved),
                },
                {
                  value: 'rejected',
                  label: intl.formatMessage(filterMessages.rejected),
                },
              ]}
            />
          </Stack>
        </Flex>
      </ListToolbar>

      {error ? (
        error
      ) : isLoading ? (
        <Box
          role="presentation"
          aria-busy
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.panel"
        >
          {header}
          <ListRowSkeleton templateColumns={gridColumns} count={3} />
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={intl.formatMessage(emptyTitle)}
          description={intl.formatMessage(emptyBody)}
        />
      ) : (
        // One request per row under one header — the same table grammar as
        // every other listing, instead of a stack of cards.
        <Box
          role="table"
          aria-label={intl.formatMessage(listLabel)}
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.panel"
        >
          {header}
          {rows.map((row) => renderRow(row))}
        </Box>
      )}

      {children}
    </ListPanel>
  )
}
