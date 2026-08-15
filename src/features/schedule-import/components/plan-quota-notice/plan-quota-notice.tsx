/**
 * The friendly face of ms-bk's structured plan-quota 400.
 *
 * Hitting a plan ceiling is a normal, recoverable event on the hero path, so it
 * is rendered as a named limit with a way out — never as a generic error toast.
 * The number comes from the backend's `limit`/`current`, so the copy cannot
 * drift from the real plan.
 */

import { Stack } from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'
import { type MessageDescriptor, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Alert, Button, Text } from '@/components'
import { PATHS } from '@/constants'
import type { PlanQuotaCode, PlanQuotaFailure } from '@/types'

import { planQuotaNoticeMessages as m } from './plan-quota-notice-messages'

/** Each cap names itself and points at the place where a slot is freed. */
const COPY_BY_CODE: Record<
  PlanQuotaCode,
  {
    title: MessageDescriptor
    body: MessageDescriptor
    action: MessageDescriptor
    target: string
  }
> = {
  plan_project_limit_exceeded: {
    title: m.projectLimitTitle,
    body: m.projectLimitBody,
    action: m.goToProjects,
    target: PATHS.PROJECTS,
  },
  plan_draft_limit_exceeded: {
    title: m.draftLimitTitle,
    body: m.draftLimitBody,
    action: m.goToDrafts,
    target: PATHS.DRAFTS,
  },
  plan_ai_limit_exceeded: {
    title: m.aiLimitTitle,
    body: m.aiLimitBody,
    action: m.upgradePlan,
    target: PATHS.SETTINGS,
  },
}

export interface PlanQuotaNoticeProps {
  failure: PlanQuotaFailure
}

export function PlanQuotaNotice({ failure }: PlanQuotaNoticeProps) {
  const intl = useIntl()
  const navigate = useNavigate()

  const { title, body, action, target } = COPY_BY_CODE[failure.code]
  const limit = failure.limit ?? 0

  return (
    <Alert
      variant="overBudget"
      icon={AlertTriangle}
      data-testid="plan-quota-notice"
    >
      <Stack gap={2} align="flex-start">
        <Text weight="medium" size="sm">
          {intl.formatMessage(title, { limit })}
        </Text>
        <Text size="sm">{intl.formatMessage(body)}</Text>
        {failure.limit !== null && (
          <Text size="xs" color="muted">
            {intl.formatMessage(m.currentUsage, {
              current: failure.current,
              limit: failure.limit,
            })}
          </Text>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => navigate(target)}
        >
          {intl.formatMessage(action)}
        </Button>
      </Stack>
    </Alert>
  )
}
