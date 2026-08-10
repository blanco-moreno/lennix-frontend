import { expect } from '@playwright/test'

import { Given, Then, When } from '../support/fixtures'
import { expectAbsent, expectVisible } from '../support/screen'
import { destination, destinationList } from '../support/vocabulary'

Given('my account is the {string}', async ({ playRole }, role: string) => {
  await playRole(role)
})

Given('I am signed in as {string}', async ({ signInAs }, role: string) => {
  await signInAs(role)
})

When('I sign in', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('e2e@lennix-test.com')
  // `getByLabel` also matches the show/hide toggle, which shares the word.
  await page.getByRole('textbox', { name: 'Password' }).fill('e2e-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
})

When('I open the app', async ({ page }) => {
  await page.goto('/')
})

When('I open {string} directly', async ({ page }, name: string) => {
  await page.goto(destination(name).path)
})

Then('I land on {string}', async ({ page }, name: string) => {
  await expect(page).toHaveURL(new RegExp(`${destination(name).path}(\\?.*)?$`))
  await expectAbsent(page.getByText('You do not have access to this section'))
})

Then('my navigation offers {string}', async ({ page }, names: string) => {
  const nav = page.getByRole('navigation')
  for (const entry of destinationList(names)) {
    // Not an exact name: the approvals entry carries its pending count, and
    // the count is not what this rule is about.
    await expectVisible(nav.getByRole('button', { name: entry.label }))
  }
})

Then('my navigation hides {string}', async ({ page }, names: string) => {
  const nav = page.getByRole('navigation')
  for (const entry of destinationList(names)) {
    await expectAbsent(nav.getByRole('button', { name: entry.label }))
  }
})

Then('I am told my role does not include it', async ({ page }) => {
  await expectVisible(page.getByText('You do not have access to this section'))
})

Then('I am offered a way back to the project list', async ({ page }) => {
  await expectVisible(page.getByRole('button', { name: 'Go to projects' }))
})
