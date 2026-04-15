# Shub v2.0 — Build TODO

Based on spec v2.0 gap analysis. Phases 1–5 complete. Items below are outstanding.

---

## Phase 6 — Notifications

- [ ] Add notification bell icon to `BottomNav` with unread count badge
- [ ] Build notification tray UI (bottom sheet) — list of recent notifications, tap to navigate to context
- [ ] Wire Realtime subscription to `notifications` table on app mount
- [ ] Mark notification `read=true` when user navigates to the related entity
- [ ] Build in-app check-in banner (driven by `checkin_prompt` edge function)
- [ ] Edge function: `on_booking_confirmed` — notifies client when provider accepts, sends email
- [ ] Edge function: `on_booking_cancelled` — notifies both parties, sends email
- [ ] Edge function: `on_booking_auto_complete` — scheduled every 30 mins, sets `completed` where end_time + 1hr passed, no open dispute
- [ ] Edge function: `on_notification_created` — sends Resend email for non-suppressed notification types
- [ ] Edge function: `on_listing_status_changed` — notifies provider of approval/rejection
- [ ] Edge function: `on_request_expired` — scheduled daily, expires requests where `expires_at < now()`
- [ ] Edge function: `on_health_check_due` — scheduled daily, notifies provider 14 days before `health_check_expires_at`
- [ ] Edge function: `checkin_prompt` — scheduled every 15 mins, notifies both parties 30 mins before confirmed booking start

---

## Phase 7 — Safety, Reviews & Disputes

- [ ] Build client bookings history screen (`/my-arrangements`) — shows pending/confirmed/completed bookings with actions
- [ ] Fix Account screen: update "My arrangements" link from `/my-requests` to `/my-arrangements`
- [ ] Add "Leave a review" button on completed bookings (only when review not yet submitted)
- [ ] Build review submission flow — form writes to `reviews` table, `on_review_submitted` trigger updates rating
- [ ] Add "Something went wrong" button on bookings and orders — opens dispute form
- [ ] Build dispute case form → creates `dispute_cases` row, notifies admin
- [ ] Build distress signal UI — urgent `incidents` record, triggers admin email via `on_incident_created`
- [ ] Build block user UI in Account/profile sheet — writes to `blocked_users`
- [ ] Build report user UI — writes to `incidents` table
- [ ] Edge function: `on_incident_created` — emails admin@shub.nz, creates admin notification

---

## Architecture / Spec Compliance

- [ ] Wire `Browse` and `Discover` to use `get_providers` edge function instead of direct `provider_listings` query (spec §7.1)
- [ ] Provider card: add key differentiator tag (most distinctive item from `service_tags[]`, per spec §2.4)
- [ ] Add Google OAuth to login screen (spec §9 build phases)

---

## Phase 8 — Admin Panel

- [ ] Set up separate repo + `admin.shub.nz` subdomain
- [ ] Implement `check_admin_role` edge function JWT claims (already exists, wire to admin login)
- [ ] Build provider verification queue (approve/reject listings)
- [ ] Build dispute case management UI
- [ ] Build audit log viewer
- [ ] Build consent log viewer

---

## Phase 9 — Pre-launch

- [ ] Write T&Cs with v2.0 legal framing (platform is directory/tool, not employer — see spec §1.3)
- [ ] Write privacy policy
- [ ] Update all trust signal copy per spec §1.2 (audit for any remaining "Verified", "Health-checked", "Booking" language)
- [ ] Add `robots.txt` — disallow all
- [ ] Configure Resend domain verification + DNS
- [ ] End-to-end smoke test: dual-role flow, booking conflict test, dispute flow
