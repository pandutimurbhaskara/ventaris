jest.mock('./http')

import { http } from './http'
import { createTransaction, getTransaction, listTransactions } from './transactions'

describe('listTransactions', () => {
  it('requests the transaction list', async () => {
    http.get.mockResolvedValue([{ id: 'TRX-1' }])

    const result = await listTransactions()

    expect(http.get).toHaveBeenCalledWith('/transactions')
    expect(result).toEqual([{ id: 'TRX-1' }])
  })
})

describe('getTransaction', () => {
  it('requests a single URL-encoded transaction id', async () => {
    http.get.mockResolvedValue({ id: 'TRX-1' })

    await getTransaction('TRX-1')

    expect(http.get).toHaveBeenCalledWith('/transactions/TRX-1')
  })
})

describe('createTransaction', () => {
  it('posts the address, shipping selection, and wraps payment as { method }', async () => {
    http.post.mockResolvedValue({ id: 'TRX-2' })

    const address = { fullName: 'Demo Buyer' }
    const result = await createTransaction({ address, shipping: { id: 'regular' }, payment: 'bank_transfer' })

    expect(http.post).toHaveBeenCalledWith('/transactions', {
      address,
      shipping: { id: 'regular' },
      payment: { method: 'bank_transfer' },
    })
    expect(result).toEqual({ id: 'TRX-2' })
  })
})
