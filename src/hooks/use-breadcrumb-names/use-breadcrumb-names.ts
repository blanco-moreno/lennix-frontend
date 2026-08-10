import { matchPath, useLocation } from 'react-router'

import { PATHS } from '@/constants'
import { useGetProjectQuery } from '@/services/project'
import { useGetTaskQuery } from '@/services/task'

/**
 * The ids and names the global breadcrumb needs, resolved from the current
 * location. `matchPath` against the canonical PATHS, not `useMatches`: the
 * hook renders inside the layout (a pathless route, where `useParams` is
 * empty) and must also work outside a data router.
 *
 * Names come from the same RTK Query cache the page below is filling, so the
 * breadcrumb costs no extra request once the view has loaded.
 */
export function useBreadcrumbNames() {
  const { pathname } = useLocation()

  // `/projects/import` would match `/projects/:projectId` with the literal
  // segment as the id — the static route wins before the dynamic one is read.
  const projectDetail =
    pathname === PATHS.PROJECT_IMPORT
      ? null
      : matchPath(PATHS.PROJECT_DETAIL, pathname)
  const draftReview = matchPath(PATHS.DRAFT_REVIEW, pathname)
  const taskDetail = matchPath(PATHS.TASK_DETAIL, pathname)

  const projectId =
    projectDetail?.params.projectId ??
    draftReview?.params.projectId ??
    taskDetail?.params.projectId
  const taskId = taskDetail?.params.taskId

  const { data: project } = useGetProjectQuery(projectId ?? '', {
    skip: !projectId,
  })
  // The page below already asked for this task, so the name is a cache hit.
  const { data: task } = useGetTaskQuery(taskId ?? '', {
    skip: !taskId,
  })

  return {
    projectId,
    projectName: project?.name,
    taskId,
    taskName: task?.title,
  }
}
