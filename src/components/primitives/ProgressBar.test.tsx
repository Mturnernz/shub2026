import { render, screen } from '@testing-library/react'
import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('renders correct number of segments', () => {
    render(<ProgressBar step={2} total={7} />)
    // Each segment is a div inside the bar
    const bar = screen.getByRole('progressbar')
    const segments = bar.querySelectorAll('div')
    expect(segments).toHaveLength(7)
  })

  it('has correct aria attributes', () => {
    render(<ProgressBar step={3} total={7} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '7')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
  })

  it('renders step 0 without error', () => {
    render(<ProgressBar step={0} total={7} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
