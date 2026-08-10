import { defineMessages } from 'react-intl'

export const authFormMessages = defineMessages({
  emailLabel: {
    id: 'authForm.emailLabel',
    defaultMessage: 'Email',
    description: 'Label for the email field in the login form',
  },
  emailPlaceholder: {
    id: 'authForm.emailPlaceholder',
    defaultMessage: 'username or email',
    description: 'Placeholder for the email field in the login form',
  },
  passwordLabel: {
    id: 'authForm.passwordLabel',
    defaultMessage: 'Password',
    description: 'Label for the password field in the login form',
  },
  showPassword: {
    id: 'authForm.showPassword',
    defaultMessage: 'Show password',
    description: 'Accessible label of the reveal-password toggle',
  },
  hidePassword: {
    id: 'authForm.hidePassword',
    defaultMessage: 'Hide password',
    description: 'Accessible label of the toggle while the password is visible',
  },
  rememberMe: {
    id: 'authForm.rememberMe',
    defaultMessage: 'Remember me',
    description:
      'Checkbox in the login form that keeps the session active when the browser closes',
  },
  submit: {
    id: 'authForm.submit',
    defaultMessage: 'Sign in',
    description: 'Primary button of the login form',
  },
  submitLoading: {
    id: 'authForm.submitLoading',
    defaultMessage: 'Signing in…',
    description: 'Primary button label while the login request is in flight',
  },
  loginFailedToast: {
    id: 'authForm.loginFailedToast',
    defaultMessage: 'Could not sign in. Please check your credentials.',
    description: 'Toast and alert shown when the login request fails',
  },
})
