import { Box, Stack } from '@chakra-ui/react'
import { DollarSign, Zap } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { useSearchParams } from 'react-router'

import { Heading, Tabs, Text, type TabItem } from '@/components'
import { usePermission } from '@/hooks'
import {
  APPROVAL_SECTION_PARAM,
  resolveApprovalSection,
  type ApprovalSection,
} from '@/router'

import { approvalsMessages as m } from './approvals-view-messages'
import { BudgetApprovals } from './components/budget-approvals'
import { ForceStartApprovalsSection } from './components/force-start-approvals-section'

/**
 * The one approvals home: two sections, each gated by its own key, and the
 * open section lives in the URL so a link points at the right one.
 *
 * A `user` holds neither decision key but reaches the same home in read-only
 * "my requests" mode — the list is theirs because the backend scopes it to
 * `requestor_id`, not because this view hides rows.
 */
export function ApprovalsView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const canDecideBudget = usePermission('budget.approval.decide')
  const canDecideForceStart = usePermission('forceStart.approval.decide')
  const canRequestBudget = usePermission('budget.edit.request')
  const canRequestForceStart = usePermission('forceStart.request')
  const readOnly = !canDecideBudget && !canDecideForceStart

  const items: TabItem[] = [
    ...(canDecideBudget || canRequestBudget
      ? [
          {
            value: 'budget',
            label: (
              <>
                <Box as={DollarSign} boxSize={4} />
                <FormattedMessage {...m.tabBudget} />
              </>
            ),
            content: (
              <Box pt={4}>
                <BudgetApprovals readOnly={readOnly} />
              </Box>
            ),
          } satisfies TabItem,
        ]
      : []),
    ...(canDecideForceStart || canRequestForceStart
      ? [
          {
            value: 'force-start',
            label: (
              <>
                <Box as={Zap} boxSize={4} />
                <FormattedMessage {...m.tabForceStart} />
              </>
            ),
            content: (
              <Box pt={4}>
                <ForceStartApprovalsSection readOnly={readOnly} />
              </Box>
            ),
          } satisfies TabItem,
        ]
      : []),
  ]

  const available = items.map((item) => item.value as ApprovalSection)
  const active =
    resolveApprovalSection(
      searchParams.get(APPROVAL_SECTION_PARAM),
      available,
    ) ?? 'budget'

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(APPROVAL_SECTION_PARAM, value)
    setSearchParams(next, { replace: true })
  }

  return (
    // Same view rhythm as /projects and /tasks: one padding scale, one gap.
    <Stack gap="block" px="gutter" py="gutterY">
      <Heading as="h1" fontSize="xl" fontWeight="bold">
        <FormattedMessage {...(readOnly ? m.titleMine : m.title)} />
      </Heading>
      <Text size="lg" color="muted">
        <FormattedMessage {...(readOnly ? m.subtitleMine : m.subtitle)} />
      </Text>

      <Tabs
        value={active}
        onValueChange={handleTabChange}
        w="full"
        items={items}
        // No rule under the pills: it belonged to the underlined strip they
        // replaced, and now it only draws a line the sections do not sit on.
        listProps={{ w: 'full' }}
      />
    </Stack>
  )
}
