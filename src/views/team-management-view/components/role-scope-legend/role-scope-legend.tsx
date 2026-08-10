import { Box, Flex, Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import { RoleBadge, Text } from '@/components'
import { ROLE_SLUGS, systemRoleHelpMessages } from '@/utils'

import { teamManagementViewMessages as m } from '../../team-management-view-messages'

/**
 * What each role actually reaches, sitting under the table that shows who holds
 * it — the column names the role, this says what the name means.
 *
 * A block rather than a popover on the column header: all four lines are read
 * together (the point is the *contrast* between organization-wide and
 * obra-scoped), and the sentences are the ones the grant dialog already shows
 * one at a time. Same `<RoleBadge>` as the rows above, so a line and its row
 * are visibly the same thing.
 */
export function RoleScopeLegend() {
  const intl = useIntl()

  return (
    <Stack gap="tight" borderTopWidth="1px" borderColor="border" pt={4}>
      <Text size="xs" weight="medium">
        <FormattedMessage {...m.roleScopeTitle} />
      </Text>
      {ROLE_SLUGS.map((slug) => (
        <Flex key={slug} gap={2} align="baseline" wrap="wrap">
          {/* The badge keeps its intrinsic width so the four sentences start
              on their own line rather than on a ragged column of badges. */}
          <Box flexShrink={0}>
            <RoleBadge role={slug} />
          </Box>
          <Text size="xs" color="muted" flex="1" minW="16rem">
            {intl.formatMessage(systemRoleHelpMessages[slug])}
          </Text>
        </Flex>
      ))}
    </Stack>
  )
}
