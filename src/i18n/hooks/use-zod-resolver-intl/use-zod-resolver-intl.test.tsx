import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  taskCreateSchema,
  taskValidationMessages,
  type TaskCreateFormValues,
} from '@/schemas'
import { renderWithProviders } from '@/tests/render-with-providers'

import enMessages from '../../../../lang/en.json'

import { useZodResolverIntl } from './use-zod-resolver-intl'

/** The real task-create schema, submitted empty so two fields fail at once. */
function TaskFormHarness() {
  const form = useForm<TaskCreateFormValues>({
    resolver: useZodResolverIntl(taskCreateSchema, taskValidationMessages),
    defaultValues: {
      name: '',
      description: '',
      projectId: '',
      priority: 'medium',
      budget: '',
    },
  })
  return (
    <form onSubmit={form.handleSubmit(() => undefined)}>
      <p>{form.formState.errors.name?.message}</p>
      <p>{form.formState.errors.projectId?.message}</p>
      <button type="submit">submit</button>
    </form>
  )
}

const orphanSchema = z.object({ name: z.string().min(1, 'noSuchCatalogKey') })

/** A schema whose message key is missing from the catalog it is paired with. */
function OrphanKeyHarness() {
  const form = useForm<z.infer<typeof orphanSchema>>({
    resolver: useZodResolverIntl(orphanSchema, taskValidationMessages),
    defaultValues: { name: '' },
  })
  return (
    <form onSubmit={form.handleSubmit(() => undefined)}>
      <p>{form.formState.errors.name?.message}</p>
      <button type="submit">submit</button>
    </form>
  )
}

describe('useZodResolverIntl', () => {
  it('surfaces zod failures as translated messages on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TaskFormHarness />)

    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(
      await screen.findByText(enMessages['taskValidation.taskNameRequired']),
    ).toBeInTheDocument()
    expect(
      screen.getByText(enMessages['taskValidation.projectRequired']),
    ).toBeInTheDocument()
  })

  it('passes a message key through untouched when the catalog does not map it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrphanKeyHarness />)

    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(await screen.findByText('noSuchCatalogKey')).toBeInTheDocument()
  })
})
