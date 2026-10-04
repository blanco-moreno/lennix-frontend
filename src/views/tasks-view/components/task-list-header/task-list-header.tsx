import { FormattedMessage } from 'react-intl'

import { ListHeader } from '@/components'
import { taskGridColumns } from '@/constants'

import { taskListHeaderMessages as m } from './task-list-header-messages'

interface TaskListHeaderProps {
  /**
   * What the fifth column carries. The portfolio list groups by obra, so the
   * useful fact there is who is responsible; the "assigned to me" queue is
   * already one person's, so the useful fact is which obra a row came from.
   */
  context: 'assignee' | 'project'
  /** The listing is still loading, so this is not a table row yet. */
  presentational?: boolean
}

/**
 * The one header of the activity listing. Hidden below `md`, where the rows
 * carry their own labels inline: a column header for columns that are not on
 * screen would be a promise the row does not keep.
 */
export function TaskListHeader({
  context,
  presentational = false,
}: TaskListHeaderProps) {
  // The "assigned to me" queue lists subactivities, which have nothing under
  // them: no row there ever draws a chevron, so no track is reserved for one.
  const expandable = context === 'assignee'

  return (
    <ListHeader
      aria-hidden={presentational || undefined}
      templateColumns={taskGridColumns({ expandable })}
      columns={[
        // The expand track — a chevron labels itself, one row at a time.
        ...(expandable ? [{}] : []),
        { label: <FormattedMessage {...m.columnTask} /> },
        { label: <FormattedMessage {...m.columnProgress} /> },
        { label: <FormattedMessage {...m.columnStatus} /> },
        { label: <FormattedMessage {...m.columnPriority} /> },
        {
          label: (
            <FormattedMessage
              {...(context === 'project' ? m.columnProject : m.columnAssignee)}
            />
          ),
        },
        { label: <FormattedMessage {...m.columnDueDate} /> },
      ]}
    />
  )
}
