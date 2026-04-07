import { render, screen, fireEvent } from '@testing-library/react'
import OBToggle from './OBToggle'

describe('OBToggle', () => {
  it('renders with label', () => {
    render(<OBToggle on={false} onChange={vi.fn()} label="In-calls" />)
    expect(screen.getByText('In-calls')).toBeInTheDocument()
  })

  it('renders hint', () => {
    render(<OBToggle on={false} onChange={vi.fn()} label="In-calls" hint="Available at your location" />)
    expect(screen.getByText('Available at your location')).toBeInTheDocument()
  })

  it('calls onChange with toggled value', () => {
    const onChange = vi.fn()
    render(<OBToggle on={false} onChange={onChange} label="In-calls" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('reflects aria-checked', () => {
    const { rerender } = render(<OBToggle on={false} onChange={vi.fn()} label="Toggle" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    rerender(<OBToggle on={true} onChange={vi.fn()} label="Toggle" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })
})
