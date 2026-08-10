import type { ColumnDef } from '@tanstack/react-table'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { DataTable } from './data-table'

interface Row {
  name: string
  progress: number
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'progress', header: 'Progress', enableSorting: false },
]

const data: Row[] = [
  { name: 'Cimentacion', progress: 80 },
  { name: 'Acabados', progress: 10 },
  { name: 'Estructura', progress: 45 },
]

function bodyRowsText() {
  const [, tbody] = screen.getAllByRole('rowgroup')
  return within(tbody)
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('cell')[0].textContent)
}

describe('DataTable', () => {
  it('renders a header per column and a row per data item', () => {
    renderWithProviders(
      <DataTable columns={columns} data={data} emptyMessage="No tasks yet" />,
    )
    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Progress' }),
    ).toBeInTheDocument()
    expect(bodyRowsText()).toEqual(['Cimentacion', 'Acabados', 'Estructura'])
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it('sorts ascending on first header click, descending on second, and back off on third', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DataTable columns={columns} data={data} emptyMessage="No tasks yet" />,
    )
    const sortButton = screen.getByRole('button', { name: 'Name' })

    await user.click(sortButton)
    expect(bodyRowsText()).toEqual(['Acabados', 'Cimentacion', 'Estructura'])

    await user.click(sortButton)
    expect(bodyRowsText()).toEqual(['Estructura', 'Cimentacion', 'Acabados'])

    await user.click(sortButton)
    expect(bodyRowsText()).toEqual(['Cimentacion', 'Acabados', 'Estructura'])
  })

  it('renders no sort button for a column with sorting disabled', () => {
    renderWithProviders(
      <DataTable columns={columns} data={data} emptyMessage="No tasks yet" />,
    )
    expect(
      screen.queryByRole('button', { name: 'Progress' }),
    ).not.toBeInTheDocument()
  })

  it('shows the shared empty state across all columns when there is no data', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No tasks yet"
        emptyDescription="Import a schedule to see activities."
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'No tasks yet' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Import a schedule to see activities.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '2')
  })
})
