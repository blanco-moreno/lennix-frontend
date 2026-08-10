import { Flex, Image, Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Text, commonMessages } from '@/components'
import { PATHS } from '@/constants'

import { notFoundMessages as m } from './not-found-view-messages'

export function NotFoundView() {
  const intl = useIntl()
  const navigate = useNavigate()

  return (
    <Flex
      minH="100dvh"
      direction="column"
      align="center"
      justify="center"
      gap="block"
      bg="sidebar"
      px={6}
      py={12}
    >
      <Image
        src="/lennix-logo.png"
        alt={intl.formatMessage(commonMessages.appTagline)}
        h={14}
        w="auto"
      />

      <Stack gap={4} align="center" maxW="lg">
        <Text
          as="span"
          size="2xl"
          weight="bold"
          color="accent"
          fontSize="7xl"
          lineHeight="1"
        >
          404
        </Text>
        <Text size="xl" weight="semibold" color="white" align="center">
          {intl.formatMessage(m.title)}
        </Text>
        <Text size="base" color="white/70" align="center">
          {intl.formatMessage(m.description)}
        </Text>
      </Stack>

      {/* One exit, and it looks like the action it is. */}
      <Button size="lg" onClick={() => void navigate(PATHS.HOME)}>
        {intl.formatMessage(m.goHome)}
      </Button>
    </Flex>
  )
}
