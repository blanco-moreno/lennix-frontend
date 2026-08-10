/**
 * Toast when the backend auto-completes a phase (all subtasks DONE). Reacts to
 * the server's state, not the mutation that caused it, so it fires no matter
 * where the last activity was ticked off.
 */

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import type { Task } from '@/types'

import { parentAutoCompleteMessages as m } from './use-parent-auto-complete-toast-messages'

const DONE = 'done'

export interface AutoCompletedPhase {
  id: string
  title: string
}

/**
 * The phases that just auto-completed, given the previous and current lists.
 * Exported for its own test: the hook is the wiring, this is the rule.
 */
export function autoCompletedPhases(
  previous: Task[],
  current: Task[],
): AutoCompletedPhase[] {
  const before = new Map(previous.map((task) => [task.id, task.status]))
  return current
    .filter((task) => {
      const wasDone = before.get(task.id) === DONE
      if (wasDone || task.status !== DONE) return false
      // A phase with no activities was completed directly, not rolled up.
      if (task.subtasks.length === 0) return false
      return task.subtasks.every((subtask) => subtask.status === DONE)
    })
    .map((task) => ({ id: task.id, title: task.title }))
}

export function useParentAutoCompleteToast(tasks: Task[]): void {
  const intl = useIntl()
  const previous = useRef<Task[] | null>(null)

  useEffect(() => {
    // The first render *with data* is a baseline, not a transition: everything
    // already done was done before the user got here. Callers render while
    // their query is still loading, and an empty list is what a loading query
    // looks like — baselining on it makes every completed phase read as a
    // transition from "absent" to "done", on every mount. So wait for the
    // first payload that has something in it.
    if (previous.current === null) {
      if (tasks.length === 0) return
      previous.current = tasks
      return
    }
    for (const phase of autoCompletedPhases(previous.current, tasks)) {
      toast.success(
        intl.formatMessage(m.parentAutoCompleted, { title: phase.title }),
        { id: `${m.parentAutoCompleted.id}-${phase.id}` },
      )
    }
    previous.current = tasks
  }, [tasks, intl])
}
