const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'

export default function StockBadge({ stock }) {
  if (stock <= 0) {
    return <span className={`${base} bg-danger-bg text-danger`}>Out of stock</span>
  }
  if (stock <= 5) {
    return <span className={`${base} bg-accent-bg text-accent`}>Only {stock} left</span>
  }
  return <span className={`${base} bg-success-bg text-success`}>In stock</span>
}
