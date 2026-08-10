import { Box, Flex, Stack } from '@chakra-ui/react'
import { Copy, KeyRound, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Text } from '@/components'
import { Modal } from '@/components/ui/modal'

import { teamManagementViewMessages } from '../../team-management-view-messages'

export interface MemberCredentials {
  email: string
  password: string
}

interface MemberCredentialsDialogProps {
  /** Null keeps the dialog closed. */
  credentials: MemberCredentials | null
  onClose: () => void
}

/** Shows the temporary credentials after a successful create, so the admin
 *  can copy/share them with the new user. */
export function MemberCredentialsDialog({
  credentials,
  onClose,
}: MemberCredentialsDialogProps) {
  const intl = useIntl()

  const handleCopy = async () => {
    if (!credentials) return
    const text = intl.formatMessage(
      teamManagementViewMessages.credentialsCopyText,
      { email: credentials.email, password: credentials.password },
    )
    try {
      await navigator.clipboard.writeText(text)
      toast.success(
        intl.formatMessage(teamManagementViewMessages.credentialsCopiedToast),
        { id: teamManagementViewMessages.credentialsCopiedToast.id },
      )
    } catch {
      toast.error(
        intl.formatMessage(teamManagementViewMessages.credentialsCopyError),
        { id: teamManagementViewMessages.credentialsCopyError.id },
      )
    }
  }

  return (
    <Modal
      variant="classic"
      open={credentials !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      size="sm"
      title={intl.formatMessage(teamManagementViewMessages.memberCreatedTitle)}
      description={intl.formatMessage(
        teamManagementViewMessages.memberCreatedDescription,
      )}
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleCopy}
            w={{ base: 'full', sm: 'auto' }}
          >
            <Box as={Copy} boxSize={4} mr={2} />
            <FormattedMessage {...teamManagementViewMessages.copyCredentials} />
          </Button>
          <Button onClick={onClose}>
            <FormattedMessage {...teamManagementViewMessages.done} />
          </Button>
        </>
      }
    >
      {credentials && (
        <Stack gap="tight">
          <Flex bg="bg.muted" align="start" gap="tight" rounded="lg" p={3}>
            <Box
              as={Mail}
              boxSize={4}
              mt={0.5}
              color="fg.muted"
              flexShrink={0}
            />
            <Box minW={0} flex={1}>
              <Text size="xs" color="muted">
                <FormattedMessage
                  {...teamManagementViewMessages.credentialEmailLabel}
                />
              </Text>
              <Text size="sm" weight="medium" wordBreak="break-all">
                {credentials.email}
              </Text>
            </Box>
          </Flex>
          <Flex bg="bg.muted" align="start" gap="tight" rounded="lg" p={3}>
            <Box
              as={KeyRound}
              boxSize={4}
              mt={0.5}
              color="fg.muted"
              flexShrink={0}
            />
            <Box minW={0} flex={1}>
              <Text size="xs" color="muted">
                <FormattedMessage
                  {...teamManagementViewMessages.tempPasswordLabel}
                />
              </Text>
              <Text
                size="sm"
                weight="medium"
                fontFamily="mono"
                wordBreak="break-all"
              >
                {credentials.password}
              </Text>
            </Box>
          </Flex>
        </Stack>
      )}
    </Modal>
  )
}
