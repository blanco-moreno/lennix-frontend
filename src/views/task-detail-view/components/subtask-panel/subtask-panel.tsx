import { Box, Flex, Stack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useSearchParams } from 'react-router'

import {
  Button,
  EmptyState,
  ListRowSkeleton,
  Heading,
  RequirePermission,
} from '@/components'
import { Modal } from '@/components/ui/modal'
import { SubtaskQuickEditForm } from '@/features'
import { usePermission } from '@/hooks'
import { TASK_SUBTASK_PARAM } from '@/router'
import { useListSubtasksQuery, useDeleteSubtaskMutation } from '@/services/task'
import type { Subtask } from '@/types'

import { taskDetailViewMessages } from '../../task-detail-view-messages'
import { SubtaskCancelForm } from '../subtask-cancel-form'
import { SubtaskCreateForm } from '../subtask-create-form'
import { SubtaskProgressForm } from '../subtask-progress-form'

import { SubtaskFilters } from './components/subtask-filters'
import { SubtaskListHeader } from './components/subtask-list-header'
import { SubtaskRow } from './components/subtask-row'
import { SUBTASK_GRID_COLUMNS } from './subtask-grid'
import { subtaskPanelMessages as m } from './subtask-panel-messages'

interface SubtaskPanelProps {
  taskId: string
  /** The main activity these subactivities hang off — for drawer context. */
  taskTitle: string
  projectId: string
}

