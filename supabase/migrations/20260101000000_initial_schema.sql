-- ============================================================
-- SHUB NZ — Initial Schema
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role            text[] NOT NULL DEFAULT '{client}',
  active_role     text NOT NULL DEFAULT 'client',
  display_name    text NOT NULL,
  email           text NOT NULL,
  phone           text,
  dob             date,
  context         text CHECK (context IN ('student','backpacker','extra','curious')),
  avatar_emoji    text DEFAULT '🌸',
  bio             text,
  quote           text,
  suburb          text,
  pronouns        text,
  deleted_at      timestamptz,
  updated_at      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own row" ON profiles FOR ALL USING (auth.uid() = id);

-- ── provider_listings ────────────────────────────────────────
CREATE TABLE provider_listings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id             uuid NOT NULL UNIQUE REFERENCES profiles,
  headline                text,
  mood_tags               text[],
  type                    text NOT NULL CHECK (type IN ('inperson','online','both')),
  price_social            integer,
  price_intimate          integer,
  price_online_from       integer,
  service_tags            text[],
  comfort_levels          text[],
  in_calls                boolean DEFAULT true,
  out_calls               boolean DEFAULT false,
  pre_screening           boolean DEFAULT true,
  new_clients             boolean DEFAULT true,
  available               boolean DEFAULT true,
  paused                  boolean DEFAULT false,
  status                  text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  identity_verified       boolean DEFAULT false,
  health_check_declared   boolean DEFAULT false,
  health_check_date       date,
  health_check_expires_at date GENERATED ALWAYS AS (health_check_date + INTERVAL '90 days') STORED,
  emergency_contact_name  text,
  emergency_contact_phone text,
  rating                  numeric(3,2) DEFAULT 0,
  review_count            integer DEFAULT 0,
  bg_from                 text DEFAULT '#F5D8E0',
  bg_to                   text DEFAULT '#ECC8D0',
  submitted_at            timestamptz,
  approved_at             timestamptz,
  updated_at              timestamptz DEFAULT now(),
  created_at              timestamptz DEFAULT now()
);

ALTER TABLE provider_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public approved listings" ON provider_listings
  FOR SELECT USING (status = 'approved' AND paused = false);
CREATE POLICY "own listing" ON provider_listings
  FOR ALL USING (auth.uid() = provider_id);

CREATE INDEX ON provider_listings (status, paused, type);
CREATE INDEX ON provider_listings (rating DESC);

-- ── availability_slots ───────────────────────────────────────
CREATE TABLE availability_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   uuid NOT NULL REFERENCES profiles,
  day_of_week   smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  slot_type     text DEFAULT 'available' CHECK (slot_type IN ('available','blocked')),
  UNIQUE (provider_id, day_of_week, start_time)
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON availability_slots FOR SELECT USING (true);
CREATE POLICY "own slots" ON availability_slots
  FOR ALL USING (auth.uid() = provider_id);

-- ── conversations ────────────────────────────────────────────
CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a   uuid NOT NULL REFERENCES profiles,
  participant_b   uuid NOT NULL REFERENCES profiles,
  context_type    text CHECK (context_type IN ('booking','request','general')),
  context_id      uuid,
  last_message_at timestamptz,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (participant_a, participant_b, context_type, context_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants only" ON conversations
  FOR ALL USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- ── messages ─────────────────────────────────────────────────
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles,
  body            text NOT NULL,
  read            boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversation participants" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant_a = auth.uid() OR participant_b = auth.uid()))
  );
CREATE POLICY "sender insert" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "recipient read update" ON messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant_a = auth.uid() OR participant_b = auth.uid()))
  );

CREATE INDEX ON messages (conversation_id, created_at);

-- ── bookings ─────────────────────────────────────────────────
CREATE TABLE bookings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                uuid NOT NULL REFERENCES profiles,
  provider_id              uuid NOT NULL REFERENCES profiles,
  type                     text NOT NULL CHECK (type IN ('social','intimate','overnight')),
  booking_date             date NOT NULL,
  start_time               time NOT NULL,
  end_time                 time,
  note                     text,
  status                   text DEFAULT 'pending'
                             CHECK (status IN ('pending','confirmed','completed','cancelled')),
  price_agreed             integer,
  checkin_prompt_sent      boolean DEFAULT false,
  provider_confirmed_safe  boolean DEFAULT false,
  client_confirmed_safe    boolean DEFAULT false,
  cancelled_by             text CHECK (cancelled_by IN ('client','provider')),
  cancelled_at             timestamptz,
  created_at               timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking parties" ON bookings
  FOR ALL USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE INDEX ON bookings (provider_id, booking_date, status);

