# Shub — Product Design Audit
**Version:** Post-Phase 5 Build  
**Auditor:** Senior Product Design Review (Uber / Airbnb / OnlyFans growth lens)  
**Date:** April 2026  
**Scope:** Frontend UI, copy, UX flows, brand positioning — Series A readiness assessment

---

## Phase 0 — Product Map

### Route & Screen Inventory

| Path | Component | File | Access | Shell |
|------|-----------|------|--------|-------|
| `/` | RoleSelector | `auth/RoleSelector.tsx` | Unauthenticated | No |
| `/login` | Login | `auth/Login.tsx` | Unauthenticated | No |
| `/signup/client` | SignupClient | `auth/SignupClient.tsx` | Unauthenticated | No |
| `/signup/provider` | ProviderOnboarding | `onboarding/ProviderOnboarding.tsx` | Unauthenticated | No |
| `/reset-password` | ResetPassword | `auth/ResetPassword.tsx` | Unauthenticated | No |
| `/update-password` | UpdatePassword | `auth/UpdatePassword.tsx` | Unauthenticated | No |
| `/welcome` | EmailConfirmed | `auth/EmailConfirmed.tsx` | Unauthenticated | No |
| `/discover` | Discover | `screens/client/Discover.tsx` | Guest + Auth | Yes |
| `/browse` | Browse | `screens/client/Browse.tsx` | Guest + Auth | Yes |
| `/requests` | Requests | `screens/client/Requests.tsx` | Client (auth) | Yes |
| `/my-requests` | MyRequests | `screens/client/MyRequests.tsx` | Client (auth) | Yes |
| `/messages` | Messages | `screens/client/Messages.tsx` | Client (auth) | Yes |
| `/messages/:id` | ChatThread | `screens/client/ChatThread.tsx` | Client (auth) | Yes |
| `/account` | Account | `screens/client/Account.tsx` | Guest + Auth | Yes |
| `/bookings` | Bookings | `screens/client/Bookings.tsx` | Client (auth) | Yes |
| `/saved` | Saved | `screens/client/Saved.tsx` | Client (auth) | Yes |
| `/privacy` | Privacy | `screens/client/Privacy.tsx` | Client (auth) | Yes |
| `/dashboard` | Dashboard | `screens/provider/Dashboard.tsx` | Provider | Yes |
| `/provider/requests` | ProviderRequests | `screens/provider/Requests.tsx` | Provider | Yes |
| `/listing` | Listing | `screens/provider/Listing.tsx` | Provider | Yes |
| `/listing/online` | OnlineServices | `screens/provider/OnlineServices.tsx` | Provider | Yes |
| `/listing/availability` | Availability | `screens/provider/Availability.tsx` | Provider | Yes |
| `/earnings` | Earnings | `screens/provider/Earnings.tsx` | Provider | Yes |
| `/verification` | Verification | `screens/provider/Verification.tsx` | Provider | Yes |
| `/book/:id` | Book (3-step) | `flows/Book.tsx` | Client (auth) | No |
| `/subscribe/:id` | Subscribe | `flows/Subscribe.tsx` | Client (auth) | No |
| `/shop/:id` | Shop | `flows/Shop.tsx` | Client (auth) | No |
| `/content-request/:id` | ContentRequest | `flows/ContentRequest.tsx` | Client (auth) | No |
| `/post-request` | PostRequest (3-step) | `flows/PostRequest.tsx` | Client (auth) | No |

**Routes with no path from client bottom nav:** `/requests`, `/my-requests` — accessible only from Discover's scrollable content and Account links.

**Routes missing for a premium marketplace:** `/booking/:id` (booking detail/confirmation), `/review/:bookingId` (review submission), `/provider/:id` (public profile page without sheet).

---

### User Journey Maps

#### 1. Unauthenticated Visitor → Decides to Sign Up (Client)
1. `/` — RoleSelector: "How are you joining?" — `RoleSelector.tsx`
2. Taps "I'm looking" → `/signup/client` — `SignupClient.tsx`
3. Enters display name / email / password → toast "Check your email" → `/login`
4. Confirms email → `/welcome` — `EmailConfirmed.tsx`
5. Taps "Start browsing" → `/discover` — `Discover.tsx`

**Assessment:** Meets Uber 90-second threshold. Zero personalisation collected.

