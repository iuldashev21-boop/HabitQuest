import { useMemo, useState, useCallback, useEffect } from 'react';
import { Flame, Skull, Zap, Check, X, ChevronDown, ChevronRight, Settings as SettingsIcon, Clock, Calendar, WifiOff, RefreshCw } from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { CLASSES, XP_PER_LEVEL, FREQUENCY_TYPES, isScheduledDay, getWeekCompletions } from '../data/gameData';
import XPPopup from './XPPopup';
import RelapseModal from './RelapseModal';
import DayCompleteModal from './DayCompleteModal';
import Settings from './Settings';
import SideQuests from './SideQuests';
import { playSuccess, playRelapse, playComplete } from '../utils/sounds';

// Sync Status Toast Component
const SyncToast = ({ error, isSyncing, onDismiss }) => {
  if (!error && !isSyncing) return null;

  // Determine if it's a config error vs network error
  const isConfigError = error && (
    error.includes('Invalid API key') ||
    error.includes('JWT') ||
    error.includes('invalid_api_key') ||
    error.includes('401')
  );

  const errorMessage = isConfigError
    ? 'Config error - check console'
    : 'Sync failed - saved locally';

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: error ? '#7f1d1d' : '#1a1a1a',
        border: `1px solid ${error ? '#dc2626' : '#333'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1001,
        maxWidth: '90%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
      }}
      role={error ? 'alert' : 'status'}
      aria-live={error ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {error ? (
        <>
          <WifiOff size={16} color="#ef4444" aria-hidden="true" />
          <span style={{ fontSize: '0.8125rem', color: '#fca5a5' }}>
            {errorMessage}
          </span>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Dismiss sync notification"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <RefreshCw size={14} color="#888" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
          <span style={{ fontSize: '0.8125rem', color: '#888' }}>Syncing...</span>
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const Dashboard = () => {
  const {
    username,
    archetype,
    habits,
    level,
    currentStreak,
    currentDay,
    completeHabit,
    uncompleteHabit,
    relapseHabit,
    markDayCompleted,
    markCelebrationShown,
    checkAndResetDay,
    getRank,
    getCurrentPhase,
    getLevelProgress,
    getTimeUntilUnlock,
    refreshSideQuests,
    isTodaySubmitted,
    wasCelebrationShownToday,
    syncError,
    isSyncing,
    clearSyncError
  } = useGameStore();

  const [xpPopups, setXpPopups] = useState([]);
  const [showDayComplete, setShowDayComplete] = useState(false);
  const [dayCompleteData, setDayCompleteData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [completedHabits, setCompletedHabits] = useState({});
  const [relapsedHabits, setRelapsedHabits] = useState({});
  const [relapseModalHabit, setRelapseModalHabit] = useState(null);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState(0);

  // Collapsible section states
  const [demonsExpanded, setDemonsExpanded] = useState(true);
  const [powersExpanded, setPowersExpanded] = useState(true);

  // Check if today has been submitted (from persisted store)
  const daySubmitted = isTodaySubmitted();

  // Check for day reset on mount and periodically
  useEffect(() => {
    checkAndResetDay();
    refreshSideQuests();

    const interval = setInterval(() => {
      checkAndResetDay();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkAndResetDay, refreshSideQuests]);

  // Countdown timer for midnight reset
  useEffect(() => {
    if (!daySubmitted) {
      setTimeUntilUnlock(0);
      return;
    }

    setTimeUntilUnlock(getTimeUntilUnlock());

    const interval = setInterval(() => {
      const remaining = getTimeUntilUnlock();
      setTimeUntilUnlock(remaining);

      if (remaining <= 0) {
        checkAndResetDay();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [daySubmitted, getTimeUntilUnlock, checkAndResetDay]);

  const archetypeData = CLASSES[archetype];
  const currentRank = getRank();
  const phase = getCurrentPhase();
  const levelProgress = getLevelProgress();

  // Format countdown time
  const formatCountdown = (ms) => {
    if (ms <= 0) return '0:00:00';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Split habits into demons and powers
  const demons = habits.filter((h) => h.type === 'demon');
  const powers = habits.filter((h) => h.type === 'power');

  // Count only scheduled habits as needing completion
  const scheduledDemons = demons.filter((h) => isScheduledDay(h.frequency || 'daily'));
  const scheduledPowers = powers.filter((h) => isScheduledDay(h.frequency || 'daily'));

  const demonsCompleted = scheduledDemons.filter((h) => h.completed).length;
  const powersCompleted = scheduledPowers.filter((h) => h.completed).length;

  // Calculate today's earned XP
  const todaysXP = useMemo(() => {
    return habits.filter((h) => h.completed).reduce((sum, h) => sum + h.xp, 0);
  }, [habits]);

  // Check if all SCHEDULED habits are handled (completed OR relapsed for demons)
  const scheduledHabits = habits.filter((h) => isScheduledDay(h.frequency || 'daily'));
  const allHandled = scheduledHabits.every((h) =>
    h.completed || (h.type === 'demon' && h.relapsedToday)
  );
  const completedCount = scheduledHabits.filter((h) => h.completed).length;
  const allCompleted = completedCount === scheduledHabits.length; // Perfect day

  // Calculate 66-day progress
  const dayProgress = Math.min((currentDay / 66) * 100, 100);

  const addXPPopup = useCallback((habitId, xpValue) => {
    const id = `${habitId}-${Date.now()}`;
    setXpPopups((prev) => [...prev, { id, habitId, xp: xpValue }]);
  }, []);

  const removeXPPopup = useCallback((id) => {
    setXpPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleCompleteHabit = useCallback((habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit || habit.completed) return;

    playSuccess();
    addXPPopup(habitId, habit.xp);
    setCompletedHabits((prev) => ({ ...prev, [habitId]: true }));
    completeHabit(habitId);

    setTimeout(() => {
      setCompletedHabits((prev) => {
        const next = { ...prev };
        delete next[habitId];
        return next;
      });
    }, 500);
  }, [habits, completeHabit, addXPPopup]);

  // Handle undo habit completion (before submission)
  const handleUncompleteHabit = useCallback((habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit || !habit.completed) return;
    if (daySubmitted) return; // Can't undo after submission

    const result = uncompleteHabit(habitId);
    if (result && result.success) {
      // Show negative XP popup
      addXPPopup(habitId, -result.xpRemoved);
    }
  }, [habits, uncompleteHabit, daySubmitted, addXPPopup]);

  const handleRelapseClick = useCallback((habit) => {
    setRelapseModalHabit(habit);
  }, []);

  const handleRelapseConfirm = useCallback(() => {
    if (!relapseModalHabit) return null;

    playRelapse();
    const result = relapseHabit(relapseModalHabit.id);

    setRelapsedHabits((prev) => ({ ...prev, [relapseModalHabit.id]: true }));
    setTimeout(() => {
      setRelapsedHabits((prev) => {
        const next = { ...prev };
        delete next[relapseModalHabit.id];
        return next;
      });
    }, 600);

    return result;
  }, [relapseModalHabit, relapseHabit]);

  const handleRelapseCancel = useCallback(() => {
    setRelapseModalHabit(null);
  }, []);

  const handleSubmitDay = () => {
    if (allHandled && !daySubmitted) {
      playComplete();
      const result = markDayCompleted();

      setDayCompleteData({
        xpEarned: todaysXP,
        newStreak: result.newStreak,
        isPerfectDay: result.isPerfectDay,
        successfulCount: result.successfulCount,
        totalCount: result.totalCount,
        relapseCount: result.relapseCount || 0
      });

      if (!wasCelebrationShownToday()) {
        setShowDayComplete(true);
        markCelebrationShown();
      }
    }
  };

  const handleDayCompleteClose = () => {
    setShowDayComplete(false);
    setDayCompleteData(null);
  };

  // Render habit card (simplified)
  const renderHabitCard = (habit, type) => {
    const isCompleting = completedHabits[habit.id];
    const isDemon = type === 'demon';
    const frequency = habit.frequency || 'daily';
    const isScheduled = isScheduledDay(frequency);
    const isNonDaily = frequency !== 'daily';

    // Get week progress for non-daily habits
    const weekCompletions = isNonDaily ? getWeekCompletions(habit.completedDates || []) : 0;
    const weekTarget = FREQUENCY_TYPES[frequency]?.targetPerWeek || 7;

    // Rest day styling
    const isRestDay = !isScheduled;

    return (
      <div
        key={habit.id}
        style={{
          ...styles.habitCard,
          backgroundColor: isDemon ? '#0d0808' : '#080d08',
          opacity: habit.completed ? 0.5 : (isRestDay ? 0.4 : 1),
          transform: isCompleting ? 'scale(0.98)' : 'scale(1)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* XP Popup */}
        {xpPopups.filter((p) => p.habitId === habit.id).map((popup) => (
          <XPPopup
            key={popup.id}
            xp={popup.xp}
            color={archetypeData.colors.accent}
            onComplete={() => removeXPPopup(popup.id)}
          />
        ))}

        <div style={styles.habitContent}>
          <div style={styles.habitLeft}>
            <div style={styles.habitNameRow}>
              <span style={{
                ...styles.habitName,
                textDecoration: habit.completed ? 'line-through' : 'none',
                color: habit.completed ? '#666' : (isRestDay ? '#555' : '#fff')
              }}>
                {habit.name}
              </span>
              {isRestDay && (
                <span style={styles.restDayBadge}>Rest</span>
              )}
            </div>
            <div style={styles.habitMeta}>
              <span style={styles.habitXP}>{habit.xp} XP</span>

              {/* For non-daily habits: show week progress */}
              {isNonDaily && !isRestDay && (
                <span style={styles.weekProgress}>
                  <Calendar size={10} />
                  <span>{weekCompletions}/{weekTarget}</span>
                  <span style={styles.progressDots}>
                    {Array.from({ length: weekTarget }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          ...styles.progressDot,
                          backgroundColor: i < weekCompletions
                            ? (isDemon ? '#dc2626' : '#22c55e')
                            : '#333'
                        }}
                      />
                    ))}
                  </span>
                </span>
              )}

              {/* For daily habits: show day streak */}
              {!isNonDaily && habit.streak > 0 && (
                <span style={styles.habitStreak}>
                  <Flame size={10} /> {habit.streak}d
                </span>
              )}

              {/* For non-daily habits: show week streak */}
              {isNonDaily && (habit.weekStreak || 0) > 0 && (
                <span style={styles.habitStreak}>
                  <Flame size={10} /> {habit.weekStreak}w
                </span>
              )}
            </div>
          </div>

          <div style={styles.habitRight}>
            {isRestDay ? (
              <div style={styles.restDayIcon}>
                <Calendar size={16} color="#444" />
              </div>
            ) : habit.completed ? (
              <button
                style={{
                  ...styles.completedBadge,
                  backgroundColor: isDemon ? 'rgba(127, 29, 29, 0.5)' : 'rgba(20, 83, 45, 0.5)',
                  color: isDemon ? '#fca5a5' : '#86efac',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onClick={() => handleUncompleteHabit(habit.id)}
                title="Click to undo"
              >
                <Check size={14} />
              </button>
            ) : habit.relapsedToday ? (
              // Relapsed demon - show X badge
              <div style={styles.relapsedBadge}>
                <X size={14} />
              </div>
            ) : isDemon ? (
              <div style={styles.demonActions}>
                <button
                  style={styles.cleanBtn}
                  onClick={() => handleCompleteHabit(habit.id)}
                >
                  <Check size={16} />
                </button>
                <button
                  style={styles.relapseBtn}
                  onClick={() => handleRelapseClick(habit)}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                style={styles.powerBtn}
                onClick={() => handleCompleteHabit(habit.id)}
              >
                <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Day Complete Summary (shown when submitted)
  if (daySubmitted) {
    return (
      <div style={styles.container}>
        <SyncToast error={syncError} isSyncing={isSyncing} onDismiss={clearSyncError} />
        <div style={styles.content}>
          {/* Minimal Header */}
          <header style={styles.headerCompact}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarContainerSmall}>
                <img
                  src={archetypeData.image}
                  alt={archetypeData.name}
                  style={styles.avatarImageSmall}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span style={{ ...styles.emojiSmall, display: 'none' }}>{archetypeData.emoji}</span>
              </div>
              <div>
                <h1 style={{ ...styles.usernameSmall, color: archetypeData.colors.accent }}>
                  {username?.toUpperCase()}
                </h1>
                <span style={styles.rankSmall}>{currentRank}</span>
              </div>
            </div>
            <button style={styles.settingsBtn} onClick={() => setShowSettings(true)}>
              <SettingsIcon size={20} />
            </button>
          </header>

          {/* Day Complete Card */}
          <div style={styles.dayCompleteCard}>
            <div style={styles.dayCompleteIcon}>
              <Check size={32} color={archetypeData.colors.accent} />
            </div>
            <h2 style={styles.dayCompleteTitle}>DAY {currentDay} COMPLETE</h2>

            <div style={styles.dayCompleteStats}>
              <div style={styles.statBlock}>
                <span style={styles.statValue}>+{todaysXP}</span>
                <span style={styles.statLabel}>XP EARNED</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statBlock}>
                <span style={styles.statValue}>{currentStreak}</span>
                <span style={styles.statLabel}>DAY STREAK</span>
              </div>
            </div>

            <div style={styles.countdownSection}>
              <Clock size={14} color="#666" />
              <span style={styles.countdownText}>
                Come back in {formatCountdown(timeUntilUnlock)}
              </span>
            </div>
            <p style={styles.midnightResetText}>
              Your habits will reset at midnight
            </p>
          </div>

          {/* Side Quests still available */}
          <SideQuests />
        </div>

        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  // Main Dashboard (not submitted)
  return (
    <div style={styles.container}>
      <SyncToast error={syncError} isSyncing={isSyncing} onDismiss={clearSyncError} />
      <div style={styles.content}>
        {/* Compact Header */}
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarContainer}>
                <img
                  src={archetypeData.image}
                  alt={archetypeData.name}
                  style={styles.avatarImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span style={{ ...styles.emoji, display: 'none' }}>{archetypeData.emoji}</span>
              </div>
              <div>
                <h1 style={{ ...styles.username, color: archetypeData.colors.accent }}>
                  {username?.toUpperCase()}
                </h1>
                <span style={styles.rank}>{currentRank} {archetypeData.name}</span>
              </div>
            </div>
            <button style={styles.settingsBtn} onClick={() => setShowSettings(true)}>
              <SettingsIcon size={20} />
            </button>
          </div>

          {/* Current Date */}
          <div style={styles.dateDisplay}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>

          {/* Stats Row */}
          <div style={styles.statsRow}>
            <div style={styles.levelBar}>
              <div style={styles.levelInfo}>
                <span style={styles.levelText}>LV {level}</span>
                <span style={styles.xpText}>{levelProgress.current}/{XP_PER_LEVEL}</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${levelProgress.percentage}%`,
                  backgroundColor: archetypeData.colors.accent
                }} />
              </div>
            </div>
            <div style={styles.streakBox}>
              {currentStreak >= 7 && <Flame size={14} color="#f97316" />}
              <span style={styles.streakNum}>{currentStreak}</span>
            </div>
          </div>
        </header>

        {/* Phase Progress */}
        <div style={styles.phaseBar}>
          <div style={styles.phaseInfo}>
            <span style={styles.dayText}>DAY {currentDay}/66</span>
            <span style={styles.phaseText}>{phase.name}</span>
          </div>
          <div style={styles.phaseProgress}>
            <div style={{
              ...styles.phaseFill,
              width: `${dayProgress}%`,
              backgroundColor: archetypeData.colors.accent
            }} />
          </div>
        </div>

        {/* Demons Section - Collapsible */}
        <section style={styles.section}>
          <button
            style={styles.sectionHeader}
            onClick={() => setDemonsExpanded(!demonsExpanded)}
          >
            <div style={styles.sectionLeft}>
              <Skull size={16} color="#7f1d1d" />
              <span style={styles.sectionTitle}>DEMONS</span>
              <span style={styles.sectionCount}>
                {demonsCompleted}/{scheduledDemons.length}
              </span>
            </div>
            {demonsExpanded ? (
              <ChevronDown size={18} color="#666" />
            ) : (
              <ChevronRight size={18} color="#666" />
            )}
          </button>

          <div style={{
            ...styles.sectionContent,
            maxHeight: demonsExpanded ? `${demons.length * 80}px` : '0px',
            opacity: demonsExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {demons.map((habit) => renderHabitCard(habit, 'demon'))}
          </div>
        </section>

        {/* Powers Section - Collapsible */}
        <section style={styles.section}>
          <button
            style={styles.sectionHeader}
            onClick={() => setPowersExpanded(!powersExpanded)}
          >
            <div style={styles.sectionLeft}>
              <Zap size={16} color="#14532d" />
              <span style={styles.sectionTitle}>POWERS</span>
              <span style={styles.sectionCount}>
                {powersCompleted}/{scheduledPowers.length}
              </span>
            </div>
            {powersExpanded ? (
              <ChevronDown size={18} color="#666" />
            ) : (
              <ChevronRight size={18} color="#666" />
            )}
          </button>

          <div style={{
            ...styles.sectionContent,
            maxHeight: powersExpanded ? `${powers.length * 80}px` : '0px',
            opacity: powersExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {powers.map((habit) => renderHabitCard(habit, 'power'))}
          </div>
        </section>

        {/* Side Quests */}
        <SideQuests />

        {/* Bottom Submit Area */}
        <div style={styles.bottomArea}>
          <div style={styles.todaySummary}>
            <span style={styles.todayLabel}>TODAY</span>
            <span style={{...styles.todayXP, color: archetypeData.colors.accent}}>
              +{todaysXP} XP
            </span>
            <span style={styles.todayProgress}>
              {completedCount}/{scheduledHabits.length}
            </span>
          </div>

          <button
            style={{
              ...styles.submitBtn,
              backgroundColor: allHandled ? archetypeData.colors.accent : '#1a1a1a',
              color: allHandled ? (archetype === 'SPECTER' ? '#fff' : '#000') : '#444',
              cursor: allHandled ? 'pointer' : 'default'
            }}
            onClick={handleSubmitDay}
            disabled={!allHandled}
          >
            {allHandled
              ? (allCompleted ? archetypeData.submitButton : `${completedCount}/${scheduledHabits.length} - END DAY`)
              : `${scheduledHabits.length - completedCount} LEFT`
            }
          </button>
        </div>
      </div>

      {/* Modals */}
      {relapseModalHabit && (
        <RelapseModal
          habit={relapseModalHabit}
          archetype={archetype}
          onConfirm={handleRelapseConfirm}
          onCancel={handleRelapseCancel}
        />
      )}

      {showDayComplete && dayCompleteData && (
        <DayCompleteModal
          archetype={archetype}
          xpEarned={dayCompleteData.xpEarned}
          newStreak={dayCompleteData.newStreak}
          isPerfectDay={dayCompleteData.isPerfectDay}
          successfulCount={dayCompleteData.successfulCount}
          totalCount={dayCompleteData.totalCount}
          relapseCount={dayCompleteData.relapseCount}
          onClose={handleDayCompleteClose}
        />
      )}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#000',
    padding: '16px'
  },
  content: {
    maxWidth: '420px',
    margin: '0 auto'
  },

  // Header
  header: {
    marginBottom: '16px'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  emoji: {
    fontSize: '2.5rem'
  },
  avatarContainer: {
    position: 'relative',
    width: '48px',
    height: '48px'
  },
  avatarImage: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  avatarContainerSmall: {
    position: 'relative',
    width: '40px',
    height: '40px'
  },
  avatarImageSmall: {
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  username: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.05em',
    margin: 0,
    lineHeight: 1
  },
  rank: {
    fontSize: '0.75rem',
    color: '#666',
    letterSpacing: '0.05em'
  },
  dateDisplay: {
    fontSize: '0.75rem',
    color: '#555',
    textAlign: 'center',
    marginBottom: '12px',
    letterSpacing: '0.02em'
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    color: '#444',
    cursor: 'pointer',
    padding: '8px'
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  levelBar: {
    flex: 1
  },
  levelInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  levelText: {
    fontSize: '0.75rem',
    color: '#888',
    fontWeight: 'bold'
  },
  xpText: {
    fontSize: '0.625rem',
    color: '#555'
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#111',
    borderRadius: '2px'
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },
  streakBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#111',
    padding: '8px 12px',
    borderRadius: '4px'
  },
  streakNum: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    color: '#fff'
  },

  // Phase
  phaseBar: {
    backgroundColor: '#111',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px'
  },
  phaseInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  dayText: {
    fontSize: '0.875rem',
    color: '#fff',
    fontWeight: 'bold'
  },
  phaseText: {
    fontSize: '0.75rem',
    color: '#666',
    textTransform: 'uppercase'
  },
  phaseProgress: {
    height: '3px',
    backgroundColor: '#222',
    borderRadius: '2px'
  },
  phaseFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },

  // Sections
  section: {
    marginBottom: '12px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#111',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '6px'
  },
  sectionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sectionTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#888',
    letterSpacing: '0.1em'
  },
  sectionCount: {
    fontSize: '0.75rem',
    color: '#555',
    marginLeft: '4px'
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  // Habit Cards
  habitCard: {
    padding: '12px',
    borderRadius: '6px',
    position: 'relative'
  },
  habitContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  habitLeft: {
    flex: 1,
    minWidth: 0
  },
  habitNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px'
  },
  habitName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'block'
  },
  restDayBadge: {
    fontSize: '0.625rem',
    color: '#555',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  habitMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  weekProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.65rem',
    color: '#888'
  },
  progressDots: {
    display: 'flex',
    gap: '2px',
    marginLeft: '4px'
  },
  progressDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  restDayIcon: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '50%'
  },
  habitXP: {
    fontSize: '0.7rem',
    color: '#555'
  },
  habitStreak: {
    fontSize: '0.65rem',
    color: '#f97316',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  habitRight: {
    flexShrink: 0
  },
  completedBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  relapsedBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    color: '#7f1d1d'
  },
  demonActions: {
    display: 'flex',
    gap: '6px'
  },
  cleanBtn: {
    width: '36px',
    height: '36px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '50%',
    color: '#22c55e',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  relapseBtn: {
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(127, 29, 29, 0.5)',
    borderRadius: '50%',
    color: '#7f1d1d',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  powerBtn: {
    width: '44px',
    height: '44px',
    backgroundColor: 'transparent',
    border: '2px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '50%',
    color: '#22c55e',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Bottom
  bottomArea: {
    marginTop: '24px',
    backgroundColor: '#111',
    borderRadius: '8px',
    padding: '16px'
  },
  todaySummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  todayLabel: {
    fontSize: '0.625rem',
    color: '#555',
    letterSpacing: '0.1em'
  },
  todayXP: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem'
  },
  todayProgress: {
    fontSize: '0.75rem',
    color: '#555'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.1em',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Day Complete State
  headerCompact: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  emojiSmall: {
    fontSize: '2rem'
  },
  usernameSmall: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    margin: 0,
    lineHeight: 1
  },
  rankSmall: {
    fontSize: '0.625rem',
    color: '#555'
  },
  dayCompleteCard: {
    backgroundColor: '#111',
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center',
    marginBottom: '24px'
  },
  dayCompleteIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  },
  dayCompleteTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#fff',
    letterSpacing: '0.1em',
    marginBottom: '24px'
  },
  dayCompleteStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '24px'
  },
  statBlock: {
    textAlign: 'center'
  },
  statValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.75rem',
    color: '#fff',
    display: 'block'
  },
  statLabel: {
    fontSize: '0.625rem',
    color: '#555',
    letterSpacing: '0.1em'
  },
  statDivider: {
    width: '1px',
    backgroundColor: '#222'
  },
  countdownSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  countdownText: {
    fontSize: '0.75rem',
    color: '#555'
  },
  midnightResetText: {
    fontSize: '0.6875rem',
    color: '#888',  // Changed from #444 for WCAG AA contrast compliance (4.5:1)
    textAlign: 'center',
    marginTop: '8px',
    fontStyle: 'italic'
  }
};

export default Dashboard;
