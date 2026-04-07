import { render, screen } from '@testing-library/react'
import Stars from './Stars'

describe('Stars', () => {
  it('renders 5 star characters', () => {
    const { container } = render(<Stars n={3} />)
    const stars = container.querySelectorAll('span span')
    expect(stars).toHaveLength(5)
  })

  it('has accessible label', () => {
    render(<Stars n={4.5} />)
    expect(screen.getByLabelText('4.5 stars')).toBeInTheDocument()
  })

  it('renders 0 stars without error', () => {
    render(<Stars n={0} />)
    expect(screen.getByLabelText('0 stars')).toBeInTheDocument()
  })

  it('renders 5 stars without error', () => {
    render(<Stars n={5} />)
    expect(screen.getByLabelText('5 stars')).toBeInTheDocument()
  })
})
