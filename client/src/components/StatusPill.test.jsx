import { render, screen } from '@testing-library/react'
import StatusPill from './StatusPill'

describe('StatusPill', () => {
  it('renders the status lowercased', () => {
    render(<StatusPill status="PROCESSING" />)
    expect(screen.getByText('processing')).toBeInTheDocument()
  })

  it('applies the accent style for PROCESSING', () => {
    render(<StatusPill status="PROCESSING" />)
    expect(screen.getByText('processing')).toHaveClass('text-accent')
  })

  it('applies the success style for COMPLETED', () => {
    render(<StatusPill status="COMPLETED" />)
    expect(screen.getByText('completed')).toHaveClass('text-success')
  })

  it('applies the danger style for CANCELLED', () => {
    render(<StatusPill status="CANCELLED" />)
    expect(screen.getByText('cancelled')).toHaveClass('text-danger')
  })

  it('falls back to a neutral style for an unrecognized status', () => {
    render(<StatusPill status="UNKNOWN" />)
    expect(screen.getByText('unknown')).toHaveClass('text-text-h')
  })

  it('is case-insensitive when matching a status style', () => {
    render(<StatusPill status="completed" />)
    expect(screen.getByText('completed')).toHaveClass('text-success')
  })
})
