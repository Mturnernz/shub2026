import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/auth.store'
import { useUIStore } from './store/ui.store'
import Toast from './components/primitives/Toast'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import type { Profile } from './types'

// Auth
import RoleSelector from './auth/RoleSelector'
import Login from './auth/Login'
import SignupClient from './auth/SignupClient'
import ResetPassword from './auth/ResetPassword'
import ProviderOnboarding from './onboarding/ProviderOnboarding'

// Placeholder — replaced in Phase 3+
const Placeholder = ({ label }: { label: string }) => (
  <div style={{ padding: '80px 24px 24px', fontFamily: 'var(--font-body)', color: 'var(--muted)', fontSize: 14 }}>
    {label}
  </div>
)

function App() {
  const { setSession, setProfile } = useAuthStore()
  const { toastMsg, clearToast } = useUIStore()

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
        {/* ── Public ─────────────────────────── */}
        <Route path="/" element={<RoleSelector />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/signup/provider" element={<ProviderOnboarding />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── App shell (bottom nav + wordmark) ─ */}
        <Route element={<AppShell />}>
          {/* Client — public routes (guests allowed) */}
          <Route path="/discover" element={<Placeholder label="Discover — Phase 3" />} />
          <Route path="/browse" element={<Placeholder label="Browse — Phase 3" />} />
          <Route path="/requests" element={
            <ProtectedRoute><Placeholder label="Requests board — Phase 3" /></ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute><Placeholder label="My requests — Phase 3" /></ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute><Placeholder label="Messages — Phase 5" /></ProtectedRoute>
          } />
          <Route path="/messages/:conversationId" element={
            <ProtectedRoute><Placeholder label="Chat thread — Phase 5" /></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute><Placeholder label="Account — Phase 3" /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><Placeholder label="Booking history — Phase 3" /></ProtectedRoute>
          } />

          {/* Provider */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="provider"><Placeholder label="Dashboard — Phase 4" /></ProtectedRoute>
          } />
          <Route path="/provider/requests" element={
            <ProtectedRoute role="provider"><Placeholder label="Provider requests — Phase 4" /></ProtectedRoute>
          } />
          <Route path="/listing" element={
            <ProtectedRoute role="provider"><Placeholder label="My listing — Phase 4" /></ProtectedRoute>
          } />
          <Route path="/listing/online" element={
            <ProtectedRoute role="provider"><Placeholder label="Online services — Phase 4" /></ProtectedRoute>
          } />
          <Route path="/listing/availability" element={
            <ProtectedRoute role="provider"><Placeholder label="Availability — Phase 4" /></ProtectedRoute>
          } />
          <Route path="/earnings" element={
            <ProtectedRoute role="provider"><Placeholder label="Earnings — Phase 4" /></ProtectedRoute>
          } />
          <Route path="/verification" element={
            <ProtectedRoute role="provider"><Placeholder label="Verification — Phase 4" /></ProtectedRoute>
          } />
        </Route>

        {/* ── Full-screen flows (no shell) ────── */}
        <Route path="/book/:providerId" element={
          <ProtectedRoute><Placeholder label="Book — Phase 3" /></ProtectedRoute>
        } />
        <Route path="/subscribe/:providerId" element={
          <ProtectedRoute><Placeholder label="Subscribe — Phase 4" /></ProtectedRoute>
        } />
        <Route path="/shop/:providerId/:itemId" element={
          <ProtectedRoute><Placeholder label="Shop — Phase 4" /></ProtectedRoute>
        } />
        <Route path="/request/:providerId/:contentId" element={
          <ProtectedRoute><Placeholder label="Content request — Phase 4" /></ProtectedRoute>
        } />
        <Route path="/post-request" element={
          <ProtectedRoute><Placeholder label="Post request — Phase 3" /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toastMsg && <Toast msg={toastMsg} onClose={clearToast} />}
    </>
  )
}

export default App
