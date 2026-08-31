import { render, screen } from '@testing-library/react'
import StockBadge from './StockBadge'

describe('StockBadge', () => {
  it('shows "Out of stock" when stock is zero', () => {
    render(<StockBadge stock={0} />)
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
  })

  it('shows a low-stock warning with the remaining count', () => {
    render(<StockBadge stock={3} />)
    expect(screen.getByText('Only 3 left')).toBeInTheDocument()
  })

  it('shows "In stock" once stock is comfortably above the low-stock threshold', () => {
    render(<StockBadge stock={25} />)
    expect(screen.getByText('In stock')).toBeInTheDocument()
  })
})
