jest.mock('./http')

import { http } from './http'
import { listShippingOptions } from './shipping'

describe('listShippingOptions', () => {
  it('requests the shipping options list', async () => {
    http.get.mockResolvedValue([{ id: 'regular', name: 'Regular', price: 15000 }])

    const result = await listShippingOptions()

    expect(http.get).toHaveBeenCalledWith('/shipping-options')
    expect(result).toEqual([{ id: 'regular', name: 'Regular', price: 15000 }])
  })
})
