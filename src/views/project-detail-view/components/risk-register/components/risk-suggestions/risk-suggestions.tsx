import { Box, Flex, Stack } from '@chakra-ui/react'
import { Lightbulb } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button, Card, Heading, Text } from '@/components'
import type { RiskSuggestion } from '@/types'

import { riskSuggestionsMessages as m } from './risk-suggestions-messages'

interface RiskSuggestionsProps {
  suggestions: RiskSuggestion[]
  onRegister: (title: string) => void
}

/** The suggestions card — delayed critical activities proposed as risks. */
export function RiskSuggestions({
  suggestions,
  onRegister,
}: RiskSuggestionsProps) {
  return (
    <Card>
      <Stack gap={1}>
        <Flex align="center" gap={2}>
          <Box as={Lightbulb} boxSize={5} color="warning" />
          <Heading size="h3" weight="medium" color="primary">
            <FormattedMessage {...m.suggestionsTitle} />
          </Heading>
        </Flex>
        <Text size="sm" color="muted">
          <FormattedMessage {...m.suggestionsBody} />
        </Text>
      </Stack>
      <Stack gap={2}>
        {suggestions.map((suggestion) => (
          <Flex
            key={suggestion.taskId}
            align="center"
            justify="space-between"
            wrap="wrap"
            gap="tight"
            rounded="lg"
            borderWidth="1px"
            borderColor="border"
            p="cardSm"
          >
            <Box minW={0}>
              <Text size="sm" weight="medium">
                {suggestion.taskTitle}
              </Text>
              <Text size="xs" color="muted">
                <FormattedMessage
                  {...m.suggestionDelay}
                  values={{ days: suggestion.delayDays }}
                />
              </Text>
            </Box>
            <Button
              size="sm"
              variant="outline"
              flexShrink={0}
              onClick={() => onRegister(suggestion.taskTitle)}
            >
              <FormattedMessage {...m.registerSuggestion} />
            </Button>
          </Flex>
        ))}
      </Stack>
    </Card>
  )
}
