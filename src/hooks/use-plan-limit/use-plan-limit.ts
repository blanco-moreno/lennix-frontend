/**
 * The plan's ceilings, as one verdict per countable resource.
 *
 * `GET /organizations/:id/usage` is the single source: every surface that gates
 * a create action reads it through here instead of re-deriving the rule from
 * `currentX`/`maxX` pairs, which is how two screens end up disagreeing about
 * whether a plan is full.
 *
 * The gate is a COURTESY — the backend is the enforcer. `isAtLimit` is false
 * while usage is in flight: "I don't know yet" must never render as "you
 * can't", or the button flickers from blocked to enabled and reads as a bug.
 */

import { useGetMeQuery } from '@/services/auth'
import { useGetOrgUsageQuery } from '@/services/organization'

/** The resources `usage` counts. */
export type PlanLimitResource = 'projects' | 'drafts' | 'members' | 'ai'

export interface PlanLimitState {
  /** Usage has not resolved yet — decide nothing, block nothing. */
  isLoading: boolean
  isAtLimit: boolean
  used: number
  /** `null` means unlimited, never "unknown". */
  max: number | null
}

const UNKNOWN: PlanLimitState = {
  isLoading: true,
  isAtLimit: false,
  used: 0,
  max: null,
}

export function usePlanLimit(resource: PlanLimitResource): PlanLimitState {
  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''

  const { data: usage } = useGetOrgUsageQuery(organizationId, {
    skip: !organizationId,
  })

  if (!usage) return UNKNOWN

  const [used, rawMax] =
    resource === 'members'
      ? [usage.currentTeamSize, usage.maxTeamSize]
      : resource === 'projects'
        ? [usage.currentProjects, usage.maxProjects]
        : resource === 'drafts'
          ? [usage.currentDrafts, usage.maxDrafts]
          : [usage.currentAiRequests, usage.maxAiRequests]

  // The backend spells unlimited as `null` on every `max_*`, and any plan
  // whose overrides say so can be unlimited on any resource. `0` is treated
  // the same way for safety — reading either as "zero allowed" would block
  // every gated button on a plan that has no ceiling at all.
  const max = rawMax !== null && rawMax > 0 ? rawMax : null

  return {
    isLoading: false,
    isAtLimit: max !== null && used >= max,
    used,
    max,
  }
}
