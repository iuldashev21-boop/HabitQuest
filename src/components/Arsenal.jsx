import { useState, useMemo } from 'react';
import {
  Flame, Trophy, Calendar, Star, AlertTriangle, Gem,
  ChevronDown, ChevronRight, Settings, Volume2, VolumeX,
  RotateCcw, Info, X, Check, Award, LogOut
} from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { useAuth } from '../hooks/useAuth';
import { CLASSES, XP_PER_LEVEL } from '../data/gameData';
import { setSoundEnabled } from '../utils/sounds';

// Achievement definitions with keys matching store
const ACHIEVEMENTS = [
  {
    id: 'firstBlood',
    name: 'First Blood',
    description: 'Complete your first day',
    icon: '🏅',
    unlockText: 'Complete 1 day'
  },
  {
    id: 'weekWarrior',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '📅',
    unlockText: 'Reach 7 day streak'
  },
  {
    id: 'twoWeeks',
    name: 'Two Weeks',
    description: '14 day streak',
    icon: '🔥',
    unlockText: 'Reach 14 day streak'
  },
  {
    id: 'monthly',
    name: 'Monthly',
    description: '30 day streak',
    icon: '💪',
    unlockText: 'Reach 30 day streak'
  },
  {
    id: 'lockedIn',
    name: 'Locked In',
    description: '45 day streak',
    icon: '🛡️',
    unlockText: 'Reach 45 day streak'
  },
  {
    id: 'forged',
    name: 'FORGED',
    description: '66 day streak - The goal!',
    icon: '⚔️',
    unlockText: 'Reach 66 day streak'
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: '100 day streak',
    icon: '💯',
    unlockText: 'Reach 100 day streak'
  },
  {
    id: 'perfectWeek',
    name: 'Perfect Week',
    description: '7 perfect days in a row',
    icon: '⭐',
    unlockText: 'Get 7 consecutive perfect days'
  },
  {
    id: 'perfectMonth',
    name: 'Perfect Month',
    description: '30 perfect days total',
    icon: '🎯',
    unlockText: 'Get 30 perfect days'
  }
];

