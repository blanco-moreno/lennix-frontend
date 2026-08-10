import { Flex, Image, Stack, Theme } from '@chakra-ui/react'
import React from 'react'
import { useIntl } from 'react-intl'

import { Card } from '../..'
import { commonMessages } from '../../common-messages'
import { Heading, Text, TimelineGround } from '../../ui'

interface AuthFormPublicLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

/**
 * Public authentication form layout: the first impression of the product.
 *
 * The ground is the schedule itself (`TimelineGround`) on the brand navy —
 * the same ground `LoadingScreen` draws, so a reload never changes scene. It
 * replaced a two-column marketing split whose value points were text nobody
 * reads on the screen they hit every morning, and which mobile hid entirely.
 *
 * Below `sm` the card docks to the bottom edge as a sheet — full width,
 * rounded only on top — so the form sits under the thumb instead of floating
 * in navy. From `md` up the same card centres over the ground.
 *
 * The whole screen is pinned to the dark appearance (`Theme`). The ground is
 * `sidebar` — navy in BOTH color modes — so under an OS light preference the
 * card, its heading and its inputs would resolve their light values on top of
 * it: navy ink invisible on navy, white input fields. There is no light
 * version of this screen to fall back to, so it declares its own scope.
 */
export function AuthFormPublicLayout({
  title,
  description,
  children,
}: AuthFormPublicLayoutProps) {
  const intl = useIntl()

  return (
    <Theme appearance="dark" hasBackground={false}>
      <Flex
        position="relative"
        overflow="hidden"
        bg="sidebar"
        minH="100dvh"
        direction="column"
        align="center"
        justify={{ base: 'space-between', md: 'center' }}
        gap={{ base: 6, md: 'block' }}
        px={{ base: 0, sm: 6 }}
        pt={{ base: 6, md: 16 }}
        pb={{ base: 0, md: 16 }}
      >
        <TimelineGround />

        <Stack
          position="relative"
          // Takes the band above the sheet and centres the logo inside it.
          flex={{ base: '1', md: 'none' }}
          justify="center"
          align="center"
          gap={4}
          px={6}
          maxW="sm"
          animation="fade-rise 0.45s ease-out both"
          _motionReduce={{ animation: 'none' }}
        >
          <Image
            src="/lennix-logo.png"
            alt={intl.formatMessage(commonMessages.appTagline)}
            h={{ base: 14, md: 20 }}
            w="auto"
          />
          <Text size="sm" color="white/70" align="center">
            {intl.formatMessage(commonMessages.authBrandSubhead)}
          </Text>
        </Stack>

        <Card
          position="relative"
          w="full"
          maxW={{ base: 'full', sm: 'md' }}
          // The sheet reaches up into the screen instead of hugging the form's
          // natural height — the navy above it is a band, not a void.
          minH={{ base: '62svh', md: 'auto' }}
          // `lg` radius and a soft shadow: the same card the private views use.
          // The sheet keeps a bigger top radius only where it meets the edge.
          shadow="lg"
          borderWidth={{ base: '0', sm: '1px' }}
          roundedTop={{ base: 'xl', sm: 'lg' }}
          roundedBottom={{ base: '0', sm: 'lg' }}
          animation="fade-rise 0.45s ease-out 0.06s both"
          _motionReduce={{ animation: 'none' }}
          // The one card in the app that is the whole screen, so it runs
          // roomier than the `card` token on purpose. The bottom padding clears
          // the home indicator when the card is docked to the edge.
          css={{
            padding: { base: 6, sm: 10 },
            paddingBottom: {
              base: 'calc(1.5rem + env(safe-area-inset-bottom))',
              sm: '2.5rem',
            },
          }}
          // `space-between` so the taller sheet drops the footer to its bottom
          // edge instead of leaving the slack under the form.
          contentProps={{
            display: 'flex',
            flex: '1',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 'section',
          }}
          header={
            <Stack gap={1.5}>
              <Heading as="h1" size="h1" color="primary">
                {title}
              </Heading>
              <Text size="sm" color="muted">
                {description}
              </Text>
            </Stack>
          }
        >
          {children}

          <Text size="xs" color="fg.subtle" align="center">
            {intl.formatMessage(commonMessages.authFooter, {
              year: new Date().getFullYear(),
            })}
          </Text>
        </Card>
      </Flex>
    </Theme>
  )
}
