import { FormattedMessage } from 'react-intl'

import { ListHeader } from '@/components'

import { SUBTASK_GRID_COLUMNS } from '../../subtask-grid'
import { subtaskPanelMessages as m } from '../../subtask-panel-messages'

/**
 * The header row of the subactivity listing — real `columnheader`s over the
 * `cell`s the rows lay out on the same template, so the columns exist for a
 * screen reader and not only on screen. Hidden below `md`, where the rows
 * carry those facts inline.
 */
export function SubtaskListHeader() {
  return (
    <ListHeader
      templateColumns={SUBTASK_GRID_COLUMNS}
      minH="unset"
      columns={[
        { label: <FormattedMessage {...m.columnSubtask} /> },
        { label: <FormattedMessage {...m.columnProgress} /> },
        { label: <FormattedMessage {...m.columnStatus} /> },
        { label: <FormattedMessage {...m.columnPriority} /> },
        { label: <FormattedMessage {...m.columnAssignee} /> },
        { label: <FormattedMessage {...m.columnDates} /> },
        // The last track carries the row's two actions; each button names its
        // own row, so the column itself only exists for the reader.
        { label: <FormattedMessage {...m.columnActions} />, srOnly: true },
      ]}
    />
  )
}
