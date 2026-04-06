import { render, screen, act } from '@testing-library/react'
import Toast from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the message', () => {
    render(<Toast msg="Hello world" onClose={vi.fn()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('calls onClose after 3200ms', () => {
    const onClose = vi.fn()
    render(<Toast msg="Auto dismiss" onClose={onClose} />)
    act(() => { vi.advanceTimersByTime(3200) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when dismiss button is clicked', () => {
    const onClose = vi.fn()
    render(<Toast msg="Dismiss me" onClose={onClose} />)
    screen.getByRole('button', { name: /dismiss/i }).click()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has status role for accessibility', () => {
    render(<Toast msg="Status" onClose={vi.fn()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
