import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTransaction } from '../api/transactions'
import { ErrorState, LoadingState } from '../components/StatusMessage'
import StatusPill from '../components/StatusPill'
import { formatDate, formatPrice } from '../utils/format'

const backLink =
  'mb-6 inline-flex items-center gap-1 text-sm text-text no-underline transition-colors duration-200 hover:text-text-h'
const panel = 'rounded-lg border border-border p-5'
const panelTitle = 'mb-3 font-heading text-lg font-medium text-text-h'

export default function TransactionDetailPage() {
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getTransaction(id)
      .then((data) => {
        if (cancelled) return
        setTransaction(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus(err?.status === 404 ? 'not-found' : 'error')
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
      <Link to="/transactions" className={backLink}>
        <svg className="size-4" role="presentation" aria-hidden="true">
          <use href="/icons.svg#chevron-left-icon"></use>
        </svg>
        Back to transactions
      </Link>

      {status === 'loading' && <LoadingState label="Loading order…" />}
      {status === 'not-found' && <ErrorState message="This order doesn't exist." />}
      {status === 'error' && <ErrorState message="We couldn't load this order right now." />}

      {status === 'ready' && transaction && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="font-heading text-xl font-semibold text-text-h">
                Order {transaction.id}
              </h1>
              <p className="text-sm text-text">{formatDate(transaction.createdAt)}</p>
            </div>
            <StatusPill status={transaction.status} />
          </div>

          <div className="rounded-lg border border-border">
            <ul className="flex flex-col divide-y divide-border">
              {transaction.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 p-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="size-16 shrink-0 rounded-md border border-border object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-heading text-[15px] font-medium text-text-h">
                      {item.productName}
                    </p>
                    <p className="text-sm text-text">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-heading font-medium text-text-h">{formatPrice(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-1 p-5">
              <div className="flex items-center justify-between text-sm text-text">
                <span>Subtotal</span>
                <span>{formatPrice(transaction.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-text">
                <span>Shipping ({transaction.shipping.name})</span>
                <span>{formatPrice(transaction.shippingCost)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-2 font-heading text-lg font-semibold text-text-h">
                <span>Total</span>
                <span>{formatPrice(transaction.total)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className={panel}>
              <h2 className={panelTitle}>Shipping address</h2>
              <p className="font-medium text-text-h">{transaction.address.fullName}</p>
              <p className="text-sm text-text">{transaction.address.phone}</p>
              <p className="mt-2 text-sm text-text">
                {transaction.address.address}, {transaction.address.city},{' '}
                {transaction.address.province} {transaction.address.postalCode}
              </p>
              <p className="mt-3 text-sm text-text">
                {transaction.shipping.name} · Estimated delivery: {transaction.shipping.estimatedDelivery}
              </p>
            </div>
            <div className={panel}>
              <h2 className={panelTitle}>Payment</h2>
              <p className="text-sm text-text">
                Method: <span className="text-text-h capitalize">{transaction.payment.method.replace('_', ' ')}</span>
              </p>
              <p className="mt-1 text-sm text-text">
                Status: <span className="text-text-h capitalize">{transaction.payment.status.toLowerCase()}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
