/**
 * HabitQuest Test Data Seeder
 *
 * IMPORTANT: The profiles table has a foreign key to auth.users.
 * This script creates test data for YOUR existing account only.
 *
 * SETUP:
 * 1. Sign up for a HabitQuest account first
 * 2. Go to Supabase Dashboard > Settings > API
 * 3. Copy your "service_role" key (NOT the anon key)
 * 4. Run with your user ID:
 *
 *    SUPABASE_SERVICE_KEY="your-key" USER_ID="your-user-id" node scripts/seedTestData.js
 *
 * To find your user ID:
 *    - Supabase Dashboard > Authentication > Users > click your user > copy ID
 *
 * WARNING: This will OVERWRITE your existing progress!
 */

import { createClient } from '@supabase/supabase-js';

// ============ CONFIGURATION ============

const SUPABASE_URL = 'https://kwabsvhpitwgyrcosikr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const USER_ID = process.env.USER_ID;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('  SUPABASE_SERVICE_KEY="key" USER_ID="uuid" node scripts/seedTestData.js');
  process.exit(1);
}

if (!USER_ID) {
  console.error('ERROR: USER_ID environment variable is required');
  console.log('\nTo find your user ID:');
  console.log('  Supabase Dashboard > Authentication > Users > click user > copy ID');
  console.log('\nUsage:');
  console.log('  SUPABASE_SERVICE_KEY="key" USER_ID="uuid" node scripts/seedTestData.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============ TEST DATA TEMPLATES ============

const ARCHETYPES = ['SPECTER', 'ASCENDANT', 'WRATH', 'SOVEREIGN'];
const DIFFICULTIES = ['easy', 'medium', 'extreme'];

const HABIT_TEMPLATES = {
  SPECTER: {
    demons: [
      { name: 'No PMO', xp: 30 },
      { name: 'No Social Media Scrolling', xp: 20 },
      { name: 'No Late Night Phone', xp: 15 }
    ],
    powers: [
      { name: 'Meditation', xp: 25 },
      { name: 'Cold Shower', xp: 20 },
      { name: 'Read 20 Pages', xp: 15 }
    ]
  },
  ASCENDANT: {
    demons: [
      { name: 'No Porn', xp: 30 },
      { name: 'No Smoking', xp: 25 },
      { name: 'No Procrastination', xp: 15 }
    ],
    powers: [
      { name: 'Workout', xp: 25 },
      { name: 'Healthy Breakfast', xp: 15 },
      { name: 'Study 1 Hour', xp: 20 }
    ]
  },
  WRATH: {
    demons: [
      { name: 'No Gaming Addiction', xp: 25 },
      { name: 'No Energy Drinks', xp: 15 },
      { name: 'No Negative Self-Talk', xp: 20 }
    ],
    powers: [
      { name: 'Morning Run', xp: 25 },
      { name: 'Drink 2L Water', xp: 15 },
      { name: 'Learn New Skill', xp: 20 }
    ]
  },
  SOVEREIGN: {
    demons: [
      { name: 'No Wasted Time', xp: 20 },
      { name: 'No Excuses', xp: 20 },
      { name: 'No Sleeping In', xp: 15 }
    ],
    powers: [
      { name: 'Wake at 5 AM', xp: 25 },
      { name: 'Deep Work 2 Hours', xp: 25 },
      { name: 'Review Goals', xp: 15 }
    ]
  }
};

// ============ HELPER FUNCTIONS ============

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = () => Math.random();

const generateUUID = () => crypto.randomUUID();

const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const generateHabits = (archetype) => {
  const templates = HABIT_TEMPLATES[archetype];
  const habits = [];
  const now = Date.now();

  // Add all demons
  templates.demons.forEach(template => {
    habits.push({
      id: generateUUID(),
      name: template.name,
      type: 'demon',
      xp: template.xp,
      frequency: 'daily',
      completed: false,
      relapsedToday: false,
      completedDates: [],
      streak: randomInt(5, 25),
      longestStreak: randomInt(10, 35),
      relapses: randomInt(0, 5),
      dayStarted: now - (30 * 24 * 60 * 60 * 1000),
      weekStreak: 0
    });
  });

  // Add all powers
  templates.powers.forEach(template => {
    habits.push({
      id: generateUUID(),
      name: template.name,
      type: 'power',
      xp: template.xp,
      frequency: 'daily',
      completed: false,
      relapsedToday: false,
      completedDates: [],
      streak: randomInt(5, 30),
      longestStreak: randomInt(10, 40),
      relapses: 0,
      dayStarted: now - (30 * 24 * 60 * 60 * 1000),
      weekStreak: 0
    });
  });

  return habits;
};

const generateDailyLogs = (userId, habits, daysCount) => {
  const logs = [];

  for (let i = daysCount; i >= 0; i--) {
    const date = getDateString(i);
    const dayNumber = daysCount - i + 1;

    // Simple log entry - only use columns that exist in the table
    logs.push({
      user_id: userId,
      date,
      day_number: dayNumber
    });
  }

  return logs;
};

// ============ MAIN SEED FUNCTION ============

async function seedTestData() {
  console.log('🌱 HabitQuest Test Data Seeder\n');
  console.log(`User ID: ${USER_ID}\n`);

  // Configuration
  const archetype = randomChoice(ARCHETYPES);
  const difficulty = randomChoice(DIFFICULTIES);
  const daysActive = 25; // 25 days of history
  const dayStarted = Date.now() - (daysActive * 24 * 60 * 60 * 1000);

  console.log(`Archetype: ${archetype}`);
  console.log(`Difficulty: ${difficulty}`);
  console.log(`Days of history: ${daysActive}\n`);

  // Generate habits
  const habits = generateHabits(archetype);
  console.log(`Generated ${habits.length} habits`);

  // Generate daily logs
  const dailyLogs = generateDailyLogs(USER_ID, habits, daysActive);
  console.log(`Generated ${dailyLogs.length} daily logs\n`);

  // Calculate stats
  const perfectDays = randomInt(15, 20);
  const totalXP = randomInt(2500, 4500);
  const currentStreak = randomInt(10, 25);
  const longestStreak = Math.max(currentStreak, randomInt(15, 30));

  // Create profile data
  // Note: day_started and last_completed_date stored as ISO strings for Supabase compatibility
  const profile = {
    id: USER_ID,
    username: 'TestWarrior',
    archetype,
    difficulty,
    xp: totalXP,
    level: Math.floor(totalXP / 500) + 1,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    day_started: new Date(dayStarted).toISOString(),
    current_day: daysActive,
    habits,
    achievements: {
      firstBlood: true,
      weekWarrior: longestStreak >= 7,
      twoWeeks: longestStreak >= 14,
      monthly: longestStreak >= 30,
      lockedIn: false,
      forged: false,
      centurion: false,
      perfectWeek: perfectDays >= 7,
      perfectMonth: perfectDays >= 30
    },
    total_days_completed: daysActive,
    perfect_days_count: perfectDays,
    total_xp_earned: totalXP,
    commitment_answers: {
      struggles: ['procrastination', 'bad habits'],
      seriousness: 'very',
      identity: 'I am becoming disciplined',
      ready: true
    },
    last_completed_date: new Date().toISOString(),
    day_locked_at: null,
    last_submit_date: getDateString(0),
    last_celebration_date: null,
    daily_side_quests: [],
    completed_side_quests: [],
    side_quests_date: getDateString(0),
    updated_at: new Date().toISOString()
  };

  // Insert profile
  console.log('📤 Updating profile in Supabase...');
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' });

  if (profileError) {
    console.error('❌ Error updating profile:', profileError);
    return;
  }
  console.log('✅ Profile updated');

  // Delete existing logs for this user
  console.log('\n📤 Clearing old daily logs...');
  await supabase.from('daily_logs').delete().eq('user_id', USER_ID);

  // Insert daily logs
  console.log('📤 Inserting daily logs...');
  const { error: logsError } = await supabase
    .from('daily_logs')
    .insert(dailyLogs);

  if (logsError) {
    console.error('❌ Error inserting logs:', logsError);
    return;
  }
  console.log('✅ Daily logs inserted');

  // Summary
  console.log('\n========================================');
  console.log('🎉 SEEDING COMPLETE!');
  console.log('========================================');
  console.log(`Username: TestWarrior`);
  console.log(`Archetype: ${archetype}`);
  console.log(`Level: ${Math.floor(totalXP / 500) + 1}`);
  console.log(`XP: ${totalXP}`);
  console.log(`Current Streak: ${currentStreak} days`);
  console.log(`Longest Streak: ${longestStreak} days`);
  console.log(`Perfect Days: ${perfectDays}`);
  console.log(`Daily Logs: ${dailyLogs.length}`);
  console.log('\n⚠️  Refresh your browser to see the new data!');
}

seedTestData().catch(console.error);
