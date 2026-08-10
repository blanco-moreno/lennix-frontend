/**
 * The ONE project-list home. Drafts have their own home (Borradores); this
 * lists live projects, nothing else.
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { Text, RequirePermission } from '@/components'
import { PATHS } from '@/constants'
import { PlanLimitButton, PlanUsageMeter } from '@/features'

import { ProjectList } from './components/project-list'
import { projectsViewMessages } from './projects-view-messages'

export function ProjectsView() {
  const navigate = useNavigate()

  return (
    // Same view rhythm as /tasks: one padding scale, one gap, filters first.
    <Stack gap="block" px="gutter" py="gutterY">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap={4}
        align={{ sm: 'center' }}
        justify={{ sm: 'space-between' }}
      >
        <Text size="lg" color="muted">
          <FormattedMessage {...projectsViewMessages.subtitle} />
        </Text>

        <RequirePermission permission="project.create">
          {/* An import lands a DRAFT — the live-project ceiling is charged at
              go-live, so this is the draft cap, not the project one. */}
          <PlanLimitButton
            resource="drafts"
            onClick={async () => navigate(PATHS.PROJECT_IMPORT)}
          >
            <Box as={Plus} boxSize={4} mr={2} />
            <FormattedMessage {...projectsViewMessages.newProject} />
          </PlanLimitButton>
        </RequirePermission>
      </Flex>

      <PlanUsageMeter resource="projects" />

      <ProjectList />
    </Stack>
  )
}
