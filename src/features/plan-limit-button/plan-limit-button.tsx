/**
 * A create button that explains itself when the plan is full.
 *
 * Deliberately NOT `disabled`: a disabled button fires no pointer events in
 * most browsers, so its tooltip never opens and the user is left with a dead
 * control and no reason. `aria-disabled` keeps the element focusable and
 * hoverable — the hint shows, screen readers announce the state — and the
 * click is swallowed here.
 *
 * It lives in `features/` rather than `components/ui/` because it reads the
 * plan itself: `src/components/` takes its data from props.
 */

import { useIntl } from 'react-intl'

import { Button, Tooltip, type ButtonProps } from '@/components'
import { usePlanLimit, type PlanLimitResource } from '@/hooks'

import { planLimitButtonMessages as m } from './plan-limit-button-messages'

export interface PlanLimitButtonProps extends ButtonProps {
  resource: PlanLimitResource
}

export function PlanLimitButton({
  resource,
  onClick,
  children,
  ...props
}: PlanLimitButtonProps) {
  const intl = useIntl()
  const { isAtLimit, used, max } = usePlanLimit(resource)

  if (!isAtLimit) {
    return (
      <Button onClick={onClick} {...props}>
        {children}
      </Button>
    )
  }

  // `max` is non-null whenever `isAtLimit` is true — unlimited never blocks.
  const reason = intl.formatMessage(m[resource], { used, max: max ?? used })

  return (
    <Tooltip content={reason}>
      <Button
        {...props}
        aria-disabled="true"
        aria-label={reason}
        opacity={0.5}
        cursor="not-allowed"
        onClick={(event) => event.preventDefault()}
        data-testid="plan-limit-blocked"
      >
        {children}
      </Button>
    </Tooltip>
  )
}
