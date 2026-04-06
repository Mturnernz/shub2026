// ============================================================
// SHUB NZ — TypeScript interfaces for all DB tables
// ============================================================

export interface Profile {
  id: string
  role: string[]
  active_role: 'client' | 'provider'
  display_name: string
  email: string
  phone?: string
  dob?: string
  context?: 'student' | 'backpacker' | 'extra' | 'curious'
  avatar_emoji: string
  bio?: string
  quote?: string
  suburb?: string
  pronouns?: string
  deleted_at?: string
  updated_at: string
  created_at: string
}

export interface ProviderListing {
  id: string
  provider_id: string
  headline?: string
  mood_tags?: string[]
  type: 'inperson' | 'online' | 'both'
  price_social?: number
  price_intimate?: number
  price_online_from?: number
  service_tags?: string[]
  comfort_levels?: string[]
  in_calls: boolean
  out_calls: boolean
  pre_screening: boolean
  new_clients: boolean
  available: boolean
  paused: boolean
  status: 'pending' | 'approved' | 'rejected'
  identity_verified: boolean
  health_check_declared: boolean
  health_check_date?: string
  health_check_expires_at?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  rating: number
  review_count: number
  bg_from: string
  bg_to: string
  submitted_at?: string
  approved_at?: string
  updated_at: string
  created_at: string
  // Joined fields
  profiles?: Profile
}

export interface AvailabilitySlot {
  id: string
  provider_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_type: 'available' | 'blocked'
}

export interface Conversation {
  id: string
  participant_a: string
  participant_b: string
  context_type?: 'booking' | 'request' | 'general'
  context_id?: string
  last_message_at?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  provider_id: string
  type: 'social' | 'intimate' | 'overnight'
  booking_date: string
  start_time: string
  end_time?: string
  note?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  price_agreed?: number
  checkin_prompt_sent: boolean
  provider_confirmed_safe: boolean
  client_confirmed_safe: boolean
  cancelled_by?: 'client' | 'provider'
  cancelled_at?: string
  created_at: string
}

export interface Request {
  id: string
  client_id: string
  destination: string
  type: 'weekend' | 'event' | 'extended' | 'daytrip'
  start_date: string
  end_date: string
  nights: number
  covers?: string[]
  budget_min?: number
  budget_max?: number
  budget_label?: string
  description: string
  status: 'open' | 'closed' | 'expired'
  expires_at: string
  gradient_from: string
  gradient_to: string
  emoji: string
  created_at: string
}

export interface Pitch {
  id: string
  request_id: string
  provider_id: string
  fee: number
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  created_at: string
}

export interface ProviderSubscription {
  id: string
  provider_id: string
  name: string
  emoji?: string
  price: number
  description?: string
  includes?: string[]
  is_popular: boolean
  sort_order: number
  active: boolean
  created_at: string
}

export interface ProviderContent {
  id: string
  provider_id: string
  name: string
  emoji?: string
  price: number
  unit?: 'request' | 'session'
  description?: string
  delivery_hours: number
  active: boolean
  created_at: string
}

export interface ShopItem {
  id: string
  provider_id: string
  name: string
  emoji?: string
  description?: string
  price: number
  condition?: string
  shipping_estimate?: string
  stock: number
  active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  client_id: string
  provider_subscription_id: string
  provider_id: string
  status: 'active' | 'cancelled'
  started_at: string
  cancelled_at?: string
}

export interface ContentRequest {
  id: string
  client_id: string
  provider_id: string
  content_id: string
  brief: string
  delivery: 'standard' | 'priority'
  status: 'pending' | 'delivered' | 'refunded' | 'disputed'
  price_paid: number
  created_at: string
}

export interface ShopOrder {
  id: string
  client_id: string
  provider_id: string
  item_id: string
  note?: string
  status: 'pending' | 'dispatched' | 'delivered'
  price_paid: number
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  body?: string
  created_at: string
}

export interface SavedProvider {
  client_id: string
  provider_id: string
  created_at: string
}

export interface BlockedUser {
  blocker_id: string
  blocked_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body?: string
  entity_type?: string
  entity_id?: string
  read: boolean
  created_at: string
}

export interface DisputeCase {
  id: string
  raised_by: string
  against?: string
  context_type: 'booking' | 'subscription' | 'content_request' | 'shop_order'
  context_id: string
  reason: 'no_show' | 'not_as_described' | 'payment_issue' | 'safety_concern' | 'other'
  description: string
  status: 'open' | 'under_review' | 'resolved' | 'escalated'
  resolution?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

export interface Incident {
  id: string
  reporter_id: string
  reported_id?: string
  type: 'report' | 'distress' | 'flag'
  body?: string
  urgent: boolean
  resolved: boolean
  created_at: string
}

export interface ConsentLog {
  id: string
  provider_id: string
  agreed_age: boolean
  agreed_work_rights: boolean
  agreed_terms: boolean
  ip_address?: string
  user_agent?: string
  submitted_at: string
}

export interface AuditLog {
  id: string
  actor_id?: string
  action: string
  entity_type: string
  entity_id: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface AdminUser {
  id: string
  profile_id: string
  permission_level: 'reviewer' | 'moderator' | 'superadmin'
  created_at: string
}

// ============================================================
// Query / UI types
// ============================================================

export interface ProviderFilters {
  type?: 'inperson' | 'online' | 'both'
  suburb?: string
  priceMax?: number
  mood?: string
  available?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface DashboardData {
  earnings_this_week: number
  earnings_this_month: number
  upcoming_bookings: Booking[]
  pending_requests: number
  unread_messages: number
  earnings_chart: Array<{ day: string; amount: number }>
}
