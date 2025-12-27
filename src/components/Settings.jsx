import { useState } from 'react';
import { X, Trash2, Volume2, VolumeX, RotateCcw, LogOut, Plus, Skull, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { useAuth } from '../hooks/useAuth';
import { CLASSES } from '../data/gameData';
import soundManager from '../utils/sounds';

const Settings = ({ onClose }) => {
  const { username, archetype, resetGame, clearSyncState, deleteFromSupabase, xp, level, currentStreak, longestStreak, currentDay, habits, addHabit, removeHabit, syncToSupabase } = useGameStore();
  const { signOut } = useAuth();
  const archetypeData = archetype ? CLASSES[archetype] : null;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', type: 'power', xp: 20, frequency: 'daily' });
  const [habitToDelete, setHabitToDelete] = useState(null);

  const handleToggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundManager.setEnabled(newValue);
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    addHabit({
      name: newHabit.name.trim(),
      type: newHabit.type,
      xp: parseInt(newHabit.xp) || 20,
      frequency: newHabit.frequency
    });

    // Sync to Supabase
    setTimeout(() => syncToSupabase(), 100);

    // Reset form
    setNewHabit({ name: '', type: 'power', xp: 20, frequency: 'daily' });
    setShowAddHabit(false);
  };

  const handleRemoveHabit = (habitId) => {
    removeHabit(habitId);
    setHabitToDelete(null);

    // Sync to Supabase
    setTimeout(() => syncToSupabase(), 100);
  };

  const handleResetGame = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Delete data from Supabase FIRST
      await deleteFromSupabase();

      // Clear localStorage
      localStorage.clear();

      // Reset local state
      resetGame();
      clearSyncState();
    } catch (err) {
      console.error('Reset error:', err);
    }

    // Close modal
    onClose();

    // Force full page reload to reinitialize everything
    setTimeout(() => {
      window.location.replace('/');
    }, 50);
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      clearSyncState();
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }

    // Always redirect, even if signOut fails
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
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

          {/* Manage Habits */}
          <div style={styles.section}>
            <button
              type="button"
              style={styles.expandButton}
              onClick={() => setShowHabitManager(!showHabitManager)}
            >
              <h3 style={styles.sectionTitleInline}>Manage Habits</h3>
              {showHabitManager ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showHabitManager && (
              <div style={styles.habitManager}>
                {/* Current Habits */}
                <div style={styles.habitList}>
                  {habits.map((habit) => (
                    <div key={habit.id} style={styles.habitItem}>
                      <div style={styles.habitInfo}>
                        {habit.type === 'demon' ? (
                          <Skull size={14} color="#ef4444" />
                        ) : (
                          <Zap size={14} color="#22c55e" />
                        )}
                        <span style={styles.habitName}>{habit.name}</span>
                        <span style={styles.habitXp}>{habit.xp} XP</span>
                      </div>
                      {habitToDelete === habit.id ? (
                        <div style={styles.deleteConfirm}>
                          <button
                            type="button"
                            style={styles.confirmDeleteBtn}
                            onClick={() => handleRemoveHabit(habit.id)}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            style={styles.cancelDeleteBtn}
                            onClick={() => setHabitToDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          style={styles.deleteHabitBtn}
                          onClick={() => setHabitToDelete(habit.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Habit */}
                {!showAddHabit ? (
                  <button
                    type="button"
                    style={styles.addHabitBtn}
                    onClick={() => setShowAddHabit(true)}
                  >
                    <Plus size={16} />
                    Add New Habit
                  </button>
                ) : (
                  <form onSubmit={handleAddHabit} style={styles.addHabitForm}>
                    <input
                      type="text"
                      placeholder="Habit name"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                      style={styles.habitInput}
                      autoFocus
                    />
                    <div style={styles.habitOptions}>
                      <select
                        value={newHabit.type}
                        onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value })}
                        style={styles.habitSelect}
                      >
                        <option value="power">Power (Do)</option>
                        <option value="demon">Demon (Avoid)</option>
                      </select>
                      <select
                        value={newHabit.frequency}
                        onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                        style={styles.habitSelect}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="weekends">Weekends</option>
                        <option value="3x_week">3x/Week</option>
                      </select>
                      <input
                        type="number"
                        placeholder="XP"
                        value={newHabit.xp}
                        onChange={(e) => setNewHabit({ ...newHabit, xp: e.target.value })}
                        style={styles.xpInput}
                        min="5"
                        max="100"
                      />
                    </div>
                    <div style={styles.addHabitActions}>
                      <button type="submit" style={styles.saveHabitBtn}>
                        Add Habit
                      </button>
                      <button
                        type="button"
                        style={styles.cancelHabitBtn}
                        onClick={() => {
                          setShowAddHabit(false);
                          setNewHabit({ name: '', type: 'power', xp: 20, frequency: 'daily' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sign Out */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Account</h3>
            <button
              type="button"
              style={styles.signOutButton}
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          {/* Reset Game */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Danger Zone</h3>
            {!showResetConfirm ? (
              <button
                type="button"
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
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
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
  signOutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    color: '#ffffff',
    fontSize: '0.9375rem',
    cursor: 'pointer'
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
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 0',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer'
  },
  sectionTitleInline: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.1em',
    margin: 0
  },
  habitManager: {
    marginTop: '12px'
  },
  habitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px'
  },
  habitItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#0a0a0a',
    borderRadius: '6px'
  },
  habitInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  habitName: {
    fontSize: '0.875rem',
    color: '#ccc',
    flex: 1
  },
  habitXp: {
    fontSize: '0.75rem',
    color: '#666'
  },
  deleteHabitBtn: {
    padding: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer'
  },
  deleteConfirm: {
    display: 'flex',
    gap: '6px'
  },
  confirmDeleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  cancelDeleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  addHabitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a1a1a',
    border: '1px dashed #333',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  addHabitForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#0a0a0a',
    borderRadius: '6px'
  },
  habitInput: {
    padding: '10px 12px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none'
  },
  habitOptions: {
    display: 'flex',
    gap: '8px'
  },
  habitSelect: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.75rem',
    outline: 'none'
  },
  xpInput: {
    width: '60px',
    padding: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.75rem',
    outline: 'none',
    textAlign: 'center'
  },
  addHabitActions: {
    display: 'flex',
    gap: '8px'
  },
  saveHabitBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#22c55e',
    border: 'none',
    borderRadius: '4px',
    color: '#000',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelHabitBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.875rem',
    cursor: 'pointer'
  }
};

export default Settings;
