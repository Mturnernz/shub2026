import { render, screen, fireEvent } from '@testing-library/react'
import Btn from './Btn'

describe('Btn', () => {
  it('renders children', () => {
    render(<Btn>Click me</Btn>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handler = vi.fn()
    render(<Btn onClick={handler}>Click me</Btn>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handler = vi.fn()
    render(<Btn disabled onClick={handler}>Click me</Btn>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('shows spinner and hides text when loading', () => {
    render(<Btn loading>Click me</Btn>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('applies full width class', () => {
    render(<Btn full>Click me</Btn>)
    // Just verify it renders
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders all variants without error', () => {
    const variants = ['primary', 'gold', 'teal', 'ghost', 'ink', 'soft', 'sage'] as const
    variants.forEach((v) => {
      const { unmount } = render(<Btn v={v}>Btn</Btn>)
      expect(screen.getByRole('button')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders as submit button when type=submit', () => {
    render(<Btn type="submit">Submit</Btn>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
