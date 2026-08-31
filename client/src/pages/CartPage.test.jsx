jest.mock('../api/cart')

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { getCart, removeCartItem, updateCartItem } from '../api/cart'
import { CartProvider } from '../context/CartContext'
import CartPage from './CartPage'

const cartItem = (overrides = {}) => ({
  productId: 1,
  name: 'Wireless Headphones',
  image: 'https://placehold.co/64x64',
  price: 450000,
  quantity: 2,
  stock: 25,
  subtotal: 900000,
  ...overrides,
})

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderCartPage() {
  return render(
    <MemoryRouter initialEntries={['/cart']}>
      <CartProvider>
        <CartPage />
        <LocationDisplay />
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CartPage', () => {
  it('shows a loading state while the cart is being fetched', () => {
    getCart.mockReturnValue(new Promise(() => {}))
    renderCartPage()

    expect(screen.getByText('Loading cart…')).toBeInTheDocument()
  })

  it('shows an error state when the cart fails to load', async () => {
    getCart.mockRejectedValue(new Error('network error'))
    renderCartPage()

    expect(await screen.findByText("We couldn't load your cart right now.")).toBeInTheDocument()
  })

  it('shows an empty state with a link back to the product grid', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderCartPage()

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/')
  })

  it('renders cart items and the order summary total', async () => {
    getCart.mockResolvedValue({ items: [cartItem()], subtotal: 900000, itemCount: 2 })
    renderCartPage()

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument()
    const totals = screen.getAllByText(/Rp\s*900\.000/)
    expect(totals.length).toBeGreaterThan(0)
  })

  it('increasing quantity calls updateCartItem with productId and the new quantity', async () => {
    getCart.mockResolvedValue({ items: [cartItem({ quantity: 2 })], subtotal: 900000, itemCount: 2 })
    updateCartItem.mockResolvedValue({
      items: [cartItem({ quantity: 3, subtotal: 1350000 })],
      subtotal: 1350000,
      itemCount: 3,
    })
    renderCartPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Increase quantity' }))

    await waitFor(() => expect(updateCartItem).toHaveBeenCalledWith(1, 3))
    expect((await screen.findAllByText(/Rp\s*1\.350\.000/)).length).toBeGreaterThan(0)
  })

  it('removing an item calls removeCartItem and shows the empty state once the cart is empty', async () => {
    getCart.mockResolvedValue({ items: [cartItem()], subtotal: 900000, itemCount: 2 })
    removeCartItem.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderCartPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Wireless Headphones' }))

    await waitFor(() => expect(removeCartItem).toHaveBeenCalledWith(1))
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
  })

  it('shows an error message when a cart mutation fails', async () => {
    getCart.mockResolvedValue({ items: [cartItem()], subtotal: 900000, itemCount: 2 })
    removeCartItem.mockRejectedValue(new Error('Could not remove item'))
    renderCartPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Wireless Headphones' }))

    expect(await screen.findByText('Could not remove item')).toBeInTheDocument()
  })

  it('navigates to /checkout when "Proceed to Checkout" is clicked', async () => {
    getCart.mockResolvedValue({ items: [cartItem()], subtotal: 900000, itemCount: 2 })
    renderCartPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Proceed to Checkout' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/checkout')
  })
})
