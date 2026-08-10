import { Dialog as ChakraDialog, Icon } from '@chakra-ui/react'
import { X } from 'lucide-react'

function ModalCloseButton() {
  return (
    <ChakraDialog.CloseTrigger
      aria-label="Cerrar"
      position="absolute"
      top={3}
      insetEnd={3}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize={8}
      rounded="md"
      color="fg.muted"
      cursor="pointer"
      _hover={{ bg: 'accent', color: 'accent.fg' }}
    >
      <Icon as={X} boxSize={4} />
    </ChakraDialog.CloseTrigger>
  )
}

export { ModalCloseButton }
