/**
 * Which projects are slipping, and by how much. The rows come from the same
 * organization rollup the home fetches for its KPIs, so the KPI above the list
 * can never disagree with the rows below it.
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { ArrowRight } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Heading, ListPanel, ProjectTable, Text } from '@/components'
import { PATHS } from '@/constants'
import { buildProjectDetailPath } from '@/router'
import { useGetOrgDashboardQuery } from '@/services/analytics'
import { useGetMeQuery } from '@/services/auth'

import { AttentionMeta } from './components/attention-meta'
import { HealthyState } from './components/healthy-state'
import { portfolioHealthMessages as m } from './portfolio-health-messages'

export function PortfolioHealth() {
  const intl = useIntl()
  const navigate = useNavigate()
  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''

  const {
    data: dashboard,
    isLoading,
    error,
  } = useGetOrgDashboardQuery(organizationId, { skip: !organizationId })

  const items = dashboard?.projectsNeedingAttention ?? []

  return (
    <ListPanel data-testid="portfolio-health">
      <Flex
        align={{ base: 'flex-start', sm: 'flex-end' }}
        justify="space-between"
        gap={4}
        wrap="wrap"
        borderBottomWidth="1px"
        borderColor="border"
        pb={3}
      >
        <Stack gap={1}>
          <Heading size="h2" color="primary">
            <FormattedMessage {...m.title} />
          </Heading>
          <Text color="muted">
            <FormattedMessage {...m.subtitle} />
          </Text>
        </Stack>
        <Button
          variant="outline"
          gap={2}
          onClick={async () => navigate(PATHS.PROJECTS)}
        >
          <FormattedMessage {...m.viewAllProjects} />
          <Box as={ArrowRight} boxSize={4} />
        </Button>
      </Flex>

      {isLoading || items.length > 0 ? (
        // The same table `/projects` reads — same row, same column template,
        // same header, and the same loading rows. Three rows is still a
        // listing with columns, and a shorter one is exactly where an
        // unlabelled "12 mar" is easiest to read as the wrong thing. DOM order
        // stays the ranking: worst first.
        <ProjectTable
          projects={items}
          isLoading={isLoading}
          skeletonRows={3}
          ariaLabel={intl.formatMessage(m.title)}
          // What the plain card never showed, and the reason this row is on
          // the dashboard at all. The row's own colour is NOT overridden here:
          // a home-injected tone is how the same obra came out amber here and
          // green in `/projects`.
          rowMeta={(item) => <AttentionMeta item={item} />}
          rowTestId={(item) => `portfolio-health-row-${item.id}`}
          onRowClick={(item) => {
            void navigate(buildProjectDetailPath(item.id))
          }}
        />
      ) : error ? (
        <Box color="error" py={4} textAlign="center">
          <FormattedMessage {...m.error} />
        </Box>
      ) : (
        <HealthyState />
      )}
    </ListPanel>
  )
}
