jest.mock('./http')

import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from './cart'
import { http } from './http'

describe('cart api', () => {
  it('getCart requests the current cart', async () => {
    http.get.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })

    const result = await getCart()

    expect(http.get).toHaveBeenCalledWith('/cart')
    expect(result).toEqual({ items: [], subtotal: 0, itemCount: 0 })
  })

  it('addCartItem posts the product id and quantity', async () => {
    http.post.mockResolvedValue({ items: [{ productId: 1, quantity: 2 }] })

    await addCartItem(1, 2)

    expect(http.post).toHaveBeenCalledWith('/cart/items', { productId: 1, quantity: 2 })
  })

  it('updateCartItem PATCHes the quantity for a URL-encoded product id', async () => {
    http.patch.mockResolvedValue({ items: [] })

    await updateCartItem('product/1', 5)

    expect(http.patch).toHaveBeenCalledWith('/cart/items/product%2F1', { quantity: 5 })
  })

  it('removeCartItem DELETEs a single item by URL-encoded product id', async () => {
    http.delete.mockResolvedValue({ items: [] })

    await removeCartItem('product/1')

    expect(http.delete).toHaveBeenCalledWith('/cart/items/product%2F1')
  })

  it('clearCart DELETEs the whole cart', async () => {
    http.delete.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })

    await clearCart()

    expect(http.delete).toHaveBeenCalledWith('/cart')
  })
})
