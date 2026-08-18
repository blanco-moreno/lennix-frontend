import { downloadBlob } from './download-blob'

describe('downloadBlob', () => {
  it('clicks a download anchor named after the file and revokes the URL', () => {
    const create = vi.fn(() => 'blob:fake')
    const revoke = vi.fn()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: create,
      revokeObjectURL: revoke,
    })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('plan.xlsx')
        expect(this.href).toBe('blob:fake')
      })

    downloadBlob(new Blob(['x']), 'plan.xlsx')

    expect(create).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
    expect(revoke).toHaveBeenCalledWith('blob:fake')
    expect(document.querySelector('a[download]')).toBeNull()
    vi.unstubAllGlobals()
    click.mockRestore()
  })
})
