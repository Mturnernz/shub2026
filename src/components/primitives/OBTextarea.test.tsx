import { render, screen, fireEvent } from '@testing-library/react'
import OBTextarea from './OBTextarea'

describe('OBTextarea', () => {
  it('renders with label', () => {
    render(<OBTextarea label="Bio" />)
    expect(screen.getByLabelText('Bio')).toBeInTheDocument()
  })

  it('renders hint text', () => {
    render(<OBTextarea label="Bio" hint="Tell us about yourself" />)
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
  })

  it('renders error and hides hint', () => {
    render(<OBTextarea label="Bio" hint="Hint" error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
    expect(screen.queryByText('Hint')).not.toBeInTheDocument()
  })

  it('accepts value changes', () => {
    const onChange = vi.fn()
    render(<OBTextarea label="Bio" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'Hello' } })
    expect(onChange).toHaveBeenCalled()
  })
})
