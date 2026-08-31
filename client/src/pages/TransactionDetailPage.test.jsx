jest.mock('../api/transactions')

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '../api/http'
import { getTransaction } from '../api/transactions'
import TransactionDetailPage from './TransactionDetailPage'

const transaction = {
  id: 'TRX-20260831-0001',
  createdAt: '2026-08-31T09:33:23.211Z',
  status: 'PROCESSING',
  items: [
    {
      productId: 1,
      productName: 'Wireless Headphones',
      image: 'https://placehold.co/64x64',
      price: 450000,
      quantity: 2,
      subtotal: 900000,
    },
  ],
  address: {
    fullName: 'Demo Buyer',
    phone: '08123456789',
    address: 'Jl. Sudirman No. 1',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12190',
  },
  shipping: { id: 'regular', name: 'Regular', price: 15000, estimatedDelivery: '2-4 days' },
  payment: { method: 'bank_transfer', status: 'PENDING' },
  subtotal: 900000,
  shippingCost: 15000,
  total: 915000,
}

function renderPage(initialEntries = ['/transactions/TRX-20260831-0001']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/transactions/:id" element={<TransactionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('TransactionDetailPage', () => {
  it('shows a loading state before the order arrives', () => {
    getTransaction.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByText('Loading order…')).toBeInTheDocument()
  })

  it('shows a not-found message for a 404 response', async () => {
    getTransaction.mockRejectedValue(new ApiError('Transaction TRX-404 not found', 404))
    renderPage(['/transactions/TRX-404'])

    expect(await screen.findByText("This order doesn't exist.")).toBeInTheDocument()
  })

  it('shows a generic error message for other failures', async () => {
    getTransaction.mockRejectedValue(new ApiError('Server error', 500))
    renderPage()

    expect(await screen.findByText("We couldn't load this order right now.")).toBeInTheDocument()
  })

  it('renders the order id, status, items, totals, address, shipping, and payment', async () => {
    getTransaction.mockResolvedValue(transaction)
    renderPage()

    expect(await screen.findByText('Order TRX-20260831-0001')).toBeInTheDocument()
    expect(getTransaction).toHaveBeenCalledWith('TRX-20260831-0001')
    expect(screen.getByText('processing')).toBeInTheDocument()

    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText(/2 ×/)).toBeInTheDocument()
    expect(screen.getByText(/Rp\s*915\.000/)).toBeInTheDocument()

    expect(screen.getByText('Demo Buyer')).toBeInTheDocument()
    expect(screen.getByText(/Jl\. Sudirman No\. 1/)).toBeInTheDocument()
    expect(screen.getByText(/Regular · Estimated delivery: 2-4 days/)).toBeInTheDocument()

    expect(screen.getByText('bank transfer')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('links back to the transactions list', async () => {
    getTransaction.mockResolvedValue(transaction)
    renderPage()

    await screen.findByText('Order TRX-20260831-0001')
    expect(screen.getByRole('link', { name: /back to transactions/i })).toHaveAttribute('href', '/transactions')
  })
})
