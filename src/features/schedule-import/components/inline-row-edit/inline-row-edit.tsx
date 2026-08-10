/**
 * In-place row editing on the review canvas. Every edit is a pin: the server
 * records it, and later global re-reads leave the row alone.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Label, Text } from '@/components'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { useIntlToast } from '@/i18n'
import { useUpdateReviewRowMutation } from '@/services/schedule-import'

import { inlineRowEditMessages as m } from './inline-row-edit-messages'
import { buildSubtaskPatch, buildTaskPatch } from './row-patch'

export interface InlineRowEditProps {
  projectId: string
  level: 'task' | 'subtask'
  row: {
    id: string
    title: string
    startDate: string | null
    dueDate: string | null
  }
  /**
   * Controlled mode: the surface owns the open state and renders its own
   * trigger. The schedule listing needs this — its trigger is a cell in the
   * row's grid, and the form belongs underneath the row, not inside a column.
   */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function InlineRowEdit({
  projectId,
  level,
  row,
  open: controlledOpen,
  onOpenChange,
}: InlineRowEditProps) {
  const intl = useIntl()
  const toast = useIntlToast()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const controlled = controlledOpen !== undefined
  const open = controlled ? controlledOpen : uncontrolledOpen
  const setOpen = (next: boolean) => {
    if (controlled) onOpenChange?.(next)
    else setUncontrolledOpen(next)
  }
  const [failed, setFailed] = useState(false)
  const [draft, setDraft] = useState({
    title: row.title,
    startDate: row.startDate ?? '',
    dueDate: row.dueDate ?? '',
  })
  const [updateReviewRow, { isLoading }] = useUpdateReviewRowMutation()

  const start = () => {
    setDraft({
      title: row.title,
      startDate: row.startDate ?? '',
      dueDate: row.dueDate ?? '',
    })
    setFailed(false)
    setOpen(true)
  }

  const save = async () => {
    const arg =
      level === 'subtask'
        ? {
            projectId,
            level,
            id: row.id,
            body: buildSubtaskPatch(row, draft),
          }
        : { projectId, level, id: row.id, body: buildTaskPatch(row, draft) }
    if (Object.keys(arg.body).length === 0) {
      setOpen(false)
      return
    }
    setFailed(false)
    try {
      await updateReviewRow(arg).unwrap()
      toast.success(m.saved)
      setOpen(false)
    } catch {
      setFailed(true)
      // The inline line lives inside the editor; the toast is what a user who
      // looked away still sees.
      toast.error(m.failed)
    }
  }

  if (!open) {
    // Controlled: the surface drew the trigger, so there is nothing to draw.
    if (controlled) return null
    return (
      <Button
        size="sm"
        variant="ghost"
        aria-label={intl.formatMessage(m.editRow, { title: row.title })}
        onClick={start}
      >
        {intl.formatMessage(m.edit)}
      </Button>
    )
  }

  return (
    <Stack gap={2} data-testid="inline-row-edit" width="full">
      <Flex gap="tight" wrap="wrap">
        {/* The name is the field being corrected: on a phone it takes the
            whole line and the dates wrap under it, rather than the three
            sharing a row none of them fits in. */}
        <Stack
          gap={1}
          w={{ base: 'full', sm: 'auto' }}
          minW={{ sm: '14rem' }}
          flex={{ sm: 1 }}
        >
          <Label htmlFor={`title-${row.id}`}>
            {intl.formatMessage(m.titleLabel)}
          </Label>
          <Input
            id={`title-${row.id}`}
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.currentTarget.value })
            }
          />
        </Stack>
        {level === 'subtask' && (
          <>
            <Stack gap={1}>
              <Label htmlFor={`start-${row.id}`}>
                {intl.formatMessage(m.startLabel)}
              </Label>
              <DateInput
                id={`start-${row.id}`}
                value={draft.startDate || undefined}
                onValueChange={(startDate) => setDraft({ ...draft, startDate })}
              />
            </Stack>
            <Stack gap={1}>
              <Label htmlFor={`due-${row.id}`}>
                {intl.formatMessage(m.dueLabel)}
              </Label>
              <DateInput
                id={`due-${row.id}`}
                value={draft.dueDate || undefined}
                onValueChange={(dueDate) => setDraft({ ...draft, dueDate })}
              />
            </Stack>
          </>
        )}
      </Flex>

      <Text size="xs" color="muted">
        {intl.formatMessage(m.pinnedHint)}
      </Text>

      {failed && (
        <Text size="xs" color="error">
          {intl.formatMessage(m.failed)}
        </Text>
      )}

      <Flex gap={2}>
        <Button size="sm" onClick={save} disabled={isLoading}>
          {intl.formatMessage(isLoading ? m.saving : m.save)}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {intl.formatMessage(m.cancel)}
        </Button>
      </Flex>
    </Stack>
  )
}
