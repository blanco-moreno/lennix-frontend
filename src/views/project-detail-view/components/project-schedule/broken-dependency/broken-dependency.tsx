/**
 * Broken-edge card carrying its own fix: legal replacement rows, or dropping
 * the link. When the deleted predecessor was already DONE the dependency stays
 * satisfied — the link is stale, not blocking, and the card says so.
 */

import { Flex, NativeSelect, Stack } from '@chakra-ui/react'
import { Unlink } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Badge, Button, Card, Text } from '@/components'
import { buildCandidateOptions, type ScheduleRow } from '@/features'
import type { DependencyNode } from '@/types'
import { linkCandidates, type DependencyType } from '@/utils'

import { brokenDependencyMessages as m } from './broken-dependency-messages'

export interface BrokenDependencyProps {
  edge: DependencyNode
  /** Every row on the schedule — candidates are filtered by the pairing rule. */
  rows: ScheduleRow[]
  /** Existing edges, so an already-linked pair is not offered twice. */
  edges: DependencyNode[]
  onRelink: (
    edge: DependencyNode,
    predecessorId: string,
    dependencyType: DependencyType,
  ) => Promise<void> | void
  onDiscard: (edge: DependencyNode) => void
  isBusy?: boolean
}

export function BrokenDependency({
  edge,
  rows,
  edges,
  onRelink,
  onDiscard,
  isBusy = false,
}: BrokenDependencyProps) {
  const intl = useIntl()
  const selectId = useId()
  const [predecessorId, setPredecessorId] = useState('')
  const [failed, setFailed] = useState(false)

  // Same rule and same wording as the dependency panel's composer: a repair is
  // still a link, so a replacement that would close a loop is refused here with
  // its reason rather than accepted and 409'd.
  const candidates = useMemo(
    () =>
      linkCandidates({
        pivotId: edge.task.id,
        direction: 'upstream',
        rows,
        existing: edges
          .filter((other) => other.dependsOn)
          .map((other) => ({
            taskId: other.task.id,
            dependsOnId: other.dependsOn!.id,
          })),
      }),
    [rows, edges, edge.task.id],
  )

  const rowMeta = useMemo(
    () => new Map(rows.map((row) => [row.id, row])),
    [rows],
  )
  const options = buildCandidateOptions({
    candidates,
    rows: rowMeta,
    pivot: rowMeta.get(edge.task.id) ?? {
      parentId: null,
      startDate: null,
      dueDate: null,
    },
    direction: 'upstream',
    intl,
  })
  const linkable = candidates.filter((candidate) => candidate.verdict.ok)

  const chosen = candidates.find(
    (candidate) => candidate.id === predecessorId && candidate.verdict.ok,
  )

  const handleRelink = async () => {
    if (!chosen?.verdict.dependencyType) return
    setFailed(false)
    try {
      await onRelink(edge, chosen.id, chosen.verdict.dependencyType)
    } catch {
      setFailed(true)
    }
  }

  const successorRow = rows.find((row) => row.id === edge.task.id)
  const blocked = successorRow?.isBlocked ?? edge.task.isBlocked

  return (
    <Card
      borderColor="critical/40"
      bg="critical/5"
      data-testid="broken-dependency"
    >
      <Stack gap="tight">
        <Flex align="center" gap={2}>
          <Badge variant="critical">
            <Unlink size={12} />
            {intl.formatMessage(m.title)}
          </Badge>
        </Flex>

        <Text size="sm" color="primary">
          {edge.dependsOn
            ? intl.formatMessage(m.bodyKnown, {
                successor: edge.task.title,
                predecessor: edge.dependsOn.title,
              })
            : intl.formatMessage(m.bodyUnknown, {
                successor: edge.task.title,
              })}
        </Text>
        <Text size="xs" color={blocked ? 'critical' : 'muted'}>
          {blocked
            ? intl.formatMessage(m.stillBlocked)
            : intl.formatMessage(m.satisfied)}
        </Text>

        {linkable.length === 0 ? (
          <Text size="xs" color="muted">
            {intl.formatMessage(m.noCandidates)}
          </Text>
        ) : (
          <Flex align="flex-end" gap={2} wrap="wrap">
            <Stack gap={1} flex={1} minW="200px">
              <Text as="label" size="xs" color="muted" htmlFor={selectId}>
                {intl.formatMessage(m.pickLabel)}
              </Text>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  id={selectId}
                  value={predecessorId}
                  onChange={(event) => setPredecessorId(event.target.value)}
                >
                  <option value="">
                    {intl.formatMessage(m.pickPlaceholder)}
                  </option>
                  {options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.reason
                        ? `${option.label} — ${option.reason}`
                        : option.label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Stack>
            <Button
              size="sm"
              disabled={!chosen || isBusy}
              onClick={handleRelink}
            >
              {isBusy
                ? intl.formatMessage(m.relinking)
                : intl.formatMessage(m.relink)}
            </Button>
          </Flex>
        )}

        <Flex justify="space-between" align="center" gap={2} wrap="wrap">
          <Button
            size="sm"
            variant="outline"
            disabled={isBusy}
            onClick={() => onDiscard(edge)}
          >
            {intl.formatMessage(m.discard)}
          </Button>
          {failed && (
            <Text size="xs" color="error">
              {intl.formatMessage(m.relinkFailed)}
            </Text>
          )}
        </Flex>
      </Stack>
    </Card>
  )
}
