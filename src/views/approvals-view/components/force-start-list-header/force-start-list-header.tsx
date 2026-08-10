import { FormattedMessage } from 'react-intl'

import { ListHeader } from '@/components'

import { FORCE_START_GRID_COLUMNS } from '../../approval-grids'
import { approvalsMessages as m } from '../../approvals-view-messages'

/**
 * The one header of the force-start listing. Hidden below `md`, where the
 * rows carry the request date inline instead of in a column.
 */
export function ForceStartListHeader({
  readOnly = false,
}: {
  /** A requester's view has no decision column to announce. */
  readOnly?: boolean
}) {
  return (
    <ListHeader
      templateColumns={FORCE_START_GRID_COLUMNS}
      columns={[
        { label: <FormattedMessage {...m.columnRequest} /> },
        { label: <FormattedMessage {...m.rowRequestedAt} /> },
        ...(readOnly
          ? []
          : [
              {
                label: <FormattedMessage {...m.columnActions} />,
                srOnly: true,
              },
            ]),
      ]}
    />
  )
}
