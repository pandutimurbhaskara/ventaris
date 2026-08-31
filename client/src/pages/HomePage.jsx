import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessage'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listProducts(search)
      .then((data) => {
        if (cancelled) return
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [search, retryKey])

  return (
    <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-h lg:text-3xl">
          {search ? `Results for "${search}"` : 'Browse products'}
        </h1>
        <p className="mt-1 text-sm text-text">
          {status === 'ready' && `${products.length} product${products.length === 1 ? '' : 's'} found`}
        </p>
      </div>

      {status === 'loading' && <LoadingState label="Loading products…" />}

      {status === 'error' && (
        <ErrorState
          message="We couldn't load products right now."
          onRetry={() => setRetryKey((key) => key + 1)}
        />
      )}

      {status === 'ready' && products.length === 0 && (
        <EmptyState
          icon="box-icon"
          title="No products found"
          description={search ? `Nothing matched "${search}". Try a different search.` : 'Check back soon.'}
        />
      )}

      {status === 'ready' && products.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
