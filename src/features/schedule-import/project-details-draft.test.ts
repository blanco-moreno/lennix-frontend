import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import type { ReviewProject, ReviewTask } from '@/types'

import {
  buildProjectDetails,
  buildTaskBudgets,
  countProjectDetailChanges,
  draftFromProject,
  summarizeAllocation,
} from './project-details-draft'

const seededProject = (): ReviewProject =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO()).project

const seededTasks = (): ReviewTask[] =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO()).tasks

describe('project details draft', () => {
  it('defaults to what the import produced, not to blanks', () => {
    const project = seededProject()

    expect(draftFromProject(project)).toEqual({
      name: project.name,
      description: project.description ?? '',
      location: project.location ?? '',
      budget: String(project.budget),
      taskBudgets: {},
    })
  })

  it('reads a project with no budget as an empty field, never as zero', () => {
    const project = { ...seededProject(), budget: null }

    expect(draftFromProject(project).budget).toBe('')
  })

  it('sends nothing at all when the panel was never touched', () => {
    const project = seededProject()

    expect(buildProjectDetails(project, draftFromProject(project))).toEqual({})
    expect(countProjectDetailChanges(project, draftFromProject(project))).toBe(
      0,
    )
  })

  it('sends only the field the user actually changed', () => {
    const project = seededProject()
    const draft = { ...draftFromProject(project), name: 'Bodega Oeste' }

    expect(buildProjectDetails(project, draft)).toEqual({
      name: 'Bodega Oeste',
    })
  })

  it('never blanks the project name: an emptied field is not an edit', () => {
    const project = seededProject()
    const draft = { ...draftFromProject(project), name: '   ' }

    expect(buildProjectDetails(project, draft)).toEqual({})
  })

  it('keeps an untouched budget out of the body — 0 is not "no change"', () => {
    const project = { ...seededProject(), budget: null }
    const draft = draftFromProject(project)

    expect(buildProjectDetails(project, draft).budget).toBeUndefined()
  })

  it('sends a budget the user typed, including an explicit zero', () => {
    const project = { ...seededProject(), budget: null }

    expect(
      buildProjectDetails(project, {
        ...draftFromProject(project),
        budget: '0',
      }),
    ).toEqual({ budget: 0 })
    expect(
      buildProjectDetails(project, {
        ...draftFromProject(project),
        budget: '450000.5',
      }),
    ).toEqual({ budget: 450000.5 })
  })

  it('ignores a budget that is not a usable amount', () => {
    const project = { ...seededProject(), budget: null }

    for (const budget of ['abc', '-5']) {
      expect(
        buildProjectDetails(project, {
          ...draftFromProject(project),
          budget,
        }),
      ).toEqual({})
    }
  })

  it('lets a text field be cleared, because emptying it is a real intent', () => {
    const project = seededProject()
    const draft = { ...draftFromProject(project), location: '' }

    expect(buildProjectDetails(project, draft)).toEqual({ location: '' })
  })

  it('counts every field go-live would change', () => {
    const project = seededProject()
    const draft = {
      ...draftFromProject(project),
      name: 'Bodega Oeste',
      location: 'Parque Industrial Sur',
      budget: '900000',
    }

    expect(countProjectDetailChanges(project, draft)).toBe(3)
  })

  describe('the budget split across activities', () => {
    it('opens each activity on the amount the import gave it', () => {
      const project = seededProject()
      const tasks = seededTasks()

      const draft = draftFromProject(project, tasks)

      // The importer never guesses a wallet, so every row starts empty.
      expect(Object.keys(draft.taskBudgets)).toEqual(tasks.map((t) => t.id))
      expect(Object.values(draft.taskBudgets)).toEqual(tasks.map(() => ''))
    })

    it('sends only the activities the user budgeted', () => {
      const project = seededProject()
      const tasks = seededTasks()
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[tasks[0].id] = '80000'

      expect(buildTaskBudgets(draft, tasks)).toEqual([
        { task_id: tasks[0].id, budget: 80000 },
      ])
      // The split has its own endpoint now — it never rides along with go-live.
      expect(buildProjectDetails(project, draft)).toEqual({})
    })

    it('keeps a cleared amount home — the contract cannot say "unset"', () => {
      const project = seededProject()
      const tasks = [{ ...seededTasks()[0], budget: 80000 }]
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[tasks[0].id] = ''

      // Sending 0 would tell the obra the activity costs nothing, which is a
      // different claim from "I have not decided yet".
      expect(buildTaskBudgets(draft, tasks)).toEqual([])
    })

    it('counts each budgeted activity, never the split as one edit', () => {
      const project = seededProject()
      const tasks = seededTasks()
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[tasks[0].id] = '80000'
      draft.taskBudgets[tasks[1].id] = '40000'
      draft.name = 'Bodega Oeste'

      expect(countProjectDetailChanges(project, draft, tasks)).toBe(3)
    })

    it('totals what goes live, imported amounts included', () => {
      const project = { ...seededProject(), budget: 100000 }
      const [first, second] = seededTasks()
      // `second` was never touched, but its imported budget goes live too.
      const tasks = [first, { ...second, budget: 25000 }]
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[first.id] = '30000'

      expect(summarizeAllocation(project, draft, tasks)).toEqual({
        assigned: 55000,
        unassigned: 45000,
        overrun: false,
      })
    })

    it('reports an overrun instead of clamping it', () => {
      const project = { ...seededProject(), budget: 100000 }
      const tasks = [seededTasks()[0]]
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[tasks[0].id] = '140000'

      expect(summarizeAllocation(project, draft, tasks)).toEqual({
        assigned: 140000,
        unassigned: -40000,
        overrun: true,
      })
    })

    it('measures against the budget being typed, not the saved one', () => {
      const project = { ...seededProject(), budget: 100000 }
      const tasks = [seededTasks()[0]]
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[tasks[0].id] = '140000'
      draft.budget = '200000'

      // Raising the project budget resolves the overrun in the same keystroke
      // it would otherwise be reported in — both numbers travel with go-live.
      expect(summarizeAllocation(project, draft, tasks).overrun).toBe(false)
    })

    it('has no remainder to offer when the project has no budget', () => {
      const project = { ...seededProject(), budget: null }
      const tasks = [seededTasks()[0]]
      const draft = draftFromProject(project, tasks)
      draft.taskBudgets[tasks[0].id] = '30000'

      expect(summarizeAllocation(project, draft, tasks)).toEqual({
        assigned: 30000,
        unassigned: null,
        overrun: false,
      })
    })
  })
})
