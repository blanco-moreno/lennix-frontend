/**
 * One resumable home for a draft, as a four-step wizard in two columns.
 *
 * A draft is never project-detail: it is this canvas, addressed by its own id,
 * loaded from the backend's review state at whatever stage the review was left.
 * Come back in a week and the receipt, the rows and the edits you already made
 * are all here.
 *
 * The project's identity (name, location, description) sits above the wizard
 * and stays visible at every step — it describes the draft, it is not a stage
 * of reviewing it. There is exactly one stepper: vertical beside the content
 * from `lg`, a compact row above it on a phone, where the second column and the
 * nav bar drop under the content instead of stacking on top of it.
 *
 * Where the step lives: the URL owns it (`?step=schedule`), like every other
 * navigable state in this app. `PATCH /step` is the *memory* behind the URL, so
 * the review resumes on another device. `resolveReviewStep` holds the
 * precedence — URL, then the saved step, then the draft's real state — and the
 * clamp that overrides all three when the draft cannot be where it is told.
 */

import { Grid, Stack } from '@chakra-ui/react'
import { FileWarning } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, useSearchParams } from 'react-router'

import { EmptyState, Skeleton } from '@/components'
import { PATHS } from '@/constants'
import { useIntlToast } from '@/i18n'
import { buildProjectDetailPath } from '@/router'
import {
  useGetScheduleReviewStateQuery,
  useUpdateReviewStepMutation,
} from '@/services/schedule-import'
import { REVIEW_STEPS, type ReviewProject, type ReviewStep } from '@/types'

import { useActivateDraft } from '../../hooks/use-activate-draft'
import { useDraftEdits } from '../../hooks/use-draft-edits'
import {
  earliestReachableStep,
  furthestReachableStep,
  resolveReviewStep,
} from '../../review-step'
import { AssumptionLedger } from '../assumption-ledger'
import { BudgetStep } from '../budget-step'
import { ConfirmSummary } from '../confirm-summary'
import { DraftDependencies } from '../draft-dependencies'
import { DraftHeader } from '../draft-header'
import { ImportStepper } from '../import-stepper'
import {
  buildNarration,
  NarrationReceipt,
  type NarrationFocus,
} from '../narration-receipt'
import {
  buildReviewExceptions,
  countBlocking,
  ReviewTray,
  useReviewJournal,
} from '../review-tray'
import { ScheduleCanvas } from '../schedule-canvas'
import { SchedulePreview } from '../schedule-preview'
import { UploadSummary } from '../upload-summary'
import { WizardNav } from '../wizard-nav'

import { draftReviewCanvasMessages as m } from './draft-review-canvas-messages'

/**
 * Placeholder while the review state loads — hooks cannot wait for a fetch, and
 * nothing reads it: the canvas returns a loading state until `state` arrives.
 */
const EMPTY_PROJECT: ReviewProject = {
  id: '',
  name: '',
  description: null,
  location: null,
  budget: null,
  startDate: null,
  dueDate: null,
  isDraft: true,
  managerId: null,
  reviewStep: 'upload',
}

export interface DraftReviewCanvasProps {
  projectId: string
}

