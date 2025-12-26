import { useState, useMemo } from 'react';
import {
  Calendar, Star, AlertTriangle, Check, X,
  ChevronDown, ChevronUp, BookOpen, Filter
} from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { CLASSES, getStreakMultiplier, PERFECT_DAY_BONUS } from '../data/gameData';

// Helper to format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Filter options
const FILTERS = {
  all: { id: 'all', label: 'All' },
  perfect: { id: 'perfect', label: 'Perfect' },
  relapses: { id: 'relapses', label: 'Relapses' }
};

const Records = () => {
  const {
    archetype,
    dayHistory = [],
    currentStreak
  } = useGameStore();

  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedDay, setExpandedDay] = useState(null);

  const archetypeData = CLASSES[archetype];

  // Filter and sort history (most recent first)
  const filteredHistory = useMemo(() => {
    let filtered = [...dayHistory];

    // Apply filter
    switch (activeFilter) {
      case 'perfect':
        filtered = filtered.filter(d => d.isPerfect);
        break;
      case 'relapses':
        filtered = filtered.filter(d => d.relapseCount > 0);
        break;
      default:
        break;
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [dayHistory, activeFilter]);

  // Get day status
  const getDayStatus = (day) => {
    if (day.isPerfect) return 'perfect';
    if (day.relapseCount > 0) return 'relapse';
    if (day.successfulCount < day.totalCount) return 'partial';
    return 'partial';
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'perfect':
        return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'PERFECT DAY', icon: Star };
      case 'relapse':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'HAD RELAPSE', icon: AlertTriangle };
      case 'partial':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', label: 'PARTIAL', icon: Calendar };
      default:
        return { color: '#888', bg: 'rgba(136, 136, 136, 0.1)', label: 'LOGGED', icon: Calendar };
    }
  };

  // Toggle expanded day
  const toggleExpand = (date) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  // Calculate XP breakdown for a day
  const calculateXPBreakdown = (day) => {
    const habitXP = day.habits
      .filter(h => h.status === 'completed')
      .reduce((sum, h) => sum + (h.xp || 0), 0);

    const perfectBonus = day.isPerfect ? PERFECT_DAY_BONUS : 0;
    // Estimate streak multiplier (we don't store exact streak at that time)
    const streakMultiplier = 1.0; // Default, actual would need to be stored

    return {
      habitXP,
      perfectBonus,
      streakMultiplier,
      total: day.xpEarned
    };
  };

  // Empty state
  if (dayHistory.length === 0) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={{ ...styles.title, color: archetypeData.colors.accent }}>RECORDS</h1>
          <p style={styles.subtitle}>0 Days Logged</p>
        </header>

        <div style={styles.emptyState}>
          <BookOpen size={48} color="#333" />
          <h2 style={styles.emptyTitle}>NO RECORDS YET</h2>
          <p style={styles.emptyText}>
            Complete your first day to start logging your journey. Every day you submit will be recorded here.
          </p>
          <p style={styles.emptySubtext}>
            Your history becomes your evidence of transformation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={{ ...styles.title, color: archetypeData.colors.accent }}>RECORDS</h1>
        <p style={styles.subtitle}>{dayHistory.length} Days Logged</p>
      </header>

      {/* Filter Buttons */}
      <div style={styles.filterContainer}>
        <Filter size={14} color="#555" />
        {Object.values(FILTERS).map((filter) => (
          <button
            key={filter.id}
            style={{
              ...styles.filterButton,
              backgroundColor: activeFilter === filter.id ? archetypeData.colors.accent : '#1a1a1a',
              color: activeFilter === filter.id
                ? (archetype === 'SPECTER' ? '#fff' : '#000')
                : '#888'
            }}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {activeFilter !== 'all' && (
        <p style={styles.resultsCount}>
          Showing {filteredHistory.length} of {dayHistory.length} days
        </p>
      )}

      {/* Daily Log List */}
      <div style={styles.logList}>
        {filteredHistory.length === 0 ? (
          <div style={styles.noResults}>
            <p>No days match this filter.</p>
          </div>
        ) : (
          filteredHistory.map((day) => {
            const status = getDayStatus(day);
            const statusStyle = getStatusStyle(status);
            const StatusIcon = statusStyle.icon;
            const isExpanded = expandedDay === day.date;
            const xpBreakdown = calculateXPBreakdown(day);

            return (
              <div key={day.date} style={styles.dayCard}>
                {/* Day Card Header - Always visible */}
                <button
                  style={styles.dayCardHeader}
                  onClick={() => toggleExpand(day.date)}
                >
                  <div style={styles.dayCardTop}>
                    <div style={styles.dateInfo}>
                      <Calendar size={14} color="#666" />
                      <span style={styles.dateText}>{formatDate(day.date)}</span>
                    </div>
                    <span style={styles.dayNumber}>Day {day.dayNumber || '?'}</span>
                  </div>

                  <div style={styles.dayCardMiddle}>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      <StatusIcon size={12} />
                      <span>{statusStyle.label}</span>
                    </div>
                  </div>

                  <div style={styles.dayCardBottom}>
                    <div style={styles.completionInfo}>
                      <Check size={14} color="#22c55e" />
                      <span style={styles.completionText}>
                        {day.successfulCount}/{day.totalCount} Completed
                      </span>
                    </div>
                    <span style={{ ...styles.xpEarned, color: archetypeData.colors.accent }}>
                      +{day.xpEarned} XP
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#555" />
                    ) : (
                      <ChevronDown size={18} color="#555" />
                    )}
                  </div>

                  {day.relapseCount > 0 && !isExpanded && (
                    <div style={styles.relapseWarning}>
                      <AlertTriangle size={12} color="#ef4444" />
                      <span>{day.relapseCount} Relapse{day.relapseCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={styles.expandedDetail}>
                    {/* Demons Section */}
                    {day.habits.filter(h => h.type === 'demon').length > 0 && (
                      <div style={styles.habitSection}>
                        <h4 style={styles.habitSectionTitle}>DEMONS</h4>
                        {day.habits
                          .filter(h => h.type === 'demon')
                          .map((habit) => (
                            <div key={habit.id} style={styles.habitRow}>
                              <div style={styles.habitStatusIcon}>
                                {habit.status === 'completed' && (
                                  <Check size={14} color="#22c55e" />
                                )}
                                {habit.status === 'relapsed' && (
                                  <AlertTriangle size={14} color="#ef4444" />
                                )}
                                {habit.status === 'missed' && (
                                  <X size={14} color="#666" />
                                )}
                              </div>
                              <span style={{
                                ...styles.habitName,
                                color: habit.status === 'completed' ? '#ccc' :
                                       habit.status === 'relapsed' ? '#ef4444' : '#666'
                              }}>
                                {habit.name}
                              </span>
                              <span style={styles.habitStatusText}>
                                {habit.status === 'completed' && `Clean (streak: ${habit.streak || 0})`}
                                {habit.status === 'relapsed' && 'RELAPSED (streak reset)'}
                                {habit.status === 'missed' && 'Missed'}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Powers Section */}
                    {day.habits.filter(h => h.type === 'power').length > 0 && (
                      <div style={styles.habitSection}>
                        <h4 style={styles.habitSectionTitle}>POWERS</h4>
                        {day.habits
                          .filter(h => h.type === 'power')
                          .map((habit) => (
                            <div key={habit.id} style={styles.habitRow}>
                              <div style={styles.habitStatusIcon}>
                                {habit.status === 'completed' && (
                                  <Check size={14} color="#22c55e" />
                                )}
                                {habit.status === 'missed' && (
                                  <X size={14} color="#666" />
                                )}
                              </div>
                              <span style={{
                                ...styles.habitName,
                                color: habit.status === 'completed' ? '#ccc' : '#666'
                              }}>
                                {habit.name}
                              </span>
                              <span style={styles.habitStatusText}>
                                {habit.status === 'completed' && `Done (streak: ${habit.streak || 0})`}
                                {habit.status === 'missed' && 'Missed'}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* XP Breakdown */}
                    <div style={styles.xpBreakdown}>
                      <h4 style={styles.habitSectionTitle}>XP BREAKDOWN</h4>
                      <div style={styles.xpRow}>
                        <span style={styles.xpLabel}>Habits</span>
                        <span style={styles.xpValue}>{xpBreakdown.habitXP} XP</span>
                      </div>
                      {day.isPerfect && (
                        <div style={styles.xpRow}>
                          <span style={styles.xpLabel}>Perfect Day Bonus</span>
                          <span style={{ ...styles.xpValue, color: '#fbbf24' }}>
                            +{PERFECT_DAY_BONUS} XP
                          </span>
                        </div>
                      )}
                      <div style={{ ...styles.xpRow, ...styles.xpTotal }}>
                        <span style={styles.xpLabel}>Total</span>
                        <span style={{ ...styles.xpValue, color: archetypeData.colors.accent }}>
                          {day.xpEarned} XP
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
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
    color: '#888'
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#111',
    borderRadius: '8px'
  },
  filterButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  resultsCount: {
    fontSize: '0.75rem',
    color: '#555',
    marginBottom: '16px',
    textAlign: 'center'
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dayCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  dayCardHeader: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left'
  },
  dayCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dateText: {
    fontSize: '0.875rem',
    color: '#ccc'
  },
  dayNumber: {
    fontSize: '0.75rem',
    color: '#666',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '0.05em'
  },
  dayCardMiddle: {
    marginBottom: '10px'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    letterSpacing: '0.05em'
  },
  dayCardBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  completionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1
  },
  completionText: {
    fontSize: '0.8125rem',
    color: '#888'
  },
  xpEarned: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.05em'
  },
  relapseWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#ef4444'
  },
  expandedDetail: {
    padding: '0 16px 16px',
    borderTop: '1px solid #333'
  },
  habitSection: {
    marginTop: '16px'
  },
  habitSectionTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.75rem',
    color: '#555',
    letterSpacing: '0.1em',
    marginBottom: '10px'
  },
  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid #222'
  },
  habitStatusIcon: {
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  habitName: {
    flex: 1,
    fontSize: '0.8125rem'
  },
  habitStatusText: {
    fontSize: '0.6875rem',
    color: '#555'
  },
  xpBreakdown: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#111',
    borderRadius: '8px'
  },
  xpRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0'
  },
  xpLabel: {
    fontSize: '0.8125rem',
    color: '#888'
  },
  xpValue: {
    fontSize: '0.875rem',
    color: '#ccc',
    fontWeight: '600'
  },
  xpTotal: {
    borderTop: '1px solid #333',
    marginTop: '6px',
    paddingTop: '10px'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#555'
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
    maxWidth: '280px',
    lineHeight: 1.5
  },
  emptySubtext: {
    fontSize: '0.75rem',
    color: '#444',
    fontStyle: 'italic',
    maxWidth: '280px'
  }
};

export default Records;
