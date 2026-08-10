import { expect } from '@playwright/test'

import { Then, When } from '../support/fixtures'
import { expectAbsent, expectAvailability, option } from '../support/screen'
import { destination } from '../support/vocabulary'

When('I open the organization roster', async ({ page }) => {
  await page.goto(destination('the organization roster').path)
})

When('I open my account settings', async ({ page }) => {
  await page.goto(destination('my account settings').path)
})

When('I go to grant a role to {string}', async ({ page }, member: string) => {
  await page.goto(destination('the organization roster').path)
  await page
    .getByRole('row')
    .filter({ hasText: member })
    .getByRole('button', { name: 'Change role' })
    .click()
  // The dialog's select only renders its options once opened.
  await page.getByRole('dialog').locator('.select__control').first().click()
})

Then('granting Admin is {string}', async ({ page }, availability: string) => {
  await expectAvailability(option(page, 'Admin'), availability)
})

/** The owner's role moves only with ownership, so the roster names the row
 *  instead of offering a control the API would refuse. */
Then("the owner's row offers no way to change their role", async ({ page }) => {
  const row = page.getByRole('row').filter({ hasText: 'Carlos Rodriguez' })
  await expect(row.first()).toBeVisible()
  await expectAbsent(row.getByRole('button', { name: 'Change role' }))
})

Then(
  'deleting my own account is {string}',
  async ({ page }, availability: string) => {
    await expectAvailability(
      page.getByRole('button', { name: 'Delete my account', exact: true }),
      availability,
    )
  },
)
