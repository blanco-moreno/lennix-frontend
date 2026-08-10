import { Box, type BoxProps } from '@chakra-ui/react'

/**
 * The placeholder bar every skeleton is built from — and the only shared piece
 * of one. A loading state is not a layout of its own: it is the component that
 * is arriving, drawn in bars, so it lives next to that component and traces it.
 * This is the ink, not the drawing.
 *
 * The gradient is read through CSS variables rather than style props so it
 * flips with the colour mode, and it freezes — a flat band, no sweep — when
 * the user asked for less motion.
 */
export function Skeleton(props: BoxProps) {
  return (
    <Box
      rounded="md"
      bg="bg.muted"
      bgImage="linear-gradient(90deg, var(--lennix-colors-bg-muted) 25%, var(--lennix-colors-bg-panel) 50%, var(--lennix-colors-bg-muted) 75%)"
      bgSize="200% 100%"
      animation="shimmer 1.8s linear infinite"
      _motionReduce={{ animation: 'none', bgImage: 'none' }}
      {...props}
    />
  )
}
