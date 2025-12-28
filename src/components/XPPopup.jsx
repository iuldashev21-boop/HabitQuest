import { useEffect, useState } from 'react';

// Style injection moved to useEffect for SSR compatibility
const STYLE_ID = 'xp-popup-styles';
const KEYFRAMES = `
  @keyframes xpFloat {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%, -100%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -150%) scale(1); }
  }
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 currentColor; }
    50% { box-shadow: 0 0 20px 5px currentColor; }
    100% { box-shadow: 0 0 0 0 currentColor; }
  }
  @keyframes cardComplete {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  @keyframes streakPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes perfectDayGlow {
    0%, 100% { box-shadow: 0 0 10px #fbbf24; }
    50% { box-shadow: 0 0 30px #fbbf24, 0 0 60px #fbbf24; }
  }
`;

const XPPopup = ({ xp, color, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Inject styles on mount (SSR-safe)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = STYLE_ID;
    styleSheet.textContent = KEYFRAMES;
    document.head.appendChild(styleSheet);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div style={{
      ...styles.container,
      color: color,
      textShadow: `0 0 10px ${color}40`
    }}>
      +{xp} XP
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    fontWeight: 'bold',
    pointerEvents: 'none',
    zIndex: 10,
    animation: 'xpFloat 1s ease-out forwards'
  }
};

export default XPPopup;
