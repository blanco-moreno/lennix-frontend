/**
 * A predecessor name that matched no row — answered by picking the row it meant.
 *
 * The parser kept the raw text and its closest candidates rather than inventing
 * an edge (the human owns the graph), so the closed set is right here: the rows it proposed first,
 * every other legal row behind them. Optional by nature — an unlinked
 * predecessor costs a dependency, never the go-live.
 */

import { Flex, NativeSelect } from '@chakra-ui/react'
import { useId, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Text } from '@/components'
import { useLinkReviewPredecessorMutation } from '@/services/schedule-import'
import type { ReviewTask } from '@/types'

import {
  buildPredecessorOptions,
  suggestedOptions,
} from '../../predecessor-candidates'
import type { UnresolvedEdgeException } from '../../review-exceptions'
import { reviewTrayMessages as m } from '../../review-tray-messages'
import { TrayCard } from '../tray-card'

export interface PredecessorPickerCardProps {
  projectId: string
  exception: UnresolvedEdgeException
  tasks: ReviewTask[]
}

export function PredecessorPickerCard({
  projectId,
  exception,
  tasks,
}: PredecessorPickerCardProps) {
  const intl = useIntl()
  const selectId = useId()
  const [predecessorId, setPredecessorId] = useState('')
  const [failed, setFailed] = useState(false)
  const [linkPredecessor, { isLoading }] = useLinkReviewPredecessorMutation()

  const options = useMemo(
    () => buildPredecessorOptions(exception.edge, tasks),
    [exception.edge, tasks],
  )
  const suggested = useMemo(() => suggestedOptions(options), [options])
  const others = options.filter((option) => !suggested.includes(option))

  const successor = tasks
    .flatMap((task) => [task, ...task.subtasks])
    .find((row) => row.id === exception.successorTaskId)

  const chosen = options.find((option) => option.taskId === predecessorId)

  const handleLink = async () => {
    if (!chosen) return
    setFailed(false)
    try {
      await linkPredecessor({
        projectId,
        taskId: exception.successorTaskId,
        body: {
          depends_on_id: chosen.taskId,
          dependency_type: chosen.dependencyType,
        },
      }).unwrap()
    } catch {
      setFailed(true)
    }
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
        <Flex gap={2} wrap="wrap" align="center">
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

          <Button
            size="sm"
            disabled={!chosen || isLoading}
            onClick={handleLink}
          >
            {intl.formatMessage(isLoading ? m.working : m.edgeAction)}
          </Button>
        </Flex>
      )}

      {failed && (
        <Text size="xs" color="error">
          {intl.formatMessage(m.edgeFailed)}
        </Text>
      )}
    </TrayCard>
  )
}
