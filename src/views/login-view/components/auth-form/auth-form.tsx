import { Box, Flex, chakra } from '@chakra-ui/react'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Checkbox, Alert, FormField, Label, Button } from '@/components'
import { Input } from '@/components/ui/input'
import { InputGroup } from '@/components/ui/input-group'
import { LOCAL_STORAGE_KEYS, PATHS } from '@/constants'
import { useZodResolverIntl } from '@/i18n'
import { getLastVisitedRoute, clearLastVisitedRoute } from '@/router'
import {
  loginSchema,
  authValidationMessages,
  type LoginFormValues,
} from '@/schemas'
import { useAuthActions } from '@/stores/hooks/use-auth'

import { authFormMessages } from './auth-form-messages'

export function AuthForm() {
  const intl = useIntl()
  const navigate = useNavigate()
  const { handleLogin } = useAuthActions()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const rememberedEmail =
    localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL) ?? ''
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: useZodResolverIntl(loginSchema, authValidationMessages),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      rememberMe: rememberedEmail !== '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError('')
    setIsLoading(true)
    try {
      await handleLogin(data.email, data.password, data.rememberMe)
      if (data.rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL, data.email)
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL)
      }
      const lastRoute = getLastVisitedRoute()
      clearLastVisitedRoute()
      // `/` and not `/dashboard`: which home this actor may open depends on a
      // role the `/auth/me` answer has not landed yet at this point, so the
      // decision belongs to `HomeRedirect`, behind `AuthGuard`.
      navigate(lastRoute || PATHS.HOME)
    } catch {
      const message = intl.formatMessage(authFormMessages.loginFailedToast)
      setError(message)
      toast.error(message, { id: authFormMessages.loginFailedToast.id })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <chakra.form
      onSubmit={handleSubmit(onSubmit)}
      display="flex"
      flexDirection="column"
      // `field` between one field and the next; the submit block buys its own
      // air below.
      gap="field"
      noValidate
    >
      {error && (
        <Alert variant="error" icon={AlertCircle}>
          {error}
        </Alert>
      )}

      <FormField
        htmlFor="email"
        label={<FormattedMessage {...authFormMessages.emailLabel} />}
        error={errors.email?.message}
      >
        <InputGroup startIcon={<Box as={Mail} boxSize={4} />}>
          <Input
            id="email"
            type="text"
            size="lg"
            placeholder={intl.formatMessage(authFormMessages.emailPlaceholder)}
            disabled={isLoading}
            autoComplete="username"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </InputGroup>
      </FormField>

      <FormField
        htmlFor="password"
        label={<FormattedMessage {...authFormMessages.passwordLabel} />}
        error={errors.password?.message}
      >
        <InputGroup
          startIcon={<Box as={Lock} boxSize={4} />}
          endIcon={
            <chakra.button
              type="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              // A gloved thumb on a tablet: the toggle is a target, not a glyph.
              boxSize="touch"
              rounded="md"
              color="fg.muted"
              transition="color 0.2s"
              _hover={{ color: 'fg.default' }}
              _focusVisible={{
                outline: 'none',
                color: 'fg.default',
                boxShadow: '0 0 0 3px {colors.ring/50}',
              }}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-pressed={showPassword}
              aria-label={intl.formatMessage(
                showPassword
                  ? authFormMessages.hidePassword
                  : authFormMessages.showPassword,
              )}
            >
              <Box as={showPassword ? EyeOff : Eye} boxSize={4} />
            </chakra.button>
          }
        >
          <Input
            id="password"
            size="lg"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </InputGroup>
      </FormField>

      {/* Row reserved for "forgot password" on the right once the view exists. */}
      <Flex align="center" justify="space-between" minH="touch" gap={4}>
        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <Flex align="center" gap={2}>
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                color="fg.muted"
                cursor="pointer"
                fontSize="sm"
              >
                <FormattedMessage {...authFormMessages.rememberMe} />
              </Label>
            </Flex>
          )}
        />
      </Flex>

      <Button
        type="submit"
        size="lg"
        w="full"
        minH="touch"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Box
              as={Loader2}
              boxSize={4}
              animation="spin 1s linear infinite"
              _motionReduce={{ animation: 'none' }}
            />
            <FormattedMessage {...authFormMessages.submitLoading} />
          </>
        ) : (
          <FormattedMessage {...authFormMessages.submit} />
        )}
      </Button>
    </chakra.form>
  )
}
