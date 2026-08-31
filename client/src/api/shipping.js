import { http } from './http'

export function listShippingOptions() {
  return http.get('/shipping-options')
}
