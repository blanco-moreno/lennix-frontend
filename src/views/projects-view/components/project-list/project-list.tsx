import { Building2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  EmptyState,
  ListPanel,
  ListToolbar,
  LoadingOverlay,
  Pagination,
  ProjectTable,
} from '@/components'
import { PATHS } from '@/constants'
import { ListFilterBar, PlanLimitButton } from '@/features'
import { useListQueryState, usePermission } from '@/hooks'
import { buildProjectDetailPath } from '@/router'
import { useGetMeQuery } from '@/services/auth'
import { useListProjectsPaginatedQuery } from '@/services/project'
import type { ProjectSortBy, ProjectStatus } from '@/types'

import { projectsViewMessages } from '../../projects-view-messages'

/**
 * The live project list — drafts belong to the Borradores home. Every filter,
 * the sort and the page are query params, so `total` counts the matches, the
 * order is the whole set's order, and the address survives a reload.
 */
export function ProjectList() {
  const intl = useIntl()
  const canCreateProjects = usePermission('project.create')
  const navigate = useNavigate()

  const { data: me } = useGetMeQuery()
  const orgId = me?.organizationId ?? ''

  const query = useListQueryState('projects')
  const { state } = query

  const { data, isLoading, isFetching, error } = useListProjectsPaginatedQuery(
    {
      organizationId: orgId,
      page: state.page,
      pageSize: state.pageSize,
      isDraft: false,
      search: state.search,
      // Parsing already refused anything this surface cannot mean, so the
      // narrowing is a restatement of what `parseListQuery` guaranteed.
      status: (state.status as ProjectStatus | null) ?? undefined,
      priority: state.priority ?? undefined,
      managerId: state.assignee ?? undefined,
      isOverBudget: state.overBudget ?? undefined,
      dueBefore: state.dueBefore ?? undefined,
      dueAfter: state.dueAfter ?? undefined,
      sortBy: (state.sort as ProjectSortBy | null) ?? undefined,
    },
    { skip: !orgId },
  )

  const projects = data?.items ?? []

  // One piece: the toolbar and the listing share a single card, and the
  // toolbar stays mounted through every branch below — a filtered page with
  // no matches still needs its filters on screen to be un-filtered.
  return (
    <ListPanel>
      <ListToolbar>
        <ListFilterBar
          surface="projects"
          query={query}
          searchPlaceholder={intl.formatMessage(
            projectsViewMessages.filterSearchPlaceholder,
          )}
        />
        <Pagination
          page={state.page}
          pageSize={state.pageSize}
          total={data?.total ?? 0}
          totalPages={data?.totalPages ?? 0}
          onPageChange={query.setPage}
          onPageSizeChange={query.setPageSize}
        />
      </ListToolbar>

      {/* `isLoading` is the first load only; keeping the previous page mounted
          while a filter refetches avoids the grid flashing through a full
          skeleton every time a search settles. */}
      {error ? (
        // The same sentence as title and description read as a bug, not as
        // emphasis. One statement, once.
        <EmptyState
          icon={Building2}
          title={intl.formatMessage(projectsViewMessages.listError)}
        />
      ) : !isLoading && projects.length === 0 ? (
        <LoadingOverlay busy={isFetching}>
          <EmptyState
            icon={Building2}
            title={intl.formatMessage(
              query.hasActiveFilters
                ? projectsViewMessages.listEmptyActive
                : projectsViewMessages.listEmptyNoProjects,
            )}
            description={intl.formatMessage(
              query.hasActiveFilters
                ? projectsViewMessages.listEmptyActiveDescription
                : projectsViewMessages.listEmptyNoProjectsDescription,
            )}
            // The first-use empty state IS the onboarding: it points straight
            // at the import wizard instead of describing it. Only for a role
            // that can create, and never over a filtered "no matches".
            actionSlot={
              !query.hasActiveFilters && canCreateProjects ? (
                <PlanLimitButton
                  resource="drafts"
                  onClick={async () => navigate(PATHS.PROJECT_IMPORT)}
                >
                  {intl.formatMessage(projectsViewMessages.listEmptyCta)}
                </PlanLimitButton>
              ) : undefined
            }
          />
        </LoadingOverlay>
      ) : (
        // The listing owns its loading state: `isLoading` is the first load,
        // `isFetching` a filter settling over rows already on screen.
        <LoadingOverlay busy={isFetching}>
          <ProjectTable
            projects={projects}
            isLoading={isLoading}
            skeletonRows={6}
            ariaLabel={intl.formatMessage(projectsViewMessages.title)}
            onRowClick={(project) => {
              void navigate(buildProjectDetailPath(project.id))
            }}
          />
        </LoadingOverlay>
      )}
    </ListPanel>
  )
}
