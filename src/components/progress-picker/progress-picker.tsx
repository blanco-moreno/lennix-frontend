import { Box, Flex, Stack, chakra } from '@chakra-ui/react'
import { FormattedMessage } from 'react-intl'

import { Label, Slider, Text } from '@/components/ui'

import { progressPickerMessages as m } from './progress-picker-messages'

const QUICK_VALUES = [0, 25, 50, 75, 100]

export interface ProgressPickerProps {
  value: number
  onChange: (value: number) => void
  /** The floor: values under it are refused and the reason is said. */
  min?: number
}

/**
 * A percentage, picked on a slider or from five quick values. It only reports
 * the value; what writing it does belongs to the form around it.
 */
export function ProgressPicker({
  value,
  onChange,
  min = 0,
}: ProgressPickerProps) {
  const change = (next: number) => onChange(Math.max(next, min))

  return (
    <Stack gap="section">
      <Stack gap={0}>
        <Label mb={3} display="block">
          <FormattedMessage {...m.label} />
        </Label>
        <Slider
          colorPalette="accent"
          value={[value]}
          onValueChange={(v) => change(v[0])}
          min={0}
          max={100}
          step={5}
        />
        <Flex
          mt={2}
          width="full"
          justify="space-between"
          wrap="wrap"
          fontSize="xs"
          color="fg.subtle"
          gap={2}
        >
          {QUICK_VALUES.map((v) => (
            <Box as="span" key={v}>
              {v}%
            </Box>
          ))}
        </Flex>
        {min > 0 && (
          <Text size="xs" color="muted" mt={2}>
            <FormattedMessage {...m.minWarning} values={{ minProgress: min }} />
          </Text>
        )}
      </Stack>

      <Flex flexWrap="wrap" gap={2}>
        {QUICK_VALUES.map((v) => {
          const disabled = v < min
          const selected = value === v
          return (
            <chakra.button
              key={v}
              type="button"
              disabled={disabled}
              onClick={() => change(v)}
              rounded="md"
              borderWidth="1px"
              px={3}
              py={1.5}
              fontSize="xs"
              fontWeight="medium"
              transition="colors"
              cursor={disabled ? 'not-allowed' : undefined}
              borderColor={
                disabled ? 'border' : selected ? 'complementary' : 'border'
              }
              bg={
                disabled
                  ? 'bg.subtle'
                  : selected
                    ? 'complementary/10'
                    : undefined
              }
              color={
                disabled ? 'fg.subtle' : selected ? 'complementary' : 'fg.muted'
              }
              _hover={
                !disabled && !selected
                  ? { borderColor: 'border', bg: 'bg.subtle' }
                  : undefined
              }
            >
              {v}%
            </chakra.button>
          )
        })}
      </Flex>
    </Stack>
  )
}
