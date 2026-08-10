import { Box, chakra } from '@chakra-ui/react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { LucideIcon } from 'lucide-react'
import * as React from 'react'

import { EmptyState } from '../empty-state'
import { Skeleton } from '../skeleton'

import { SortIcon } from './components/sort-icon'
import { TableRow } from './components/table-row'

const SortButton = chakra('button')

const SKELETON_ROWS = 5

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /**
   * Draws the table's own skeleton — its real header over placeholder rows —
   * instead of the caller standing a separate loading layout in front of it.
   */
  isLoading?: boolean
  /** Title of the shared `EmptyState` shown when there are no rows. */
  emptyMessage: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
}

function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyMessage,
  emptyDescription,
  emptyIcon,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // TanStack Table's useReactTable is not React Compiler-compatible yet.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Box position="relative" w="full" overflowX="auto">
      <chakra.table w="full" captionSide="bottom" fontSize="sm">
        <chakra.thead
          css={{ '& tr': { borderBottomWidth: '1px', borderColor: 'border' } }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <chakra.th
                  key={header.id}
                  color="fg.default"
                  h={10}
                  px={2}
                  textAlign="left"
                  verticalAlign="middle"
                  fontWeight="medium"
                  whiteSpace="nowrap"
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortButton
                      type="button"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      _hover={{ color: 'fg.default' }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <SortIcon direction={header.column.getIsSorted()} />
                    </SortButton>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </chakra.th>
              ))}
            </TableRow>
          ))}
        </chakra.thead>
        <chakra.tbody css={{ '& tr:last-child': { borderBottomWidth: '0' } }}>
          {isLoading ? (
            // The header above is already the real one, so the rows only have
            // to be this table's rows: the true column count, at row height.
            Array.from({ length: SKELETON_ROWS }).map((_, row) => (
              <TableRow key={row} aria-hidden>
                {columns.map((_column, cell) => (
                  <chakra.td key={cell} p={2} h={11} verticalAlign="middle">
                    <Skeleton h={3.5} w={cell === 0 ? '70%' : '45%'} />
                  </chakra.td>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <chakra.td
                    key={cell.id}
                    p={2}
                    verticalAlign="middle"
                    whiteSpace="nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </chakra.td>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              {/* The same `EmptyState` every listing shows — a table with no
                  rows is not a different kind of nothing. */}
              <chakra.td colSpan={columns.length} p={0}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyMessage}
                  description={emptyDescription}
                />
              </chakra.td>
            </TableRow>
          )}
        </chakra.tbody>
      </chakra.table>
    </Box>
  )
}

export { DataTable }
export type { DataTableProps }
