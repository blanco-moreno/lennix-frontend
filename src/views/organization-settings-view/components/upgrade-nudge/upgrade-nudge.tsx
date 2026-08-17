/**
 * One notice when the plan is running out of room.
 *
 * The trigger is usage, not a sales signal: any resource at its ceiling, or
 * two or more at 80% of it. The copy names the next tier and stops there —
 * there is no self-service upgrade to link to yet.
 */

import { TrendingUp } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Alert } from '@/components'
import { usePlanLimit } from '@/hooks'

import { organizationSettingsViewMessages as m } from '../../organization-settings-view-messages'

/** The tier each plan is nudged towards; the top tier has nowhere to go. */
const NEXT_TIER = {
  Basic: m.upgradeToPro,
  Pro: m.upgradeToEnterprise,
} as const

const NEAR_LIMIT_RATIO = 0.8

export interface UpgradeNudgeProps {
  planName: string
}

export function UpgradeNudge({ planName }: UpgradeNudgeProps) {
  // One verdict per metered resource, off the same hook the meters read — the
  // notice and the bars above it can never disagree.
  const verdicts = [
    usePlanLimit('projects'),
    usePlanLimit('drafts'),
    usePlanLimit('members'),
    usePlanLimit('ai'),
  ]

  const message = NEXT_TIER[planName as keyof typeof NEXT_TIER]
  if (!message) return null

  const isAnyAtLimit = verdicts.some((verdict) => verdict.isAtLimit)
  const nearCount = verdicts.filter(
    ({ used, max }) => max !== null && used / max >= NEAR_LIMIT_RATIO,
  ).length

  if (!isAnyAtLimit && nearCount < 2) return null

  return (
    <Alert icon={TrendingUp}>
      <FormattedMessage {...message} />
    </Alert>
  )
}