export function DraftReviewCanvas({ projectId }: DraftReviewCanvasProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  const toast = useIntlToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [focus, setFocus] = useState<NarrationFocus | null>(null)

  const {
    data: state,
    isLoading,
    isError,
  } = useGetScheduleReviewStateQuery(projectId, { skip: !projectId })

  const [journal, { discardRow }] = useReviewJournal(projectId)
  const exceptions = useMemo(
    () => (state ? buildReviewExceptions(state, journal) : []),
    [state, journal],
  )
  const [persistStep] = useUpdateReviewStepMutation()
  // One draft of one project: the header edits its identity, the budget step
  // its money, and the wizard's Save writes both.
  const edits = useDraftEdits({
    projectId,
    project: state?.project ?? EMPTY_PROJECT,
    tasks: state?.tasks ?? [],
  })
  const {
    activate,
    isLoading: isActivating,
    quotaFailure,
    failed,
  } = useActivateDraft({
    projectId,
    tasks: state?.tasks ?? [],
    details: edits.details,
  })

  const blockingExceptions = countBlocking(exceptions)
  const hasTasks = (state?.tasks.length ?? 0) > 0
  const step = resolveReviewStep({
    urlStep: searchParams.get('step'),
    savedStep: state?.project.reviewStep,
    hasTasks,
    blockingExceptions,
  })
  const furthest = furthestReachableStep({ hasTasks, blockingExceptions })
  const earliest = earliestReachableStep({ hasTasks })

  // Reflect the resolved step back into the URL, so a refresh — and the Back
  // button — land where the wizard actually is. `replace`: resolving a step is
  // not a navigation the user made.
  useEffect(() => {
    if (!state || searchParams.get('step') === step) return
    const next = new URLSearchParams(searchParams)
    next.set('step', step)
    setSearchParams(next, { replace: true })
  }, [state, step, searchParams, setSearchParams])

  // The write is the memory for the *next* device, not a gate on this one — so
  // it never blocks the move, but a failure is said out loud: silently losing
  // the step is how a review comes back at the beginning with no explanation.
  const rememberStep = async (next: ReviewStep) => {
    const result = await persistStep({ projectId, step: next })
    if ('error' in result) toast.error(m.stepSaveFailed)
  }

  /**
   * One rule for remembering the step: whenever the backend disagrees with
   * where the wizard actually is, tell it.
   *
   * Next and Back are not the only ways into a step — a deep link, a refresh
   * and the landing itself all put the wizard somewhere the backend was never
   * told about, and the drafts card then says "paso 1" for a review left on
   * the budget. Reacting to the resolved step covers all of them, and the
   * comparison is what stops it repeating: the write busts the review state,
   * whose refetch brings the step back equal.
   */
  useEffect(() => {
    if (!state || state.project.reviewStep === step) return
    void rememberStep(step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, step])

  const goTo = (next: ReviewStep) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', next)
    setSearchParams(params)
  }

  const saveAll = async () => {
    const outcome = await edits.save()
    if (outcome.kind === 'saved') toast.success(m.saveSuccess)
    // `unknown-tasks` keeps its own inline line, which names the count; the
    // toast is only there to say a save the user asked for did not happen.
    else if (outcome.kind !== 'noop') toast.error(m.saveFailed)
    return outcome
  }

  if (isLoading) {
    return (
      <Stack gap="block">
        <Skeleton h={10} rounded="md" />
        <Skeleton h="20rem" rounded="lg" />
      </Stack>
    )
  }

  if (isError || !state) {
    return (
      <EmptyState
        icon={FileWarning}
        title={intl.formatMessage(m.loadFailedTitle)}
        description={intl.formatMessage(m.loadFailedDescription)}
        action={{
          label: intl.formatMessage(m.goToDrafts),
          onClick: async () => navigate(PATHS.DRAFTS),
        }}
      />
    )
  }

  // Activated already: the review canvas has nothing left to resume, so it
  // hands over to the project instead of showing a second, stale home.
  if (!state.project.isDraft) {
    return (
      <EmptyState
        title={intl.formatMessage(m.liveTitle)}
        description={intl.formatMessage(m.liveDescription)}
        action={{
          label: intl.formatMessage(m.openProject),
          onClick: async () => navigate(buildProjectDetailPath(projectId)),
        }}
      />
    )
  }

  // The quality floor reached the draft anyway (an older import, or a manual
  // draft): refuse to render a schedule we cannot vouch for.
  if (state.outcome === 'needs_assisted_mapping') {
    return (
      <EmptyState
        icon={FileWarning}
        title={intl.formatMessage(m.divertedTitle)}
        description={intl.formatMessage(m.divertedDescription)}
      />
    )
  }

  const index = REVIEW_STEPS.indexOf(step)
  // Back walks one station at a time and stops at `earliest` — `upload` is a
  // receipt once rows landed, not a step to return to.
  const earliestIndex = REVIEW_STEPS.indexOf(earliest)
  const previous = index > earliestIndex ? REVIEW_STEPS[index - 1] : null
  // The next station always shows, disabled while the draft cannot reach it:
  // a control that disappears is a question the user cannot ask.
  const next = index < REVIEW_STEPS.length - 1 ? REVIEW_STEPS[index + 1] : null
  const canAdvance = next !== null && index < REVIEW_STEPS.indexOf(furthest)

  return (
    <Stack gap={{ base: 6, md: 8 }} data-testid="draft-review-canvas">
      <DraftHeader
        projectId={projectId}
        draft={edits.draft}
        onEdit={edits.edit}
        pending={edits.pending}
      />

      <Grid
        gap={{ base: 6, lg: 10 }}
        alignItems="start"
        templateColumns={{ base: '1fr', lg: '15rem 1fr' }}
      >
        {/* From `lg`, stepper and nav share one sticky column: the primary
            action of every step lands in the same place and never scrolls
            away. Below it the column dissolves (`display: contents`) so the
            grid holds three items of its own — stepper, content, and the nav
            bar `order` sends to the foot, where it pins itself. */}
        <Stack
          gap="section"
          display={{ base: 'contents', lg: 'flex' }}
          position={{ lg: 'sticky' }}
          top={{ lg: 4 }}
        >
          {/* A map, not a menu: the wizard moves only through Next and Back,
              so a completed step cannot be re-entered by clicking it. */}
          <ImportStepper current={step} furthest={furthest} />
          <WizardNav
            onBack={previous ? () => goTo(previous) : undefined}
            onNext={next && canAdvance ? () => goTo(next) : undefined}
            nextDisabled={next !== null && !canAdvance}
            onActivate={step === 'confirm' ? activate : undefined}
            isActivating={isActivating}
            onSave={saveAll}
            isSaving={edits.isSaving}
            pending={edits.pending}
            saveOutcome={edits.outcome}
          />
        </Stack>

        <Stack
          gap={{ base: 6, md: 8 }}
          minW={0}
          order={{ base: 2, lg: 'initial' }}
        >
          {step === 'upload' && (
            <UploadSummary
              scheduleImport={state.scheduleImport}
              report={state.report}
            />
          )}

          {step === 'schedule' && (
            <>
              {/* The receipt and the surfaces that answer it read as one
                  block; the schedule listing is a separate subject and gets
                  the wizard's full gap to itself, instead of butting into the
                  last card. */}
              <Stack gap={4}>
                <NarrationReceipt
                  narration={buildNarration(state)}
                  activeFocus={focus}
                  onFocus={(nextFocus) =>
                    setFocus((current) =>
                      current === nextFocus ? null : nextFocus,
                    )
                  }
                />

                {/* The receipt states the claims; these two resolve them — the
                  tray what the parser could not read, the ledger what it
                  decided. Clicking the receipt's "things to check" points at
                  them instead of opening a third list of the same facts. */}
                <Grid
                  gap={4}
                  alignItems="start"
                  templateColumns={{
                    base: '1fr',
                    '2xl': 'repeat(2, minmax(0, 1fr))',
                  }}
                >
                  <ReviewTray
                    projectId={projectId}
                    state={state}
                    exceptions={exceptions}
                    onDiscardRow={discardRow}
                    highlighted={focus === 'caveats'}
                  />

                  <AssumptionLedger
                    projectId={projectId}
                    state={state}
                    highlighted={focus === 'caveats'}
                  />
                </Grid>

                {/* The graph the file carried, and what it stated but did
                    not carry — editable here, because activation sends no
                    edges of its own. */}
                <DraftDependencies projectId={projectId} state={state} />
              </Stack>

              <ScheduleCanvas
                tasks={state.tasks}
                highlight={
                  focus === 'phases' || focus === 'activities' ? focus : null
                }
                projectId={projectId}
              />
            </>
          )}

          {step === 'budget' && (
            <BudgetStep
              project={state.project}
              tasks={state.tasks}
              draft={edits.draft}
              onEdit={edits.edit}
            />
          )}

          {step === 'confirm' && (
            <>
              <ConfirmSummary
                project={state.project}
                tasks={state.tasks}
                details={edits.details}
                quotaFailure={quotaFailure}
                failed={failed}
              />

              <SchedulePreview
                tasks={state.tasks}
                dependencies={state.dependencies}
              />
            </>
          )}
        </Stack>
      </Grid>
    </Stack>
  )
}