#### 2. New Client → First Booking
1. `/discover` → featured companions carousel
2. Taps provider card → `CompanionProfileSheet` (About tab)
3. Taps "Connect →" → `ConnectSheet` (second sheet)
4. Taps "In-person arrangement" → `/book/:id`
5. Selects type (Step 0) → date/time (Step 1) → reviews & submits (Step 2)
6. **Toast: "Arrangement requested — you'll hear back soon." Toast disappears. No confirmation screen. Funnel ends.**

**Critical gap:** The conversion funnel ends with a 3-second notification.

#### 3. New Provider → First Booking Received
1. `/` → "I'm a companion" → `/signup/provider` (7 steps)
2. Completes onboarding → Step 7 Done → `/dashboard`
3. Dashboard shows pending approval callout. Waits for admin.
4. Client makes booking → pending enquiry appears on dashboard.
5. **Provider has no accept/decline button anywhere in the UI.**

**Critical gap:** The marketplace loop is broken — bookings sit in `pending` permanently.

#### 4. Returning Client
1. App opens → session restored → `/discover`
2. No "pick up where you left off" state — no pending booking surfaced, no unread message count on load, no unanswered pitches.

#### 5. Returning Provider
1. App opens → `/dashboard`
2. Stats, chart, upcoming list, pending enquiries visible.
3. Quick actions: Edit listing / Availability / Online services / Earnings.
4. **No action possible on pending enquiries from this screen.**

---

### Component Inventory

**Primitives** (`components/primitives/`): `Btn` (6 variants), `Sheet`, `Toast`, `Chip` (accent variant), `Tag`, `Stars`, `Toggle`, `ProgressBar`, `StepLabel`, `Callout` (5 variants: sage/gold/lavender/ink/primary), `OBInput`, `OBTextarea`, `OBToggle`, `FieldLabel`

**Cards:** `ProviderCard`, `RequestCard`

**Sheets:** `CompanionProfileSheet` (tabbed: About / Assurance), `ConnectSheet`, `ExpressInterestSheet`

**Layout:** `AppShell`, `BottomNav` (role-aware, 4 tabs each), `ProtectedRoute`, `Wordmark`

**Charts:** `EarningsBarChart` (Recharts)

**Design system:** Custom. No third-party component library. Token-based via CSS custom properties.

---

### Design Token Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FAF6F2` | Page background |
| `--card` | `#FFFFFF` | Card surfaces |
| `--border` | `#EAD8CC` | All borders |
| `--ink` | `#1C1410` | Primary text |
| `--muted` | `#8C7060` | Secondary text |
| `--primary` | `#A8334C` | CTAs, rose accent |
| `--gold` | `#C8960A` | Warnings, earnings |
| `--sage` | `#5A8070` | Verified, positive |
| `--font-display` | Cormorant Garamond | All headings |
| `--font-body` | DM Sans | All body text |

---

## Phase 1 — Audit

---

### Section 1: Visual Hierarchy & Polish

**Rating: 🔴 Needs Work**

#### 1.1 — Emoji avatars are the single biggest premium signal failure
**Files:** `ProviderCard.tsx`, `CompanionProfileSheet.tsx`, `Book.tsx`  
**Issue:** Every provider is represented by a flower, moon, or star emoji across every touchpoint. Airbnb's most consequential design decision was mandatory host photos. A client considering spending time with a companion is looking at 🌸.  
**Fix:** Implement Supabase Storage file upload for provider photos. Short-term interim: initials avatar using the provider's `bg_from`/`bg_to` gradient — a 2-letter monogram that is personal, premium, and buildable in one day.  
**Priority: P1**

#### 1.2 — Wordmark is styled as a watermark
**File:** `RoleSelector.module.css` (`.wordmark { opacity: 0.65 }`)  
**Issue:** On the only screen where the brand appears in isolation, "shub" renders at 65% opacity, pointer-events none. It whispers from the corner.  
**Fix:** Full opacity, 3rem, centred in the hero zone before the sheet rises.  
**Priority: P2**

#### 1.3 — Discover has no editorial hierarchy
**File:** `Discover.tsx`  
**Issue:** "Featured companions" is the first 6 results of an unfiltered query. No curation, no intent-based labelling. Looks like an unsorted index.  
**Fix:** Label sections by intent: "Available this weekend", "Highly rated in Auckland", "New on shub". Same data, human framing.  
**Priority: P2**

