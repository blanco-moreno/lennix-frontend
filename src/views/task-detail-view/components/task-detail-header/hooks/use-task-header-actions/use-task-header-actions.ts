import { useState } from 'react'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import { useDeleteTaskMutation } from '@/services/task'
import type { Task } from '@/types'

import { taskDetailHeaderMessages as m } from '../../task-detail-header-messages'

/** The header's modal orchestration: the four open/close states and the delete flow. */
export function useTaskHeaderActions(task: Task, onBack: () => void) {
  const intl = useIntl()
  const [deleteTask] = useDeleteTaskMutation()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteTask({ id: task.id, projectId: task.projectId }).unwrap()
      toast.success(intl.formatMessage(m.taskDeleteSuccess), {
        id: m.taskDeleteSuccess.id,
      })
      onBack()
    } catch {
      toast.error(intl.formatMessage(m.taskDeleteError), {
        id: m.taskDeleteError.id,
      })
    }
  }

  return {
    showDeleteDialog,
    setShowDeleteDialog,
    showBudgetForm,
    setShowBudgetForm,
    showStatusModal,
    setShowStatusModal,
    showEditModal,
    setShowEditModal,
    handleDelete,
  }
}
