import { render, screen } from '@testing-library/react'
import Callout from './Callout'

describe('Callout', () => {
  it('renders children', () => {
    render(<Callout>Some info</Callout>)
    expect(screen.getByText('Some info')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    render(<Callout icon="🔒">Secure</Callout>)
    expect(screen.getByText('🔒')).toBeInTheDocument()
  })

  it('renders all variants without error', () => {
    const variants = ['sage', 'gold', 'primary', 'ink', 'lavender'] as const
    variants.forEach((v) => {
      const { unmount } = render(<Callout v={v}>Text</Callout>)
      expect(screen.getByText('Text')).toBeInTheDocument()
      unmount()
    })
  })
})