#### 1.4 — ConnectSheet path cards have equal visual weight
**File:** `ConnectSheet.tsx`  
**Issue:** In-person, Online, Shop are presented identically. For most transactions, in-person is the primary action. Equal-weight presentation forces unnecessary decision-making.  
**Fix:** Elevate "In-person arrangement" as the primary card. Render Online/Shop as secondary options below.  
**Priority: P2**

#### 1.5 — Spacing is not tokenised
**Issue:** All CSS modules use hardcoded `px` values. Drift accumulates.  
**Fix:** Define `--space-1` through `--space-16` (4px base) in `index.css`.  
**Priority: P3**

---

### Section 2: Copy & Tone

**Rating: 🔴 Needs Work**

#### 2.1 — Landing headline is an administrative question
**File:** `RoleSelector.tsx`  
**Current:** `"How are you joining?"`  
**Issue:** A form label as a brand statement. Compare: Airbnb "Belong Anywhere", Uber "Get there".  
**Fix:** `"Extraordinary company, on your terms."` Then role cards as the action mechanism.  
**Priority: P1**

#### 2.2 — Role card copy is job-ad language
**File:** `RoleSelector.tsx`  
**Current:** `"I'm looking" / "Browse independent companions across New Zealand"`  
**Fix:**
- Client: `"Find a companion"` / `"Discover trusted companions across New Zealand"`
- Provider: `"List as a companion"` / `"Set your own rates and hours. Keep everything you earn."`  
**Priority: P1**

#### 2.3 — Signup callout leads with legal anxiety at conversion point
**File:** `SignupClient.tsx`  
**Current:** `"By signing up you agree to our privacy-first approach. We never share your data."`  
**Issue:** Data reassurance at the moment of signup creates friction and signals doubt.  
**Fix:** Remove the callout entirely, or replace with: `"Join thousands of New Zealanders finding extraordinary company."`  
**Priority: P1**

#### 2.4 — Empty state "No companions listed yet — check back soon" is conversion death
**File:** `Discover.tsx`  
**Issue:** "Check back soon" tells a user the product isn't ready. Fatal in early days and in any investor demo.  
**Fix:** `"Auckland's companions are joining now. Be among the first clients when we launch."` with email capture CTA.  
**Priority: P1**

#### 2.5 — Post-booking toast undersells the moment
**File:** `Book.tsx`  
**Current:** `"Arrangement requested — you'll hear back soon."` (disappears in 3 seconds)  
**Fix:** Replace with a dedicated confirmation screen (see Section 6.1).  
**Priority: P1**

#### 2.6 — Provider onboarding done-state is anticlimactic
**File:** `Step7Done.tsx`  
**Current:** `"Your listing is under review. We'll email you within 24 hours."`  
**Fix:** `"Welcome to shub, {name}. You're officially part of New Zealand's most trusted companion network."` with three action cards.  
**Priority: P2**

#### 2.7 — ConnectSheet heading is cold
**File:** `ConnectSheet.tsx`  
**Current:** `"How would you like to connect?"`  
**Fix:** `"Connect with {name}"` or no heading — the options are self-explanatory.  
**Priority: P2**

#### 2.8 — "Assurance" tab label is jargon
**File:** `CompanionProfileSheet.tsx`  
**Fix:** Rename to `"Trust & Safety"` or `"Verified"`.  
**Priority: P2**

---

### Section 3: Onboarding Flow

#### Client Onboarding
**Rating: 🟡 Acceptable**

3 fields, email confirmation, done. Meets Uber 90-second threshold. Zero personalisation collected (no suburb, no preferences). No post-confirmation orientation screen beyond "Start browsing."

**Fix for orientation:** Turn `/welcome` into a 3-card explainer: "Discover companions", "Request an arrangement", "Post a request". One screen, no form, then CTA. **Priority: P2**

#### Provider Onboarding
**Rating: 🟡 Acceptable**

Step 0's earnings calculator leading with "0% platform fee" is excellent — anchors economic value before asking for commitment.

#### 3.1 — Comfort level selection is the highest drop-off risk
**File:** `Step3Comfort.tsx`  
**Issue:** Step 3 of 7 asks providers to tick boxes labelled "Full intimacy services" before they've finished setup and before they trust the platform.  
**Fix:** Move Step 3 (Comfort) to after Step 4 (Pricing). Let providers set rates first — establishes intent before sensitive questions.  
**Priority: P2**

