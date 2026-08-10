/**
 * The shell every tray item shares.
 *
 * One exception, one card, one mechanism inside it — the shape is uniform so
 * the differences the user reads are the questions themselves, not the layout.
 * Blocking items carry the warning border; optional ones stay neutral, because
 * loudness here is a function of consequence, not of how recently it appeared.
 */

import { Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card, Text } from '@/components'

import type { ReviewExceptionKind } from '../../review-exceptions'

export interface TrayCardProps {
  kind: ReviewExceptionKind
  blocking: boolean
  title: string
  body: string
  meta?: string
  children: ReactNode
}

export function TrayCard({
  kind,
  blocking,
  title,
  body,
  meta,
  children,
}: TrayCardProps) {
  return (
    <Card
      borderColor={blocking ? 'warning/40' : 'border'}
      bg={blocking ? 'warning/5' : 'bg.subtle'}
      borderLeftWidth="4px"
      borderLeftColor={blocking ? 'warning' : 'border'}
      data-testid="tray-card"
      data-exception-kind={kind}
      data-blocking={blocking ? 'true' : 'false'}
    >
      <Stack gap="tight">
        <Text weight="semibold" size="base" color="primary">
          {title}
        </Text>
        <Text size="sm" color="muted">
          {body}
        </Text>
        {meta && (
          <Text size="xs" color="muted">
            {meta}
          </Text>
        )}
        {children}
      </Stack>
    </Card>
  )
}
