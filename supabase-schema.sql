DROP TABLE IF EXISTS daily_logs;
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  archetype TEXT,
  difficulty TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  day_started BIGINT,
  current_day INTEGER DEFAULT 1,
  habits JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '{}'::jsonb,
  total_days_completed INTEGER DEFAULT 0,
  perfect_days_count INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  commitment_answers JSONB,
  last_completed_date BIGINT,
  day_locked_at BIGINT,
  last_submit_date TEXT,
  last_celebration_date TEXT,
  daily_side_quests JSONB DEFAULT '[]'::jsonb,
  completed_side_quests JSONB DEFAULT '[]'::jsonb,
  side_quests_date TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  day_number INTEGER,
  habits JSONB DEFAULT '[]'::jsonb,
  xp_earned INTEGER DEFAULT 0,
  is_perfect BOOLEAN DEFAULT FALSE,
  successful_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  relapse_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);
