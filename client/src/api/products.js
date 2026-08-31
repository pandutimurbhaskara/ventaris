import { http } from './http'

export function listProducts(search) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return http.get(`/products${query}`)
}

export function getProduct(id) {
  return http.get(`/products/${encodeURIComponent(id)}`)
}
