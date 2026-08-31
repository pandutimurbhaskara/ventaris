import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../api/products'
import QuantityStepper from '../components/QuantityStepper'
import { ErrorState, LoadingState } from '../components/StatusMessage'
import StockBadge from '../components/StockBadge'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

const backLink =
  'mb-6 inline-flex items-center gap-1 text-sm text-text no-underline transition-colors duration-200 hover:text-text-h'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setQuantity(1)

    getProduct(id)
      .then((data) => {
        if (cancelled) return
        setProduct(data)
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

  async function handleAddToCart() {
    setCartError(null)
    try {
      await addItem(product.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 1200)
    } catch (err) {
      setCartError(err.message)
    }
  }

  return (
    <div className="mx-auto w-[1126px] max-w-full px-5 py-8 lg:px-0">
      <Link to="/" className={backLink}>
        <svg className="size-4" role="presentation" aria-hidden="true">
          <use href="/icons.svg#chevron-left-icon"></use>
        </svg>
        Back to products
      </Link>

      {status === 'loading' && <LoadingState label="Loading product…" />}
      {status === 'not-found' && <ErrorState message="This product doesn't exist." />}
      {status === 'error' && <ErrorState message="We couldn't load this product right now." />}

      {status === 'ready' && product && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg border border-border object-cover"
          />
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-2xl font-semibold text-text-h lg:text-3xl">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-semibold text-text-h">
                {formatPrice(product.price)}
              </span>
              <StockBadge stock={product.stock} />
            </div>
            <p className="text-text">{product.description}</p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <QuantityStepper value={quantity} max={product.stock} onChange={setQuantity} />
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {added ? 'Added to cart!' : 'Add to Cart'}
              </button>
            </div>
            {cartError && <p className="text-sm text-danger">{cartError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
