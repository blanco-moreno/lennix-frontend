/**
 * A predecessor name that matched no row — answered by picking the row it meant,
 * with the link's type and lag.
 *
 * The parser kept the raw text and its closest candidates rather than inventing
 * an edge (the human owns the graph), so the closed set is right here: the rows it proposed first,
 * every other legal row behind them. Optional by nature — an unlinked
 * predecessor costs a dependency, never the go-live.
 */

import { Flex, NativeSelect, Stack } from '@chakra-ui/react'
import { useId, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components'
import { RelationshipFields, useDependencyEdits } from '@/features'
import type { RelationshipType, ReviewDependency, ReviewTask } from '@/types'

import {
  buildPredecessorOptions,
  suggestedOptions,
} from '../../predecessor-candidates'
import {
  allReviewRows,
  type UnresolvedEdgeException,
} from '../../review-exceptions'
import { reviewTrayMessages as m } from '../../review-tray-messages'
import { TrayCard } from '../tray-card'

export interface PredecessorPickerCardProps {
  projectId: string
  exception: UnresolvedEdgeException
  tasks: ReviewTask[]
  /** The draft's current graph, so no offered row repeats an edge or loops. */
  dependencies: ReviewDependency[]
}

export function PredecessorPickerCard({
  projectId,
  exception,
  tasks,
  dependencies,
}: PredecessorPickerCardProps) {
  const intl = useIntl()
  const selectId = useId()
  const [predecessorId, setPredecessorId] = useState('')
  const [type, setType] = useState<RelationshipType>('FS')
  const [lag, setLag] = useState(0)
  const { createLink, isCreating } = useDependencyEdits(projectId)

  const existing = useMemo(
    () =>
      dependencies.map((edge) => ({
        taskId: edge.taskId,
        dependsOnId: edge.dependsOnId,
      })),
    [dependencies],
  )
  const options = useMemo(
    () => buildPredecessorOptions(exception.edge, tasks, existing),
    [exception.edge, tasks, existing],
  )
  const suggested = useMemo(() => suggestedOptions(options), [options])
  const others = options.filter((option) => !suggested.includes(option))

  const rows = allReviewRows(tasks)
  const successor = rows.find((row) => row.id === exception.successorTaskId)
  const chosen = options.find((option) => option.taskId === predecessorId)

  const handleLink = async () => {
    if (!chosen) return
    await createLink({
      predecessorId: chosen.taskId,
      successorId: exception.successorTaskId,
      rows: new Map(rows.map((row) => [row.id, row])),
      existingEdges: existing,
      relationshipType: type,
      lagDays: lag,
    })
  }

  return (
    <TrayCard
      kind={exception.kind}
      blocking={false}
      title={intl.formatMessage(m.edgeTitle, {
        text: exception.edge.sourceText ?? exception.edge.successorRef,
      })}
      body={
        options.length === 0
          ? intl.formatMessage(m.edgeNoOptions)
          : intl.formatMessage(m.edgeBody, {
              successor: successor?.title ?? exception.edge.successorRef,
            })
      }
    >
      {options.length > 0 && (
        <Stack gap={3}>
          <NativeSelect.Root size="sm" width={{ base: 'full', sm: '18rem' }}>
            <NativeSelect.Field
              id={selectId}
              aria-label={intl.formatMessage(m.edgeLabel)}
              value={predecessorId}
              onChange={(event) => setPredecessorId(event.currentTarget.value)}
            >
              <option value="">{intl.formatMessage(m.edgePlaceholder)}</option>
              {suggested.length > 0 && (
                <optgroup label={intl.formatMessage(m.edgeSuggested)}>
                  {suggested.map((option) => (
                    <option key={option.taskId} value={option.taskId}>
                      {option.title}
                    </option>
                  ))}
                </optgroup>
              )}
              {others.length > 0 && (
                <optgroup label={intl.formatMessage(m.edgeOther)}>
                  {others.map((option) => (
                    <option key={option.taskId} value={option.taskId}>
                      {option.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <RelationshipFields
            type={type}
            onTypeChange={setType}
            onLagChange={setLag}
          />

          <Flex>
            <Button
              size="sm"
              disabled={!chosen || isCreating}
              onClick={handleLink}
            >
              {intl.formatMessage(isCreating ? m.working : m.edgeAction)}
            </Button>
          </Flex>
        </Stack>
      )}
    </TrayCard>
  )
}
