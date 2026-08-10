import { Box, Flex } from '@chakra-ui/react'
import { TriangleAlert } from 'lucide-react'
import { useIntl } from 'react-intl'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

import { Button, Card, EmptyState, Text } from '@/components'
import { PATHS } from '@/constants'

import { routeErrorMessages as m } from './route-error-boundary-messages'

/** Best-effort technical detail, shown in dev only. */
function describeError(error: unknown): string | null {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return error.message
  return null
}

/**
 * Per-route error boundary.
 *
 * Wired as the `errorElement` of every leaf route (see `routes.tsx`), so a
 * render error inside one screen degrades to this card *inside* the app shell
 * — the sidebar and navigation stay usable — instead of blanking the whole app
 * via the last-resort boundary in `App.tsx`.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const intl = useIntl()
  const navigate = useNavigate()
  const detail = import.meta.env.DEV ? describeError(error) : null

  return (
    <Flex
      p="gutter"
      align="flex-start"
      justify="center"
      h="100%"
      overflowY="auto"
      gap={2}
    >
      <Card maxW="lg" w="100%" role="alert">
        <EmptyState
          icon={TriangleAlert}
          title={intl.formatMessage(m.title)}
          description={intl.formatMessage(m.description)}
        />
        {detail && (
          <Box px={6} pb={4} textAlign="center">
            <Text color="muted" size="sm">
              {detail}
            </Text>
          </Box>
        )}
        <Flex px={6} pb={6} gap="tight" justify="center">
          <Button size="sm" onClick={() => void navigate(0)}>
            {intl.formatMessage(m.retry)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void navigate(PATHS.PROJECTS)}
          >
            {intl.formatMessage(m.backToProjects)}
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}
