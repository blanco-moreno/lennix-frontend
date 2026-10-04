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
import { useId, useMemo, useState, type ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { Button, Combobox, Text } from '@/components'
import type { RelationshipType } from '@/types'
import type { LinkCandidate } from '@/utils'

import { dependencyEditorMessages as m } from '../../dependency-editor-messages'
import { RelationshipFields } from '../relationship-fields'

import { CandidateOption } from './candidate-option'
import {
  buildCandidateOptions,
  type CandidateOption as Option,
  type CandidateRowMeta,
} from './candidate-options'

const TypeButton = chakra('button')

export interface LinkComposerProps {
  direction: 'upstream' | 'downstream'
  /**
   * The row the link is drawn from, picked inside the composer — for a surface
   * that is not about one row. Until it is picked `candidates` is empty and
   * the row picker stays disabled.
   */
  subject?: ReactNode
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
  subject,
  candidates,
  rows,
  pivot,
  onSubmit,
  onClose,
  isBusy = false,
}: LinkComposerProps) {
  const intl = useIntl()
  const pickerId = useId()
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

  // A pick the candidates no longer allow — the subject or the graph moved
  // under it — is no pick at all.
  const picked = candidates.some(
    (candidate) => candidate.id === pickedId && candidate.verdict.ok,
  )
    ? pickedId
    : ''

  const submit = async () => {
    if (!picked) return
    const created = await onSubmit({
      otherId: picked,
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
      {subject}
      <Stack gap={1}>
        <Text as="label" size="xs" color="muted" htmlFor={pickerId}>
          {intl.formatMessage(
            direction === 'upstream' ? m.addUpstream : m.addDownstream,
          )}
        </Text>
        <Combobox<Option>
          id={pickerId}
          size="sm"
          value={picked}
          options={visible}
          disabled={candidates.length === 0}
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

      <RelationshipFields
        type={type}
        onTypeChange={setType}
        onLagChange={setLag}
      />

      <Flex gap={2} justify="flex-end">
        <Button size="sm" variant="outline" onClick={onClose}>
          {intl.formatMessage(m.addCancel)}
        </Button>
        <Button
          size="sm"
          disabled={!picked || isBusy}
          data-testid="dependency-add-submit"
          onClick={submit}
        >
          {intl.formatMessage(m.addSubmit)}
        </Button>
      </Flex>
    </Stack>
  )
}
