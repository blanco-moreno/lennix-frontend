import { Box, Flex, Image, Stack } from '@chakra-ui/react'

import { TimelineGround } from '../timeline-ground'

// NOTE: This renders as the boot fallback *outside* IntlProvider (see
// AppIntlProvider), so it must not call useIntl(). The aria-label and the
// logo's alt text stay plain strings for that reason.
export function LoadingScreen() {
  return (
    <Flex
      position="relative"
      overflow="hidden"
      minH="100dvh"
      align="center"
      justify="center"
      bg="sidebar"
      role="status"
      aria-label="Loading"
      gap={2}
    >
      {/* Same ground as the auth screen: the handoff keeps its background. */}
      <TimelineGround />
      <Stack position="relative" gap="block" align="center">
        {/* The real mark, not a letter-spaced wordmark — the same logo the
            sidebar carries on every screen behind this one. */}
        <Image src="/lennix-logo.png" alt="Lennix" h={16} w="auto" />
        <Box
          position="relative"
          h="2px"
          w="220px"
          overflow="hidden"
          rounded="full"
          bg="sidebar.fg/20"
        >
          <Box
            position="absolute"
            insetY={0}
            left={0}
            w="40%"
            rounded="full"
            bg="accent"
            animation="indeterminate-bar 1.2s ease-in-out infinite"
            _motionReduce={{ animation: 'none', w: 'full', opacity: 0.5 }}
          />
        </Box>
      </Stack>
    </Flex>
  )
}
