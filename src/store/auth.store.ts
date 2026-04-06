import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface AuthStore {
  session: Session | null
  profile: Profile | null
  activeRole: 'client' | 'provider'
  setSession: (s: Session | null) => void
  setProfile: (p: Profile | null) => void
  setActiveRole: (r: 'client' | 'provider') => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      activeRole: 'client',
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setActiveRole: (activeRole) => set({ activeRole }),
      reset: () => set({ session: null, profile: null, activeRole: 'client' }),
    }),
    {
      name: 'shub-auth',
      partialize: (state) => ({
        activeRole: state.activeRole,
      }),
    }
  )
)
