import { Box } from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Badge } from '@/components/ui'

import { atRiskBadgeMessages as m } from './at-risk-badge-messages'

interface AtRiskBadgeProps {
  /** `at_risk` from the API — permanent provenance, never derived locally. */
  atRisk: boolean
}

/**
 * The permanent at-risk mark.
 *
 * `at_risk` is written by the backend when a force-start request is approved
 * and never clears — not when the blocker completes, not when the activity
 * finishes — so the badge is a fact about the schedule's history, not about
 * its current state.
 */
export function AtRiskBadge({ atRisk }: AtRiskBadgeProps) {
  const intl = useIntl()
  if (!atRisk) return null
  return (
    <Badge variant="warning" title={intl.formatMessage(m.atRiskTooltip)}>
      <Box as={AlertTriangle} boxSize={3} />
      {intl.formatMessage(m.atRiskBadge)}
    </Badge>
  )
}
