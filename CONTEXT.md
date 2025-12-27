# HabitQuest - Project Context

> **Last Updated:** December 27, 2025
> **Status:** Production-ready, deployed on Vercel
> **Supabase:** Connected and syncing

## What It Is

HabitQuest is a gamified habit tracking app with a 66-day journey system. Users battle "demons" (bad habits to quit) and build "powers" (good habits to develop). The app uses RPG mechanics (XP, levels, streaks, achievements) to make habit building engaging.

## Current Status

### Working Features
- User authentication (signup/login/logout via Supabase)
- Complete onboarding flow (welcome → profile → commitment → archetype → difficulty → habits)
- Daily habit tracking with completion/relapse mechanics
- XP system with streak multipliers and perfect day bonuses
- 66-day Battle Map visualization with phase indicators
- Side quests (3 random daily bonus tasks)
- 9 achievements with unlock tracking
- Records page showing full day history
- Day lock system (prevents changes after submission until midnight)
- Supabase sync (profile + daily logs)
- Responsive dark theme UI

### Supabase Integration
- **Auth:** Email/password authentication working
- **Database:** Profiles and daily_logs tables with RLS
- **Sync:** Bidirectional sync between Zustand store and Supabase
- **Test Data:** Seeded successfully (TestWarrior account with 26 days of history)

### Project Structure
```
habitquest/
├── .claudeignore          # Claude Code optimization
├── .env                   # Supabase credentials (gitignored)
├── CONTEXT.md             # This file
├── package.json           # Dependencies and scripts
├── scripts/
│   └── seedTestData.js    # Test data generator
├── public/
│   └── characters/        # Archetype images (specter.png, etc.)
└── src/
    ├── App.jsx            # Main app + onboarding flow
    ├── components/        # All UI components
    ├── context/
    │   └── useGameStore.js # Zustand store (state + actions)
    ├── data/
    │   └── gameData.js    # Game constants, habits, phases
    ├── hooks/
    │   └── useAuth.js     # Auth hook
    └── lib/
        ├── supabase.js    # Supabase client
        └── syncService.js # Sync functions
```

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **State:** Zustand with localStorage persistence + Supabase sync
- **Backend:** Supabase (Auth + PostgreSQL)
- **Styling:** Inline CSS-in-JS (no framework)
- **Icons:** Lucide React
- **Effects:** Canvas Confetti
- **Hosting:** Vercel

## Core Concept: The 66-Day Journey

Based on habit formation research. Four phases:
1. **Fragile (Days 1-22)** - Starting out, highest risk
2. **Building (Days 23-44)** - Gaining momentum
3. **Locked In (Days 45-66)** - Near the finish
4. **FORGED (Day 67+)** - Habit is permanent

## Four Archetypes

| Archetype | Theme | Color | Accent |
|-----------|-------|-------|--------|
| SPECTER | Shadow/stealth | Purple | #6b21a8 |
| ASCENDANT | Light/divine | Yellow | #ca8a04 |
| WRATH | Fire/rage | Red | #dc2626 |
| SOVEREIGN | Royal/control | Blue | #2563eb |

Each has unique character image in `public/characters/`.

## App Screens

### Onboarding (6 steps)
1. `Welcome.jsx` - Intro screen
2. `ProfileSetup.jsx` - Enter username
3. `CommitmentQuestions.jsx` - Assess readiness
4. `ArchetypeSelect.jsx` - Choose class
5. `DifficultySelect.jsx` - Easy/Medium/Extreme
6. `HabitCustomize.jsx` - Select habits

### Main App (4 tabs via Navigation.jsx)
- **Command Center** (`Dashboard.jsx`) - Daily habits, submit day, side quests
- **Battle Map** (`BattleMap.jsx`) - Visual 66-day grid
- **Arsenal** (`Arsenal.jsx`) - Stats, achievements, settings, sign out
- **Records** (`Records.jsx`) - Day-by-day history log

## Key Mechanics

### Habits
- **Demons:** Bad habits to quit (can relapse)
- **Powers:** Good habits to build
- **Frequencies:** daily, weekdays, 3x/week, 4x/week
- **XP:** 10-30 per habit based on difficulty

### Progression
- 500 XP per level
- 5 levels per rank (archetype-specific rank names)
- Streak multipliers: 1.0x → 2.0x based on streak length
- Perfect day bonus: +50 XP

### Relapse System
- Only demons can relapse
- Resets HABIT streak, NOT 66-day journey
- 50% XP penalty from that habit
- +5 XP for honesty

## Database Schema (Supabase)

### `profiles` table
```
id (UUID, PK) - matches auth.users.id (FK constraint)
username, archetype, difficulty
xp, level, current_streak, longest_streak
day_started, current_day
habits (JSONB)
achievements (JSONB)
total_days_completed, perfect_days_count, total_xp_earned
commitment_answers (JSONB)
last_completed_date, day_locked_at, last_submit_date
daily_side_quests, completed_side_quests, side_quests_date
```

### `daily_logs` table
```
id (UUID, PK)
user_id (FK to profiles)
date (DATE, YYYY-MM-DD)
day_number
UNIQUE(user_id, date)
```

### Row Level Security
- Enabled on both tables
- Users can only read/write their own data

## Sync Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ localStorage│ ←→  │   Zustand   │ ←→  │  Supabase   │
│  (fallback) │     │   Store     │     │  (primary)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Sync Triggers
- **Login:** loadFromSupabase() → Update store
- **Complete Habit:** Update store → syncToSupabase()
- **Relapse:** Update store → syncToSupabase()
- **Submit Day:** Update store → syncToSupabase() + syncDailyLog()
- **Complete Side Quest:** Update store → syncToSupabase()
- **Logout:** clearSyncState()

## Environment Variables

```bash
# .env (gitignored)
VITE_SUPABASE_URL=https://kwabsvhpitwgyrcosikr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Scripts

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
npm run seed     # Seed test data (requires SUPABASE_SERVICE_KEY + USER_ID)
```

### Seed Script Usage
```bash
SUPABASE_SERVICE_KEY="sb_secret_..." USER_ID="uuid" npm run seed
```
- Requires existing auth user (FK constraint on profiles)
- Get USER_ID from Supabase Dashboard > Authentication > Users

## URLs

- **Live App:** https://habitquest-chi.vercel.app/
- **GitHub:** https://github.com/iuldashev21-boop/HabitQuest
- **Supabase:** https://supabase.com/dashboard/project/kwabsvhpitwgyrcosikr

## Test Account Data (Seeded)

- **Username:** TestWarrior
- **Archetype:** SPECTER
- **XP:** 3,411
- **Level:** 7
- **Current Streak:** 22 days
- **Daily Logs:** 26 entries

## Known Considerations

1. **localStorage vs Supabase:** On login, Supabase data takes priority. Clear localStorage if testing fresh sync.
2. **FK Constraint:** profiles.id must exist in auth.users - can't seed random user IDs
3. **Timestamps:** day_started and last_completed_date stored as ISO strings in Supabase

## File Quick Reference

| File | Purpose |
|------|---------|
| `src/context/useGameStore.js` | All state + actions (~950 lines) |
| `src/lib/syncService.js` | Supabase CRUD operations |
| `src/data/gameData.js` | Constants, habits, phases, XP values |
| `src/components/Dashboard.jsx` | Main daily view |
| `src/components/BattleMap.jsx` | 66-day grid visualization |
| `src/components/Arsenal.jsx` | Profile, achievements, settings |
| `src/App.jsx` | Auth check + onboarding flow |
