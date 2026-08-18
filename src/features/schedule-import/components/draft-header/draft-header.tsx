/**
 * The draft's own identity, above the wizard and visible at every step.
 *
 * Three fields and no card: the title is edited where it is read, and location
 * and description sit under it as quiet inputs. It carries no budget — that is
 * the budget step's subject, not part of naming the obra.
 *
 * Nothing here writes on its own: the edits are saved by the wizard's one Save,
 * or carried by go-live for anyone who never presses it.
 */

import { Flex, Grid, Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Badge, Label, Text } from '@/components'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScheduleExportButton } from '@/features'

import type { ProjectDetailsDraft } from '../../project-details-draft'

import { draftHeaderMessages as m } from './draft-header-messages'

export interface DraftHeaderProps {
  /**
   * The draft's unsaved edits, owned by the wizard: identity and money are one
   * draft of one project, and there is one Save for both.
   */
  /** The draft being reviewed — the export takes what it has today. */
  projectId: string
  draft: ProjectDetailsDraft
  onEdit: (patch: Partial<ProjectDetailsDraft>) => void
  /** How many fields the one Save would write — the wizard counts them. */
  pending: number
}

export function DraftHeader({
  projectId,
  draft,
  onEdit: edit,
  pending,
}: DraftHeaderProps) {
  const intl = useIntl()

  return (
    <Stack
      gap={4}
      p="card"
      rounded="xl"
      borderWidth="1px"
      borderColor="border"
      bg="bg.panel"
      data-testid="draft-header"
    >
      <Flex align="center" gap="tight" wrap="wrap">
        <Badge variant="gray" flexShrink={0}>
          {intl.formatMessage(m.draftBadge)}
        </Badge>
        <Text size="xs" color="muted" data-testid="draft-header-pending">
          {pending > 0
            ? intl.formatMessage(m.pendingChanges, { count: pending })
            : intl.formatMessage(m.explainer)}
        </Text>
        {/* "Download what I have": the draft leaves as a workbook at any step,
            edits included — the same file a live project exports. */}
        <ScheduleExportButton projectId={projectId} ml="auto" />
      </Flex>

      {/* A field, chrome and all — the borderless heading treatment read as
          static text next to two ordinary inputs, so the one thing you are
          most likely to change looked like the one thing you could not.
          It keeps the larger type: it is still the obra's name. */}
      <Stack gap={1}>
        <Label htmlFor="draft-header-name">
          {intl.formatMessage(m.nameLabel)}
        </Label>
        <Input
          id="draft-header-name"
          placeholder={intl.formatMessage(m.namePlaceholder)}
          value={draft.name}
          onChange={(event) => edit({ name: event.currentTarget.value })}
          fontSize={{ base: 'md', md: 'lg' }}
          fontWeight="semibold"
          color="primary"
        />
      </Stack>

      {/* Two columns that end level: the textarea's height is the row's, and
          the location sits in a stack of its own beside it rather than
          floating against a field twice its height. On one column they simply
          stack, description first — it is the one people actually fill in. */}
      <Grid
        gap={{ base: 3, md: 5 }}
        alignItems="start"
        templateColumns={{ base: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' }}
      >
        <Stack gap={1} minW={0}>
          <Label htmlFor="draft-header-description">
            {intl.formatMessage(m.descriptionLabel)}
          </Label>
          <Textarea
            id="draft-header-description"
            rows={3}
            resize="none"
            placeholder={intl.formatMessage(m.descriptionPlaceholder)}
            value={draft.description}
            onChange={(event) =>
              edit({ description: event.currentTarget.value })
            }
          />
        </Stack>

        <Stack gap={1} minW={0}>
          <Label htmlFor="draft-header-location">
            {intl.formatMessage(m.locationLabel)}
          </Label>
          <Input
            id="draft-header-location"
            placeholder={intl.formatMessage(m.locationPlaceholder)}
            value={draft.location}
            onChange={(event) => edit({ location: event.currentTarget.value })}
          />
          <Text size="xs" color="muted">
            {intl.formatMessage(m.locationHint)}
          </Text>
        </Stack>
      </Grid>
    </Stack>
  )
}
