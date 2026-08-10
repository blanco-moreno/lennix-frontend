import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router'

import { Text } from '@/components'
import {
  buildProjectDetailPath,
  PROJECT_TAB_PARAM,
  SCHEDULE_TASK_PARAM,
} from '@/router'
import {
  getDelayIconColor,
  hasBrokenEdge,
  unsatisfiedPredecessors,
} from '@/utils'

import { blockedReasonMessages as m } from './blocked-reason-messages'
import { useProjectEdges } from './use-project-edges'

interface BlockedReasonProps {
  projectId: string
  /** The blocked row — a phase or a subactivity, both live on the same graph. */
  taskId: string
  isBlocked: boolean
  size?: 'xs' | 'sm'
}

/**
 * Why a row is blocked, in one line: the predecessors still holding it, or —
 * when the edge points at a deleted row — that the link is dead, with the way
 * to fix it.
 *
 * One component for every listing that shows a blocked badge, so the reader
 * gets the same sentence on the schedule, the queue and the activity page.
 * It renders nothing while the graph is loading and nothing when the cause is
 * unknown: a wrong "the dependency no longer exists" sends someone re-linking
 * an edge that was never broken.
 */
export function BlockedReason({
  projectId,
  taskId,
  isBlocked,
  size = 'xs',
}: BlockedReasonProps) {
  const intl = useIntl()
  const { edges, isLoading } = useProjectEdges(projectId)

  if (!isBlocked || isLoading) return null

  const blockers = unsatisfiedPredecessors(edges, taskId)
  if (blockers.length > 0) {
    return (
      <Text size={size} {...getDelayIconColor()}>
        <FormattedMessage
          {...m.blockedWaitingOn}
          values={{
            names: blockers
              .map((blocker) => blocker.title)
              .join(intl.formatMessage(m.blockedListSeparator)),
            count: blockers.length,
          }}
        />
      </Text>
    )
  }

  if (!hasBrokenEdge(edges, taskId)) return null

  // The copy asks for a re-link, and the schedule is the only surface that can
  // do one — so it carries the way there, row already selected.
  const relinkPath = `${buildProjectDetailPath(projectId)}?${PROJECT_TAB_PARAM}=schedule&${SCHEDULE_TASK_PARAM}=${taskId}`

  return (
    <Text size={size} {...getDelayIconColor()}>
      <FormattedMessage {...m.blockedByBrokenEdge} />{' '}
      <Text asChild size={size} weight="medium" color="primary">
        <Link to={relinkPath}>
          <FormattedMessage {...m.brokenEdgeAction} />
        </Link>
      </Text>
    </Text>
  )
}
