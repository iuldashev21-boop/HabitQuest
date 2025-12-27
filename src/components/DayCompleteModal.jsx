import { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { CLASSES, PERFECT_DAY_BONUS } from '../data/gameData';
import { getDayCompleteQuote, MILESTONE_MESSAGES } from '../data/quotes';
import { playLevelUp } from '../utils/sounds';

const DayCompleteModal = ({
  archetype,
  xpEarned,
  newStreak,
  isPerfectDay,
  successfulCount,
  totalCount,
  relapseCount = 0,
  onClose
}) => {
  const archetypeData = CLASSES[archetype];
  const hasRelapse = relapseCount > 0;

  // Get appropriate motivational quote
  const quoteData = useMemo(() => {
    return getDayCompleteQuote(isPerfectDay, hasRelapse, newStreak);
  }, [isPerfectDay, hasRelapse, newStreak]);

  // Check if this is a milestone day
  const isMilestone = MILESTONE_MESSAGES[newStreak] !== undefined;

  useEffect(() => {
    // Play sound
    playLevelUp();

    // Fire confetti ONLY for perfect day, or milestone WITHOUT relapses
    // Don't celebrate relapses with confetti
    const shouldFireConfetti = isPerfectDay || (isMilestone && !hasRelapse);

    if (shouldFireConfetti) {
      const colors = isMilestone
        ? ['#fbbf24', '#f97316', '#ffffff']
        : [archetypeData.colors.accent, '#fbbf24', '#ffffff'];

      // Initial burst
      confetti({
        particleCount: isMilestone ? 150 : 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
      });

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
      }, 250);
    }

    // Auto close after 6 seconds (longer to read quote)
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [archetypeData, isPerfectDay, isMilestone, onClose]);

  // Determine title and icon
  const getTitle = () => {
    if (isMilestone) {
      if (newStreak === 66) return 'FORGED';
      if (newStreak === 100) return 'CENTURION';
      return `DAY ${newStreak} MILESTONE`;
    }
    if (isPerfectDay) return 'PERFECT DAY!';
    return 'DAY COMPLETE';
  };

  const getTitleColor = () => {
    if (isMilestone) return '#fbbf24';
    if (isPerfectDay) return '#fbbf24';
    if (hasRelapse) return '#f97316';
    return archetypeData.colors.accent;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.content}>
          {/* Icon */}
          <div style={{
            ...styles.iconContainer,
            backgroundColor: `${getTitleColor()}20`,
            borderColor: getTitleColor()
          }}>
            {isMilestone ? (
              <Flame size={48} color="#fbbf24" />
            ) : isPerfectDay ? (
              <Star size={48} color="#fbbf24" fill="#fbbf24" />
            ) : hasRelapse ? (
              <AlertTriangle size={48} color="#f97316" />
            ) : (
              <TrendingUp size={48} color={archetypeData.colors.accent} />
            )}
          </div>

          {/* Title */}
          <h1 style={{
            ...styles.title,
            color: getTitleColor()
          }}>
            {getTitle()}
          </h1>

          {/* Subtitle based on status */}
          <p style={styles.subtitle}>
            {isPerfectDay
              ? 'All missions accomplished. You are unstoppable.'
              : hasRelapse
                ? `${successfulCount}/${totalCount} completed. You showed up anyway.`
                : `${successfulCount}/${totalCount} completed. Keep building.`}
          </p>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>XP Earned</span>
              <span style={{
                ...styles.statValue,
                color: archetypeData.colors.accent
              }}>
                +{xpEarned}
              </span>
            </div>

            {isPerfectDay && (
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Perfect Day Bonus</span>
                <span style={{
                  ...styles.statValue,
                  color: '#fbbf24'
                }}>
                  +{PERFECT_DAY_BONUS}
                </span>
              </div>
            )}

            <div style={styles.divider} />

            <div style={styles.statRow}>
              <div style={styles.streakContainer}>
                <Flame size={18} color="#f97316" />
                <span style={styles.statLabel}>Current Streak</span>
              </div>
              <span style={{
                ...styles.statValue,
                color: '#f97316'
              }}>
                {newStreak} {newStreak === 1 ? 'day' : 'days'}
              </span>
            </div>

            {/* Show relapse count if any */}
            {hasRelapse && (
              <>
                <div style={styles.divider} />
                <div style={styles.statRow}>
                  <div style={styles.streakContainer}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ ...styles.statLabel, color: '#ef4444' }}>
                      Relapses Logged
                    </span>
                  </div>
                  <span style={{ ...styles.statValue, color: '#ef4444' }}>
                    {relapseCount}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Motivational Quote */}
          <div style={{
            ...styles.quoteContainer,
            borderColor: quoteData.isMilestone ? '#fbbf24' : 'transparent'
          }}>
            <p style={{
              ...styles.quote,
              color: quoteData.isMilestone ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)'
            }}>
              "{quoteData.quote}"
            </p>
          </div>

          <button
            style={{
              ...styles.button,
              backgroundColor: archetypeData.colors.accent,
              color: archetype === 'SPECTER' ? '#ffffff' : '#000000'
            }}
            onClick={onClose}
          >
            Continue
          </button>

          <p style={styles.tapHint}>Tap anywhere to close</p>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
    cursor: 'pointer'
  },
  modal: {
    width: '100%',
    maxWidth: '360px'
  },
  content: {
    textAlign: 'center'
  },
  iconContainer: {
    width: '100px',
    height: '100px',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    borderRadius: '50%'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2.5rem',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px'
  },
  stats: {
    backgroundColor: '#1A1A1A',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0'
  },
  streakContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statLabel: {
    fontSize: '0.9375rem',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  statValue: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    letterSpacing: '0.05em'
  },
  divider: {
    height: '1px',
    backgroundColor: '#333333',
    margin: '8px 0'
  },
  quoteContainer: {
    padding: '16px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid transparent'
  },
  quote: {
    fontSize: '0.9375rem',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: 0
  },
  button: {
    width: '100%',
    padding: '16px',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.125rem',
    letterSpacing: '0.1em',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  tapHint: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.3)',
    margin: 0
  }
};

export default DayCompleteModal;
