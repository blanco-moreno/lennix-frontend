/**
 * The dashboard's drafts nudge — one line, one destination. Drafts live in
 * Borradores; the dashboard's job is to say how many are waiting and take you
 * there.
 */

import { Box, Flex } from '@chakra-ui/react'
import { ArrowRight, FileEdit } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { Text, Button, Card } from '@/components'
import { PATHS } from '@/constants'
import { useGetMeQuery } from '@/services/auth'
import { useListProjectsPaginatedQuery } from '@/services/project'

import { homeViewMessages } from '../../home-view-messages'

export function DashboardDrafts() {
  const navigate = useNavigate()

  const { data: me } = useGetMeQuery()
  const orgId = me?.organizationId ?? ''

  // Ask the backend for drafts, don't filter them out of the live list: drafts
  // are their own query (`is_draft=true`), and counting them client-side is
  // how surfaces end up disagreeing with each other.
  const { data, isLoading, error } = useListProjectsPaginatedQuery(
    { organizationId: orgId, page: 1, pageSize: 1, isDraft: true },
    { skip: !orgId },
  )
  const draftCount = data?.total ?? 0

  if (isLoading || error || draftCount === 0) {
    return null
  }

  const goToDrafts = async () => navigate(PATHS.DRAFTS)

  return (
    <Card
      borderColor="complementary/30"
      borderLeftWidth="6px"
      borderLeftColor="complementary"
      bg="complementary/5"
      data-testid="dashboard-drafts-nudge"
    >
      <Flex align="center" justify="space-between" gap={6} wrap="wrap">
        <Flex align="center" gap={4} minW={0}>
          <Flex
            align="center"
            justify="center"
            rounded="xl"
            p={3}
            bg="complementary/15"
            flexShrink={0}
          >
            <Box as={FileEdit} boxSize={6} color="complementary" />
          </Flex>
          <Text weight="semibold" size="xl" color="primary">
            <FormattedMessage
              {...homeViewMessages.draftsNudge}
              values={{ count: draftCount }}
            />
          </Text>
        </Flex>
        <Button variant="outline" gap={2} onClick={goToDrafts}>
          <FormattedMessage {...homeViewMessages.draftsGoToDrafts} />
          <Box as={ArrowRight} boxSize={4} />
        </Button>
      </Flex>
    </Card>
  )
}
