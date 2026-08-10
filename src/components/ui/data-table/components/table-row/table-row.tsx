import { chakra } from '@chakra-ui/react'
import * as React from 'react'

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <chakra.tr
      borderBottomWidth="1px"
      borderColor="border"
      transition="colors"
      _hover={{ bg: 'bg.muted/50' }}
    >
      {children}
    </chakra.tr>
  )
}

export { TableRow }
