import { Box } from '@chakra-ui/react'

import { ImportUploadCanvas } from '@/features'

export function ProjectImportView() {
  return (
    <Box minH="full" bg="bg.canvas" px="gutter" py="gutterY">
      <ImportUploadCanvas />
    </Box>
  )
}
