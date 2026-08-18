import { FormattedMessage } from 'react-intl'

import { ColumnHeader, ListRow } from '@/components/ui'
import { projectGridColumns } from '@/constants'

import { projectListHeaderMessages as m } from './project-list-header-messages'

interface ProjectListHeaderProps {
  /**
   * What the two per-listing tracks carry. A live obra reports avance and the
   * days left on its plan; a draft reports how far its review got and how long
   * it has been waiting to be activated.
   */
  context?: 'projects' | 'drafts'
  /** The listing is still loading, so this is not a table row yet. */
  presentational?: boolean
  /**
   * Must match the rows underneath: the selection track exists in both or in
   * neither, or the header stops sitting over the cells it names.
   */
  selectable?: boolean
}

/**
 * The one header of the obra listings — `/projects`, `/drafts` and the
 * dashboard's portfolio health alike. Hidden below `md`, where the rows carry
 * their own labels inline: a column header for columns that are not on screen
 * would be a promise the row does not keep.
 *
 * It is the header `row` of the listing's `role="table"` — the labels are real
 * `columnheader`s over the `cell`s the rows lay out on the same template, so
 * the columns exist for a screen reader and not only on screen.
 */
export function ProjectListHeader({
  context = 'projects',
  selectable = false,
  presentational = false,
}: ProjectListHeaderProps) {
  const isDrafts = context === 'drafts'

  return (
    <ListRow
      // Under a loading table there is no `table` to be the row of yet.
      role={presentational ? 'presentation' : 'row'}
      hideBelow="lg"
      templateColumns={projectGridColumns({ selectable })}
      bg="bg.subtle"
      _hover={undefined}
    >
      {/* The select and identity tracks — a checkbox and a column of initials
          both label themselves. */}
      {selectable && <span role="columnheader" />}
      <span role="columnheader" />
      <ColumnHeader>
        <FormattedMessage {...m.columnProject} />
      </ColumnHeader>
      <ColumnHeader>
        <FormattedMessage {...(isDrafts ? m.columnReview : m.columnProgress)} />
      </ColumnHeader>
      <ColumnHeader>
        <FormattedMessage {...m.columnStatus} />
      </ColumnHeader>
      <ColumnHeader>
        <FormattedMessage
          {...(isDrafts ? m.columnWaiting : m.columnDeadline)}
        />
      </ColumnHeader>
      <ColumnHeader>
        <FormattedMessage {...m.columnBudget} />
      </ColumnHeader>
    </ListRow>
  )
}