-- ── requests ─────────────────────────────────────────────────
CREATE TABLE requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles,
  destination     text NOT NULL,
  type            text NOT NULL CHECK (type IN ('weekend','event','extended','daytrip')),
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  nights          integer GENERATED ALWAYS AS (end_date - start_date) STORED,
  covers          text[],
  budget_min      integer,
  budget_max      integer,
  budget_label    text,
  description     text NOT NULL,
  status          text DEFAULT 'open' CHECK (status IN ('open','closed','expired')),
  expires_at      timestamptz DEFAULT now() + INTERVAL '30 days',
  gradient_from   text DEFAULT '#C8E0F5',
  gradient_to     text DEFAULT '#A8C8E8',
  emoji           text DEFAULT '🧳',
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public open requests" ON requests
  FOR SELECT USING (status = 'open' AND expires_at > now());
CREATE POLICY "own requests" ON requests
  FOR ALL USING (auth.uid() = client_id);

CREATE INDEX ON requests (status, expires_at);

-- ── pitches ──────────────────────────────────────────────────
CREATE TABLE pitches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  uuid NOT NULL REFERENCES requests ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles,
  fee         integer NOT NULL,
  message     text NOT NULL,
  status      text DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','declined','withdrawn')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pitches" ON pitches
  FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "request owner sees pitches" ON pitches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid())
  );

-- ── provider_subscriptions ───────────────────────────────────
CREATE TABLE provider_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles,
  name        text NOT NULL,
  emoji       text,
  price       integer NOT NULL,
  description text,
  includes    text[],
  is_popular  boolean DEFAULT false,
  sort_order  integer DEFAULT 0,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE provider_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public active" ON provider_subscriptions
  FOR SELECT USING (active = true);
CREATE POLICY "own" ON provider_subscriptions
  FOR ALL USING (auth.uid() = provider_id);

-- ── provider_content ─────────────────────────────────────────
CREATE TABLE provider_content (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id    uuid NOT NULL REFERENCES profiles,
  name           text NOT NULL,
  emoji          text,
  price          integer NOT NULL,
  unit           text CHECK (unit IN ('request','session')),
  description    text,
  delivery_hours integer DEFAULT 48,
  active         boolean DEFAULT true,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE provider_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public active content" ON provider_content
  FOR SELECT USING (active = true);
CREATE POLICY "own content" ON provider_content
  FOR ALL USING (auth.uid() = provider_id);

-- ── shop_items ───────────────────────────────────────────────
CREATE TABLE shop_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id       uuid NOT NULL REFERENCES profiles,
  name              text NOT NULL,
  emoji             text,
  description       text,
  price             integer NOT NULL,
  condition         text,
  shipping_estimate text,
  stock             integer DEFAULT 1,
  active            boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public active shop" ON shop_items
  FOR SELECT USING (active = true);
CREATE POLICY "own shop" ON shop_items
  FOR ALL USING (auth.uid() = provider_id);

-- ── subscriptions (client → provider) ───────────────────────
CREATE TABLE subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                uuid NOT NULL REFERENCES profiles,
  provider_subscription_id uuid NOT NULL REFERENCES provider_subscriptions,
  provider_id              uuid NOT NULL REFERENCES profiles,
  status                   text DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  started_at               timestamptz DEFAULT now(),
  cancelled_at             timestamptz
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- ── content_requests ─────────────────────────────────────────
CREATE TABLE content_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES profiles,
  provider_id uuid NOT NULL REFERENCES profiles,
  content_id  uuid NOT NULL REFERENCES provider_content,
  brief       text NOT NULL,
  delivery    text DEFAULT 'standard' CHECK (delivery IN ('standard','priority')),
  status      text DEFAULT 'pending'
                CHECK (status IN ('pending','delivered','refunded','disputed')),
  price_paid  integer NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own content requests" ON content_requests
  FOR ALL USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- ── shop_orders ──────────────────────────────────────────────
CREATE TABLE shop_orders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES profiles,
  provider_id uuid NOT NULL REFERENCES profiles,
  item_id     uuid NOT NULL REFERENCES shop_items,
  note        text,
  status      text DEFAULT 'pending'
                CHECK (status IN ('pending','dispatched','delivered')),
  price_paid  integer NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shop orders" ON shop_orders
  FOR ALL USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- ── reviews ──────────────────────────────────────────────────
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES bookings,
  reviewer_id uuid NOT NULL REFERENCES profiles,
  reviewee_id uuid NOT NULL REFERENCES profiles,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (booking_id, reviewer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "booking participant" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id
      AND (client_id = auth.uid() OR provider_id = auth.uid())
      AND status = 'completed'));

