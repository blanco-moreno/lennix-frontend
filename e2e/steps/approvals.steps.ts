import { Then, When } from '../support/fixtures'
import {
  expectAbsent,
  expectVisible,
  openActivityActions,
  option,
} from '../support/screen'
import { blockedTaskIdOf, projectIdByName } from '../support/seed-targets'
import { destination } from '../support/vocabulary'

/** Every approval rule is told on the same activity: blocked, so both the
 *  force-start control and the budget action are on screen. */
const OBRA = 'Torre Residencial Norte'

async function openBlockedActivity(page: {
  goto: (url: string) => Promise<unknown>
}): Promise<void> {
  await page.goto(
    `/projects/${projectIdByName(OBRA)}/tasks/${blockedTaskIdOf(OBRA)}`,
  )
}

When('I open a blocked activity', async ({ page }) => {
  await openBlockedActivity(page)
})

When("I look at what I can do with an activity's budget", async ({ page }) => {
  await openBlockedActivity(page)
  await openActivityActions(page)
})

When('I open the approvals inbox', async ({ page }) => {
  await page.goto(destination('the approvals inbox').path)
  // Budget and force start are two sections of the one inbox; the seeded
  // request lives in the second.
  await page.getByRole('tab', { name: 'Force start' }).click()
})

When('I force the start of a blocked activity', async ({ page }) => {
  await openBlockedActivity(page)
  // `.first()`, because every blocked subtask renders its own force-start
  // control below the activity's. How many exist depends on whether the
  // subtask panel has answered yet, so an unscoped locator resolves to one,
  // three or none depending on the run — this scenario failed both ways.
  // The activity's own control is in the header, first in the DOM.
  await page
    .getByRole('button', { name: 'Force start', exact: true })
    .first()
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Force start', exact: true })
    .click()
})

/**
 * Nobody holds both keys, so the two controls are mutually exclusive: whoever
 * edits the amount has no request action, and whoever requests has no editor.
 */
Then(
  'the budget control offered to me is {string}',
  async ({ page }, control: string) => {
    const request = option(page, 'Request budget change')
    if (control === 'a direct edit') {
      await expectVisible(option(page, 'Edit main activity'))
      await expectAbsent(request)
      return
    }
    if (control === 'an approval request') {
      await expectVisible(request)
      return
    }
    throw new Error(`Unknown budget control "${control}"`)
  },
)

Then(
  'the force-start control offered to me is {string}',
  async ({ page }, control: string) => {
    const label =
      control === 'an outright override'
        ? 'Force start'
        : control === 'an approval request'
          ? 'Request force start'
          : null
    if (!label) throw new Error(`Unknown force-start control "${control}"`)
    await expectVisible(page.getByRole('button', { name: label, exact: true }))
  },
)

Then('the inbox lets me {string}', async ({ page }, capability: string) => {
  const decide = page.getByRole('button', { name: 'Approve', exact: true })
  if (capability === 'decide the requests') {
    await expectVisible(page.getByRole('heading', { name: 'Approvals' }))
    await expectVisible(decide)
    return
  }
  if (capability === 'only watch my own requests') {
    await expectVisible(page.getByRole('heading', { name: 'My requests' }))
    await expectAbsent(decide)
    return
  }
  throw new Error(`Unknown inbox capability "${capability}"`)
})

/** The write actually left the browser: the toast is the app's own report of
 *  what the backend answered, not a local optimistic guess. */
Then(
  'I am told the activity started and is marked at risk',
  async ({ page }) => {
    await expectVisible(page.getByText('Activity started — marked at risk'))
  },
)
