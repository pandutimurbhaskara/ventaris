import { http } from './http'

export function listPaymentMethods() {
  return http.get('/payment-methods')
}
