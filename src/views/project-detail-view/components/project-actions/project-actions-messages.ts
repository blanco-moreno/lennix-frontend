import { defineMessages } from 'react-intl'

/** Catalog for the project actions menu and the header lines the view renders. */
export const projectActionsMessages = defineMessages({
  editProject: {
    id: 'projectDetail.editProject',
    defaultMessage: 'Edit project',
    description: 'Dropdown action on the project detail header',
  },
  archiveProject: {
    id: 'projectDetail.archiveProject',
    defaultMessage: 'Archive project',
    description: 'Dropdown action on the project detail header',
  },
  unarchiveProject: {
    id: 'projectDetail.unarchiveProject',
    defaultMessage: 'Unarchive project',
    description: 'Dropdown action on the project detail header',
  },
  deleteProject: {
    id: 'projectDetail.deleteProject',
    defaultMessage: 'Delete project',
    description: 'Dropdown action on the project detail header',
  },
  managerPrefix: {
    id: 'projectDetail.managerPrefix',
    defaultMessage: 'Manager: ',
    description: 'Prefix shown before the manager name on the header',
  },
  priorityPrefix: {
    id: 'projectDetail.priorityPrefix',
    defaultMessage: 'Priority: ',
    description: 'Prefix shown before the priority badge on the header',
  },
  deleteDialogTitle: {
    id: 'projectDetail.deleteDialogTitle',
    defaultMessage: 'Delete project',
    description: 'Title of the delete-project confirmation dialog',
  },
  deleteDialogDescription: {
    id: 'projectDetail.deleteDialogDescription',
    defaultMessage:
      'Are you sure you want to delete "{name}"? All related activities, subactivities and expenses will be removed.',
    description: 'Body of the delete-project confirmation dialog',
  },
  confirmDelete: {
    id: 'projectDetail.confirmDelete',
    defaultMessage: 'Delete',
    description: 'Confirm button in the delete-project dialog',
  },
  deleteSuccess: {
    id: 'projectDetail.deleteSuccess',
    defaultMessage: 'Project deleted',
    description: 'Toast after a project is deleted',
  },
  deleteError: {
    id: 'projectDetail.deleteError',
    defaultMessage: 'Could not delete the project',
    description: 'Toast when deleting a project fails',
  },
  archiveSuccess: {
    id: 'projectDetail.archiveSuccess',
    defaultMessage: 'Project archived',
    description: 'Toast after archiving a project',
  },
  archiveError: {
    id: 'projectDetail.archiveError',
    defaultMessage: 'Could not archive the project',
    description: 'Toast when archiving fails',
  },
  unarchiveSuccess: {
    id: 'projectDetail.unarchiveSuccess',
    defaultMessage: 'Project unarchived',
    description: 'Toast after unarchiving a project',
  },
  unarchiveError: {
    id: 'projectDetail.unarchiveError',
    defaultMessage: 'Could not unarchive the project',
    description: 'Toast when unarchiving fails',
  },
})
