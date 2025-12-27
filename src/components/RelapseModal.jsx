import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Heart, Flame, Trophy } from 'lucide-react';
import { CLASSES } from '../data/gameData';

// Supportive messages to rotate on relapse
const RELAPSE_MESSAGES = [
  { title: "Day 0. But you're still in the war.", subtitle: "Go again." },
  { title: "Fall down 7 times, stand up 8.", subtitle: "This is that stand." },
  { title: "The comeback is always stronger than the setback.", subtitle: "Prove it." },
  { title: "One battle lost. The war continues.", subtitle: "Regroup and attack." },
  { title: "Failure is not falling down.", subtitle: "It's refusing to get up." },
  { title: "Every master was once a disaster.", subtitle: "Keep learning." }
];

const RelapseModal = ({ habit, archetype, onConfirm, onCancel }) => {
  const [showRecovery, setShowRecovery] = useState(false);
  const [relapseResult, setRelapseResult] = useState(null);
  const archetypeData = CLASSES[archetype];

  // Inject styles on mount (moved from module scope for SSR compatibility)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const existingStyle = document.getElementById('relapse-modal-styles');
    if (existingStyle) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'relapse-modal-styles';
    styleSheet.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(styleSheet);

    // Cleanup on unmount
    return () => {
      const style = document.getElementById('relapse-modal-styles');
      if (style) {
        style.remove();
      }
    };
  }, []);

  // Pick a random message
  const message = useMemo(() => {
    return RELAPSE_MESSAGES[Math.floor(Math.random() * RELAPSE_MESSAGES.length)];
  }, []);

  // Calculate what will be lost
  const xpToLose = Math.floor((habit.streak * habit.xp) * 0.5);

  const handleConfirm = () => {
    const result = onConfirm();
    if (result) {
      setRelapseResult(result);
      setShowRecovery(true);
    }
  };

  const handleClose = () => {
    onCancel();
  };

  // Recovery Message Screen
  if (showRecovery) {
    return (
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.recoveryContent}>
            <Heart size={48} color={archetypeData.colors.accent} style={styles.heartIcon} />

            <h2 style={styles.recoveryTitle}>{message.title}</h2>
            <p style={styles.recoverySubtitle}>{message.subtitle}</p>

            <div style={styles.recoveryStats}>
              {relapseResult.streakLost > 0 && (
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Streak Lost</span>
                  <span style={{ ...styles.statValue, color: '#dc2626' }}>
                    {relapseResult.streakLost} days
                  </span>
                </div>
              )}
              {relapseResult.xpLost > 0 && (
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>XP Penalty (50%)</span>
                  <span style={{ ...styles.statValue, color: '#dc2626' }}>
                    -{relapseResult.xpLost} XP
                  </span>
                </div>
              )}
              <div style={styles.divider} />
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Honesty XP</span>
                <span style={{ ...styles.statValue, color: '#22c55e' }}>
                  +{relapseResult.recoveryXp} XP
                </span>
              </div>

              {relapseResult.longestStreak > 0 && (
                <>
                  <div style={styles.divider} />
                  <div style={styles.statRow}>
                    <div style={styles.bestStreakLabel}>
                      <Trophy size={14} color="#fbbf24" />
                      <span style={styles.statLabel}>Best Streak (Still Yours)</span>
                    </div>
                    <span style={{ ...styles.statValue, color: '#fbbf24' }}>
                      {relapseResult.longestStreak} days
                    </span>
                  </div>
                </>
              )}

              <p style={styles.recoveryNote}>
                Your 66-day journey continues. Only this habit resets.
              </p>
            </div>

            <button
              style={{
                ...styles.continueButton,
                backgroundColor: archetypeData.colors.accent,
                color: archetype === 'SPECTER' ? '#ffffff' : '#000000'
              }}
              onClick={handleClose}
            >
              Continue The Fight
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Screen
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <AlertTriangle size={32} color="#f97316" />
          <h2 style={styles.title}>Log Relapse</h2>
        </div>

        <div style={styles.body}>
          <p style={styles.confirmMessage}>
            Falling is part of the fight. Log this relapse?
          </p>

          <div style={styles.habitCard}>
            <span style={styles.habitName}>{habit.name}</span>
            {habit.streak > 0 && (
              <div style={styles.currentStreak}>
                <Flame size={14} color="#f97316" />
                <span>{habit.streak} day streak</span>
              </div>
            )}
          </div>

          <div style={styles.consequences}>
            <p style={styles.consequenceTitle}>What happens:</p>
            <div style={styles.consequenceItem}>
              <span style={styles.consequenceBullet}>•</span>
              <span>Habit streak resets to Day 0</span>
            </div>
            {xpToLose > 0 && (
              <div style={styles.consequenceItem}>
                <span style={styles.consequenceBullet}>•</span>
                <span>Lose {xpToLose} XP (50% of earned from this habit)</span>
              </div>
            )}
            <div style={styles.consequenceItem}>
              <span style={styles.consequenceBullet}>•</span>
              <span>Relapse count: {habit.relapses} → {habit.relapses + 1}</span>
            </div>
          </div>

          <div style={styles.preserved}>
            <p style={styles.preservedTitle}>What's preserved:</p>
            <div style={styles.preservedItem}>
              <span style={styles.preservedCheck}>✓</span>
              <span>Your 66-day journey continues</span>
            </div>
            <div style={styles.preservedItem}>
              <span style={styles.preservedCheck}>✓</span>
              <span>Other habits unaffected</span>
            </div>
            <div style={styles.preservedItem}>
              <span style={styles.preservedCheck}>✓</span>
              <span>Best streak record: {Math.max(habit.longestStreak, habit.streak)} days</span>
            </div>
            <div style={styles.preservedItem}>
              <span style={styles.preservedCheck}>✓</span>
              <span>+5 Honesty XP for logging</span>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button style={styles.confirmButton} onClick={handleConfirm}>
            Yes, Log It
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
    backgroundColor: '#1A1A1A',
    width: '100%',
    maxWidth: '380px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 24px 16px',
    borderBottom: '1px solid #333333'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#ffffff',
    letterSpacing: '0.1em',
    margin: 0
  },
  body: {
    padding: '20px 24px'
  },
  confirmMessage: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: '20px'
  },
  habitCard: {
    backgroundColor: '#0a0a0a',
    padding: '16px',
    borderLeft: '3px solid #dc2626',
    marginBottom: '20px'
  },
  habitName: {
    display: 'block',
    fontSize: '1rem',
    color: '#ffffff',
    marginBottom: '8px'
  },
  currentStreak: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    color: '#f97316'
  },
  consequences: {
    marginBottom: '16px'
  },
  consequenceTitle: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  consequenceItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.875rem',
    color: '#dc2626',
    marginBottom: '6px'
  },
  consequenceBullet: {
    opacity: 0.5
  },
  preserved: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: '12px',
    border: '1px solid rgba(34, 197, 94, 0.3)'
  },
  preservedTitle: {
    fontSize: '0.75rem',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  preservedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8125rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '4px'
  },
  preservedCheck: {
    color: '#22c55e'
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #333333'
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '0.05em'
  },
  confirmButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#f97316',
    border: 'none',
    color: '#000000',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '0.05em'
  },

  // Recovery screen styles
  recoveryContent: {
    padding: '32px 24px',
    textAlign: 'center'
  },
  heartIcon: {
    marginBottom: '20px',
    animation: 'pulse 2s ease-in-out infinite'
  },
  recoveryTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.75rem',
    color: '#ffffff',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  },
  recoverySubtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px',
    fontStyle: 'italic'
  },
  recoveryStats: {
    backgroundColor: '#0a0a0a',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  bestStreakLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  statValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.05em'
  },
  divider: {
    height: '1px',
    backgroundColor: '#333333',
    margin: '8px 0'
  },
  recoveryNote: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: '12px',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  continueButton: {
    width: '100%',
    padding: '16px',
    border: 'none',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.125rem',
    letterSpacing: '0.1em',
    cursor: 'pointer'
  }
};

export default RelapseModal;
