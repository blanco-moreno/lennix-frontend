import { Flex } from '@chakra-ui/react'

import { Text } from '@/components/ui'
import { healthTone, toneStyle } from '@/utils'

/**
 * The obra's initials — the first letter of its first two words.
 *
 * Words that do not start with a letter (a lot number, a phase code like
 * "2026-B") are skipped: "Torre Residencial Norte" is TR, and "Obra 45 Sur" is OS, not O4.
 * Falls back to the first two characters so a one-word name still gets a tile.
 */
export function projectInitials(name: string): string {
  const words = name.split(/\s+/).filter((word) => /^\p{L}/u.test(word))
  if (words.length === 0) return name.trim().slice(0, 2).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/**
 * The tile that opens a project row.
 *
 * Tinted by the obra's verdict, so a page of rows carries its own
 * heat map down the left edge. Decorative by construction — the name is right
 * beside it — so it stays out of the accessibility tree.
 */
export function ProjectIdentity({
  name,
  healthLevel,
}: {
  name: string
  /** The server's verdict — the tile tints from the same answer as the row. */
  healthLevel: string
}) {
  return (
    <Flex
      aria-hidden
      boxSize={9}
      flexShrink={0}
      align="center"
      justify="center"
      borderRadius="md"
      borderWidth="1px"
      {...toneStyle(healthTone(healthLevel))}
      gap={2}
    >
      <Text as="span" size="xs" weight="semibold" letterSpacing="0.04em">
        {projectInitials(name)}
      </Text>
    </Flex>
  )
}
