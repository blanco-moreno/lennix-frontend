/**
 * Focused hook-contract tests. The full sentence catalog — every action, the
 * money formatting, the fallbacks — is exercised end-to-end in
 * `project-history.test.tsx`; this file pins only the resolution rules the
 * hook itself owns.
 */

import { screen } from '@testing-library/react'

import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ProjectActivity } from '@/types'

import { useActivitySentence } from './use-activity-sentence'

function Sentence({ entry }: { entry: ProjectActivity }) {
  const sentence = useActivitySentence()
  return <p data-testid="sentence">{sentence(entry)}</p>
}

const entry = (overrides: Partial<ProjectActivity>): ProjectActivity => ({
  id: 'act-1',
  occurredAt: '2026-07-24T15:30:00Z',
  actorId: null,
  actorName: 'Miguel Santos',
  action: 'task.completed',
  entityType: 'task',
  entityId: null,
  entityName: 'Cimentacion',
  oldValue: null,
  newValue: null,
  ...overrides,
})

function renderSentence(overrides: Partial<ProjectActivity>): string {
  renderWithProviders(<Sentence entry={entry(overrides)} />)
  return screen.getByTestId('sentence').textContent ?? ''
}

describe('useActivitySentence', () => {
  it('resolves status values through the status catalog, not onto the screen', () => {
    const sentence = renderSentence({
      action: 'task.status_changed',
      oldValue: 'todo',
      newValue: 'in_progress',
    })

    // `todo` / `in_progress` are backend keys; the reader gets the labels.
    expect(sentence).toContain('Pending')
    expect(sentence).toContain('In progress')
    expect(sentence).not.toContain('in_progress')
  })

  it('reads a rescheduled span in the locale, both ends, missing one included', () => {
    const sentence = renderSentence({
      action: 'task.rescheduled',
      // What the backend writes: ISO days joined by an arrow, and a literal
      // 'None' where the row had no date at all.
      oldValue: 'None → 2026-03-10',
      newValue: '2026-03-05 → 2026-03-15',
    })

    expect(sentence).toContain(`— → ${displayedDate('2026-03-10')}`)
    expect(sentence).toContain(
      `${displayedDate('2026-03-05')} → ${displayedDate('2026-03-15')}`,
    )
    expect(sentence).not.toContain('2026-03-05')
    expect(sentence).not.toContain('None')
  })

  it('names the system when the record has no human actor', () => {
    const sentence = renderSentence({ actorName: null })

    expect(sentence).toContain('The system')
    expect(sentence).not.toContain('null')
  })

  it('gives a nameless entity a translated placeholder', () => {
    const sentence = renderSentence({ entityName: null })

    expect(sentence).toContain('a deleted item')
    expect(sentence).not.toMatch(/null|undefined/)
  })
})
