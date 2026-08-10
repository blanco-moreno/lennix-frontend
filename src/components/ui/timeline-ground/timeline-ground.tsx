import { Box } from '@chakra-ui/react'

/**
 * Blueprint paper as the ground of the public screens. Two consumers share it
 * — LoadingScreen and the auth layout — which is what makes the boot-to-login
 * handoff read as one screen instead of two.
 *
 * Two crossed hairline grids at 4%: drawing paper, and the Gantt's own date
 * columns. Deliberately quiet — this is a construction tool, and the sign-in
 * screen has to look like the app behind it.
 *
 * Decorative and inert: no text, no intl (LoadingScreen mounts outside
 * IntlProvider), no motion.
 */
const LINE =
  'color-mix(in srgb, var(--lennix-colors-sidebar-fg) 4%, transparent)'

/** Fades the grid out behind the card so it never fights the form. */
const FADE = 'radial-gradient(80% 70% at 50% 45%, transparent, black)'

export function TimelineGround() {
  return (
    <Box
      position="absolute"
      inset={0}
      pointerEvents="none"
      aria-hidden="true"
      bgImage={`linear-gradient(to right, ${LINE} 1px, transparent 1px), linear-gradient(to bottom, ${LINE} 1px, transparent 1px)`}
      bgSize="48px 48px"
      css={{ maskImage: FADE, WebkitMaskImage: FADE }}
    />
  )
}
