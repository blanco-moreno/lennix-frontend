import type { MessageDescriptor } from 'react-intl'

import type { Risk, RiskSeverity } from '@/types'

import { riskRegisterMessages as m } from './risk-register-messages'

export const SEVERITY_BADGE: Record<
  RiskSeverity,
  'success' | 'warning' | 'critical-soft'
> = {
  low: 'success',
  medium: 'warning',
  high: 'critical-soft',
}

export const STATUS_LABEL: Record<Risk['status'], MessageDescriptor> = {
  open: m.statusOpen,
  mitigating: m.statusMitigating,
  closed: m.statusClosed,
}

export const LEVEL_LABEL = {
  low: m.levelLow,
  medium: m.levelMedium,
  high: m.levelHigh,
} as const

export const STRATEGY_LABEL = {
  avoid: m.strategyAvoid,
  mitigate: m.strategyMitigate,
  transfer: m.strategyTransfer,
  accept: m.strategyAccept,
} as const
