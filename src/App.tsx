import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
import UpdatePassword from './auth/UpdatePassword'
import EmailConfirmed from './auth/EmailConfirmed'
import ProviderOnboarding from './onboarding/ProviderOnboarding'

// Client screens
import Discover from './screens/client/Discover'
import Browse from './screens/client/Browse'
import Requests from './screens/client/Requests'
import MyRequests from './screens/client/MyRequests'
import Account from './screens/client/Account'
import Messages from './screens/client/Messages'
import ChatThread from './screens/client/ChatThread'
import Bookings from './screens/client/Bookings'
import Saved from './screens/client/Saved'
import Privacy from './screens/client/Privacy'

// Provider screens
import Dashboard from './screens/provider/Dashboard'
import ProviderRequests from './screens/provider/Requests'
import Listing from './screens/provider/Listing'
import Availability from './screens/provider/Availability'
import OnlineServices from './screens/provider/OnlineServices'
import Earnings from './screens/provider/Earnings'
import Verification from './screens/provider/Verification'

// Flows
import Book from './flows/Book'
import PostRequest from './flows/PostRequest'
import Subscribe from './flows/Subscribe'
import Shop from './flows/Shop'
import ContentRequest from './flows/ContentRequest'

function App() {
  const { setSession, setProfile } = useAuthStore()
  const { toastMsg, clearToast } = useUIStore()
  const queryClient = useQueryClient()

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

  // Realtime subscription — invalidate notifications query on new row
  useEffect(() => {
    const channel = supabase
      .channel('notifications-global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  return (
    <>
      <Routes>
        {/* ── Public ─────────────────────────── */}
        <Route path="/" element={<RoleSelector />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/signup/provider" element={<ProviderOnboarding />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/welcome" element={<EmailConfirmed />} />

        {/* ── App shell (bottom nav + wordmark) ─ */}
        <Route element={<AppShell />}>
          {/* Client — public routes (guests allowed) */}
          <Route path="/discover" element={<Discover />} />
          <Route path="/browse" element={<Browse />} />

          {/* Client — auth required */}
          <Route path="/requests" element={
            <ProtectedRoute><Requests /></ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute><MyRequests /></ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute><Messages /></ProtectedRoute>
          } />
          <Route path="/messages/:conversationId" element={
            <ProtectedRoute><ChatThread /></ProtectedRoute>
          } />
          <Route path="/account" element={<Account />} />
          <Route path="/bookings" element={
            <ProtectedRoute><Bookings /></ProtectedRoute>
          } />
          <Route path="/saved" element={
            <ProtectedRoute><Saved /></ProtectedRoute>
          } />
          <Route path="/privacy" element={
            <ProtectedRoute><Privacy /></ProtectedRoute>
          } />

          {/* Provider — auth + role required */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="provider"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/provider/requests" element={
            <ProtectedRoute role="provider"><ProviderRequests /></ProtectedRoute>
          } />
          <Route path="/listing" element={
            <ProtectedRoute role="provider"><Listing /></ProtectedRoute>
          } />
          <Route path="/listing/online" element={
            <ProtectedRoute role="provider"><OnlineServices /></ProtectedRoute>
          } />
          <Route path="/listing/availability" element={
            <ProtectedRoute role="provider"><Availability /></ProtectedRoute>
          } />
          <Route path="/earnings" element={
            <ProtectedRoute role="provider"><Earnings /></ProtectedRoute>
          } />
          <Route path="/verification" element={
            <ProtectedRoute role="provider"><Verification /></ProtectedRoute>
          } />
        </Route>

        {/* ── Full-screen flows (no shell) ────── */}
        <Route path="/book/:providerId" element={
          <ProtectedRoute><Book /></ProtectedRoute>
        } />
        <Route path="/subscribe/:providerId" element={
          <ProtectedRoute><Subscribe /></ProtectedRoute>
        } />
        <Route path="/shop/:providerId" element={
          <ProtectedRoute><Shop /></ProtectedRoute>
        } />
        <Route path="/content-request/:providerId" element={
          <ProtectedRoute><ContentRequest /></ProtectedRoute>
        } />
        <Route path="/post-request" element={
          <ProtectedRoute><PostRequest /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toastMsg && <Toast msg={toastMsg} onClose={clearToast} />}
    </>
  )
}

export default App
