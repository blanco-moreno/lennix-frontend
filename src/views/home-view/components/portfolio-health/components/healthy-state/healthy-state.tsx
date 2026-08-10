import { CheckCircle2 } from 'lucide-react'
import { useIntl } from 'react-intl'

import { EmptyState } from '@/components'

import { portfolioHealthMessages as m } from '../../portfolio-health-messages'

export function HealthyState() {
  const intl = useIntl()
  return (
    <EmptyState
      icon={CheckCircle2}
      title={intl.formatMessage(m.healthyTitle)}
      description={intl.formatMessage(m.healthyDescription)}
    />
  )
}
