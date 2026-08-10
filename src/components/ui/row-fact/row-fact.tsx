import { Flex } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Text } from '../text'

export interface RowFactProps {
  /** The column header this cell would sit under on a wide screen. */
  label: ReactNode
  children: ReactNode
}

/**
 * One cell of a listing row, told twice: as a column from `lg`, and as a
 * labelled line below it.
 *
 * A stacked row has no header above it, and an unlabelled "12 mar" is exactly
 * the datum a reader takes for the wrong thing. So the label the column would
 * have carried travels with the cell instead of being dropped — and it is the
 * *same* cell either way. Rendering the row twice, once per layout, is the
 * other way to do this; it doubles the DOM, doubles what a screen reader says,
 * and lets the two copies drift.
 */
export function RowFact({ label, children }: RowFactProps) {
  return (
    <Flex align="baseline" gap={2} minW={0} w="full">
      <Text
        as="span"
        size="xs"
        color="muted"
        hideFrom="lg"
        flexShrink={0}
        minW="7rem"
      >
        {label}
      </Text>
      <Flex minW={0} flex={1} align="center">
        {children}
      </Flex>
    </Flex>
  )
}
