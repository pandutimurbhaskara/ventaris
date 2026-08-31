jest.mock('../api/cart')

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { addCartItem, getCart } from '../api/cart'
import { CartProvider } from '../context/CartContext'
import ProductCard from './ProductCard'

const product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Over-ear Bluetooth headphones with ANC.',
  price: 450000,
  stock: 25,
  image: 'https://placehold.co/400x400?text=Wireless+Headphones',
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <CartProvider>
        <ProductCard product={{ ...product, ...overrides }} />
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
})

describe('ProductCard', () => {
  it('renders the product name, description, price, and detail link', async () => {
    renderCard()

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('Over-ear Bluetooth headphones with ANC.')).toBeInTheDocument()
    expect(screen.getByText(/Rp\s*450\.000/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Detail' })).toHaveAttribute('href', '/products/1')
  })

  it('disables Add to Cart when out of stock', async () => {
    renderCard({ stock: 0 })
    expect(await screen.findByRole('button', { name: 'Add to Cart' })).toBeDisabled()
  })

  it('calls addItem with the product id and quantity 1, then shows confirmation', async () => {
    addCartItem.mockResolvedValue({ items: [{ productId: 1, quantity: 1 }], subtotal: 450000, itemCount: 1 })
    renderCard()

    fireEvent.click(await screen.findByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Added!' })).toBeInTheDocument())
    expect(addCartItem).toHaveBeenCalledWith(1, 1)
  })

  it('reverts the confirmation label back to "Add to Cart" after a short delay', async () => {
    jest.useFakeTimers()
    addCartItem.mockResolvedValue({ items: [{ productId: 1, quantity: 1 }], subtotal: 450000, itemCount: 1 })
    renderCard()

    const addButton = await screen.findByRole('button', { name: 'Add to Cart' })
    await act(async () => {
      fireEvent.click(addButton)
    })
    expect(screen.getByRole('button', { name: 'Added!' })).toBeInTheDocument()

    await act(async () => {
      jest.advanceTimersByTime(1200)
    })
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument()

    jest.useRealTimers()
  })

  it('shows an error message when adding to cart fails', async () => {
    addCartItem.mockRejectedValue(new Error('Requested quantity (1) exceeds available stock (0)'))
    renderCard()

    fireEvent.click(await screen.findByRole('button', { name: 'Add to Cart' }))

    await waitFor(() =>
      expect(screen.getByText('Requested quantity (1) exceeds available stock (0)')).toBeInTheDocument(),
    )
  })
})
