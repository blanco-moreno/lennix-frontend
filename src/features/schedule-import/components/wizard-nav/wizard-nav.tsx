/**
 * The wizard's controls: a bar pinned to the foot of the screen on a phone,
 * and the block under the stepper in the sticky column from `lg`.
 *
 * One place for the primary action of every step — Next on the first three,
 * Activate on the last — so it is never something the user has to scroll a
 * 200-row schedule to find. That promise is why the bar is sticky below `lg`:
 * laid out in flow it would sit above the schedule and scroll away for good.
 * Next is shown disabled rather than hidden when the
 * draft cannot reach the step after this one: a control that disappears is a
 * question the user cannot ask.
 *
 * "Save and continue later" is the draft's ONE save. It writes whatever the
 * wizard is holding — the header's identity edits and the budget step's
 * amounts alike — and only then leaves. Navigating away without writing makes
 * the button whose name promises a save the one that discards.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Text } from '@/components'
import { PATHS } from '@/constants'
import { PlanLimitButton } from '@/features/plan-limit-button'

import type { DraftSaveOutcome } from '../../hooks/use-draft-edits'

import { wizardNavMessages as m } from './wizard-nav-messages'

export interface WizardNavProps {
  onBack?: () => void
  onNext?: () => void
  /** Next exists but the draft cannot reach it yet. */
  nextDisabled?: boolean
  /** Present only on the last step — it replaces Next. */
  onActivate?: () => void | Promise<void>
  isActivating?: boolean
  /** Writes everything the wizard is holding. Resolves to what happened. */
  onSave: () => Promise<DraftSaveOutcome>
  isSaving?: boolean
  /** How many fields the save would write — `0` hides the count. */
  pending?: number
  saveOutcome?: DraftSaveOutcome | null
}

export function WizardNav({
  onBack,
  onNext,
  nextDisabled = false,
  onActivate,
  isActivating = false,
  onSave,
  isSaving = false,
  pending = 0,
  saveOutcome = null,
}: WizardNavProps) {
  const intl = useIntl()
  const navigate = useNavigate()

  // Save, then leave — and stay put if the save failed, so the user is not
  // sent to the drafts list to discover the loss there.
  const saveAndLeave = async () => {
    const outcome = await onSave()
    if (outcome.kind === 'saved' || outcome.kind === 'noop') {
      await navigate(PATHS.DRAFTS)
    }
  }

  return (
    <Stack
      gap={2}
      data-testid="wizard-nav"
      // Below `lg` the canvas lays this out as the last item of a single
      // column, so `order` puts it after the schedule it acts on.
      order={{ base: 3, lg: 'initial' }}
      position={{ base: 'sticky', lg: 'static' }}
      bottom={0}
      zIndex="sticky"
      bg={{ base: 'bg.panel', lg: 'transparent' }}
      borderTopWidth={{ base: '1px', lg: 0 }}
      borderColor="border"
      px={{ base: 'tight', lg: 0 }}
      pt={{ base: 'tight', lg: 0 }}
      // Clear of the iPhone home indicator.
      pb={{ base: 'calc(0.75rem + env(safe-area-inset-bottom))', lg: 0 }}
    >
      {onActivate ? (
        // Go-live is what charges the LIVE-project quota. Gated as a courtesy;
        // the 400 path in `useActivateDraft` stays the real backstop.
        <PlanLimitButton
          resource="projects"
          size="lg"
          onClick={() => void onActivate()}
          disabled={isActivating}
        >
          {intl.formatMessage(isActivating ? m.activating : m.activate)}
        </PlanLimitButton>
      ) : (
        (onNext || nextDisabled) && (
          <Button onClick={onNext} disabled={nextDisabled}>
            {intl.formatMessage(m.next)}
          </Button>
        )
      )}

      {nextDisabled && !onActivate && (
        <Text size="xs" color="muted" data-testid="wizard-nav-blocked">
          {intl.formatMessage(m.nextBlocked)}
        </Text>
      )}

      {/* On a phone the bar keeps one line for the secondary way out, so the
          three controls never grow it past a thumb's reach. */}
      <Flex direction={{ base: 'row', lg: 'column' }} gap={2}>
        {onBack && (
          <Button variant="outline" flex="1" onClick={onBack}>
            {intl.formatMessage(m.back)}
          </Button>
        )}

        <Button
          variant="outline"
          flex="1"
          onClick={saveAndLeave}
          disabled={isSaving}
          data-testid="wizard-nav-save"
        >
          {intl.formatMessage(isSaving ? m.saving : m.saveForLater)}
        </Button>
      </Flex>

      {pending > 0 && !isSaving && (
        <Text size="xs" color="muted" data-testid="wizard-nav-pending">
          {intl.formatMessage(m.pendingChanges, { count: pending })}
        </Text>
      )}

      {/* A save that lands leaves for the drafts list, whose toast says so;
          only a failure stays here to be read. */}
      {(saveOutcome?.kind === 'failed' ||
        saveOutcome?.kind === 'unknown-tasks') && (
        <Text size="xs" color="error" data-testid="wizard-nav-save-outcome">
          {saveOutcome.kind === 'failed' && intl.formatMessage(m.saveFailed)}
          {saveOutcome.kind === 'unknown-tasks' &&
            intl.formatMessage(m.unknownTasks, { count: saveOutcome.count })}
        </Text>
      )}
    </Stack>
  )
}
