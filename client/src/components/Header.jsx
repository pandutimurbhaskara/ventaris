import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const navLink =
  'relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-text-h transition-colors duration-200 hover:bg-social-bg'
const badge =
  'absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-medium text-white'

export default function Header() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [term, setTerm] = useState(searchParams.get('search') || '')
  const { itemCount } = useCart()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = term.trim()
    navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg">
      <div className="mx-auto flex w-[1126px] max-w-full flex-wrap items-center gap-3 px-5 py-3 lg:gap-6 lg:px-0">
        <Link
          to="/"
          className="font-heading text-lg font-semibold text-text-h no-underline lg:text-xl"
        >
          Ventaris <span className="text-accent">Market</span>
        </Link>

        <form onSubmit={handleSubmit} className="order-3 w-full lg:order-2 lg:max-w-md lg:flex-1">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <svg
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text"
              role="presentation"
              aria-hidden="true"
            >
              <use href="/icons.svg#search-icon"></use>
            </svg>
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-md border border-border bg-bg py-2 pr-3 pl-9 text-sm text-text-h outline-none placeholder:text-text focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-border"
            />
          </label>
        </form>

        <nav className="order-2 ml-auto flex items-center gap-1 lg:order-3">
          <Link to="/transactions" className={navLink}>
            <svg className="size-[18px]" role="presentation" aria-hidden="true">
              <use href="/icons.svg#receipt-icon"></use>
            </svg>
            <span className="hidden sm:inline">Transactions</span>
          </Link>
          <Link to="/cart" className={navLink}>
            <span className="relative">
              <svg className="size-[18px]" role="presentation" aria-hidden="true">
                <use href="/icons.svg#cart-icon"></use>
              </svg>
              {itemCount > 0 && <span className={badge}>{itemCount}</span>}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
