import { formatDate, formatPrice } from './format'

describe('formatPrice', () => {
  it('formats an integer as IDR with no decimal places', () => {
    expect(formatPrice(450000)).toBe('Rp 450.000')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('Rp 0')
  })
})

describe('formatDate', () => {
  it('formats an ISO string into a readable date and time', () => {
    const result = formatDate('2026-08-31T09:33:23.211Z')
    expect(result).toEqual(expect.stringContaining('2026'))
  })
})
