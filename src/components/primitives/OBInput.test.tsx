import { render, screen, fireEvent } from '@testing-library/react'
import OBInput from './OBInput'

describe('OBInput', () => {
  it('renders with label', () => {
    render(<OBInput label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders hint text', () => {
    render(<OBInput label="Password" hint="At least 8 characters" />)
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
  })

  it('renders error text (overrides hint)', () => {
    render(<OBInput label="Password" hint="Hint" error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
    expect(screen.queryByText('Hint')).not.toBeInTheDocument()
  })

  it('accepts value changes', () => {
    const onChange = vi.fn()
    render(<OBInput label="Name" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('forwards input attributes', () => {
    render(<OBInput label="Email" type="email" placeholder="you@example.com" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
  })
})
