/**
 * Scoped localStorage utilities
 * Only clears HabitQuest-specific keys, preserving other apps' data
 */

// App-specific storage key prefixes
const HABITQUEST_PREFIXES = [
  'habitquest-',
  'sb-'  // Supabase auth tokens
];

/**
 * Clear only HabitQuest-related localStorage keys
 * This is safer than localStorage.clear() which wipes all origin data
 */
export const clearHabitQuestStorage = () => {
  const keysToRemove = [];

  // Find all keys that match our prefixes
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && HABITQUEST_PREFIXES.some(prefix => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }

  // Remove the keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  return keysToRemove.length;
};

/**
 * Clear Supabase auth tokens only
 */
export const clearAuthStorage = () => {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  return keysToRemove.length;
};

/**
 * Get a value from localStorage with JSON parsing
 * @param {string} key - The storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Set a value in localStorage with JSON stringification
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/**
 * Remove a specific item from localStorage
 * @param {string} key - The storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
