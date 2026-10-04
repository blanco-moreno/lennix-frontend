/**
 * The one drawer for a draft row: edit a main activity or a subactivity, or
 * create either, plus — for a row that exists — its predecessors.
 *
 * A main activity takes a name only: its dates derive from its subactivities
 * (`TSK-4`) and neither the task update nor the task create accepts any — and
 * for the same reason only a subactivity takes a progress figure. The fields
 * save on Save; the dependency section writes each change the moment it is
 * made, so it sits outside the fields' form and its buttons never submit it.
 */

import { Stack, chakra } from '@chakra-ui/react'
import { type FormEvent, useId, useState } from 'react'
import { useIntl } from 'react-intl'

import {
  FormDrawer,
  FormField,
  ModalFormFooter,
  ProgressPicker,
  ReadOnlyField,
  Text,
} from '@/components'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/hooks'
import { useFormatDate, useIntlToast } from '@/i18n'
import {
  useCreateReviewPhaseMutation,
  usePlaceReviewRowMutation,
  useUpdateReviewProgressMutation,
  useUpdateReviewRowMutation,
} from '@/services/schedule-import'
import type { ReviewSubtask, ReviewTask, ScheduleReviewState } from '@/types'

import type {
  ReviewException,
  UnresolvedEdgeException,
} from '../review-tray/review-exceptions'

import { RowDependencies } from './components/row-dependencies'
import { rowDrawerMessages as m } from './row-drawer-messages'
import { buildSubtaskPatch, buildTaskPatch } from './row-patch'

export type RowDrawerTarget =
  | { mode: 'edit'; rowId: string }
  | { mode: 'create-task' }
  | { mode: 'create-subtask'; parentId: string }

/** Remounting per target resets the fields — the canvas keys it with this. */
export function rowDrawerKey(target: RowDrawerTarget): string {
  if (target.mode === 'edit') return `edit:${target.rowId}`
  if (target.mode === 'create-subtask') return `create:${target.parentId}`
  return 'create'
}

interface Resolved {
  level: 'task' | 'subtask'
  row: ReviewTask | ReviewSubtask | null
  parent: ReviewTask | null
}

function resolve(
  target: RowDrawerTarget,
  tasks: ReviewTask[],
): Resolved | null {
  if (target.mode === 'create-task') {
    return { level: 'task', row: null, parent: null }
  }
  if (target.mode === 'create-subtask') {
    const parent = tasks.find((task) => task.id === target.parentId)
    return parent ? { level: 'subtask', row: null, parent } : null
  }
  for (const task of tasks) {
    if (task.id === target.rowId)
      return { level: 'task', row: task, parent: null }
    const subtask = task.subtasks.find((sub) => sub.id === target.rowId)
    if (subtask) return { level: 'subtask', row: subtask, parent: task }
  }
  return null
}

export interface RowDrawerProps {
  projectId: string
  state: ScheduleReviewState
  exceptions: ReviewException[]
  target: RowDrawerTarget
  onClose: () => void
}

