import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QuantityStepper from '../components/QuantityStepper'
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

const removeBtn =
  'flex size-8 items-center justify-center rounded-md text-text transition-colors duration-200 hover:bg-danger-bg hover:text-danger'
const primaryBtn =
  'inline-flex w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'

export default function CartPage() {
  const { items, status, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()
  const [actionError, setActionError] = useState(null)

  async function handleUpdateQuantity(productId, quantity) {
    setActionError(null)
    try {
      await updateQuantity(productId, quantity)
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleRemove(productId) {
    setActionError(null)
    try {
      await removeItem(productId)
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
        <h1 className="mb-2 font-heading text-2xl font-semibold text-text-h">Your cart</h1>
        <LoadingState label="Loading cart…" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
        <h1 className="mb-2 font-heading text-2xl font-semibold text-text-h">Your cart</h1>
        <ErrorState message="We couldn't load your cart right now." />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
        <h1 className="mb-2 font-heading text-2xl font-semibold text-text-h">Your cart</h1>
        <EmptyState
          icon="cart-icon"
          title="Your cart is empty"
          description="Browse the marketplace and add something you like."
          action={
            <Link
              to="/"
              className="mt-1 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white no-underline transition-opacity duration-200 hover:opacity-90"
            >
              Browse products
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-text-h">Your cart</h1>

      {actionError && <p className="mb-4 text-sm text-danger">{actionError}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 p-4">
              <img
                src={item.image}
                alt={item.name}
                className="size-16 shrink-0 rounded-md border border-border object-cover"
              />
              <div className="flex-1">
                <p className="font-heading text-[15px] font-medium text-text-h">{item.name}</p>
                <p className="text-sm text-text">{formatPrice(item.price)} each</p>
              </div>
              <QuantityStepper
                value={item.quantity}
                max={item.stock}
                onChange={(qty) => handleUpdateQuantity(item.productId, qty)}
              />
              <p className="w-24 text-right font-heading font-medium text-text-h">
                {formatPrice(item.subtotal)}
              </p>
              <button
                type="button"
                className={removeBtn}
                onClick={() => handleRemove(item.productId)}
                aria-label={`Remove ${item.name}`}
              >
                <svg className="size-4" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#trash-icon"></use>
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-lg border border-border p-5">
          <h2 className="mb-4 font-heading text-lg font-medium text-text-h">Order summary</h2>
          <div className="flex items-center justify-between text-sm text-text">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-heading font-semibold text-text-h">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button type="button" className={`${primaryBtn} mt-5`} onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link
            to="/"
            className="mt-3 block text-center text-sm text-text no-underline transition-colors duration-200 hover:text-text-h"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
