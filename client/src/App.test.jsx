jest.mock('./api/cart')

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getCart } from './api/cart'
import App from './App'
import { CartProvider } from './context/CartContext'

beforeEach(() => {
  jest.clearAllMocks()
  getCart.mockResolvedValue({ items: [], subtotal: 0, itemCount: 0 })
})

describe('App', () => {
  it('renders the header alongside the matched child route', () => {
    render(
      <MemoryRouter initialEntries={['/child']}>
        <CartProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="child" element={<p>Child route content</p>} />
            </Route>
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Ventaris')).toBeInTheDocument()
    expect(screen.getByText('Child route content')).toBeInTheDocument()
  })
})
