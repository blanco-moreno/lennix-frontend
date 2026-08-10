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
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Alert, Button, Text } from '@/components'
import { PATHS } from '@/constants'
import type { PlanQuotaFailure } from '@/types'

import { planQuotaNoticeMessages as m } from './plan-quota-notice-messages'

export interface PlanQuotaNoticeProps {
  failure: PlanQuotaFailure
}

export function PlanQuotaNotice({ failure }: PlanQuotaNoticeProps) {
  const intl = useIntl()
  const navigate = useNavigate()

  const isDraftCap = failure.code === 'plan_draft_limit_exceeded'
  const limit = failure.limit ?? 0

  return (
    <Alert
      variant="overBudget"
      icon={AlertTriangle}
      data-testid="plan-quota-notice"
    >
      <Stack gap={2} align="flex-start">
        <Text weight="medium" size="sm">
          {intl.formatMessage(
            isDraftCap ? m.draftLimitTitle : m.projectLimitTitle,
            {
              limit,
            },
          )}
        </Text>
        <Text size="sm">
          {intl.formatMessage(
            isDraftCap ? m.draftLimitBody : m.projectLimitBody,
          )}
        </Text>
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
          onClick={async () =>
            navigate(isDraftCap ? PATHS.DRAFTS : PATHS.PROJECTS)
          }
        >
          {intl.formatMessage(isDraftCap ? m.goToDrafts : m.goToProjects)}
        </Button>
      </Stack>
    </Alert>
  )
}
