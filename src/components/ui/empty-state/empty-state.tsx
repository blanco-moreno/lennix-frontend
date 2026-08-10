import { Flex } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../button'
import { Heading } from '../heading'
import { Text } from '../text'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  /**
   * A ready-made control in place of `action`, for callers whose button needs
   * data this component must not fetch — the plan-gated import CTA. Wins over
   * `action` when both are given.
   */
  actionSlot?: ReactNode
}

/**
 * A screen with nothing in it should still look designed. The icon sits in a
 * tinted disc so it reads as a deliberate mark rather than a stray glyph, the
 * title carries real heading weight, and the description is capped at a
 * reading measure (~50ch) so it never stretches into a single wide line.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionSlot,
}: EmptyStateProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      px={6}
      py={16}
      textAlign="center"
      gap={2}
    >
      <Flex
        align="center"
        justify="center"
        h={20}
        w={20}
        rounded="full"
        bg="primary/10"
        color="primary"
        borderWidth="1px"
        borderColor="border.muted"
        css={{ '& svg': { width: 8, height: 8, strokeWidth: 1.5 } }}
      >
        <Icon />
      </Flex>
      <Heading as="h3" size="h3" color="primary" mt={6}>
        {title}
      </Heading>
      {description && (
        <Text color="muted" maxW="50ch" mt={3}>
          {description}
        </Text>
      )}
      {actionSlot ? (
        <Flex mt={8} gap={2}>
          {actionSlot}
        </Flex>
      ) : (
        action && (
          <Button mt={8} onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </Flex>
  )
}
