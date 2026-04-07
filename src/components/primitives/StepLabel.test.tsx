import { render, screen } from '@testing-library/react'
import StepLabel from './StepLabel'

describe('StepLabel', () => {
  it('renders label uppercase', () => {
    render(<StepLabel step={1} total={7} label="Your identity" />)
    expect(screen.getByText('YOUR IDENTITY')).toBeInTheDocument()
  })

  it('renders step count', () => {
    render(<StepLabel step={3} total={7} label="Step" />)
    expect(screen.getByText('3 of 7')).toBeInTheDocument()
  })
})
