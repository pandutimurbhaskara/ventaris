import { createContext, use, useEffect, useMemo, useState } from 'react'
import { addCartItem, clearCart as clearCartRequest, getCart, removeCartItem, updateCartItem } from '../api/cart'

const CartContext = createContext(null)
const emptyCart = { items: [], subtotal: 0, itemCount: 0 }

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getCart()
      .then((data) => {
        setCart(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const api = useMemo(
    () => ({
      ...cart,
      status,
      async refresh() {
        const data = await getCart()
        setCart(data)
        return data
      },
      async addItem(productId, quantity = 1) {
        const data = await addCartItem(productId, quantity)
        setCart(data)
        return data
      },
      async updateQuantity(productId, quantity) {
        const data = await updateCartItem(productId, quantity)
        setCart(data)
        return data
      },
      async removeItem(productId) {
        const data = await removeCartItem(productId)
        setCart(data)
        return data
      },
      async clearCart() {
        const data = await clearCartRequest()
        setCart(data)
        return data
      },
      setCart,
    }),
    [cart, status],
  )

  return <CartContext value={api}>{children}</CartContext>
}

export function useCart() {
  const ctx = use(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
