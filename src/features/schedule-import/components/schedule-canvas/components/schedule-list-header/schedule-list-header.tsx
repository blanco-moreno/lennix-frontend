import { Box } from '@chakra-ui/react'
import { FormattedMessage } from 'react-intl'

import { ColumnHeader, ListRow } from '@/components'

import { DRAFT_GRID_COLUMNS } from '../../draft-grid'
import { scheduleCanvasMessages as m } from '../../schedule-canvas-messages'

/**
 * The one header of the draft schedule listing. Hidden below `md`, where the
 * rows carry their facts inline: a column header for columns that are not on
 * screen would be a promise the row does not keep. Duration arrives one step
 * later than the dates, so it is wrapped rather than listed — `ListHeader`'s
 * column list has no way to say "this track only exists from `lg`", and a
 * header cell more than the row has would slide every column one track over.
 */
export function ScheduleListHeader() {
  return (
    <ListRow
      hideBelow="lg"
      bg="bg.subtle"
      _hover={undefined}
      templateColumns={DRAFT_GRID_COLUMNS}
      minH="unset"
    >
      {/* The expand track and the trailing edit track each label themselves. */}
      <ColumnHeader />
      <ColumnHeader>
        <FormattedMessage {...m.columnTask} />
      </ColumnHeader>
      <ColumnHeader>
        <FormattedMessage {...m.columnDates} />
      </ColumnHeader>
      <Box display={{ base: 'none', lg: 'contents' }}>
        <ColumnHeader>
          <FormattedMessage {...m.columnDuration} />
        </ColumnHeader>
      </Box>
      <ColumnHeader />
    </ListRow>
  )
}
