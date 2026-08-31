jest.mock('../api/products')
jest.mock('../api/cart')

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getCart } from '../api/cart'
import { listProducts } from '../api/products'
import { CartProvider } from '../context/CartContext'
import HomePage from './HomePage'

const product = (overrides = {}) => ({
  id: 1,
  name: 'Wireless Headphones',
  description: 'Over-ear Bluetooth headphones with ANC.',
  price: 450000,
  stock: 25,
  image: 'https://placehold.co/400x400?text=Wireless+Headphones',
  ...overrides,
})

function renderHome(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CartProvider>
        <HomePage />
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
})

describe('HomePage', () => {
  it('shows a loading state before products arrive', async () => {
    listProducts.mockReturnValue(new Promise(() => {}))
    renderHome()

    expect(screen.getByText('Loading products…')).toBeInTheDocument()
    await waitFor(() => expect(getCart).toHaveBeenCalled())
  })

  it('renders the "Browse products" heading and product cards with no search term', async () => {
    listProducts.mockResolvedValue([product(), product({ id: 2, name: 'Mechanical Keyboard' })])
    renderHome()

    expect(await screen.findByText('Browse products')).toBeInTheDocument()
    expect(listProducts).toHaveBeenCalledWith('')
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument()
    expect(screen.getByText('2 products found')).toBeInTheDocument()
  })

  it('uses singular "product found" for a single result', async () => {
    listProducts.mockResolvedValue([product()])
    renderHome()

    expect(await screen.findByText('1 product found')).toBeInTheDocument()
  })

  it('shows the search term in the heading and requests it from the API', async () => {
    listProducts.mockResolvedValue([product()])
    renderHome(['/?search=headphones'])

    expect(await screen.findByText('Results for "headphones"')).toBeInTheDocument()
    expect(listProducts).toHaveBeenCalledWith('headphones')
  })

  it('shows an empty state when no products are returned', async () => {
    listProducts.mockResolvedValue([])
    renderHome(['/?search=nonexistent'])

    expect(await screen.findByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Nothing matched "nonexistent". Try a different search.')).toBeInTheDocument()
  })

  it('shows an error state with a retry button on failure, and retries on click', async () => {
    listProducts.mockRejectedValueOnce(new Error('network error'))
    renderHome()

    expect(await screen.findByText("We couldn't load products right now.")).toBeInTheDocument()

    listProducts.mockResolvedValueOnce([product()])
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => expect(screen.getByText('Wireless Headphones')).toBeInTheDocument())
    expect(listProducts).toHaveBeenCalledTimes(2)
  })
})
