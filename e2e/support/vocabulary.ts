/**
 * The seam between the language a feature speaks and the screen underneath it.
 *
 * A scenario says "the approvals inbox"; only this file knows that the nav
 * entry reads "Approvals" and lives at `/approvals`. Renaming a label is a
 * one-line edit here, and the features keep describing the business.
 */

export interface Destination {
  /** The nav entry's label, as the user reads it. */
  label: string
  path: string
}

const DESTINATIONS: Record<string, Destination> = {
  'the dashboard': { label: 'Dashboard', path: '/dashboard' },
  'the portfolio dashboard': { label: 'Dashboard', path: '/dashboard' },
  'the project list': { label: 'Projects', path: '/projects' },
  'the activity list': { label: 'Activities', path: '/tasks' },
  'the approvals inbox': { label: 'Approvals', path: '/approvals' },
  'the drafts home': { label: 'Drafts', path: '/drafts' },
  'the organization roster': { label: 'Team', path: '/settings/team' },
  'the trash': { label: 'Trash', path: '/trash' },
  'my account settings': { label: 'Settings', path: '/settings' },
}

export function destination(name: string): Destination {
  const found = DESTINATIONS[name.trim()]
  if (!found) {
    throw new Error(
      `Unknown destination "${name}". Known: ${Object.keys(DESTINATIONS).join(', ')}`,
    )
  }
  return found
}

/** A comma-separated list of destinations, with "nothing" meaning an empty one. */
export function destinationList(names: string): Destination[] {
  if (names.trim() === 'nothing') return []
  return names.split(',').map((name) => destination(name))
}
