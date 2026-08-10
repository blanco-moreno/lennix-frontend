/**
 * Drawing one edge, as one act.
 *
 * One decision, one step: a picker per direction that only ever creates an FS
 * edge leaves the type and the lag to a second pass over the new row.
 * Here the direction comes from the button that opened
 * the composer, and the row, the type and the lag are chosen together; the
 * endpoint has always taken all three.
 */

import { Flex, Stack, chakra } from '@chakra-ui/react'
import { useId, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Combobox, Text, Tooltip } from '@/components'
import type { RelationshipType } from '@/types'
import { clampLag, MAX_LAG_DAYS, RELATIONSHIP_ORDER } from '@/utils'
import type { LinkCandidate } from '@/utils'

import { dependencyEditorMessages as m } from '../../dependency-editor-messages'

import { CandidateOption } from './candidate-option'
import {
  buildCandidateOptions,
  type CandidateOption as Option,
  type CandidateRowMeta,
} from './candidate-options'

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

export interface LinkComposerProps {
  direction: 'upstream' | 'downstream'
  /** Every other row, judged by the one rule — refused ones included. */
  candidates: LinkCandidate[]
  rows: Map<string, CandidateRowMeta>
  pivot: CandidateRowMeta
  onSubmit: (link: {
    otherId: string
    relationshipType: RelationshipType
    lagDays: number
  }) => Promise<boolean> | boolean
  onClose: () => void
  isBusy?: boolean
}

export function LinkComposer({
  direction,
  candidates,
  rows,
  pivot,
  onSubmit,
  onClose,
  isBusy = false,
}: LinkComposerProps) {
  const intl = useIntl()
  const pickerId = useId()
  const lagId = useId()
  const [pickedId, setPickedId] = useState('')
  const [type, setType] = useState<RelationshipType>('FS')
  const [lag, setLag] = useState(0)
  const [showOffLevel, setShowOffLevel] = useState(false)
  const [term, setTerm] = useState('')

  const options = useMemo(
    () => buildCandidateOptions({ candidates, rows, pivot, direction, intl }),
    [candidates, rows, pivot, direction, intl],
  )

  // Rows refused for living at another level of the WBS are the bulk of a big
  // project and teach nothing about *this* row's graph, so they stay folded —
  // but a search always reaches them, which is the whole point of disabling a
  // row instead of hiding it: type the name you know exists and it answers.
  const offLevelCount = options.filter((option) => option.offLevel).length
  const visible =
    showOffLevel || term !== ''
      ? options
      : options.filter((option) => !option.offLevel)

  const submit = async () => {
    if (!pickedId) return
    const created = await onSubmit({
      otherId: pickedId,
      relationshipType: type,
      lagDays: lag,
    })
    if (created) onClose()
  }

  return (
    <Stack
      gap={3}
      px="tight"
      py={3}
      bg="bg.subtle"
      rounded="l2"
      borderWidth="1px"
      borderColor="border"
      data-testid="link-composer"
    >
      <Stack gap={1}>
        <Text as="label" size="xs" color="muted" htmlFor={pickerId}>
          {intl.formatMessage(
            direction === 'upstream' ? m.addUpstream : m.addDownstream,
          )}
        </Text>
        <Combobox<Option>
          id={pickerId}
          size="sm"
          value={pickedId}
          options={visible}
          renderOption={(option) => <CandidateOption option={option} />}
          onValueChange={setPickedId}
          onTermChange={setTerm}
          placeholder={intl.formatMessage(m.addPlaceholder)}
          noOptionsMessage={intl.formatMessage(m.addNoMatch)}
        />
        {offLevelCount > 0 && (
          <TypeButton
            type="button"
            alignSelf="flex-start"
            fontSize="xs"
            color="fg.muted"
            textDecoration="underline"
            onClick={() => setShowOffLevel((open) => !open)}
            data-testid="link-composer-off-level"
          >
            {showOffLevel
              ? intl.formatMessage(m.hideBlocked)
              : intl.formatMessage(m.showBlocked, { count: offLevelCount })}
          </TypeButton>
        )}
      </Stack>

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
                  onClick={() => setType(value)}
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
            value={lag}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setLag(clampLag(Number(event.target.value)))
            }
          />
        </Flex>
      </Flex>

      <Flex align="center" gap={2} justify="space-between" wrap="wrap">
        <Text size="xs" color="muted">
          {intl.formatMessage(m[TYPE_HELP[type]])}
        </Text>
        <Flex gap={2}>
          <Button size="sm" variant="outline" onClick={onClose}>
            {intl.formatMessage(m.addCancel)}
          </Button>
          <Button
            size="sm"
            disabled={!pickedId || isBusy}
            data-testid="dependency-add-submit"
            onClick={submit}
          >
            {intl.formatMessage(m.addSubmit)}
          </Button>
        </Flex>
      </Flex>
    </Stack>
  )
}
