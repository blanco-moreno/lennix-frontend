import { Box, Flex, Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Checkbox, ListRow, Text } from '@/components'
import { useFormatDate } from '@/i18n'

import { TRASH_GRID_COLUMNS } from '../../trash-grid'
import { trashMessages as m } from '../../trash-view-messages'
import type { TrashRow } from '../trash-list'

interface TrashListRowProps {
  row: TrashRow
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  onRestore: () => Promise<void>
  /** Omitted for roles without the purge key — the cell renders restore only. */
  onPurge?: () => void
}

/**
 * One trashed record, one row — the same base shell as the obra and activity
 * listings, with restore/purge where other rows put their actions menu.
 */
export function TrashListRow({
  row,
  selected,
  onSelectedChange,
  onRestore,
  onPurge,
}: TrashListRowProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const deletedAt = row.deletedAt ? formatDate(row.deletedAt) : '—'

  return (
    <ListRow
      templateColumns={TRASH_GRID_COLUMNS}
      bg={selected ? 'bg.muted' : 'bg.panel'}
    >
      <Box role="cell">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelectedChange(!selected)}
          aria-label={intl.formatMessage(m.selectRow, { name: row.primary })}
        />
      </Box>

      <Stack role="cell" gap={0.5} minW={0}>
        <Text as="span" size="sm" weight="medium" title={row.primary}>
          {row.primary}
        </Text>
        {row.secondary && (
          <Text as="span" size="xs" color="muted">
            {row.secondary}
          </Text>
        )}
        {/* Below `md` the date column is gone, so the row says it here. */}
        <Text as="span" size="sm" hideFrom="lg">
          <FormattedMessage {...m.columnDeletedAt} />: {deletedAt}
        </Text>
      </Stack>

      <Box role="cell" hideBelow="lg" minW={0}>
        <Text as="span" size="sm" color="muted">
          {deletedAt}
        </Text>
      </Box>

      {/* Purge is irreversible, so below `md` the pair drops out of the actions
          track onto its own full-width line under the name, half each. */}
      <Flex
        role="cell"
        gridColumn={{ base: '2 / -1', md: 'auto' }}
        pt={{ base: 1, md: 0 }}
        gap={2}
        wrap="wrap"
        justify={{ base: 'stretch', md: 'end' }}
      >
        <Button
          size="sm"
          variant="outline"
          flex={{ base: 1, md: 'none' }}
          onClick={onRestore}
        >
          <FormattedMessage {...m.restoreButton} />
        </Button>
        {onPurge && (
          <Button
            size="sm"
            variant="destructive"
            flex={{ base: 1, md: 'none' }}
            onClick={onPurge}
          >
            <FormattedMessage {...m.purgeButton} />
          </Button>
        )}
      </Flex>
    </ListRow>
  )
}
