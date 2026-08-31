jest.mock('../api/cart')
jest.mock('../api/shipping')
jest.mock('../api/payments')
jest.mock('../api/transactions')

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { getCart } from '../api/cart'
import { listPaymentMethods } from '../api/payments'
import { listShippingOptions } from '../api/shipping'
import { createTransaction } from '../api/transactions'
import { CartProvider } from '../context/CartContext'
import CheckoutPage from './CheckoutPage'

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

const shippingOptions = [
  { id: 'regular', name: 'Regular', price: 15000, estimatedDelivery: '2-4 days' },
  { id: 'express', name: 'Express', price: 30000, estimatedDelivery: '1-2 days' },
]

const paymentMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer' },
  { id: 'cod', name: 'Cash on Delivery' },
]

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <CartProvider>
        <CheckoutPage />
        <LocationDisplay />
      </CartProvider>
    </MemoryRouter>,
  )
}

function fillAddress() {
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Demo Buyer' } })
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '08123456789' } })
  fireEvent.change(screen.getByLabelText('Street address'), { target: { value: 'Jl. Sudirman No. 1' } })
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Jakarta' } })
  fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'DKI Jakarta' } })
  fireEvent.change(screen.getByLabelText('Postal code'), { target: { value: '12190' } })
}

beforeEach(() => {
  jest.clearAllMocks()
  getCart.mockResolvedValue({ items: [cartItem()], subtotal: 900000, itemCount: 2 })
  listShippingOptions.mockResolvedValue(shippingOptions)
  listPaymentMethods.mockResolvedValue(paymentMethods)
})

describe('CheckoutPage', () => {
  it('shows a loading state while the cart and options are being fetched', async () => {
    listShippingOptions.mockReturnValue(new Promise(() => {}))
    renderCheckout()

    expect(screen.getByText('Loading checkout…')).toBeInTheDocument()
    await waitFor(() => expect(getCart).toHaveBeenCalled())
  })

  it('shows an error state when checkout options fail to load', async () => {
    listShippingOptions.mockRejectedValue(new Error('network error'))
    renderCheckout()

    expect(await screen.findByText("We couldn't load checkout options right now.")).toBeInTheDocument()
  })

  it('shows an empty state when the cart has no items', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderCheckout()

    expect(await screen.findByText('Nothing to check out')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/')
  })

  it('renders cart items, address fields, shipping/payment options with the first of each pre-selected', async () => {
    renderCheckout()

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByText(/Regular.*Rp\s*15\.000/)).toBeInTheDocument()
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    const regular = radios.find((r) => r.value === 'regular')
    const bankTransfer = radios.find((r) => r.value === 'bank_transfer')
    expect(regular).toBeChecked()
    expect(bankTransfer).toBeChecked()
  })

  it('updates the shipping cost and total when a different shipping option is chosen', async () => {
    renderCheckout()
    await screen.findByText('Wireless Headphones')

    fireEvent.click(screen.getByText(/Express.*Rp\s*30\.000/))

    expect((await screen.findAllByText(/Rp\s*30\.000/)).length).toBeGreaterThan(0)
    expect(screen.getByText(/Rp\s*930\.000/)).toBeInTheDocument()
  })

  it('submits the address, selected shipping id, and payment method, then navigates to the new order', async () => {
    createTransaction.mockResolvedValue({ id: 'TRX-20260831-0001' })
    renderCheckout()
    await screen.findByText('Wireless Headphones')
    fillAddress()

    fireEvent.click(screen.getByRole('button', { name: 'Place Order' }))

    await waitFor(() =>
      expect(createTransaction).toHaveBeenCalledWith({
        address: {
          fullName: 'Demo Buyer',
          phone: '08123456789',
          address: 'Jl. Sudirman No. 1',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12190',
        },
        shipping: { id: 'regular' },
        payment: 'bank_transfer',
      }),
    )
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/transactions/TRX-20260831-0001'))
  })

  it('shows an error and stays on the page when checkout fails', async () => {
    createTransaction.mockRejectedValue(new Error('Insufficient stock for "Wireless Headphones"'))
    renderCheckout()
    await screen.findByText('Wireless Headphones')
    fillAddress()

    fireEvent.click(screen.getByRole('button', { name: 'Place Order' }))

    expect(await screen.findByText('Insufficient stock for "Wireless Headphones"')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/checkout')
  })
})
