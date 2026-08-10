import { Box, Flex } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface CardHeadingProps {
  icon: LucideIcon
  title: ReactNode
  description?: ReactNode
  /** `destructive` for the danger zone; everything else is the accent tint. */
  tone?: 'complementary' | 'destructive'
}

/**
 * The header every card on a settings surface wears: tinted icon, title,
 * one line of description.
 *
 * Aligned to the top, not centred: with a description below it, centring
 * parks the icon between the two lines and next to neither.
 */
export function CardHeading({
  icon,
  title,
  description,
  tone = 'complementary',
}: CardHeadingProps) {
  return (
    <Flex align="flex-start" gap="tight">
      <Box bg={`${tone}/10`} rounded="lg" p={2}>
        <Box as={icon} boxSize={5} color={tone} />
      </Box>
      <Box>
        <Box as="h4" lineHeight="1.4">
          {title}
        </Box>
        {description && (
          <Box as="p" color="fg.muted">
            {description}
          </Box>
        )}
      </Box>
    </Flex>
  )
}
