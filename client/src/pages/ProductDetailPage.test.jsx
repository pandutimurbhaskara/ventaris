jest.mock('../api/products')
jest.mock('../api/cart')

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { addCartItem, getCart } from '../api/cart'
import { getProduct } from '../api/products'
import { ApiError } from '../api/http'
import { CartProvider } from '../context/CartContext'
import ProductDetailPage from './ProductDetailPage'

const product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Over-ear Bluetooth headphones with ANC.',
  price: 450000,
  stock: 25,
  image: 'https://placehold.co/400x400?text=Wireless+Headphones',
}

function renderPage(initialEntries = ['/products/1']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CartProvider>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
})

describe('ProductDetailPage', () => {
  it('shows a loading state before the product arrives', async () => {
    getProduct.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByText('Loading product…')).toBeInTheDocument()
    await waitFor(() => expect(getCart).toHaveBeenCalled())
  })

  it('renders the product details on success', async () => {
    getProduct.mockResolvedValue(product)
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument()
    expect(getProduct).toHaveBeenCalledWith('1')
    expect(screen.getByText('Over-ear Bluetooth headphones with ANC.')).toBeInTheDocument()
    expect(screen.getByText(/Rp\s*450\.000/)).toBeInTheDocument()
    expect(screen.getByText('In stock')).toBeInTheDocument()
  })

  it('shows a not-found message for a 404 response', async () => {
    getProduct.mockRejectedValue(new ApiError('Product 999 not found', 404))
    renderPage(['/products/999'])

    expect(await screen.findByText("This product doesn't exist.")).toBeInTheDocument()
  })

  it('shows a generic error message for other failures', async () => {
    getProduct.mockRejectedValue(new ApiError('Server error', 500))
    renderPage()

    expect(await screen.findByText("We couldn't load this product right now.")).toBeInTheDocument()
  })

  it('disables Add to Cart when out of stock', async () => {
    getProduct.mockResolvedValue({ ...product, stock: 0 })
    renderPage()

    expect(await screen.findByRole('button', { name: 'Add to Cart' })).toBeDisabled()
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
  })

  it('adds the selected quantity to the cart and shows a confirmation', async () => {
    getProduct.mockResolvedValue(product)
    addCartItem.mockResolvedValue({ items: [{ productId: 1, quantity: 3 }], subtotal: 1350000, itemCount: 3 })
    renderPage()

    await screen.findByRole('heading', { name: 'Wireless Headphones' })
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => expect(addCartItem).toHaveBeenCalledWith(1, 3))
    expect(await screen.findByRole('button', { name: 'Added to cart!' })).toBeInTheDocument()
  })

  it('shows an error message when adding to cart fails', async () => {
    getProduct.mockResolvedValue(product)
    addCartItem.mockRejectedValue(new Error('Only 25 left in stock'))
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Add to Cart' }))

    expect(await screen.findByText('Only 25 left in stock')).toBeInTheDocument()
  })

  it('links back to the home page', async () => {
    getProduct.mockResolvedValue(product)
    renderPage()

    await screen.findByRole('heading', { name: 'Wireless Headphones' })
    expect(screen.getByRole('link', { name: /back to products/i })).toHaveAttribute('href', '/')
  })
})
