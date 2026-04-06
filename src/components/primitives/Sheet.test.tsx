import { render, screen, fireEvent } from '@testing-library/react'
import Sheet from './Sheet'

describe('Sheet', () => {
  it('renders nothing when closed', () => {
    render(
      <Sheet open={false} onClose={vi.fn()}>
        <p>Content</p>
      </Sheet>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders children when open', () => {
    render(
      <Sheet open={true} onClose={vi.fn()}>
        <p>Sheet content</p>
      </Sheet>
    )
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <Sheet open={true} onClose={onClose}>
        <p>Content</p>
      </Sheet>
    )
    // The dialog element is the overlay
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(
      <Sheet open={true} onClose={onClose}>
        <p>Content</p>
      </Sheet>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when sheet content is clicked', () => {
    const onClose = vi.fn()
    render(
      <Sheet open={true} onClose={onClose}>
        <p>Content</p>
      </Sheet>
    )
    fireEvent.click(screen.getByText('Content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('has dialog role when open', () => {
    render(
      <Sheet open={true} onClose={vi.fn()}>
        <p>Content</p>
      </Sheet>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
