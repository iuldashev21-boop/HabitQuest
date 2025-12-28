import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playPerfectDay } from '../utils/sounds';
import { CLASSES } from '../data/gameData';

const PerfectDayModal = ({ archetype, onClose }) => {
  const archetypeData = CLASSES[archetype];

  useEffect(() => {
    // Play sound
    playPerfectDay();

    // Respect prefers-reduced-motion for users with vestibular disorders
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fire confetti only if motion is allowed
    if (!prefersReducedMotion) {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = [archetypeData.colors.accent, '#fbbf24', '#ffffff'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Big burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: colors
        });
      }, 500);
    }

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [archetypeData, onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal}>
        <div style={styles.star}>⭐</div>
        <h1 style={{
          ...styles.title,
          textShadow: `0 0 30px ${archetypeData.colors.accent}`
        }}>
          PERFECT DAY!
        </h1>
        <p style={styles.subtitle}>All missions completed</p>
        <div style={{
          ...styles.bonus,
          color: archetypeData.colors.accent,
          borderColor: archetypeData.colors.accent
        }}>
          +50 XP BONUS
        </div>
        <p style={styles.tap}>Tap to continue</p>
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
    zIndex: 1000,
    cursor: 'pointer'
  },
  modal: {
    textAlign: 'center',
    padding: '40px',
    animation: 'perfectDayGlow 2s ease-in-out infinite'
  },
  star: {
    fontSize: '4rem',
    marginBottom: '20px',
    animation: 'streakPop 0.5s ease-out'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '3rem',
    color: '#fbbf24',
    letterSpacing: '0.15em',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px'
  },
  bonus: {
    display: 'inline-block',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    padding: '12px 32px',
    border: '2px solid',
    marginBottom: '32px'
  },
  tap: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  }
};

export default PerfectDayModal;
