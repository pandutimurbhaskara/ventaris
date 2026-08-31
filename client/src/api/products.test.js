jest.mock('./http')

import { http } from './http'
import { getProduct, listProducts } from './products'

describe('listProducts', () => {
  it('requests the product list with no query string when search is empty', async () => {
    http.get.mockResolvedValue([{ id: 1, name: 'Wireless Headphones' }])

    const result = await listProducts()

    expect(http.get).toHaveBeenCalledWith('/products')
    expect(result).toEqual([{ id: 1, name: 'Wireless Headphones' }])
  })

  it('URL-encodes the search term as a query parameter', async () => {
    http.get.mockResolvedValue([])

    await listProducts('wireless mouse')

    expect(http.get).toHaveBeenCalledWith('/products?search=wireless%20mouse')
  })
})

describe('getProduct', () => {
  it('requests a single product by id', async () => {
    http.get.mockResolvedValue({ id: 5, name: 'Laptop Stand' })

    const result = await getProduct(5)

    expect(http.get).toHaveBeenCalledWith('/products/5')
    expect(result).toEqual({ id: 5, name: 'Laptop Stand' })
  })
})
