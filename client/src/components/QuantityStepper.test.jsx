import { fireEvent, render, screen } from '@testing-library/react'
import QuantityStepper from './QuantityStepper'

describe('QuantityStepper', () => {
  it('renders the current value', () => {
    render(<QuantityStepper value={2} max={5} onChange={jest.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onChange with value + 1 when the increase button is clicked', () => {
    const onChange = jest.fn()
    render(<QuantityStepper value={2} max={5} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with value - 1 when the decrease button is clicked', () => {
    const onChange = jest.fn()
    render(<QuantityStepper value={2} max={5} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('disables the decrease button at the minimum of 1', () => {
    render(<QuantityStepper value={1} max={5} onChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
  })

  it('disables the increase button at the max', () => {
    render(<QuantityStepper value={5} max={5} onChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
  })
})
