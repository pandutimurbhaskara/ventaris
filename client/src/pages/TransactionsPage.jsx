import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTransactions } from '../api/transactions'
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessage'
import StatusPill from '../components/StatusPill'
import { formatDate, formatPrice } from '../utils/format'

const row =
  'flex flex-col gap-2 rounded-lg border border-border p-4 no-underline transition-shadow duration-300 hover:shadow-card sm:flex-row sm:items-center sm:justify-between'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    listTransactions()
      .then((data) => {
        setTransactions(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-text-h">Transaction history</h1>

      {status === 'loading' && <LoadingState label="Loading transactions…" />}
      {status === 'error' && <ErrorState message="We couldn't load your transactions." />}

      {status === 'ready' && transactions.length === 0 && (
        <EmptyState
          icon="receipt-icon"
          title="No transactions yet"
          description="Orders you place will show up here."
          action={
            <Link
              to="/"
              className="mt-1 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white no-underline transition-opacity duration-200 hover:opacity-90"
            >
              Browse products
            </Link>
          }
        />
      )}

      {status === 'ready' && transactions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <Link to={`/transactions/${transaction.id}`} className={row}>
                <div>
                  <p className="font-heading font-medium text-text-h">Order {transaction.id}</p>
                  <p className="text-sm text-text">
                    {formatDate(transaction.createdAt)} · {transaction.itemCount} item
                    {transaction.itemCount === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={transaction.status} />
                  <span className="font-heading font-semibold text-text-h">
                    {formatPrice(transaction.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
