// Motivational quotes for HabitQuest

// General day complete quotes (used when no relapse)
export const DAY_COMPLETE_QUOTES = [
  "One day closer to the man you're meant to be.",
  "You showed up. That's what matters.",
  "Discipline is choosing between what you want now and what you want most.",
  "The pain of discipline weighs ounces. The pain of regret weighs tons.",
  "You're not the same person you were yesterday.",
  "Small daily improvements lead to stunning results.",
  "The comeback is always stronger than the setback.",
  "You didn't come this far to only come this far.",
  "Every day you stay committed, you're building something powerful.",
  "Winners are not people who never fail, but people who never quit.",
  "The only bad workout is the one that didn't happen.",
  "You're writing your story one day at a time.",
  "Consistency beats intensity. You showed up again.",
  "The man who moves a mountain begins by carrying away small stones."
];

// Quotes for days with relapses (supportive, not shaming)
export const RELAPSE_RECOVERY_QUOTES = [
  "You fell but you got back up. That's what warriors do.",
  "Progress, not perfection.",
  "A stumble is not a fall. Keep moving.",
  "The strongest steel is forged in the hottest fire.",
  "Failure is not falling down. It's refusing to get back up.",
  "You logged it. You're still in the fight. That takes courage.",
  "Every master was once a disaster. Keep going.",
  "It's not about never falling. It's about rising every time you fall.",
  "Today was hard. Tomorrow you'll be stronger for it.",
  "The path isn't perfect. But you're still on it."
];

// Milestone messages (shown at specific streak days)
export const MILESTONE_MESSAGES = {
  1: "You've started. That's the hardest part. Day 1 begins now.",
  3: "Three days in. You're building momentum.",
  7: "One week strong. The old habits are losing their grip.",
  14: "Two weeks. The old you is fading.",
  21: "Three weeks. New neural pathways are forming.",
  30: "One month. You're not the same person who started.",
  45: "45 days. You're in the locked-in phase now.",
  60: "60 days. The finish line is in sight.",
  66: "FORGED. 66 days. This is who you are now.",
  100: "Centurion. 100 days. You've become unstoppable.",
  365: "One year. You've completely transformed."
};

// First day welcome message
export const FIRST_DAY_MESSAGE = "You've started. That's the hardest part. Day 1 begins now.";

// Perfect day specific quotes
export const PERFECT_DAY_QUOTES = [
  "Flawless execution. This is what discipline looks like.",
  "100%. No compromises. This is the way.",
  "Perfect days build perfect habits.",
  "You left nothing on the table today.",
  "When you're this consistent, success is inevitable."
];

// Helper function to get random quote from array
export const getRandomQuote = (quotes) => {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
};

// Get appropriate quote based on day status
export const getDayCompleteQuote = (isPerfect, hasRelapse, streak) => {
  // Check for milestone first
  if (MILESTONE_MESSAGES[streak]) {
    return {
      quote: MILESTONE_MESSAGES[streak],
      isMilestone: true
    };
  }

  // Relapse day - supportive quote
  if (hasRelapse) {
    return {
      quote: getRandomQuote(RELAPSE_RECOVERY_QUOTES),
      isMilestone: false
    };
  }

  // Perfect day
  if (isPerfect) {
    return {
      quote: getRandomQuote(PERFECT_DAY_QUOTES),
      isMilestone: false
    };
  }

  // Regular day complete
  return {
    quote: getRandomQuote(DAY_COMPLETE_QUOTES),
    isMilestone: false
  };
};

export default {
  DAY_COMPLETE_QUOTES,
  RELAPSE_RECOVERY_QUOTES,
  MILESTONE_MESSAGES,
  FIRST_DAY_MESSAGE,
  PERFECT_DAY_QUOTES,
  getRandomQuote,
  getDayCompleteQuote
};
