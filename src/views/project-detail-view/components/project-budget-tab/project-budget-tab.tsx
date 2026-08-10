import { Box, Stack } from '@chakra-ui/react'
import { FormattedMessage } from 'react-intl'

import { Heading, Text } from '@/components'

import { CostReport } from '../cost-report'
import { ProjectBudgetPanel } from '../project-budget-panel'
import { ProjectExpensesTab } from '../project-expenses-tab'

import { projectBudgetTabMessages as m } from './project-budget-tab-messages'

interface ProjectBudgetTabProps {
  projectId: string
}

/**
 * The one home for money, with an explicit hierarchy: budget → cost report →
 * expense list. The budget of record is the primary block, the report explains
 * where it is going, and the expense list is the evidence underneath. Setting
 * the budget lives on the single permission-forking "Update budget" button on
 * the project header — no second editor appears here.
 */
export function ProjectBudgetTab({ projectId }: ProjectBudgetTabProps) {
  return (
    <Stack gap="section">
      <Stack gap={2}>
        <Box>
          <Heading size="h2" color="primary">
            <FormattedMessage {...m.budgetControlHeading} />
          </Heading>
          <Text size="sm" color="muted" mt={1}>
            <FormattedMessage {...m.budgetSectionCaption} />
          </Text>
        </Box>
        <Box pb={6}>
          <ProjectBudgetPanel projectId={projectId} />
        </Box>
      </Stack>

      <Stack gap="tight">
        <Box>
          <Heading size="h3" color="primary">
            <FormattedMessage {...m.costReportSectionHeading} />
          </Heading>
          <Text size="sm" color="muted" mt={1}>
            <FormattedMessage {...m.costReportSectionCaption} />
          </Text>
        </Box>
        <CostReport projectId={projectId} />
      </Stack>

      <Stack gap="tight">
        <Text size="sm" color="muted">
          <FormattedMessage {...m.expensesSectionCaption} />
        </Text>
        <ProjectExpensesTab projectId={projectId} />
      </Stack>
    </Stack>
  )
}
