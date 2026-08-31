jest.mock('../api/transactions')

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { listTransactions } from '../api/transactions'
import TransactionsPage from './TransactionsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <TransactionsPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('TransactionsPage', () => {
  it('shows a loading state before transactions arrive', () => {
    listTransactions.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByText('Loading transactions…')).toBeInTheDocument()
  })

  it('shows an error state when the request fails', async () => {
    listTransactions.mockRejectedValue(new Error('network error'))
    renderPage()

    expect(await screen.findByText("We couldn't load your transactions.")).toBeInTheDocument()
  })

  it('shows an empty state with a link to browse products', async () => {
    listTransactions.mockResolvedValue([])
    renderPage()

    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/')
  })

  it('renders each transaction summary with id, item count, status, and total', async () => {
    listTransactions.mockResolvedValue([
      { id: 'TRX-20260831-0001', createdAt: '2026-08-31T09:33:23.211Z', status: 'PROCESSING', itemCount: 3, total: 1095000 },
    ])
    renderPage()

    expect(await screen.findByText('Order TRX-20260831-0001')).toBeInTheDocument()
    expect(screen.getByText(/3 items/)).toBeInTheDocument()
    expect(screen.getByText('processing')).toBeInTheDocument()
    expect(screen.getByText(/Rp\s*1\.095\.000/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Order TRX-20260831-0001/ })).toHaveAttribute(
      'href',
      '/transactions/TRX-20260831-0001',
    )
  })

  it('uses singular "item" for a single-item order', async () => {
    listTransactions.mockResolvedValue([
      { id: 'TRX-2', createdAt: '2026-08-31T09:33:23.211Z', status: 'PROCESSING', itemCount: 1, total: 100000 },
    ])
    renderPage()

    expect(await screen.findByText(/1 item(?!s)/)).toBeInTheDocument()
  })
})
