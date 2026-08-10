import { Box } from '@chakra-ui/react'
import { useParams } from 'react-router'

import { AssistedMapping } from '@/features'

/** `/imports/:jobId/mapping` — where the quality floor diverts. */
export function ImportAssistedMappingView() {
  const { jobId = '' } = useParams<{ jobId: string }>()

  return (
    <Box minH="full" bg="bg.canvas" px="gutter" py="gutterY">
      <AssistedMapping jobId={jobId} />
    </Box>
  )
}