export function SubtaskPanel({
  taskId,
  taskTitle,
  projectId,
}: SubtaskPanelProps) {
  const intl = useIntl()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: subtasks = [], isLoading } = useListSubtasksQuery(taskId)
  const [deleteSubtask] = useDeleteSubtaskMutation()
  const canEditTask = usePermission('task.edit')
  const canDeleteTask = usePermission('task.delete')
  // Role-scoped access, second half — neither opener had a permission check;
  // `task.registerProgress` was declared but never consulted anywhere.
  const canRegisterProgress = usePermission('task.registerProgress')

  // `?subtask=` is a filter here: the URL selected one row, so the list
  // shows exactly that row. Reset clears it with the rest.
  const subtaskId = searchParams.get(TASK_SUBTASK_PARAM)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  // While the URL selects a row, the search box SHOWS that row's name — the
  // applied filter must be visible, not a mystery narrowing the list. Typing
  // hands the box back to the user: the id filter drops and the text is a
  // plain search from there on.
  const selectedSubtask =
    subtasks.find((subtask) => subtask.id === subtaskId) ?? null
  const searchValue = selectedSubtask?.title ?? search
  const handleSearch = (value: string) => {
    if (subtaskId !== null) {
      const next = new URLSearchParams(searchParams)
      next.delete(TASK_SUBTASK_PARAM)
      setSearchParams(next, { replace: true })
    }
    setSearch(value)
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return subtasks.filter(
      (subtask) =>
        (!subtaskId || subtask.id === subtaskId) &&
        (status === 'all' || subtask.status === status) &&
        (term === '' ||
          subtask.title.toLowerCase().includes(term) ||
          (subtask.assigneeName ?? '').toLowerCase().includes(term)),
    )
  }, [subtasks, subtaskId, status, search])

  const hasActiveFilters =
    subtaskId !== null || search !== '' || status !== 'all'

  const resetFilters = () => {
    setSearch('')
    setStatus('all')
    if (subtaskId !== null) {
      const next = new URLSearchParams(searchParams)
      next.delete(TASK_SUBTASK_PARAM)
      setSearchParams(next, { replace: true })
    }
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null)
  const [progressSubtaskId, setProgressSubtaskId] = useState<string | null>(
    null,
  )
  const progressSubtask =
    subtasks.find((s) => s.id === progressSubtaskId) ?? null
  const [deletingSubtask, setDeletingSubtask] = useState<Subtask | null>(null)
  // Cancelling is a decision to stop, not a point on the 0-100 axis, so it
  // is its own action here — a drawer at the subactivity's level.
  const [cancellingSubtask, setCancellingSubtask] = useState<Subtask | null>(
    null,
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteSubtask({ id, taskId, projectId }).unwrap()
      toast.success(intl.formatMessage(m.subtaskDeleteSuccess), {
        id: m.subtaskDeleteSuccess.id,
      })
      setDeletingSubtask(null)
    } catch {
      toast.error(intl.formatMessage(m.subtaskDeleteError), {
        id: m.subtaskDeleteError.id,
      })
    }
  }

  return (
    <Stack gap={4}>
      {/* Header */}
      {/* Side by side where there is room; on a phone the action takes its
          own line rather than squeezing the heading into two. */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'center' }}
        justify={{ lg: 'space-between' }}
        gap={3}
      >
        <Heading size="h3" weight="semibold" color="primary">
          <FormattedMessage
            {...m.subtasksHeading}
            values={{ count: subtasks.length }}
          />
        </Heading>
        <RequirePermission permission="task.create">
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            alignSelf={{ base: 'flex-start', lg: 'auto' }}
          >
            <Box as={Plus} boxSize={4} mr={1} />
            <FormattedMessage {...m.addSubtaskButton} />
          </Button>
        </RequirePermission>
      </Flex>

      {subtasks.length > 0 && (
        <SubtaskFilters
          total={subtasks.length}
          filtered={filtered.length}
          search={searchValue}
          onSearch={handleSearch}
          status={status}
          onStatus={setStatus}
          isActive={hasActiveFilters}
          onReset={resetFilters}
        />
      )}

      {/* Modals */}
      <SubtaskCreateForm
        taskId={taskId}
        parentTitle={taskTitle}
        projectId={projectId}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      {editingSubtask && (
        <SubtaskQuickEditForm
          subtask={editingSubtask}
          projectId={projectId}
          open
          onOpenChange={(open) => {
            if (!open) setEditingSubtask(null)
          }}
        />
      )}
      <SubtaskProgressForm
        subtask={progressSubtask}
        projectId={projectId}
        open={progressSubtask !== null}
        onOpenChange={(open) => {
          if (!open) setProgressSubtaskId(null)
        }}
      />
      {/* Delete Confirmation — shared across all subtasks */}
      <Modal
        variant="confirmation"
        open={deletingSubtask !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSubtask(null)
        }}
        title={<FormattedMessage {...m.subtaskDeleteDialogTitle} />}
        description={
          <FormattedMessage
            {...m.subtaskDeleteDialogDescription}
            values={{ name: deletingSubtask?.title ?? '' }}
          />
        }
        cancelLabel={<FormattedMessage {...taskDetailViewMessages.cancel} />}
        confirmLabel={
          <FormattedMessage {...taskDetailViewMessages.deleteAction} />
        }
        onConfirm={async () => {
          if (deletingSubtask) await handleDelete(deletingSubtask.id)
        }}
      />

      {/* Cancel / reopen — a drawer at the subactivity's own level */}
      {cancellingSubtask && (
        <SubtaskCancelForm
          subtask={cancellingSubtask}
          projectId={projectId}
          open
          onOpenChange={(open) => {
            if (!open) setCancellingSubtask(null)
          }}
        />
      )}

      {/* Subtask listing. The skeleton replaces the rows, never the heading
          and the filters above them — the panel is there either way. */}
      {isLoading ? (
        <Box
          role="presentation"
          aria-busy
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
          bg="bg.panel"
        >
          <SubtaskListHeader />
          <ListRowSkeleton templateColumns={SUBTASK_GRID_COLUMNS} count={3} />
        </Box>
      ) : subtasks.length === 0 ? (
        <EmptyState
          title={intl.formatMessage(m.noSubtasksTitle)}
          description={intl.formatMessage(m.noSubtasksDescription)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={intl.formatMessage(m.subtaskNoMatchesTitle)}
          description={intl.formatMessage(m.subtaskNoMatchesDescription)}
        />
      ) : (
        <Box
          role="table"
          aria-label={intl.formatMessage(m.subtaskTableLabel)}
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
          bg="bg.panel"
        >
          <SubtaskListHeader />
          {filtered.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              projectId={projectId}
              canEditTask={canEditTask}
              canDeleteTask={canDeleteTask}
              canRegisterProgress={canRegisterProgress}
              onEdit={() => setEditingSubtask(subtask)}
              onReportProgress={() => setProgressSubtaskId(subtask.id)}
              onDelete={() => setDeletingSubtask(subtask)}
              onCancelToggle={() => setCancellingSubtask(subtask)}
            />
          ))}
        </Box>
      )}
    </Stack>
  )
}