const Arsenal = () => {
  const { signOut } = useAuth();
  const {
    username,
    archetype,
    level,
    xp,
    currentStreak,
    longestStreak,
    habits,
    dayHistory = [],
    achievements = {},
    totalDaysCompleted = 0,
    perfectDaysCount = 0,
    totalXPEarned = 0,
    getTotalRelapses,
    resetGame,
    clearSyncState,
    deleteFromSupabase
  } = useGameStore();

  const handleSignOut = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      clearSyncState();
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }

    // Always redirect
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  const [habitsExpanded, setHabitsExpanded] = useState(false);
  const [achievementsExpanded, setAchievementsExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const archetypeData = CLASSES[archetype];

  // Calculate level progress
  const levelProgress = useMemo(() => {
    const currentLevelXP = xp % XP_PER_LEVEL;
    const percentage = (currentLevelXP / XP_PER_LEVEL) * 100;
    return { current: currentLevelXP, total: XP_PER_LEVEL, percentage };
  }, [xp]);

  // Get current rank
  const currentRank = useMemo(() => {
    if (!archetypeData) return '';
    const rankIndex = Math.min(
      Math.floor((level - 1) / 5),
      archetypeData.ranks.length - 1
    );
    return archetypeData.ranks[rankIndex];
  }, [level, archetypeData]);

  // Calculate stats using persisted data
  const stats = useMemo(() => {
    const totalRelapses = getTotalRelapses ? getTotalRelapses() :
      habits.reduce((sum, h) => sum + (h.relapses || 0), 0);

    return {
      currentStreak,
      longestStreak,
      totalDays: totalDaysCompleted || dayHistory.length,
      perfectDays: perfectDaysCount || dayHistory.filter(d => d.isPerfect).length,
      totalRelapses,
      totalXP: totalXPEarned || xp
    };
  }, [currentStreak, longestStreak, totalDaysCompleted, perfectDaysCount, totalXPEarned, dayHistory, habits, xp, getTotalRelapses]);

  // Sort habits by streak (best first)
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => b.streak - a.streak);
  }, [habits]);

  // Use persisted achievements from store
  const achievementStatus = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: achievements[achievement.id] || false
    }));
  }, [achievements]);

  const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

  // Handle sound toggle
  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);
  };

  // Handle reset
  const handleReset = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Delete data from Supabase FIRST
      await deleteFromSupabase();

      // Clear localStorage
      localStorage.clear();

      // Reset local state
      resetGame();
      clearSyncState();
    } catch (err) {
      console.error('Reset error:', err);
    }

    setShowResetConfirm(false);
    setSettingsOpen(false);

    // Force full page reload
    setTimeout(() => {
      window.location.replace('/');
    }, 50);
  };

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <section style={styles.profileSection}>
        <div style={{
          ...styles.avatarContainer,
          borderColor: archetypeData.colors.accent,
          boxShadow: `0 0 30px ${archetypeData.colors.accent}40`
        }}>
          <img
            src={archetypeData.image}
            alt={archetypeData.name}
            style={styles.avatarImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span style={{ ...styles.avatarEmoji, display: 'none' }}>{archetypeData.emoji}</span>
        </div>

        <h1 style={styles.username}>{username}</h1>

        <div style={styles.archetypeInfo}>
          <span style={{ ...styles.archetypeName, color: archetypeData.colors.accent }}>
            {archetypeData.name.toUpperCase()}
          </span>
          <span style={styles.separator}>•</span>
          <span style={styles.rankName}>{currentRank.toUpperCase()}</span>
        </div>

        {/* Level & XP Bar */}
        <div style={styles.levelContainer}>
          <div style={styles.levelHeader}>
            <span style={styles.levelText}>Level {level}</span>
            <span style={styles.xpText}>{levelProgress.current}/{levelProgress.total} XP</span>
          </div>
          <div style={styles.xpBarBg}>
            <div style={{
              ...styles.xpBarFill,
              width: `${levelProgress.percentage}%`,
              backgroundColor: archetypeData.colors.accent
            }} />
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <Flame size={20} color="#f97316" />
            <span style={styles.statValue}>{stats.currentStreak}</span>
            <span style={styles.statLabel}>Current Streak</span>
          </div>
          <div style={styles.statCard}>
            <Trophy size={20} color="#eab308" />
            <span style={styles.statValue}>{stats.longestStreak}</span>
            <span style={styles.statLabel}>Longest Streak</span>
          </div>
          <div style={styles.statCard}>
            <Calendar size={20} color="#3b82f6" />
            <span style={styles.statValue}>{stats.totalDays}</span>
            <span style={styles.statLabel}>Total Days</span>
          </div>
          <div style={styles.statCard}>
            <Star size={20} color="#22c55e" />
            <span style={styles.statValue}>{stats.perfectDays}</span>
            <span style={styles.statLabel}>Perfect Days</span>
          </div>
          <div style={styles.statCard}>
            <AlertTriangle size={20} color="#ef4444" />
            <span style={styles.statValue}>{stats.totalRelapses}</span>
            <span style={styles.statLabel}>Total Relapses</span>
          </div>
          <div style={styles.statCard}>
            <Gem size={20} color="#a855f7" />
            <span style={styles.statValue}>{stats.totalXP.toLocaleString()}</span>
            <span style={styles.statLabel}>Total XP</span>
          </div>
        </div>
      </section>

      {/* Habit Breakdown */}
      <section style={styles.collapsibleSection}>
        <button
          style={styles.collapsibleHeader}
          onClick={() => setHabitsExpanded(!habitsExpanded)}
        >
          <div style={styles.headerLeft}>
            <Award size={16} color={archetypeData.colors.accent} />
            <span style={styles.sectionTitle}>HABIT STATS</span>
            <span style={styles.sectionCount}>{habits.length}</span>
          </div>
          {habitsExpanded ? (
            <ChevronDown size={18} color="#666" />
          ) : (
            <ChevronRight size={18} color="#666" />
          )}
        </button>

        <div style={{
          ...styles.collapsibleContent,
          maxHeight: habitsExpanded ? `${habits.length * 80}px` : '0px',
          opacity: habitsExpanded ? 1 : 0
        }}>
          {sortedHabits.map((habit) => (
            <div key={habit.id} style={styles.habitCard}>
              <div style={styles.habitHeader}>
                <span style={{
                  ...styles.habitType,
                  color: habit.type === 'demon' ? '#ef4444' : '#22c55e'
                }}>
                  {habit.type === 'demon' ? '👿' : '⚡'}
                </span>
                <span style={styles.habitName}>{habit.name}</span>
              </div>
              <div style={styles.habitStats}>
                <div style={styles.habitStat}>
                  <span style={styles.habitStatLabel}>Streak</span>
                  <span style={{ ...styles.habitStatValue, color: archetypeData.colors.accent }}>
                    {habit.streak}
                  </span>
                </div>
                <div style={styles.habitStat}>
                  <span style={styles.habitStatLabel}>Best</span>
                  <span style={styles.habitStatValue}>{habit.longestStreak || 0}</span>
                </div>
                {habit.type === 'demon' && (
                  <div style={styles.habitStat}>
                    <span style={styles.habitStatLabel}>Relapses</span>
                    <span style={{ ...styles.habitStatValue, color: '#ef4444' }}>
                      {habit.relapses || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section style={styles.collapsibleSection}>
        <button
          style={styles.collapsibleHeader}
          onClick={() => setAchievementsExpanded(!achievementsExpanded)}
        >
          <div style={styles.headerLeft}>
            <Trophy size={16} color="#eab308" />
            <span style={styles.sectionTitle}>ACHIEVEMENTS</span>
            <span style={styles.sectionCount}>{unlockedCount}/{ACHIEVEMENTS.length}</span>
          </div>
          {achievementsExpanded ? (
            <ChevronDown size={18} color="#666" />
          ) : (
            <ChevronRight size={18} color="#666" />
          )}
        </button>

        <div style={{
          ...styles.collapsibleContent,
          maxHeight: achievementsExpanded ? '500px' : '0px',
          opacity: achievementsExpanded ? 1 : 0
        }}>
          <div style={styles.achievementsGrid}>
            {achievementStatus.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  ...styles.achievementCard,
                  opacity: achievement.unlocked ? 1 : 0.4,
                  borderColor: achievement.unlocked ? '#fbbf24' : '#333'
                }}
              >
                <span style={{
                  ...styles.achievementIcon,
                  filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                }}>
                  {achievement.icon}
                </span>
                <span style={{
                  ...styles.achievementName,
                  color: achievement.unlocked ? '#fff' : '#666'
                }}>
                  {achievement.name}
                </span>
                <span style={styles.achievementDesc}>
                  {achievement.unlocked ? achievement.description : achievement.unlockText}
                </span>
                {achievement.unlocked && (
                  <div style={styles.unlockedBadge}>
                    <Check size={10} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Settings Button */}
      <section style={styles.settingsSection}>
        <button
          style={{ ...styles.settingsButton, borderColor: archetypeData.colors.accent }}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* Sign Out Button - More Visible */}
        <button
          style={styles.signOutButtonVisible}
          onClick={() => setShowSignOutConfirm(true)}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </section>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowSignOutConfirm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowSignOutConfirm(false)}>
              <X size={20} />
            </button>

            <div style={styles.confirmBox}>
              <LogOut size={32} color="#888" style={{ marginBottom: '16px' }} />
              <h3 style={styles.confirmTitle}>Sign Out?</h3>
              <p style={styles.confirmText}>
                Your progress is saved. You can sign back in anytime to continue your journey.
              </p>
              <div style={styles.confirmButtons}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowSignOutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.confirmSignOutButton}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div style={styles.modalOverlay} onClick={() => setSettingsOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSettingsOpen(false)}>
              <X size={20} />
            </button>

            <h2 style={{ ...styles.modalTitle, color: archetypeData.colors.accent }}>
              SETTINGS
            </h2>

            {/* Sound Toggle */}
            <div style={styles.settingRow}>
              <div style={styles.settingInfo}>
                {soundEnabled ? (
                  <Volume2 size={20} color="#22c55e" />
                ) : (
                  <VolumeX size={20} color="#666" />
                )}
                <span style={styles.settingLabel}>Sound Effects</span>
              </div>
              <button
                style={{
                  ...styles.toggleButton,
                  backgroundColor: soundEnabled ? archetypeData.colors.accent : '#333'
                }}
                onClick={handleSoundToggle}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: soundEnabled ? 'translateX(20px)' : 'translateX(0)'
                }} />
              </button>
            </div>

            {/* Reset Button */}
            <div style={styles.settingRow}>
              <div style={styles.settingInfo}>
                <RotateCcw size={20} color="#ef4444" />
                <span style={styles.settingLabel}>Reset Progress</span>
              </div>
              <button
                style={styles.resetButton}
                onClick={() => setShowResetConfirm(true)}
              >
                Start Over
              </button>
            </div>

            {/* Sign Out Button */}
            <div style={styles.settingRow}>
              <div style={styles.settingInfo}>
                <LogOut size={20} color="#888" />
                <span style={styles.settingLabel}>Sign Out</span>
              </div>
              <button
                style={styles.signOutButton}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>

            {/* About */}
            <div style={styles.aboutSection}>
              <Info size={16} color="#555" />
              <div style={styles.aboutText}>
                <span style={styles.appName}>HabitQuest</span>
                <span style={styles.appVersion}>Version 1.0.0</span>
                <span style={styles.appCredits}>Built with discipline</span>
              </div>
            </div>

            {/* Reset Confirmation */}
            {showResetConfirm && (
              <div style={styles.confirmOverlay}>
                <div style={styles.confirmBox}>
                  <h3 style={styles.confirmTitle}>Are you sure?</h3>
                  <p style={styles.confirmText}>
                    This will delete ALL your progress, streaks, and achievements. This cannot be undone.
                  </p>
                  <div style={styles.confirmButtons}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.confirmResetButton}
                      onClick={handleReset}
                    >
                      Reset Everything
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    minHeight: '100vh'
  },
  profileSection: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  avatarContainer: {
    width: '100px',
    height: '100px',
    margin: '0 auto 16px',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarEmoji: {
    fontSize: '3rem'
  },
  username: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2rem',
    letterSpacing: '0.05em',
    marginBottom: '4px',
    color: '#fff'
  },
  archetypeInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  archetypeName: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    letterSpacing: '0.1em'
  },
  separator: {
    color: '#444'
  },
  rankName: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    letterSpacing: '0.1em',
    color: '#888'
  },
  levelContainer: {
    maxWidth: '280px',
    margin: '0 auto'
  },
  levelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  levelText: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#fff',
    letterSpacing: '0.05em'
  },
  xpText: {
    fontSize: '0.75rem',
    color: '#666'
  },
  xpBarBg: {
    height: '6px',
    backgroundColor: '#1a1a1a',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  xpBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  statsSection: {
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '16px 8px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px'
  },
  statValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#fff',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '0.5625rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center'
  },
  collapsibleSection: {
    marginBottom: '16px'
  },
  collapsibleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sectionTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#888',
    letterSpacing: '0.1em'
  },
  sectionCount: {
    fontSize: '0.75rem',
    color: '#555'
  },
  collapsibleContent: {
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  habitCard: {
    padding: '14px',
    backgroundColor: '#111',
    borderRadius: '6px',
    marginTop: '8px'
  },
  habitHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },
  habitType: {
    fontSize: '1rem'
  },
  habitName: {
    fontSize: '0.875rem',
    color: '#ccc'
  },
  habitStats: {
    display: 'flex',
    gap: '20px'
  },
  habitStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  habitStatLabel: {
    fontSize: '0.625rem',
    color: '#555',
    textTransform: 'uppercase'
  },
  habitStatValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.125rem',
    color: '#fff'
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    padding: '12px 0'
  },
  achievementCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px 8px',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid',
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  achievementIcon: {
    fontSize: '1.75rem',
    marginBottom: '6px'
  },
  achievementName: {
    fontSize: '0.625rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '2px'
  },
  achievementDesc: {
    fontSize: '0.5rem',
    color: '#555',
    textAlign: 'center'
  },
  unlockedBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '14px',
    height: '14px',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000'
  },
  settingsSection: {
    marginTop: '24px',
    marginBottom: '32px'
  },
  settingsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.1em'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#111',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '340px',
    position: 'relative',
    border: '1px solid #333'
  },
  modalClose: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '4px'
  },
  modalTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    textAlign: 'center',
    marginBottom: '24px'
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #222'
  },
  settingInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  settingLabel: {
    fontSize: '0.875rem',
    color: '#ccc'
  },
  toggleButton: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease'
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s ease'
  },
  resetButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #7f1d1d',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  signOutButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  aboutSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    borderRadius: '8px'
  },
  aboutText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  appName: {
    fontSize: '0.875rem',
    color: '#888',
    fontWeight: '600'
  },
  appVersion: {
    fontSize: '0.75rem',
    color: '#555'
  },
  appCredits: {
    fontSize: '0.625rem',
    color: '#444',
    fontStyle: 'italic'
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    padding: '20px'
  },
  confirmBox: {
    textAlign: 'center'
  },
  confirmTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    color: '#ef4444',
    marginBottom: '12px'
  },
  confirmText: {
    fontSize: '0.875rem',
    color: '#888',
    marginBottom: '20px',
    lineHeight: 1.5
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  confirmResetButton: {
    padding: '10px 20px',
    backgroundColor: '#7f1d1d',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  signOutButtonVisible: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#666',
    cursor: 'pointer',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.1em',
    marginTop: '12px'
  },
  confirmSignOutButton: {
    padding: '10px 20px',
    backgroundColor: '#333',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer'
  }
};

export default Arsenal;
