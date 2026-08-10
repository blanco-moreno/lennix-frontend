import { expect } from '@playwright/test'

import { Then, When } from '../support/fixtures'
import { hiddenProjectNames, visibleProjectNames } from '../support/roles'
import {
  expectAvailability,
  expectVisible,
  openActivityActions,
  openSelectFor,
} from '../support/screen'
import {
  blockedTaskIdOf,
  mainActivitiesOf,
  projectIdByName,
} from '../support/seed-targets'
import { destination } from '../support/vocabulary'

/** The lead line the dashboard opens with, per scope it is reporting on. */
const DASHBOARD_LEAD = {
  'the whole organization':
    'Portfolio health: what is slipping and what is waiting',
  // The copy says "obras" in English too — it is the product's word, and this
  // map is where the product's words meet the feature's.
  'only my own projects': 'Your obras: what is slipping and what is waiting',
} as const

When('I open the project list', async ({ page }) => {
  await page.goto(destination('the project list').path)
})

When('I open the portfolio dashboard', async ({ page }) => {
  await page.goto(destination('the portfolio dashboard').path)
})

When('I open the project {string}', async ({ page }, name: string) => {
  await page.goto(`/projects/${projectIdByName(name)}`)
})

When('I open a draft from the drafts home', async ({ page }) => {
  await page.goto(destination('the drafts home').path)
  // Whichever draft this role is served — the rule is about where a draft
  // opens, not about which one. The row's own control is its name.
  await page
    .getByTestId('draft-row')
    .first()
    .getByRole('button')
    .first()
    .click()
})

When(
  'I search the project list for {string}',
  async ({ page }, term: string) => {
    await page.goto(
      `${destination('the project list').path}?search=${encodeURIComponent(term)}`,
    )
  },
)

When('I reload the page', async ({ page }) => {
  await page.reload()
})

When(
  'I look at who can be made responsible for an activity',
  async ({ page }) => {
    const project = 'Torre Residencial Norte'
    await page.goto(
      `/projects/${projectIdByName(project)}/tasks/${blockedTaskIdOf(project)}`,
    )
    await openActivityActions(page)
    await page.getByRole('menuitem', { name: 'Edit main activity' }).click()
    await openSelectFor(page, 'Assignee')
  },
)

/**
 * Scope is the backend's answer, not a client-side filter — so the assertion is
 * about the rows that arrived: every project in my scope and none of the rest.
 * Both lists come from the seed manifest, so they follow `pnpm seed:sync`.
 */
Then('I see exactly the projects in my scope', async ({ page, actor }) => {
  for (const name of visibleProjectNames(actor.role)) {
    await expectVisible(page.getByText(name, { exact: true }))
  }
  for (const name of hiddenProjectNames(actor.role)) {
    await expect(page.getByText(name, { exact: true })).toHaveCount(0)
  }
})

Then(
  'starting a new project is {string}',
  async ({ page }, availability: string) => {
    await expectAvailability(
      page.getByRole('button', { name: 'New project', exact: true }),
      availability,
    )
  },
)

Then('the dashboard reports on {string}', async ({ page }, scope: string) => {
  const lead = DASHBOARD_LEAD[scope as keyof typeof DASHBOARD_LEAD]
  if (!lead) throw new Error(`Unknown dashboard scope "${scope}"`)
  await expectVisible(page.getByText(lead))
})

/** The schedule is the project's home surface — it opens on it, with rows. */
Then('I see its schedule, with its main activities on it', async ({ page }) => {
  await expectVisible(page.getByRole('tab', { name: 'Schedule', exact: true }))
  for (const title of mainActivitiesOf('Torre Residencial Norte').slice(0, 3)) {
    await expectVisible(page.getByText(title, { exact: true }))
  }
})

/** A draft never opens project detail — it resumes where it was left. */
Then("I land on that draft's review canvas", async ({ page }) => {
  await expect(page).toHaveURL(/\/drafts\/[0-9a-f-]+\/review/)
})

Then(
  'only the projects matching {string} are listed',
  async ({ page }, term: string) => {
    await expectVisible(page.getByText('Torre Residencial Norte'))
    await expect(page.getByText('Centro Comercial Plaza')).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`search=${term}`))
  },
)

Then('a member of that project is offered', async ({ page }) => {
  await expectVisible(page.getByRole('option', { name: 'Fernando Lopez' }))
})

Then(
  'somebody who runs the organization is offered, with their role shown',
  async ({ page }) => {
    await expectVisible(
      page
        .getByRole('option', { name: 'Carlos Rodriguez' })
        .filter({ hasText: 'Owner' }),
    )
  },
)
