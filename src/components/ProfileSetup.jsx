import { useState, useEffect, useRef } from 'react';
import { User, ArrowLeft } from 'lucide-react';

const MAX_LENGTH = 15;
const MIN_LENGTH = 2;

// Validation: letters, numbers, underscore only
const isValidName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    return false;
  }
  // Allow letters, numbers, and underscore
  return /^[a-zA-Z0-9_]+$/.test(trimmed);
};

const ProfileSetup = ({ onComplete, onBack }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const inputRef = useRef(null);

  const trimmedName = name.trim();
  const charCount = trimmedName.length;
  const isValid = isValidName(name);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setIsEntering(false);
      // Auto-focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    // Limit to max length
    if (value.length <= MAX_LENGTH) {
      setName(value);
      setError('');
    }
  };

  const handleSubmit = () => {
    if (!isValid) {
      if (charCount < MIN_LENGTH) {
        setError('Name must be at least 2 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
        setError('Only letters, numbers, and underscore allowed');
      }
      return;
    }
    setIsExiting(true);
    setTimeout(() => onComplete(trimmedName), 400);
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => onBack(), 400);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit();
    }
  };

  // Calculate border color based on state
  const getBorderColor = () => {
    if (error) return '#dc2626';
    if (charCount >= MIN_LENGTH && isValid) return '#22c55e';
    if (charCount > 0) return '#f97316';
    return '#333333';
  };

  return (
    <div style={{
      ...styles.container,
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateX(20px)' : 'translateX(0)',
      transition: 'all 0.4s ease-out'
    }}>
      {/* Back Button */}
      {onBack && (
        <button
          style={{
            ...styles.backButton,
            opacity: showContent ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div style={{
        ...styles.content,
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.5s ease-out'
      }}>
        {/* Icon with glow effect when valid */}
        <div style={{
          ...styles.iconContainer,
          borderColor: isValid ? '#22c55e' : '#333333',
          boxShadow: isValid ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <User size={48} color={isValid ? '#22c55e' : '#ffffff'} />
        </div>

        {/* Header */}
        <h1 style={styles.heading}>
          WHAT DO WE CALL YOU, SOLDIER?
        </h1>
        <p style={styles.subtext}>
          Choose your war name
        </p>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              style={{
                ...styles.input,
                borderColor: getBorderColor(),
                boxShadow: isValid ? '0 0 15px rgba(34, 197, 94, 0.2)' : 'none'
              }}
              placeholder="Enter your name..."
              value={name}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              maxLength={MAX_LENGTH}
            />
            <span style={{
              ...styles.charCount,
              color: charCount > MAX_LENGTH - 3
                ? '#f97316'
                : charCount >= MIN_LENGTH
                  ? '#22c55e'
                  : 'rgba(255, 255, 255, 0.4)'
            }}>
              {charCount}/{MAX_LENGTH}
            </span>
          </div>

          {/* Progress bar under input */}
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min((charCount / MIN_LENGTH) * 100, 100)}%`,
              backgroundColor: isValid ? '#22c55e' : charCount > 0 ? '#f97316' : '#333333'
            }} />
          </div>

          {error && (
            <p style={styles.error}>{error}</p>
          )}

          <p style={styles.hint}>
            Letters, numbers, and underscore only
          </p>
        </div>

        {/* Submit Button */}
        <button
          style={{
            ...styles.button,
            opacity: isValid ? 1 : 0.4,
            cursor: isValid ? 'pointer' : 'not-allowed',
            transform: isValid ? 'scale(1)' : 'scale(0.98)',
            boxShadow: isValid ? '0 4px 20px rgba(255, 255, 255, 0.2)' : 'none'
          }}
          onClick={handleSubmit}
          disabled={!isValid}
          onMouseEnter={(e) => {
            if (isValid) {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 25px rgba(255, 255, 255, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (isValid) {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.2)';
            }
          }}
        >
          That's Me
        </button>
      </div>
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
    padding: '40px 20px',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    color: 'rgba(255, 255, 255, 0.6)',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  content: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center'
  },
  iconContainer: {
    width: '100px',
    height: '100px',
    margin: '0 auto 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    border: '2px solid #333333'
  },
  heading: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: '#ffffff',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    lineHeight: 1.2
  },
  subtext: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '40px'
  },
  inputSection: {
    marginBottom: '32px'
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '16px 60px 16px 20px',
    backgroundColor: '#1A1A1A',
    border: '2px solid #333333',
    color: '#ffffff',
    fontSize: '1.125rem',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '0.1em',
    textAlign: 'center',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  charCount: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    transition: 'color 0.2s ease'
  },
  progressBar: {
    height: '3px',
    backgroundColor: '#1A1A1A',
    marginBottom: '8px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'all 0.3s ease'
  },
  error: {
    fontSize: '0.875rem',
    color: '#dc2626',
    marginTop: '8px',
    marginBottom: '0'
  },
  hint: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: '8px'
  },
  button: {
    width: '100%',
    padding: '18px 32px',
    backgroundColor: '#ffffff',
    border: 'none',
    color: '#000000',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default ProfileSetup;
