import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import StockBadge from './StockBadge'

const card =
  'flex flex-col overflow-hidden rounded-lg border border-border bg-bg text-left transition-shadow duration-300 hover:shadow-card'
const primaryBtn =
  'inline-flex flex-1 items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'
const secondaryBtn =
  'inline-flex flex-1 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-text-h no-underline transition-colors duration-200 hover:bg-social-bg'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [error, setError] = useState(null)

  async function handleAddToCart() {
    setError(null)
    try {
      await addItem(product.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1200)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={card}>
      <Link to={`/products/${product.id}`} className="block">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-[3/2] w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-[15px] font-medium text-text-h">{product.name}</h3>
          <StockBadge stock={product.stock} />
        </div>
        <p className="line-clamp-2 text-sm text-text">{product.description}</p>
        <p className="mt-auto font-heading text-lg font-semibold text-text-h">
          {formatPrice(product.price)}
        </p>
        <div className="flex gap-2 pt-1">
          <Link to={`/products/${product.id}`} className={secondaryBtn}>
            View Detail
          </Link>
          <button
            type="button"
            className={primaryBtn}
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </div>
  )
}
