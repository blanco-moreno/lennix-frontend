import { VisuallyHidden, type GridProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { ColumnHeader } from '../list-cells'
import { ListRow } from '../list-row'

export interface ListHeaderColumn {
  /**
   * The column's label. Omit for an unlabeled track — a chevron or checkbox
   * that labels itself one row at a time.
   */
  label?: ReactNode
  /**
   * Keep the label for a screen reader but off screen — the actions track,
   * whose icon buttons each already say which row they act on.
   */
  srOnly?: boolean
  /** Passed through to `ColumnHeader` (e.g. right-align an amount column). */
  align?: 'right'
}

export interface ListHeaderProps extends Omit<GridProps, 'columns'> {
  columns: ListHeaderColumn[]
}

/**
 * The one header `row` of a listing — real `columnheader`s over the `cell`s the
 * rows lay out on the same template, so the columns exist for a screen reader
 * and not only on screen. Every listing header (`/tasks`, `/trash`,
 * `/approvals`, the subactivity panel, the draft schedule) is this component
 * plus its own column list; the shared register (hidden below `md`, subtle
 * background, no hover) lives here once.
 */
export function ListHeader({ columns, ...rowProps }: ListHeaderProps) {
  return (
    <ListRow hideBelow="lg" bg="bg.subtle" _hover={undefined} {...rowProps}>
      {columns.map((col, index) =>
        col.srOnly ? (
          <span key={index} role="columnheader">
            <VisuallyHidden>{col.label}</VisuallyHidden>
          </span>
        ) : (
          <ColumnHeader key={index} align={col.align}>
            {col.label}
          </ColumnHeader>
        ),
      )}
    </ListRow>
  )
}
