import { render, screen, fireEvent } from '@testing-library/react'
import Toggle from './Toggle'

describe('Toggle', () => {
  it('renders with label', () => {
    render(<Toggle on={false} onChange={vi.fn()} label="Enable feature" />)
    expect(screen.getByText('Enable feature')).toBeInTheDocument()
  })

  it('renders with hint', () => {
    render(<Toggle on={false} onChange={vi.fn()} label="Feature" hint="Some hint" />)
    expect(screen.getByText('Some hint')).toBeInTheDocument()
  })

  it('calls onChange with toggled value when clicked', () => {
    const onChange = vi.fn()
    render(<Toggle on={false} onChange={onChange} label="Toggle" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when on=true and clicked', () => {
    const onChange = vi.fn()
    render(<Toggle on={true} onChange={onChange} label="Toggle" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('has aria-checked reflecting current state', () => {
    const { rerender } = render(<Toggle on={false} onChange={vi.fn()} label="Toggle" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    rerender(<Toggle on={true} onChange={vi.fn()} label="Toggle" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Toggle on={false} onChange={vi.fn()} label="Toggle" disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
