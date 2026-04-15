import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import type {
  Profile,
  ProviderListing,
  ProviderSubscription,
  Booking,
  Conversation,
  Message,
  Notification,
  Request,
  Pitch,
  DashboardData,
  ProviderFilters,
} from '../types'

// ============================================================
// Providers
// ============================================================

async function getProviders(filters: ProviderFilters = {}): Promise<ProviderListing[]> {
  let query = supabase
    .from('provider_listings')
    .select('*, profiles(*)')
    .eq('status', 'approved')
    .eq('paused', false)

  if (filters.type && filters.type !== 'both') {
    query = query.or(`type.eq.${filters.type},type.eq.both`)
  }
  if (filters.suburb) {
    query = query.eq('suburb', filters.suburb)
  }
  if (filters.priceMax) {
    query = query.lte('price_social', filters.priceMax)
  }
  if (filters.available) {
    query = query.eq('available', true)
  }
  if (filters.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  const limit = filters.limit ?? 20
  const page = filters.page ?? 0
  query = query.range(page * limit, (page + 1) * limit - 1).order('rating', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return (data as ProviderListing[]) ?? []
}

async function getProvider(id: string): Promise<ProviderListing> {
  const { data, error } = await supabase
    .from('provider_listings')
    .select('*, profiles(*)')
    .eq('provider_id', id)
    .single()
  if (error) throw error
  return data as ProviderListing
}

export const useProviders = (filters: ProviderFilters = {}) =>
  useQuery({
    queryKey: ['providers', filters],
    queryFn: () => getProviders(filters),
  })

export const useProvider = (id: string) =>
  useQuery({
    queryKey: ['provider', id],
    queryFn: () => getProvider(id),
    enabled: !!id,
  })

async function getProviderSubscriptions(providerId: string): Promise<ProviderSubscription[]> {
  const { data, error } = await supabase
    .from('provider_subscriptions')
    .select('*')
    .eq('provider_id', providerId)
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data as ProviderSubscription[]) ?? []
}

export const useProviderSubscriptions = (providerId: string) =>
  useQuery({
    queryKey: ['provider-subscriptions', providerId],
    queryFn: () => getProviderSubscriptions(providerId),
    enabled: !!providerId,
  })

// ============================================================
// Profile
// ============================================================

async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as Profile
}

export const useProfile = (userId: string) =>
  useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  })

// ============================================================
// Bookings
// ============================================================

async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: false })
  if (error) throw error
  return (data as Booking[]) ?? []
}

export const useBookings = () =>
  useQuery({ queryKey: ['bookings'], queryFn: getBookings })

// ============================================================
// Conversations & Messages
// ============================================================

async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
  if (error) throw error
  return (data as Conversation[]) ?? []
}

async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Message[]) ?? []
}

export const useConversations = () =>
  useQuery({ queryKey: ['conversations'], queryFn: getConversations })

export const useMessages = (conversationId: string | null) =>
  useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  })

async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .neq('sender_id', user.id)
    .eq('read', false)
  return count ?? 0
}

export const useUnreadCount = () =>
  useQuery({ queryKey: ['unread-count'], queryFn: getUnreadCount, refetchInterval: 30000 })

// ============================================================
// Notifications
// ============================================================

async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data as Notification[]) ?? []
}

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: getNotifications })

// ============================================================
// Requests & Pitches
// ============================================================

async function getOpenRequests(): Promise<Request[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Request[]) ?? []
}

async function getMyRequests(): Promise<Request[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Request[]) ?? []
}

async function getPitchesForRequest(requestId: string): Promise<Pitch[]> {
  const { data, error } = await supabase
    .from('pitches')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Pitch[]) ?? []
}

export const useOpenRequests = () =>
  useQuery({ queryKey: ['requests', 'open'], queryFn: getOpenRequests })

export const useMyRequests = () =>
  useQuery({ queryKey: ['requests', 'mine'], queryFn: getMyRequests })

export const usePitchesForRequest = (requestId: string) =>
  useQuery({
    queryKey: ['pitches', requestId],
    queryFn: () => getPitchesForRequest(requestId),
    enabled: !!requestId,
  })

// ============================================================
// Dashboard
// ============================================================

async function getDashboard(): Promise<DashboardData> {
  const { data, error } = await supabase.functions.invoke('get_dashboard')
  if (error) throw error
  return data as DashboardData
}

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })

// ============================================================
// Mutations
// ============================================================

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      body,
    }: {
      conversationId: string
      body: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: user.id, body })
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['messages', vars.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}
