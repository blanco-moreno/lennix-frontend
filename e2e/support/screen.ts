/**
 * The few browser gestures the step definitions share.
 *
 * Everything here is UI detail on purpose: a feature file never mentions a
 * button, a class or a role — it says what the user is trying to do, and the
 * knowledge of how the screen answers lives down here.
 */

import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Absence is asserted on the visible subset rather than on the count, because
 * this app keeps drawers and dialogs mounted while closed — a control inside a
 * closed drawer exists and is still, to the user, not there.
 */
export async function expectVisible(locator: Locator): Promise<void> {
  await expect(locator.first()).toBeVisible()
}

export async function expectAbsent(locator: Locator): Promise<void> {
  await expect(locator.filter({ visible: true })).toHaveCount(0)
}

/** "offered" / "not offered", the two words every availability rule uses. */
export async function expectAvailability(
  locator: Locator,
  availability: string,
): Promise<void> {
  if (availability === 'offered') return expectVisible(locator)
  if (availability === 'not offered') return expectAbsent(locator)
  throw new Error(
    `Unknown availability "${availability}". Use "offered" or "not offered".`,
  )
}

/** A dropdown item, a listbox option or a select option — one word for all three. */
export function option(page: Page, name: string): Locator {
  return page
    .getByRole('menuitem', { name, exact: true })
    .or(page.getByRole('option', { name }))
}

/** Everything an activity can have done to it hangs off one menu. */
export async function openActivityActions(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'More actions' }).click()
}

/**
 * The selects are react-select: the labelled node is its hidden input, which
 * cannot be clicked. `classNamePrefix="select"` (set once, in the wrapper) is
 * the handle its control exposes on purpose.
 */
export async function openSelectFor(page: Page, label: string): Promise<void> {
  const field = page
    .locator('div')
    .filter({ has: page.getByText(label, { exact: true }) })
    .last()
  await field.locator('.select__control').first().click()
}
