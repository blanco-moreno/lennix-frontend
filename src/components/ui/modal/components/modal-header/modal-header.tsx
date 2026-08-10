import { Dialog as ChakraDialog, Icon } from '@chakra-ui/react'

import type { CommonModalProps } from '../../modal'

function ModalHeader({
  title,
  description,
  icon,
  iconColor,
}: Pick<CommonModalProps, 'title' | 'description' | 'icon' | 'iconColor'>) {
  if (!title && !description) return null
  return (
    <ChakraDialog.Header
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={1}
      pe={10}
    >
      {title && (
        <ChakraDialog.Title
          display={icon ? 'flex' : undefined}
          alignItems="center"
          gap={2}
        >
          {icon && <Icon as={icon} boxSize={5} color={iconColor} />}
          {title}
        </ChakraDialog.Title>
      )}
      {description && (
        <ChakraDialog.Description>{description}</ChakraDialog.Description>
      )}
    </ChakraDialog.Header>
  )
}

export { ModalHeader }
