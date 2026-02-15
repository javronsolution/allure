-- ============================================================
-- Push Subscriptions Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
