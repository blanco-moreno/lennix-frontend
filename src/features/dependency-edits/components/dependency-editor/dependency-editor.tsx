/**
 * One directional half of the dependency chain: the rows this one waits for,
 * or the rows waiting on it. Each edge is a compact row — the other row's
 * name, its state, and the `FS +3d` chip — and the controls only exist once
 * the row is opened: on a phone, four type pills and a lag input per edge
 * was a wall before it was an editor.
 *
 * Type and lag are edited in place (`PATCH`), never delete-and-recreate: the
 * edge keeps its identity, and the schedule engine re-derives from it.
 */

import { Box, Flex, Stack, chakra } from '@chakra-ui/react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { ComponentProps, ComponentType, ReactNode } from 'react'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import {
  Badge,
  Button,
  ListPanel,
  ListRow,
  Skeleton,
  StatusBadge,
  Text,
  Tooltip,
} from '@/components'
import type { DependencyNode, RelationshipType } from '@/types'
import { clampLag, MAX_LAG_DAYS, RELATIONSHIP_ORDER } from '@/utils'

import { dependencyEditorMessages as m } from '../../dependency-editor-messages'

const TypeButton = chakra('button')
const LagInput = chakra('input')
// ListRow is a Grid wrapper, so its props stay locked to div attrs even
// with `as="button"` — cast to let the disclosure row take `type="button"`.
const RowButton = ListRow as unknown as ComponentType<
  ComponentProps<typeof ListRow> & { type?: 'button' | 'submit' | 'reset' }
>

export interface DependencyEditorProps {
  edges: DependencyNode[]
  /**
   * Which end of each edge this list names. `upstream` lists predecessors
   * (what has to happen first), `downstream` successors (what waits on this
   * one) — the row shown is always the *other* end, since the pivot card
   * already names this one.
   */
  direction: 'upstream' | 'downstream'
  heading: React.ReactNode
  emptyText: React.ReactNode
  /** Read-only when the user may see the graph but not change it. */
  readOnly?: boolean
  onChangeRelationship: (edge: DependencyNode, next: RelationshipType) => void
  onChangeLag: (edge: DependencyNode, next: number) => void
  onRemove: (edge: DependencyNode) => void
  /**
   * The composer for this list's direction. Built by the owner (it needs the
   * whole project's rows), mounted here
   * only while open — at rest the panel shows the graph, not an empty form.
   * Omit to render the list without an add control.
   */
  composer?: ReactNode
  /** Opens {@link DependencyEditorProps.composer}. Omit for a read-only list. */
  onOpenComposer?: () => void
  /** True while the composer is mounted, so the button gives way to it. */
  isComposerOpen?: boolean
  /** No legal pairing left to offer — the button would open an empty picker. */
  hasCandidates?: boolean
  /**
   * The chain is still being read. The list draws its own rows rather than
   * letting the caller decide, and — the reason this exists — an unanswered
   * query must not read as "no dependencies": that is a claim about the
   * schedule, and this product is about which rows sit on the critical path.
   */
  isLoading?: boolean
}

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

/** The spelled-out form, for the tooltip and the accessible name. */
const TYPE_LONG: Record<RelationshipType, keyof typeof m> = {
  FS: 'relationshipFSLong',
  SS: 'relationshipSSLong',
  FF: 'relationshipFFLong',
  SF: 'relationshipSFLong',
}

/** The `FS +3d` chip: the whole rule of an edge, at reading size. */
function edgeChip(edge: DependencyNode): string {
  const lag =
    edge.lagDays !== 0 ? ` ${edge.lagDays > 0 ? '+' : ''}${edge.lagDays}d` : ''
  return `${edge.relationshipType}${lag}`
}

