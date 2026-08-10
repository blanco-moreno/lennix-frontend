import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '@/constants'
import { renderWithProviders } from '@/tests/render-with-providers'

import { Pagination } from './pagination'

describe('Pagination', () => {
  it('keeps the shared page-size policy at steps of 5 up to 20', () => {
    // MAX_PAGE_SIZE on the server is 20 — offering more turns the selector
    // into a 422.
    expect(DEFAULT_PAGE_SIZE_OPTIONS).toEqual([5, 10, 15, 20])
    expect(DEFAULT_PAGE_SIZE).toBe(5)
  })

  it('renders nothing when there are no rows', () => {
    const { container } = renderWithProviders(
      <Pagination
        page={1}
        pageSize={5}
        total={0}
        totalPages={0}
        onPageChange={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the visible range and the page indicator', () => {
    renderWithProviders(
      <Pagination
        page={2}
        pageSize={5}
        total={12}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Showing 6–10 of 12')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('caps the range end at the total on the last page', () => {
    renderWithProviders(
      <Pagination
        page={3}
        pageSize={5}
        total={12}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Showing 11–12 of 12')).toBeInTheDocument()
  })

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = renderWithProviders(
      <Pagination
        page={1}
        pageSize={5}
        total={12}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()

    rerender(
      <Pagination
        page={3}
        pageSize={5}
        total={12}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('steps one page at a time through onPageChange', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(
      <Pagination
        page={2}
        pageSize={5}
        total={12}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)
  })

  it('hides the page-size selector unless onPageSizeChange is given', () => {
    renderWithProviders(
      <Pagination
        page={1}
        pageSize={5}
        total={12}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.queryByText('Per page:')).not.toBeInTheDocument()
  })

  it('offers the default page sizes and reports the pick as a number', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    renderWithProviders(
      <Pagination
        page={1}
        pageSize={5}
        total={40}
        totalPages={8}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    )
    expect(screen.getByText('Per page:')).toBeInTheDocument()
    await user.click(screen.getByRole('combobox'))
    for (const size of [10, 15, 20]) {
      expect(await screen.findByText(String(size))).toBeInTheDocument()
    }
    await user.click(screen.getByText('20'))
    expect(onPageSizeChange).toHaveBeenCalledWith(20)
  })
})
