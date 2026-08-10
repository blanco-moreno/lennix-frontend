import { useIntl } from 'react-intl'
import { useLocation } from 'react-router'

import { PATHS } from '@/constants'
import { useBreadcrumbNames } from '@/hooks'
import { buildProjectDetailPath } from '@/router'

import type { BreadcrumbCrumb } from '../../ui/breadcrumb'
import { navMessages } from '../protected-route-layout/protected-route-layout-messages'

import { topbarMessages as m } from './topbar-messages'

export interface PageCrumbs {
  /** Where this page sits, as links. Empty on a top-level section. */
  trail: BreadcrumbCrumb[]
  /** What this page IS — the header's title. */
  title: string | null
}

/**
 * The page's own identity, split into the two things a header shows: where
 * you are (a small trail of links) and what you are looking at (one large
 * title). The title lives here only — a view repeating it as its own `<h1>`
 * prints the same string twice, 60px apart.
 *
 * Names come from the same RTK Query cache the page below is filling, so
 * this costs no extra request once the view has loaded.
 */
export function usePageCrumbs(): PageCrumbs {
  const intl = useIntl()
  const { pathname } = useLocation()
  const { projectId, projectName, taskId, taskName } = useBreadcrumbNames()

  const section = pathname.split('/')[1] ?? ''
  const crumbs: BreadcrumbCrumb[] = []
  const push = (label: string, to?: string) => crumbs.push({ label, to })
  const loading = '…'

  switch (section) {
    case 'dashboard':
      push(intl.formatMessage(navMessages.dashboard))
      break
    case 'projects':
      push(intl.formatMessage(navMessages.projects), PATHS.PROJECTS)
      if (pathname === PATHS.PROJECT_IMPORT) {
        push(intl.formatMessage(navMessages.import))
      } else if (projectId) {
        push(projectName ?? loading, buildProjectDetailPath(projectId))
        // The activity is a page inside the project's address space, so the
        // trail walks back through the project on the way to the list. The
        // "Activities" segment names what kind of thing the leaf is; the
        // project's schedule is where its siblings are listed.
        if (taskId) {
          push(intl.formatMessage(m.tasks), buildProjectDetailPath(projectId))
          push(taskName ?? loading)
        }
      }
      break
    case 'drafts':
      push(intl.formatMessage(navMessages.drafts), PATHS.DRAFTS)
      if (projectId) {
        push(projectName ?? intl.formatMessage(m.draftReview))
      }
      break
    case 'imports':
      push(intl.formatMessage(navMessages.import), PATHS.PROJECT_IMPORT)
      push(intl.formatMessage(m.assistedMapping))
      break
    case 'tasks':
      push(intl.formatMessage(navMessages.tasks), PATHS.TASKS)
      break
    case 'approvals':
      push(intl.formatMessage(navMessages.approvals))
      break
    case 'trash':
      push(intl.formatMessage(navMessages.trash))
      break
    case 'settings': {
      if (pathname.split('/')[2] === 'team') {
        push(intl.formatMessage(navMessages.team))
      } else {
        push(intl.formatMessage(navMessages.settings))
      }
      break
    }
    default:
      break
  }

  // The last crumb is the title; everything before it is the trail. A
  // top-level section is its own title and has no trail at all.
  const title = crumbs.at(-1)?.label ?? null
  return { trail: crumbs.slice(0, -1), title }
}
