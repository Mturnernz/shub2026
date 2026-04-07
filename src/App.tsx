import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/auth.store'
import { useUIStore } from './store/ui.store'
import Toast from './components/primitives/Toast'
import type { Profile } from './types'

// ── Lazy imports (split by route group) ──────────────────────
// Auth
import Login from './auth/Login'
import SignupClient from './auth/SignupClient'
import ResetPassword from './auth/ResetPassword'

// Placeholder screens — replaced in later phases
const RoleSelector = () => <div style={{ padding: 32, fontFamily: 'var(--font-display)', fontSize: 28 }}>shub</div>

function App() {
  const { setSession, setProfile } = useAuthStore()
  const { toastMsg, clearToast } = useUIStore()

  // ── Bootstrap Supabase auth session ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setProfile(profile as Profile)
          })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setProfile(profile as Profile)
          })
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [setSession, setProfile])

  return (
    <>
      <Routes>
        {/* Root */}
        <Route path="/" element={<RoleSelector />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Client */}
        <Route path="/discover" element={<div>Discover</div>} />
        <Route path="/browse" element={<div>Browse</div>} />
        <Route path="/requests" element={<div>Requests</div>} />
        <Route path="/my-requests" element={<div>My Requests</div>} />
        <Route path="/messages" element={<div>Messages</div>} />
        <Route path="/messages/:conversationId" element={<div>Chat</div>} />
        <Route path="/account" element={<div>Account</div>} />
        <Route path="/bookings" element={<div>Booking History</div>} />

        {/* Flows */}
        <Route path="/book/:providerId" element={<div>Book</div>} />
        <Route path="/subscribe/:providerId" element={<div>Subscribe</div>} />
        <Route path="/shop/:providerId/:itemId" element={<div>Shop</div>} />
        <Route path="/request/:providerId/:contentId" element={<div>Content Request</div>} />
        <Route path="/post-request" element={<div>Post Request</div>} />

        {/* Provider */}
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/provider/requests" element={<div>Provider Requests</div>} />
        <Route path="/listing" element={<div>My Listing</div>} />
        <Route path="/listing/online" element={<div>Online Services</div>} />
        <Route path="/listing/availability" element={<div>Availability</div>} />
        <Route path="/earnings" element={<div>Earnings</div>} />
        <Route path="/verification" element={<div>Verification</div>} />

        {/* Provider signup */}
        <Route path="/signup/provider" element={<div>Provider Onboarding</div>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toastMsg && <Toast msg={toastMsg} onClose={clearToast} />}
    </>
  )
}

export default App
