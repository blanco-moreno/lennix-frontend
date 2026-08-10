import { FormattedMessage } from 'react-intl'

import { ListHeader } from '@/components'

import { TRASH_GRID_COLUMNS } from '../../trash-grid'
import { trashMessages as m } from '../../trash-view-messages'

/**
 * The one header of the papelera listing. Hidden below `md`, where the rows
 * carry the deletion date inline instead of in a column.
 */
export function TrashListHeader() {
  return (
    <ListHeader
      templateColumns={TRASH_GRID_COLUMNS}
      columns={[
        // The select track — a checkbox labels itself, one row at a time.
        {},
        { label: <FormattedMessage {...m.columnName} /> },
        { label: <FormattedMessage {...m.columnDeletedAt} /> },
        { label: <FormattedMessage {...m.columnActions} />, srOnly: true },
      ]}
    />
  )
}
