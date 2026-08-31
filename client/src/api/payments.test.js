jest.mock('./http')

import { http } from './http'
import { listPaymentMethods } from './payments'

describe('listPaymentMethods', () => {
  it('requests the payment methods list', async () => {
    http.get.mockResolvedValue([{ id: 'bank_transfer', name: 'Bank Transfer' }])

    const result = await listPaymentMethods()

    expect(http.get).toHaveBeenCalledWith('/payment-methods')
    expect(result).toEqual([{ id: 'bank_transfer', name: 'Bank Transfer' }])
  })
})
