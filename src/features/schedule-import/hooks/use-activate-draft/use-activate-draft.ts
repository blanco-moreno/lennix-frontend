/**
 * Go-live — the one commit on the import path, as an action the wizard owns.
 *
 * The button lives in the wizard's nav, next to where every other step's
 * primary action lives, so it is the hook rather than a panel that holds the
 * mutation. What it reports back is only what the surface has to render: the
 * two failures a user can act on.
 */

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { buildProjectDetailPath } from '@/router'
import {
  readPlanQuotaFailure,
  useActivateScheduleMutation,
} from '@/services/schedule-import'
import type {
  PlanQuotaFailure,
  ProjectActivationDetails,
  ReviewTask,
} from '@/types'

import { useActivateDraftMessages as m } from './use-activate-draft-messages'

export interface UseActivateDraftArgs {
  projectId: string
  tasks: ReviewTask[]
  /** Only what the user actually changed — absence means "keep the import's". */
  details?: ProjectActivationDetails
}

export function useActivateDraft({
  projectId,
  tasks,
  details,
}: UseActivateDraftArgs) {
  const intl = useIntl()
  const navigate = useNavigate()
  const [activateSchedule, { isLoading }] = useActivateScheduleMutation()
  const [quotaFailure, setQuotaFailure] = useState<PlanQuotaFailure | null>(
    null,
  )
  const [failed, setFailed] = useState(false)

  const activate = async () => {
    setQuotaFailure(null)
    setFailed(false)
    try {
      await activateSchedule({
        projectId,
        // Everything imported goes live. Dropping rows is a review action,
        // not a decision the activation path asks for.
        taskIds: tasks.map((task) => task.id),
        details,
      }).unwrap()
      // The moment of highest product value — it gets said out loud.
      toast.success(intl.formatMessage(m.activatedToast), {
        id: m.activatedToast.id,
      })
      navigate(buildProjectDetailPath(projectId))
    } catch (error) {
      const quota = readPlanQuotaFailure(error)
      if (quota) {
        setQuotaFailure(quota)
        // The inline notice renders at the foot of the summary column while
        // the button lives in the sticky nav — without this the click reads
        // as nothing having happened at all.
        toast.error(
          intl.formatMessage(m.quotaToast, {
            current: quota.current,
            limit: quota.limit ?? quota.current,
          }),
          { id: m.quotaToast.id },
        )
        return
      }
      setFailed(true)
      toast.error(intl.formatMessage(m.failedToast), { id: m.failedToast.id })
    }
  }

  return { activate, isLoading, quotaFailure, failed }
}
