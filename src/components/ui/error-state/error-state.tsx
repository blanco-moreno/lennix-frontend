import { Flex } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Text } from '../text'

/**
 * The error sibling of `EmptyState`/`LoadingState`: the centered placeholder a
 * panel shows when its fetch fails, so "could not load this" reads the same
 * everywhere. The caller passes only the message.
 */
export function ErrorState({ message }: { message: ReactNode }) {
  return (
    <Flex align="center" justify="center" py={8}>
      <Text color="error">{message}</Text>
    </Flex>
  )
}
