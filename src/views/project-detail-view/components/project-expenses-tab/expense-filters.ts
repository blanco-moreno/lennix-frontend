/**
 * Pure aggregations behind the expense filters: the option lists are derived
 * from the page itself, so they only ever offer values that exist in it.
 */

interface ExpenseRow {
  taskId: string
  taskTitle: string
  subtaskId: string
  subtaskTitle: string
}

export interface FilterOption {
  id: string
  title: string
}

/** One option per main activity, first title wins, page order kept. */
export function buildTaskOptions<T extends ExpenseRow>(
  expenses: T[],
): FilterOption[] {
  const map = new Map<string, string>()
  for (const e of expenses) {
    if (!map.has(e.taskId)) map.set(e.taskId, e.taskTitle)
  }
  return Array.from(map, ([id, title]) => ({ id, title }))
}

/** Subactivity options, narrowed to the picked main activity when there is one. */
export function buildSubtaskOptions<T extends ExpenseRow>(
  expenses: T[],
  filterTaskId: string,
): FilterOption[] {
  const source =
    filterTaskId === 'all'
      ? expenses
      : expenses.filter((e) => e.taskId === filterTaskId)
  const map = new Map<string, string>()
  for (const e of source) {
    if (!map.has(e.subtaskId)) map.set(e.subtaskId, e.subtaskTitle)
  }
  return Array.from(map, ([id, title]) => ({ id, title }))
}

export function filterExpenses<T extends ExpenseRow>(
  expenses: T[],
  filterTaskId: string,
  filterSubtaskId: string,
): T[] {
  let result = expenses
  if (filterTaskId !== 'all') {
    result = result.filter((e) => e.taskId === filterTaskId)
  }
  if (filterSubtaskId !== 'all') {
    result = result.filter((e) => e.subtaskId === filterSubtaskId)
  }
  return result
}
