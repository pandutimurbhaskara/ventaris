import { http } from './http'

export function getCart() {
  return http.get('/cart')
}

export function addCartItem(productId, quantity) {
  return http.post('/cart/items', { productId, quantity })
}

export function updateCartItem(productId, quantity) {
  return http.patch(`/cart/items/${encodeURIComponent(productId)}`, { quantity })
}

export function removeCartItem(productId) {
  return http.delete(`/cart/items/${encodeURIComponent(productId)}`)
}

export function clearCart() {
  return http.delete('/cart')
}
