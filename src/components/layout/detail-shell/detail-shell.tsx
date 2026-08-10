import { Box, Flex, SimpleGrid, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Text, ListPanel, Skeleton } from '@/components/ui'

export interface DetailShellProps {
  /** Title lives in the breadcrumb now — not repeated here. */
  description?: ReactNode
  /** Identity lines under the description: who runs it, where it is. */
  meta?: ReactNode
  /** Status chips under the identity block. */
  badges?: ReactNode
  /** Header-right: the actions done *to* what you are reading. */
  actions?: ReactNode
  /** Below the badges, still inside the card: progress, alerts. */
  headerExtra?: ReactNode
  /**
   * The page is arriving. The shell is still the shell — same gutter, same
   * header card — and draws its own lines in place of the ones it has not
   * been given yet, so there is no separate page-level loading layout.
   */
  isLoading?: boolean
  children?: ReactNode
}

export function DetailShell({
  description,
  meta,
  badges,
  actions,
  headerExtra,
  isLoading = false,
  children,
}: DetailShellProps) {
  if (isLoading) {
    description = <Skeleton h={4} w="55%" />
    meta = <Skeleton h={3} w="10rem" />
    badges = <Skeleton h={5} w="5rem" rounded="full" />
    actions = <Skeleton h={9} w="8rem" rounded="md" />
    headerExtra = (
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap="section" w="full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} h={16} rounded="lg" />
        ))}
      </SimpleGrid>
    )
    children = (
      <ListPanel>
        <Stack gap="tight">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} h={12} rounded="lg" />
          ))}
        </Stack>
      </ListPanel>
    )
  }

  const hasIdentityRow = Boolean(meta || badges)

  return (
    <Stack
      gap="block"
      px="gutter"
      py="gutterY"
      aria-busy={isLoading || undefined}
      data-testid="detail-shell"
    >
      <ListPanel>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'start' }}
          justify="space-between"
          gap={4}
        >
          <Box flex="1" minW={0}>
            {description && (
              <Text fontWeight="medium" color="fg">
                {description}
              </Text>
            )}
            {hasIdentityRow && (
              <Flex mt={description ? 2 : 0} align="center" gap={4} wrap="wrap">
                {meta}
                {badges && (
                  <Flex wrap="wrap" gap={2}>
                    {badges}
                  </Flex>
                )}
              </Flex>
            )}
          </Box>
          {actions && (
            <Flex
              align="center"
              gap={2}
              wrap="wrap"
              flexShrink={0}
              alignSelf="flex-start"
            >
              {actions}
            </Flex>
          )}
        </Flex>

        {headerExtra && <Box>{headerExtra}</Box>}
      </ListPanel>

      <ListPanel data-testid="detail-shell-body">{children}</ListPanel>
    </Stack>
  )
}