export function RowDrawer({
  projectId,
  state,
  exceptions,
  target,
  onClose,
}: RowDrawerProps) {
  const intl = useIntl()
  const toast = useIntlToast()
  const formatDate = useFormatDate()
  const formId = useId()
  const canEdit = usePermission('task.edit')
  const canLink = usePermission('project.dependencies.manage')
  const canReport = usePermission('task.registerProgress')
  const [updateRow, { isLoading: isUpdating }] = useUpdateReviewRowMutation()
  const [createPhase, { isLoading: isCreatingPhase }] =
    useCreateReviewPhaseMutation()
  const [placeRow, { isLoading: isPlacing }] = usePlaceReviewRowMutation()
  const [reportProgress, { isLoading: isReporting }] =
    useUpdateReviewProgressMutation()

  const resolved = resolve(target, state.tasks)
  const row = resolved?.row ?? null
  const [draft, setDraft] = useState({
    title: row?.title ?? '',
    startDate: row?.startDate ?? '',
    dueDate: row?.dueDate ?? '',
    progress: row?.progress ?? 0,
  })

  // The row was deleted, or its phase was, while the drawer was asked for it.
  if (!resolved) return null
  const { level, parent } = resolved
  const isSubtask = level === 'subtask'
  const isCreate = row === null
  const editable = isCreate || canEdit
  // No floor: a draft's figure is the file's reading, and lowering it is a
  // correction rather than a report going backwards.
  const reportable = isSubtask && !isCreate && canReport

  const title = intl.formatMessage(
    isCreate
      ? isSubtask
        ? m.createSubtaskTitle
        : m.createTaskTitle
      : isSubtask
        ? m.editSubtaskTitle
        : m.editTaskTitle,
  )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const name = draft.title.trim()
    try {
      if (row) {
        const body = isSubtask
          ? buildSubtaskPatch(row, draft)
          : buildTaskPatch(row, draft)
        const progressChanged = reportable && draft.progress !== row.progress
        if (Object.keys(body).length > 0) {
          await updateRow({ projectId, level, id: row.id, body }).unwrap()
        }
        if (progressChanged) {
          await reportProgress({
            projectId,
            id: row.id,
            body: { progress: Math.round(draft.progress) },
          }).unwrap()
        }
        if (Object.keys(body).length > 0 || progressChanged) {
          toast.success(m.saved)
        }
      } else if (parent) {
        await placeRow({
          projectId,
          taskId: parent.id,
          body: {
            title: name,
            start_date: draft.startDate || null,
            due_date: draft.dueDate || null,
          },
        }).unwrap()
        toast.success(m.created)
      } else {
        await createPhase({ projectId, body: { title: name } }).unwrap()
        toast.success(m.created)
      }
      onClose()
    } catch {
      toast.error(isCreate ? m.createFailed : m.saveFailed)
    }
  }

  const span =
    row?.startDate && row.dueDate
      ? intl.formatMessage(m.span, {
          start: formatDate(row.startDate),
          end: formatDate(row.dueDate),
        })
      : intl.formatMessage(m.noDates)

  return (
    <FormDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={
        parent
          ? intl.formatMessage(m.under, { phase: parent.title })
          : undefined
      }
      footer={
        editable || reportable ? (
          <ModalFormFooter
            formId={formId}
            submitLabel={isCreate ? m.create : m.save}
            isLoading={
              isUpdating || isCreatingPhase || isPlacing || isReporting
            }
            submitDisabled={draft.title.trim() === ''}
            onCancel={onClose}
          />
        ) : undefined
      }
    >
      <Stack gap="section" data-testid="row-drawer">
        <chakra.form id={formId} onSubmit={submit}>
          <Stack gap={4}>
            <FormField
              htmlFor={`${formId}-title`}
              label={intl.formatMessage(m.titleLabel)}
            >
              <Input
                id={`${formId}-title`}
                value={draft.title}
                disabled={!editable}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.currentTarget.value })
                }
              />
            </FormField>

            {isSubtask ? (
              <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
                <FormField
                  htmlFor={`${formId}-start`}
                  label={intl.formatMessage(m.startLabel)}
                >
                  <DateInput
                    id={`${formId}-start`}
                    value={draft.startDate || undefined}
                    disabled={!editable}
                    onValueChange={(startDate) =>
                      setDraft({ ...draft, startDate })
                    }
                  />
                </FormField>
                <FormField
                  htmlFor={`${formId}-due`}
                  label={intl.formatMessage(m.dueLabel)}
                >
                  <DateInput
                    id={`${formId}-due`}
                    value={draft.dueDate || undefined}
                    disabled={!editable}
                    onValueChange={(dueDate) => setDraft({ ...draft, dueDate })}
                  />
                </FormField>
              </Stack>
            ) : (
              row && (
                <ReadOnlyField label={intl.formatMessage(m.datesLabel)}>
                  <Stack gap={0.5}>
                    <Text size="sm">{span}</Text>
                    {(row as ReviewTask).subtasks.length > 0 && (
                      <Text size="xs" color="muted">
                        {intl.formatMessage(m.derivedDates)}
                      </Text>
                    )}
                  </Stack>
                </ReadOnlyField>
              )
            )}

            {reportable && (
              <ProgressPicker
                value={draft.progress}
                onChange={(progress) => setDraft({ ...draft, progress })}
              />
            )}
          </Stack>
        </chakra.form>

        {row && (
          <RowDependencies
            projectId={projectId}
            state={state}
            rowId={row.id}
            questions={exceptions.filter(
              (exception): exception is UnresolvedEdgeException =>
                exception.kind === 'unresolved_edge' &&
                exception.successorTaskId === row.id,
            )}
            readOnly={!canLink}
          />
        )}
      </Stack>
    </FormDrawer>
  )
}
