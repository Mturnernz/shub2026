import { render, screen, fireEvent } from '@testing-library/react'
import Chip from './Chip'

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>Filter</Chip>)
    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handler = vi.fn()
    render(<Chip onClick={handler}>Filter</Chip>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('renders as active chip', () => {
    render(<Chip active>Active</Chip>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with accent', () => {
    render(<Chip accent active>Gold</Chip>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