-- ── saved_providers ──────────────────────────────────────────
CREATE TABLE saved_providers (
  client_id   uuid NOT NULL REFERENCES profiles,
  provider_id uuid NOT NULL REFERENCES profiles,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (client_id, provider_id)
);

ALTER TABLE saved_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved" ON saved_providers FOR ALL USING (auth.uid() = client_id);

-- ── blocked_users ────────────────────────────────────────────
CREATE TABLE blocked_users (
  blocker_id uuid NOT NULL REFERENCES profiles,
  blocked_id uuid NOT NULL REFERENCES profiles,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own blocked" ON blocked_users FOR ALL USING (auth.uid() = blocker_id);

-- ── notifications ────────────────────────────────────────────
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles,
  type        text NOT NULL,
  title       text NOT NULL,
  body        text,
  entity_type text,
  entity_id   uuid,
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX ON notifications (user_id, read);

-- ── dispute_cases ────────────────────────────────────────────
CREATE TABLE dispute_cases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raised_by    uuid NOT NULL REFERENCES profiles,
  against      uuid REFERENCES profiles,
  context_type text NOT NULL
                 CHECK (context_type IN ('booking','subscription','content_request','shop_order')),
  context_id   uuid NOT NULL,
  reason       text NOT NULL
                 CHECK (reason IN ('no_show','not_as_described','payment_issue','safety_concern','other')),
  description  text NOT NULL,
  status       text DEFAULT 'open'
                 CHECK (status IN ('open','under_review','resolved','escalated')),
  resolution   text,
  resolved_by  uuid REFERENCES profiles,
  resolved_at  timestamptz,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE dispute_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own disputes" ON dispute_cases
  FOR SELECT USING (auth.uid() = raised_by OR auth.uid() = against);
CREATE POLICY "create dispute" ON dispute_cases
  FOR INSERT WITH CHECK (auth.uid() = raised_by);

-- ── incidents ────────────────────────────────────────────────
CREATE TABLE incidents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles,
  reported_id uuid REFERENCES profiles,
  type        text NOT NULL CHECK (type IN ('report','distress','flag')),
  body        text,
  urgent      boolean DEFAULT false,
  resolved    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "create incident" ON incidents
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ── consent_log (edge function only — no user policies) ──────
CREATE TABLE consent_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id       uuid NOT NULL REFERENCES profiles,
  agreed_age        boolean NOT NULL,
  agreed_work_rights boolean NOT NULL,
  agreed_terms      boolean NOT NULL,
  ip_address        text,
  user_agent        text,
  submitted_at      timestamptz DEFAULT now()
);

ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
-- No user-level policies — written only by edge functions via service key

-- ── audit_log (edge function / triggers only) ────────────────
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES profiles,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- No user-level policies — written only by audit triggers

-- ── admin_users ──────────────────────────────────────────────
CREATE TABLE admin_users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid NOT NULL UNIQUE REFERENCES profiles,
  permission_level text DEFAULT 'reviewer'
                     CHECK (permission_level IN ('reviewer','moderator','superadmin')),
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No user-level policies — managed via service key only

-- ── Required indexes ─────────────────────────────────────────
CREATE INDEX ON provider_listings (status, paused, type);

-- ── Full-text search vector ──────────────────────────────────
-- Note: The generated column references profiles via a subquery.
-- This is handled in a separate migration after the table is created
-- to avoid circular dependency issues with the generated column syntax.
-- For now, we add a simple tsvector column that is updated via trigger.

ALTER TABLE provider_listings
  ADD COLUMN search_vector tsvector;

CREATE INDEX ON provider_listings USING GIN (search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS trigger AS $$
DECLARE
  v_display_name text;
  v_suburb text;
BEGIN
  SELECT display_name, suburb INTO v_display_name, v_suburb
  FROM profiles WHERE id = NEW.provider_id;

  NEW.search_vector := to_tsvector('english',
    COALESCE(v_display_name, '') || ' ' ||
    COALESCE(v_suburb, '') || ' ' ||
    COALESCE(array_to_string(NEW.service_tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.mood_tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_listing_search
  BEFORE INSERT OR UPDATE ON provider_listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- ── Audit trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    auth.uid(), TG_OP, TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_provider_listings
  AFTER INSERT OR UPDATE OR DELETE ON provider_listings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_bookings
  AFTER UPDATE ON bookings
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION audit_trigger();

-- ── on_review_submitted: update listing rating ───────────────
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE provider_listings
  SET
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE provider_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_submitted
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_listing_rating();
