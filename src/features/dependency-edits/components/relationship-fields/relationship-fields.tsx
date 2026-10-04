/**
 * The PDM shape of a link being drawn — the four relationship types, the lag,
 * and the chosen type in words — picked in the same act as the rows it joins.
 * The owner holds both values and sends them with the link.
 */

import { Flex, chakra } from '@chakra-ui/react'
import { useId } from 'react'
import { useIntl } from 'react-intl'

import { Text, Tooltip } from '@/components'
import type { RelationshipType } from '@/types'
import { clampLag, MAX_LAG_DAYS, RELATIONSHIP_ORDER } from '@/utils'

import { dependencyEditorMessages as m } from '../../dependency-editor-messages'

const TypeButton = chakra('button')
const LagInput = chakra('input')

const TYPE_LABEL: Record<RelationshipType, keyof typeof m> = {
  FS: 'relationshipFS',
  SS: 'relationshipSS',
  FF: 'relationshipFF',
  SF: 'relationshipSF',
}

const TYPE_HELP: Record<RelationshipType, keyof typeof m> = {
  FS: 'relationshipFSHelp',
  SS: 'relationshipSSHelp',
  FF: 'relationshipFFHelp',
  SF: 'relationshipSFHelp',
}

const TYPE_LONG: Record<RelationshipType, keyof typeof m> = {
  FS: 'relationshipFSLong',
  SS: 'relationshipSSLong',
  FF: 'relationshipFFLong',
  SF: 'relationshipSFLong',
}

export interface RelationshipFieldsProps {
  type: RelationshipType
  onTypeChange: (type: RelationshipType) => void
  /** Whole days, clamped to what the backend accepts. The field starts at 0. */
  onLagChange: (lag: number) => void
}

export function RelationshipFields({
  type,
  onTypeChange,
  onLagChange,
}: RelationshipFieldsProps) {
  const intl = useIntl()
  const lagId = useId()

  return (
    <Flex align="center" gap={4} wrap="wrap">
      <Flex
        as="fieldset"
        align="center"
        gap={1}
        aria-label={intl.formatMessage(m.composerType)}
      >
        {RELATIONSHIP_ORDER.map((value) => {
          const active = value === type
          return (
            <Tooltip
              key={value}
              content={intl.formatMessage(m[TYPE_LONG[value]])}
            >
              <TypeButton
                type="button"
                px={2}
                py={0.5}
                rounded="md"
                borderWidth="1px"
                fontSize="xs"
                fontWeight="medium"
                borderColor={active ? 'complementary' : 'gray.200'}
                bg={active ? 'complementary/10' : 'transparent'}
                color={active ? 'complementary' : 'fg.muted'}
                aria-pressed={active}
                // Visible text first, so voice control still matches "click
                // FS" (WCAG 2.5.3), then what FS means.
                aria-label={`${intl.formatMessage(
                  m[TYPE_LABEL[value]],
                )} — ${intl.formatMessage(m[TYPE_HELP[value]])}`}
                onClick={() => onTypeChange(value)}
              >
                {intl.formatMessage(m[TYPE_LABEL[value]])}
              </TypeButton>
            </Tooltip>
          )
        })}
      </Flex>

      <Flex align="center" gap={2}>
        <Text as="label" size="xs" color="muted" htmlFor={lagId}>
          {intl.formatMessage(m.lagLabel)}
        </Text>
        <LagInput
          id={lagId}
          type="number"
          min={-MAX_LAG_DAYS}
          max={MAX_LAG_DAYS}
          w="16"
          px={2}
          py={0.5}
          fontSize="xs"
          rounded="md"
          borderWidth="1px"
          borderColor="border"
          // Uncontrolled: a controlled number field reads a half-typed "-" as
          // empty and snaps it to 0, so a lead could never be typed.
          defaultValue={0}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onLagChange(clampLag(Number(event.target.value)))
          }
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            event.target.value = String(clampLag(Number(event.target.value)))
          }}
        />
      </Flex>

      <Text size="xs" color="muted">
        {intl.formatMessage(m[TYPE_HELP[type]])}
      </Text>
    </Flex>
  )
}
