import { http } from './http'

export function listTransactions() {
  return http.get('/transactions')
}

export function getTransaction(id) {
  return http.get(`/transactions/${encodeURIComponent(id)}`)
}

export function createTransaction({ address, shipping, payment }) {
  return http.post('/transactions', { address, shipping, payment: { method: payment } })
}
