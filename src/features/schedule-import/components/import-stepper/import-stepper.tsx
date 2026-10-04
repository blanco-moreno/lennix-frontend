/**
 * The wizard's one stepper — the only one on the page. Horizontal and compact
 * on a phone, where four stacked stations would be 280px of navigation before
 * the first row of the draft; vertical from `lg`.
 *
 * It shows the stage and navigates between the stages that are actually
 * reachable; it never *stores* where you are. The URL owns that, and
 * `resolveReviewStep` decides which of the URL, the saved step and the draft's
 * real state wins.
 */

import { Box, Flex, chakra } from '@chakra-ui/react'
import { Check } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Text } from '@/components'
import { REVIEW_STEPS, type ReviewStep } from '@/types'

import { importStepperMessages as m } from './import-stepper-messages'

const STEPS = [
  { step: 'upload', label: m.stepUpload },
  { step: 'schedule', label: m.stepSchedule },
  { step: 'budget', label: m.stepBudget },
  { step: 'confirm', label: m.stepConfirm },
] as const satisfies readonly {
  step: ReviewStep
  label: unknown
}[]

const StepButton = chakra('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    minW: 0,
    textAlign: 'start',
    lg: { w: 'full' },
    rounded: 'lg',
    px: 3,
    py: 2.5,
    transition: 'background-color 120ms',
    _hover: { bg: 'bg.subtle' },
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
      _hover: { bg: 'transparent' },
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'ring',
      outlineOffset: '2px',
    },
  },
})

export interface ImportStepperProps {
  current: ReviewStep
  /**
   * The furthest station the draft can actually be at. Everything past it is
   * shown and disabled: a step you cannot reach is still part of the map.
   */
  furthest?: ReviewStep
  /** Absent on the upload surface, where there is nowhere else to go yet. */
  onSelect?: (step: ReviewStep) => void
}

export function ImportStepper({
  current,
  furthest = current,
  onSelect,
}: ImportStepperProps) {
  const intl = useIntl()
  const currentIndex = REVIEW_STEPS.indexOf(current)
  const furthestIndex = REVIEW_STEPS.indexOf(furthest)

  return (
    <Flex
      as="nav"
      direction={{ base: 'row', lg: 'column' }}
      align={{ base: 'center', lg: 'stretch' }}
      // Four named stations do not fit one phone row. They wrap onto a second
      // one rather than being squeezed: without this the flex kept shrinking
      // the labels until "Cronograma" came out one letter per line.
      wrap={{ base: 'wrap', lg: 'nowrap' }}
      rowGap={2}
      gap={1}
      aria-label={intl.formatMessage(m.label)}
      data-testid="import-stepper"
    >
      {STEPS.map(({ step, label }, index) => {
        const state =
          index < currentIndex
            ? 'done'
            : index === currentIndex
              ? 'current'
              : 'todo'
        const reachable = index <= furthestIndex
        return (
          <Flex
            key={step}
            direction={{ base: 'row', lg: 'column' }}
            align={{ base: 'center', lg: 'stretch' }}
            gap={1}
            flexShrink={0}
          >
            <StepButton
              type="button"
              disabled={!onSelect || !reachable}
              onClick={() => onSelect?.(step)}
              aria-current={state === 'current' ? 'step' : undefined}
              data-testid={`import-step-${step}`}
              data-state={state}
              bg={state === 'current' ? 'bg.subtle' : undefined}
            >
              <Flex
                boxSize={8}
                align="center"
                justify="center"
                rounded="full"
                flexShrink={0}
                fontSize="sm"
                fontWeight="bold"
                bg={
                  state === 'done'
                    ? 'primary'
                    : state === 'current'
                      ? 'complementary'
                      : 'bg.panel'
                }
                color={
                  state === 'done'
                    ? 'primary.fg'
                    : state === 'current'
                      ? 'complementary.fg'
                      : 'fg.subtle'
                }
                borderWidth={state === 'todo' ? '2px' : undefined}
                borderColor="border"
              >
                {state === 'done' ? <Box as={Check} boxSize={4} /> : index + 1}
              </Flex>

              {/* Every station is named at every width — a number alone does
                  not say what the step is. The step's own heading says what it
                  asks, so the stepper carries no second line. */}
              <Text
                size="sm"
                weight={state === 'todo' ? 'medium' : 'semibold'}
                color={state === 'todo' ? 'muted' : 'primary'}
                whiteSpace="nowrap"
              >
                {intl.formatMessage(label)}
              </Text>
            </StepButton>

            {/* The rail between two stations — done up to where you are. It
                lies down with the stepper below `lg`. */}
            {index < STEPS.length - 1 && (
              <Box
                ml={{ lg: 7 }}
                w={{ base: 3, lg: '2px' }}
                h={{ base: '2px', lg: 3 }}
                flexShrink={0}
                rounded="full"
                bg={index < currentIndex ? 'primary' : 'border'}
              />
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}
