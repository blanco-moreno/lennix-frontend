import { defineMessages } from 'react-intl'

import type { PlanLimitResource } from '@/hooks'

/**
 * One meter, one vocabulary per resource. Each names the slot and where a
 * slot is freed — or, for AI requests, that the way out is the plan.
 */
export const planUsageMeterMessages = defineMessages({
  usage: {
    id: 'planUsageMeter.usage',
    defaultMessage: '{current} of {limit}',
    description: 'How every plan meter renders usage against its cap',
  },
  draftsLabel: {
    id: 'planUsageMeter.draftsLabel',
    defaultMessage: 'Draft slots used',
    description: 'Label of the drafts meter on the Borradores home',
  },
  draftsRemaining: {
    id: 'planUsageMeter.draftsRemaining',
    defaultMessage:
      '{count, plural, one {# import left before the cap} other {# imports left before the cap}}',
    description: 'Headroom left on the plan draft cap',
  },
  draftsFull: {
    id: 'planUsageMeter.draftsFull',
    defaultMessage:
      'Your plan allows {limit} pending drafts. Activate or delete one to import again.',
    description:
      'Shown when the plan draft cap is reached, before an import can fail',
  },

  projectsLabel: {
    id: 'planUsageMeter.projectsLabel',
    defaultMessage: 'Live project slots used',
    description: 'Label of the live-project meter on the projects home',
  },
  projectsRemaining: {
    id: 'planUsageMeter.projectsRemaining',
    defaultMessage:
      '{count, plural, one {# project left before the cap} other {# projects left before the cap}}',
    description: 'Headroom left on the plan live-project cap',
  },
  projectsFull: {
    id: 'planUsageMeter.projectsFull',
    defaultMessage:
      'Your plan allows {limit} live projects. Delete one or upgrade to activate another.',
    description:
      'Shown when the plan live-project cap is reached, before go-live can fail',
  },

  membersLabel: {
    id: 'planUsageMeter.membersLabel',
    defaultMessage: 'Team seats used',
    description: 'Label of the team-size meter on the team home',
  },
  membersRemaining: {
    id: 'planUsageMeter.membersRemaining',
    defaultMessage:
      '{count, plural, one {# seat left before the cap} other {# seats left before the cap}}',
    description: 'Headroom left on the plan team-size cap',
  },
  membersFull: {
    id: 'planUsageMeter.membersFull',
    defaultMessage:
      'Your plan allows {limit} team members. Remove one or upgrade to add another.',
    description:
      'Shown when the plan team-size cap is reached, before an invite can fail',
  },

  aiLabel: {
    id: 'planUsageMeter.aiLabel',
    defaultMessage: 'Monthly AI requests used',
    description: 'Label of the AI requests meter',
  },
  aiRemaining: {
    id: 'planUsageMeter.aiRemaining',
    defaultMessage:
      '{count, plural, one {# AI request left this month} other {# AI requests left this month}}',
    description: 'Headroom left on the plan AI requests cap',
  },
  aiFull: {
    id: 'planUsageMeter.aiFull',
    defaultMessage:
      'Your plan allows {limit} monthly AI requests. Upgrade your plan to perform more AI imports.',
    description:
      'Shown when the plan AI request cap is reached, before an import can fail',
  },
})

type MessageKey = keyof typeof planUsageMeterMessages

export const PLAN_METER_COPY: Record<
  PlanLimitResource,
  { label: MessageKey; remaining: MessageKey; full: MessageKey }
> = {
  drafts: {
    label: 'draftsLabel',
    remaining: 'draftsRemaining',
    full: 'draftsFull',
  },
  projects: {
    label: 'projectsLabel',
    remaining: 'projectsRemaining',
    full: 'projectsFull',
  },
  members: {
    label: 'membersLabel',
    remaining: 'membersRemaining',
    full: 'membersFull',
  },
  ai: {
    label: 'aiLabel',
    remaining: 'aiRemaining',
    full: 'aiFull',
  },
}