#### 3.2 — "Upload photo ID" button is non-functional
**File:** `Step5Safety.tsx`, `Verification.tsx`  
**Issue:** The button renders and does nothing. A broken promise in the middle of onboarding.  
**Fix:** Implement Supabase Storage upload, or remove the button and replace with: "You can add your ID after your listing is live — it unlocks the verified badge."  
**Priority: P1**

#### 3.3 — No draft/resume capability
**Issue:** 7-step flow with no save state. Drop-off at step 4 = restart from zero.  
**Fix:** Persist `OnboardingData` to `localStorage` on every step change. Offer resume on mount.  
**Priority: P2**

---

### Section 4: Trust & Safety Signals

**Rating: 🟡 Acceptable (signals exist, are buried)**

#### 4.1 — No provider accept/decline action in the UI *(Critical)*
**Files:** `Dashboard.tsx`, `Bookings.tsx`  
**Issue:** Bookings go to `pending` and stay there. Neither party can advance the transaction. The marketplace loop is broken.  
**Fix:** Add Accept/Decline buttons to the pending enquiry card on `Dashboard.tsx`. On accept: status → confirmed, conversation created, notification fires.  
**Priority: P1** — this is the highest-priority issue in the codebase.

#### 4.2 — Trust badges are present but not self-explaining
**File:** `ProviderCard.tsx`  
**Issue:** "identity confirmed" and "health check declared" render as tiny lowercase chips. No explanation on tap.  
**Fix:** Tooltip on badge tap: "shub holds a copy of this companion's identity document."  
**Priority: P2**

#### 4.3 — No response rate or response time signal
**Issue:** Sensitive bookings require reliability signals. No equivalent to Airbnb's "Responds within an hour."  
**Fix:** Track `last_active_at` on profile, surface "Typically responds within X" on `CompanionProfileSheet`.  
**Priority: P2**

#### 4.4 — New providers show nothing where a rating would be
**Issue:** 0-review providers show an absent star rating — looks unproven, not new.  
**Fix:** Show "New on shub" badge for providers with `review_count = 0`.  
**Priority: P2**

---

### Section 5: Search & Discovery

**Rating: 🟡 Acceptable**

#### 5.1 — Two discovery surfaces create navigation confusion
**Files:** `BottomNav.tsx`, `Discover.tsx`, `Browse.tsx`  
**Issue:** `/discover` and `/browse` are both bottom nav tabs with no communicated distinction. Users bounce between them.  
**Fix:** Merge into one surface. Empty search bar = curated feed. Search active = filtered grid. Standard pattern (Instagram, Airbnb, TikTok).  
**Priority: P2**

#### 5.2 — Requests board is not in the client bottom nav
**File:** `BottomNav.tsx`  
**Issue:** `/requests` and `/my-requests` have no primary navigation path. The requests board — a core differentiating mechanic — is buried in Discover's scroll.  
**Fix:** Dedicate a bottom nav tab to Requests (replace Browse tab once merged with Discover).  
**Priority: P2**

#### 5.3 — Browse has no suburb filter and no sort
**File:** `Browse.tsx`  
**Issue:** Most contextually relevant filter (location) is absent. No sort options (rating, price, newest) despite the data model supporting all of them.  
**Fix:** Add suburb chip row, add sort dropdown.  
**Priority: P2**

#### 5.4 — Featured companions carousel has no curation logic
**File:** `Discover.tsx`  
**Issue:** Shows first 6 results of an unfiltered query.  
**Fix:** Sort by `rating DESC, review_count DESC`. Add a "New on shub" row sorted by `created_at DESC`.  
**Priority: P2**

---

### Section 6: Booking / Conversion Flow

**Rating: 🔴 Needs Work**

#### 6.1 — No post-booking confirmation screen *(Critical)*
**File:** `Book.tsx`  
**Issue:** After a 3-step booking wizard, the user gets a toast that disappears in 3 seconds. No booking reference, no "what happens next", no path to message the provider, no path to the pending booking.  
**Fix:** After `bookings.insert()`, navigate to `/booking-confirmed/:id`. Show: provider info, booking summary, "What happens next" 3-step timeline (they review → you get notified → message while you wait), "Message {name}" CTA.  
**Priority: P1**

#### 6.2 — Providers cannot accept or decline bookings
*(Repeated from 4.1 — highest priority in the codebase)*  
**Priority: P1**

#### 6.3 — Date picker does not surface available days
**File:** `Book.tsx` Step 1  
**Issue:** Clients can select unavailable days. The edge function rejects at Step 2, after the user has invested time.  
**Fix:** Load provider's `availability_slots` before Step 1. Disable days of the week not in schedule.  
**Priority: P2**

