import { Drawer as ChakraDrawer, Icon } from '@chakra-ui/react'

import type { FormDrawerProps } from '../../drawer'

function DrawerHeader({
  title,
  description,
  icon,
  iconColor,
}: Pick<FormDrawerProps, 'title' | 'description' | 'icon' | 'iconColor'>) {
  if (!title && !description) return null
  return (
    <ChakraDrawer.Header
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={1}
      pe={10}
      borderBottomWidth="1px"
      borderColor="border"
    >
      {title && (
        <ChakraDrawer.Title
          display={icon ? 'flex' : undefined}
          alignItems="center"
          gap={2}
        >
          {icon && <Icon as={icon} boxSize={5} color={iconColor} />}
          {title}
        </ChakraDrawer.Title>
      )}
      {description && (
        <ChakraDrawer.Description>{description}</ChakraDrawer.Description>
      )}
    </ChakraDrawer.Header>
  )
}

export { DrawerHeader }
