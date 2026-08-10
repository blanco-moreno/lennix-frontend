import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { ListRowSkeleton } from '@/components/ui'
import { PROJECT_GRID_COLUMNS, PROJECT_ROW_MIN_H } from '@/constants'
import type { ProjectSubject } from '@/types'

import { ProjectListHeader } from '../project-list-header'
import { ProjectRow } from '../project-row'

interface ProjectTableProps<T extends ProjectSubject> {
  projects: T[]
  /** The listing draws its own loading rows — the caller does not branch. */
  isLoading?: boolean
  skeletonRows?: number
  ariaLabel: string
  /** `drafts` swaps the two per-listing tracks; see `ProjectRow`. */
  context?: 'drafts'
  onRowClick: (project: T) => void
  /** Badges beside the name that only the calling surface knows about. */
  rowMeta?: (project: T) => ReactNode
  rowTestId?: (project: T) => string
  /** Bulk selection; omit to spend no gutter on the leading track. */
  selectedIds?: string[]
  onSelectedChange?: (projectId: string, selected: boolean) => void
}

/**
 * The obra listing — `/projects`, Borradores and the dashboard's attention
 * list are all this table, so they cannot drift apart. It owns its own
 * loading state: the same header over rows on the same column template, which
 * is why nothing moves when the obras land.
 */
export function ProjectTable<T extends ProjectSubject>({
  projects,
  isLoading = false,
  skeletonRows = 5,
  ariaLabel,
  context,
  onRowClick,
  rowMeta,
  rowTestId,
  selectedIds,
  onSelectedChange,
}: ProjectTableProps<T>) {
  const selectable = Boolean(onSelectedChange)

  return (
    <Box
      // While the rows are placeholders this is not yet the table: answering
      // to its accessible name would tell a screen reader — and a test —
      // that the obras are on screen.
      role={isLoading ? 'presentation' : 'table'}
      aria-label={isLoading ? undefined : ariaLabel}
      aria-busy={isLoading || undefined}
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.panel"
    >
      <ProjectListHeader context={context} selectable={selectable} />
      {isLoading ? (
        <ListRowSkeleton
          templateColumns={PROJECT_GRID_COLUMNS}
          minH={PROJECT_ROW_MIN_H}
          count={skeletonRows}
        />
      ) : (
        projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            meta={rowMeta?.(project)}
            data-testid={rowTestId?.(project)}
            onClick={() => onRowClick(project)}
            selected={selectedIds?.includes(project.id)}
            onSelectedChange={
              onSelectedChange
                ? (selected) => onSelectedChange(project.id, selected)
                : undefined
            }
          />
        ))
      )}
    </Box>
  )
}
