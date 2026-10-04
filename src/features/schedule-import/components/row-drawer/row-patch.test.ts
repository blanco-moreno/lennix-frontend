import { buildSubtaskPatch, buildTaskPatch } from './row-patch'

const row = {
  title: 'Cimentacion',
  startDate: '2026-09-01',
  dueDate: '2026-09-25',
}

describe('buildTaskPatch', () => {
  it('sends nothing when nothing changed', () => {
    expect(
      buildTaskPatch(row, {
        title: 'Cimentacion',
        startDate: '2026-09-01',
        dueDate: '2026-09-25',
      }),
    ).toEqual({})
  })

  it('sends only the trimmed title, never dates — a phase derives its own', () => {
    expect(
      buildTaskPatch(row, {
        title: '  Cimentacion profunda  ',
        startDate: '2026-10-01',
        dueDate: '2026-10-25',
      }),
    ).toEqual({ title: 'Cimentacion profunda' })
  })

  it('does not send a blanked-out title', () => {
    expect(
      buildTaskPatch(row, {
        title: '   ',
        startDate: '2026-09-01',
        dueDate: '2026-09-25',
      }),
    ).toEqual({})
  })
})

describe('buildSubtaskPatch', () => {
  it('sends only the fields the user actually changed', () => {
    expect(
      buildSubtaskPatch(row, {
        title: 'Cimentacion',
        startDate: '2026-09-02',
        dueDate: '2026-09-25',
      }),
    ).toEqual({ start_date: '2026-09-02' })
  })

  it('sends an explicit null when a date is cleared', () => {
    expect(
      buildSubtaskPatch(row, {
        title: 'Cimentacion',
        startDate: '',
        dueDate: '2026-09-25',
      }),
    ).toEqual({ start_date: null })
  })

  it('leaves an already-empty date alone', () => {
    expect(
      buildSubtaskPatch(
        { ...row, startDate: null },
        { title: 'Cimentacion', startDate: '', dueDate: '2026-09-25' },
      ),
    ).toEqual({})
  })
})
