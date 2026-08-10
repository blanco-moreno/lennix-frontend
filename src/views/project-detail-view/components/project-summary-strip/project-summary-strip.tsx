import { Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import { HeroKpis, ProgressPanel } from '@/components'
import { useProjectKpis } from '@/hooks'
import { useFormatDate } from '@/i18n'
import { useGetProjectDashboardQuery } from '@/services/analytics'
import type { Project } from '@/types'
import { getProjectProgressColor } from '@/utils'

import { projectSummaryStripMessages as m } from './project-summary-strip-messages'

interface ProjectSummaryStripProps {
  project: Project
}

/**
 * The project's general information, in its header card: the project face of
 * the one KPI system, the overall progress and the two dates — visible
 * whatever tab is open below. Budget detail lives in the Budget tab, team in
 * the Team tab; no datum is duplicated here.
 */
export function ProjectSummaryStrip({ project }: ProjectSummaryStripProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const { data: dashboard } = useGetProjectDashboardQuery(project.id)
  const { kpis, isLoading, hasError } = useProjectKpis(project.id)

  const progressValue = dashboard ? dashboard.overallProgress : project.progress

  return (
    <Stack gap="section">
      <HeroKpis kpis={kpis} isLoading={isLoading} hasError={hasError} />

      <ProgressPanel
        heading={<FormattedMessage {...m.overallProgressHeading} />}
        dates={[
          {
            label: <FormattedMessage {...m.startDateLabel} />,
            value: project.startDate
              ? formatDate(project.startDate)
              : intl.formatMessage(m.noStartDate),
          },
          {
            label: <FormattedMessage {...m.estimatedDateLabel} />,
            value: project.dueDate
              ? formatDate(project.dueDate)
              : intl.formatMessage(m.noDueDate),
          },
        ]}
        value={progressValue}
        indicator={getProjectProgressColor(project.health.level)}
      />
    </Stack>
  )
}
