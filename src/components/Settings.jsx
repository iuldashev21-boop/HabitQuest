import { useState } from 'react';
import { X, Trash2, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { CLASSES } from '../data/gameData';
import soundManager from '../utils/sounds';

const Settings = ({ onClose }) => {
  const { username, archetype, resetGame, xp, level, currentStreak, longestStreak, currentDay } = useGameStore();
  const archetypeData = archetype ? CLASSES[archetype] : null;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundManager.setEnabled(newValue);
  };

  const handleResetGame = () => {
    resetGame();
    // Clear localStorage
    localStorage.removeItem('habitquest-storage');
    onClose();
    // Force reload to reset all state
    window.location.reload();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Profile */}
          {username && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Profile</h3>
              <div style={styles.profileCard}>
                <span style={styles.profileLabel}>Commander</span>
                <span style={{
                  ...styles.profileName,
                  color: archetypeData?.colors.accent || '#ffffff'
                }}>
                  {username.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Current Stats */}
          {archetype && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Current Progress</h3>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statValue}>{level}</span>
                  <span style={styles.statLabel}>Level</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statValue}>{xp}</span>
                  <span style={styles.statLabel}>Total XP</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statValue}>{currentStreak}</span>
                  <span style={styles.statLabel}>Current Streak</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statValue}>{longestStreak}</span>
                  <span style={styles.statLabel}>Best Streak</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statValue}>{currentDay}</span>
                  <span style={styles.statLabel}>Day</span>
                </div>
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Audio</h3>
            <button
              style={styles.toggleButton}
              onClick={handleToggleSound}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={20} />
                  <span>Sound Effects: ON</span>
                </>
              ) : (
                <>
                  <VolumeX size={20} />
                  <span>Sound Effects: OFF</span>
                </>
              )}
              <div style={{
                ...styles.toggleIndicator,
                backgroundColor: soundEnabled
                  ? (archetypeData?.colors.accent || '#22c55e')
                  : '#333333'
              }} />
            </button>
          </div>

          {/* Reset Game */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Danger Zone</h3>
            {!showResetConfirm ? (
              <button
                style={styles.resetButton}
                onClick={() => setShowResetConfirm(true)}
              >
                <Trash2 size={18} />
                Reset All Progress
              </button>
            ) : (
              <div style={styles.confirmReset}>
                <p style={styles.confirmText}>
                  Are you sure? This will delete ALL your progress and cannot be undone.
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
                    onClick={handleResetGame}
                  >
                    <RotateCcw size={16} />
                    Yes, Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <p style={styles.version}>HabitQuest v1.0</p>
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
    maxWidth: '400px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #333333'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#ffffff',
    letterSpacing: '0.1em',
    margin: 0
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex'
  },
  body: {
    padding: '20px'
  },
  section: {
    marginBottom: '24px'
  },
  profileCard: {
    backgroundColor: '#0a0a0a',
    padding: '16px',
    textAlign: 'center'
  },
  profileLabel: {
    display: 'block',
    fontSize: '0.625rem',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: '4px'
  },
  profileName: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.1em'
  },
  sectionTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.1em',
    marginBottom: '12px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  statCard: {
    backgroundColor: '#0a0a0a',
    padding: '12px 8px',
    textAlign: 'center'
  },
  statValue: {
    display: 'block',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    color: '#ffffff'
  },
  statLabel: {
    fontSize: '0.625rem',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#0a0a0a',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    textAlign: 'left'
  },
  toggleIndicator: {
    marginLeft: 'auto',
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  resetButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #dc2626',
    color: '#dc2626',
    fontSize: '0.9375rem',
    cursor: 'pointer'
  },
  confirmReset: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: '16px',
    border: '1px solid #dc2626'
  },
  confirmText: {
    fontSize: '0.875rem',
    color: '#dc2626',
    marginBottom: '16px',
    lineHeight: 1.5
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  confirmResetButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#dc2626',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #333333',
    textAlign: 'center'
  },
  version: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.3)',
    margin: 0
  }
};

export default Settings;
