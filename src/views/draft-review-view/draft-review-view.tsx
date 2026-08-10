import { Box } from '@chakra-ui/react'
import { useParams } from 'react-router'

import { DraftReviewCanvas } from '@/features'

/** `/drafts/:projectId/review` — the one home of a draft. */
export function DraftReviewView() {
  const { projectId = '' } = useParams<{ projectId: string }>()

  return (
    <Box minH="full" bg="bg.canvas" px="gutter" py="gutterY">
      {/* No reading column: the wizard is two columns of rows and dates, and
          a centred 6xl box left the schedule listing squeezed on a desktop
          while the page had room to spare. */}
      <DraftReviewCanvas projectId={projectId} />
    </Box>
  )
}
