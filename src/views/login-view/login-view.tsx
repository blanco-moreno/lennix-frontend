import { useIntl } from 'react-intl'

import { AuthFormPublicLayout } from '@/components'

import { AuthForm } from './components/auth-form'
import { loginViewMessages } from './login-view-messages'

export function LoginView() {
  const intl = useIntl()

  return (
    <AuthFormPublicLayout
      title={intl.formatMessage(loginViewMessages.pageTitle)}
      description={intl.formatMessage(loginViewMessages.pageDescription)}
    >
      <AuthForm />
    </AuthFormPublicLayout>
  )
}
