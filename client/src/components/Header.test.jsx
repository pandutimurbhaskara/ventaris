jest.mock('../api/cart')

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { getCart } from '../api/cart'
import { CartProvider } from '../context/CartContext'
import Header from './Header'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderHeader(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CartProvider>
        <Header />
        <LocationDisplay />
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Header', () => {
  it('renders the brand, search input, and nav links', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderHeader()
    await waitFor(() => expect(getCart).toHaveBeenCalled())

    expect(screen.getByText('Ventaris')).toBeInTheDocument()
    expect(screen.getByText('Market')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search products…')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /transactions/i })).toHaveAttribute('href', '/transactions')
    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart')
  })

  it('does not show a cart badge when the cart is empty', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderHeader()

    await waitFor(() => expect(getCart).toHaveBeenCalled())
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows the item count badge once the cart has items', async () => {
    getCart.mockResolvedValue({ items: [{ productId: 1, quantity: 3 }], subtotal: 300, itemCount: 3 })
    renderHeader()

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
  })

  it('pre-fills the search input from the current ?search= query param', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderHeader(['/?search=headphones'])
    await waitFor(() => expect(getCart).toHaveBeenCalled())

    expect(screen.getByPlaceholderText('Search products…')).toHaveValue('headphones')
  })

  it('navigates to /?search=<term> when the search form is submitted', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderHeader()
    await waitFor(() => expect(getCart).toHaveBeenCalled())

    fireEvent.change(screen.getByPlaceholderText('Search products…'), { target: { value: 'wireless mouse' } })
    fireEvent.submit(screen.getByPlaceholderText('Search products…').closest('form'))

    expect(screen.getByTestId('location')).toHaveTextContent('/?search=wireless%20mouse')
  })

  it('navigates to / when submitting a blank search', async () => {
    getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
    renderHeader(['/?search=old-term'])
    await waitFor(() => expect(getCart).toHaveBeenCalled())

    fireEvent.change(screen.getByPlaceholderText('Search products…'), { target: { value: '   ' } })
    fireEvent.submit(screen.getByPlaceholderText('Search products…').closest('form'))

    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })
})
