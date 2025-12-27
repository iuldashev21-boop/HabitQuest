import { useState, useMemo } from 'react';
import { Calendar, Flame, Trophy, Target, Star, X, Check, AlertTriangle } from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { CLASSES, PHASES, getPhase } from '../data/gameData';
import { formatDateYMD, parseLocalDate } from '../lib/dates';

// Helper to format date for display
const formatDateDisplay = (dateStr) => {
  const date = parseLocalDate(dateStr);
  if (!date) {
    if (import.meta.env.DEV) {
      console.warn('[BattleMap] Invalid date format:', dateStr);
    }
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to get start of journey date
const getJourneyStartDate = (dayStarted) => {
  return new Date(dayStarted);
};

// Day status colors
const DAY_STATUS = {
  PERFECT: { bg: '#166534', border: '#22c55e', label: 'Perfect' },
  PARTIAL: { bg: '#854d0e', border: '#eab308', label: 'Partial' },
  FAILED: { bg: '#7f1d1d', border: '#ef4444', label: 'Failed' },
  FUTURE: { bg: '#1a1a1a', border: '#333', label: 'Future' },
  TODAY: { bg: '#1a1a1a', border: null, label: 'Today' }, // Border set by archetype
  EMPTY: { bg: '#0a0a0a', border: '#222', label: 'Empty' }
};

const BattleMap = () => {
  const {
    archetype,
    dayStarted,
    currentDay,
    currentStreak,
    longestStreak,
    dayHistory = []
  } = useGameStore();

  const [selectedDay, setSelectedDay] = useState(null);
  const archetypeData = CLASSES[archetype];
  const phase = getPhase(currentDay);

  // Calculate stats from history
  const stats = useMemo(() => {
    const perfectDays = dayHistory.filter(d => d.isPerfect).length;
    const totalLogged = dayHistory.length;
    return { perfectDays, totalLogged };
  }, [dayHistory]);

  // Generate 66-day grid
  const journeyDays = useMemo(() => {
    if (!dayStarted) return [];

    const startDate = getJourneyStartDate(dayStarted);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateYMD(today);

    const days = [];
    for (let i = 0; i < 66; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      const dateStr = formatDateYMD(dayDate);
      const dayNum = i + 1;

      // Find history for this day
      const historyEntry = dayHistory.find(h => h.date === dateStr);

      // Determine status
      let status;
      if (dateStr === todayStr) {
        status = 'TODAY';
      } else if (dayDate > today) {
        status = 'FUTURE';
      } else if (historyEntry) {
        if (historyEntry.isPerfect) {
          status = 'PERFECT';
        } else if (historyEntry.successfulCount > 0) {
          status = 'PARTIAL';
        } else {
          status = 'FAILED';
        }
      } else {
        // Past day with no record
        status = dayDate < today ? 'EMPTY' : 'FUTURE';
      }

      days.push({
        dayNum,
        date: dateStr,
        displayDate: dayDate,
        status,
        history: historyEntry || null
      });
    }
    return days;
  }, [dayStarted, dayHistory]);

  // Group days by week for calendar display
  const calendarWeeks = useMemo(() => {
    if (journeyDays.length === 0) return [];

    const weeks = [];
    let currentWeek = [];

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDay = journeyDays[0]?.displayDate;
    if (!firstDay) return [];

    // Adjust to Monday-based week (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Add empty cells for days before journey start
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Add all journey days
    journeyDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Fill last week if incomplete
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [journeyDays]);

  // Handle day click
  const handleDayClick = (day) => {
    if (day && (day.status !== 'FUTURE' && day.status !== 'EMPTY')) {
      setSelectedDay(day);
    }
  };

  // Close modal
  const closeModal = () => setSelectedDay(null);

  // Get border color for a day
  const getDayBorderColor = (day) => {
    if (!day) return 'transparent';
    if (day.status === 'TODAY') return archetypeData.colors.accent;
    return DAY_STATUS[day.status].border;
  };

  // Get background color for a day
  const getDayBgColor = (day) => {
    if (!day) return 'transparent';
    return DAY_STATUS[day.status].bg;
  };

  if (!dayStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <Calendar size={48} color="#333" />
          <h2 style={styles.emptyTitle}>START YOUR JOURNEY</h2>
          <p style={styles.emptyText}>Complete your first day to begin tracking your 66-day battle map.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={{ ...styles.title, color: archetypeData.colors.accent }}>BATTLE MAP</h1>
        <p style={styles.subtitle}>
          Day {Math.min(currentDay, 66)}/66 - <span style={{ color: archetypeData.colors.accent }}>{phase.name.toUpperCase()}</span>
        </p>
      </header>

      {/* 66-Day Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          {/* Phase separators */}
          <div style={{ ...styles.phaseSeparator, left: '33.33%' }} />
          <div style={{ ...styles.phaseSeparator, left: '66.66%' }} />

          {/* Progress fill */}
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.min((currentDay / 66) * 100, 100)}%`,
              backgroundColor: archetypeData.colors.accent
            }}
          />

          {/* Current position marker */}
          <div
            style={{
              ...styles.progressMarker,
              left: `${Math.min((currentDay / 66) * 100, 100)}%`,
              backgroundColor: archetypeData.colors.accent,
              boxShadow: `0 0 10px ${archetypeData.colors.accent}`
            }}
          />
        </div>

        {/* Phase labels */}
        <div style={styles.phaseLabels}>
          <span style={{
            ...styles.phaseLabel,
            color: currentDay <= 22 ? archetypeData.colors.accent : '#555'
          }}>FRAGILE</span>
          <span style={{
            ...styles.phaseLabel,
            color: currentDay > 22 && currentDay <= 44 ? archetypeData.colors.accent : '#555'
          }}>BUILDING</span>
          <span style={{
            ...styles.phaseLabel,
            color: currentDay > 44 && currentDay <= 66 ? archetypeData.colors.accent : '#555'
          }}>LOCKED IN</span>
          {currentDay > 66 && (
            <span style={{
              ...styles.phaseLabel,
              color: '#fbbf24',
              fontWeight: 'bold'
            }}>FORGED</span>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarSection}>
        {/* Day headers */}
        <div style={styles.dayHeaders}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <span key={i} style={styles.dayHeader}>{day}</span>
          ))}
        </div>

        {/* Calendar weeks */}
        <div style={styles.calendarGrid}>
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} style={styles.calendarWeek}>
              {week.map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  style={{
                    ...styles.dayCell,
                    backgroundColor: getDayBgColor(day),
                    borderColor: getDayBorderColor(day),
                    cursor: day && day.status !== 'FUTURE' && day.status !== 'EMPTY' ? 'pointer' : 'default',
                    opacity: !day ? 0 : 1
                  }}
                  onClick={() => handleDayClick(day)}
                  disabled={!day || day.status === 'FUTURE' || day.status === 'EMPTY'}
                >
                  {day && (
                    <>
                      <span style={{
                        ...styles.dayNum,
                        color: day.status === 'TODAY' ? archetypeData.colors.accent :
                               day.status === 'FUTURE' ? '#444' : '#999'
                      }}>
                        {day.dayNum}
                      </span>
                      {day.status === 'PERFECT' && (
                        <Star size={10} color="#22c55e" fill="#22c55e" style={styles.dayIcon} />
                      )}
                      {day.status === 'TODAY' && (
                        <div style={{
                          ...styles.todayDot,
                          backgroundColor: archetypeData.colors.accent
                        }} />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: DAY_STATUS.PERFECT.border }} />
            <span>Perfect</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: DAY_STATUS.PARTIAL.border }} />
            <span>Partial</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: DAY_STATUS.FAILED.border }} />
            <span>Failed</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, borderColor: archetypeData.colors.accent, border: '2px solid' }} />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.statsSection}>
        <div style={styles.statCard}>
          <Flame size={20} color="#f97316" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{currentStreak}</span>
            <span style={styles.statLabel}>Current Streak</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Trophy size={20} color="#eab308" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{longestStreak}</span>
            <span style={styles.statLabel}>Longest Streak</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Star size={20} color="#22c55e" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.perfectDays}</span>
            <span style={styles.statLabel}>Perfect Days</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Target size={20} color={archetypeData.colors.accent} />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.totalLogged}</span>
            <span style={styles.statLabel}>Days Logged</span>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={closeModal}>
              <X size={20} />
            </button>

            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: archetypeData.colors.accent }}>
                DAY {selectedDay.dayNum}
              </h3>
              <p style={styles.modalDate}>{formatDateDisplay(selectedDay.date)}</p>

              {selectedDay.history?.isPerfect && (
                <div style={styles.perfectBadge}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <span>PERFECT DAY</span>
                </div>
              )}
            </div>

            {selectedDay.history ? (
              <>
                {/* Habits list */}
                <div style={styles.modalHabits}>
                  <h4 style={styles.modalSubtitle}>MISSIONS</h4>
                  {selectedDay.history.habits?.map((habit, index) => (
                    <div key={index} style={styles.habitRow}>
                      <div style={styles.habitStatus}>
                        {habit.status === 'completed' && (
                          <Check size={16} color="#22c55e" />
                        )}
                        {habit.status === 'missed' && (
                          <X size={16} color="#ef4444" />
                        )}
                        {habit.status === 'relapsed' && (
                          <AlertTriangle size={16} color="#f97316" />
                        )}
                      </div>
                      <span style={{
                        ...styles.habitName,
                        textDecoration: habit.status === 'missed' ? 'line-through' : 'none',
                        color: habit.status === 'completed' ? '#fff' :
                               habit.status === 'relapsed' ? '#f97316' : '#666'
                      }}>
                        {habit.name}
                      </span>
                      <span style={styles.habitStatusLabel}>
                        {habit.status === 'completed' ? 'Done' :
                         habit.status === 'relapsed' ? 'Relapsed' : 'Missed'}
                      </span>
                    </div>
                  )) || (
                    <p style={styles.noData}>No habit data recorded</p>
                  )}
                </div>

                {/* XP earned */}
                <div style={styles.modalXP}>
                  <span style={styles.xpLabel}>XP EARNED</span>
                  <span style={{ ...styles.xpValue, color: archetypeData.colors.accent }}>
                    +{selectedDay.history.xpEarned || 0}
                  </span>
                </div>
              </>
            ) : (
              <div style={styles.modalEmpty}>
                <p style={styles.noData}>
                  {selectedDay.status === 'TODAY'
                    ? 'Complete your missions and submit to log this day.'
                    : 'No data recorded for this day.'}
                </p>
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
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2rem',
    letterSpacing: '0.1em',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#888',
    letterSpacing: '0.05em'
  },
  progressSection: {
    marginBottom: '32px'
  },
  progressBar: {
    position: 'relative',
    height: '8px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
    marginBottom: '12px',
    overflow: 'visible'
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  progressMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #000'
  },
  phaseSeparator: {
    position: 'absolute',
    top: '-4px',
    width: '2px',
    height: '16px',
    backgroundColor: '#333'
  },
  phaseLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 10px'
  },
  phaseLabel: {
    fontSize: '0.625rem',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '0.1em',
    transition: 'color 0.3s ease'
  },
  calendarSection: {
    marginBottom: '32px'
  },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '8px'
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: '0.625rem',
    color: '#555',
    fontWeight: '600'
  },
  calendarGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  calendarWeek: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px'
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '2px solid',
    position: 'relative',
    padding: '2px',
    transition: 'all 0.2s ease'
  },
  dayNum: {
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  dayIcon: {
    position: 'absolute',
    bottom: '2px',
    right: '2px'
  },
  todayDot: {
    position: 'absolute',
    bottom: '3px',
    width: '4px',
    height: '4px',
    borderRadius: '50%'
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '16px',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.625rem',
    color: '#666'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#fff',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '0.625rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    gap: '16px'
  },
  emptyTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#444',
    letterSpacing: '0.1em'
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#555',
    maxWidth: '280px'
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
  modalHeader: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.75rem',
    letterSpacing: '0.1em',
    marginBottom: '4px'
  },
  modalDate: {
    fontSize: '0.875rem',
    color: '#666'
  },
  perfectBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    padding: '6px 12px',
    borderRadius: '20px',
    marginTop: '12px',
    fontSize: '0.75rem',
    color: '#fbbf24',
    fontWeight: '600',
    letterSpacing: '0.05em'
  },
  modalHabits: {
    marginBottom: '20px'
  },
  modalSubtitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#555',
    letterSpacing: '0.1em',
    marginBottom: '12px'
  },
  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #222'
  },
  habitStatus: {
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  habitName: {
    flex: 1,
    fontSize: '0.875rem'
  },
  habitStatusLabel: {
    fontSize: '0.625rem',
    color: '#555',
    textTransform: 'uppercase'
  },
  noData: {
    fontSize: '0.875rem',
    color: '#555',
    textAlign: 'center',
    padding: '20px 0'
  },
  modalXP: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px'
  },
  xpLabel: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#666',
    letterSpacing: '0.05em'
  },
  xpValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem'
  },
  modalEmpty: {
    padding: '20px 0'
  }
};

export default BattleMap;
