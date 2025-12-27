# HabitQuest - Project Context

## What It Is
HabitQuest is a gamified habit tracking app with a 66-day journey system. Users battle "demons" (bad habits to quit) and build "powers" (good habits to develop). The app uses RPG mechanics (XP, levels, streaks, achievements) to make habit building engaging.

## Tech Stack
- **Frontend:** React 19 + Vite
- **State:** Zustand with localStorage persistence
- **Backend:** Supabase (Auth + PostgreSQL)
- **Styling:** Inline CSS-in-JS (no external CSS framework)
- **Icons:** Lucide React
- **Effects:** Canvas Confetti

## Core Concept: The 66-Day Journey
Based on habit formation research - 66 days to form a habit. Four phases:
1. **Fragile (Days 1-22)** - Starting out, highest risk
2. **Building (Days 23-44)** - Gaining momentum
3. **Locked In (Days 45-66)** - Near the finish
4. **FORGED (Day 67+)** - Habit is permanent

## Four Archetypes (Classes)
Each has unique theme, colors, and character image:
- **SPECTER** - Shadow/stealth theme (purple #6b21a8)
- **ASCENDANT** - Light/divine theme (yellow #ca8a04)
- **WRATH** - Fire/rage theme (red #dc2626)
- **SOVEREIGN** - Royal/control theme (blue #2563eb)

## App Screens

### 1. Onboarding Flow
- `Welcome.jsx` - Intro screen
- `ProfileSetup.jsx` - Enter username
- `CommitmentQuestions.jsx` - Assess readiness
- `ArchetypeSelect.jsx` - Choose class
- `DifficultySelect.jsx` - Easy/Medium/Extreme
- `HabitCustomize.jsx` - Select habits (demons + powers)

### 2. Main App (4 tabs)
- **Command Center** (`Dashboard.jsx`) - Daily habits, submit day, side quests
- **Battle Map** (`BattleMap.jsx`) - Visual 66-day grid showing progress
- **Arsenal** (`Arsenal.jsx`) - Stats, achievements, settings, sign out
- **Records** (`Records.jsx`) - History log of all completed days

## Key Features Built

### Habit System
- Two types: **Demons** (quit) and **Powers** (build)
- Frequencies: daily, weekdays, 3x/week, 4x/week
- XP rewards per habit (10-30 XP based on difficulty)
- Streak tracking per habit
- Relapse system for demons (resets habit streak, not journey)

### Progression System
- XP accumulates across all habits
- Levels (500 XP per level)
- Ranks within each archetype (5 levels per rank)
- Streak multipliers (1.0x to 2.0x based on streak length)
- Perfect day bonus (+50 XP)

### Side Quests
- 3 random bonus tasks per day
- Rotating pool of wellness activities
- Extra XP for completion

### Achievements (9 total)
- First Blood, Week Warrior, Two Weeks, Monthly
- Locked In, FORGED, Centurion
- Perfect Week, Perfect Month

### Day Lock System
- After submitting day, habits lock until midnight
- Prevents gaming the system
- Auto-resets at midnight local time

## Database Structure (Supabase)

### `profiles` table
```sql
id (UUID, PK) - matches auth.users.id
username, archetype, difficulty
xp, level, current_streak, longest_streak
day_started, current_day
habits (JSONB) - array of habit objects
achievements (JSONB) - achievement flags
total_days_completed, perfect_days_count, total_xp_earned
commitment_answers (JSONB)
last_completed_date, day_locked_at, last_submit_date
daily_side_quests, completed_side_quests, side_quests_date
```

### `daily_logs` table
```sql
id (UUID, PK)
user_id (FK to profiles)
date (DATE) - YYYY-MM-DD
day_number, xp_earned, is_perfect
successful_count, total_count, relapse_count
habits (JSONB) - snapshot of habits that day
UNIQUE(user_id, date)
```

### Row Level Security
- Users can only read/write their own data
- Policies on both tables for SELECT, INSERT, UPDATE

## Key Files

### State Management
- `src/context/useGameStore.js` - Zustand store (all game state + actions)

### Data & Config
- `src/data/gameData.js` - Classes, habits, phases, XP constants
- `src/lib/supabase.js` - Supabase client
- `src/lib/syncService.js` - Sync functions for Supabase

### Auth
- `src/hooks/useAuth.js` - Auth hook (signIn, signUp, signOut)
- `src/components/Auth.jsx` - Login/signup UI

### Main Components
- `src/App.jsx` - Router, auth check, onboarding flow
- `src/components/Dashboard.jsx` - Main daily view
- `src/components/BattleMap.jsx` - 66-day progress grid
- `src/components/Arsenal.jsx` - Profile, stats, settings
- `src/components/Records.jsx` - History log
- `src/components/Navigation.jsx` - Bottom tab bar

### Assets
- `public/characters/` - 4 archetype images (specter.png, etc.)

## Sync Flow
1. **Login** → Load from Supabase → Update Zustand
2. **Complete Habit** → Update Zustand → Sync to Supabase
3. **Submit Day** → Update Zustand → Sync profile + daily log
4. **Logout** → Clear sync state

localStorage acts as offline cache/fallback.

## Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## Scripts
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run seed` - Seed test data (requires SUPABASE_SERVICE_KEY)

## Live URL
https://habitquest-chi.vercel.app/

## GitHub
https://github.com/iuldashev21-boop/HabitQuest
