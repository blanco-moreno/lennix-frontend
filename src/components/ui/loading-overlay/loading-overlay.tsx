import { Box } from '@chakra-ui/react'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface LoadingOverlayProps {
  /** A refetch over content already on screen — not the first load. */
  busy: boolean
  children: ReactNode
}

/**
 * The refetch state, distinct from the first load: filtering or searching an
 * already-populated list dims it and floats a small spinner instead of tearing
 * the rows out for a full skeleton. Without it a filter that returns the same
 * page reads as a filter that did nothing.
 */
export function LoadingOverlay({ busy, children }: LoadingOverlayProps) {
  return (
    <Box position="relative" aria-busy={busy}>
      <Box
        opacity={busy ? 0.55 : 1}
        transition="opacity 150ms ease"
        pointerEvents={busy ? 'none' : undefined}
      >
        {children}
      </Box>
      {busy && (
        <Box
          as={Loader2}
          position="absolute"
          top={3}
          right={3}
          boxSize={5}
          color="accent"
          animation="spin 1s linear infinite"
          _motionReduce={{ animation: 'none' }}
        />
      )}
    </Box>
  )
}
