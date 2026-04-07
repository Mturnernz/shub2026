export interface OnboardingData {
  // Step 0
  bookingsPerWeek: number
  context: 'student' | 'backpacker' | 'extra' | 'curious' | null
  bio: string
  email: string
  dob: string
  // Step 1
  displayName: string
  avatar: string
  suburb: string
  pronouns: string
  phone: string
  // Step 2
  vibes: string[]
  quote: string
  // Step 3
  comfortLevels: string[]
  privateNotes: string
  // Step 4
  rateSocial: string
  rateIntimate: string
  availMode: 'flexible' | 'days'
  days: string[]
  dayTimes: Record<string, { start: string; end: string }>
  inCall: boolean
  outCall: boolean
  preScreening: boolean
  newClients: boolean
  // Step 5
  healthDate: string
  emergencyName: string
  emergencyPhone: string
  // Step 6 consent
  consentAge: boolean
  consentWorkRights: boolean
  consentTerms: boolean
}

export const initialData: OnboardingData = {
  bookingsPerWeek: 3,
  context: null,
  bio: '',
  email: '',
  dob: '',
  displayName: '',
  avatar: '🌸',
  suburb: '',
  pronouns: '',
  phone: '',
  vibes: [],
  quote: '',
  comfortLevels: ['social'],
  privateNotes: '',
  rateSocial: '',
  rateIntimate: '',
  availMode: 'flexible',
  days: [],
  dayTimes: {},
  inCall: true,
  outCall: false,
  preScreening: true,
  newClients: true,
  healthDate: '',
  emergencyName: '',
  emergencyPhone: '',
  consentAge: false,
  consentWorkRights: false,
  consentTerms: false,
}

export const STEP_LABELS = [
  'What you could earn',
  'Your identity',
  'Your vibe',
  'Your comfort zone',
  'Your terms',
  'Safety setup',
  'Preview & submit',
]

export const TOTAL_STEPS = 7
