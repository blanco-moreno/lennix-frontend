import { Flex, Stack } from '@chakra-ui/react'

import { Skeleton } from '../skeleton'

/**
 * One KPI tile, still arriving — the disc where the icon goes, the label over
 * the value. It lives beside `StatCard` because it is that tile: the caller
 * lays it out in the same grid it lays the real ones in, so the row of tiles
 * never changes size or count when the numbers land.
 */
export function StatCardSkeleton() {
  return (
    <Flex align="center" gap={3} rounded="lg" bg="bg.muted/40" p="card" h={24}>
      <Skeleton h={10} w={10} rounded="full" flexShrink={0} />
      <Stack flex="1" gap={2} minW={0}>
        <Skeleton h={3} w="60%" />
        <Skeleton h={5} w="40%" />
      </Stack>
    </Flex>
  )
}
