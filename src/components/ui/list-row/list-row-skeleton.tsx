import type { GridProps } from '@chakra-ui/react'

import { Skeleton } from '../skeleton'

import { ListRow } from './list-row'

interface ListRowSkeletonProps {
  /** The listing's own column template — the same constant its rows pass. */
  templateColumns: GridProps['templateColumns']
  minH?: GridProps['minH']
  count?: number
}

/**
 * A listing's rows, still arriving. Built on the same `ListRow` the real rows
 * are, given the same column template and row height, so the skeleton is that
 * listing rather than a generic stand-in: the gutter, the rules and the row
 * rhythm are the ones about to hold data, and nothing shifts when it lands.
 *
 * The first cell is the widest because the first column is always the name.
 */
export function ListRowSkeleton({
  templateColumns,
  minH,
  count = 5,
}: ListRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, row) => (
        <ListRow
          key={row}
          templateColumns={templateColumns}
          minH={minH}
          _hover={undefined}
          aria-hidden
        >
          <Skeleton h={4} w="70%" />
          <Skeleton h={3} w="50%" hideBelow="lg" />
          <Skeleton h={3} w="40%" hideBelow="lg" />
          <Skeleton h={3} w="55%" hideBelow="lg" />
        </ListRow>
      ))}
    </>
  )
}
