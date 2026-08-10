/**
 * How many approvals are waiting on this user. No dedicated endpoint — the two
 * approval lists accept `state=pending`; queries are skipped when the user has
 * no stake in one, so nobody fires a request that would 403.
 *
 * For a decider the count is decisions to make; for a `user` it is their own
 * requests still waiting, which is the same badge answering the same question
 * ("is something of mine stuck?") from the other side of the flow. The scoping
 * is the backend's: it returns only what the caller may see.
 */

import { usePermission } from '@/hooks'
import { useListBudgetApprovalsQuery } from '@/services/budget-approval'
import { useListForceStartRequestsQuery } from '@/services/force-start'

/**
 * How often the badge re-checks.
 *
 * A request is raised by somebody else, so nothing the current user does
 * invalidates the count — without polling it would sit stale. 60s stays well
 * inside the per-path rate limit, and polling pauses while the tab is
 * unfocused.
 */
export const PENDING_APPROVALS_POLL_MS = 60_000

export function usePendingApprovalsCount(): number {
  const canDecideBudget = usePermission('budget.approval.decide')
  const canDecideForceStart = usePermission('forceStart.approval.decide')
  const canRequestBudget = usePermission('budget.edit.request')
  const canRequestForceStart = usePermission('forceStart.request')

  const { data: budget } = useListBudgetApprovalsQuery(
    { state: 'pending' },
    {
      skip: !canDecideBudget && !canRequestBudget,
      pollingInterval: PENDING_APPROVALS_POLL_MS,
      skipPollingIfUnfocused: true,
    },
  )
  const { data: forceStart } = useListForceStartRequestsQuery(
    { state: 'pending' },
    {
      skip: !canDecideForceStart && !canRequestForceStart,
      pollingInterval: PENDING_APPROVALS_POLL_MS,
      skipPollingIfUnfocused: true,
    },
  )

  // `total` is the true count even when the tray holds more than one page.
  return (budget?.total ?? 0) + (forceStart?.total ?? 0)
}
