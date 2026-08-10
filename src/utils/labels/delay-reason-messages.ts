import { defineMessages } from 'react-intl'

/**
 * Shared delay-reason label catalog. Maps the raw `delay_reason` strings
 * used by the backend (`weather_conditions`, `material_shortage`, ...) to
 * translated labels. Use the `useDelayReasonLabel` hook (sibling file) so
 * consumers don't have to thread an `intl` through utility code.
 */
export const delayReasonMessages = defineMessages({
  resourceUnavailable: {
    id: 'delayReason.resourceUnavailable',
    defaultMessage: 'Resource unavailable',
    description: 'Delay reason label: a required resource is unavailable',
  },
  dependencyBlocked: {
    id: 'delayReason.dependencyBlocked',
    defaultMessage: 'Dependency blocked',
    description: 'Delay reason label: blocked by another activity',
  },
  scopeChange: {
    id: 'delayReason.scopeChange',
    defaultMessage: 'Scope change',
    description: 'Delay reason label: the scope of the work changed',
  },
  technicalIssues: {
    id: 'delayReason.technicalIssues',
    defaultMessage: 'Technical issues',
    description: 'Delay reason label: technical problems',
  },
  clientFeedback: {
    id: 'delayReason.clientFeedback',
    defaultMessage: 'Client feedback',
    description: 'Delay reason label: waiting on or reacting to the client',
  },
  weatherConditions: {
    id: 'delayReason.weatherConditions',
    defaultMessage: 'Weather conditions',
    description: 'Delay reason label: bad weather',
  },
  materialShortage: {
    id: 'delayReason.materialShortage',
    defaultMessage: 'Material shortage',
    description: 'Delay reason label: missing materials',
  },
  budgetConstraints: {
    id: 'delayReason.budgetConstraints',
    defaultMessage: 'Budget constraints',
    description: 'Delay reason label: insufficient budget',
  },
  externalApproval: {
    id: 'delayReason.externalApproval',
    defaultMessage: 'External approval',
    description: 'Delay reason label: waiting on an external approval',
  },
  other: {
    id: 'delayReason.other',
    defaultMessage: 'Other',
    description: 'Delay reason label: any other reason',
  },
})

export function delayReasonKey(
  reason: string,
): keyof typeof delayReasonMessages | null {
  switch (reason) {
    case 'resource_unavailable':
      return 'resourceUnavailable'
    case 'dependency_blocked':
      return 'dependencyBlocked'
    case 'scope_change':
      return 'scopeChange'
    case 'technical_issues':
      return 'technicalIssues'
    case 'client_feedback':
      return 'clientFeedback'
    case 'weather_conditions':
      return 'weatherConditions'
    case 'material_shortage':
      return 'materialShortage'
    case 'budget_constraints':
      return 'budgetConstraints'
    case 'external_approval':
      return 'externalApproval'
    case 'other':
      return 'other'
    default:
      return null
  }
}