#### 6.4 — No price total in booking review
**File:** `Book.tsx` Step 2  
**Issue:** Review step shows "from $X / hr" with no estimated total.  
**Fix:** Collect duration in Step 1. Show "Estimated: $400–$600 NZD for 2–3 hours. Final price confirmed by the companion."  
**Priority: P2**

---

### Section 7: Post-Booking Experience

**Rating: 🔴 Needs Work**

#### 7.1 — Bookings screen has no actions
**File:** `Bookings.tsx`  
**Issue:** An inert list. No actions on any booking status.  
**Fix:** Per status — pending: "Message · Cancel request" | confirmed: "Message · I'm safe" | completed: "Leave a review · Rebook" | cancelled: "Find someone similar"  
**Priority: P1**

#### 7.2 — Review submission UI does not exist
**Issue:** `reviews` table, rating trigger, and `on_review_submitted` edge function all exist. No UI to submit a review anywhere in the app. Every completed booking is a lost trust signal.  
**Fix:** "Leave a review" button on completed booking cards → bottom sheet with 5-star rating + optional text + submit.  
**Priority: P1**

#### 7.3 — No cancellation UI
**Issue:** DB supports cancellation. UI does not.  
**Fix:** "Cancel request" on pending bookings → confirmation sheet → update status, fire `on_booking_cancelled`.  
**Priority: P2**

#### 7.4 — Safety check-in system has no UI
**Issue:** `checkin_prompt` edge function defined in spec. Not built. For a safety-positioned platform, the absence of the signature safety feature is notable.  
**Fix:** Dismissible `AppShell` banner when a confirmed booking is within 2 hours: "Your arrangement starts soon. Tap to confirm you're safe."  
**Priority: P2**

---

## Top 5 P1 Actions

These five changes most close the gap to Airbnb/Uber standard. Everything else is noise until these are shipped.

---

### P1.1 — Build the provider accept/decline flow
**Files:** `screens/provider/Dashboard.tsx`  
**The gap:** Bookings go to `pending` permanently. The marketplace loop is broken — no transaction can complete.  
**The fix:** Accept/Decline buttons on the pending enquiry card. Accept: status → confirmed, conversation created, `on_booking_confirmed` fires. Decline: status → cancelled, `on_booking_cancelled` fires.

---

### P1.2 — Build the post-booking confirmation screen
**Files to create:** `screens/client/BookingConfirmed.tsx`  
**File to change:** `flows/Book.tsx` — replace `showToast(...)` + `navigate(-1)` with `navigate('/booking-confirmed/${bookingId}')`  
**The gap:** The booking funnel ends in a toast.  
**The fix:** Provider info, booking summary, 3-step "what happens next" explainer, "Message {name}" CTA.

---

### P1.3 — Replace landing headline and role card copy
**File:** `auth/RoleSelector.tsx`  
**The gap:** "How are you joining?" is a form label, not a brand statement.  
**The fix:**
- Headline: `"Extraordinary company, on your terms."`
- Client card: `"Find a companion"` / `"Discover trusted companions across New Zealand"`
- Provider card: `"List as a companion"` / `"Set your own rates and hours. Keep everything you earn."`
- Remove callout from `auth/SignupClient.tsx`

---

### P1.4 — Build the review submission flow
**Files to change:** `screens/client/Bookings.tsx` — add "Leave a review" to completed cards  
**Files to create:** Review sheet component  
**The gap:** Every completed booking is a lost trust signal. Reviews are the primary marketplace trust mechanism.  
**The fix:** Bottom sheet on completed booking cards. 5-star rating + optional text + submit. DB trigger handles rating update.

---

### P1.5 — Solve the cold-start empty state on Discover
**File:** `screens/client/Discover.tsx`  
**The gap:** "No companions listed yet — check back soon." converts zero early users.  
**The fix:**
```
"Auckland's companions are joining now."
"Be among the first clients when we open fully."
[Enter your email] → [Notify me]
```
Writes to a `waitlist` table. Converts every early visitor into a retargetable lead.

---

*End of audit. The design system is coherent, the legal/safety framework is thoughtful, and the core flows are architected correctly. The gaps are execution gaps — missing confirmation screens, unwired actions, and copy that describes the UI instead of selling the experience. None of this requires a redesign.*
