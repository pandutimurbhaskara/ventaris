jest.mock('../api/cart')

import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from '../api/cart'
import { CartProvider, useCart } from './CartContext'

const emptyCart = { items: [], subtotal: 0, itemCount: 0 }

function TestConsumer() {
  const cart = useCart()
  const [error, setError] = useState(null)

  async function run(action) {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <p data-testid="status">{cart.status}</p>
      <p data-testid="item-count">{cart.itemCount}</p>
      <p data-testid="subtotal">{cart.subtotal}</p>
      <p data-testid="error">{error}</p>
      <button onClick={() => run(() => cart.addItem(1, 2))}>add</button>
      <button onClick={() => run(() => cart.updateQuantity(1, 5))}>update</button>
      <button onClick={() => run(() => cart.removeItem(1))}>remove</button>
      <button onClick={() => run(() => cart.clearCart())}>clear</button>
      <button onClick={() => run(() => cart.refresh())}>refresh</button>
    </div>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CartProvider', () => {
  it('starts in a loading state and becomes ready once the cart loads', async () => {
    getCart.mockResolvedValue({ items: [{ productId: 1 }], subtotal: 100, itemCount: 1 })

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('loading')
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))
    expect(screen.getByTestId('item-count')).toHaveTextContent('1')
    expect(screen.getByTestId('subtotal')).toHaveTextContent('100')
  })

  it('moves to an error state when the initial cart load fails', async () => {
    getCart.mockRejectedValue(new Error('network error'))

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'))
  })

  it('addItem calls addCartItem and adopts the returned cart', async () => {
    getCart.mockResolvedValue(emptyCart)
    addCartItem.mockResolvedValue({ items: [{ productId: 1, quantity: 2 }], subtotal: 200, itemCount: 2 })

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    fireEvent.click(screen.getByText('add'))

    expect(addCartItem).toHaveBeenCalledWith(1, 2)
    await waitFor(() => expect(screen.getByTestId('item-count')).toHaveTextContent('2'))
  })

  it('updateQuantity calls updateCartItem and adopts the returned cart', async () => {
    getCart.mockResolvedValue(emptyCart)
    updateCartItem.mockResolvedValue({ items: [{ productId: 1, quantity: 5 }], subtotal: 500, itemCount: 5 })

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    fireEvent.click(screen.getByText('update'))

    expect(updateCartItem).toHaveBeenCalledWith(1, 5)
    await waitFor(() => expect(screen.getByTestId('item-count')).toHaveTextContent('5'))
  })

  it('removeItem calls removeCartItem and adopts the returned cart', async () => {
    getCart.mockResolvedValue({ items: [{ productId: 1 }], subtotal: 100, itemCount: 1 })
    removeCartItem.mockResolvedValue(emptyCart)

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    fireEvent.click(screen.getByText('remove'))

    expect(removeCartItem).toHaveBeenCalledWith(1)
    await waitFor(() => expect(screen.getByTestId('item-count')).toHaveTextContent('0'))
  })

  it('clearCart calls the clear endpoint and adopts the returned (empty) cart', async () => {
    getCart.mockResolvedValue({ items: [{ productId: 1 }], subtotal: 100, itemCount: 1 })
    clearCart.mockResolvedValue(emptyCart)

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    fireEvent.click(screen.getByText('clear'))

    expect(clearCart).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByTestId('item-count')).toHaveTextContent('0'))
  })

  it('refresh re-fetches the cart and adopts the result', async () => {
    getCart.mockResolvedValueOnce(emptyCart).mockResolvedValueOnce({ items: [{ productId: 2 }], subtotal: 300, itemCount: 3 })

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    fireEvent.click(screen.getByText('refresh'))

    await waitFor(() => expect(screen.getByTestId('item-count')).toHaveTextContent('3'))
    expect(getCart).toHaveBeenCalledTimes(2)
  })

  it('propagates a mutation error to the caller without touching cart state', async () => {
    getCart.mockResolvedValue(emptyCart)
    addCartItem.mockRejectedValue(new Error('Requested quantity (2) exceeds available stock (0)'))

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    fireEvent.click(screen.getByText('add'))

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('Requested quantity (2) exceeds available stock (0)'),
    )
    expect(screen.getByTestId('item-count')).toHaveTextContent('0')
  })
})

describe('useCart', () => {
  it('throws when used outside a CartProvider', () => {
    function Bare() {
      useCart()
      return null
    }
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Bare />)).toThrow('useCart must be used within a CartProvider')

    consoleError.mockRestore()
  })
})
