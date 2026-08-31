import { ApiError, http } from './http'

function mockFetchOnce({ status = 200, body, isJson = true } = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Status text',
    headers: {
      get: (name) => (name === 'content-type' && isJson ? 'application/json' : null),
    },
    json: async () => body,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('http.get', () => {
  it('returns the unwrapped data on success', async () => {
    mockFetchOnce({ body: { success: true, data: { id: 1, name: 'Wireless Headphones' } } })

    const result = await http.get('/products/1')

    expect(result).toEqual({ id: 1, name: 'Wireless Headphones' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products/1',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    )
  })

  it('throws an ApiError with the message, status, and details from a failed response', async () => {
    mockFetchOnce({
      status: 409,
      body: { success: false, message: 'Insufficient stock for "Smart Watch"', details: { productId: 3 } },
    })

    await expect(http.get('/cart')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Insufficient stock for "Smart Watch"',
      status: 409,
      details: { productId: 3 },
    })
  })

  it('falls back to the response status text when the body has no message', async () => {
    mockFetchOnce({ status: 500, isJson: false })

    await expect(http.get('/products')).rejects.toThrow('Status text')
  })
})

describe('http.post', () => {
  it('sends a JSON body with the POST method', async () => {
    mockFetchOnce({ status: 201, body: { success: true, data: { id: 'TRX-1' } } })

    await http.post('/transactions', { address: { fullName: 'Demo Buyer' } })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/transactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ address: { fullName: 'Demo Buyer' } }),
      }),
    )
  })
})

describe('ApiError', () => {
  it('carries the message, status, and details', () => {
    const error = new ApiError('Not Found', 404, { productId: 99 })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Not Found')
    expect(error.status).toBe(404)
    expect(error.details).toEqual({ productId: 99 })
  })
})