export function DependencyEditor({
  edges,
  direction,
  heading,
  emptyText,
  readOnly = false,
  onChangeRelationship,
  onChangeLag,
  onRemove,
  composer,
  onOpenComposer,
  isComposerOpen = false,
  hasCandidates = true,
  isLoading = false,
}: DependencyEditorProps) {
  const intl = useIntl()
  const [openId, setOpenId] = useState<string | null>(null)
  const canAdd = Boolean(onOpenComposer) && !readOnly

  return (
    <Stack gap="tight" data-testid="dependency-editor">
      <Text size="sm" weight="medium" color="primary">
        {heading}
      </Text>

      {isLoading ? (
        // The same panel the edges land in, at the same row height — one
        // title, one chip and one status per row.
        <ListPanel p={0} overflow="hidden" aria-busy>
          {Array.from({ length: 2 }).map((_, i) => (
            <ListRow
              key={i}
              gridTemplateColumns="1fr auto auto auto"
              role="presentation"
              _hover={undefined}
              aria-hidden
            >
              <Skeleton h={4} w="70%" />
              <Skeleton h={5} w={12} rounded="full" />
              <Skeleton h={5} w={16} rounded="full" />
              <Skeleton h={4} w={4} />
            </ListRow>
          ))}
        </ListPanel>
      ) : edges.length === 0 ? (
        <Text size="xs" color="muted" px="tight">
          {emptyText}
        </Text>
      ) : (
        <ListPanel p={0} overflow="hidden">
          {edges.map((edge) => {
            const other = direction === 'upstream' ? edge.dependsOn : edge.task
            if (!other) return null
            const open = openId === edge.id
            return (
              <Box key={edge.id} data-testid="dependency-edge">
                <RowButton
                  as="button"
                  type="button"
                  // A disclosure button, not a table row — the shell's
                  // `role="row"` must not shadow the button semantics.
                  role={undefined}
                  w="full"
                  textAlign="left"
                  cursor="pointer"
                  gridTemplateColumns="1fr auto auto auto"
                  aria-expanded={open}
                  // The full sentence, so a screen reader hears the direction
                  // the two-column layout draws.
                  aria-label={intl.formatMessage(m.edgeLabel, {
                    predecessor: edge.dependsOn?.title ?? '—',
                    successor: edge.task.title,
                  })}
                  data-testid="dependency-edge-row"
                  onClick={() => setOpenId(open ? null : edge.id)}
                >
                  <Text size="sm" color="primary" minW={0}>
                    {other.title}
                  </Text>
                  <Badge variant="gray" data-testid="dependency-edge-chip">
                    {edgeChip(edge)}
                  </Badge>
                  <StatusBadge domain="status" value={other.status} />
                  <Box
                    as={open ? ChevronUp : ChevronDown}
                    boxSize={4}
                    color="fg.muted"
                    aria-hidden
                  />
                </RowButton>

                {open && (
                  <Flex
                    align="center"
                    gap={4}
                    wrap="wrap"
                    px="tight"
                    py={3}
                    bg="bg.subtle"
                    borderBottomWidth="1px"
                    borderColor="border"
                    data-testid="dependency-edge-detail"
                  >
                    {!readOnly && (
                      <Flex
                        as="fieldset"
                        align="center"
                        gap={1}
                        aria-label={intl.formatMessage(m.relationshipLegend)}
                      >
                        {RELATIONSHIP_ORDER.map((type) => {
                          const active = edge.relationshipType === type
                          return (
                            <Tooltip
                              key={type}
                              content={intl.formatMessage(m[TYPE_LONG[type]])}
                            >
                              <TypeButton
                                type="button"
                                px={2}
                                py={0.5}
                                rounded="md"
                                borderWidth="1px"
                                fontSize="xs"
                                fontWeight="medium"
                                borderColor={
                                  active ? 'complementary' : 'gray.200'
                                }
                                bg={active ? 'complementary/10' : 'transparent'}
                                color={active ? 'complementary' : 'fg.muted'}
                                aria-pressed={active}
                                // The accessible name starts with the visible
                                // text, so "click FS" still matches for voice
                                // control (WCAG 2.5.3), and then says what FS
                                // means — the acronym alone is not a label.
                                aria-label={`${intl.formatMessage(
                                  m[TYPE_LABEL[type]],
                                )} — ${intl.formatMessage(m[TYPE_HELP[type]])}`}
                                onClick={() => onChangeRelationship(edge, type)}
                              >
                                {intl.formatMessage(m[TYPE_LABEL[type]])}
                              </TypeButton>
                            </Tooltip>
                          )
                        })}
                      </Flex>
                    )}

                    {!readOnly && (
                      <Flex align="center" gap={2}>
                        <Text
                          as="label"
                          size="xs"
                          color="muted"
                          htmlFor={`lag-${edge.id}`}
                        >
                          {intl.formatMessage(m.lagLabel)}
                        </Text>
                        <LagInput
                          id={`lag-${edge.id}`}
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
                          defaultValue={edge.lagDays}
                          // Committed on blur, not per keystroke: every commit
                          // re-derives the whole schedule server-side.
                          onBlur={(
                            event: React.FocusEvent<HTMLInputElement>,
                          ) => {
                            const next = clampLag(Number(event.target.value))
                            if (next !== edge.lagDays) onChangeLag(edge, next)
                          }}
                        />
                      </Flex>
                    )}

                    {/* The rule in words — the site reads that, not the acronym. */}
                    <Text size="xs" color="muted">
                      {intl.formatMessage(m[TYPE_HELP[edge.relationshipType]])}
                    </Text>

                    {!readOnly && (
                      <TypeButton
                        type="button"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        ml="auto"
                        fontSize="xs"
                        fontWeight="medium"
                        color="destructive"
                        onClick={() => onRemove(edge)}
                      >
                        <Box as={Trash2} boxSize={3.5} />
                        {intl.formatMessage(m.removeEdge)}
                      </TypeButton>
                    )}
                  </Flex>
                )}
              </Box>
            )
          })}
        </ListPanel>
      )}

      {/* The add half, under the list it grows: one button that becomes the
          composer in place, so the direction is still said by where you
          clicked and only one picker ever exists. */}
      {canAdd &&
        (!hasCandidates ? (
          <Text size="xs" color="muted" px="tight">
            {intl.formatMessage(m.addNoCandidates)}
          </Text>
        ) : isComposerOpen ? (
          composer
        ) : (
          <Box px="tight">
            <Button
              size="sm"
              variant="outline"
              data-testid="dependency-add-open"
              onClick={onOpenComposer}
            >
              <Box as={Plus} boxSize={3.5} />
              {intl.formatMessage(
                direction === 'upstream'
                  ? m.addOpenUpstream
                  : m.addOpenDownstream,
              )}
            </Button>
          </Box>
        ))}
    </Stack>
  )
}
