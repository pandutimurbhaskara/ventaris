import { fireEvent, render, screen } from '@testing-library/react'
import RadioCard from './RadioCard'

describe('RadioCard', () => {
  it('renders the title and subtitle', () => {
    render(
      <RadioCard
        name="shipping"
        value="regular"
        checked={false}
        onChange={jest.fn()}
        title="Regular — Rp 15.000"
        subtitle="Estimated delivery: 2-4 days"
      />,
    )

    expect(screen.getByText('Regular — Rp 15.000')).toBeInTheDocument()
    expect(screen.getByText('Estimated delivery: 2-4 days')).toBeInTheDocument()
  })

  it('omits the subtitle when none is given', () => {
    render(<RadioCard name="payment" value="cod" checked={false} onChange={jest.fn()} title="Cash on Delivery" />)
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument()
  })

  it('reflects the checked state on the radio input', () => {
    render(<RadioCard name="shipping" value="regular" checked onChange={jest.fn()} title="Regular" />)
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('calls onChange with its value when selected', () => {
    const onChange = jest.fn()
    render(<RadioCard name="shipping" value="express" checked={false} onChange={onChange} title="Express" />)

    fireEvent.click(screen.getByRole('radio'))

    expect(onChange).toHaveBeenCalledWith('express')
  })
})
