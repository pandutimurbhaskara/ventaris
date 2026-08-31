import { fireEvent, render, screen } from '@testing-library/react'
import { EmptyState, ErrorState, LoadingState } from './StatusMessage'

describe('LoadingState', () => {
  it('renders the default label', () => {
    render(<LoadingState />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders a custom label', () => {
    render(<LoadingState label="Loading products…" />)
    expect(screen.getByText('Loading products…')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('renders the default message when none is given', () => {
    render(<ErrorState />)
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('renders a custom message', () => {
    render(<ErrorState message="We couldn't load products right now." />)
    expect(screen.getByText("We couldn't load products right now.")).toBeInTheDocument()
  })

  it('does not render a retry button when onRetry is not given', () => {
    render(<ErrorState message="Failed" />)
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('renders a retry button that calls onRetry when clicked', () => {
    const onRetry = jest.fn()
    render(<ErrorState message="Failed" onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('EmptyState', () => {
  it('renders the title, description, and action', () => {
    render(
      <EmptyState
        title="Your cart is empty"
        description="Browse the marketplace and add something you like."
        action={<button type="button">Browse products</button>}
      />,
    )

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Browse the marketplace and add something you like.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse products' })).toBeInTheDocument()
  })

  it('omits the description when none is given', () => {
    render(<EmptyState title="No transactions yet" />)
    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })
})
