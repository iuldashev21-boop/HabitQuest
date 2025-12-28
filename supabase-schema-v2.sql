-- ============================================================================
-- HABITQUEST SCHEMA V2 - IMPROVED
-- Run this in Supabase SQL Editor to apply fixes
-- ============================================================================

-- NOTE: This script adds missing policies and indexes without dropping tables
-- Your existing data will be preserved

-- ============================================================================
-- 1. ADD MISSING DELETE POLICIES
-- ============================================================================

-- Allow users to delete their own profile (for account deletion feature)
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Allow users to delete their own logs
DROP POLICY IF EXISTS "Users can delete own logs" ON daily_logs;
CREATE POLICY "Users can delete own logs" ON daily_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 2. ADD PERFORMANCE INDEX
-- ============================================================================

-- Index for RLS policy performance on daily_logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);

-- ============================================================================
-- 3. ADD TRIGGER FOR AUTO-UPDATING updated_at
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ADD CHECK CONSTRAINTS (optional but recommended)
-- ============================================================================

-- These will fail if data violates constraints, so wrapped in DO block
DO $$
BEGIN
  -- XP should be non-negative
  ALTER TABLE profiles ADD CONSTRAINT chk_xp_non_negative CHECK (xp >= 0);
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Constraint already exists
END $$;

DO $$
BEGIN
  -- Level should be at least 1
  ALTER TABLE profiles ADD CONSTRAINT chk_level_positive CHECK (level >= 1);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  -- Streaks should be non-negative
  ALTER TABLE profiles ADD CONSTRAINT chk_streak_non_negative CHECK (current_streak >= 0);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  -- XP earned should be non-negative
  ALTER TABLE daily_logs ADD CONSTRAINT chk_xp_earned_non_negative CHECK (xp_earned >= 0);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the changes:

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'daily_logs')
ORDER BY tablename, cmd;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'daily_logs')
ORDER BY tablename;

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid IN ('profiles'::regclass, 'daily_logs'::regclass)
ORDER BY conrelid, conname;

-- Check triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';
