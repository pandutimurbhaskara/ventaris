import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listPaymentMethods } from '../api/payments'
import { listShippingOptions } from '../api/shipping'
import { createTransaction } from '../api/transactions'
import RadioCard from '../components/RadioCard'
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

const primaryBtn =
  'inline-flex w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'
const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none placeholder:text-text focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-border'
const fieldLabel = 'mb-1 block text-sm text-text-h'

const initialAddress = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
}

export default function CheckoutPage() {
  const { items, subtotal, status: cartStatus, refresh } = useCart()
  const navigate = useNavigate()

  const [address, setAddress] = useState(initialAddress)
  const [shippingOptions, setShippingOptions] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [shippingId, setShippingId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [optionsStatus, setOptionsStatus] = useState('loading')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([listShippingOptions(), listPaymentMethods()])
      .then(([shipping, payments]) => {
        setShippingOptions(shipping)
        setPaymentMethods(payments)
        setShippingId(shipping[0]?.id || '')
        setPaymentMethod(payments[0]?.id || '')
        setOptionsStatus('ready')
      })
      .catch(() => setOptionsStatus('error'))
  }, [])

  if (cartStatus === 'loading' || optionsStatus === 'loading') {
    return (
      <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
        <h1 className="mb-2 font-heading text-2xl font-semibold text-text-h">Checkout</h1>
        <LoadingState label="Loading checkout…" />
      </div>
    )
  }

  if (optionsStatus === 'error') {
    return (
      <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
        <h1 className="mb-2 font-heading text-2xl font-semibold text-text-h">Checkout</h1>
        <ErrorState message="We couldn't load checkout options right now." />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
        <h1 className="mb-2 font-heading text-2xl font-semibold text-text-h">Checkout</h1>
        <EmptyState
          icon="cart-icon"
          title="Nothing to check out"
          description="Add products to your cart before checking out."
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

  const selectedShipping = shippingOptions.find((option) => option.id === shippingId)
  const shippingCost = selectedShipping?.price || 0
  const total = subtotal + shippingCost

  function updateAddressField(field, value) {
    setAddress((current) => ({ ...current, [field]: value }))
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const transaction = await createTransaction({ address, shipping: { id: shippingId }, payment: paymentMethod })
      await refresh()
      navigate(`/transactions/${transaction.id}`)
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-text-h">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
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
                  <p className="text-sm text-text">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-heading font-medium text-text-h">{formatPrice(item.subtotal)}</p>
              </li>
            ))}
          </ul>

          <div>
            <h2 className="mb-3 font-heading text-lg font-medium text-text-h">Shipping address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className={fieldLabel}>
                  Full name
                </label>
                <input
                  id="fullName"
                  required
                  value={address.fullName}
                  onChange={(e) => updateAddressField('fullName', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="phone" className={fieldLabel}>
                  Phone
                </label>
                <input
                  id="phone"
                  required
                  value={address.phone}
                  onChange={(e) => updateAddressField('phone', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="postalCode" className={fieldLabel}>
                  Postal code
                </label>
                <input
                  id="postalCode"
                  required
                  value={address.postalCode}
                  onChange={(e) => updateAddressField('postalCode', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className={fieldLabel}>
                  Street address
                </label>
                <input
                  id="address"
                  required
                  value={address.address}
                  onChange={(e) => updateAddressField('address', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="city" className={fieldLabel}>
                  City
                </label>
                <input
                  id="city"
                  required
                  value={address.city}
                  onChange={(e) => updateAddressField('city', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="province" className={fieldLabel}>
                  Province
                </label>
                <input
                  id="province"
                  required
                  value={address.province}
                  onChange={(e) => updateAddressField('province', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-heading text-lg font-medium text-text-h">Shipping method</h2>
            <div className="flex flex-col gap-2">
              {shippingOptions.map((option) => (
                <RadioCard
                  key={option.id}
                  name="shipping"
                  value={option.id}
                  checked={shippingId === option.id}
                  onChange={setShippingId}
                  title={`${option.name} — ${formatPrice(option.price)}`}
                  subtitle={`Estimated delivery: ${option.estimatedDelivery}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-heading text-lg font-medium text-text-h">Payment method</h2>
            <div className="flex flex-col gap-2">
              {paymentMethods.map((method) => (
                <RadioCard
                  key={method.id}
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={setPaymentMethod}
                  title={method.name}
                />
              ))}
            </div>
          </div>

          {error && <ErrorState message={error} />}
        </div>

        <div className="h-fit rounded-lg border border-border p-5">
          <h2 className="mb-4 font-heading text-lg font-medium text-text-h">Order summary</h2>
          <div className="flex items-center justify-between text-sm text-text">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-text">
            <span>Shipping</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-heading font-semibold text-text-h">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button type="submit" disabled={submitting} className={`${primaryBtn} mt-5`}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
          <Link
            to="/cart"
            className="mt-3 block text-center text-sm text-text no-underline transition-colors duration-200 hover:text-text-h"
          >
            Back to cart
          </Link>
        </div>
      </form>
    </div>
  )
}
