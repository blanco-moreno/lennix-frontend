import {
  buildSubtaskOptions,
  buildTaskOptions,
  filterExpenses,
} from './expense-filters'

const row = (taskId: string, subtaskId: string) => ({
  taskId,
  taskTitle: `Task ${taskId}`,
  subtaskId,
  subtaskTitle: `Subtask ${subtaskId}`,
})

const expenses = [
  row('t1', 's1'),
  row('t1', 's2'),
  row('t2', 's3'),
  row('t2', 's3'),
]

describe('buildTaskOptions', () => {
  it('offers each main activity once, in page order', () => {
    expect(buildTaskOptions(expenses)).toEqual([
      { id: 't1', title: 'Task t1' },
      { id: 't2', title: 'Task t2' },
    ])
  })
})

describe('buildSubtaskOptions', () => {
  it('dedupes subactivities across the whole page when no activity is picked', () => {
    expect(buildSubtaskOptions(expenses, 'all').map((o) => o.id)).toEqual([
      's1',
      's2',
      's3',
    ])
  })

  it('narrows the offer to the picked main activity', () => {
    expect(buildSubtaskOptions(expenses, 't2')).toEqual([
      { id: 's3', title: 'Subtask s3' },
    ])
  })
})

describe('filterExpenses', () => {
  it('leaves the page alone when both filters are open', () => {
    expect(filterExpenses(expenses, 'all', 'all')).toBe(expenses)
  })

  it('applies both filters together', () => {
    expect(filterExpenses(expenses, 't1', 's2')).toEqual([row('t1', 's2')])
  })

  it('filters by layer (project direct vs subtask)', () => {
    const projectExpense = {
      taskId: null,
      taskTitle: null,
      subtaskId: null,
      subtaskTitle: null,
    }
    const mixed = [row('t1', 's1'), projectExpense]
    expect(filterExpenses(mixed, 'all', 'all', 'project')).toEqual([
      projectExpense,
    ])
    expect(filterExpenses(mixed, 'all', 'all', 'subtask')).toEqual([
      row('t1', 's1'),
    ])
  })
})
