import { defineMessages } from 'react-intl'

export const permissionGuardMessages = defineMessages({
  noAccessTitle: {
    id: 'permissionGuard.noAccessTitle',
    defaultMessage: 'You do not have access to this section',
    description: 'Title of the page shown instead of a permission-gated route',
  },
  noAccessBody: {
    id: 'permissionGuard.noAccessBody',
    defaultMessage:
      'Your role does not include it. Ask an Admin of your organization for access.',
    description:
      'Body of the no-access page — what happened and who can fix it',
  },
  noAccessAction: {
    id: 'permissionGuard.noAccessAction',
    defaultMessage: 'Go to projects',
    description: 'Action on the no-access page: back to the common landing',
  },
})
