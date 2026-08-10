import { defineMessages } from 'react-intl'

/**
 * Copy raised by the auth actions themselves — the two toasts that mark the
 * beginning and the end of a session.
 */
export const authSessionMessages = defineMessages({
  loginSuccess: {
    id: 'authSession.loginSuccess',
    defaultMessage: 'Welcome',
    description: 'Toast shown once the user has signed in',
  },
  logoutSuccess: {
    id: 'authSession.logoutSuccess',
    defaultMessage: 'Signed out',
    description: 'Toast shown once the user has signed out',
  },
})
