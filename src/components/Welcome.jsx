import { useState, useEffect } from 'react';

const Welcome = ({ onBegin }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Staggered entrance animations
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowHeading(true), 200),
      setTimeout(() => setShowSubtext(true), 700),
      setTimeout(() => setShowButton(true), 1200)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleBegin = () => {
    setIsExiting(true);
    setTimeout(() => onBegin(), 600);
  };

  return (
    <div style={{
      ...styles.container,
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(0.98)' : 'scale(1)',
      transition: 'all 0.6s ease-out'
    }}>
      <div style={styles.content}>
        {/* Decorative line */}
        <div style={{
          ...styles.decorLine,
          width: showHeading ? '60px' : '0px',
          transition: 'width 0.5s ease-out'
        }} />

        <h1 style={{
          ...styles.heading,
          opacity: showHeading ? 1 : 0,
          transform: showHeading ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out'
        }}>
          The man you are is not the man you were meant to be.
        </h1>

        <p style={{
          ...styles.subtext,
          opacity: showSubtext ? 1 : 0,
          transform: showSubtext ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.6s ease-out'
        }}>
          It's time to change that.
        </p>

        <div style={{
          ...styles.buttonContainer,
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out'
        }}>
          <button
            style={styles.button}
            className="welcome-button"
            onClick={handleBegin}
            onMouseEnter={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.color = '#000000';
              e.target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ffffff';
              e.target.style.boxShadow = 'none';
            }}
          >
            Begin The War
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(255, 255, 255, 0.2);
          }
        }
        .welcome-button {
          animation: pulse 2s ease-in-out infinite;
        }
        .welcome-button:hover {
          animation: none;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px'
  },
  decorLine: {
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: '0 auto 32px'
  },
  heading: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
    color: '#ffffff',
    letterSpacing: '0.05em',
    lineHeight: 1.2,
    marginBottom: '24px',
    fontWeight: 400
  },
  subtext: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '48px',
    fontStyle: 'italic'
  },
  buttonContainer: {
    display: 'inline-block'
  },
  button: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    letterSpacing: '0.1em',
    padding: '16px 48px',
    background: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default Welcome;
