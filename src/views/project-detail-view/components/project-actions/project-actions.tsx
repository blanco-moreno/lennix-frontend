import { Box } from '@chakra-ui/react'
import {
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Archive,
  ArchiveRestore,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, DropdownMenu } from '@/components'
import { Modal } from '@/components/ui/modal'
import { PATHS } from '@/constants'
import { TaskCreateDrawer, taskCreateMessages } from '@/features'
import { usePermission } from '@/hooks'
import {
  useDeleteProjectMutation,
  useArchiveProjectMutation,
  useUnarchiveProjectMutation,
} from '@/services/project'
import type { Project } from '@/types'
import { getDestructiveActionTextColor } from '@/utils'

import { projectDetailViewMessages } from '../../project-detail-view-messages'
import { ProjectEditDrawer } from '../project-edit-drawer'

import { projectActionsMessages as m } from './project-actions-messages'

interface ProjectActionsProps {
  project: Project
}

/**
 * The project's own actions — edit, archive, delete — with the modals they
 * open. Rendered in the detail header, beside the name: they are things you
 * do *to* what you are reading, same as the activity page's actions.
 */
export function ProjectActions({ project }: ProjectActionsProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  // Priority and budget are inline fields of the edit drawer, so the drawer
  // opens for anyone who can touch at least one of its fields: edit, priority,
  // or budget — directly (owner/admin/manager) or via an approval request
  // (`user`).
  const canEditProject = usePermission('project.edit')
  const canChangePriority = usePermission('project.changePriority')
  const canEditBudgetDirect = usePermission('budget.edit.direct')
  const canEditBudgetRequest = usePermission('budget.edit.request')
  const canEditBudget = canEditBudgetDirect || canEditBudgetRequest
  const canOpenEditor = canEditProject || canChangePriority || canEditBudget
  const canDeleteProject = usePermission('project.delete')
  const canCreateTask = usePermission('task.create')

  const [deleteProject] = useDeleteProjectMutation()
  const [archiveProject] = useArchiveProjectMutation()
  const [unarchiveProject] = useUnarchiveProjectMutation()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteProject(project.id).unwrap()
      toast.success(intl.formatMessage(m.deleteSuccess), {
        id: m.deleteSuccess.id,
      })
      navigate(PATHS.PROJECTS)
    } catch {
      toast.error(intl.formatMessage(m.deleteError), { id: m.deleteError.id })
    }
  }

  const handleArchive = async () => {
    try {
      await archiveProject(project.id).unwrap()
      toast.success(intl.formatMessage(m.archiveSuccess), {
        id: m.archiveSuccess.id,
      })
    } catch {
      toast.error(intl.formatMessage(m.archiveError), { id: m.archiveError.id })
    }
  }

  const handleUnarchive = async () => {
    try {
      await unarchiveProject(project.id).unwrap()
      toast.success(intl.formatMessage(m.unarchiveSuccess), {
        id: m.unarchiveSuccess.id,
      })
    } catch {
      toast.error(intl.formatMessage(m.unarchiveError), {
        id: m.unarchiveError.id,
      })
    }
  }

  if (!canOpenEditor && !canCreateTask) return null

  return (
    <>
      <DropdownMenu
        trigger={
          <Button
            variant="outline"
            size="sm"
            aria-label={intl.formatMessage(m.moreActions)}
          >
            <Box as={MoreVertical} boxSize={4} />
          </Button>
        }
        align="end"
        items={[
          ...(canCreateTask
            ? [
                {
                  icon: Plus,
                  label: (
                    <FormattedMessage {...taskCreateMessages.newActivity} />
                  ),
                  onSelect: () => setShowCreateTask(true),
                },
              ]
            : []),
          ...(canOpenEditor
            ? [
                {
                  icon: Pencil,
                  label: <FormattedMessage {...m.editProject} />,
                  onSelect: () => setShowEditModal(true),
                },
              ]
            : []),
          ...(canEditProject && project.status === 'completed'
            ? [
                {
                  icon: Archive,
                  label: <FormattedMessage {...m.archiveProject} />,
                  onSelect: handleArchive,
                },
              ]
            : []),
          ...(canEditProject && project.status === 'archived'
            ? [
                {
                  icon: ArchiveRestore,
                  label: <FormattedMessage {...m.unarchiveProject} />,
                  onSelect: handleUnarchive,
                },
              ]
            : []),
          ...(canDeleteProject
            ? [
                { type: 'separator' as const },
                {
                  icon: Trash2,
                  label: <FormattedMessage {...m.deleteProject} />,
                  onSelect: () => setShowDeleteDialog(true),
                  itemProps: getDestructiveActionTextColor(),
                },
              ]
            : []),
        ]}
      />

      {/* Delete Confirmation */}
      <Modal
        variant="confirmation"
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={<FormattedMessage {...m.deleteDialogTitle} />}
        description={
          <FormattedMessage
            {...m.deleteDialogDescription}
            values={{ name: project.name }}
          />
        }
        cancelLabel={<FormattedMessage {...projectDetailViewMessages.cancel} />}
        confirmLabel={<FormattedMessage {...m.confirmDelete} />}
        onConfirm={handleDelete}
      />

      {/* Edit Modal */}
      <ProjectEditDrawer
        project={project}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />

      {/* New activity */}
      <TaskCreateDrawer
        projectId={project.id}
        projectName={project.name}
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
      />
    </>
  )
}
